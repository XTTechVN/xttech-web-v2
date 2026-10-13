import { WarehouseItem, WarehouseReceiptItemCreatePayload } from '@/types';

/**
 * Xuất file CSV mẫu nhập kho chuẩn UTF-8 (có BOM chống lỗi font tiếng Việt trên Excel)
 */
export function downloadReceiptTemplateCsv() {
  const headers = ['Mã vật tư', 'Tên vật tư', 'Đơn vị tính', 'Số lượng', 'Đơn giá', 'Ghi chú'];
  const sampleRows = [
    ['XF55-01', 'Khung bao cửa đi 55 Xingfa', 'cây', '20', '380000', 'Nhôm dày 2.0mm'],
    ['BL-3D-KL', 'Bản lề 3D Kinlong cửa đi', 'bộ', '60', '85000', 'Màu đen'],
    ['KEO-APOLLO-A500', 'Keo Silicone Apollo A500', 'chai', '100', '52000', 'Trắng trong'],
  ];

  const csvRows = [headers.join(','), ...sampleRows.map((r) => r.map((c) => `"${c}"`).join(','))];
  const csvContent = '\uFEFF' + csvRows.join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'mau_nhap_kho_vat_tu_xttech.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Phân tích nội dung file CSV/Text thành danh sách dòng nhập kho
 */
export function parseReceiptCsv(
  csvText: string,
  existingItems: WarehouseItem[] = []
): WarehouseReceiptItemCreatePayload[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const itemsMapByCode = new Map<string, WarehouseItem>();
  existingItems.forEach((it) => itemsMapByCode.set(it.itemCode.trim().toUpperCase(), it));

  const result: WarehouseReceiptItemCreatePayload[] = [];

  // Bỏ qua dòng tiêu đề (index 0)
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const parts = splitCsvLine(rawLine);
    if (parts.length < 2) continue;

    const rawCode = (parts[0] || '').trim();
    const rawName = (parts[1] || '').trim();
    if (!rawCode && !rawName) continue;

    const matched = itemsMapByCode.get(rawCode.toUpperCase());
    const unit = (parts[2] || matched?.unit || 'cây').trim();
    const quantity = Math.max(parseFloat(parts[3]) || 1, 0.001);
    const unitPrice = parseFloat(parts[4]) || (matched?.costPrice ?? 0);
    const note = (parts[5] || '').trim();

    result.push({
      itemId: matched?.id,
      itemCode: rawCode || matched?.itemCode || 'VT-MOI',
      itemName: rawName || matched?.itemName || 'Vật tư mới',
      unit,
      quantity,
      unitPrice,
      note: note || undefined,
    });
  }

  return result;
}

/**
 * Tách một dòng CSV an toàn có xử lý dấu ngoặc kép và dấu phẩy/chấm phẩy
 */
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
