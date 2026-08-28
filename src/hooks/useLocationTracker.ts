'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { sendLocationPing } from '@/actions';

interface LocationTrackerOptions {
  enabled?: boolean;
  intervalMs?: number; // Mặc định 60 giây (60000ms)
}

export function useLocationTracker({
  enabled = true,
  intervalMs = 60000,
}: LocationTrackerOptions = {}) {
  const [isTracking, setIsTracking] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lastPingRef = useRef<number>(0);
  const workerRef = useRef<Worker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<unknown>(null);

  // Đọc mức pin thiết bị nếu được hỗ trợ
  const getBatteryLevel = async (): Promise<number | undefined> => {
    try {
      if ('getBattery' in navigator) {
        const nav = navigator as unknown as { getBattery: () => Promise<{ level: number }> };
        const battery = await nav.getBattery();
        return Math.round(battery.level * 100);
      }
    } catch {
      // Bỏ qua nếu trình duyệt không hỗ trợ Battery API
    }
    return undefined;
  };

  // Gửi tọa độ GPS lên Backend
  const executePing = useCallback(async (pos: GeolocationPosition) => {
    const now = Date.now();
    // Giới hạn tối thiểu 10 giây giữa 2 lần ping để tránh gửi dồn dập
    if (now - lastPingRef.current < 10000) {
      return;
    }
    lastPingRef.current = now;

    try {
      const battery = await getBatteryLevel();
      await sendLocationPing({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy || undefined,
        speed: pos.coords.speed || undefined,
        heading: pos.coords.heading || undefined,
        battery_level: battery,
      });

      setLastPingTime(new Date());
      setIsTracking(true);
      setError(null);
    } catch (err) {
      console.warn('[LocationTracker] Ping failed:', err);
    }
  }, []);

  // Lấy vị trí tức thời 1 lần với cơ chế Fallback thông minh 2 tầng
  const pingCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Thiết bị không hỗ trợ định vị GPS');
      return;
    }

    // Tầng 1: Thử GPS chính xác cao trong 6 giây
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        executePing(pos);
      },
      () => {
        // Tầng 2: Fallback sang định vị WiFi / IP mạng với timeout 15s và chấp nhận cache 1 phút
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            executePing(pos);
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

  // Yêu cầu Screen WakeLock để giữ luồng định vị không bị ngủ sâu trên Mobile
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
    if (!enabled) {
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

    // 1. Gửi 1 ping ngay khi khởi chạy (qua microtask để tránh setState đồng bộ trong effect)
    const initTimer = setTimeout(() => {
      pingCurrentLocation();
      requestWakeLock();
    }, 100);

    // 2. Sử dụng Web Worker Timer chạy nền (Không bao giờ bị trình duyệt đóng băng / throttle khi tab ẩn)
    try {
      const blob = new Blob(
        [
          `
          let interval = ${intervalMs};
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
          pingCurrentLocation();
        }
      };
    } catch (e) {
      console.warn('[LocationTracker] Fallback to standard timer:', e);
      const fallbackTimer = setInterval(pingCurrentLocation, intervalMs);
      return () => clearInterval(fallbackTimer);
    }

    // 3. Sử dụng watchPosition để lắng nghe trực tiếp từ phần cứng GPS của hệ điều hành
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const elapsed = Date.now() - lastPingRef.current;
          // Nếu đã quá 30 giây kể từ lần ping trước hoặc vị trí di chuyển có độ chính xác cao
          if (elapsed >= 30000) {
            executePing(pos);
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

    // 4. Lắng nghe sự kiện người dùng bật lại màn hình hoặc focus vào tab để chống ngủ đông
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - lastPingRef.current;
        if (elapsed > intervalMs) {
          pingCurrentLocation();
        }
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      clearTimeout(initTimer);
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
  }, [enabled, intervalMs, pingCurrentLocation, executePing]);

  return {
    isTracking,
    lastPingTime,
    error,
    pingNow: pingCurrentLocation,
  };
}
