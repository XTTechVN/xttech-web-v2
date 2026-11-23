import type {
  Account,
  AutoPostingTemplate,
  BankAccount,
  SourceQueueItem,
  VoucherType,
} from '@/types';

export const toIdString = (value?: number | null): string =>
  value != null ? String(value) : '';

export function resolveCashAccountId(accounts: Account[]): string {
  const cashAcc = accounts.find(
    (a) => a.isPostable && a.isActive && a.accountCode === '1111',
  );
  return cashAcc ? String(cashAcc.id) : '';
}

export function resolveBankGlAccountId(params: {
  bankAccountId: string;
  bankAccounts: BankAccount[];
  accounts: Account[];
}): string {
  const { bankAccountId, bankAccounts, accounts } = params;
  if (bankAccountId) {
    const selected = bankAccounts.find((b) => String(b.id) === bankAccountId);
    if (selected?.glAccountId) return String(selected.glAccountId);
  }
  const defaultActive = bankAccounts.find((b) => b.isActive && b.glAccountId);
  if (defaultActive?.glAccountId) return String(defaultActive.glAccountId);
  const fallback1121 = accounts.find(
    (a) => a.isPostable && a.isActive && a.accountCode === '1121',
  );
  return fallback1121 ? String(fallback1121.id) : '';
}

function isGeneric1121Account(accountId: number, accounts: Account[]): boolean {
  return accounts.find((a) => a.id === accountId)?.accountCode === '1121';
}

export function resolveTemplateSelectionPatch(params: {
  nextTemplateId: string;
  item: SourceQueueItem;
  voucherType: VoucherType;
  bankAccountId: string;
  templates: AutoPostingTemplate[];
  bankAccounts: BankAccount[];
  accounts: Account[];
}): {
  templateId: string;
  debitAccountId: string;
  creditAccountId: string;
  costItemId: string;
  hasValidInvoice: boolean;
} {
  const {
    nextTemplateId,
    item,
    voucherType,
    bankAccountId,
    templates,
    bankAccounts,
    accounts,
  } = params;

  if (!nextTemplateId) {
    return {
      templateId: '',
      debitAccountId: toIdString(item.suggestedDebitAccountId),
      creditAccountId: toIdString(item.suggestedCreditAccountId),
      costItemId: toIdString(item.suggestedCostItemId),
      hasValidInvoice: item.suggestedHasValidInvoice,
    };
  }

  const tpl = templates.find((t) => String(t.id) === nextTemplateId);
  if (!tpl) {
    return {
      templateId: nextTemplateId,
      debitAccountId: toIdString(item.suggestedDebitAccountId),
      creditAccountId: toIdString(item.suggestedCreditAccountId),
      costItemId: toIdString(item.suggestedCostItemId),
      hasValidInvoice: item.suggestedHasValidInvoice,
    };
  }

  const bankGlId = resolveBankGlAccountId({ bankAccountId, bankAccounts, accounts });
  const nextDebit =
    voucherType === 'bank_receipt' &&
    isGeneric1121Account(tpl.debitAccountId, accounts) &&
    bankGlId
      ? bankGlId
      : String(tpl.debitAccountId);
  const nextCredit =
    voucherType === 'bank_payment' &&
    isGeneric1121Account(tpl.creditAccountId, accounts) &&
    bankGlId
      ? bankGlId
      : String(tpl.creditAccountId);

  return {
    templateId: nextTemplateId,
    debitAccountId: nextDebit,
    creditAccountId: nextCredit,
    costItemId: toIdString(tpl.defaultCostItemId),
    hasValidInvoice: tpl.defaultHasValidInvoice,
  };
}
