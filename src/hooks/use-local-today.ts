'use client';

import { useEffect, useState } from 'react';

/** Tần suất kiểm tra sang ngày mới khi app vẫn đang mở (đủ nhỏ để bắt kịp mốc nửa đêm) */
const DAY_CHECK_INTERVAL_MS = 60_000;

/** Ngày hiện tại theo giờ địa phương, định dạng YYYY-MM-DD */
export const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Trả về ngày hôm nay (YYYY-MM-DD) và tự cập nhật khi:
 * - App được mở lại từ nền (WebView/Capacitor giữ nguyên JS state qua đêm, không reload)
 * - Đồng hồ vượt qua nửa đêm trong lúc app đang mở
 */
export function useLocalToday(): string {
  const [today, setToday] = useState<string>(getLocalDateString);

  useEffect(() => {
    // setState với cùng chuỗi ngày sẽ không gây re-render
    const syncToday = () => setToday(getLocalDateString());
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') syncToday();
    };

    const timer = setInterval(syncToday, DAY_CHECK_INTERVAL_MS);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', syncToday);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', syncToday);
    };
  }, []);

  return today;
}
