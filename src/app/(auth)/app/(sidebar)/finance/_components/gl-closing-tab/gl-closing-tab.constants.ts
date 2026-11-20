import type { ClosingPreviewLine, VoucherType } from '@/types';

export type GlSubTabKey = 'journal' | 'overhead_allocation' | 'closing' | 'period_locks';

export interface GlSubTabMeta {
  value: GlSubTabKey;
  label: string;
}

export const GL_SUBTABS: GlSubTabMeta[] = [
  { value: 'journal', label: 'Chứng từ Tổng hợp (PKT) & Giá thành' },
  { value: 'overhead_allocation', label: 'Phân bổ chi phí chung (627 / 154)' },
  { value: 'closing', label: 'Kết chuyển Cuối kỳ (911 → 4212)' },
  { value: 'period_locks', label: 'Khóa kỳ Kế toán' },
];

export const GL_VOUCHER_TYPE_FILTER_OPTIONS: Array<{ value: VoucherType; label: string }> = [
  { value: 'general_journal', label: 'Bút toán tổng hợp (PKT)' },
  { value: 'closing_entry', label: 'Bút toán kết chuyển (911 → 4212)' },
  { value: 'opening_balance', label: 'Chứng từ số dư đầu kỳ' },
];

export const GL_TAX_DEDUCTIBLE_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'true', label: 'Được trừ thuế' },
  { value: 'false', label: 'Không được trừ (B4)' },
];

export const TRANSFER_DIRECTION_MAP: Record<
  ClosingPreviewLine['transferDirection'],
  { label: string; badgeClass: string }
> = {
  to_911_debit: {
    label: 'Kết chuyển Có → Nợ 911',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  to_911_credit: {
    label: 'Kết chuyển Nợ → Có 911',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  profit_to_4212: {
    label: 'Kết chuyển Lãi 911 → 4212',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  },
  loss_to_4212: {
    label: 'Kết chuyển Lỗ 4212 → 911',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

export const MONTH_LABELS: Array<{ month: number; name: string }> = [
  { month: 1, name: 'Tháng 01' },
  { month: 2, name: 'Tháng 02' },
  { month: 3, name: 'Tháng 03' },
  { month: 4, name: 'Tháng 04' },
  { month: 5, name: 'Tháng 05' },
  { month: 6, name: 'Tháng 06' },
  { month: 7, name: 'Tháng 07' },
  { month: 8, name: 'Tháng 08' },
  { month: 9, name: 'Tháng 09' },
  { month: 10, name: 'Tháng 10' },
  { month: 11, name: 'Tháng 11' },
  { month: 12, name: 'Tháng 12' },
];
