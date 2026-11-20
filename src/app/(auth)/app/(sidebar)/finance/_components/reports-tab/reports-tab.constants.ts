import { REPORT_VIEW_MODE_MAP } from '@/config/finance';
import type { ReportViewMode } from '@/types';

export type ReportSubTabKey =
  | 'project_pnl'
  | 'trial_balance'
  | 'general_ledger'
  | 'cashflow';

export const REPORT_SUBTABS: Array<{ value: ReportSubTabKey; label: string }> = [
  { value: 'project_pnl', label: 'Lãi / Lỗ Công trình (Project P&L)' },
  { value: 'trial_balance', label: 'Bảng Cân đối Phát sinh (CĐPS)' },
  { value: 'general_ledger', label: 'Sổ Cái Tài khoản (S03b-DN)' },
  { value: 'cashflow', label: 'Lưu chuyển Dòng tiền (Cashflow)' },
];

export const REPORT_VIEW_MODE_SEGMENT_ITEMS: Array<{
  value: ReportViewMode;
  label: string;
  hint: string;
}> = [
  {
    value: 'all',
    label: REPORT_VIEW_MODE_MAP.all.label,
    hint: REPORT_VIEW_MODE_MAP.all.description || '',
  },
  {
    value: 'tax_deductible_only',
    label: REPORT_VIEW_MODE_MAP.tax_deductible_only.label,
    hint: REPORT_VIEW_MODE_MAP.tax_deductible_only.description || '',
  },
  {
    value: 'non_deductible_only',
    label: REPORT_VIEW_MODE_MAP.non_deductible_only.label,
    hint: REPORT_VIEW_MODE_MAP.non_deductible_only.description || '',
  },
];

export const CASHFLOW_GRANULARITY_OPTIONS: Array<{
  value: 'month' | 'day';
  label: string;
}> = [
  { value: 'month', label: 'Theo Tháng' },
  { value: 'day', label: 'Theo Ngày' },
];
