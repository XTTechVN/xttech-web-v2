import * as XLSX from 'xlsx';
import { ReceiptType, WarehouseItem } from '@/types';
import { WAREHOUSE_ITEM_TYPE_MAP } from '@/config/warehouse';
import { toDisplayUnit } from './unit-mapping';

const STANDARD_UNITS = ['Cây', 'Cái', 'Bộ', 'Mét', 'Chiếc', 'Đôi', 'Cuộn', 'Hộp', 'Túi', 'Chai', 'Tấm', 'Kg'];
const SUGGESTED_COLORS = [
  'Trắng sữa', 'Trắng sứ', 'Xám', 'Xám ghi', 'Xám đá ánh kim', 'Nâu',
  'Nâu cafe', 'Nâu mocha', 'Đen', 'Champagne', 'Vân gỗ', 'Anodized Vàng', 'Bạc / Inox', 'Vàng',
];

interface SampleRowData {
  code: string;
  name: string;
  color: string;
  unit: string;
  qty: number;
  price: number;
  note: string;
}

const esc = (v: string | number | null | undefined): string =>
  String(v ?? '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const strCell = (ref: string, text: string, s: number): string =>
  `<c r="${ref}" s="${s}" t="inlineStr"><is><t>${esc(text)}</t></is></c>`;
const numCell = (ref: string, val: number, s: number): string =>
  `<c r="${ref}" s="${s}"><v>${Number.isFinite(val) ? val : 0}</v></c>`;
const fNumCell = (ref: string, f: string, val: number, s: number): string =>
  `<c r="${ref}" s="${s}"><f>${esc(f)}</f><v>${Number.isFinite(val) ? val : 0}</v></c>`;
const fStrCell = (ref: string, f: string, text: string, s: number): string =>
  `<c r="${ref}" s="${s}" t="str"><f>${esc(f)}</f><v>${esc(text)}</v></c>`;

function buildSampleRows(receiptType: ReceiptType, existingItems: WarehouseItem[]): SampleRowData[] {
  if (receiptType === 'export' && existingItems.length > 0) {
    return [...existingItems]
      .sort((a, b) => Number(b.availableStock > 0) - Number(a.availableStock > 0))
      .slice(0, 3)
      .map((it) => ({
        code: it.itemCode,
        name: it.itemName,
        color: it.colorName || '',
        unit: toDisplayUnit(it.unit),
        qty: 1,
        price: it.costPrice || 0,
        note: 'Dòng mẫu xuất kho — có thể sửa hoặc xóa',
      }));
  }
  if (receiptType === 'import' && existingItems.length >= 3) {
    return existingItems.slice(0, 3).map((it) => ({
      code: it.itemCode,
      name: it.itemName,
      color: it.colorName || '',
      unit: toDisplayUnit(it.unit),
      qty: 10,
      price: it.costPrice || 0,
      note: 'Dòng mẫu nhập kho — có thể sửa hoặc xóa',
    }));
  }
  return [
    { code: 'XF55-01', name: 'Khung bao cửa đi mở quay hệ 55 Xingfa', color: 'Xám ghi', unit: 'Cây', qty: 20, price: 380000, note: 'Nhôm dày 2.0mm (Dòng mẫu)' },
    { code: 'BL-3D-KL', name: 'Bản lề 3D cửa đi Kinlong chính hãng', color: 'Đen', unit: 'Bộ', qty: 60, price: 85000, note: 'Phụ kiện đồng bộ (Dòng mẫu)' },
    { code: 'KEO-APOLLO-A500', name: 'Keo Silicone trung tính Apollo A500', color: 'Trắng sữa', unit: 'Chai', qty: 100, price: 52000, note: 'Thùng 25 chai (Dòng mẫu)' },
  ];
}

function buildStylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0"/></numFmts>
  <fonts count="6">
    <font><sz val="10"/><color rgb="FF0F172A"/><name val="Arial"/></font>
    <font><b/><sz val="13"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>
    <font><i/><sz val="10"/><color rgb="FF045863"/><name val="Arial"/></font>
    <font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>
    <font><b/><sz val="10"/><color rgb="FF045863"/><name val="Arial"/></font>
    <font><b/><sz val="11"/><color rgb="FF045863"/><name val="Arial"/></font>
  </fonts>
  <fills count="5">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF045863"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE6F2F3"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border><left style="thin"><color rgb="FFCBD5E1"/></left><right style="thin"><color rgb="FFCBD5E1"/></right><top style="thin"><color rgb="FFCBD5E1"/></top><bottom style="thin"><color rgb="FFCBD5E1"/></bottom><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="11">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="4" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
    <xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="164" fontId="4" fillId="4" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="0" fontId="5" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="164" fontId="5" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
}

function buildSheet1DataRowsXml(receiptType: ReceiptType, existingItems: WarehouseItem[]): string {
  const samples = buildSampleRows(receiptType, existingItems);
  const lookupRange = `Danh_Muc_Kho!$A$2:$G$${Math.max(existingItems.length + 1, 2)}`;
  let totalSampleAmount = 0;
  const rows: string[] = [];

  for (let idx = 0; idx < 15; idx++) {
    const r = idx + 5;
    const sample = samples[idx];
    const totalF = `IF(AND(ISNUMBER(F${r}),ISNUMBER(G${r})),F${r}*G${r},0)`;
    if (sample) {
      const amount = sample.qty * sample.price;
      totalSampleAmount += amount;
      rows.push(
        `<row r="${r}" ht="22" customHeight="1">${numCell(`A${r}`, idx + 1, 4)}${strCell(`B${r}`, sample.code, 5)}${strCell(`C${r}`, sample.name, 6)}${strCell(`D${r}`, sample.color, 6)}${strCell(`E${r}`, sample.unit, 4)}${numCell(`F${r}`, sample.qty, 7)}${numCell(`G${r}`, sample.price, 7)}${fNumCell(`H${r}`, totalF, amount, 8)}${strCell(`I${r}`, sample.note, 6)}</row>`
      );
    } else if (existingItems.length > 0) {
      const nameF = `IF(B${r}="","",IFERROR(VLOOKUP(B${r},${lookupRange},2,FALSE),""))`;
      const colorF = `IF(B${r}="","",IFERROR(VLOOKUP(B${r},${lookupRange},4,FALSE),""))`;
      const unitF = `IF(B${r}="","",IFERROR(VLOOKUP(B${r},${lookupRange},5,FALSE),"Cây"))`;
      const priceF = `IF(B${r}="",0,IFERROR(VLOOKUP(B${r},${lookupRange},7,FALSE),0))`;
      rows.push(
        `<row r="${r}" ht="22" customHeight="1">${numCell(`A${r}`, idx + 1, 4)}${strCell(`B${r}`, '', 5)}${fStrCell(`C${r}`, nameF, '', 6)}${fStrCell(`D${r}`, colorF, '', 6)}${fStrCell(`E${r}`, unitF, '', 4)}<c r="F${r}" s="7"/>${fNumCell(`G${r}`, priceF, 0, 7)}${fNumCell(`H${r}`, totalF, 0, 8)}${strCell(`I${r}`, '', 6)}</row>`
      );
    } else {
      rows.push(
        `<row r="${r}" ht="22" customHeight="1">${numCell(`A${r}`, idx + 1, 4)}${strCell(`B${r}`, '', 5)}${strCell(`C${r}`, '', 6)}${strCell(`D${r}`, '', 6)}${strCell(`E${r}`, '', 4)}<c r="F${r}" s="7"/><c r="G${r}" s="7"/>${fNumCell(`H${r}`, totalF, 0, 8)}${strCell(`I${r}`, '', 6)}</row>`
      );
    }
  }

  const mergeTail = ['B', 'C', 'D', 'E', 'F', 'G'].map((c) => `<c r="${c}20" s="9"/>`).join('');
  rows.push(
    `<row r="20" ht="26" customHeight="1">${strCell('A20', 'TỔNG CỘNG TIỀN HÀNG (VNĐ):', 9)}${mergeTail}${fNumCell('H20', 'SUM(H5:H19)', totalSampleAmount, 10)}<c r="I20" s="9"/></row>`
  );
  return rows.join('');
}

function buildSheet1Xml(receiptType: ReceiptType, existingItems: WarehouseItem[]): string {
  const isImport = receiptType === 'import';
  const title = isImport
    ? 'BIỂU MẪU NHẬP LIỆU PHIẾU NHẬP KHO VẬT TƯ - XTTECH ERP'
    : 'BIỂU MẪU NHẬP LIỆU PHIẾU XUẤT KHO VẬT TƯ - XTTECH ERP';
  const guide = isImport
    ? 'Hướng dẫn: Chọn Mã vật tư từ danh sách gợi ý (tự động điền Tên, Màu, ĐVT, Đơn giá từ kho) hoặc gõ mã vật tư mới. Các cột (*) là bắt buộc. Cột Thành tiền tự động tính.'
    : 'Hướng dẫn: Chọn Mã vật tư có sẵn trong kho (tự động điền Tên, Màu, ĐVT, Giá vốn; xem tồn kho ở sheet Danh_Muc_Kho). Số lượng xuất không vượt quá Tồn khả dụng.';

  const cols = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  const row1 = `<row r="1" ht="32" customHeight="1">${strCell('A1', title, 1)}${cols.map((c) => `<c r="${c}1" s="1"/>`).join('')}</row>`;
  const row2 = `<row r="2" ht="26" customHeight="1">${strCell('A2', guide, 2)}${cols.map((c) => `<c r="${c}2" s="2"/>`).join('')}</row>`;
  const headers = [
    ['A4', 'STT'], ['B4', 'Mã vật tư (*)'], ['C4', 'Tên vật tư & Quy cách (*)'], ['D4', 'Màu sắc'],
    ['E4', 'Đơn vị tính (*)'], ['F4', 'Số lượng (*)'], ['G4', 'Đơn giá (VNĐ)'], ['H4', 'Thành tiền (VNĐ)'], ['I4', 'Ghi chú'],
  ];
  const row4 = `<row r="4" ht="28" customHeight="1">${headers.map(([ref, lbl]) => strCell(ref, lbl, 3)).join('')}</row>`;

  const validations: string[] = [
    `<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="0" sqref="E5:E200"><formula1>Danh_Muc_Kho!$I$2:$I$${STANDARD_UNITS.length + 1}</formula1></dataValidation>`,
    `<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="0" sqref="D5:D200"><formula1>Danh_Muc_Kho!$J$2:$J$${SUGGESTED_COLORS.length + 1}</formula1></dataValidation>`,
  ];
  if (existingItems.length > 0) {
    validations.push(
      `<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="0" sqref="B5:B200"><formula1>Danh_Muc_Kho!$A$2:$A$${existingItems.length + 1}</formula1></dataValidation>`
    );
  }

  const colWidths = [6, 22, 36, 18, 15, 14, 18, 20, 28]
    .map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews><sheetView tabSelected="1" workbookViewId="0"><pane ySplit="4" topLeftCell="A5" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="B5" sqref="B5"/></sheetView></sheetViews>
  <sheetFormatPr defaultRowHeight="20"/>
  <cols>${colWidths}</cols>
  <sheetData>${row1}${row2}<row r="3" ht="10" customHeight="1"/>${row4}${buildSheet1DataRowsXml(receiptType, existingItems)}</sheetData>
  <mergeCells count="3"><mergeCell ref="A1:I1"/><mergeCell ref="A2:I2"/><mergeCell ref="A20:G20"/></mergeCells>
  <dataValidations count="${validations.length}">${validations.join('')}</dataValidations>
</worksheet>`;
}

function buildSheet2Xml(existingItems: WarehouseItem[]): string {
  const headers = [
    ['A1', 'Mã vật tư'], ['B1', 'Tên vật tư & Quy cách'], ['C1', 'Phân loại'], ['D1', 'Màu sắc'],
    ['E1', 'Đơn vị tính'], ['F1', 'Tồn khả dụng'], ['G1', 'Đơn giá vốn (VNĐ)'], ['I1', 'ĐVT Chuẩn'], ['J1', 'Màu Sắc Gợi Ý'],
  ];
  const rows: string[] = [`<row r="1" ht="26" customHeight="1">${headers.map(([ref, lbl]) => strCell(ref, lbl, 3)).join('')}</row>`];
  const maxRows = Math.max(existingItems.length, STANDARD_UNITS.length, SUGGESTED_COLORS.length);

  for (let idx = 0; idx < maxRows; idx++) {
    const r = idx + 2;
    const item = existingItems[idx];
    let cells = '';
    if (item) {
      cells +=
        strCell(`A${r}`, item.itemCode, 5) +
        strCell(`B${r}`, item.itemName, 6) +
        strCell(`C${r}`, WAREHOUSE_ITEM_TYPE_MAP[item.itemType] || item.itemType, 4) +
        strCell(`D${r}`, item.colorName || '', 6) +
        strCell(`E${r}`, toDisplayUnit(item.unit), 4) +
        numCell(`F${r}`, item.availableStock ?? 0, 7) +
        numCell(`G${r}`, item.costPrice ?? 0, 7);
    }
    if (STANDARD_UNITS[idx]) cells += strCell(`I${r}`, STANDARD_UNITS[idx], 4);
    if (SUGGESTED_COLORS[idx]) cells += strCell(`J${r}`, SUGGESTED_COLORS[idx], 6);
    rows.push(`<row r="${r}" ht="20" customHeight="1">${cells}</row>`);
  }

  const colWidths = [22, 36, 16, 18, 14, 15, 18, 4, 16, 20]
    .map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="20"/>
  <cols>${colWidths}</cols>
  <sheetData>${rows.join('')}</sheetData>
</worksheet>`;
}

export function buildReceiptTemplateXlsxBuffer(
  receiptType: ReceiptType = 'import',
  existingItems: WarehouseItem[] = []
): Uint8Array {
  const sheet1Name = receiptType === 'import' ? 'Phieu_Nhap_Kho' : 'Phieu_Xuat_Kho';
  const enc = new TextEncoder();
  const cfb = XLSX.CFB.utils.cfb_new();

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;
  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${sheet1Name}" sheetId="1" r:id="rId1"/><sheet name="Danh_Muc_Kho" sheetId="2" r:id="rId2"/></sheets></workbook>`;
  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;

  XLSX.CFB.utils.cfb_add(cfb, '[Content_Types].xml', enc.encode(contentTypes));
  XLSX.CFB.utils.cfb_add(cfb, '_rels/.rels', enc.encode(rootRels));
  XLSX.CFB.utils.cfb_add(cfb, 'xl/workbook.xml', enc.encode(workbookXml));
  XLSX.CFB.utils.cfb_add(cfb, 'xl/_rels/workbook.xml.rels', enc.encode(workbookRels));
  XLSX.CFB.utils.cfb_add(cfb, 'xl/styles.xml', enc.encode(buildStylesXml()));
  XLSX.CFB.utils.cfb_add(cfb, 'xl/worksheets/sheet1.xml', enc.encode(buildSheet1Xml(receiptType, existingItems)));
  XLSX.CFB.utils.cfb_add(cfb, 'xl/worksheets/sheet2.xml', enc.encode(buildSheet2Xml(existingItems)));

  const zipBytes = XLSX.CFB.write(cfb, { fileType: 'zip', type: 'array', compression: true });
  return zipBytes instanceof Uint8Array ? zipBytes : new Uint8Array(zipBytes);
}
