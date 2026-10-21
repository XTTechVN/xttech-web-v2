/**
 * Định dạng số tiền thành chuỗi tiền tệ VNĐ (ví dụ: 100.000 ₫)
 * @param value Số tiền cần định dạng
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '0 VND';
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(amount)) return '0 VND';
  
  // Định dạng số thành phân tách phần nghìn bằng dấu chấm (ví dụ: 150.000)
  const formatted = new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return `${formatted} VND`;
}

// Chuyển chuỗi bất kỳ thành chuỗi chỉ gồm chữ số
export const onlyDigits = (raw: string): string => raw.replace(/\D/g, '');

// Hiển thị chuỗi chữ số theo định dạng Việt Nam: 000.000.000
export const formatMoneyInput = (digits: string): string =>
  digits === '' ? '' : Number(digits).toLocaleString('vi-VN');

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
