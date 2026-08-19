'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

/**
 * Custom hook giúp đồng bộ state với URL query parameter trong Next.js App Router.
 * 
 * @param key Tên của query parameter trên URL (vd: 'status', 'search')
 * @param defaultValue Giá trị mặc định nếu trên URL chưa có tham số này
 * @returns Mảng chứa giá trị hiện tại và hàm cập nhật giá trị [value, setValue]
 */
export function useQueryParam(key: string, defaultValue?: string) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Lấy giá trị hiện tại từ URL, xử lý dấu cộng '+' thành khoảng trắng nếu có
  const rawValue = searchParams.get(key);
  const value = rawValue !== null ? rawValue.replace(/\+/g, ' ') : defaultValue;

  // Hàm cập nhật giá trị lên URL
  const setValue = (newValue: string | undefined | null) => {
    // Chuẩn hóa giá trị: undefined, null, '' đều coi là "không có giá trị"
    const normalizedNew = newValue ? newValue.trim() : undefined;
    const normalizedCurrent = searchParams.get(key) ? searchParams.get(key)!.replace(/\+/g, ' ') : undefined;

    // Nếu giá trị không thay đổi, không cần cập nhật URL (tránh vòng lặp)
    if (normalizedNew === normalizedCurrent) return;

    const params = new URLSearchParams(Array.from(searchParams.entries()));

    if (!normalizedNew) {
      params.delete(key);
    } else {
      params.set(key, normalizedNew);
    }

    // Tự động reset số trang (offset) về 0 bất cứ khi nào bộ lọc khác thay đổi
    if (key !== 'offset') {
      params.set('offset', '0');
    }

    // Cập nhật URL mà không cuộn trang lại đầu (scroll: false)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return [value, setValue] as const;
}
