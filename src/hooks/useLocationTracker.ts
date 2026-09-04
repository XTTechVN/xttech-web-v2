/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { sendLocationPing } from '@/actions';
import { useAuthStore } from '@/stores';
import { BASE_API_URL } from '@/config';
import { Capacitor, registerPlugin } from '@capacitor/core';
import type { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

interface NativeTrackingPlugin {
  startTracking(options: { token: string; apiUrl: string }): Promise<{ success: boolean }>;
  stopTracking(): Promise<{ success: boolean }>;
}
const NativeTracking = registerPlugin<NativeTrackingPlugin>('NativeTracking');

interface LocationTrackerOptions {
  enabled?: boolean;
  intervalMs?: number; // Mặc định 60 giây (60000ms) khi di chuyển trên Web
  heartbeatMs?: number; // Mặc định 3 phút (180000ms) gửi nhịp tim khi đứng yên
}

export function useLocationTracker({
  enabled = true,
  intervalMs = 60000,
  heartbeatMs = 180000,
}: LocationTrackerOptions = {}) {
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
  const nativeWatcherIdRef = useRef<string | null>(null);

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
    const now = Date.now();
    // Giới hạn tối thiểu 10 giây giữa 2 lần ping để tránh gửi dồn dập
    if (now - lastPingRef.current < 10000) {
      return;
    }
    lastPingRef.current = now;
    lastKnownCoordsRef.current = pos;

    try {
      const battery = await getBatteryLevel();
      await sendLocationPing({
        latitude: pos.latitude,
        longitude: pos.longitude,
        accuracy: pos.accuracy,
        speed: pos.speed,
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

  // Lấy vị trí tức thời 1 lần với cơ chế Fallback thông minh 2 tầng (cho Web)
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
          (err) => {
            setError(err.message);
          },
          {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 60000,
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
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

    if (!enabled) {
      setIsTracking(false);
      if (isNative) {
        NativeTracking.stopTracking().catch(() => {});
      }
      if (nativeWatcherIdRef.current) {
        BackgroundGeolocation.removeWatcher({ id: nativeWatcherIdRef.current }).catch(() => {});
        nativeWatcherIdRef.current = null;
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

    // Lấy vị trí ban đầu (Initial fix) và bật WakeLock
    const initTimer = setTimeout(() => {
      pingCurrentLocation();
      requestWakeLock();
    }, 100);

    // 1. NẾU LÀ NATIVE ANDROID / IOS: KHỞI CHẠY NATIVE FOREGROUND SERVICE ĐỘC LẬP
    // Chạy ngầm 100% bằng Java Native (chuẩn như Zalo/Grab), duy trì liên tục kể cả khi vuốt tắt app
    if (isNative) {
      const token = useAuthStore.getState().accessToken;
      NativeTracking.startTracking({
        token,
        apiUrl: BASE_API_URL,
      }).catch((e) => {
        console.warn('[NativeTracking] Start native tracking failed:', e);
      });
    } else {
      // 2. NẾU LÀ TRÌNH DUYỆT WEB: DÙNG WATCH POSITION CỦA HTML5
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const elapsed = Date.now() - lastPingRef.current;
            if (elapsed >= 30000) {
              executePing({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy || undefined,
                speed: pos.coords.speed || undefined,
                heading: pos.coords.heading || undefined,
              });
            }
          },
          () => {},
          {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 20000,
          }
        );
      }
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
          if (isNative) {
            sendHeartbeat();
          } else {
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
        if (isNative) {
          sendHeartbeat();
        } else {
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
      if (nativeWatcherIdRef.current) {
        BackgroundGeolocation.removeWatcher({ id: nativeWatcherIdRef.current }).catch(() => {});
        nativeWatcherIdRef.current = null;
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
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [enabled, intervalMs, heartbeatMs, pingCurrentLocation, executePing, sendHeartbeat]);

  return {
    isTracking,
    lastPingTime,
    error,
    pingNow: pingCurrentLocation,
  };
}
