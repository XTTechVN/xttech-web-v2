'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { sendLocationPing } from '@/actions';
import { useAuthStore } from '@/stores';
import { BASE_API_URL, TRACKER_QUICK_PING_MAX_ACCURACY_METERS } from '@/config';
import { Capacitor } from '@capacitor/core';
import type { NativePluginListenerHandle, NativeTrackingPlugin } from '@/types';
import { acquireQuickWebPosition, getClientPlatform, NativeTracking } from '@/utils';

export { NativeTracking };
export type { NativeTrackingPlugin };

interface LocationTrackerOptions {
  enabled?: boolean;
  /** Trạng thái ca đã được xác định chắc chắn (API đã trả về). Chưa xác định thì KHÔNG dừng native tracking */
  isStatusResolved?: boolean;
  intervalMs?: number; // Mặc định 60 giây (60000ms) khi di chuyển trên Web
  heartbeatMs?: number; // Mặc định 3 phút (180000ms) gửi nhịp tim khi đứng yên
}

export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  if (Capacitor.isNativePlatform()) return true;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
    navigator.userAgent,
  );
};

export function useLocationTracker({
  enabled = true,
  isStatusResolved = true,
  intervalMs = 60000,
  heartbeatMs = 180000,
}: LocationTrackerOptions = {}) {
  const [isTracking, setIsTracking] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!enabled && isTracking) {
    setIsTracking(false);
  }

  const lastPingRef = useRef<number>(0);
  const lastKnownCoordsRef = useRef<{
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
  } | null>(null);
  const lastBatteryRef = useRef<number | undefined>(undefined);
  const workerRef = useRef<Worker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<unknown>(null);

  // Đọc mức pin thiết bị nếu được hỗ trợ (có cache lại mức pin gần nhất)
  const getBatteryLevel = async (): Promise<number | undefined> => {
    try {
      // 1. Ưu tiên đọc từ Native Plugin trên iOS/Android
      if (Capacitor.isNativePlatform() && NativeTracking.getBatteryLevel) {
        const res = await NativeTracking.getBatteryLevel();
        if (res && typeof res.level === 'number' && res.level >= 0) {
          const level = Math.round(res.level);
          lastBatteryRef.current = level;
          return level;
        }
      }
      // 2. Fallback cho trình duyệt Web hỗ trợ Battery API (Chrome, Edge...)
      if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
        const nav = navigator as unknown as { getBattery: () => Promise<{ level: number }> };
        const battery = await nav.getBattery();
        const level = Math.round(battery.level * 100);
        lastBatteryRef.current = level;
        return level;
      }
    } catch {
      // Bỏ qua nếu trình duyệt không hỗ trợ Battery API
    }
    return lastBatteryRef.current;
  };

  // Gửi tọa độ GPS lên Backend
  const executePing = useCallback(
    async (pos: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      speed?: number;
      heading?: number;
    }) => {
      // 1. Chốt chặn độ chính xác thích ứng: 45m khi di chuyển ngoài đường, 80m khi đứng yên / trong phòng
      const rawSpeed = pos.speed ?? 0;
      const speed = rawSpeed >= 0.8 ? rawSpeed : 0;
      const maxAccuracy = speed >= 1.0 ? 45 : 80;
      if (pos.accuracy !== undefined && pos.accuracy > maxAccuracy) {
        return;
      }

      const now = Date.now();
      const elapsed = now - lastPingRef.current;

      let distance = 999;
      if (lastKnownCoordsRef.current) {
        const lat1 = lastKnownCoordsRef.current.latitude;
        const lon1 = lastKnownCoordsRef.current.longitude;
        const lat2 = pos.latitude;
        const lon2 = pos.longitude;
        const R = 6371000;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance = R * c;

        // 2. Chốt chặn bước nhảy dị biệt (Jump / Outlier Filter):
        // Nếu khoảng cách nhảy vọt > 150m với tốc độ bất thường > 35 m/s (~126 km/h) hoặc > 400m trong thời gian ngắn (< 30s)
        const jumpSpeed = elapsed > 0 ? distance / (elapsed / 1000) : 999;
        if (distance > 150 && (jumpSpeed > 35 || (distance > 400 && elapsed < 30000))) {
          return;
        }
      }

      // Smart Adaptive: 3s khi di chuyển, tạm dừng khi đứng yên
      const isMoving = speed >= 1.0 || distance >= 5.0;
      if (isMoving) {
        if (elapsed < 3000) return;
      } else {
        if (elapsed < 15000) return;
      }

      lastPingRef.current = now;
      lastKnownCoordsRef.current = { ...pos, speed };

      try {
        const battery = await getBatteryLevel();
        await sendLocationPing({
          latitude: pos.latitude,
          longitude: pos.longitude,
          accuracy: pos.accuracy,
          speed,
          heading: pos.heading,
          batteryLevel: battery,
          platform: getClientPlatform(),
        });

        setLastPingTime(new Date());
        setIsTracking(true);
        setError(null);
      } catch (err: unknown) {
        console.warn('[LocationTracker] Ping failed:', err);
      }
    },
    [],
  );

  // Lấy vị trí tức thời 1 lần qua helper chia sẻ với ngưỡng 80m
  const pingCurrentLocation = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Thiết bị không hỗ trợ định vị GPS');
      return;
    }

    const pos = await acquireQuickWebPosition({
      maxAccuracyMeters: TRACKER_QUICK_PING_MAX_ACCURACY_METERS,
      timeoutMs: 10000,
    });

    if (pos) {
      await executePing(pos);
    }
  }, [executePing]);

  // Yêu cầu Screen WakeLock để giữ luồng định vị không bị ngủ sâu trên Web
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        const nav = navigator as unknown as { wakeLock: { request: (type: string) => Promise<unknown> } };
        wakeLockRef.current = await nav.wakeLock.request('screen');
      }
    } catch {
      // Bỏ qua nếu người dùng từ chối hoặc thiết bị không hỗ trợ
    }
  };

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    if (!isMobileDevice()) {
      return;
    }

    if (!enabled) {
      // Chỉ dừng native khi đã biết chắc nhân viên không còn trong ca.
      // Lúc đang tải dữ liệu chấm công hoặc API lỗi, `enabled` tạm thời = false nhưng KHÔNG được tắt GPS nền.
      if (isNative && isStatusResolved) {
        NativeTracking.stopTracking().catch(() => {});
      }
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (wakeLockRef.current) {
        const lock = wakeLockRef.current as { release?: () => Promise<void> };
        lock.release?.().catch(() => {});
        wakeLockRef.current = null;
      }
      return;
    }

    let isDisposed = false;
    let workerUrl: string | null = null;
    let fallbackTimer: ReturnType<typeof setInterval> | null = null;

    // Lấy vị trí ban đầu (Initial fix) và bật WakeLock (trên Web)
    const initTimer = setTimeout(() => {
      if (!isNative) {
        void pingCurrentLocation();
      }
      void requestWakeLock();
    }, 100);

    const startWebWatchPosition = () => {
      if (navigator.geolocation && watchIdRef.current === null) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            // Lọc sớm nếu tọa độ không đạt chuẩn chính xác theo vận tốc
            const rawSpeed = pos.coords.speed ?? 0;
            const maxAcc = rawSpeed >= 1.0 ? 45 : 80;
            if (pos.coords.accuracy !== undefined && pos.coords.accuracy > maxAcc) {
              return;
            }
            void executePing({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy || undefined,
              speed: pos.coords.speed || undefined,
              heading: pos.coords.heading || undefined,
            });
          },
          () => {},
          {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 15000,
          },
        );
      }
    };

    let locationListenerHandle: NativePluginListenerHandle | null = null;
    let authErrorHandle: NativePluginListenerHandle | null = null;
    let permListenerHandle: NativePluginListenerHandle | null = null;

    // 1. NẾU LÀ NATIVE ANDROID / IOS: KHỞI CHẠY NATIVE SERVICE ĐỘC LẬP
    // Chạy ngầm 100% bằng Swift/Java Native, duy trì liên tục kể cả khi khóa màn hình
    if (isNative) {
      const authState = useAuthStore.getState();
      NativeTracking.startTracking({
        token: authState.accessToken,
        refreshToken: authState.refreshToken,
        apiUrl: BASE_API_URL,
      })
        .then(() => {
          if (isDisposed) return;
          setIsTracking(true);
          if (Capacitor.getPlatform() === 'ios' && NativeTracking.checkPermission) {
            NativeTracking.checkPermission()
              .then((perm) => {
                if (perm && !perm.isAlways) {
                  console.warn(
                    '[NativeTracking iOS] Vị trí chưa được cấp quyền Always. Cần cấp quyền "Luôn luôn" để theo dõi khi khóa màn hình.',
                  );
                }
              })
              .catch(() => {});
          }
        })
        .catch((e: unknown) => {
          if (isDisposed) return;
          // Native không khởi động được (vd: plugin chưa được đăng ký): Web Geolocation chỉ chạy khi app đang mở,
          // KHÔNG thay thế được định vị nền -> ghi lỗi rõ ràng để không bị che giấu.
          console.error(
            '[NativeTracking] Native background tracking FAILED, chỉ còn định vị khi app đang mở:',
            e,
          );
          startWebWatchPosition();
        });

      // Lắng nghe sự kiện từ Native Service để đồng bộ state lên giao diện
      if (typeof NativeTracking.addListener === 'function') {
        NativeTracking.addListener('locationUpdate', (data) => {
          if (isDisposed) return;
          setIsTracking(true);
          if (data?.timestamp) {
            setLastPingTime(new Date(data.timestamp * 1000));
          } else {
            setLastPingTime(new Date());
          }
        })
          .then((handle) => {
            if (isDisposed) {
              Promise.resolve(handle.remove()).catch(() => {});
            } else {
              locationListenerHandle = handle;
            }
          })
          .catch(() => {});

        NativeTracking.addListener('authError', (err) => {
          if (isDisposed) return;
          console.error('[NativeTracking] Phiên làm việc chạy ngầm hết hạn:', err);
          setError('Phiên làm việc chạy ngầm đã hết hạn');
        })
          .then((handle) => {
            if (isDisposed) {
              Promise.resolve(handle.remove()).catch(() => {});
            } else {
              authErrorHandle = handle;
            }
          })
          .catch(() => {});

        NativeTracking.addListener('permissionChanged', (perm) => {
          if (isDisposed) return;
          if (!perm.isAlways) {
            console.warn('[NativeTracking] Quyền vị trí bị thay đổi, chưa cấp "Luôn luôn":', perm);
          }
        })
          .then((handle) => {
            if (isDisposed) {
              Promise.resolve(handle.remove()).catch(() => {});
            } else {
              permListenerHandle = handle;
            }
          })
          .catch(() => {});
      }
    } else {
      // 2. NẾU LÀ TRÌNH DUYỆT WEB: DÙNG WATCH POSITION VÀ WEB WORKER CỦA HTML5
      startWebWatchPosition();

      // WEB WORKER TIMER: CHỈ KHỞI TẠO CHO TRÌNH DUYỆT WEB DESKTOP/MOBILE
      const checkIntervalMs = Math.min(30000, intervalMs);
      try {
        const blob = new Blob(
          [
            `
            let interval = ${checkIntervalMs};
            let timer = setInterval(() => {
              postMessage('tick');
            }, interval);
            self.onmessage = function(e) {
              if (e.data === 'stop') clearInterval(timer);
            };
          `,
          ],
          { type: 'application/javascript' },
        );
        workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);
        workerRef.current = worker;

        worker.onmessage = (e) => {
          if (e.data === 'tick') {
            const elapsed = Date.now() - lastPingRef.current;
            if (elapsed >= intervalMs) {
              void pingCurrentLocation();
            }
          }
        };
      } catch (e: unknown) {
        console.warn('[LocationTracker] Fallback to standard timer:', e);
        fallbackTimer = setInterval(() => {
          const elapsed = Date.now() - lastPingRef.current;
          if (elapsed >= intervalMs) {
            void pingCurrentLocation();
          }
        }, checkIntervalMs);
      }
    }

    // 3. LẮNG NGHE SỰ KIỆN BẬT MÀN HÌNH HOẶC FOCUS LẠI VÀO APP TRÊN WEB
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        if (!isNative) {
          const elapsed = Date.now() - lastPingRef.current;
          if (elapsed >= intervalMs) {
            void pingCurrentLocation();
          }
          void requestWakeLock();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      isDisposed = true;
      clearTimeout(initTimer);
      if (fallbackTimer) {
        clearInterval(fallbackTimer);
      }
      if (workerUrl) {
        URL.revokeObjectURL(workerUrl);
      }
      // KHÔNG gọi NativeTracking.stopTracking() ở đây!
      // Vì khi người dùng vuốt đóng app, React sẽ unmount và chạy cleanup này.
      // Nếu gọi stopTracking ở đây, Service Native sẽ bị tắt ngay khi đóng app.
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (locationListenerHandle) {
        Promise.resolve(locationListenerHandle.remove()).catch(() => {});
      }
      if (authErrorHandle) {
        Promise.resolve(authErrorHandle.remove()).catch(() => {});
      }
      if (permListenerHandle) {
        Promise.resolve(permListenerHandle.remove()).catch(() => {});
      }
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [enabled, isStatusResolved, intervalMs, heartbeatMs, pingCurrentLocation, executePing]);

  // Đồng bộ tức thời khi AccessToken / RefreshToken được cập nhật từ Web sang Native Service
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);

  useEffect(() => {
    if (Capacitor.isNativePlatform() && enabled && (accessToken || refreshToken)) {
      NativeTracking.updateToken({
        token: accessToken,
        refreshToken,
      }).catch((e: unknown) => {
        console.warn('[NativeTracking] Update token failed:', e);
      });
    }
  }, [accessToken, refreshToken, enabled]);

  return {
    isTracking: enabled && isTracking,
    lastPingTime,
    error,
    pingNow: pingCurrentLocation,
  };
}
