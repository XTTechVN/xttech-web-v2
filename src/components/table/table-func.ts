import { useState, useEffect } from 'react';
import type { ITableColumn } from './types';

/**
 * Hook kiểm tra xem kích thước màn hình hiện tại có phải là thiết bị di động hay không (mặc định < 768px).
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setIsMobile(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Lấy danh sách các key của cột hiển thị mặc định ban đầu.
 * - Các cột có cấu hình visible = false sẽ mặc định bị ẩn.
 * - Các cột còn lại (hoặc visible = true) sẽ luôn hiển thị.
 */
export function getInitialVisibleKeys<T>(columns: ITableColumn<T>[]): string[] {
  return columns.filter((col) => col.visible !== false).map((col) => col.key);
}

/**
 * Lọc danh sách cột dựa trên các key được bật hiển thị.
 */
export function getFilteredColumns<T>(
  columns: ITableColumn<T>[],
  visibleKeys: string[]
): ITableColumn<T>[] {
  return columns.filter((col) => visibleKeys.includes(col.key));
}

/**
 * Lấy giá trị thực tế của bộ lọc dựa trên giá trị được chọn từ option.
 */
export function getSelectedFilterValue(
  targetValue: string,
  options: { value: string | undefined; label: string }[]
): string | undefined {
  const selectedOption = options.find((opt) => (opt.value ?? '') === targetValue);
  return selectedOption ? selectedOption.value : undefined;
}
