import type {
  FilingFrequency,
  PitContractCategory,
  StatutoryFormCode,
  StatutoryPeriodType,
} from '@/types';

export type StatutorySubTabKey =
  | 'overview'
  | 'declarations'
  | 'pit_ledger'
  | 'bctc'
  | 'reconciliation'
  | 'exports';

export const STATUTORY_SUBTABS: Array<{ value: StatutorySubTabKey; label: string }> = [
  { value: 'overview', label: 'Tổng quan kỳ' },
  { value: 'declarations', label: 'Tờ khai thuế' },
  { value: 'pit_ledger', label: 'Bảng kê TNCN' },
  { value: 'bctc', label: 'BCTC (TT99)' },
  { value: 'reconciliation', label: 'Đối chiếu chéo' },
  { value: 'exports', label: 'Lịch sử bản xuất' },
];

export const STATUTORY_PERIOD_TYPE_OPTIONS: Array<{
  value: StatutoryPeriodType;
  label: string;
}> = [
  { value: 'quarter', label: 'Theo Quý' },
  { value: 'month', label: 'Theo Tháng' },
  { value: 'annual', label: 'Theo Năm (BCTC & QT)' },
];

export const STATUTORY_QUARTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '1', label: 'Quý I (T1 - T3)' },
  { value: '2', label: 'Quý II (T4 - T6)' },
  { value: '3', label: 'Quý III (T7 - T9)' },
  { value: '4', label: 'Quý IV (T10 - T12)' },
];

export const STATUTORY_MONTH_OPTIONS: Array<{ value: string; label: string }> = Array.from(
  { length: 12 },
  (_, i) => ({ value: String(i + 1), label: `Tháng ${String(i + 1).padStart(2, '0')}` }),
);

export const DECLARATION_FORM_OPTIONS: Array<{
  value: StatutoryFormCode;
  label: string;
}> = [
  { value: '01_GTGT', label: 'Mẫu 01/GTGT — Tờ khai Thuế GTGT khấu trừ' },
  { value: '05_KK_TNCN', label: 'Mẫu 05/KK-TNCN — Tờ khai Khấu trừ Thuế TNCN' },
  { value: '03_TNDN', label: 'Mẫu 03/TNDN & PL 03-1A — Quyết toán Thuế TNDN' },
];

export const BCTC_FORM_OPTIONS: Array<{
  value: StatutoryFormCode;
  label: string;
}> = [
  { value: 'B01_DN', label: 'Mẫu B01-DN — Báo cáo Tình hình tài chính (CĐKT)' },
  { value: 'B02_DN', label: 'Mẫu B02-DN — Báo cáo Kết quả hoạt động kinh doanh' },
  { value: 'B03_DN', label: 'Mẫu B03-DN — Báo cáo Lưu chuyển tiền tệ (TT)' },
  { value: 'B09_DN', label: 'Mẫu B09-DN — Thuyết minh Báo cáo tài chính' },
  { value: 'CDTK', label: 'Mẫu S06-DN — Bảng Cân đối Tài khoản' },
];

export const PIT_CATEGORY_OPTIONS: Array<{
  value: PitContractCategory;
  label: string;
}> = [
  { value: 'resident_gte_3m', label: 'HĐLĐ ≥ 3 tháng (Lũy tiến)' },
  { value: 'resident_lt_3m_or_non_contract', label: 'Vãng lai / < 3 tháng (10%)' },
  { value: 'non_resident', label: 'Không cư trú (20%)' },
];

export const PHASE3_RC_PLACEHOLDER_SLOTS: Array<{
  gateCode: string;
  title: string;
  description: string;
}> = [
  {
    gateCode: 'RC-01',
    title: 'Cân đối Bảng CĐKT B01-DN (Tổng Tài sản = Tổng Nguồn vốn)',
    description: 'Sẵn sàng khi kích hoạt BCTC năm (Giai đoạn 3).',
  },
  {
    gateCode: 'RC-02',
    title: 'Khớp B01-DN [421] với B02-DN [60] & Kết chuyển 911',
    description: 'Sẵn sàng khi kích hoạt BCTC năm (Giai đoạn 3).',
  },
  {
    gateCode: 'RC-03',
    title: 'Khớp B03-DN [70] với Sổ quỹ 111 + Ngân hàng 112 + Tiền ĐC 113',
    description: 'Sẵn sàng khi kích hoạt Lưu chuyển tiền tệ B03-DN (Giai đoạn 3).',
  },
  {
    gateCode: 'RC-05',
    title: 'Khớp 03/TNDN với Sổ chi phí không được trừ B4 & Dự toán 8211',
    description: 'Sẵn sàng khi kích hoạt Quyết toán TNDN 03/TNDN (Giai đoạn 3).',
  },
];

export const DRILLDOWN_SOURCE_KIND_LABELS: Record<string, string> = {
  general_ledger: 'Sổ cái',
  tax_invoice: 'Hóa đơn GTGT',
  pit_entry: 'Bảng kê TNCN',
  auto_computed: 'Tự động tính',
  manual_input: 'Nhập tay',
};

export function toFilingFrequency(periodType: StatutoryPeriodType): FilingFrequency {
  return periodType === 'month' ? 'monthly' : 'quarterly';
}
