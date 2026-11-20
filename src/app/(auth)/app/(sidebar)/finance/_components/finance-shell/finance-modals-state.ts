import type {
  Account,
  AccountingRegime,
  AutoPostingTemplate,
  BankAccount,
  CostItem,
  ParsedEinvoiceXml,
  TaxInvoice,
  TaxInvoiceDirection,
  VoucherDetail,
  VoucherSummary,
  VoucherType,
} from '@/types';
import type { VoucherEditorMode } from '../voucher-editor';

export interface VoucherModalState {
  isOpen: boolean;
  voucherId?: number | null;
  initialData?: VoucherDetail | null;
  defaultMode?: VoucherEditorMode;
  defaultVoucherType?: VoucherType;
  defaultBankAccountId?: number | null;
  defaultHasValidInvoice?: boolean;
}

export interface JetpayModalState {
  isOpen: boolean;
  actionTitle?: string;
  bankAccount?: BankAccount | null;
}

export interface TaxInvoiceModalState {
  isOpen: boolean;
  initialData?: TaxInvoice | null;
  defaultDirection?: TaxInvoiceDirection;
  defaultVoucherId?: number | null;
  prefillXml?: ParsedEinvoiceXml | null;
}

export interface FinanceModalsState {
  voucherForm: VoucherModalState;
  detailVoucherId: number | null;
  voidVoucher: VoucherSummary | VoucherDetail | null;
  accountModal: {
    isOpen: boolean;
    initialData?: Account | null;
    defaultParentId?: number | null;
  };
  bankAccountModal: { isOpen: boolean; initialData?: BankAccount | null };
  costItemModal: { isOpen: boolean; initialData?: CostItem | null };
  autoPostingModal: {
    isOpen: boolean;
    initialData?: AutoPostingTemplate | null;
    defaultRegime?: AccountingRegime;
  };
  openingBalanceModal: {
    isOpen: boolean;
    mountKey: number;
  };
  taxInvoiceModal: TaxInvoiceModalState;
  jetpayModal: JetpayModalState;
}
