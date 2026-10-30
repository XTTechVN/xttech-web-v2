import type { QuotationSheetUnit } from '@/types';

// Đơn vị tính backend trả về dạng mã tiếng Anh, giao diện tự dịch sang nhãn tiếng Việt
export const SHEET_UNIT_LABELS: Record<QuotationSheetUnit, string> = {
  m2: 'm²',
  set: 'Bộ',
};

export const formatSheetNumber = (value?: number | null, fractionDigits = 0): string =>
  value === null || value === undefined
    ? ''
    : value.toLocaleString('vi-VN', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      });

// Ngày dạng yyyy-MM-dd -> dd/MM/yyyy (không qua Date để tránh lệch múi giờ)
export const formatSheetDate = (isoDate?: string | null): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
};

export const formatLongDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.slice(0, 10).split('-');
  return `ngày ${Number(day)} tháng ${Number(month)} năm ${year}`;
};

// Chữ cái đánh số tầng: A, B, C...
export const floorLetter = (index: number): string =>
  index < 26 ? String.fromCharCode(65 + index) : String(index + 1);
