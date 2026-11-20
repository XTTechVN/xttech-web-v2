export type ArApSubTabKey = 'source_queue' | 'receivable' | 'payable' | 'advance';

export interface ArApSubTabMeta {
  value: ArApSubTabKey;
  label: string;
  shortLabel: string;
  accountHint: string;
}

export const AR_AP_SUBTABS: ArApSubTabMeta[] = [
  {
    value: 'source_queue',
    label: 'Hàng chờ hạch toán (Bán tự động)',
    shortLabel: 'Hàng chờ',
    accountHint: 'HĐ Dự án / Kho / Kính',
  },
  {
    value: 'receivable',
    label: 'Phải thu Khách hàng (131)',
    shortLabel: 'Phải thu 131',
    accountHint: 'TK 131',
  },
  {
    value: 'payable',
    label: 'Phải trả Nhà cung cấp (331)',
    shortLabel: 'Phải trả 331',
    accountHint: 'TK 331',
  },
  {
    value: 'advance',
    label: 'Tạm ứng Nhân viên (141)',
    shortLabel: 'Tạm ứng 141',
    accountHint: 'TK 141',
  },
];

export const AR_AP_QUEUE_STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'pending', label: 'Chờ hạch toán' },
  { value: 'all', label: 'Tất cả (Gồm đã import)' },
];

export const SUGGESTED_INVOICE_BADGE_MAP: Record<
  'true' | 'false',
  { label: string; variant: 'success' | 'warning' }
> = {
  true: { label: 'Có HĐ GTGT', variant: 'success' },
  false: { label: 'Không HĐ (627/642 — B4)', variant: 'warning' },
};
