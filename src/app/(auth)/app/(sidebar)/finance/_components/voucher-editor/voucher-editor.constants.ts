import {
  Calculator,
  FileCode2,
  ListChecks,
  Paperclip,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  Account,
  AutoPostingTemplate,
  BankAccount,
  CostItem,
  Customer,
  Department,
  Employee,
  FinanceSetting,
  PartnerType,
  Project,
  VoucherLine,
  VoucherLineInput,
  VoucherLineKind,
  VoucherType,
  WarehouseItem,
  WarehouseSupplier,
} from '@/types';

export type VoucherEditorMode = 'workshop' | 'accountant';
export type VoucherEditorTabKey = 'lines' | 'invoice' | 'attachments';

export interface VoucherDraftLine {
  tempId: string;
  lineKind: VoucherLineKind;
  description: string;
  debitAccountId: number;
  creditAccountId: number;
  amount: number;
  debitBankAccountId: number | null;
  creditBankAccountId: number | null;
  projectId: number | null;
  departmentId: number | null;
  costItemId: number | null;
  customerId: number | null;
  supplierId: number | null;
  warehouseItemId: number | null;
  employeeId: string | null;
  quantity: number | null;
  unit: string | null;
  unitPrice: number | null;
  isTaxDeductible: boolean;
}

export interface VoucherMasterLookups {
  setting: FinanceSetting | null;
  accounts: Account[];
  bankAccounts: BankAccount[];
  costItems: CostItem[];
  templates: AutoPostingTemplate[];
  projects: Project[];
  departments: Department[];
  customers: Customer[];
  suppliers: WarehouseSupplier[];
  employees: Employee[];
  warehouseItems: WarehouseItem[];
}

export interface EditorModeMeta {
  value: VoucherEditorMode;
  label: string;
  subtitle: string;
  icon: LucideIcon;
}

export const VOUCHER_EDITOR_MODES: EditorModeMeta[] = [
  {
    value: 'workshop',
    label: 'Chế độ Xưởng (Nhanh & Gọn)',
    subtitle: 'Quỹ TK 1111 duy nhất — Chọn lý do, công trình & số tiền',
    icon: Wrench,
  },
  {
    value: 'accountant',
    label: 'Chế độ Kế toán (Đầy đủ MISA ASP)',
    subtitle: 'Định khoản Nợ/Có đa dòng, Hóa đơn GTGT & Phân loại B4 TNDN',
    icon: Calculator,
  },
];

export interface EditorTabMeta {
  value: VoucherEditorTabKey;
  label: string;
  icon: LucideIcon;
}

export const VOUCHER_EDITOR_TABS: EditorTabMeta[] = [
  { value: 'lines', label: '1. Hạch toán', icon: ListChecks },
  { value: 'invoice', label: '2. Hóa đơn & Thuế GTGT', icon: FileCode2 },
  { value: 'attachments', label: '3. Chứng từ đính kèm', icon: Paperclip },
];

export const VOUCHER_FORM_TYPES: Array<{ value: VoucherType; label: string }> = [
  { value: 'cash_payment', label: 'Phiếu chi tiền mặt (PC - TK 1111)' },
  { value: 'cash_receipt', label: 'Phiếu thu tiền mặt (PT - TK 1111)' },
  { value: 'bank_payment', label: 'Chi tiền gửi / Ủy nhiệm chi (UNC)' },
  { value: 'bank_receipt', label: 'Thu tiền gửi / Báo Có NH (BC)' },
  { value: 'general_journal', label: 'Chứng từ nghiệp vụ khác (PKT)' },
];

export const WORKSHOP_VOUCHER_TYPES: Array<{ value: VoucherType; label: string }> = [
  { value: 'cash_payment', label: 'Chi tiền mặt tại Quỹ (TK 1111)' },
  { value: 'cash_receipt', label: 'Thu tiền mặt tại Quỹ (TK 1111)' },
];

export const DEFAULT_NON_CASH_VAT_THRESHOLD = 5_000_000;

export const isCashGlCode = (code?: string | null): boolean =>
  Boolean(code && code.trim().startsWith('111'));

export const isBankGlCode = (code?: string | null): boolean =>
  Boolean(code && code.trim().startsWith('112'));

export const isVatInputGlCode = (code?: string | null): boolean =>
  Boolean(code && code.trim().startsWith('133'));

export const isVatGlCode = (code?: string | null): boolean =>
  Boolean(code && (code.trim().startsWith('133') || code.trim().startsWith('3331')));

const PROJECT_OR_OPERATING_COST_PREFIXES = ['621', '622', '623', '627', '154', '641', '642'];
const ARCH_FIX6_CREDIT_PREFIXES = ['214', '242', '333', '334', '335', '338'];
const SETTLEMENT_DEBIT_PREFIXES = ['111', '112', '141', '331', '333', '334', '338'];
const INVENTORY_ISSUE_CREDIT_PREFIXES = ['152', '153', '154', '155', '156'];

export const isProjectOrOperatingCostCode = (code?: string | null): boolean => {
  const normalized = code?.trim() || '';
  return PROJECT_OR_OPERATING_COST_PREFIXES.some((prefix) => normalized.startsWith(prefix));
};

export const isArchFix6ExemptPair = (
  debitCode?: string | null,
  creditCode?: string | null,
): boolean => {
  const d = debitCode?.trim() || '';
  const c = creditCode?.trim() || '';
  if (!d && !c) return false;
  if (d.startsWith('821')) return true;
  if (ARCH_FIX6_CREDIT_PREFIXES.some((prefix) => c.startsWith(prefix))) return true;
  if (SETTLEMENT_DEBIT_PREFIXES.some((prefix) => d.startsWith(prefix))) return true;
  if (INVENTORY_ISSUE_CREDIT_PREFIXES.some((prefix) => c.startsWith(prefix))) return true;
  return false;
};

export function inferLineTaxDeductible(params: {
  voucherType: VoucherType;
  hasValidInvoice: boolean;
  debitAccountCode?: string | null;
  creditAccountCode?: string | null;
  amount?: number;
  nonCashVatThreshold?: number;
}): boolean {
  const {
    voucherType,
    hasValidInvoice,
    debitAccountCode,
    creditAccountCode,
    amount = 0,
    nonCashVatThreshold = DEFAULT_NON_CASH_VAT_THRESHOLD,
  } = params;

  if (voucherType === 'cash_receipt' || voucherType === 'bank_receipt') {
    return true;
  }

  const d = debitAccountCode?.trim() || '';

  if (voucherType === 'general_journal') {
    if (isArchFix6ExemptPair(debitAccountCode, creditAccountCode)) {
      return true;
    }
    return hasValidInvoice;
  }

  // Luân chuyển nội bộ, tạm ứng, nộp thuế, trả lương không bị loại trừ B4 bởi hóa đơn mua hàng
  if (['111', '112', '141', '333', '334', '338'].some((p) => d.startsWith(p))) {
    return true;
  }

  if (voucherType === 'cash_payment' && amount >= nonCashVatThreshold) {
    return false;
  }

  return hasValidInvoice;
}

let lineCounter = 0;
export const nextTempLineId = (): string => {
  lineCounter += 1;
  return `vline-${Date.now()}-${lineCounter}`;
};

export const createEmptyDraftLine = (
  overrides: Partial<VoucherDraftLine> = {},
): VoucherDraftLine => ({
  tempId: nextTempLineId(),
  lineKind: 'principal',
  description: '',
  debitAccountId: 0,
  creditAccountId: 0,
  amount: 0,
  debitBankAccountId: null,
  creditBankAccountId: null,
  projectId: null,
  departmentId: null,
  costItemId: null,
  customerId: null,
  supplierId: null,
  warehouseItemId: null,
  employeeId: null,
  quantity: null,
  unit: null,
  unitPrice: null,
  isTaxDeductible: true,
  ...overrides,
});

export const mapVoucherLinesToDraft = (lines: VoucherLine[]): VoucherDraftLine[] =>
  lines.map((line) => ({
    tempId: `existing-${line.id}-${nextTempLineId()}`,
    lineKind: line.lineKind,
    description: line.description,
    debitAccountId: line.debitAccountId,
    creditAccountId: line.creditAccountId,
    amount: line.amount,
    debitBankAccountId: line.debitBankAccountId,
    creditBankAccountId: line.creditBankAccountId,
    projectId: line.projectId,
    departmentId: line.departmentId,
    costItemId: line.costItemId,
    customerId: line.customerId,
    supplierId: line.supplierId,
    warehouseItemId: line.warehouseItemId,
    employeeId: line.employeeId,
    quantity: line.quantity,
    unit: line.unit,
    unitPrice: line.unitPrice,
    isTaxDeductible: line.isTaxDeductible,
  }));

export const toVoucherLineInput = (
  line: VoucherDraftLine,
  index: number,
): VoucherLineInput => ({
  lineOrder: index + 1,
  lineKind: line.lineKind,
  description: line.description.trim(),
  debitAccountId: line.debitAccountId,
  creditAccountId: line.creditAccountId,
  amount: Math.round(line.amount),
  debitBankAccountId: line.debitBankAccountId || null,
  creditBankAccountId: line.creditBankAccountId || null,
  projectId: line.projectId || null,
  departmentId: line.departmentId || null,
  costItemId: line.costItemId || null,
  customerId: line.customerId || null,
  supplierId: line.supplierId || null,
  warehouseItemId: line.warehouseItemId || null,
  employeeId: line.employeeId || null,
  quantity: line.quantity,
  unit: line.unit,
  unitPrice: line.unitPrice,
  isTaxDeductible: line.isTaxDeductible,
});

export const computeDraftTotals = (
  lines: VoucherDraftLine[],
): { subtotal: number; vatTotal: number; grandTotal: number } => {
  let subtotal = 0;
  let vatTotal = 0;
  for (const line of lines) {
    const amt = Number.isFinite(line.amount) ? line.amount : 0;
    if (line.lineKind === 'vat') {
      vatTotal += amt;
    } else {
      subtotal += amt;
    }
  }
  return { subtotal, vatTotal, grandTotal: subtotal + vatTotal };
};

export interface WorkshopLineBuildInput {
  template: AutoPostingTemplate | null;
  voucherType: VoucherType;
  accounts: Account[];
  defaultCashAccountCode?: string;
  amount: number;
  description: string;
  projectId: number | null;
  partnerType: PartnerType | null;
  customerId: number | null;
  supplierId: number | null;
  employeeId: string | null;
  hasValidInvoice: boolean;
  nonCashVatThreshold: number;
}

export const buildWorkshopLineInput = (
  input: WorkshopLineBuildInput,
): VoucherLineInput | null => {
  const postable = input.accounts.filter((a) => a.isPostable && a.isActive);
  const cashCode = input.defaultCashAccountCode || '1111';
  const cashAccount =
    postable.find((a) => a.accountCode === cashCode) ||
    postable.find((a) => a.accountCode === '1111') ||
    postable.find((a) => isCashGlCode(a.accountCode));

  let debitAccountId = input.template?.debitAccountId || 0;
  let creditAccountId = input.template?.creditAccountId || 0;

  if (!debitAccountId || !creditAccountId) {
    if (!cashAccount) return null;
    if (input.voucherType === 'cash_receipt') {
      const counter =
        postable.find((a) => a.accountCode === '131') ||
        postable.find((a) => a.accountCode.startsWith('511')) ||
        postable.find((a) => a.id !== cashAccount.id);
      if (!counter) return null;
      debitAccountId = cashAccount.id;
      creditAccountId = counter.id;
    } else {
      const counter =
        postable.find((a) => a.accountCode.startsWith('642')) ||
        postable.find((a) => a.accountCode.startsWith('154')) ||
        postable.find((a) => a.accountCode.startsWith('627')) ||
        postable.find((a) => a.id !== cashAccount.id);
      if (!counter) return null;
      debitAccountId = counter.id;
      creditAccountId = cashAccount.id;
    }
  }

  const debitAcc = input.accounts.find((a) => a.id === debitAccountId);
  const creditAcc = input.accounts.find((a) => a.id === creditAccountId);

  return {
    lineOrder: 1,
    lineKind: 'principal',
    description: input.description.trim() || input.template?.name || 'Giao dịch quỹ tiền mặt TK 1111',
    debitAccountId,
    creditAccountId,
    amount: Math.round(input.amount),
    projectId: input.projectId || null,
    costItemId: input.template?.defaultCostItemId || null,
    customerId: input.partnerType === 'customer' ? input.customerId : null,
    supplierId: input.partnerType === 'supplier' ? input.supplierId : null,
    employeeId: input.partnerType === 'employee' ? input.employeeId : null,
    isTaxDeductible: inferLineTaxDeductible({
      voucherType: input.voucherType,
      hasValidInvoice: input.hasValidInvoice,
      debitAccountCode: debitAcc?.accountCode,
      creditAccountCode: creditAcc?.accountCode,
      amount: input.amount,
      nonCashVatThreshold: input.nonCashVatThreshold,
    }),
  };
};
