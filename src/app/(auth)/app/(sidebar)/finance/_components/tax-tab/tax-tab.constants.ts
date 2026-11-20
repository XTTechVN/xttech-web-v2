import type {
  TaxInvoiceDirection,
  TaxInvoiceStatus,
  VatRate,
} from '@/types';

export type TaxSubTabKey = 'invoices' | 'vat_ledger' | 'cit_b4';

export const TAX_SUBTABS: Array<{ value: TaxSubTabKey; label: string }> = [
  { value: 'invoices', label: 'Hóa đơn ĐT & Đọc XML (GDT)' },
  { value: 'vat_ledger', label: 'Bảng kê GTGT Đầu vào / Ra' },
  { value: 'cit_b4', label: 'Chi phí Loại trừ TNDN (B4)' },
];

export const INVOICE_STATUS_MAP: Record<
  TaxInvoiceStatus,
  { label: string; variant: 'success' | 'danger' | 'warning' | 'info' }
> = {
  active: { label: 'Hợp lệ / Đang dùng', variant: 'success' },
  cancelled: { label: 'Đã hủy', variant: 'danger' },
  adjusted: { label: 'Điều chỉnh', variant: 'warning' },
  replaced: { label: 'Thay thế', variant: 'info' },
};

export const INVOICE_STATUS_OPTIONS: Array<{ value: TaxInvoiceStatus; label: string }> = [
  { value: 'active', label: INVOICE_STATUS_MAP.active.label },
  { value: 'adjusted', label: INVOICE_STATUS_MAP.adjusted.label },
  { value: 'replaced', label: INVOICE_STATUS_MAP.replaced.label },
  { value: 'cancelled', label: INVOICE_STATUS_MAP.cancelled.label },
];

export const TAX_DIRECTION_OPTIONS: Array<{ value: TaxInvoiceDirection; label: string }> = [
  { value: 'input', label: 'Hóa đơn Đầu vào (1331)' },
  { value: 'output', label: 'Hóa đơn Đầu ra (33311)' },
];

export const TAX_DEDUCTIBLE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'true', label: 'Đủ ĐK khấu trừ / Hợp lệ' },
  { value: 'false', label: 'Không được khấu trừ' },
];

export const VAT_RATE_FILTER_OPTIONS: Array<{ value: VatRate; label: string }> = [
  { value: '10', label: 'Thuế suất 10%' },
  { value: '8', label: 'Thuế suất 8%' },
  { value: '5', label: 'Thuế suất 5%' },
  { value: '0', label: 'Thuế suất 0%' },
  { value: 'kct', label: 'Không chịu thuế (KCT)' },
  { value: 'kknt', label: 'Không kê khai nộp thuế (KKNT)' },
];

export const QUARTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '1', label: 'Quý I (T1 - T3)' },
  { value: '2', label: 'Quý II (T4 - T6)' },
  { value: '3', label: 'Quý III (T7 - T9)' },
  { value: '4', label: 'Quý IV (T10 - T12)' },
];

export const TAX_MONTH_OPTIONS: Array<{ value: string; label: string }> = Array.from(
  { length: 12 },
  (_, i) => ({ value: String(i + 1), label: `Tháng ${String(i + 1).padStart(2, '0')}` }),
);

export const INVOICE_DEDUCTIBLE_BADGE_MAP: Record<
  'true' | 'false',
  { label: string; shortLabel: string; variant: 'success' | 'warning' }
> = {
  true: { label: 'Đủ ĐK khấu trừ', shortLabel: 'Hợp lệ', variant: 'success' },
  false: { label: 'Không được khấu trừ', shortLabel: 'Loại trừ', variant: 'warning' },
};

export const VOUCHER_INVOICE_FLAG_MAP: Record<
  'true' | 'false',
  { label: string; variant: 'success' | 'warning' }
> = {
  true: { label: 'Có HĐ GTGT', variant: 'success' },
  false: { label: 'Thiếu HĐ GTGT', variant: 'warning' },
};
