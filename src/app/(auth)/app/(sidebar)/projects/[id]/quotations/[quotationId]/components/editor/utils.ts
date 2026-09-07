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

/**
 * Đọc số tiền bằng tiếng Việt (Ví dụ: 38627000 -> "Ba mươi tám triệu sáu trăm hai mươi bảy nghìn đồng")
 * @param num Số tiền cần đọc
 */
export function readVietnameseNumber(num: number): string {
  if (num === 0) return 'Không đồng';
  
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  
  function readGroup3(n: number, showZero: boolean): string {
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;
    let res = '';
    
    if (h > 0 || showZero) {
      res += digits[h] + ' trăm ';
    }
    
    if (t > 1) {
      res += digits[t] + ' mươi ';
    } else if (t === 1) {
      res += 'mười ';
    } else if (showZero && u > 0) {
      res += 'lẻ ';
    }
    
    if (u === 1 && t > 1) {
      res += 'mốt';
    } else if (u === 5 && t > 0) {
      res += 'lăm';
    } else if (u > 0) {
      res += digits[u];
    }
    
    return res.trim();
  }
  
  let temp = Math.abs(num);
  let groupIdx = 0;
  let words = '';
  
  while (temp > 0) {
    const groupVal = temp % 1000;
    if (groupVal > 0) {
      const showZero = temp >= 1000;
      const groupStr = readGroup3(groupVal, showZero);
      const unit = units[groupIdx];
      words = groupStr + ' ' + unit + ' ' + words;
    }
    temp = Math.floor(temp / 1000);
    groupIdx++;
  }
  
  const result = words.trim().replace(/\s+/g, ' ');
  return result.charAt(0).toUpperCase() + result.slice(1) + ' đồng';
}
