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

/**
 * Tính toán đơn giá của vật tư (hệ nhôm, phụ kiện, tùy chọn phát sinh) dựa trên loại giá.
 * @param item Đối tượng vật tư chứa các thuộc tính giá (retailPrice, salePrice, costPrice)
 * @param priceType Loại giá áp dụng ('retail' | 'sale' | 'cost')
 * @returns Đơn giá tương ứng hoặc giá trị mặc định là 0
 */
export function getResolvedPrice(
  item?: { retailPrice?: number | null; salePrice?: number | null; costPrice?: number | null } | null,
  priceType?: 'retail' | 'sale' | 'cost',
): number {
  if (!item) return 0;
  const type = priceType || 'retail';
  const pKey = type === 'retail' ? 'retailPrice' : (type === 'sale' ? 'salePrice' : 'costPrice');
  const price = item[pKey];
  if (price !== undefined && price !== null) {
    return price;
  }
  return item.retailPrice || item.salePrice || item.costPrice || 0;
}
