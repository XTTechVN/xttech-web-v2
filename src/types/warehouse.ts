export type SupplierType = 'aluminum' | 'accessory' | 'glass' | 'consumable';

export type WarehouseItemType = 'profile' | 'accessory' | 'consumable';

export type WarehouseUnit = 'bar' | 'set' | 'pcs' | 'meter' | 'box' | 'bottle';

export type ReceiptType = 'import' | 'export';

export type ReceiptReason =
  | 'purchase'
  | 'offcut_return'
  | 'production_issue'
  | 'rework_issue'
  | 'adjustment'
  | 'scrap';

export type ImportReceiptReason = 'purchase' | 'offcut_return' | 'adjustment';
export type ExportReceiptReason = 'production_issue' | 'rework_issue' | 'adjustment' | 'scrap';

export type ReceiptStatus = 'draft' | 'approved' | 'cancelled';

export type GlassOrderStatus = 'draft' | 'ordered' | 'delivered' | 'assembled';

export type GlassPaneSource = 'door' | 'manual';

export type ManualReason = 'spare' | 'replacement' | 'extra' | 'other';

// Supplier
export interface WarehouseSupplier {
  id: number;
  code: string;
  name: string;
  supplierType: SupplierType;
  phone: string;
  contactName?: string | null;
  address?: string | null;
  taxCode?: string | null;
  bankAccount?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface WarehouseSupplierCreatePayload {
  name: string;
  supplierType: SupplierType;
  phone: string;
  contactName?: string;
  address?: string;
  taxCode?: string;
  bankAccount?: string;
  isActive?: boolean;
}

export interface SuppliedItemSummary {
  itemId?: number | null;
  itemCode: string;
  itemName: string;
  itemType: WarehouseItemType | string;
  unit: string;
  totalImportedQty: number;
  lastUnitPrice: number;
  lastImportDate: string;
  currentStock: number;
  availableStock: number;
}

export interface SupplierGlassOrderSummary {
  id: number;
  code: string;
  projectId: number;
  projectName?: string | null;
  totalPanes: number;
  totalAmount: number;
  totalAreaM2: number;
  expectedDate?: string | null;
  status: GlassOrderStatus;
  createdAt: string;
}

export interface SupplierDetailAnalyticsResponse {
  supplier: WarehouseSupplier;
  suppliedItems: SuppliedItemSummary[];
  receipts: WarehouseReceipt[];
  glassOrders: SupplierGlassOrderSummary[];
}

// Warehouse Item
export interface WarehouseItem {
  id: number;
  itemCode: string;
  itemName: string;
  itemType: WarehouseItemType;
  unit: string;
  profileBarId?: number | null;
  colorId?: number | null;
  colorName?: string | null;
  brandName?: string | null;
  standardLengthMm: number;
  currentStock: number;
  reservedQty: number;
  availableStock: number;
  minStockLevel: number;
  costPrice: number;
  location?: string | null;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseItemCreatePayload {
  itemCode: string;
  itemName: string;
  itemType: WarehouseItemType;
  unit: string;
  profileBarId?: number | null;
  colorId?: number | null;
  standardLengthMm?: number;
  currentStock?: number;
  minStockLevel?: number;
  costPrice?: number;
  location?: string | null;
}

// Warehouse Offcut
export interface WarehouseOffcut {
  id: number;
  profileBarId: number;
  profileBarCode?: string | null;
  profileBarName?: string | null;
  colorId: number;
  colorCode?: string | null;
  colorName?: string | null;
  colorHex?: string | null;
  lengthMm: number;
  status: string;
  reservedByPlanId?: number | null;
  consumedAt?: string | null;
  sourceProjectId?: number | null;
  location?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface WarehouseOffcutCreatePayload {
  profileBarId: number;
  colorId: number;
  lengthMm: number;
  location?: string;
  note?: string;
  sourceProjectId?: number;
}

// Warehouse Receipt
export interface WarehouseReceiptItem {
  id: number;
  receiptId: number;
  itemId?: number | null;
  offcutId?: number | null;
  offcutLengthMm?: number | null;
  itemCode: string;
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  note?: string | null;
}

export interface WarehouseReceiptItemCreatePayload {
  itemId?: number;
  offcutId?: number;
  offcutLengthMm?: number;
  itemCode: string;
  itemName: string;
  itemType?: WarehouseItemType;
  profileBarId?: number;
  unit: string;
  colorId?: number;
  colorName?: string;
  quantity: number;
  unitPrice?: number;
  note?: string;
}

export interface WarehouseReceipt {
  id: number;
  code: string;
  receiptType: ReceiptType;
  receiptReason: ReceiptReason;
  projectId?: number | null;
  productionOrderId?: number | null;
  supplierId?: number | null;
  totalAmount: number;
  status: ReceiptStatus;
  createdById?: string | null;
  approvedById?: string | null;
  approvedAt?: string | null;
  note?: string | null;
  totalItemsCount: number;
  createdAt: string;
  items?: WarehouseReceiptItem[];
  supplierName?: string | null;
  projectName?: string | null;
  productionOrderCode?: string | null;
}

export interface WarehouseReceiptCreatePayload {
  receiptType: ReceiptType;
  receiptReason: ReceiptReason;
  projectId?: number;
  productionOrderId?: number;
  supplierId?: number;
  note?: string;
  approveImmediately?: boolean;
  items: WarehouseReceiptItemCreatePayload[];
}

// Shortage Check
export interface ShortageItemDetail {
  itemId?: number | null;
  profileBarId?: number | null;
  itemCode: string;
  itemName: string;
  itemType: string;
  unit: string;
  colorId?: number | null;
  colorName?: string | null;
  estimatedPrice?: number;
  requiredQty: number;
  currentStock: number;
  reservedQty: number;
  availableQty: number;
  shortageQty: number;
  isConfigured?: boolean;
  usedOffcutsCount?: number;
  offcutsDetail?: Array<Record<string, any>> | null;
}

export interface ShortageCheckResponse {
  projectId: number;
  productionOrderId?: number | null;
  isFullyStocked: boolean;
  totalRequiredItems: number;
  totalShortageItems: number;
  unconfiguredCount?: number;
  shortages: ShortageItemDetail[];
}

// Glass Order
export interface GlassOrderItem {
  id: number;
  glassOrderId: number;
  positionId?: number | null;
  sourcePositionRevision?: number | null;
  paneSource: GlassPaneSource;
  manualReason?: ManualReason | null;
  paneLabel?: string | null;
  widthMm: number;
  heightMm: number;
  glassType: string;
  grindType?: string | null;
  unitPrice: number;
  status: string;
  areaM2: number;
  isRevisionStale: boolean;
  positionCode?: string | null;
  doorName?: string | null;
}

export interface GlassOrder {
  id: number;
  code: string;
  projectId: number;
  productionOrderId?: number | null;
  supplierId?: number | null;
  status: GlassOrderStatus;
  totalPanes: number;
  totalAreaM2: number;
  totalAmount: number;
  expectedDate?: string | null;
  actualDeliveryDate?: string | null;
  deliveryEvidenceMedia?: Array<Record<string, any>> | null;
  note?: string | null;
  createdAt: string;
  items?: GlassOrderItem[];
  supplierName?: string | null;
  projectName?: string | null;
}

export interface GlassOrderGeneratePayload {
  productionOrderId?: number;
  supplierId?: number;
  defaultUnitPrice?: number;
  note?: string;
}

export interface GlassPanePreviewItem {
  positionId?: number | null;
  sourcePositionRevision?: number;
  paneLabel?: string | null;
  widthMm: number;
  heightMm: number;
  glassType: string;
  grindType?: string | null;
  areaM2: number;
  unitPrice: number;
  positionCode?: string | null;
  doorName?: string | null;
  isMeasured?: boolean;
  paneSource?: GlassPaneSource;
  manualReason?: ManualReason | null;
}

export interface GlassOrderItemCreatePayload {
  positionId?: number | null;
  sourcePositionRevision?: number | null;
  manualReason?: ManualReason | null;
  paneLabel?: string | null;
  widthMm: number;
  heightMm: number;
  glassType: string;
  grindType?: string | null;
  unitPrice: number;
}

export interface GlassOrderCreatePayload {
  productionOrderId?: number | null;
  supplierId?: number | null;
  expectedDate?: string | null;
  note?: string | null;
  items: GlassOrderItemCreatePayload[];
}
