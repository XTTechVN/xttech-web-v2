import {
  ArrowLeftRight,
  Building2,
  Link2,
  RefreshCw,
  Send,
  ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  Account,
  ComparativeBaselineFormCode,
  MaturityTerm,
  OpeningBalanceEntry,
  ParsedEinvoiceXml,
  TaxInvoice,
  TaxInvoiceDirection,
  VatRate,
} from '@/types';

export interface JetpayFeatureCardMeta {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  etaBadge: string;
}

export const JETPAY_FEATURE_CARDS: JetpayFeatureCardMeta[] = [
  {
    id: 'connect',
    title: 'Kết nối ngân hàng trực tiếp (Open Banking API)',
    description:
      'Ủy quyền kết nối an toàn chuẩn OAuth2 / Token ngân hàng doanh nghiệp mà không cần xuất file Excel thủ công.',
    icon: Link2,
    etaBadge: 'Giai đoạn 2',
  },
  {
    id: 'sync',
    title: 'Đồng bộ sao kê tự động 24/7',
    description:
      'Tự động lấy giao dịch Báo Có / Báo Nợ theo thời gian thực và gợi ý đối khớp khách hàng 131 / NCC 331.',
    icon: RefreshCw,
    etaBadge: 'Đang phát triển',
  },
  {
    id: 'transfer',
    title: 'Chuyển tiền & Ký duyệt Ủy nhiệm chi trực tuyến',
    description:
      'Lập lệnh chuyển tiền hàng loạt từ phiếu chi ngân hàng đã duyệt, Giám đốc ký duyệt OTP ngay trên ERP.',
    icon: Send,
    etaBadge: 'Sắp ra mắt',
  },
];

export const JETPAY_SECURITY_ITEMS: Array<{ label: string; icon: LucideIcon }> = [
  { label: 'Mã hóa TLS 1.3 & Token tách lớp', icon: ShieldCheck },
  { label: 'Đối soát Sổ Tài chính & Hóa đơn tự động', icon: ArrowLeftRight },
  { label: 'Hỗ trợ 10+ ngân hàng thương mại VN', icon: Building2 },
];

export const FISCAL_MONTH_OPTIONS: Array<{ value: number; label: string }> = Array.from(
  { length: 12 },
  (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }),
);

export interface OpeningDraftRow {
  rowKey: string;
  accountId: number;
  accountCode: string;
  accountName: string;
  debitBalance: number;
  creditBalance: number;
  bankAccountId: number | null;
  customerId: number | null;
  supplierId: number | null;
  employeeId: string | null;
  projectId: number | null;
  maturityTerm: MaturityTerm | null;
  note: string;
}

let obRowKeyCounter = 0;
export const nextOpeningRowKey = (): string => `ob-${++obRowKeyCounter}`;

export function buildInitialOpeningRows(
  initialEntries: OpeningBalanceEntry[],
  postableBsAccounts: Account[],
): OpeningDraftRow[] {
  const existingRows: OpeningDraftRow[] = initialEntries.map((entry) => ({
    rowKey: nextOpeningRowKey(),
    accountId: entry.accountId,
    accountCode: entry.accountCode,
    accountName: entry.accountName,
    debitBalance: entry.debitBalance,
    creditBalance: entry.creditBalance,
    bankAccountId: entry.bankAccountId ?? null,
    customerId: entry.customerId ?? null,
    supplierId: entry.supplierId ?? null,
    employeeId: entry.employeeId ?? null,
    projectId: entry.projectId ?? null,
    maturityTerm: entry.maturityTerm ?? null,
    note: entry.note || '',
  }));

  const existingIds = new Set(existingRows.map((r) => r.accountId));
  const missingSeeded: OpeningDraftRow[] = postableBsAccounts
    .filter((a) => !existingIds.has(a.id))
    .slice(0, 20)
    .map((a) => ({
      rowKey: nextOpeningRowKey(),
      accountId: a.id,
      accountCode: a.accountCode,
      accountName: a.name,
      debitBalance: 0,
      creditBalance: 0,
      bankAccountId: null,
      customerId: null,
      supplierId: null,
      employeeId: null,
      projectId: null,
      maturityTerm: null,
      note: '',
    }));

  return [...existingRows, ...missingSeeded].sort((a, b) =>
    a.accountCode.localeCompare(b.accountCode),
  );
}

export const COMPARATIVE_BASELINE_FORM_OPTIONS: Array<{
  value: ComparativeBaselineFormCode;
  label: string;
}> = [
  { value: 'B01_DN', label: 'B01-DN — Báo cáo Tình hình tài chính (CĐKT)' },
  { value: 'B02_DN', label: 'B02-DN — Báo cáo Kết quả hoạt động kinh doanh' },
  { value: 'B03_DN', label: 'B03-DN — Báo cáo Lưu chuyển tiền tệ' },
];

export const COMPARATIVE_BASELINE_PRESETS: Record<
  ComparativeBaselineFormCode,
  Array<{ indicatorCode: string; label: string }>
> = {
  B01_DN: [
    { indicatorCode: '100', label: 'A. TÀI SẢN NGẮN HẠN' },
    { indicatorCode: '110', label: 'I. Tiền và các khoản tương đương tiền' },
    { indicatorCode: '130', label: 'III. Các khoản phải thu ngắn hạn' },
    { indicatorCode: '140', label: 'IV. Hàng tồn kho' },
    { indicatorCode: '150', label: 'V. Tài sản ngắn hạn khác' },
    { indicatorCode: '200', label: 'B. TÀI SẢN DÀI HẠN' },
    { indicatorCode: '220', label: 'II. Tài sản cố định' },
    { indicatorCode: '270', label: 'TỔNG CỘNG TÀI SẢN' },
    { indicatorCode: '300', label: 'C. NỢ PHẢI TRẢ' },
    { indicatorCode: '310', label: 'I. Nợ ngắn hạn' },
    { indicatorCode: '330', label: 'II. Nợ dài hạn' },
    { indicatorCode: '400', label: 'D. VỐN CHỦ SỞ HỮU' },
    { indicatorCode: '411', label: '1. Vốn góp của chủ sở hữu' },
    { indicatorCode: '421', label: '11. Lợi nhuận sau thuế chưa phân phối' },
    { indicatorCode: '440', label: 'TỔNG CỘNG NGUỒN VỐN' },
  ],
  B02_DN: [
    { indicatorCode: '01', label: '1. Doanh thu bán hàng và cung cấp dịch vụ' },
    { indicatorCode: '02', label: '2. Các khoản giảm trừ doanh thu' },
    { indicatorCode: '10', label: '3. Doanh thu thuần về bán hàng và CCDV' },
    { indicatorCode: '11', label: '4. Giá vốn hàng bán' },
    { indicatorCode: '20', label: '5. Lợi nhuận gộp về bán hàng và CCDV' },
    { indicatorCode: '21', label: '6. Doanh thu hoạt động tài chính' },
    { indicatorCode: '22', label: '7. Chi phí tài chính' },
    { indicatorCode: '25', label: '8. Chi phí bán hàng' },
    { indicatorCode: '26', label: '9. Chi phí quản lý doanh nghiệp' },
    { indicatorCode: '30', label: '10. Lợi nhuận thuần từ hoạt động kinh doanh' },
    { indicatorCode: '31', label: '11. Thu nhập khác' },
    { indicatorCode: '32', label: '12. Chi phí khác' },
    { indicatorCode: '40', label: '13. Lợi nhuận khác' },
    { indicatorCode: '50', label: '14. Tổng lợi nhuận kế toán trước thuế' },
    { indicatorCode: '51', label: '15. Chi phí thuế TNDN hiện hành' },
    { indicatorCode: '60', label: '17. Lợi nhuận sau thuế TNDN' },
  ],
  B03_DN: [
    { indicatorCode: '01', label: '1. Tiền thu từ bán hàng, CCDV và doanh thu khác' },
    { indicatorCode: '02', label: '2. Tiền chi trả cho người cung cấp hàng hóa, dịch vụ' },
    { indicatorCode: '03', label: '3. Tiền chi trả cho người lao động' },
    { indicatorCode: '04', label: '4. Tiền lãi vay đã trả' },
    { indicatorCode: '05', label: '5. Thuế thu nhập doanh nghiệp đã nộp' },
    { indicatorCode: '06', label: '6. Tiền thu khác từ hoạt động kinh doanh' },
    { indicatorCode: '07', label: '7. Tiền chi khác cho hoạt động kinh doanh' },
    { indicatorCode: '20', label: 'Lưu chuyển tiền thuần từ hoạt động kinh doanh' },
    { indicatorCode: '30', label: 'Lưu chuyển tiền thuần từ hoạt động đầu tư' },
    { indicatorCode: '40', label: 'Lưu chuyển tiền thuần từ hoạt động tài chính' },
    { indicatorCode: '50', label: 'Lưu chuyển tiền thuần trong kỳ' },
    { indicatorCode: '60', label: 'Tiền và tương đương tiền đầu kỳ' },
    { indicatorCode: '70', label: 'Tiền và tương đương tiền cuối kỳ' },
  ],
};

export interface TaxInvoiceFormState {
  direction: TaxInvoiceDirection;
  templateCode: string;
  series: string;
  invoiceNumber: string;
  invoiceDate: string;
  partnerTaxCode: string;
  partnerName: string;
  partnerAddress: string;
  customerId: number | null;
  supplierId: number | null;
  taxableAmount: number;
  vatRate: VatRate;
  vatAmount: number;
  totalAmount: number;
  isTaxDeductible: boolean;
  xmlFileUrl: string | null;
  xmlRawMeta: Record<string, unknown> | null;
  isDuplicateXml: boolean;
}

export function createInitialTaxInvoiceState(params: {
  initialData?: TaxInvoice | null;
  prefillXml?: ParsedEinvoiceXml | null;
  defaultDirection: TaxInvoiceDirection;
  today: string;
}): TaxInvoiceFormState {
  const { initialData, prefillXml, defaultDirection, today } = params;
  return {
    direction: initialData?.direction || prefillXml?.direction || defaultDirection,
    templateCode: initialData?.invoiceTemplateCode || prefillXml?.invoiceTemplateCode || '1',
    series: initialData?.invoiceSeries || prefillXml?.invoiceSeries || '',
    invoiceNumber: initialData?.invoiceNumber || prefillXml?.invoiceNumber || '',
    invoiceDate: initialData?.invoiceDate || prefillXml?.invoiceDate || today,
    partnerTaxCode:
      initialData?.partnerTaxCode ||
      prefillXml?.partnerTaxCode ||
      prefillXml?.xmlRawMeta?.sellerTaxCode ||
      '',
    partnerName:
      initialData?.partnerName ||
      prefillXml?.partnerName ||
      prefillXml?.xmlRawMeta?.sellerName ||
      '',
    partnerAddress:
      initialData?.partnerAddress ||
      prefillXml?.partnerAddress ||
      prefillXml?.xmlRawMeta?.sellerAddress ||
      '',
    customerId: initialData?.customerId ?? prefillXml?.suggestedCustomerId ?? null,
    supplierId: initialData?.supplierId ?? prefillXml?.suggestedSupplierId ?? null,
    taxableAmount: initialData?.taxableAmount ?? prefillXml?.taxableAmount ?? 0,
    vatRate: initialData?.vatRate || prefillXml?.vatRate || '10',
    vatAmount: initialData?.vatAmount ?? prefillXml?.vatAmount ?? 0,
    totalAmount: initialData?.totalAmount ?? prefillXml?.totalAmount ?? 0,
    isTaxDeductible: initialData?.isTaxDeductible ?? true,
    xmlFileUrl: initialData?.xmlFileUrl || prefillXml?.xmlFileUrl || null,
    xmlRawMeta: initialData?.xmlRawMeta ?? prefillXml?.xmlRawMeta ?? null,
    isDuplicateXml: Boolean(prefillXml?.isDuplicate),
  };
}
