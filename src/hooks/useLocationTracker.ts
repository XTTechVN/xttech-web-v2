/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { sendLocationPing } from '@/actions';
import { useAuthStore } from '@/stores';
import { BASE_API_URL } from '@/config';
import { Capacitor, registerPlugin } from '@capacitor/core';

interface NativeTrackingPlugin {
  startTracking(options: { token: string; refreshToken?: string; apiUrl: string }): Promise<{ success: boolean }>;
  updateToken(options: { token: string; refreshToken?: string }): Promise<{ success: boolean }>;
  stopTracking(): Promise<{ success: boolean }>;
}
const NativeTracking = registerPlugin<NativeTrackingPlugin>('NativeTracking');

interface LocationTrackerOptions {
  enabled?: boolean;
  intervalMs?: number; // Mặc định 60 giây (60000ms) khi di chuyển trên Web
  heartbeatMs?: number; // Mặc định 3 phút (180000ms) gửi nhịp tim khi đứng yên
}

export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  if (Capacitor.isNativePlatform()) return true;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
    navigator.userAgent
  );
}

export function useLocationTracker({ enabled = true, intervalMs = 60000, heartbeatMs = 180000, }: LocationTrackerOptions = {}) {
  const [isTracking, setIsTracking] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      if ('getBattery' in navigator) {
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
  const executePing = useCallback(async (pos: {
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
        speed: speed,
        heading: pos.heading,
        batteryLevel: battery,
      });

      setLastPingTime(new Date());
      setIsTracking(true);
      setError(null);
    } catch (err) {
      console.warn('[LocationTracker] Ping failed:', err);
    }
  }, []);

  // Lấy vị trí tức thời 1 lần với cơ chế fallback 2 tầng cho Web/Desktop
  const pingCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Thiết bị không hỗ trợ định vị GPS');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        executePing({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy || undefined,
          speed: pos.coords.speed || undefined,
          heading: pos.coords.heading || undefined,
        });
      },
      () => {
        // Khi ở trong nhà/phòng kín hoặc trên Web desktop: Fallback nhẹ sang WiFi/mạng
        navigator.geolocation.getCurrentPosition(
          (fallbackPos) => {
            executePing({
              latitude: fallbackPos.coords.latitude,
              longitude: fallbackPos.coords.longitude,
              accuracy: fallbackPos.coords.accuracy || undefined,
              speed: 0,
              heading: undefined,
            });
          },
          (err) => {
            console.debug('[LocationTracker] Location unavailable:', err.message);
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 10000,
      }
    );
  }, [executePing]);

  const sendHeartbeat = useCallback(async () => {
    const elapsed = Date.now() - lastPingRef.current;
    if (elapsed >= heartbeatMs) {
      if (lastKnownCoordsRef.current) {
        await executePing({
          ...lastKnownCoordsRef.current,
          speed: 0,
        });
      } else {
        pingCurrentLocation();
      }
    }
  }, [executePing, heartbeatMs, pingCurrentLocation]);

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
      setIsTracking(false);
      if (isNative) {
        NativeTracking.stopTracking().catch(() => { });
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

    // Lấy vị trí ban đầu (Initial fix) và bật WakeLock (trên Web)
    const initTimer = setTimeout(() => {
      if (!isNative) {
        pingCurrentLocation();
      }
      requestWakeLock();
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
            executePing({
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
          }
        );
      }
    };

    // 1. NẾU LÀ NATIVE ANDROID / IOS: KHỞI CHẠY NATIVE FOREGROUND SERVICE ĐỘC LẬP
    // Chạy ngầm 100% bằng Java/Swift Native, duy trì liên tục kể cả khi khóa màn hình
    if (isNative) {
      const authState = useAuthStore.getState();
      NativeTracking.startTracking({
        token: authState.accessToken,
        refreshToken: authState.refreshToken,
        apiUrl: BASE_API_URL,
      }).catch((e: any) => {
        console.warn('[NativeTracking] Start native tracking failed, falling back to Web Geolocation:', e);
        startWebWatchPosition();
      });
    } else {
      // 2. NẾU LÀ TRÌNH DUYỆT WEB: DÙNG WATCH POSITION CỦA HTML5
      startWebWatchPosition();
    }

    // 3. WEB WORKER TIMER: ĐẢM NHIỆM HEARTBEAT KHI ĐỨNG YÊN (HOẠT ĐỘNG CHO CẢ NATIVE VÀ WEB)
    // Tần suất kiểm tra: Mỗi 30 giây kiểm tra một lần
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
        { type: 'application/javascript' }
      );
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);
      workerRef.current = worker;

      worker.onmessage = (e) => {
        if (e.data === 'tick') {
          // Chỉ chạy worker heartbeat khi trên Web; Native app đã có Service nền độc lập
          if (!isNative) {
            const elapsed = Date.now() - lastPingRef.current;
            if (elapsed >= intervalMs) {
              pingCurrentLocation();
            }
          }
        }
      };
    } catch (e) {
      console.warn('[LocationTracker] Fallback to standard timer:', e);
      const fallbackTimer = setInterval(() => {
        if (!isNative) {
          const elapsed = Date.now() - lastPingRef.current;
          if (elapsed >= intervalMs) {
            pingCurrentLocation();
          }
        }
      }, checkIntervalMs);
      return () => clearInterval(fallbackTimer);
    }

    // 4. LẮNG NGHE SỰ KIỆN BẬT MÀN HÌNH HOẶC FOCUS LẠI VÀO APP
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - lastPingRef.current;
        if (elapsed >= (isNative ? heartbeatMs : intervalMs)) {
          if (isNative) {
            sendHeartbeat();
          } else {
            pingCurrentLocation();
          }
        }
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      clearTimeout(initTimer);
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
      if (wakeLockRef.current) {
        const lock = wakeLockRef.current as { release?: () => Promise<void> };
        lock.release?.().catch(() => {});
        wakeLockRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [enabled, intervalMs, heartbeatMs, pingCurrentLocation, executePing, sendHeartbeat]);

  // Đồng bộ tức thời khi AccessToken / RefreshToken được cập nhật từ Web sang Native Service
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);

  useEffect(() => {
    if (Capacitor.isNativePlatform() && enabled && (accessToken || refreshToken)) {
      NativeTracking.updateToken({
        token: accessToken,
        refreshToken: refreshToken,
      }).catch((e: any) => {
        console.warn('[NativeTracking] Update token failed:', e);
      });
    }
  }, [accessToken, refreshToken, enabled]);

  return {
    isTracking,
    lastPingTime,
    error,
    pingNow: pingCurrentLocation,
  };
}
