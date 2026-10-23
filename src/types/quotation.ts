// Module 003: Step 2 Live Pricing Engine & Quotation
export interface ProjectQuotationPreviewRequest {
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
  status?: 'draft' | 'sent' | 'accepted' | 'rejected';
  kind?: 'main' | 'change_order';
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
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  kind: 'main' | 'change_order';
  isSelected: boolean;
  isLocked: boolean;
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
