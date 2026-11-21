import type { Tone } from '../../_components/badge';

export const ITEM_TYPES = [
  { value: 'profile', label: 'Nhôm thanh' },
  { value: 'accessory', label: 'Phụ kiện' },
  { value: 'consumable', label: 'Vật tư tiêu hao' },
];
export const UNITS = [
  { value: 'bar', label: 'Thanh' },
  { value: 'set', label: 'Bộ' },
  { value: 'pcs', label: 'Cái' },
  { value: 'meter', label: 'Mét' },
  { value: 'box', label: 'Hộp' },
  { value: 'bottle', label: 'Chai' },
];
export const REASONS: Record<string, string> = {
  purchase: 'Mua hàng',
  offcut_return: 'Trả nhôm thừa',
  production_issue: 'Xuất sản xuất',
  rework_issue: 'Xuất làm lại',
  adjustment: 'Điều chỉnh',
  scrap: 'Huỷ bỏ',
};
export const RECEIPT_STATUS: Record<string, { label: string; tone: Tone }> = {
  draft: { label: 'Chờ duyệt', tone: 'warning' },
  approved: { label: 'Đã duyệt', tone: 'success' },
  cancelled: { label: 'Đã huỷ', tone: 'neutral' },
};
export const labelOf = (list: { value: string; label: string }[], v: string) => list.find((o) => o.value === v)?.label ?? v;
export const num = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
