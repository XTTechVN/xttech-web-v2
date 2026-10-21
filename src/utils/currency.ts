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
