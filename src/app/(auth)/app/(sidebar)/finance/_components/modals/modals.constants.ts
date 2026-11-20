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
  projectId: number | null;
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
    projectId: entry.projectId ?? null,
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
      projectId: null,
      note: '',
    }));

  return [...existingRows, ...missingSeeded].sort((a, b) =>
    a.accountCode.localeCompare(b.accountCode),
  );
}

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
