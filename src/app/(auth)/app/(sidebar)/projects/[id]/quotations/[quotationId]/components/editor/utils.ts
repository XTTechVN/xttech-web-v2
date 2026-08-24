import { getAccessories } from '@/actions';

/**
 * Lấy danh sách ID các phụ kiện mặc định được gán cho Hệ nhôm và Biên dạng cửa.
 * @param materialId ID của hệ nhôm
 * @param doorId ID của mẫu/biên dạng cửa
 * @returns Danh sách ID phụ kiện duy nhất (không trùng lặp)
 */
export async function fetchDefaultAccessories(
  materialId?: number,
  doorId?: number,
): Promise<number[]> {
  if (!materialId && !doorId) return [];

  try {
    const res = await getAccessories({
      materialId,
      doorId,
      limit: 100,
      allowDeleted: false,
    });
    const items = res?.items || [];
    // Khử trùng lặp ID phụ kiện
    const uniqueIds = Array.from(new Set(items.map((acc) => acc.id)));
    return uniqueIds;
  } catch (error) {
    console.error('Lỗi khi tải phụ kiện mặc định:', error);
    return [];
  }
}
