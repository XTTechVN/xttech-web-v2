// Module 003: Step 2 Live Pricing Engine & Quotation

/**
 * Vòng duyệt báo giá: draft -> pending_approval (chờ admin) -> approved -> sent (chờ khách)
 * -> accepted | rejected. superseded: đã có phiên bản mới; not_chosen: phương án khách không chọn.
 */
export type QuotationStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'superseded'
  | 'not_chosen';

export interface ProjectQuotationPreviewRequest {
  /** Báo giá cho phương án thiết kế đang chào (bỏ trống = cửa chính thức) */
  designOptionId?: number | null;
  scopeType?: 'all' | 'by_floor';
  floorIds?: number[];
  laborCalcUnit?: 'vnd_per_m2' | 'vnd_per_kg';
  laborProductionRate?: number;
  laborInstallRate?: number;
  laborCleanRate?: number;
  otherCost?: number;
  otherSellingPrice?: number;
  managementRatePercent?: number;
  pricingMode?: 'markup' | 'margin';
  markupPercent?: number;
  marginPercent?: number;
  discountPercent?: number;
  vatPercent?: number;
  accessoryMode?: 'combined' | 'separated';
  customSellingPrices?: Record<number, number>;
  customAccessoryPrices?: Record<number, number>;
}

export interface QuotationDoorItemSnapshot {
  positionId: number;
  positionCode: string;
  positionName?: string | null;
  doorName: string;
  doorType?: string;
  floorId: number;
  floorName: string;
  width: number;
  height: number;
  areaM2: number;
  aluminumKg: number;
  materialCost: number;
  laborCost: number;
  aluminumWasteCost: number;
  costPrice: number;
  suggestedPrice: number;
  sellingPrice: number;
  isManuallyEdited: boolean;
  isBelowCost: boolean;
  accessoryMode: 'combined' | 'separated';
  accessoryCost: number;
  accessorySuggestedPrice: number;
  accessorySellingPrice: number;
  doorOnlyCostPrice: number;
  doorOnlySuggestedPrice: number;
  doorOnlySellingPrice: number;
}

export interface ProjectQuotationPreviewResponse {
  items: QuotationDoorItemSnapshot[];
  totalPositions: number;
  totalAreaM2: number;
  totalAluminumKg: number;
  materialCost: number;
  laborCost: number;
  aluminumWasteCost: number;
  otherCost: number;
  otherSellingPrice: number;
  workshopPrice: number;
  subtotalSellingPrice: number;
  discountAmount: number;
  totalAmountBeforeVat: number;
  totalProfit: number;
  effectiveMarginPercent: number;
  vatAmount: number;
  totalAmount: number;
  warningFlags: string[];
  isLoss: boolean;
}

export interface ProjectQuotationCreatePayload extends ProjectQuotationPreviewRequest {
  projectId: number;
  name: string;
  note?: string;
  kind?: 'main' | 'change_order';
}

export type ProjectQuotationUpdatePayload = Partial<ProjectQuotationPreviewRequest> & {
  name?: string;
  note?: string;
};

export interface ProjectQuotationSyncPayload {
  designOptionId?: number | null;
  note?: string;
  customSellingPrices?: Record<number, number>;
  customAccessoryPrices?: Record<number, number>;
}

export interface QuotationDiffSummary {
  addedCount: number;
  modifiedCount: number;
  removedCount: number;
  unchangedCount: number;
  addedPositionIds: number[];
  removedPositionIds: number[];
  modifiedPositionIds: number[];
}

export interface ProjectQuotationQueryParams {
  projectId?: number;
  status?: QuotationStatus;
  kind?: 'main' | 'change_order';
  designOptionId?: number;
  isSelected?: boolean;
  code?: string;
  offset?: number;
  limit?: number;
}

export interface ProjectQuotationItem {
  id: number;
  projectId: number;
  code: string;
  name: string;
  version: number;
  status: QuotationStatus;
  kind: 'main' | 'change_order';
  isSelected: boolean;
  isLocked: boolean;
  designOptionId?: number | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
  /** Ghi chú duyệt / lý do admin trả lại */
  reviewNote?: string | null;
  customerDecidedAt?: string | null;
  /** Ghi chú / lý do khách từ chối */
  customerNote?: string | null;
  scopeType: 'all' | 'by_floor';
  laborCalcUnit: 'vnd_per_m2' | 'vnd_per_kg';
  laborProductionRate: number;
  laborInstallRate: number;
  laborCleanRate: number;
  materialCost: number;
  laborCost: number;
  aluminumWasteCost: number;
  otherCost: number;
  otherSellingPrice: number;
  managementRatePercent: number;
  pricingMode: 'markup' | 'margin';
  markupPercent: number;
  marginPercent: number;
  accessoryMode: 'combined' | 'separated';
  workshopPrice: number;
  subtotalSellingPrice: number;
  discountAmount: number;
  discountPercent: number;
  totalAmountBeforeVat: number;
  vatAmount: number;
  vatPercent: number;
  totalAmount: number;
  totalProfit: number;
  effectiveMarginPercent: number;
  snapshotItems: QuotationDoorItemSnapshot[];
  floorIds: number[];
  isOutdated: boolean;
  outdatedReason?: string | null;
  diffSummary?: QuotationDiffSummary | null;
  createdAt: string;
  updatedAt: string;
  note?: string | null;
}

export interface ProjectQuotationDetail extends ProjectQuotationItem {
  quotationFloors: unknown[];
}

// Bảng báo giá theo tầng (xem trước / in / xuất Excel)
export type QuotationAccessoryMode = 'combined' | 'separated';
export type QuotationSheetRowType = 'door' | 'accessory' | 'extra';
export type QuotationSheetUnit = 'm2' | 'set';

export interface QuotationSheetRow {
  rowType: QuotationSheetRowType;
  orderNumber?: number | null;
  positionCode: string;
  description: string;
  unit: QuotationSheetUnit;
  width?: number | null;
  height?: number | null;
  quantity: number;
  areaM2?: number | null;
  unitPrice: number;
  amount: number;
  imagePath?: string | null;
  systemConfig?: Record<string, unknown> | null;
}

export interface QuotationSheetFloor {
  floorId: number;
  floorName: string;
  rows: QuotationSheetRow[];
  totalQuantity: number;
  totalAreaM2: number;
  totalAmount: number;
}

export interface QuotationSheet {
  quotationId: number;
  quotationCode: string;
  quotationNote?: string | null;
  accessoryMode: QuotationAccessoryMode;
  isOutdated: boolean;
  sheetDate: string;
  customerName: string;
  customerPhone: string;
  siteAddress: string;
  contractCode?: string | null;
  advanceDate?: string | null;
  floors: QuotationSheetFloor[];
  extraRows: QuotationSheetRow[];
  totalQuantity: number;
  totalAreaM2: number;
  subtotalAmount: number;
  discountPercent: number;
  discountAmount: number;
  payableAmount: number;
  payableInWords: string;
}

// ---------- Duyệt báo giá ----------
export interface QuotationCustomerAcceptPayload {
  customerSignature?: import('./handover').SignatureInput;
  note?: string;
}

/** Một dòng trong màn hình admin theo dõi toàn bộ báo giá */
export interface QuotationOverviewItem {
  id: number;
  code: string;
  name: string;
  version: number;
  status: QuotationStatus;
  totalAmount: number;
  effectiveMarginPercent: number;
  discountPercent: number;
  projectId: number;
  projectCode: string;
  projectName: string;
  customerName?: string | null;
  designOptionId?: number | null;
  designOptionName?: string | null;
  submittedAt?: string | null;
  submittedByName?: string | null;
  approvedAt?: string | null;
  approvedByName?: string | null;
  customerDecidedAt?: string | null;
  reviewNote?: string | null;
  customerNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationOverviewParams {
  status?: QuotationStatus;
  projectId?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface QuotationOverview {
  items: QuotationOverviewItem[];
  total: number;
  /** Số báo giá đang xử lý theo trạng thái */
  statusCounts: Partial<Record<QuotationStatus, number>>;
}

// ---------- Phương án thiết kế chào song song ----------
export type DesignOptionStatus = 'open' | 'chosen' | 'not_chosen';

export interface DesignOption {
  id: number;
  projectId: number;
  code: string;
  name: string;
  status: DesignOptionStatus;
  note?: string | null;
  decidedAt?: string | null;
  positionCount: number;
  createdAt: string;
}

export interface DesignOptionCreatePayload {
  name: string;
  note?: string;
  /** Chuyển các cửa chính thức chưa ký hợp đồng vào phương án */
  movePositionIds?: number[];
  /** Nhân bản toàn bộ cửa của phương án khác */
  copyFromOptionId?: number;
}
