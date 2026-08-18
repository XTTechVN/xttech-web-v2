/**
 * Định dạng số tiền thành chuỗi tiền tệ VNĐ (ví dụ: 100.000 ₫)
 * @param value Số tiền cần định dạng
 */
export function formatCurrency(value: number | string): string {
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(amount)) return '0 VND';
  
  // Định dạng số thành phân tách phần nghìn bằng dấu chấm (ví dụ: 150.000)
  const formatted = new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return `${formatted} VND`;
}
