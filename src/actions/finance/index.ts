import api from '@/utils/api';
import {
  downloadOrShareBlob,
  getFilenameFromContentDisposition,
} from '@/utils/file';
import type { BaseResponseWithPagination } from '@/components';
import type {
  Account,
  AccountCreate,
  AccountingRegime,
  AccountQueryParams,
  AccountTreeNode,
  AccountUpdate,
  ArApAgingQueryParams,
  ArApAgingReport,
  AutoPostingTemplate,
  AutoPostingTemplateCreate,
  AutoPostingTemplateQueryParams,
  AutoPostingTemplateUpdate,
  BankAccount,
  BankAccountCreate,
  BankAccountQueryParams,
  BankAccountUpdate,
  CashbookQueryParams,
  CashbookReport,
  CashCountMinute,
  CashCountMinuteCreate,
  CashCountQueryParams,
  CashCountVoidPayload,
  CashflowQueryParams,
  CashflowReport,
  ClosingExecutePayload,
  ClosingExecuteResponse,
  ClosingPreview,
  ComparativeBaselineFormCode,
  ComparativeBaselineItem,
  ComparativeBaselineResponse,
  CostItem,
  CostItemCreate,
  CostItemQueryParams,
  CostItemUpdate,
  FilingFrequency,
  FinanceAuditLog,
  FinanceAuditLogQueryParams,
  FinanceDashboard,
  FinanceDashboardQueryParams,
  FinanceSeedResult,
  FinanceSetting,
  FinanceSettingUpdate,
  FinanceUserPermission,
  FinanceUserPermissionQueryParams,
  FinanceUserPermissionUpdate,
  FiscalYearConfig,
  FiscalYearConfigUpdate,
  GeneralLedgerQueryParams,
  GeneralLedgerReport,
  NonDeductibleQueryParams,
  NonDeductibleReport,
  OpeningBalanceEntry,
  OpeningBalanceUpsertPayload,
  OverheadAllocationExecutePayload,
  OverheadAllocationPreview,
  OverheadAllocationRun,
  ParsedEinvoiceXml,
  PeriodLock,
  PeriodLockActionPayload,
  PeriodMarkTaxFiledPayload,
  PitEntryInput,
  PitLedgerSummary,
  ProjectPnlDrilldownQueryParams,
  ProjectPnlDrilldownResponse,
  ProjectPnlQueryParams,
  ProjectPnlReport,
  SourceQueueImportPayload,
  SourceQueueItem,
  SourceQueueQueryParams,
  StatutoryFiling,
  StatutoryFilingComputeRequest,
  StatutoryFilingMarkFiledRequest,
  StatutoryFormCode,
  StatutoryFormConfig,
  StatutoryFormConfigUpdate,
  StatutoryPeriodOverview,
  StatutoryPeriodType,
  StatutorySourceRef,
  StatutorySupplementalCreatePayload,
  StatutorySupplementalDiffResponse,
  StatutoryXmlExportResponse,
  TaxInvoice,
  TaxInvoiceCreate,
  TaxInvoiceDirection,
  TaxInvoiceExcelImportResponse,
  TaxInvoiceQueryParams,
  TaxInvoiceUpdate,
  TaxInvoiceWarningSummary,
  DeclarationKind,
  TrialBalanceQueryParams,
  TrialBalanceReport,
  VatLedgerQueryParams,
  VatLedgerReport,
  VoucherCreate,
  VoucherDetail,
  VoucherInternalApprovePayload,
  VoucherQueryParams,
  VoucherStatutoryImpactItem,
  VoucherSummary,
  VoucherUnpostPayload,
  VoucherUpdate,
  VoucherVoidPayload,
} from '@/types';

const FINANCE_BASE = '/api/v1/finance';

const normalizePaginatedResponse = <T>(rawData: {
  items?: T[];
  meta?: { total?: number; offset?: number; limit?: number; next?: boolean };
}): BaseResponseWithPagination<T> => ({
  items: rawData?.items || [],
  meta: {
    total: rawData?.meta?.total ?? 0,
    offset: rawData?.meta?.offset ?? 0,
    limit: rawData?.meta?.limit ?? 20,
    next: rawData?.meta?.next ?? false,
  },
});

// =========================================================================
// 1. SETTINGS & SEEDING
// =========================================================================
export const getFinanceSetting = async (): Promise<FinanceSetting> => {
  const response = await api.get<FinanceSetting>(`${FINANCE_BASE}/settings`);
  return response.data;
};

export const updateFinanceSetting = async (
  data: FinanceSettingUpdate,
): Promise<FinanceSetting> => {
  const response = await api.put<FinanceSetting>(`${FINANCE_BASE}/settings`, data);
  return response.data;
};

export const seedFinanceDefaults = async (
  regime?: AccountingRegime,
): Promise<FinanceSeedResult> => {
  const response = await api.post<FinanceSeedResult>(
    `${FINANCE_BASE}/settings/seed-defaults`,
    regime ? { regime } : {},
  );
  return response.data;
};

// =========================================================================
// 2. CHART OF ACCOUNTS (HỆ THỐNG TÀI KHOẢN)
// =========================================================================
export const getAccounts = async (
  params?: AccountQueryParams,
): Promise<BaseResponseWithPagination<Account>> => {
  const response = await api.get(`${FINANCE_BASE}/accounts`, { params });
  return normalizePaginatedResponse<Account>(response.data);
};

export const getAccountTree = async (
  params?: Omit<AccountQueryParams, 'tree' | 'limit' | 'offset'>,
): Promise<AccountTreeNode[]> => {
  const response = await api.get<AccountTreeNode[] | { items?: AccountTreeNode[] }>(
    `${FINANCE_BASE}/accounts/tree`,
    { params },
  );
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data?.items || [];
};

export const getAccount = async (accountId: number): Promise<Account> => {
  const response = await api.get<Account>(`${FINANCE_BASE}/accounts/${accountId}`);
  return response.data;
};

export const createAccount = async (data: AccountCreate): Promise<Account> => {
  const response = await api.post<Account>(`${FINANCE_BASE}/accounts`, data);
  return response.data;
};

export const updateAccount = async (
  accountId: number,
  data: AccountUpdate,
): Promise<Account> => {
  const response = await api.put<Account>(
    `${FINANCE_BASE}/accounts/${accountId}`,
    data,
  );
  return response.data;
};

export const deleteAccount = async (accountId: number): Promise<void> => {
  await api.delete(`${FINANCE_BASE}/accounts/${accountId}`);
};

// =========================================================================
// 3. BANK ACCOUNTS (TÀI KHOẢN NGÂN HÀNG)
// =========================================================================
export const getBankAccounts = async (
  params?: BankAccountQueryParams,
): Promise<BaseResponseWithPagination<BankAccount>> => {
  const response = await api.get(`${FINANCE_BASE}/bank-accounts`, { params });
  return normalizePaginatedResponse<BankAccount>(response.data);
};

export const getBankAccount = async (bankAccountId: number): Promise<BankAccount> => {
  const response = await api.get<BankAccount>(
    `${FINANCE_BASE}/bank-accounts/${bankAccountId}`,
  );
  return response.data;
};

export const createBankAccount = async (
  data: BankAccountCreate,
): Promise<BankAccount> => {
  const response = await api.post<BankAccount>(`${FINANCE_BASE}/bank-accounts`, data);
  return response.data;
};

export const updateBankAccount = async (
  bankAccountId: number,
  data: BankAccountUpdate,
): Promise<BankAccount> => {
  const response = await api.put<BankAccount>(
    `${FINANCE_BASE}/bank-accounts/${bankAccountId}`,
    data,
  );
  return response.data;
};

export const deleteBankAccount = async (bankAccountId: number): Promise<void> => {
  await api.delete(`${FINANCE_BASE}/bank-accounts/${bankAccountId}`);
};

// =========================================================================
// 4. COST ITEMS (KHOẢN MỤC CHI PHÍ)
// =========================================================================
export const getCostItems = async (
  params?: CostItemQueryParams,
): Promise<BaseResponseWithPagination<CostItem>> => {
  const response = await api.get(`${FINANCE_BASE}/cost-items`, { params });
  return normalizePaginatedResponse<CostItem>(response.data);
};

export const createCostItem = async (data: CostItemCreate): Promise<CostItem> => {
  const response = await api.post<CostItem>(`${FINANCE_BASE}/cost-items`, data);
  return response.data;
};

export const updateCostItem = async (
  costItemId: number,
  data: CostItemUpdate,
): Promise<CostItem> => {
  const response = await api.put<CostItem>(
    `${FINANCE_BASE}/cost-items/${costItemId}`,
    data,
  );
  return response.data;
};

export const deleteCostItem = async (costItemId: number): Promise<void> => {
  await api.delete(`${FINANCE_BASE}/cost-items/${costItemId}`);
};

// =========================================================================
// 5. AUTO POSTING TEMPLATES (MẪU ĐỊNH KHOẢN NHANH)
// =========================================================================
export const getAutoPostingTemplates = async (
  params?: AutoPostingTemplateQueryParams,
): Promise<BaseResponseWithPagination<AutoPostingTemplate>> => {
  const response = await api.get(`${FINANCE_BASE}/auto-posting-templates`, { params });
  return normalizePaginatedResponse<AutoPostingTemplate>(response.data);
};

export const createAutoPostingTemplate = async (
  data: AutoPostingTemplateCreate,
): Promise<AutoPostingTemplate> => {
  const response = await api.post<AutoPostingTemplate>(
    `${FINANCE_BASE}/auto-posting-templates`,
    data,
  );
  return response.data;
};

export const updateAutoPostingTemplate = async (
  templateId: number,
  data: AutoPostingTemplateUpdate,
): Promise<AutoPostingTemplate> => {
  const response = await api.put<AutoPostingTemplate>(
    `${FINANCE_BASE}/auto-posting-templates/${templateId}`,
    data,
  );
  return response.data;
};

export const deleteAutoPostingTemplate = async (templateId: number): Promise<void> => {
  await api.delete(`${FINANCE_BASE}/auto-posting-templates/${templateId}`);
};

// =========================================================================
// 6. VOUCHERS & GL POST WORKFLOW
// =========================================================================
export const getVouchers = async (
  params?: VoucherQueryParams,
): Promise<BaseResponseWithPagination<VoucherSummary>> => {
  const response = await api.get(`${FINANCE_BASE}/vouchers`, { params });
  return normalizePaginatedResponse<VoucherSummary>(response.data);
};

export const getVoucher = async (voucherId: number): Promise<VoucherDetail> => {
  const response = await api.get<VoucherDetail>(`${FINANCE_BASE}/vouchers/${voucherId}`);
  return response.data;
};

export const createVoucher = async (data: VoucherCreate): Promise<VoucherDetail> => {
  const response = await api.post<VoucherDetail>(`${FINANCE_BASE}/vouchers`, data);
  return response.data;
};

export const updateVoucher = async (
  voucherId: number,
  data: VoucherUpdate,
): Promise<VoucherDetail> => {
  const response = await api.put<VoucherDetail>(
    `${FINANCE_BASE}/vouchers/${voucherId}`,
    data,
  );
  return response.data;
};

export const deleteVoucher = async (voucherId: number): Promise<void> => {
  await api.delete(`${FINANCE_BASE}/vouchers/${voucherId}`);
};

export const postVoucher = async (voucherId: number): Promise<VoucherDetail> => {
  const response = await api.post<VoucherDetail>(
    `${FINANCE_BASE}/vouchers/${voucherId}/post`,
    {},
  );
  return response.data;
};

export const unpostVoucher = async (
  voucherId: number,
  payload: VoucherUnpostPayload,
): Promise<VoucherDetail> => {
  const response = await api.post<VoucherDetail>(
    `${FINANCE_BASE}/vouchers/${voucherId}/unpost`,
    payload,
  );
  return response.data;
};

export const approveInternalVoucher = async (
  voucherId: number,
  payload?: VoucherInternalApprovePayload,
): Promise<VoucherDetail> => {
  const response = await api.post<VoucherDetail>(
    `${FINANCE_BASE}/vouchers/${voucherId}/approve-internal`,
    payload ?? {},
  );
  return response.data;
};

export const cashierConfirmVoucher = async (
  voucherId: number,
): Promise<VoucherDetail> => {
  const response = await api.post<VoucherDetail>(
    `${FINANCE_BASE}/vouchers/${voucherId}/cashier-confirm`,
    {},
  );
  return response.data;
};

export const voidVoucher = async (
  voucherId: number,
  data: VoucherVoidPayload,
): Promise<VoucherDetail> => {
  const response = await api.post<VoucherDetail>(
    `${FINANCE_BASE}/vouchers/${voucherId}/void`,
    data,
  );
  return response.data;
};

export const uploadVoucherAttachments = async (
  voucherId: number,
  files: File[],
): Promise<VoucherDetail> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  const response = await api.post<VoucherDetail>(
    `${FINANCE_BASE}/vouchers/${voucherId}/attachments`,
    formData,
  );
  return response.data;
};

// =========================================================================
// 7. OPENING BALANCES & PERIOD LOCKS
// =========================================================================
export const getOpeningBalances = async (): Promise<OpeningBalanceEntry[]> => {
  const response = await api.get<OpeningBalanceEntry[] | { items?: OpeningBalanceEntry[] }>(
    `${FINANCE_BASE}/opening-balances`,
  );
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data?.items || [];
};

export const upsertOpeningBalances = async (
  data: OpeningBalanceUpsertPayload,
): Promise<VoucherDetail> => {
  const response = await api.put<VoucherDetail>(
    `${FINANCE_BASE}/opening-balances`,
    data,
  );
  return response.data;
};

export const getPeriodLocks = async (params?: {
  year?: number;
}): Promise<PeriodLock[]> => {
  const response = await api.get<PeriodLock[] | { items?: PeriodLock[] }>(
    `${FINANCE_BASE}/period-locks`,
    { params },
  );
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data?.items || [];
};

export const lockPeriod = async (data: PeriodLockActionPayload): Promise<PeriodLock> => {
  const response = await api.post<PeriodLock>(`${FINANCE_BASE}/period-locks/lock`, data);
  return response.data;
};

export const unlockPeriod = async (data: PeriodLockActionPayload): Promise<PeriodLock> => {
  const response = await api.post<PeriodLock>(
    `${FINANCE_BASE}/period-locks/unlock`,
    data,
  );
  return response.data;
};

export const markPeriodTaxFiled = async (
  data: PeriodMarkTaxFiledPayload,
): Promise<PeriodLock> => {
  const response = await api.post<PeriodLock>(
    `${FINANCE_BASE}/period-locks/mark-tax-filed`,
    data,
  );
  return response.data;
};

// =========================================================================
// 8. TAX INVOICES & E-INVOICE XML PARSING
// =========================================================================
export const getTaxInvoices = async (
  params?: TaxInvoiceQueryParams,
): Promise<BaseResponseWithPagination<TaxInvoice>> => {
  const response = await api.get(`${FINANCE_BASE}/tax-invoices`, { params });
  return normalizePaginatedResponse<TaxInvoice>(response.data);
};

export const getTaxInvoice = async (invoiceId: number): Promise<TaxInvoice> => {
  const response = await api.get<TaxInvoice>(`${FINANCE_BASE}/tax-invoices/${invoiceId}`);
  return response.data;
};

export const createTaxInvoice = async (data: TaxInvoiceCreate): Promise<TaxInvoice> => {
  const response = await api.post<TaxInvoice>(`${FINANCE_BASE}/tax-invoices`, data);
  return response.data;
};

export const updateTaxInvoice = async (
  invoiceId: number,
  data: TaxInvoiceUpdate,
): Promise<TaxInvoice> => {
  const response = await api.put<TaxInvoice>(
    `${FINANCE_BASE}/tax-invoices/${invoiceId}`,
    data,
  );
  return response.data;
};

export const deleteTaxInvoice = async (invoiceId: number): Promise<void> => {
  await api.delete(`${FINANCE_BASE}/tax-invoices/${invoiceId}`);
};

export const parseTaxInvoiceXml = async (
  file: File,
  direction?: TaxInvoiceDirection,
): Promise<ParsedEinvoiceXml> => {
  const formData = new FormData();
  formData.append('file', file);
  if (direction) {
    formData.append('direction', direction);
  }
  const response = await api.post<ParsedEinvoiceXml>(
    `${FINANCE_BASE}/tax-invoices/parse-xml`,
    formData,
    { params: direction ? { direction } : undefined },
  );
  return response.data;
};

export const importTaxInvoicesExcel = async (
  file: File,
  direction: TaxInvoiceDirection,
  dryRun = true,
): Promise<TaxInvoiceExcelImportResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('direction', direction);
  formData.append('dryRun', String(dryRun));
  const response = await api.post<TaxInvoiceExcelImportResponse>(
    `${FINANCE_BASE}/tax-invoices/import-excel`,
    formData,
  );
  return response.data;
};

// =========================================================================
// 9. SEMI-AUTO SOURCE QUEUE & PERIOD CLOSING (911 -> 4212)
// =========================================================================
export const getSourceQueue = async (
  params?: SourceQueueQueryParams,
): Promise<BaseResponseWithPagination<SourceQueueItem>> => {
  const response = await api.get(`${FINANCE_BASE}/source-queue`, { params });
  return normalizePaginatedResponse<SourceQueueItem>(response.data);
};

export const importSourceQueueItem = async (
  data: SourceQueueImportPayload,
): Promise<VoucherDetail> => {
  const response = await api.post<VoucherDetail>(
    `${FINANCE_BASE}/source-queue/import`,
    data,
  );
  return response.data;
};

export async function getClosingPreview(
  year: number,
  month: number,
): Promise<ClosingPreview>;
export async function getClosingPreview(params: {
  year: number;
  month: number;
}): Promise<ClosingPreview>;
export async function getClosingPreview(
  yearOrParams: number | { year: number; month: number },
  monthArg?: number,
): Promise<ClosingPreview> {
  const params =
    typeof yearOrParams === 'number'
      ? { year: yearOrParams, month: monthArg ?? 1 }
      : yearOrParams;
  const response = await api.get<ClosingPreview>(`${FINANCE_BASE}/closing/preview`, {
    params,
  });
  return response.data;
}

export const executeClosing = async (
  data: ClosingExecutePayload,
): Promise<ClosingExecuteResponse> => {
  const response = await api.post<ClosingExecuteResponse>(
    `${FINANCE_BASE}/closing/execute`,
    data,
  );
  return response.data;
};

// =========================================================================
// 10. LEDGERS, FINANCIAL REPORTS & DASHBOARD
// =========================================================================
export const getFinanceDashboard = async (
  params?: FinanceDashboardQueryParams,
): Promise<FinanceDashboard> => {
  const response = await api.get<FinanceDashboard>(`${FINANCE_BASE}/dashboard`, {
    params,
  });
  return response.data;
};

export const getCashbookReport = async (
  params?: CashbookQueryParams,
): Promise<CashbookReport> => {
  const response = await api.get<CashbookReport>(`${FINANCE_BASE}/reports/cashbook`, {
    params,
  });
  return response.data;
};

export const getGeneralLedgerReport = async (
  params: GeneralLedgerQueryParams,
): Promise<GeneralLedgerReport> => {
  const response = await api.get<GeneralLedgerReport>(
    `${FINANCE_BASE}/reports/general-ledger`,
    { params },
  );
  return response.data;
};

export const getTrialBalanceReport = async (
  params: TrialBalanceQueryParams,
): Promise<TrialBalanceReport> => {
  const response = await api.get<TrialBalanceReport>(
    `${FINANCE_BASE}/reports/trial-balance`,
    { params },
  );
  return response.data;
};

export const getProjectPnlReport = async (
  params?: ProjectPnlQueryParams,
): Promise<ProjectPnlReport> => {
  const response = await api.get<ProjectPnlReport>(
    `${FINANCE_BASE}/reports/project-pnl`,
    { params },
  );
  return response.data;
};

export const getProjectPnlDrilldown = async (
  params: ProjectPnlDrilldownQueryParams,
): Promise<ProjectPnlDrilldownResponse> => {
  const response = await api.get<ProjectPnlDrilldownResponse>(
    `${FINANCE_BASE}/reports/project-pnl/drilldown`,
    { params },
  );
  return response.data;
};

export const getCashflowReport = async (
  params: CashflowQueryParams,
): Promise<CashflowReport> => {
  const response = await api.get<CashflowReport>(`${FINANCE_BASE}/reports/cashflow`, {
    params,
  });
  return response.data;
};

export const getVatLedgerReport = async (
  params: VatLedgerQueryParams,
): Promise<VatLedgerReport> => {
  const response = await api.get<VatLedgerReport>(
    `${FINANCE_BASE}/reports/vat-ledger`,
    { params },
  );
  return response.data;
};

export const getNonDeductibleReport = async (
  params: NonDeductibleQueryParams,
): Promise<NonDeductibleReport> => {
  const response = await api.get<NonDeductibleReport>(
    `${FINANCE_BASE}/reports/non-deductible-expenses`,
    { params },
  );
  return response.data;
};

export const getArApAgingReport = async (
  params: ArApAgingQueryParams,
): Promise<ArApAgingReport> => {
  const response = await api.get<ArApAgingReport>(
    `${FINANCE_BASE}/reports/ar-ap-aging`,
    { params },
  );
  return response.data;
};

// =========================================================================
// 11. BATCH 1A CONTROLS: PERMISSIONS, AUDIT LOGS, CASH COUNT & OVERHEAD ALLOCATION
// =========================================================================
export const getMyFinancePermissions = async (): Promise<FinanceUserPermission> => {
  const response = await api.get<FinanceUserPermission>(
    `${FINANCE_BASE}/permissions/me`,
  );
  return response.data;
};

export const getFinancePermissions = async (
  params?: FinanceUserPermissionQueryParams,
): Promise<BaseResponseWithPagination<FinanceUserPermission>> => {
  const response = await api.get(`${FINANCE_BASE}/permissions`, { params });
  return normalizePaginatedResponse<FinanceUserPermission>(response.data);
};

export const updateFinancePermission = async (
  userId: string,
  payload: FinanceUserPermissionUpdate,
): Promise<FinanceUserPermission> => {
  const response = await api.put<FinanceUserPermission>(
    `${FINANCE_BASE}/permissions/${userId}`,
    payload,
  );
  return response.data;
};

export const getFinanceAuditLogs = async (
  params?: FinanceAuditLogQueryParams,
): Promise<BaseResponseWithPagination<FinanceAuditLog>> => {
  const response = await api.get(`${FINANCE_BASE}/audit-logs`, { params });
  return normalizePaginatedResponse<FinanceAuditLog>(response.data);
};

export const getCashCounts = async (
  params?: CashCountQueryParams,
): Promise<BaseResponseWithPagination<CashCountMinute>> => {
  const response = await api.get(`${FINANCE_BASE}/cash-counts`, { params });
  return normalizePaginatedResponse<CashCountMinute>(response.data);
};

export const createCashCount = async (
  payload: CashCountMinuteCreate,
): Promise<CashCountMinute> => {
  const response = await api.post<CashCountMinute>(
    `${FINANCE_BASE}/cash-counts`,
    payload,
  );
  return response.data;
};

export const confirmCashCount = async (minuteId: number): Promise<CashCountMinute> => {
  const response = await api.post<CashCountMinute>(
    `${FINANCE_BASE}/cash-counts/${minuteId}/confirm`,
    {},
  );
  return response.data;
};

export const createCashCountAdjustment = async (
  minuteId: number,
): Promise<VoucherDetail> => {
  const response = await api.post<VoucherDetail>(
    `${FINANCE_BASE}/cash-counts/${minuteId}/create-adjustment`,
    {},
  );
  return response.data;
};

export const voidCashCount = async (
  minuteId: number,
  payload: CashCountVoidPayload,
): Promise<CashCountMinute> => {
  const response = await api.post<CashCountMinute>(
    `${FINANCE_BASE}/cash-counts/${minuteId}/void`,
    payload,
  );
  return response.data;
};

export const getFiscalYearConfigs = async (params?: {
  fiscalYear?: number;
  offset?: number;
  limit?: number;
}): Promise<BaseResponseWithPagination<FiscalYearConfig>> => {
  const response = await api.get(`${FINANCE_BASE}/fiscal-year-configs`, { params });
  return normalizePaginatedResponse<FiscalYearConfig>(response.data);
};

export const upsertFiscalYearConfig = async (
  fiscalYear: number,
  payload: FiscalYearConfigUpdate,
): Promise<FiscalYearConfig> => {
  const response = await api.put<FiscalYearConfig>(
    `${FINANCE_BASE}/fiscal-year-configs/${fiscalYear}`,
    payload,
  );
  return response.data;
};

export const previewOverheadAllocation = async (params: {
  year: number;
  month: number;
}): Promise<OverheadAllocationPreview> => {
  const response = await api.post<OverheadAllocationPreview>(
    `${FINANCE_BASE}/closing/overhead-allocation/preview`,
    params,
  );
  return response.data;
};

export const executeOverheadAllocation = async (
  payload: OverheadAllocationExecutePayload,
): Promise<OverheadAllocationRun> => {
  const response = await api.post<OverheadAllocationRun>(
    `${FINANCE_BASE}/closing/overhead-allocation/execute`,
    payload,
  );
  return response.data;
};

// =========================================================================
// 12. PHASE 1 STATUTORY FOUNDATION (PIT WITHHOLDING & COMPARATIVE BASELINES)
// =========================================================================
export const getPitEntries = async (params: {
  taxYear: number;
  periodType: FilingFrequency;
  periodIndex: number;
}): Promise<PitLedgerSummary> => {
  const response = await api.get<PitLedgerSummary>(
    `${FINANCE_BASE}/statutory/pit-entries`,
    { params },
  );
  return response.data;
};

export const syncPitEntriesFromGl = async (payload: {
  taxYear: number;
  periodType: FilingFrequency;
  periodIndex: number;
}): Promise<PitLedgerSummary> => {
  const response = await api.post<PitLedgerSummary>(
    `${FINANCE_BASE}/statutory/pit-entries/sync-from-gl`,
    payload,
  );
  return response.data;
};

export const bulkUpsertPitEntries = async (payload: {
  taxYear: number;
  periodType: FilingFrequency;
  periodIndex: number;
  entries: PitEntryInput[];
}): Promise<PitLedgerSummary> => {
  const response = await api.put<PitLedgerSummary>(
    `${FINANCE_BASE}/statutory/pit-entries/bulk`,
    payload,
  );
  return response.data;
};

export const getComparativeBaselines = async (params: {
  fiscalYear: number;
  formCode?: ComparativeBaselineFormCode;
}): Promise<ComparativeBaselineResponse> => {
  const response = await api.get<ComparativeBaselineResponse>(
    `${FINANCE_BASE}/statutory/comparative-baselines`,
    { params },
  );
  return response.data;
};

export const upsertComparativeBaselines = async (payload: {
  fiscalYear: number;
  formCode: ComparativeBaselineFormCode;
  items: ComparativeBaselineItem[];
}): Promise<ComparativeBaselineResponse> => {
  const response = await api.put<ComparativeBaselineResponse>(
    `${FINANCE_BASE}/statutory/comparative-baselines`,
    payload,
  );
  return response.data;
};

// =========================================================================
// 13. PHASE 2 STATUTORY FILINGS, RECONCILIATION & FORM CONFIGS
// =========================================================================
export const getStatutoryPeriodOverview = async (params: {
  taxYear: number;
  periodType: StatutoryPeriodType;
  periodIndex: number;
}): Promise<StatutoryPeriodOverview> => {
  const response = await api.get<StatutoryPeriodOverview>(
    `${FINANCE_BASE}/statutory/period-overview`,
    { params },
  );
  return response.data;
};

export const getStatutoryFiling = async (
  formCode: StatutoryFormCode,
  params: {
    taxYear: number;
    periodType: StatutoryPeriodType;
    periodIndex: number;
    declarationKind?: DeclarationKind;
    supplementalSeq?: number;
  },
): Promise<StatutoryFiling | null> => {
  const response = await api.get<StatutoryFiling | null>(
    `${FINANCE_BASE}/statutory/filings/${formCode}`,
    { params },
  );
  return response.data;
};

export const computeStatutoryFiling = async (
  payload: StatutoryFilingComputeRequest,
): Promise<StatutoryFiling> => {
  const response = await api.post<StatutoryFiling>(
    `${FINANCE_BASE}/statutory/filings/compute`,
    payload,
  );
  return response.data;
};

export const reconcileStatutoryFiling = async (
  filingId: number,
): Promise<StatutoryFiling> => {
  const response = await api.post<StatutoryFiling>(
    `${FINANCE_BASE}/statutory/filings/${filingId}/reconcile`,
    {},
  );
  return response.data;
};

export const approveStatutoryFiling = async (
  filingId: number,
): Promise<StatutoryFiling> => {
  const response = await api.post<StatutoryFiling>(
    `${FINANCE_BASE}/statutory/filings/${filingId}/approve`,
    {},
  );
  return response.data;
};

export const exportStatutorySnapshot = async (
  filingId: number,
): Promise<StatutoryFiling> => {
  const response = await api.post<StatutoryFiling>(
    `${FINANCE_BASE}/statutory/filings/${filingId}/export-snapshot`,
    {},
  );
  return response.data;
};

export const markStatutoryFilingFiled = async (
  filingId: number,
  payload: StatutoryFilingMarkFiledRequest,
): Promise<StatutoryFiling> => {
  const response = await api.post<StatutoryFiling>(
    `${FINANCE_BASE}/statutory/filings/${filingId}/mark-filed`,
    payload,
  );
  return response.data;
};

export const getStatutoryIndicatorDrilldown = async (
  filingId: number,
  indicatorCode: string,
): Promise<StatutorySourceRef[]> => {
  const response = await api.get<
    StatutorySourceRef[] | { items?: StatutorySourceRef[] }
  >(`${FINANCE_BASE}/statutory/filings/${filingId}/drilldown`, {
    params: { indicatorCode },
  });
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data?.items || [];
};

export const getVoucherStatutoryImpact = async (
  voucherId: number,
): Promise<VoucherStatutoryImpactItem[]> => {
  const response = await api.get<
    VoucherStatutoryImpactItem[] | { items?: VoucherStatutoryImpactItem[] }
  >(`${FINANCE_BASE}/statutory/voucher-impact/${voucherId}`);
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data?.items || [];
};

export const getStatutoryFormConfigs = async (): Promise<StatutoryFormConfig[]> => {
  const response = await api.get<
    StatutoryFormConfig[] | { items?: StatutoryFormConfig[] }
  >(`${FINANCE_BASE}/statutory/form-configs`);
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data?.items || [];
};

export const updateStatutoryFormConfig = async (
  formCode: StatutoryFormCode,
  payload: StatutoryFormConfigUpdate,
): Promise<StatutoryFormConfig> => {
  const response = await api.put<StatutoryFormConfig>(
    `${FINANCE_BASE}/statutory/form-configs/${formCode}`,
    payload,
  );
  return response.data;
};

export const getTaxInvoiceWarnings = async (params: {
  year: number;
  month?: number;
  quarter?: number;
}): Promise<TaxInvoiceWarningSummary> => {
  const response = await api.get<TaxInvoiceWarningSummary>(
    `${FINANCE_BASE}/statutory/tax-invoice-warnings`,
    { params },
  );
  return response.data;
};

// =========================================================================
// 14. PHASE 4 HTKK XML EXPORT & SUPPLEMENTAL (01/KHBS)
// =========================================================================
export const getStatutoryXmlPreview = async (
  filingId: number,
): Promise<StatutoryXmlExportResponse> => {
  const response = await api.get<StatutoryXmlExportResponse>(
    `${FINANCE_BASE}/statutory/filings/${filingId}/xml-preview`,
  );
  return response.data;
};

export const downloadStatutoryXml = async (
  filingId: number,
  fallbackFilename = `HTKK_${filingId}.xml`,
): Promise<{ blob: Blob; filename: string; sha256: string | null }> => {
  const response = await api.get<Blob>(
    `${FINANCE_BASE}/statutory/filings/${filingId}/export-xml`,
    { responseType: 'blob' },
  );
  const headers = response.headers as Record<string, string | undefined>;
  const filename = getFilenameFromContentDisposition(
    headers['content-disposition'],
    fallbackFilename,
  );
  const sha256 = headers['x-export-sha256'] ?? null;
  const blob =
    response.data instanceof Blob
      ? response.data
      : new Blob([response.data], { type: 'application/xml' });
  await downloadOrShareBlob(blob, filename, 'application/xml');
  return { blob, filename, sha256 };
};

export const createSupplementalFiling = async (
  payload: StatutorySupplementalCreatePayload,
): Promise<StatutoryFiling> => {
  const response = await api.post<StatutoryFiling>(
    `${FINANCE_BASE}/statutory/filings/supplemental`,
    payload,
  );
  return response.data;
};

export const getSupplementalFilingDiff = async (
  filingId: number,
): Promise<StatutorySupplementalDiffResponse> => {
  const response = await api.get<StatutorySupplementalDiffResponse>(
    `${FINANCE_BASE}/statutory/filings/${filingId}/supplemental-diff`,
  );
  return response.data;
};

export const getStatutoryFilingHistory = async (params: {
  taxYear: number;
  periodType: StatutoryPeriodType;
  periodIndex: number;
  formCode?: StatutoryFormCode;
}): Promise<StatutoryFiling[]> => {
  const response = await api.get<StatutoryFiling[] | { items?: StatutoryFiling[] }>(
    `${FINANCE_BASE}/statutory/filings/history`,
    { params },
  );
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data?.items || [];
};

export interface CashflowBackfillResponse {
  scannedCount: number;
  updatedGlCount: number;
  updatedVoucherLineCount: number;
  skippedInternalCount: number;
  message: string;
}

export const backfillStatutoryCashflowCodes = async (payload?: {
  taxYear?: number;
  periodType?: StatutoryPeriodType;
  periodIndex?: number;
}): Promise<CashflowBackfillResponse> => {
  const response = await api.post<CashflowBackfillResponse>(
    `${FINANCE_BASE}/statutory/cashflow/backfill`,
    payload ?? {},
  );
  return response.data;
};
