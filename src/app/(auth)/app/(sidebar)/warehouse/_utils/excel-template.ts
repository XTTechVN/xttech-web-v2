import * as XLSX from 'xlsx';
import { ReceiptType, WarehouseItem, WarehouseReceiptItemCreatePayload } from '@/types';
import { buildReceiptTemplateXlsxBuffer } from './receipt-excel-builder';
import { toDisplayUnit } from './unit-mapping';

export interface ParsedReceiptImportResult {
  items: WarehouseReceiptItemCreatePayload[];
  unmatchedCodes: string[];
  overStockItems: Array<{
    itemCode: string;
    requested: number;
    available: number;
    unit: string;
  }>;
}

interface ColumnMap {
  codeIdx: number;
  nameIdx: number;
  colorIdx: number;
  unitIdx: number;
  qtyIdx: number;
  priceIdx: number;
  noteIdx: number;
}

/**
 * Tải xuống biểu mẫu Excel (.xlsx) 2 Sheet chuẩn XTTECH ERP cho Phiếu Nhập / Xuất Kho
 */
export function downloadReceiptTemplateExcel(
  receiptType: ReceiptType = 'import',
  existingItems: WarehouseItem[] = []
): void {
  const bytes = buildReceiptTemplateXlsxBuffer(receiptType, existingItems);
  const blobBuffer = new Uint8Array(bytes).buffer;
  const blob = new Blob([blobBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const fileName =
    receiptType === 'export'
      ? 'Mau_Phieu_Xuat_Kho_XTTech.xlsx'
      : 'Mau_Phieu_Nhap_Kho_XTTech.xlsx';

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Xuất biểu mẫu Excel (.xlsx) 2 Sheet (giữ tên export để tương thích import hiện có)
 */
export function downloadReceiptTemplateCsv(
  receiptType: ReceiptType = 'import',
  existingItems: WarehouseItem[] = []
): void {
  downloadReceiptTemplateExcel(receiptType, existingItems);
}

function parseNumericCell(raw: string | number | undefined, fallback: number): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : fallback;
  const text = String(raw ?? '').trim();
  if (!text) return fallback;
  const normalized = text
    .replace(/\s+/g, '')
    .replace(/,(?=\d{3}(\D|$))/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function detectHeaderAndColumnMap(rows: Array<Array<string | number>>): {
  startRowIdx: number;
  colMap: ColumnMap;
} {
  const maxScan = Math.min(rows.length, 15);
  for (let r = 0; r < maxScan; r++) {
    const row = rows[r].map((c) => String(c ?? '').trim().toLowerCase());
    const codeIdx = row.findIndex(
      (c) => c.includes('mã vật tư') || c.includes('mã vt') || c.includes('mã hàng')
    );
    const nameIdx = row.findIndex(
      (c) => c.includes('tên vật tư') || c.includes('tên mặt hàng')
    );
    if (codeIdx !== -1 && nameIdx !== -1 && codeIdx !== nameIdx) {
      const colorIdx = row.findIndex((c) => c.includes('màu sắc') || c.includes('màu'));
      const unitIdx = row.findIndex((c) => c.includes('đơn vị') || c.includes('đvt'));
      const qtyIdx = row.findIndex((c) => c.includes('số lượng') || c === 'sl');
      const priceIdx = row.findIndex((c) => c.includes('đơn giá') || c.includes('giá'));
      const noteIdx = row.findIndex((c) => c.includes('ghi chú'));
      return {
        startRowIdx: r + 1,
        colMap: {
          codeIdx,
          nameIdx,
          colorIdx,
          unitIdx: unitIdx !== -1 ? unitIdx : codeIdx + 2,
          qtyIdx: qtyIdx !== -1 ? qtyIdx : codeIdx + 3,
          priceIdx: priceIdx !== -1 ? priceIdx : codeIdx + 4,
          noteIdx: noteIdx !== -1 ? noteIdx : codeIdx + 5,
        },
      };
    }
  }

  if ((rows[0]?.length ?? 0) >= 8) {
    return {
      startRowIdx: 1,
      colMap: { codeIdx: 1, nameIdx: 2, colorIdx: 3, unitIdx: 4, qtyIdx: 5, priceIdx: 6, noteIdx: 8 },
    };
  }
  return {
    startRowIdx: 1,
    colMap: { codeIdx: 0, nameIdx: 1, colorIdx: -1, unitIdx: 2, qtyIdx: 3, priceIdx: 4, noteIdx: 5 },
  };
}

function isIgnoredTemplateRow(rawCode: string, rawName: string, rowTextJoined: string): boolean {
  const joinedLower = rowTextJoined.toLowerCase();
  if (
    joinedLower.includes('tổng cộng tiền hàng') ||
    joinedLower.startsWith('tổng cộng') ||
    joinedLower.includes('biểu mẫu nhập liệu') ||
    joinedLower.startsWith('hướng dẫn:')
  ) {
    return true;
  }
  if (rawCode.toLowerCase().includes('tổng cộng') || rawName.toLowerCase().includes('tổng cộng')) {
    return true;
  }
  return !rawCode && !rawName;
}

function parseRowsMatrix(
  rows: Array<Array<string | number>>,
  existingItems: WarehouseItem[]
): ParsedReceiptImportResult {
  const items: WarehouseReceiptItemCreatePayload[] = [];
  const unmatchedSet = new Set<string>();
  const overStockItems: ParsedReceiptImportResult['overStockItems'] = [];
  if (rows.length === 0) return { items, unmatchedCodes: [], overStockItems };

  const itemsMapByCode = new Map<string, WarehouseItem>();
  existingItems.forEach((it) => itemsMapByCode.set(it.itemCode.trim().toUpperCase(), it));
  const { startRowIdx, colMap } = detectHeaderAndColumnMap(rows);

  for (let i = startRowIdx; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const rawCode = String(row[colMap.codeIdx] ?? '').trim();
    const rawName = String(row[colMap.nameIdx] ?? '').trim();
    const rowJoined = row.map((c) => String(c ?? '').trim()).join(' ');
    if (isIgnoredTemplateRow(rawCode, rawName, rowJoined)) continue;

    const matched = rawCode ? itemsMapByCode.get(rawCode.toUpperCase()) : undefined;
    if (rawCode && !matched) unmatchedSet.add(rawCode);

    const rawColor = colMap.colorIdx >= 0 ? String(row[colMap.colorIdx] ?? '').trim() : '';
    const rawUnit = String(row[colMap.unitIdx] ?? '').trim();
    const parsedQty = parseNumericCell(row[colMap.qtyIdx], 1);
    const quantity = Math.max(parsedQty > 0 ? parsedQty : 1, 0.001);
    const filePrice = parseNumericCell(row[colMap.priceIdx], 0);
    const rawNote = colMap.noteIdx >= 0 ? String(row[colMap.noteIdx] ?? '').trim() : '';

    if (matched && quantity > matched.availableStock) {
      overStockItems.push({
        itemCode: matched.itemCode,
        requested: quantity,
        available: matched.availableStock,
        unit: toDisplayUnit(matched.unit),
      });
    }

    items.push({
      itemId: matched?.id,
      itemCode: rawCode || matched?.itemCode || 'VT-MOI',
      itemName: rawName || matched?.itemName || 'Vật tư mới',
      itemType: matched?.itemType,
      profileBarId: matched?.profileBarId ?? undefined,
      colorId: matched?.colorId ?? undefined,
      colorName: rawColor || matched?.colorName || undefined,
      unit: toDisplayUnit(rawUnit || matched?.unit || 'bar'),
      quantity,
      unitPrice: filePrice > 0 ? filePrice : (matched?.costPrice ?? 0),
      note: rawNote || undefined,
    });
  }

  return { items, unmatchedCodes: Array.from(unmatchedSet), overStockItems };
}

/**
 * Đọc file Excel (.xlsx, .xls) hoặc CSV (.csv, .txt) hoặc chuỗi CSV thành danh sách vật tư phiếu kho
 */
export async function parseReceiptExcelFile(
  fileOrText: File | string,
  existingItems: WarehouseItem[] = []
): Promise<ParsedReceiptImportResult> {
  if (typeof fileOrText === 'string') {
    const matrix = fileOrText
      .split(/\r?\n/)
      .filter((l) => l.trim().length > 0)
      .map(splitCsvLine);
    return parseRowsMatrix(matrix, existingItems);
  }

  const lowerName = fileOrText.name.toLowerCase();
  if (lowerName.endsWith('.csv') || lowerName.endsWith('.txt')) {
    const csvText = await fileOrText.text();
    return parseReceiptExcelFile(csvText, existingItems);
  }

  const buffer = await fileOrText.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) return { items: [], unmatchedCodes: [], overStockItems: [] };
  const matrix = XLSX.utils.sheet_to_json<Array<string | number>>(wb.Sheets[firstSheetName], {
    header: 1,
    defval: '',
  });
  return parseRowsMatrix(matrix, existingItems);
}

export async function parseReceiptCsv(
  fileOrText: File | string,
  existingItems: WarehouseItem[] = []
): Promise<ParsedReceiptImportResult> {
  return parseReceiptExcelFile(fileOrText, existingItems);
}

function splitCsvLine(line: string): string[] {
  const delimiter = line.includes(';') && !line.includes(',') ? ';' : ',';
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}
