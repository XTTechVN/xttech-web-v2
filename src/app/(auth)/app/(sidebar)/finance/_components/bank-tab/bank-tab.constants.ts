import { BookOpen, Link2, Receipt, RefreshCw, Send } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { VoucherType } from '@/types';
import { VOUCHER_TYPE_MAP } from '@/config/finance';

export type BankSubTabKey = 'vouchers' | 'ledger';

export const BANK_SUB_TABS: Array<{
  value: BankSubTabKey;
  label: string;
  icon: LucideIcon;
}> = [
  { value: 'vouchers', label: 'Báo Có / Ủy nhiệm chi', icon: Receipt },
  { value: 'ledger', label: 'Sổ Tiền Gửi Ngân Hàng', icon: BookOpen },
];

export const BANK_TYPE_FILTER_OPTIONS: Array<{ value: VoucherType; label: string }> = [
  { value: 'bank_receipt', label: VOUCHER_TYPE_MAP.bank_receipt.shortLabel || 'Báo Có NH' },
  { value: 'bank_payment', label: VOUCHER_TYPE_MAP.bank_payment.shortLabel || 'Ủy nhiệm chi' },
];

export const BANK_INVOICE_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'true', label: 'Có Hóa đơn GTGT' },
  { value: 'false', label: 'Không có Hóa đơn' },
];

export const BANK_TAX_DEDUCTIBLE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'true', label: 'Được trừ thuế' },
  { value: 'false', label: 'Không được trừ (B4)' },
];

export const JETPAY_ACTIONS: Array<{
  id: string;
  label: string;
  modalTitle: string;
  icon: LucideIcon;
}> = [
  {
    id: 'connect',
    label: 'Kết nối ngân hàng',
    modalTitle: 'Kết nối ngân hàng Open Banking (JetPay)',
    icon: Link2,
  },
  {
    id: 'sync',
    label: 'Đồng bộ sao kê',
    modalTitle: 'Đồng bộ sao kê tự động (JetPay)',
    icon: RefreshCw,
  },
  {
    id: 'transfer',
    label: 'Chuyển tiền trực tuyến',
    modalTitle: 'Chuyển tiền trực tuyến & Ký UNC (JetPay)',
    icon: Send,
  },
];
