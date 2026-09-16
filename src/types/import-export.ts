export interface ImportSheetResult {
  success: number;
  errors: string[];
}

export interface ImportResult {
  total_imported?: number;
  totalImported?: number;
  doors?: ImportSheetResult;
  accessories?: ImportSheetResult;
  materials?: ImportSheetResult;
  sheets?: Record<string, ImportSheetResult>;
}

export interface ImportPreviewRow {
  row_index?: number;
  rowIndex?: number;
  action: 'CREATE' | 'UPDATE' | 'ERROR';
  data: Record<string, any>;
  errors?: string[];
  warnings?: string[];
}

export interface ImportPreviewSheet {
  sheet_name?: string;
  sheetName?: string;
  total: number;
  valid_count?: number;
  validCount?: number;
  invalid_count?: number;
  invalidCount?: number;
  valid_rows?: ImportPreviewRow[];
  validRows?: ImportPreviewRow[];
  invalid_rows?: ImportPreviewRow[];
  invalidRows?: ImportPreviewRow[];
}

export interface ImportPreviewResult {
  total_rows?: number;
  totalRows?: number;
  total_valid?: number;
  totalValid?: number;
  total_invalid?: number;
  totalInvalid?: number;
  sheets?: Record<string, ImportPreviewSheet>;
}
