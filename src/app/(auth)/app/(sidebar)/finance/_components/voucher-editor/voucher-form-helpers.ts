import type {
  Account,
  AutoPostingTemplate,
  PartnerType,
  TaxInvoice,
  VoucherAttachment,
  VoucherCreate,
  VoucherDetail,
  VoucherType,
} from '@/types';
import {
  buildWorkshopLineInput,
  computeDraftTotals,
  createEmptyDraftLine,
  DEFAULT_NON_CASH_VAT_THRESHOLD,
  inferLineTaxDeductible,
  isBankGlCode,
  isArchFix6ExemptPair,
  isProjectOrOperatingCostCode,
  isVatInputGlCode,
  toVoucherLineInput,
  type VoucherDraftLine,
  type VoucherEditorMode,
  type VoucherMasterLookups,
} from './voucher-editor.constants';
import type { AccountantHeaderState } from './accountant-voucher-form';
import type { WorkshopFormState } from './workshop-voucher-form';

export interface VoucherLinesAnalysis {
  hasVatInputLine: boolean;
  hasCostAccountLine: boolean;
  hasArchFix6ExemptLine: boolean;
}

export function analyzeVoucherDraftLines(
  lines: VoucherDraftLine[],
  accounts: Account[],
  voucherType: VoucherType,
): VoucherLinesAnalysis {
  const accountById = new Map(accounts.map((a) => [a.id, a]));
  let hasVatInputLine = false;
  let hasCostAccountLine = false;
  let hasArchFix6ExemptLine = false;

  for (const line of lines) {
    const debitCode = accountById.get(line.debitAccountId)?.accountCode;
    const creditCode = accountById.get(line.creditAccountId)?.accountCode;
    if (isVatInputGlCode(debitCode)) hasVatInputLine = true;
    if (isProjectOrOperatingCostCode(debitCode)) hasCostAccountLine = true;
    if (voucherType === 'general_journal' && isArchFix6ExemptPair(debitCode, creditCode)) {
      hasArchFix6ExemptLine = true;
    }
  }

  return {
    hasVatInputLine,
    hasCostAccountLine,
    hasArchFix6ExemptLine,
  };
}

export function recomputeAllLinesDeductibility(params: {
  lines: VoucherDraftLine[];
  accounts: Account[];
  voucherType: VoucherType;
  hasValidInvoice: boolean;
  grandTotal: number;
  nonCashVatThreshold: number;
}): VoucherDraftLine[] {
  const { lines, accounts, voucherType, hasValidInvoice, grandTotal, nonCashVatThreshold } = params;
  const accountById = new Map(accounts.map((a) => [a.id, a]));
  return lines.map((line) => ({
    ...line,
    isTaxDeductible: inferLineTaxDeductible({
      voucherType,
      hasValidInvoice,
      debitAccountCode: accountById.get(line.debitAccountId)?.accountCode,
      creditAccountCode: accountById.get(line.creditAccountId)?.accountCode,
      amount: Math.max(grandTotal, line.amount),
      nonCashVatThreshold,
    }),
  }));
}

export function syncChangedLinesDeductibility(params: {
  prevLines: VoucherDraftLine[];
  nextLines: VoucherDraftLine[];
  accounts: Account[];
  voucherType: VoucherType;
  hasValidInvoice: boolean;
  grandTotal: number;
  nonCashVatThreshold: number;
}): VoucherDraftLine[] {
  const {
    prevLines,
    nextLines,
    accounts,
    voucherType,
    hasValidInvoice,
    grandTotal,
    nonCashVatThreshold,
  } = params;
  const accountById = new Map(accounts.map((a) => [a.id, a]));
  const prevById = new Map(prevLines.map((l) => [l.tempId, l]));

  return nextLines.map((line) => {
    const prev = prevById.get(line.tempId);
    const accountsChanged =
      !prev ||
      prev.debitAccountId !== line.debitAccountId ||
      prev.creditAccountId !== line.creditAccountId;
    if (accountsChanged && line.isTaxDeductible === (prev?.isTaxDeductible ?? true)) {
      return {
        ...line,
        isTaxDeductible: inferLineTaxDeductible({
          voucherType,
          hasValidInvoice,
          debitAccountCode: accountById.get(line.debitAccountId)?.accountCode,
          creditAccountCode: accountById.get(line.creditAccountId)?.accountCode,
          amount: Math.max(grandTotal, line.amount),
          nonCashVatThreshold,
        }),
      };
    }
    return line;
  });
}

export function convertAccountantToWorkshopState(
  prev: WorkshopFormState,
  header: AccountantHeaderState,
  grandTotal: number,
): WorkshopFormState {
  if (grandTotal <= 0) return prev;
  return {
    ...prev,
    voucherDate: header.voucherDate,
    hasValidInvoice: header.hasValidInvoice,
    projectId: header.projectId,
    partnerType: header.partnerType,
    customerId: header.customerId,
    supplierId: header.supplierId,
    employeeId: header.employeeId,
    contactName: header.contactName,
    amount: grandTotal,
    description: header.description,
  };
}

export function buildVatDraftLineFromInvoice(
  inv: TaxInvoice,
  accounts: Account[],
  firstLine?: VoucherDraftLine,
): VoucherDraftLine {
  const postable = accounts.filter((a) => a.isPostable && a.isActive);
  const vatIn =
    postable.find((a) => a.accountCode === '1331') ||
    postable.find((a) => a.accountCode.startsWith('133'));
  const vatOut =
    postable.find((a) => a.accountCode === '33311') ||
    postable.find((a) => a.accountCode.startsWith('3331'));
  const fallbackCashOrBank =
    postable.find((a) => a.accountCode === '1121' || a.accountCode === '1111')?.id || 0;

  const cashOrBankCredit = firstLine?.creditAccountId || fallbackCashOrBank;
  const cashOrBankDebit = firstLine?.debitAccountId || fallbackCashOrBank;

  return createEmptyDraftLine({
    lineKind: 'vat',
    description: `Thuế GTGT HĐ ${inv.invoiceSeries}/${inv.invoiceNumber} - ${inv.partnerName}`,
    debitAccountId: inv.direction === 'input' ? vatIn?.id || 0 : cashOrBankDebit,
    creditAccountId: inv.direction === 'input' ? cashOrBankCredit : vatOut?.id || 0,
    amount: inv.vatAmount,
    creditBankAccountId: firstLine?.creditBankAccountId ?? null,
    debitBankAccountId: firstLine?.debitBankAccountId ?? null,
    customerId: inv.customerId,
    supplierId: inv.supplierId,
    isTaxDeductible: inv.isTaxDeductible,
  });
}

export function resolveTemplateDescription(
  currentDescription: string,
  prevTemplateId: number | null,
  nextTpl: AutoPostingTemplate | null,
  templates: AutoPostingTemplate[],
): string {
  const prevTplName = prevTemplateId
    ? templates.find((t) => t.id === prevTemplateId)?.name ?? ''
    : '';
  const trimmed = currentDescription.trim();
  if (!trimmed || (prevTplName && trimmed === prevTplName.trim())) {
    return nextTpl?.name ?? '';
  }
  return currentDescription;
}

export function buildLineFromAutoTemplate(
  tpl: AutoPostingTemplate,
  header: AccountantHeaderState,
  accounts: Account[],
  existingAmount: number,
  nonCashVatThreshold = DEFAULT_NON_CASH_VAT_THRESHOLD,
): VoucherDraftLine {
  const debitAcc = accounts.find((a) => a.id === tpl.debitAccountId);
  const creditAcc = accounts.find((a) => a.id === tpl.creditAccountId);

  return createEmptyDraftLine({
    description: header.description || tpl.name,
    debitAccountId: tpl.debitAccountId,
    creditAccountId: tpl.creditAccountId,
    amount: existingAmount,
    costItemId: tpl.defaultCostItemId,
    cashflowCode: tpl.defaultCashflowCode ?? null,
    debitBankAccountId: isBankGlCode(debitAcc?.accountCode) ? header.bankAccountId : null,
    creditBankAccountId: isBankGlCode(creditAcc?.accountCode) ? header.bankAccountId : null,
    projectId: header.projectId,
    departmentId: header.departmentId,
    customerId: header.customerId,
    supplierId: header.supplierId,
    employeeId: header.employeeId,
    isTaxDeductible: inferLineTaxDeductible({
      voucherType: header.voucherType,
      hasValidInvoice: tpl.defaultHasValidInvoice,
      debitAccountCode: debitAcc?.accountCode,
      creditAccountCode: creditAcc?.accountCode,
      amount: existingAmount,
      nonCashVatThreshold,
    }),
  });
}

export interface BuildPayloadResult {
  payload?: VoucherCreate;
  error?: string;
}

export function buildVoucherSubmitPayload(params: {
  mode: VoucherEditorMode;
  workshopState: WorkshopFormState;
  header: AccountantHeaderState;
  lines: VoucherDraftLine[];
  lookups: VoucherMasterLookups;
  existingAttachments: VoucherAttachment[];
  linkedInvoices: TaxInvoice[];
}): BuildPayloadResult {
  const {
    mode,
    workshopState,
    header,
    lines,
    lookups,
    existingAttachments,
    linkedInvoices,
  } = params;

  const nonCashVatThreshold =
    lookups.setting?.nonCashVatThreshold ?? DEFAULT_NON_CASH_VAT_THRESHOLD;

  if (mode === 'workshop') {
    const tpl = lookups.templates.find((t) => t.id === workshopState.templateId) || null;
    if (tpl?.requiresProject && !workshopState.projectId) {
      return { error: 'Mẫu định khoản này yêu cầu chọn Công trình / Dự án.' };
    }
    if (!workshopState.amount || workshopState.amount <= 0) {
      return { error: 'Vui lòng nhập số tiền lớn hơn 0.' };
    }
    const built = buildWorkshopLineInput({
      template: tpl,
      voucherType: workshopState.voucherType,
      accounts: lookups.accounts,
      defaultCashAccountCode: lookups.setting?.defaultCashAccountCode,
      amount: workshopState.amount,
      description: workshopState.description,
      projectId: workshopState.projectId,
      partnerType: workshopState.partnerType,
      customerId: workshopState.customerId,
      supplierId: workshopState.supplierId,
      employeeId: workshopState.employeeId,
      hasValidInvoice: workshopState.hasValidInvoice,
      nonCashVatThreshold,
    });
    if (!built) {
      return {
        error:
          'Chưa có Hệ thống Tài khoản (1111/642). Vui lòng bấm Khởi tạo dữ liệu mẫu ở tab Thiết lập.',
      };
    }
    const descriptionText =
      workshopState.description.trim() || tpl?.name || 'Giao dịch tiền mặt (TK 1111)';

    return {
      payload: {
        voucherType: workshopState.voucherType,
        voucherDate: workshopState.voucherDate,
        postingDate: workshopState.voucherDate,
        hasValidInvoice: workshopState.hasValidInvoice,
        isTaxDeductible: built.isTaxDeductible ?? false,
        autoPostingTemplateId: workshopState.templateId,
        partnerType: workshopState.partnerType,
        customerId: workshopState.partnerType === 'customer' ? workshopState.customerId : null,
        supplierId: workshopState.partnerType === 'supplier' ? workshopState.supplierId : null,
        employeeId: workshopState.partnerType === 'employee' ? workshopState.employeeId : null,
        contactName: workshopState.contactName.trim() || null,
        projectId: workshopState.projectId,
        description: descriptionText,
        attachments: existingAttachments,
        lines: [built],
      },
    };
  }

  const mappedLines = lines.map((l, idx) => toVoucherLineInput(l, idx));
  if (
    mappedLines.some(
      (l) => !l.debitAccountId || !l.creditAccountId || l.amount <= 0 || !l.description,
    )
  ) {
    return { error: 'Mỗi dòng hạch toán phải đủ TK Nợ, TK Có, Diễn giải và Số tiền > 0.' };
  }
  const desc = header.description.trim();
  if (!desc) {
    return { error: 'Vui lòng nhập diễn giải chứng từ.' };
  }

  const accountById = new Map(lookups.accounts.map((a) => [a.id, a]));
  const hasVatInputLine = mappedLines.some((l) =>
    isVatInputGlCode(accountById.get(l.debitAccountId)?.accountCode),
  );
  if (header.hasValidInvoice && hasVatInputLine && linkedInvoices.length === 0) {
    return {
      error:
        'Chứng từ có Hóa đơn GTGT hợp lệ và phát sinh TK 133* bắt buộc phải gắn ít nhất 1 Hóa đơn ở tab 2 (Hóa đơn & Thuế GTGT).',
    };
  }

  const { grandTotal } = computeDraftTotals(lines);
  const allLinesDeductible = mappedLines.every((l) => l.isTaxDeductible !== false);
  const isCashExceeded =
    header.voucherType === 'cash_payment' && grandTotal >= nonCashVatThreshold;

  return {
    payload: {
      voucherType: header.voucherType,
      voucherDate: header.voucherDate,
      postingDate: header.postingDate,
      hasValidInvoice: header.hasValidInvoice,
      isTaxDeductible: isCashExceeded ? false : allLinesDeductible,
      bankAccountId: header.bankAccountId,
      autoPostingTemplateId: header.autoPostingTemplateId,
      partnerType: header.partnerType as PartnerType,
      customerId: header.partnerType === 'customer' ? header.customerId : null,
      supplierId: header.partnerType === 'supplier' ? header.supplierId : null,
      employeeId: header.partnerType === 'employee' ? header.employeeId : null,
      contactName: header.contactName.trim() || null,
      contactAddress: header.contactAddress.trim() || null,
      projectId: header.projectId,
      departmentId: header.departmentId,
      description: desc,
      attachments: existingAttachments,
      lines: mappedLines,
      taxInvoiceIds: linkedInvoices.map((i) => i.id),
    },
  };
}

export function createInitialWorkshopState(params: {
  initialData: VoucherDetail | null;
  defaultVoucherType: VoucherType;
  defaultHasValidInvoice: boolean;
  today: string;
}): WorkshopFormState {
  const { initialData, defaultVoucherType, defaultHasValidInvoice, today } = params;
  return {
    voucherType:
      initialData?.voucherType === 'cash_receipt' || initialData?.voucherType === 'cash_payment'
        ? initialData.voucherType
        : defaultVoucherType === 'cash_receipt'
          ? 'cash_receipt'
          : 'cash_payment',
    voucherDate: initialData?.voucherDate || today,
    templateId: initialData?.autoPostingTemplateId ?? null,
    projectId: initialData?.projectId ?? null,
    partnerType: initialData?.partnerType || 'other',
    customerId: initialData?.customerId ?? null,
    supplierId: initialData?.supplierId ?? null,
    employeeId: initialData?.employeeId ?? null,
    contactName: initialData?.contactName || '',
    amount: initialData?.totalAmount ?? 0,
    hasValidInvoice: initialData?.hasValidInvoice ?? defaultHasValidInvoice,
    description: initialData?.description || '',
  };
}

export function createInitialAccountantHeader(params: {
  initialData: VoucherDetail | null;
  defaultVoucherType: VoucherType;
  defaultBankAccountId: number | null;
  defaultHasValidInvoice: boolean;
  today: string;
}): AccountantHeaderState {
  const {
    initialData,
    defaultVoucherType,
    defaultBankAccountId,
    defaultHasValidInvoice,
    today,
  } = params;
  return {
    voucherType: initialData?.voucherType || defaultVoucherType,
    voucherDate: initialData?.voucherDate || today,
    postingDate: initialData?.postingDate || today,
    hasValidInvoice: initialData?.hasValidInvoice ?? defaultHasValidInvoice,
    bankAccountId: initialData?.bankAccountId ?? defaultBankAccountId,
    autoPostingTemplateId: initialData?.autoPostingTemplateId ?? null,
    partnerType: initialData?.partnerType || 'other',
    customerId: initialData?.customerId ?? null,
    supplierId: initialData?.supplierId ?? null,
    employeeId: initialData?.employeeId ?? null,
    contactName: initialData?.contactName || '',
    contactAddress: initialData?.contactAddress || '',
    projectId: initialData?.projectId ?? null,
    departmentId: initialData?.departmentId ?? null,
    description: initialData?.description || '',
  };
}

export function convertWorkshopToAccountantDraft(params: {
  workshopState: WorkshopFormState;
  header: AccountantHeaderState;
  lookups: VoucherMasterLookups;
}): { nextHeader: AccountantHeaderState; nextLines: VoucherDraftLine[] | null } {
  const { workshopState, header, lookups } = params;
  const tpl = lookups.templates.find((t) => t.id === workshopState.templateId) || null;
  const nonCashVatThreshold =
    lookups.setting?.nonCashVatThreshold ?? DEFAULT_NON_CASH_VAT_THRESHOLD;
  const built =
    workshopState.amount > 0
      ? buildWorkshopLineInput({
          template: tpl,
          voucherType: workshopState.voucherType,
          accounts: lookups.accounts,
          defaultCashAccountCode: lookups.setting?.defaultCashAccountCode,
          amount: workshopState.amount,
          description: workshopState.description,
          projectId: workshopState.projectId,
          partnerType: workshopState.partnerType,
          customerId: workshopState.customerId,
          supplierId: workshopState.supplierId,
          employeeId: workshopState.employeeId,
          hasValidInvoice: workshopState.hasValidInvoice,
          nonCashVatThreshold,
        })
      : null;

  return {
    nextLines: built
      ? [createEmptyDraftLine({ ...built, isTaxDeductible: built.isTaxDeductible ?? true })]
      : null,
    nextHeader: {
      ...header,
      voucherType: workshopState.voucherType,
      voucherDate: workshopState.voucherDate,
      postingDate: workshopState.voucherDate,
      hasValidInvoice: workshopState.hasValidInvoice,
      autoPostingTemplateId: workshopState.templateId,
      projectId: workshopState.projectId,
      partnerType: workshopState.partnerType,
      customerId: workshopState.customerId,
      supplierId: workshopState.supplierId,
      employeeId: workshopState.employeeId,
      contactName: workshopState.contactName,
      description: workshopState.description,
    },
  };
}
