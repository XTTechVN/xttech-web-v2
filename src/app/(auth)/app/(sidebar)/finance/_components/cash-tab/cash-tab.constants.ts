import { BookOpen, ClipboardCheck, Receipt } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { VoucherType } from '@/types';
import { VOUCHER_TYPE_MAP } from '@/config/finance';

export type CashSubTabKey = 'vouchers' | 'cashbook' | 'cash_counts';

export const CASH_SUB_TABS: Array<{
  value: CashSubTabKey;
  label: string;
  icon: LucideIcon;
}> = [
  { value: 'vouchers', label: 'Phiếu Thu / Chi Tiền mặt', icon: Receipt },
  { value: 'cashbook', label: 'Sổ Quỹ Tiền Mặt (S07-DN)', icon: BookOpen },
  { value: 'cash_counts', label: 'Biên bản kiểm kê quỹ', icon: ClipboardCheck },
];

export const CASH_TYPE_FILTER_OPTIONS: Array<{ value: VoucherType; label: string }> = [
  { value: 'cash_receipt', label: VOUCHER_TYPE_MAP.cash_receipt.shortLabel || 'Phiếu thu' },
  { value: 'cash_payment', label: VOUCHER_TYPE_MAP.cash_payment.shortLabel || 'Phiếu chi' },
];

export const CASH_INVOICE_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'true', label: 'Có Hóa đơn GTGT' },
  { value: 'false', label: 'Không có Hóa đơn' },
];

export const CASH_TAX_DEDUCTIBLE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'true', label: 'Được trừ thuế' },
  { value: 'false', label: 'Không được trừ (B4)' },
];
