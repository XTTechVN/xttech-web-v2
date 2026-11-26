import type { Account } from '@/types';

export type SettingsSubTabKey =
  | 'regime'
  | 'taxpayer_profile'
  | 'permissions'
  | 'fiscal_years'
  | 'coa'
  | 'templates'
  | 'funds_banks'
  | 'cost_items'
  | 'audit_logs';

export const SETTINGS_SUBTABS: Array<{ value: SettingsSubTabKey; label: string }> = [
  { value: 'regime', label: 'Chế độ Kế toán & Kiểm soát' },
  { value: 'taxpayer_profile', label: 'Hồ sơ Người nộp thuế' },
  { value: 'permissions', label: 'Phân quyền Tài chính' },
  { value: 'fiscal_years', label: 'Cấu hình Năm & Tiêu thức 627' },
  { value: 'coa', label: 'Hệ thống Tài khoản (Cây TK)' },
  { value: 'templates', label: 'Mẫu Định khoản Nhanh' },
  { value: 'funds_banks', label: 'Quỹ TK 1111 & Ngân hàng' },
  { value: 'cost_items', label: 'Khoản mục Chi phí' },
  { value: 'audit_logs', label: 'Nhật ký Kiểm toán (Audit Log)' },
];

export const COA_POSTABLE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'true', label: 'TK Chi tiết (Hạch toán được)' },
  { value: 'false', label: 'TK Tổng hợp (Nhóm cha)' },
];

export const COA_ACTIVE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'true', label: 'Đang sử dụng' },
  { value: 'false', label: 'Ngừng theo dõi' },
];

export const WORKSHOP_VISIBLE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'true', label: 'Hiện ở Chế độ Xưởng (Nhanh)' },
  { value: 'false', label: 'Chỉ Chế độ Kế toán' },
];

export const TEMPLATE_INVOICE_DEFAULT_MAP: Record<
  'true' | 'false',
  { label: string; variant: 'success' | 'warning' }
> = {
  true: { label: 'Có HĐ GTGT', variant: 'success' },
  false: { label: 'Không HĐ (627/642 — B4)', variant: 'warning' },
};

export function formatAccountTrackFlags(acc: Account): string[] {
  const tags: string[] = [];
  if (acc.trackCustomer) tags.push('KH');
  if (acc.trackSupplier) tags.push('NCC');
  if (acc.trackEmployee) tags.push('NV');
  if (acc.trackProject) tags.push('CT');
  if (acc.trackCostItem) tags.push('KM');
  if (acc.trackBankAccount) tags.push('NH');
  if (acc.trackItem) tags.push('VT');
  return tags;
}
