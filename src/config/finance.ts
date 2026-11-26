import type { BadgeProps } from '@/components';
import type {
  AccountCategory,
  AccountingRegime,
  AccountNature,
  AccountRegimeScope,
  CashCountStatus,
  CostFlowType,
  CostGroup,
  FilingFrequency,
  FinanceTabKey,
  MaturityTerm,
  OverheadAllocationBasis,
  PartnerType,
  PitContractCategory,
  ProjectPnlDrilldownMetric,
  ReconciliationStatus,
  ReportViewMode,
  SourceQueueType,
  StatutoryFilingStatus,
  StatutoryFormCode,
  TaxInvoiceDirection,
  VatRate,
  VoucherLineKind,
  VoucherStatus,
  VoucherType,
} from '@/types';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

export interface FinanceDictItem {
  label: string;
  shortLabel?: string;
  description?: string;
  variant: BadgeVariant;
  badgeClass: string;
}

export const ACCOUNTING_REGIME_MAP: Record<AccountingRegime | AccountRegimeScope, FinanceDictItem> = {
  tt99: {
    label: 'Thông tư 99/2025/TT-BTC',
    shortLabel: 'TT99',
    description: 'Chế độ kế toán Doanh nghiệp vừa & lớn (áp dụng từ 2026)',
    variant: 'primary',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  },
  tt133: {
    label: 'Thông tư 133/2016/TT-BTC',
    shortLabel: 'TT133',
    description: 'Chế độ kế toán Doanh nghiệp nhỏ & vừa (SME)',
    variant: 'info',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  both: {
    label: 'Dùng chung TT99 & TT133',
    shortLabel: 'Cả 2 chế độ',
    variant: 'default',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

export const ACCOUNTING_REGIME_OPTIONS: Array<{ value: AccountingRegime; label: string }> = [
  { value: 'tt99', label: ACCOUNTING_REGIME_MAP.tt99.label },
  { value: 'tt133', label: ACCOUNTING_REGIME_MAP.tt133.label },
];

export const ACCOUNT_NATURE_MAP: Record<AccountNature, FinanceDictItem> = {
  debit: {
    label: 'Dư Nợ',
    shortLabel: 'Nợ',
    variant: 'info',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  credit: {
    label: 'Dư Có',
    shortLabel: 'Có',
    variant: 'success',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  both: {
    label: 'Lưỡng tính (Nợ / Có)',
    shortLabel: 'Lưỡng tính',
    variant: 'warning',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  no_balance: {
    label: 'Không có số dư',
    shortLabel: 'Không dư',
    variant: 'default',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

export const ACCOUNT_NATURE_OPTIONS: Array<{ value: AccountNature; label: string }> = [
  { value: 'debit', label: ACCOUNT_NATURE_MAP.debit.label },
  { value: 'credit', label: ACCOUNT_NATURE_MAP.credit.label },
  { value: 'both', label: ACCOUNT_NATURE_MAP.both.label },
  { value: 'no_balance', label: ACCOUNT_NATURE_MAP.no_balance.label },
];

export const ACCOUNT_CATEGORY_MAP: Record<AccountCategory, FinanceDictItem> = {
  asset: {
    label: 'Tài sản',
    shortLabel: 'Loại 1-2',
    variant: 'info',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  liability: {
    label: 'Nợ phải trả',
    shortLabel: 'Loại 3',
    variant: 'warning',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  equity: {
    label: 'Vốn chủ sở hữu',
    shortLabel: 'Loại 4',
    variant: 'primary',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  },
  revenue: {
    label: 'Doanh thu & Thu nhập',
    shortLabel: 'Loại 5, 7',
    variant: 'success',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  expense: {
    label: 'Chi phí & Giá vốn',
    shortLabel: 'Loại 6, 8',
    variant: 'danger',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  summary: {
    label: 'Xác định KQKD',
    shortLabel: 'Loại 9',
    variant: 'default',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

export const ACCOUNT_CATEGORY_OPTIONS: Array<{ value: AccountCategory; label: string }> = [
  { value: 'asset', label: ACCOUNT_CATEGORY_MAP.asset.label },
  { value: 'liability', label: ACCOUNT_CATEGORY_MAP.liability.label },
  { value: 'equity', label: ACCOUNT_CATEGORY_MAP.equity.label },
  { value: 'revenue', label: ACCOUNT_CATEGORY_MAP.revenue.label },
  { value: 'expense', label: ACCOUNT_CATEGORY_MAP.expense.label },
  { value: 'summary', label: ACCOUNT_CATEGORY_MAP.summary.label },
];

export const COST_FLOW_TYPE_MAP: Record<CostFlowType, FinanceDictItem> = {
  expense: {
    label: 'Khoản chi phí',
    shortLabel: 'Chi phí',
    variant: 'danger',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  income: {
    label: 'Khoản thu nhập',
    shortLabel: 'Thu nhập',
    variant: 'success',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  both: {
    label: 'Thu & Chi',
    shortLabel: 'Thu/Chi',
    variant: 'info',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
};

export const COST_FLOW_TYPE_OPTIONS: Array<{ value: CostFlowType; label: string }> = [
  { value: 'expense', label: COST_FLOW_TYPE_MAP.expense.label },
  { value: 'income', label: COST_FLOW_TYPE_MAP.income.label },
  { value: 'both', label: COST_FLOW_TYPE_MAP.both.label },
];

export const COST_GROUP_MAP: Record<CostGroup, FinanceDictItem> = {
  direct_material: {
    label: 'Nguyên vật liệu trực tiếp',
    shortLabel: 'NVL trực tiếp',
    variant: 'primary',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  },
  direct_labor: {
    label: 'Nhân công trực tiếp',
    shortLabel: 'Nhân công TT',
    variant: 'info',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  factory_overhead: {
    label: 'Chi phí sản xuất chung',
    shortLabel: 'SX chung',
    variant: 'warning',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  subcontract: {
    label: 'Thuê ngoài / Gia công',
    shortLabel: 'Thuê ngoài',
    variant: 'default',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  selling: {
    label: 'Chi phí bán hàng',
    shortLabel: 'Bán hàng',
    variant: 'success',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  admin: {
    label: 'Chi phí quản lý doanh nghiệp',
    shortLabel: 'Quản lý DN',
    variant: 'primary',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  other: {
    label: 'Chi phí khác',
    shortLabel: 'Khác',
    variant: 'default',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

export const COST_GROUP_OPTIONS: Array<{ value: CostGroup; label: string }> = [
  { value: 'direct_material', label: COST_GROUP_MAP.direct_material.label },
  { value: 'direct_labor', label: COST_GROUP_MAP.direct_labor.label },
  { value: 'factory_overhead', label: COST_GROUP_MAP.factory_overhead.label },
  { value: 'subcontract', label: COST_GROUP_MAP.subcontract.label },
  { value: 'selling', label: COST_GROUP_MAP.selling.label },
  { value: 'admin', label: COST_GROUP_MAP.admin.label },
  { value: 'other', label: COST_GROUP_MAP.other.label },
];

export const VOUCHER_TYPE_MAP: Record<VoucherType, FinanceDictItem> = {
  cash_receipt: {
    label: 'Phiếu thu tiền mặt',
    shortLabel: 'Phiếu thu',
    variant: 'success',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  cash_payment: {
    label: 'Phiếu chi tiền mặt',
    shortLabel: 'Phiếu chi',
    variant: 'danger',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  bank_receipt: {
    label: 'Thu tiền gửi (Báo Có)',
    shortLabel: 'Báo Có NH',
    variant: 'success',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  bank_payment: {
    label: 'Chi tiền gửi (UNC / Báo Nợ)',
    shortLabel: 'Ủy nhiệm chi',
    variant: 'warning',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  general_journal: {
    label: 'Chứng từ nghiệp vụ khác',
    shortLabel: 'Bút toán PKT',
    variant: 'info',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  closing_entry: {
    label: 'Bút toán kết chuyển cuối kỳ',
    shortLabel: 'Kết chuyển',
    variant: 'primary',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  },
  opening_balance: {
    label: 'Số dư đầu kỳ',
    shortLabel: 'Đầu kỳ',
    variant: 'default',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

export const VOUCHER_TYPE_OPTIONS: Array<{ value: VoucherType; label: string }> = [
  { value: 'cash_receipt', label: VOUCHER_TYPE_MAP.cash_receipt.label },
  { value: 'cash_payment', label: VOUCHER_TYPE_MAP.cash_payment.label },
  { value: 'bank_receipt', label: VOUCHER_TYPE_MAP.bank_receipt.label },
  { value: 'bank_payment', label: VOUCHER_TYPE_MAP.bank_payment.label },
  { value: 'general_journal', label: VOUCHER_TYPE_MAP.general_journal.label },
  { value: 'closing_entry', label: VOUCHER_TYPE_MAP.closing_entry.label },
  { value: 'opening_balance', label: VOUCHER_TYPE_MAP.opening_balance.label },
];

export const VOUCHER_STATUS_MAP: Record<VoucherStatus, FinanceDictItem> = {
  draft: {
    label: 'Nháp / Chờ ghi sổ',
    shortLabel: 'Nháp',
    variant: 'default',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  posted: {
    label: 'Đã ghi sổ cái',
    shortLabel: 'Đã ghi sổ',
    variant: 'success',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  voided: {
    label: 'Đã hủy / Hủy bỏ',
    shortLabel: 'Đã hủy',
    variant: 'danger',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export const VOUCHER_STATUS_OPTIONS: Array<{ value: VoucherStatus; label: string }> = [
  { value: 'draft', label: VOUCHER_STATUS_MAP.draft.label },
  { value: 'posted', label: VOUCHER_STATUS_MAP.posted.label },
  { value: 'voided', label: VOUCHER_STATUS_MAP.voided.label },
];

export const REPORT_VIEW_MODE_MAP: Record<ReportViewMode, FinanceDictItem> = {
  all: {
    label: 'Toàn bộ Sổ Tài chính',
    shortLabel: 'Toàn bộ',
    description: 'Hiển thị toàn bộ phát sinh trên Sổ Tài chính hợp nhất.',
    variant: 'primary',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  },
  tax_deductible_only: {
    label: 'Chỉ chi phí được trừ thuế',
    shortLabel: 'Được trừ thuế',
    description: 'Chỉ tổng hợp các giao dịch có hóa đơn hợp lệ, đủ điều kiện trừ thuế TNDN.',
    variant: 'success',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  non_deductible_only: {
    label: 'Chỉ chi phí không HĐ (B4)',
    shortLabel: 'Không HĐ (B4)',
    description: 'Chỉ tổng hợp các khoản chi không có hóa đơn hợp lệ hoặc bị loại trừ chỉ tiêu B4.',
    variant: 'warning',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

export const REPORT_VIEW_MODE_OPTIONS: Array<{ value: ReportViewMode; label: string }> = [
  { value: 'all', label: REPORT_VIEW_MODE_MAP.all.label },
  { value: 'tax_deductible_only', label: REPORT_VIEW_MODE_MAP.tax_deductible_only.label },
  { value: 'non_deductible_only', label: REPORT_VIEW_MODE_MAP.non_deductible_only.label },
];

export const TAX_DEDUCTIBLE_BADGE_MAP: Record<'true' | 'false', FinanceDictItem> = {
  true: {
    label: 'Được trừ thuế',
    shortLabel: 'Được trừ thuế',
    variant: 'success',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  false: {
    label: 'Không được trừ (B4)',
    shortLabel: 'Loại trừ B4',
    variant: 'warning',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

export function getTaxDeductibleBadge(isTaxDeductible: boolean): FinanceDictItem {
  return TAX_DEDUCTIBLE_BADGE_MAP[isTaxDeductible ? 'true' : 'false'];
}

export const PARTNER_TYPE_MAP: Record<PartnerType, FinanceDictItem> = {
  customer: {
    label: 'Khách hàng',
    shortLabel: 'KH',
    variant: 'success',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  supplier: {
    label: 'Nhà cung cấp',
    shortLabel: 'NCC',
    variant: 'warning',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  employee: {
    label: 'Nhân viên',
    shortLabel: 'NV',
    variant: 'info',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  other: {
    label: 'Đối tượng khác',
    shortLabel: 'Khác',
    variant: 'default',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

export const PARTNER_TYPE_OPTIONS: Array<{ value: PartnerType; label: string }> = [
  { value: 'customer', label: PARTNER_TYPE_MAP.customer.label },
  { value: 'supplier', label: PARTNER_TYPE_MAP.supplier.label },
  { value: 'employee', label: PARTNER_TYPE_MAP.employee.label },
  { value: 'other', label: PARTNER_TYPE_MAP.other.label },
];

export const VAT_RATE_MAP: Record<VatRate, FinanceDictItem & { numericRate: number }> = {
  '0': {
    label: '0%',
    shortLabel: '0%',
    numericRate: 0,
    variant: 'default',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  '5': {
    label: '5%',
    shortLabel: '5%',
    numericRate: 5,
    variant: 'info',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  '8': {
    label: '8% (Nghị quyết giảm thuế)',
    shortLabel: '8%',
    numericRate: 8,
    variant: 'primary',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  },
  '10': {
    label: '10%',
    shortLabel: '10%',
    numericRate: 10,
    variant: 'success',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  kct: {
    label: 'Không chịu thuế GTGT (KCT)',
    shortLabel: 'KCT',
    numericRate: 0,
    variant: 'warning',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  kknt: {
    label: 'Không kê khai nộp thuế (KKNT)',
    shortLabel: 'KKNT',
    numericRate: 0,
    variant: 'default',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

export const VAT_RATE_OPTIONS: Array<{ value: VatRate; label: string }> = [
  { value: '10', label: VAT_RATE_MAP['10'].label },
  { value: '8', label: VAT_RATE_MAP['8'].label },
  { value: '5', label: VAT_RATE_MAP['5'].label },
  { value: '0', label: VAT_RATE_MAP['0'].label },
  { value: 'kct', label: VAT_RATE_MAP.kct.label },
  { value: 'kknt', label: VAT_RATE_MAP.kknt.label },
];

export const TAX_INVOICE_DIRECTION_MAP: Record<TaxInvoiceDirection, FinanceDictItem> = {
  input: {
    label: 'Hóa đơn đầu vào (Mua vào)',
    shortLabel: 'Đầu vào',
    variant: 'info',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  output: {
    label: 'Hóa đơn đầu ra (Bán ra)',
    shortLabel: 'Đầu ra',
    variant: 'success',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

export const VOUCHER_LINE_KIND_MAP: Record<VoucherLineKind, FinanceDictItem> = {
  principal: {
    label: 'Hạch toán chính',
    shortLabel: 'Chính',
    variant: 'primary',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  },
  vat: {
    label: 'Thuế GTGT',
    shortLabel: 'GTGT',
    variant: 'info',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  closing: {
    label: 'Kết chuyển cuối kỳ',
    shortLabel: 'Kết chuyển',
    variant: 'default',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

export const SOURCE_TYPE_MAP: Record<SourceQueueType, FinanceDictItem> = {
  project_payment: {
    label: 'Thu tiền hợp đồng dự án',
    shortLabel: 'Thu dự án',
    variant: 'success',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  warehouse_receipt: {
    label: 'Phiếu nhập / xuất kho vật tư',
    shortLabel: 'Phiếu kho',
    variant: 'info',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  glass_order: {
    label: 'Đơn đặt kính nhà máy',
    shortLabel: 'Đơn kính',
    variant: 'warning',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  payroll: {
    label: 'Bảng lương & Chấm công',
    shortLabel: 'Bảng lương',
    variant: 'primary',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  },
};

export const SOURCE_TYPE_OPTIONS: Array<{ value: SourceQueueType; label: string }> = [
  { value: 'project_payment', label: SOURCE_TYPE_MAP.project_payment.label },
  { value: 'warehouse_receipt', label: SOURCE_TYPE_MAP.warehouse_receipt.label },
  { value: 'glass_order', label: SOURCE_TYPE_MAP.glass_order.label },
  { value: 'payroll', label: SOURCE_TYPE_MAP.payroll.label },
];

export interface VietnamBankMeta {
  code: string;
  shortName: string;
  fullName: string;
}

export const VIETNAM_BANKS: VietnamBankMeta[] = [
  { code: 'VCB', shortName: 'Vietcombank', fullName: 'Ngân hàng TMCP Ngoại thương Việt Nam' },
  { code: 'MB', shortName: 'MBBank', fullName: 'Ngân hàng TMCP Quân đội' },
  { code: 'TCB', shortName: 'Techcombank', fullName: 'Ngân hàng TMCP Kỹ thương Việt Nam' },
  { code: 'ACB', shortName: 'ACB', fullName: 'Ngân hàng TMCP Á Châu' },
  { code: 'BIDV', shortName: 'BIDV', fullName: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam' },
  { code: 'CTG', shortName: 'VietinBank', fullName: 'Ngân hàng TMCP Công thương Việt Nam' },
  { code: 'STB', shortName: 'Sacombank', fullName: 'Ngân hàng TMCP Sài Gòn Thương Tín' },
  { code: 'VPB', shortName: 'VPBank', fullName: 'Ngân hàng TMCP Việt Nam Thịnh Vượng' },
  { code: 'TPB', shortName: 'TPBank', fullName: 'Ngân hàng TMCP Tiên Phong' },
  { code: 'HDB', shortName: 'HDBank', fullName: 'Ngân hàng TMCP Phát triển TP. Hồ Chí Minh' },
];

export interface FinanceTabMeta {
  id: FinanceTabKey;
  sectionId: string;
  label: string;
  shortLabel: string;
  description: string;
  iconKey: string;
}

export const FINANCE_TABS_META: FinanceTabMeta[] = [
  {
    id: 'overview',
    sectionId: 'finance-overview',
    label: 'Tổng quan tài chính',
    shortLabel: 'Tổng quan',
    description: 'Số dư Quỹ tiền mặt TK 1111, ngân hàng, kết quả kinh doanh và dự toán thuế TNDN.',
    iconKey: 'LayoutDashboard',
  },
  {
    id: 'cash',
    sectionId: 'finance-cash',
    label: 'Quỹ tiền mặt (TK 1111)',
    shortLabel: 'Tiền mặt',
    description: 'Phiếu thu/chi tiền mặt và Sổ quỹ S07-DN duy nhất theo TK 1111.',
    iconKey: 'Wallet',
  },
  {
    id: 'bank',
    sectionId: 'finance-bank',
    label: 'Ngân hàng',
    shortLabel: 'Ngân hàng',
    description: 'Tài khoản ngân hàng công ty, ủy nhiệm chi, báo có và đối chiếu sổ phụ.',
    iconKey: 'Building2',
  },
  {
    id: 'ar_ap',
    sectionId: 'finance-ar-ap',
    label: 'Công nợ & Hàng chờ',
    shortLabel: 'Công nợ',
    description: 'Tuổi nợ phải thu/phải trả và hàng chờ hạch toán bán tự động từ Dự án/Kho.',
    iconKey: 'ArrowLeftRight',
  },
  {
    id: 'gl_closing',
    sectionId: 'finance-gl',
    label: 'Tổng hợp & Khóa sổ',
    shortLabel: 'Tổng hợp',
    description: 'Chứng từ nghiệp vụ khác, Sổ cái S03b-DN, số dư đầu kỳ, kết chuyển 911 và khóa kỳ.',
    iconKey: 'BookOpenCheck',
  },
  {
    id: 'tax',
    sectionId: 'finance-tax',
    label: 'Thuế & Hóa đơn ĐT',
    shortLabel: 'Thuế & HĐĐT',
    description: 'Đọc XML hóa đơn điện tử, bảng kê GTGT đầu vào/ra và chi phí loại trừ B4 / TNDN.',
    iconKey: 'FileSpreadsheet',
  },
  {
    id: 'reports',
    sectionId: 'finance-reports',
    label: 'Báo cáo tài chính',
    shortLabel: 'Báo cáo',
    description: 'Bảng cân đối phát sinh, Sổ cái, lãi/lỗ công trình và lưu chuyển dòng tiền.',
    iconKey: 'BarChart3',
  },
  {
    id: 'statutory_tax',
    sectionId: 'finance-statutory-tax',
    label: 'BCTC & Kê khai Thuế',
    shortLabel: 'BCTC & Thuế',
    description: 'Tờ khai 01/GTGT (TT80/TT89), 05/KK-TNCN, BCTC chuẩn TT99/2025, đối chiếu chéo & kết xuất.',
    iconKey: 'Landmark',
  },
  {
    id: 'settings',
    sectionId: 'finance-settings',
    label: 'Thiết lập kế toán',
    shortLabel: 'Thiết lập',
    description: 'Thông tư 99/133, hệ thống tài khoản, khoản mục chi phí và mẫu định khoản nhanh.',
    iconKey: 'Settings',
  },
];

// =========================================================================
// BATCH 1A DICTIONARIES (CONTROLS, CASH COUNT & OVERHEAD ALLOCATION)
// =========================================================================
export const OVERHEAD_ALLOCATION_BASIS_MAP: Record<OverheadAllocationBasis, FinanceDictItem> = {
  direct_cost_621_622: {
    label: 'Theo tổng chi phí trực tiếp (621 + 622)',
    shortLabel: 'NVL + Nhân công (621+622)',
    variant: 'primary',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  },
  material_621: {
    label: 'Theo chi phí nguyên vật liệu trực tiếp (TK 621)',
    shortLabel: 'NVL trực tiếp (621)',
    variant: 'info',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  labor_622: {
    label: 'Theo chi phí nhân công trực tiếp (TK 622)',
    shortLabel: 'Nhân công (622)',
    variant: 'warning',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

export const OVERHEAD_ALLOCATION_BASIS_OPTIONS: Array<{
  value: OverheadAllocationBasis;
  label: string;
}> = [
  { value: 'direct_cost_621_622', label: OVERHEAD_ALLOCATION_BASIS_MAP.direct_cost_621_622.label },
  { value: 'material_621', label: OVERHEAD_ALLOCATION_BASIS_MAP.material_621.label },
  { value: 'labor_622', label: OVERHEAD_ALLOCATION_BASIS_MAP.labor_622.label },
];

export const CASH_COUNT_STATUS_MAP: Record<CashCountStatus, FinanceDictItem> = {
  draft: {
    label: 'Bản nháp',
    shortLabel: 'Nháp',
    variant: 'default',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  confirmed: {
    label: 'Đã xác nhận',
    shortLabel: 'Đã xác nhận',
    variant: 'success',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  voided: {
    label: 'Đã hủy',
    shortLabel: 'Đã hủy',
    variant: 'danger',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export const CASH_COUNT_STATUS_OPTIONS: Array<{ value: CashCountStatus; label: string }> = [
  { value: 'draft', label: CASH_COUNT_STATUS_MAP.draft.label },
  { value: 'confirmed', label: CASH_COUNT_STATUS_MAP.confirmed.label },
  { value: 'voided', label: CASH_COUNT_STATUS_MAP.voided.label },
];

export const VN_BANKNOTE_DENOMINATIONS: number[] = [
  500_000,
  200_000,
  100_000,
  50_000,
  20_000,
  10_000,
  5_000,
  2_000,
  1_000,
  500,
];

export const FINANCE_AUDIT_ACTION_MAP: Record<string, FinanceDictItem> = {
  unpost: {
    label: 'Bỏ ghi sổ chứng từ',
    shortLabel: 'Bỏ ghi sổ',
    variant: 'warning',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  period_unlock: {
    label: 'Mở khóa kỳ kế toán',
    shortLabel: 'Mở khóa kỳ',
    variant: 'warning',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  tax_filed_lock: {
    label: 'Khóa cứng nộp tờ khai thuế',
    shortLabel: 'Khóa cứng thuế',
    variant: 'danger',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  permission_change: {
    label: 'Phân quyền tài chính',
    shortLabel: 'Phân quyền',
    variant: 'info',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  allocation_basis_change: {
    label: 'Đổi tiêu thức phân bổ 627',
    shortLabel: 'Đổi tiêu thức 627',
    variant: 'primary',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  },
};

export const FINANCE_AUDIT_ENTITY_MAP: Record<string, string> = {
  voucher: 'Chứng từ',
  period_lock: 'Kỳ kế toán',
  finance_setting: 'Phân quyền & Thiết lập',
  fiscal_year_config: 'Cấu hình năm tài chính',
};

export const FINANCE_AUDIT_ACTION_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'unpost', label: 'Bỏ ghi sổ chứng từ' },
  { value: 'period_unlock', label: 'Mở khóa kỳ kế toán' },
  { value: 'tax_filed_lock', label: 'Khóa cứng nộp tờ khai thuế' },
  { value: 'permission_change', label: 'Phân quyền tài chính' },
  { value: 'allocation_basis_change', label: 'Đổi tiêu thức phân bổ 627' },
];

export const FINANCE_AUDIT_ENTITY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'voucher', label: 'Chứng từ' },
  { value: 'period_lock', label: 'Kỳ kế toán' },
  { value: 'fiscal_year_config', label: 'Cấu hình năm tài chính' },
  { value: 'finance_setting', label: 'Phân quyền & Thiết lập' },
];

export const PROJECT_PNL_METRIC_MAP: Record<ProjectPnlDrilldownMetric, FinanceDictItem> = {
  revenue: {
    label: 'Doanh thu công trình',
    shortLabel: 'Doanh thu',
    description: 'Các bút toán doanh thu (TK 511, 515, 711 trừ 521) đã ghi sổ',
    variant: 'primary',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  },
  direct_material: {
    label: 'Chi phí nguyên vật liệu trực tiếp',
    shortLabel: 'NVL trực tiếp',
    description: 'Chi phí NVL trực tiếp (TK 621 / 154 hoặc nhóm NVL TT)',
    variant: 'info',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  direct_labor: {
    label: 'Chi phí nhân công trực tiếp',
    shortLabel: 'Nhân công',
    description: 'Chi phí nhân công trực tiếp (TK 622 hoặc nhóm Nhân công)',
    variant: 'info',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  factory_overhead: {
    label: 'Chi phí sản xuất chung',
    shortLabel: 'SX chung',
    description: 'Chi phí máy thi công, sản xuất chung & phân bổ (TK 623, 627)',
    variant: 'warning',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  subcontract: {
    label: 'Chi phí thuê ngoài / gia công',
    shortLabel: 'Thuê ngoài',
    description: 'Chi phí nhà thầu phụ, gia công ngoài gắn khoản mục Thuê ngoài',
    variant: 'default',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  total_cost: {
    label: 'Tổng chi phí công trình',
    shortLabel: 'Tổng CP',
    description: 'Toàn bộ chi phí trực tiếp, sản xuất chung, thuê ngoài và chi phí khác',
    variant: 'danger',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  non_deductible_cost: {
    label: 'Chi phí không được trừ (Chỉ tiêu B4)',
    shortLabel: 'Không được trừ (B4)',
    description: 'Các bút toán chi phí thiếu hóa đơn hợp lệ / loại trừ thuế TNDN',
    variant: 'warning',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  collected: {
    label: 'Tiền đã thu theo hợp đồng',
    shortLabel: 'Đã thu',
    description: 'Tổng hợp các giao dịch thu tiền / hoàn tiền lũy kế của công trình',
    variant: 'success',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

export const PROJECT_PNL_COST_BUCKET_LABELS: Record<string, string> = {
  direct_material: 'NVL trực tiếp',
  direct_labor: 'Nhân công',
  factory_overhead: 'SX chung',
  subcontract: 'Thuê ngoài',
  other_expense: 'Chi phí khác',
};

// =========================================================================
// PHASE 1 STATUTORY & TT99/2025 DICTIONARIES
// =========================================================================
export const CASHFLOW_CODE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '01', label: '01 - Thu tiền bán hàng, cung cấp dịch vụ & DT khác' },
  { value: '02', label: '02 - Chi trả cho người cung cấp hàng hóa & dịch vụ' },
  { value: '03', label: '03 - Chi trả cho người lao động' },
  { value: '04', label: '04 - Tiền lãi vay đã trả' },
  { value: '05', label: '05 - Thuế TNDN đã nộp' },
  { value: '06', label: '06 - Tiền thu khác từ hoạt động kinh doanh' },
  { value: '07', label: '07 - Tiền chi khác cho hoạt động kinh doanh' },
  { value: '21', label: '21 - Chi mua sắm, xây dựng TSCĐ & TS dài hạn khác' },
  { value: '22', label: '22 - Thu thanh lý, nhượng bán TSCĐ & TS dài hạn khác' },
  { value: '23', label: '23 - Chi cho vay, mua công cụ nợ của đơn vị khác' },
  { value: '24', label: '24 - Thu hồi cho vay, bán lại công cụ nợ' },
  { value: '25', label: '25 - Chi đầu tư góp vốn vào đơn vị khác' },
  { value: '26', label: '26 - Thu hồi đầu tư góp vốn vào đơn vị khác' },
  { value: '27', label: '27 - Thu lãi cho vay, cổ tức và lợi nhuận được chia' },
  { value: '31', label: '31 - Thu phát hành cổ phiếu, nhận vốn góp CSH' },
  { value: '32', label: '32 - Tiền trả lại vốn góp cho CSH, mua lại cổ phiếu' },
  { value: '33', label: '33 - Tiền thu từ đi vay' },
  { value: '34', label: '34 - Tiền trả nợ gốc vay' },
  { value: '35', label: '35 - Tiền trả nợ gốc thuê tài chính' },
  { value: '36', label: '36 - Cổ tức, lợi nhuận đã trả cho chủ sở hữu' },
  { value: '61', label: '61 - Ảnh hưởng thay đổi tỷ giá hối đoái quy đổi ngoại tệ' },
];

export const MATURITY_TERM_OPTIONS: Array<{ value: MaturityTerm; label: string }> = [
  { value: 'short_term', label: 'Ngắn hạn (≤ 12 tháng)' },
  { value: 'long_term', label: 'Dài hạn (> 12 tháng)' },
];

export const VAT_RETURN_INDICATOR_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Tự động theo thuế suất (Chuẩn)' },
  { value: '23a', label: '[23a] Hàng hóa, dịch vụ nhập khẩu' },
  { value: '26', label: '[26] HHDV bán ra không chịu thuế GTGT' },
  { value: '32a', label: '[32a] HHDV bán ra không tính nộp thuế' },
  { value: '32b', label: '[32b] Doanh thu không tính vào giá tính thuế' },
  { value: '34a', label: '[34a] Doanh thu ngoài phạm vi kê khai' },
];

export const FILING_FREQUENCY_OPTIONS: Array<{ value: FilingFrequency; label: string }> = [
  { value: 'quarterly', label: 'Kê khai theo Quý' },
  { value: 'monthly', label: 'Kê khai theo Tháng' },
];

export const PIT_CONTRACT_CATEGORY_MAP: Record<PitContractCategory, FinanceDictItem> = {
  resident_gte_3m: {
    label: 'Cư trú — HĐLĐ ≥ 3 tháng (Biểu lũy tiến)',
    shortLabel: 'HĐLĐ ≥ 3 tháng',
    variant: 'primary',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  },
  resident_lt_3m_or_non_contract: {
    label: 'Cư trú — Không HĐ / < 3 tháng (Khấu trừ 10%)',
    shortLabel: 'Vãng lai 10%',
    variant: 'warning',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  non_resident: {
    label: 'Cá nhân không cư trú (Khấu trừ 20%)',
    shortLabel: 'Không cư trú 20%',
    variant: 'info',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
};

// =========================================================================
// PHASE 2 STATUTORY FILINGS & RECONCILIATION DICTIONARIES
// =========================================================================
export const STATUTORY_FILING_STATUS_MAP: Record<StatutoryFilingStatus, FinanceDictItem> = {
  not_started: {
    label: 'Chưa lập',
    shortLabel: 'Chưa lập',
    variant: 'default',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  draft: {
    label: 'Bản nháp',
    shortLabel: 'Nháp',
    variant: 'info',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  reconciled: {
    label: 'Đã đối chiếu',
    shortLabel: 'Đã đối chiếu',
    variant: 'primary',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  },
  approved: {
    label: 'Đã duyệt',
    shortLabel: 'Đã duyệt',
    variant: 'success',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  exported: {
    label: 'Đã xuất hồ sơ',
    shortLabel: 'Đã xuất',
    variant: 'success',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  stale: {
    label: 'Lỗi thời (Sổ cái thay đổi)',
    shortLabel: 'Lỗi thời',
    variant: 'warning',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  filed: {
    label: 'Đã nộp CQT',
    shortLabel: 'Đã nộp',
    variant: 'success',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
};

export const STATUTORY_FORM_META_MAP: Record<
  StatutoryFormCode,
  { title: string; shortTitle: string; category: 'tax' | 'bctc'; periodKind: 'tax_period' | 'annual' }
> = {
  '01_GTGT': {
    title: 'Tờ khai Thuế GTGT khấu trừ (Mẫu 01/GTGT)',
    shortTitle: '01/GTGT',
    category: 'tax',
    periodKind: 'tax_period',
  },
  '05_KK_TNCN': {
    title: 'Tờ khai Khấu trừ Thuế TNCN (Mẫu 05/KK-TNCN)',
    shortTitle: '05/KK-TNCN',
    category: 'tax',
    periodKind: 'tax_period',
  },
  B01_DN: {
    title: 'Báo cáo Tình hình tài chính (Mẫu B01-DN)',
    shortTitle: 'B01-DN',
    category: 'bctc',
    periodKind: 'annual',
  },
  B02_DN: {
    title: 'Báo cáo Kết quả hoạt động kinh doanh (Mẫu B02-DN)',
    shortTitle: 'B02-DN',
    category: 'bctc',
    periodKind: 'annual',
  },
  B03_DN: {
    title: 'Báo cáo Lưu chuyển tiền tệ (Mẫu B03-DN)',
    shortTitle: 'B03-DN',
    category: 'bctc',
    periodKind: 'annual',
  },
  B09_DN: {
    title: 'Thuyết minh Báo cáo tài chính (Mẫu B09-DN)',
    shortTitle: 'B09-DN',
    category: 'bctc',
    periodKind: 'annual',
  },
  CDTK: {
    title: 'Bảng Cân đối Tài khoản (Mẫu S06-DN)',
    shortTitle: 'CĐTK',
    category: 'bctc',
    periodKind: 'annual',
  },
  '03_TNDN': {
    title: 'Tờ khai Quyết toán Thuế TNDN (Mẫu 03/TNDN)',
    shortTitle: '03/TNDN',
    category: 'tax',
    periodKind: 'annual',
  },
};

export const RECONCILIATION_STATUS_MAP: Record<ReconciliationStatus, FinanceDictItem> = {
  passed: {
    label: 'Khớp 100%',
    shortLabel: 'Khớp',
    variant: 'success',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  failed: {
    label: 'Lệch số liệu',
    shortLabel: 'Lệch',
    variant: 'danger',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  pending: {
    label: 'Chưa kiểm tra',
    shortLabel: 'Chờ KT',
    variant: 'default',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};
