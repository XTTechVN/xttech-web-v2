export type AccountingRegime = 'tt200' | 'tt133';

export type AccountRegimeScope = 'tt200' | 'tt133' | 'both';

export type AccountNature = 'debit' | 'credit' | 'both' | 'no_balance';

export type AccountCategory =
  | 'asset'
  | 'liability'
  | 'equity'
  | 'revenue'
  | 'expense'
  | 'summary';

export type CostFlowType = 'expense' | 'income' | 'both';

export type CostGroup =
  | 'direct_material'
  | 'direct_labor'
  | 'factory_overhead'
  | 'subcontract'
  | 'selling'
  | 'admin'
  | 'other';

export type VoucherType =
  | 'cash_receipt'
  | 'cash_payment'
  | 'bank_receipt'
  | 'bank_payment'
  | 'general_journal'
  | 'closing_entry'
  | 'opening_balance';

export type VoucherStatus = 'draft' | 'posted' | 'voided';

export type ReportViewMode = 'all' | 'tax_deductible_only' | 'non_deductible_only';

export type PartnerType = 'customer' | 'supplier' | 'employee' | 'other';

export type VatRate = '0' | '5' | '8' | '10' | 'kct' | 'kknt';

export type TaxInvoiceDirection = 'input' | 'output';

export type TaxInvoiceStatus = 'active' | 'cancelled' | 'adjusted' | 'replaced';

export type VoucherLineKind = 'principal' | 'vat' | 'closing';

export type SourceQueueType =
  | 'project_payment'
  | 'warehouse_receipt'
  | 'glass_order'
  | 'payroll';

export type FinanceTabKey =
  | 'overview'
  | 'cash'
  | 'bank'
  | 'ar_ap'
  | 'gl_closing'
  | 'tax'
  | 'reports'
  | 'settings';

// =========================================================================
// 1. FINANCE SETTINGS & SEEDING
// =========================================================================
export type OverheadAllocationBasis =
  | 'direct_cost_621_622'
  | 'material_621'
  | 'labor_622';

export type CashCountStatus = 'draft' | 'confirmed' | 'voided';

export interface FinanceSetting {
  id: number;
  code: string;
  accountingRegime: AccountingRegime;
  fiscalYearStartMonth: number;
  nonCashVatThreshold: number;
  enforceMakerChecker?: boolean;
  nonInvoiceMediumThreshold?: number;
  nonInvoiceLargeThreshold?: number;
  defaultCashAccountCode: string;
  defaultBankAccountCode: string;
  defaultVatInputCode: string;
  defaultVatOutputCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceSettingUpdate {
  accountingRegime?: AccountingRegime;
  fiscalYearStartMonth?: number;
  nonCashVatThreshold?: number;
  enforceMakerChecker?: boolean;
  nonInvoiceMediumThreshold?: number;
  nonInvoiceLargeThreshold?: number;
  defaultCashAccountCode?: string;
  defaultBankAccountCode?: string;
  defaultVatInputCode?: string;
  defaultVatOutputCode?: string;
}

export interface FinanceSeedResult {
  regime?: AccountingRegime;
  accountsCreated: number;
  accountsSkipped: number;
  costItemsCreated: number;
  templatesCreated: number;
  settingCreated: boolean;
  message?: string | null;
}

// =========================================================================
// 2. CHART OF ACCOUNTS (HỆ THỐNG TÀI KHOẢN)
// =========================================================================
export interface Account {
  id: number;
  accountCode: string;
  name: string;
  englishName: string | null;
  regime: AccountRegimeScope;
  parentId: number | null;
  level: number;
  isPostable: boolean;
  nature: AccountNature;
  category: AccountCategory;
  trackCustomer: boolean;
  trackSupplier: boolean;
  trackEmployee: boolean;
  trackProject: boolean;
  trackCostItem: boolean;
  trackBankAccount: boolean;
  trackItem: boolean;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AccountTreeNode extends Account {
  children: AccountTreeNode[];
}

export interface AccountCreate {
  accountCode: string;
  name: string;
  englishName?: string | null;
  regime?: AccountRegimeScope;
  parentId?: number | null;
  level?: number;
  isPostable?: boolean;
  nature: AccountNature;
  category: AccountCategory;
  trackCustomer?: boolean;
  trackSupplier?: boolean;
  trackEmployee?: boolean;
  trackProject?: boolean;
  trackCostItem?: boolean;
  trackBankAccount?: boolean;
  trackItem?: boolean;
  isActive?: boolean;
}

export interface AccountUpdate {
  accountCode?: string;
  name?: string;
  englishName?: string | null;
  regime?: AccountRegimeScope;
  parentId?: number | null;
  level?: number;
  isPostable?: boolean;
  nature?: AccountNature;
  category?: AccountCategory;
  trackCustomer?: boolean;
  trackSupplier?: boolean;
  trackEmployee?: boolean;
  trackProject?: boolean;
  trackCostItem?: boolean;
  trackBankAccount?: boolean;
  trackItem?: boolean;
  isActive?: boolean;
}

export interface AccountQueryParams {
  search?: string;
  regime?: AccountRegimeScope;
  category?: AccountCategory;
  isPostable?: boolean;
  isActive?: boolean;
  parentId?: number;
  tree?: boolean;
  offset?: number;
  limit?: number;
}

// =========================================================================
// 3. BANK ACCOUNTS, COST ITEMS, AUTO POSTING TEMPLATES
// =========================================================================
export interface BankAccount {
  id: number;
  code: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  branchName: string | null;
  accountHolder: string;
  glAccountId: number;
  glAccountCode?: string | null;
  glAccountName?: string | null;
  openingBalance: number;
  currentBalance: number;
  jetpayStatus: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface BankAccountCreate {
  code: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  branchName?: string | null;
  accountHolder: string;
  glAccountId: number;
  openingBalance: number;
  jetpayStatus?: string;
  isActive?: boolean;
}

export interface BankAccountUpdate {
  code?: string;
  accountNumber?: string;
  bankCode?: string;
  bankName?: string;
  branchName?: string | null;
  accountHolder?: string;
  glAccountId?: number;
  openingBalance?: number;
  jetpayStatus?: string;
  isActive?: boolean;
}

export interface BankAccountQueryParams {
  search?: string;
  isActive?: boolean;
  offset?: number;
  limit?: number;
}

export interface CostItem {
  id: number;
  code: string;
  name: string;
  flowType: CostFlowType;
  costGroup: CostGroup;
  defaultIsTaxDeductible: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CostItemCreate {
  code: string;
  name: string;
  flowType: CostFlowType;
  costGroup: CostGroup;
  defaultIsTaxDeductible?: boolean;
  isActive?: boolean;
}

export interface CostItemUpdate {
  code?: string;
  name?: string;
  flowType?: CostFlowType;
  costGroup?: CostGroup;
  defaultIsTaxDeductible?: boolean;
  isActive?: boolean;
}

export interface CostItemQueryParams {
  search?: string;
  flowType?: CostFlowType;
  costGroup?: CostGroup;
  isActive?: boolean;
  offset?: number;
  limit?: number;
}

export interface AutoPostingTemplate {
  id: number;
  code: string;
  name: string;
  voucherType: VoucherType;
  regime: AccountingRegime;
  debitAccountId: number;
  debitAccountCode?: string | null;
  debitAccountName?: string | null;
  creditAccountId: number;
  creditAccountCode?: string | null;
  creditAccountName?: string | null;
  defaultCostItemId: number | null;
  defaultCostItemCode?: string | null;
  defaultCostItemName?: string | null;
  defaultHasValidInvoice: boolean;
  requiresProject: boolean;
  workshopVisible: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AutoPostingTemplateCreate {
  code: string;
  name: string;
  voucherType: VoucherType;
  regime: AccountingRegime;
  debitAccountId: number;
  creditAccountId: number;
  defaultCostItemId?: number | null;
  defaultHasValidInvoice: boolean;
  requiresProject?: boolean;
  workshopVisible?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

export interface AutoPostingTemplateUpdate {
  code?: string;
  name?: string;
  voucherType?: VoucherType;
  regime?: AccountingRegime;
  debitAccountId?: number;
  creditAccountId?: number;
  defaultCostItemId?: number | null;
  defaultHasValidInvoice?: boolean;
  requiresProject?: boolean;
  workshopVisible?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

export interface AutoPostingTemplateQueryParams {
  search?: string;
  voucherType?: VoucherType;
  regime?: AccountingRegime;
  workshopVisible?: boolean;
  isActive?: boolean;
  offset?: number;
  limit?: number;
}

// =========================================================================
// 4. VOUCHERS & TAX INVOICES
// =========================================================================
export interface VoucherAttachment {
  fileName: string;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  uploadedAt?: string | null;
}

export interface VoucherLine {
  id: number;
  voucherId: number;
  lineOrder: number;
  lineKind: VoucherLineKind;
  description: string;
  debitAccountId: number;
  debitAccountCode?: string | null;
  debitAccountName?: string | null;
  creditAccountId: number;
  creditAccountCode?: string | null;
  creditAccountName?: string | null;
  amount: number;
  debitBankAccountId: number | null;
  creditBankAccountId: number | null;
  projectId: number | null;
  projectCode?: string | null;
  projectName?: string | null;
  departmentId: number | null;
  departmentName?: string | null;
  costItemId: number | null;
  costItemCode?: string | null;
  costItemName?: string | null;
  customerId: number | null;
  customerName?: string | null;
  supplierId: number | null;
  supplierName?: string | null;
  warehouseItemId: number | null;
  warehouseItemName?: string | null;
  employeeId: string | null;
  employeeName?: string | null;
  quantity: number | null;
  unit: string | null;
  unitPrice: number | null;
  isTaxDeductible: boolean;
}

export type VoucherLineResponse = VoucherLine;

export interface VoucherLineInput {
  lineOrder?: number;
  lineKind?: VoucherLineKind;
  description: string;
  debitAccountId: number;
  creditAccountId: number;
  amount: number;
  debitBankAccountId?: number | null;
  creditBankAccountId?: number | null;
  projectId?: number | null;
  departmentId?: number | null;
  costItemId?: number | null;
  customerId?: number | null;
  supplierId?: number | null;
  warehouseItemId?: number | null;
  employeeId?: string | null;
  quantity?: number | null;
  unit?: string | null;
  unitPrice?: number | null;
  isTaxDeductible?: boolean | null;
}

export interface VatBreakdownItem {
  itemName?: string | null;
  vatRate: VatRate;
  taxableAmount: number;
  vatAmount: number;
  totalAmount: number;
}

export interface TaxInvoice {
  id: number;
  voucherId: number | null;
  voucherNo?: string | null;
  direction: TaxInvoiceDirection;
  invoiceTemplateCode: string | null;
  invoiceSeries: string;
  invoiceNumber: string;
  invoiceDate: string;
  partnerTaxCode: string;
  partnerName: string;
  partnerAddress: string | null;
  customerId: number | null;
  customerName?: string | null;
  supplierId: number | null;
  supplierName?: string | null;
  taxableAmount: number;
  vatRate: VatRate;
  vatAmount: number;
  totalAmount: number;
  vatAccountId: number | null;
  vatAccountCode?: string | null;
  vatBreakdown: VatBreakdownItem[];
  isTaxDeductible: boolean;
  xmlFileUrl: string | null;
  pdfFileUrl: string | null;
  xmlRawMeta: Record<string, unknown> | null;
  taxPeriodMonth: number;
  taxPeriodYear: number;
  status: TaxInvoiceStatus | string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export type TaxInvoiceResponse = TaxInvoice;

export interface TaxInvoiceCreate {
  voucherId?: number | null;
  direction: TaxInvoiceDirection;
  invoiceTemplateCode?: string | null;
  invoiceSeries: string;
  invoiceNumber: string;
  invoiceDate: string;
  partnerTaxCode: string;
  partnerName: string;
  partnerAddress?: string | null;
  customerId?: number | null;
  supplierId?: number | null;
  taxableAmount: number;
  vatRate: VatRate;
  vatAmount: number;
  totalAmount: number;
  vatAccountId?: number | null;
  vatBreakdown?: VatBreakdownItem[];
  isTaxDeductible?: boolean;
  xmlFileUrl?: string | null;
  pdfFileUrl?: string | null;
  xmlRawMeta?: Record<string, unknown> | null;
  taxPeriodMonth?: number;
  taxPeriodYear?: number;
}

export interface TaxInvoiceUpdate {
  voucherId?: number | null;
  direction?: TaxInvoiceDirection;
  invoiceTemplateCode?: string | null;
  invoiceSeries?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  partnerTaxCode?: string;
  partnerName?: string;
  partnerAddress?: string | null;
  customerId?: number | null;
  supplierId?: number | null;
  taxableAmount?: number;
  vatRate?: VatRate;
  vatAmount?: number;
  totalAmount?: number;
  vatAccountId?: number | null;
  vatBreakdown?: VatBreakdownItem[];
  isTaxDeductible?: boolean;
  xmlFileUrl?: string | null;
  pdfFileUrl?: string | null;
  xmlRawMeta?: Record<string, unknown> | null;
  taxPeriodMonth?: number;
  taxPeriodYear?: number;
  status?: TaxInvoiceStatus | string;
}

export interface TaxInvoiceQueryParams {
  search?: string;
  direction?: TaxInvoiceDirection;
  vatRate?: VatRate;
  taxPeriodMonth?: number;
  taxPeriodYear?: number;
  isTaxDeductible?: boolean;
  status?: string;
  partnerTaxCode?: string;
  voucherId?: number;
  fromDate?: string;
  toDate?: string;
  offset?: number;
  limit?: number;
}

export type TaxInvoiceExcelRowAction = 'create' | 'update_status' | 'duplicate' | 'error';

export interface TaxInvoiceExcelPreviewRow {
  rowNumber: number;
  action: TaxInvoiceExcelRowAction;
  direction: TaxInvoiceDirection;
  invoiceTemplateCode?: string | null;
  invoiceSeries: string;
  invoiceNumber: string;
  invoiceDate?: string | null;
  partnerTaxCode: string;
  partnerName: string;
  taxableAmount: number;
  vatRate: VatRate;
  vatAmount: number;
  totalAmount: number;
  status: string;
  gdtStatusText?: string | null;
  existingInvoiceId?: number | null;
  existingStatus?: string | null;
  postedVoucherNo?: string | null;
  itemCount: number;
  message?: string | null;
}

export interface TaxInvoiceExcelPostedWarning {
  invoiceId: number;
  invoiceSeries: string;
  invoiceNumber: string;
  partnerTaxCode: string;
  partnerName: string;
  voucherId: number;
  voucherNo: string;
  oldStatus: string;
  newStatus: string;
  message: string;
}

export interface TaxInvoiceExcelImportResponse {
  dryRun: boolean;
  direction: TaxInvoiceDirection;
  totalRows: number;
  createCount: number;
  updateStatusCount: number;
  duplicateCount: number;
  errorCount: number;
  rows: TaxInvoiceExcelPreviewRow[];
  postedVoucherWarnings: TaxInvoiceExcelPostedWarning[];
  errors: string[];
}

export interface ParsedEinvoiceXmlMeta {
  mccqt?: string | null;
  currencyCode?: string | null;
  sellerTaxCode?: string | null;
  sellerName?: string | null;
  sellerAddress?: string | null;
  buyerTaxCode?: string | null;
  buyerName?: string | null;
  buyerAddress?: string | null;
  rootTag?: string | null;
  [key: string]: unknown;
}

export interface ParsedEinvoiceXml {
  direction: TaxInvoiceDirection;
  invoiceTemplateCode: string | null;
  invoiceSeries: string;
  invoiceNumber: string;
  invoiceDate: string;
  partnerTaxCode: string;
  partnerName: string;
  partnerAddress: string | null;
  taxableAmount: number;
  vatRate: VatRate;
  vatAmount: number;
  totalAmount: number;
  vatBreakdown: VatBreakdownItem[];
  xmlFileUrl: string | null;
  xmlRawMeta: ParsedEinvoiceXmlMeta | null;
  suggestedSupplierId: number | null;
  suggestedCustomerId: number | null;
  isDuplicate: boolean;
  warnings: string[];
}

export interface VoucherSummary {
  id: number;
  voucherNo: string;
  voucherType: VoucherType;
  voucherDate: string;
  postingDate: string;
  status: VoucherStatus;
  hasValidInvoice: boolean;
  nonCashWarning: boolean;
  isTaxDeductible: boolean;
  bankAccountId: number | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  autoPostingTemplateId: number | null;
  partnerType: PartnerType | null;
  customerId: number | null;
  supplierId: number | null;
  employeeId: string | null;
  contactName: string | null;
  contactAddress: string | null;
  partnerName?: string | null;
  projectId: number | null;
  projectCode?: string | null;
  projectName?: string | null;
  departmentId: number | null;
  departmentName?: string | null;
  sourceType: SourceQueueType | string | null;
  sourceId: number | null;
  currencyCode: string;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  description: string;
  attachments: VoucherAttachment[];
  createdById: string | null;
  createdByName?: string | null;
  postedById: string | null;
  postedByName?: string | null;
  postedAt: string | null;
  voidedById: string | null;
  voidedAt: string | null;
  voidReason: string | null;
  approvedById?: string | null;
  approvedByName?: string | null;
  approvedAt?: string | null;
  approvalNote?: string | null;
  cashierConfirmedById?: string | null;
  cashierConfirmedByName?: string | null;
  cashierConfirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface VoucherDetail extends VoucherSummary {
  lines: VoucherLine[];
  taxInvoices: TaxInvoice[];
  amountInWords: string;
  nonCashWarningMessage?: string | null;
}

export interface VoucherCreate {
  voucherNo?: string | null;
  voucherType: VoucherType;
  voucherDate: string;
  postingDate?: string;
  hasValidInvoice: boolean;
  isTaxDeductible?: boolean | null;
  bankAccountId?: number | null;
  autoPostingTemplateId?: number | null;
  partnerType?: PartnerType | null;
  customerId?: number | null;
  supplierId?: number | null;
  employeeId?: string | null;
  contactName?: string | null;
  contactAddress?: string | null;
  projectId?: number | null;
  departmentId?: number | null;
  sourceType?: SourceQueueType | string | null;
  sourceId?: number | null;
  currencyCode?: string;
  subtotalAmount?: number | null;
  totalAmount?: number | null;
  description: string;
  attachments?: VoucherAttachment[];
  lines?: VoucherLineInput[];
  taxInvoiceIds?: number[];
}

export interface VoucherUpdate {
  voucherType?: VoucherType;
  voucherDate?: string;
  postingDate?: string;
  hasValidInvoice?: boolean;
  isTaxDeductible?: boolean | null;
  bankAccountId?: number | null;
  autoPostingTemplateId?: number | null;
  partnerType?: PartnerType | null;
  customerId?: number | null;
  supplierId?: number | null;
  employeeId?: string | null;
  contactName?: string | null;
  contactAddress?: string | null;
  projectId?: number | null;
  departmentId?: number | null;
  currencyCode?: string;
  description?: string;
  attachments?: VoucherAttachment[];
  lines?: VoucherLineInput[];
  taxInvoiceIds?: number[];
}

export interface VoucherQueryParams {
  search?: string;
  voucherType?: VoucherType;
  status?: VoucherStatus;
  hasValidInvoice?: boolean | null;
  isTaxDeductible?: boolean | null;
  bankAccountId?: number;
  projectId?: number;
  departmentId?: number;
  customerId?: number;
  supplierId?: number;
  employeeId?: string;
  partnerType?: PartnerType;
  sourceType?: SourceQueueType | string;
  fromDate?: string;
  toDate?: string;
  offset?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface VoucherVoidPayload {
  voidReason: string;
}

// =========================================================================
// 5. OPENING BALANCES, PERIOD LOCKS, SOURCE QUEUE & CLOSING
// =========================================================================
export interface OpeningBalanceEntry {
  accountId: number;
  accountCode: string;
  accountName: string;
  nature: AccountNature;
  debitBalance: number;
  creditBalance: number;
  bankAccountId?: number | null;
  bankAccountNumber?: string | null;
  customerId?: number | null;
  customerName?: string | null;
  supplierId?: number | null;
  supplierName?: string | null;
  projectId?: number | null;
  projectName?: string | null;
  note?: string | null;
}

export interface OpeningBalanceInputItem {
  accountId: number;
  debitBalance: number;
  creditBalance: number;
  bankAccountId?: number | null;
  customerId?: number | null;
  supplierId?: number | null;
  projectId?: number | null;
  note?: string | null;
}

export interface OpeningBalanceUpsertPayload {
  effectiveDate: string;
  description?: string;
  entries: OpeningBalanceInputItem[];
}

export type OpeningBalanceUpsertRequest = OpeningBalanceUpsertPayload;

export interface PeriodLock {
  id: number;
  year: number;
  month: number;
  isLocked: boolean;
  lockedById: string | null;
  lockedByName?: string | null;
  lockedAt: string | null;
  isTaxFiled?: boolean;
  taxFiledAt?: string | null;
  taxFiledById?: string | null;
  taxFiledByName?: string | null;
  taxFilingRef?: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PeriodLockActionPayload {
  year: number;
  month: number;
  note?: string | null;
}

export interface PeriodMarkTaxFiledPayload {
  year: number;
  month: number;
  taxFilingRef?: string | null;
  note?: string | null;
}

export interface SourceQueueItem {
  sourceType: SourceQueueType | string;
  sourceId: number;
  sourceCode: string;
  sourceDate: string;
  title: string;
  description: string;
  amount: number;
  partnerType: PartnerType | null;
  partnerId?: number | null;
  partnerName: string | null;
  projectId: number | null;
  projectCode?: string | null;
  projectName?: string | null;
  suggestedVoucherType: VoucherType;
  suggestedHasValidInvoice: boolean;
  suggestedTemplateId?: number | null;
  suggestedBankAccountId?: number | null;
  suggestedDebitAccountId?: number | null;
  suggestedCreditAccountId?: number | null;
  suggestedCostItemId?: number | null;
  alreadyImported: boolean;
  existingVoucherId?: number | null;
  existingVoucherNo?: string | null;
}

export interface SourceQueueQueryParams {
  sourceType?: SourceQueueType | string;
  includeImported?: boolean;
  fromDate?: string;
  toDate?: string;
  search?: string;
  offset?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SourceQueueImportPayload {
  sourceType: SourceQueueType | string;
  sourceId: number;
  voucherType?: VoucherType;
  autoPostingTemplateId?: number | null;
  bankAccountId?: number | null;
  debitAccountId?: number | null;
  creditAccountId?: number | null;
  costItemId?: number | null;
  hasValidInvoice?: boolean;
  voucherDate?: string;
  postingDate?: string;
  description?: string;
  autoPost?: boolean;
}

export type SourceQueueImportRequest = SourceQueueImportPayload;

export interface ClosingPreviewLine {
  accountId: number;
  accountCode: string;
  accountName: string;
  category: AccountCategory;
  debitBalance: number;
  creditBalance: number;
  closingAmount: number;
  isTaxDeductible: boolean;
  transferDirection: 'to_911_debit' | 'to_911_credit' | 'profit_to_4212' | 'loss_to_4212';
}

export interface ClosingPreview {
  year: number;
  month: number;
  periodEndDate: string;
  isPeriodLocked: boolean;
  revenueTotal: number;
  expenseTotal: number;
  netProfitBeforeTax: number;
  b4NonDeductibleTotal: number;
  accountingProfit: number;
  nonDeductibleExpenseTotal: number;
  nonDeductibleInventoryWipTotal: number;
  taxableIncome: number;
  estimatedCitAmount: number;
  taxSavingsLostEstimate: number;
  items: ClosingPreviewLine[];
  alreadyClosedVoucherId?: number | null;
  alreadyClosedVoucherNo?: string | null;
  hasUnallocatedOverhead?: boolean;
}

export type ClosingPreviewResponse = ClosingPreview;

export interface ClosingExecutePayload {
  year: number;
  month: number;
  postingDate?: string;
  description?: string;
  autoPost?: boolean;
}

export type ClosingExecuteRequest = ClosingExecutePayload;

export interface ClosingExecuteResponse {
  vouchers: VoucherDetail[];
  closedCount: number;
  netProfitBeforeTax: number;
  b4NonDeductibleTotal: number;
  accountingProfit: number;
  nonDeductibleExpenseTotal: number;
  nonDeductibleInventoryWipTotal: number;
  taxableIncome: number;
  estimatedCitAmount: number;
  taxSavingsLostEstimate: number;
  message?: string | null;
}

// =========================================================================
// 6. LEDGERS, REPORTS & DASHBOARD
// =========================================================================
export interface CashbookQueryParams {
  fromDate?: string;
  toDate?: string;
}

export interface CashbookEntry {
  id: number;
  voucherId: number;
  voucherNo: string;
  voucherType: VoucherType;
  voucherDate: string;
  postingDate: string;
  description: string;
  partnerName: string | null;
  contraAccountCode: string | null;
  contraAccountName: string | null;
  receiptAmount: number;
  paymentAmount: number;
  runningBalance: number;
  isTaxDeductible: boolean;
  hasValidInvoice: boolean;
}

export interface CashbookReport {
  fromDate: string;
  toDate: string;
  openingBalance: number;
  totalReceipt: number;
  totalPayment: number;
  closingBalance: number;
  pendingDraftCount: number;
  pendingDraftAmount: number;
  items: CashbookEntry[];
}

export type CashbookReportResponse = CashbookReport;

export interface GeneralLedgerQueryParams {
  accountId?: number;
  accountCode?: string;
  fromDate: string;
  toDate: string;
  reportViewMode?: ReportViewMode;
  bankAccountId?: number;
  projectId?: number;
  partnerType?: PartnerType;
  customerId?: number;
  supplierId?: number;
  employeeId?: string;
}

export interface GeneralLedgerEntry {
  id: number;
  voucherId: number;
  voucherNo: string;
  voucherType: VoucherType;
  voucherDate: string;
  postingDate: string;
  accountId: number;
  accountCode: string;
  accountName: string;
  contraAccountId: number;
  contraAccountCode: string;
  contraAccountName: string;
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
  isTaxDeductible: boolean;
  projectId: number | null;
  projectCode?: string | null;
  projectName?: string | null;
  partnerName?: string | null;
  costItemName?: string | null;
  description: string;
}

export interface GeneralLedgerReport {
  accountId: number | null;
  accountCode: string | null;
  accountName: string | null;
  fromDate: string;
  toDate: string;
  reportViewMode: ReportViewMode;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
  items: GeneralLedgerEntry[];
}

export interface TrialBalanceQueryParams {
  fromDate: string;
  toDate: string;
  includeZeroBalance?: boolean;
}

export interface TrialBalanceRow {
  accountId: number;
  accountCode: string;
  accountName: string;
  level: number;
  nature: AccountNature;
  category: AccountCategory;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
}

export interface TrialBalanceReport {
  fromDate: string;
  toDate: string;
  rows: TrialBalanceRow[];
  totalOpeningDebit: number;
  totalOpeningCredit: number;
  totalPeriodDebit: number;
  totalPeriodCredit: number;
  totalClosingDebit: number;
  totalClosingCredit: number;
}

export type TrialBalanceResponse = TrialBalanceReport;

export interface ProjectPnlQueryParams {
  fromDate?: string;
  toDate?: string;
  reportViewMode?: ReportViewMode;
  projectId?: number;
}

export interface ProjectPnlRow {
  projectId: number;
  projectCode: string;
  projectName: string;
  customerName?: string | null;
  contractRevenue: number;
  directMaterialCost: number;
  directLaborCost: number;
  factoryOverheadCost: number;
  subcontractCost: number;
  otherExpenseCost: number;
  totalCost: number;
  recognizedCogs?: number;
  nonDeductibleCost: number;
  grossProfit: number;
  grossMarginPct: number;
  collectedAmount: number;
  receivableAmount: number;
}

export interface ProjectPnlReport {
  fromDate: string | null;
  toDate: string | null;
  reportViewMode: ReportViewMode;
  rows: ProjectPnlRow[];
  totalRevenue: number;
  totalCost: number;
  totalGrossProfit: number;
}

export interface CashflowQueryParams {
  fromDate: string;
  toDate: string;
  granularity?: 'day' | 'month';
}

export interface CashflowSeriesItem {
  periodKey: string;
  periodLabel: string;
  cashIn: number;
  cashOut: number;
  bankIn: number;
  bankOut: number;
  totalIn: number;
  totalOut: number;
  netCashflow: number;
  cumulativeBalance: number;
}

export interface CashflowReport {
  fromDate: string;
  toDate: string;
  granularity: 'day' | 'month';
  totalIn: number;
  totalOut: number;
  netCashflow: number;
  series: CashflowSeriesItem[];
}

export interface VatLedgerQueryParams {
  year: number;
  month?: number;
  quarter?: number;
}

export interface VatLedgerReport {
  year: number;
  month: number | null;
  quarter: number | null;
  inputInvoices: TaxInvoice[];
  outputInvoices: TaxInvoice[];
  totalInputTaxable: number;
  totalInputVat: number;
  deductibleInputVat: number;
  nonDeductibleInputVat: number;
  totalOutputTaxable: number;
  totalOutputVat: number;
  netVatPayable: number;
  vatCarriedForward: number;
}

export interface NonDeductibleQueryParams {
  fromDate: string;
  toDate: string;
}

export interface NonDeductibleReport {
  fromDate: string;
  toDate: string;
  totalNonDeductibleAmount: number;
  accountingProfit: number;
  nonDeductibleExpenseTotal: number;
  nonDeductibleInventoryWipTotal: number;
  taxableIncome: number;
  estimatedCitAmount: number;
  taxSavingsLostEstimate: number;
  items: VoucherSummary[];
}

export interface ArApAgingQueryParams {
  kind: 'receivable' | 'payable';
  asOfDate?: string;
  search?: string;
}

export interface ArApAgingItem {
  partnerType: PartnerType;
  partnerId: number;
  employeeId?: string | null;
  partnerCode?: string | null;
  partnerName: string;
  partnerPhone?: string | null;
  totalDebit: number;
  totalCredit: number;
  netBalance: number;
  currentAmount: number;
  overdue1To30: number;
  overdue31To60: number;
  overdue61To90: number;
  overdueOver90: number;
}

export interface ArApAgingReport {
  asOfDate: string;
  kind: 'receivable' | 'payable';
  totalBalance: number;
  items: ArApAgingItem[];
}

export interface FinanceDashboardQueryParams {
  fromDate?: string;
  toDate?: string;
}

export interface DashboardBankAccountSummaryItem {
  id: number;
  code: string;
  bankName: string;
  accountNumber: string;
  bookBalance: number;
}

export interface FinanceDashboard {
  cashBalance: number;
  totalBankBalance: number;
  totalLiquidFunds: number;
  bankAccountsSummary: DashboardBankAccountSummaryItem[];
  pendingCashDraftCount: number;
  pendingCashDraftAmount: number;
  revenueTotal: number;
  expenseTotal: number;
  taxDeductibleExpenseTotal: number;
  accountingProfit: number;
  nonDeductibleExpenseTotal: number;
  nonDeductibleInventoryWipTotal: number;
  taxableIncome: number;
  estimatedCitAmount: number;
  taxSavingsLostEstimate: number;
  totalReceivable: number;
  totalPayable: number;
  pendingPostCount: number;
  pendingSourceQueueCount: number;
  nonCashWarningCount: number;
  recentVouchers: VoucherSummary[];
  cashflowSeries: CashflowSeriesItem[];
}

// =========================================================================
// 7. BATCH 1A CONTROLS, RBAC, AUDIT LOGS, CASH COUNT & OVERHEAD ALLOCATION
// =========================================================================
export interface FinanceUserPermission {
  userId: string;
  userName?: string | null;
  username: string;
  email?: string | null;
  roles: string[];
  canCreateVoucher: boolean;
  canPostVoucher: boolean;
  canUnpostVoucher: boolean;
  canCashierConfirm: boolean;
  canLockPeriod: boolean;
  canApproveNonInvoice: boolean;
  canManageSettings: boolean;
  isDefaultFallback: boolean;
  updatedAt?: string | null;
}

export interface FinanceUserPermissionUpdate {
  canCreateVoucher?: boolean;
  canPostVoucher?: boolean;
  canUnpostVoucher?: boolean;
  canCashierConfirm?: boolean;
  canLockPeriod?: boolean;
  canApproveNonInvoice?: boolean;
  canManageSettings?: boolean;
}

export interface FinanceUserPermissionQueryParams {
  search?: string;
  offset?: number;
  limit?: number;
}

export interface FinanceAuditLog {
  id: number;
  entityType: string;
  entityId: string;
  action: string;
  reason: string;
  actorId?: string | null;
  actorName?: string | null;
  beforeSnapshot?: Record<string, unknown> | null;
  afterSnapshot?: Record<string, unknown> | null;
  createdAt: string;
}

export interface FinanceAuditLogQueryParams {
  entityType?: string;
  entityId?: string;
  action?: string;
  search?: string;
  offset?: number;
  limit?: number;
}

export interface VoucherUnpostPayload {
  reason: string;
}

export interface VoucherInternalApprovePayload {
  approvalNote?: string | null;
}

export interface CashCountDenominationItem {
  denomination: number;
  quantity: number;
  subtotal: number;
}

export interface CashCountMinute {
  id: number;
  minuteNo: string;
  countDate: string;
  bookBalance: number;
  actualBalance: number;
  differenceAmount: number;
  differenceReason?: string | null;
  denominationBreakdown: CashCountDenominationItem[];
  cashierId?: string | null;
  cashierName?: string | null;
  accountantId?: string | null;
  accountantName?: string | null;
  witnessName?: string | null;
  status: CashCountStatus;
  confirmedAt?: string | null;
  confirmedById?: string | null;
  confirmedByName?: string | null;
  adjustmentVoucherId?: number | null;
  adjustmentVoucherNo?: string | null;
  createdById?: string | null;
  createdByName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CashCountMinuteCreate {
  countDate: string;
  denominationBreakdown: CashCountDenominationItem[];
  differenceReason?: string | null;
  cashierId?: string | null;
  accountantId?: string | null;
  witnessName?: string | null;
}

export interface CashCountQueryParams {
  status?: CashCountStatus;
  fromDate?: string;
  toDate?: string;
  search?: string;
  offset?: number;
  limit?: number;
}

export interface CashCountVoidPayload {
  reason: string;
}

export interface FiscalYearConfig {
  id: number;
  fiscalYear: number;
  overheadAllocationBasis: OverheadAllocationBasis;
  basisChangedMidYear: boolean;
  basisChangeDisclosure?: string | null;
  priorYearRevenue?: number | null;
  citRatePercent: number;
  lossCarryforwardAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FiscalYearConfigUpdate {
  overheadAllocationBasis?: OverheadAllocationBasis;
  priorYearRevenue?: number | null;
  citRatePercent?: number;
  lossCarryforwardAmount?: number;
  reason?: string | null;
}

export interface OverheadAllocationProjectShare {
  projectId: number;
  projectCode: string;
  projectName: string;
  baseAmount: number;
  ratioPercent: number;
  allocatedDeductible: number;
  allocatedNonDeductible: number;
}

export interface OverheadAllocationPreview {
  year: number;
  month: number;
  accountingRegime: AccountingRegime;
  allocationBasis: OverheadAllocationBasis;
  basisChangedMidYear: boolean;
  basisChangeDisclosure?: string | null;
  totalPoolDeductible: number;
  totalPoolNonDeductible: number;
  totalBaseAmount: number;
  unallocatedToCogsDeductible: number;
  unallocatedToCogsNonDeductible: number;
  isIdleCapacityToCogs: boolean;
  alreadyAllocatedRunId?: number | null;
  alreadyAllocatedVoucherNo?: string | null;
  shares: OverheadAllocationProjectShare[];
}

export interface OverheadAllocationRun {
  id: number;
  fiscalYear: number;
  periodMonth: number;
  accountingRegime: AccountingRegime;
  allocationBasis: OverheadAllocationBasis;
  voucherId?: number | null;
  voucherNo?: string | null;
  totalPoolDeductible: number;
  totalPoolNonDeductible: number;
  unallocatedToCogsAmount: number;
  status: string;
  allocationDetails: OverheadAllocationProjectShare[];
  createdById?: string | null;
  createdByName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OverheadAllocationExecutePayload {
  year: number;
  month: number;
  postingDate?: string | null;
  description?: string | null;
}
