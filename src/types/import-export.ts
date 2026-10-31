export interface ImportSheetResult {
  success: number;
  errors: string[];
}

export interface ImportResult {
  totalImported?: number;
  doors?: ImportSheetResult;
  accessories?: ImportSheetResult;
  materials?: ImportSheetResult;
  sheets?: Record<string, ImportSheetResult>;
}

export interface ImportPreviewRow {
  rowIndex?: number;
  action: 'CREATE' | 'UPDATE' | 'ERROR';
  data: Record<string, unknown>;
  errors?: string[];
  warnings?: string[];
}

export interface ImportPreviewSheet {
  sheetName?: string;
  total: number;
  validCount?: number;
  invalidCount?: number;
  validRows?: ImportPreviewRow[];
  invalidRows?: ImportPreviewRow[];
}

export interface ImportPreviewResult {
  totalRows?: number;
  totalValid?: number;
  totalInvalid?: number;
  sheets?: Record<string, ImportPreviewSheet>;
}

// ==============================================================================
// MATERIAL CONFIGURATION EXCEL TYPES (100% camelCase per Rule 13)
// ==============================================================================

export type ExcelRowAction = 'CREATE' | 'UPDATE' | 'ERROR';

export interface MaterialBulkUpsertResponse {
  createdCount: number;
  updatedCount: number;
  totalProcessed: number;
}

// 1. Profile Bars Excel
export interface ProfileBarExcelItemData {
  code: string;
  name: string;
  brandId: number | null;
  brandCode?: string | null;
  brandName?: string | null;
  seriesId: number | null;
  seriesCode?: string | null;
  seriesName?: string | null;
  barType: string;
  weightPerM: number;
  barLengthMm: number;
  sectionHeightMm: number;
  deductSashMm: number;
  deductBeadMm: number;
  deductGlassMm: number;
  deductMullionMm: number;
  sectionLibraryId: number | null;
  sectionCode?: string | null;
  isActive: boolean;
}

export interface ProfileBarExcelPreviewRow {
  rowIndex: number;
  action: ExcelRowAction;
  existingId: number | null;
  data: ProfileBarExcelItemData;
  oldData?: ProfileBarExcelItemData | null;
  errors: string[];
  warnings: string[];
}

export interface ProfileBarExcelPreviewResponse {
  totalRows: number;
  createCount: number;
  updateCount: number;
  errorCount: number;
  rows: ProfileBarExcelPreviewRow[];
}

export interface ProfileBarBulkUpsertItem {
  existingId?: number | null;
  brandId: number;
  seriesId: number;
  code: string;
  name: string;
  barType: string;
  weightPerM: number;
  barLengthMm: number;
  sectionHeightMm: number;
  deductSashMm: number;
  deductBeadMm: number;
  deductGlassMm: number;
  deductMullionMm: number;
  sectionLibraryId?: number | null;
  isActive: boolean;
}

export interface ProfileBarBulkUpsertRequest {
  items: ProfileBarBulkUpsertItem[];
}

// 2. Glass & Gaskets Excel
export interface GlassExcelItemData {
  code: string;
  name: string;
  materialType: 'glass' | 'panel' | 'screen_mesh';
  categoryId: number | null;
  categoryCode?: string | null;
  categoryName?: string | null;
  glassType: string;
  thicknessMm: number;
  unitPrice: number;
  weightPerM2: number;
  maxWidthMm: number | null;
  maxHeightMm: number | null;
  isDefault: boolean;
  isActive: boolean;
}

export interface GlassExcelPreviewRow {
  rowIndex: number;
  action: ExcelRowAction;
  existingId: number | null;
  data: GlassExcelItemData;
  oldData?: GlassExcelItemData | null;
  errors: string[];
  warnings: string[];
}

export interface GasketExcelItemData {
  code: string;
  name: string;
  unit: string;
  pricePerUnit: number;
  isActive: boolean;
}

export interface GasketExcelPreviewRow {
  rowIndex: number;
  action: ExcelRowAction;
  existingId: number | null;
  data: GasketExcelItemData;
  oldData?: GasketExcelItemData | null;
  errors: string[];
  warnings: string[];
}

export interface GlassGasketExcelPreviewResponse {
  totalRows: number;
  createCount: number;
  updateCount: number;
  errorCount: number;
  glasses: GlassExcelPreviewRow[];
  gaskets: GasketExcelPreviewRow[];
}

export interface GlassBulkUpsertItem {
  existingId?: number | null;
  categoryId: number;
  code: string;
  name: string;
  glassType: string;
  thicknessMm: number;
  unitPrice: number;
  weightPerM2: number;
  maxWidthMm?: number | null;
  maxHeightMm?: number | null;
  isDefault: boolean;
  isActive: boolean;
}

export interface GasketBulkUpsertItem {
  existingId?: number | null;
  code: string;
  name: string;
  unit: string;
  pricePerUnit: number;
  isActive: boolean;
}

export interface GlassGasketBulkUpsertRequest {
  glasses: GlassBulkUpsertItem[];
  gaskets: GasketBulkUpsertItem[];
}

// 3. Accessories Excel
export interface AccessoryExcelItemData {
  code: string;
  name: string;
  brandId: number | null;
  brandCode?: string | null;
  brandName?: string | null;
  categoryId: number | null;
  categoryCode?: string | null;
  categoryName?: string | null;
  unit: string;
  color: string;
  specification: string | null;
  unitPrice: number;
  costPrice: number;
  isActive: boolean;
}

export interface AccessoryExcelPreviewRow {
  rowIndex: number;
  action: ExcelRowAction;
  existingId: number | null;
  data: AccessoryExcelItemData;
  oldData?: AccessoryExcelItemData | null;
  errors: string[];
  warnings: string[];
}

export interface AccessoryExcelPreviewResponse {
  totalRows: number;
  createCount: number;
  updateCount: number;
  errorCount: number;
  rows: AccessoryExcelPreviewRow[];
}

export interface AccessoryBulkUpsertItem {
  existingId?: number | null;
  code: string;
  name: string;
  brandId: number | null;
  categoryId: number | null;
  unit: string;
  color: string;
  specification: string | null;
  unitPrice: number;
  costPrice: number;
  isActive: boolean;
}

export interface AccessoryBulkUpsertRequest {
  items: AccessoryBulkUpsertItem[];
}
