import { GLASS_GRIND_LABEL_MAP } from '@/config/warehouse';
import { GlassOrder } from '@/types';
import { formatPaneShapeSummary } from '../glass-order-dxf-export';
import {
  DoorGlassSection,
  ExcelImageAsset,
  GroupedGlassOrderData,
  SheetCellSpec,
  SheetDrawingAnchor,
  SheetRowSpec,
  WorksheetSpec,
} from './glass-excel-types';
import { XLSX_STYLE } from './xlsx-openxml-packager';

const strCell = (col0: number, text: string, styleId: number): SheetCellSpec => ({ col0, styleId, kind: 'str', text });
const numCell = (col0: number, num: number, styleId: number): SheetCellSpec => ({ col0, styleId, kind: 'num', num });
const fCell = (col0: number, formula: string, num: number, styleId: number): SheetCellSpec => ({ col0, styleId, kind: 'formula', formula, num });
const emptyCell = (col0: number, styleId: number): SheetCellSpec => ({ col0, styleId, kind: 'empty' });

function formatOrderMeta(order: GlassOrder): { createdStr: string; expectedStr: string; prodOrderStr: string } {
  return {
    createdStr: order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '—',
    expectedStr: order.expectedDate ? new Date(order.expectedDate).toLocaleDateString('vi-VN') : '—',
    prodOrderStr: order.productionOrderCode || (order.productionOrderId ? `#${order.productionOrderId}` : '—'),
  };
}

function appendSignatureBlock(rows: SheetRowSpec[], merges: string[], startRow: number): void {
  const rTitle = startRow + 1;
  const rSub = startRow + 2;
  merges.push(
    `A${rTitle}:C${rTitle}`, `E${rTitle}:G${rTitle}`, `I${rTitle}:K${rTitle}`,
    `A${rSub}:C${rSub}`, `E${rSub}:G${rSub}`, `I${rSub}:K${rSub}`,
  );
  rows.push(
    { row1: startRow, heightPt: 12, cells: [] },
    {
      row1: rTitle,
      heightPt: 22,
      cells: [
        strCell(0, 'NGƯỜI LẬP ĐƠN', XLSX_STYLE.SIGN_TITLE),
        strCell(4, 'PHỤ TRÁCH KỸ THUẬT / XƯỞNG', XLSX_STYLE.SIGN_TITLE),
        strCell(8, 'XÁC NHẬN NHÀ MÁY KÍNH', XLSX_STYLE.SIGN_TITLE),
      ],
    },
    {
      row1: rSub,
      heightPt: 18,
      cells: [
        strCell(0, '(Ký, ghi rõ họ tên)', XLSX_STYLE.SIGN_SUB),
        strCell(4, '(Ký, ghi rõ họ tên)', XLSX_STYLE.SIGN_SUB),
        strCell(8, '(Ký, ghi rõ họ tên)', XLSX_STYLE.SIGN_SUB),
      ],
    },
  );
}

function buildFactorySpecSheet(
  order: GlassOrder,
  grouped: GroupedGlassOrderData,
  paneAssets: Map<string, ExcelImageAsset>,
): WorksheetSpec {
  const { createdStr, expectedStr, prodOrderStr } = formatOrderMeta(order);
  const headers = [
    'STT', 'Mã kính', 'Hình ảnh & Kích thước', 'Chủng loại kính', 'Hình dạng',
    'Rộng (mm)', 'Cao (mm)', 'Số lượng (tấm)', 'Tổng diện tích (m²)', 'Mài cạnh', 'Vị trí cửa áp dụng',
  ];
  const rows: SheetRowSpec[] = [
    { row1: 1, heightPt: 34, cells: [strCell(0, `ĐƠN ĐẶT KÍNH TÔI GIA CÔNG NHÀ MÁY — MÃ ĐƠN: ${order.code}`, XLSX_STYLE.TITLE_BANNER)] },
    { row1: 2, heightPt: 24, cells: [strCell(0, `Dự án: ${order.projectName || '—'}`, XLSX_STYLE.META_BOX), strCell(4, `Lệnh SX: ${prodOrderStr}`, XLSX_STYLE.META_BOX), strCell(8, `Nhà máy kính: ${order.supplierName || '—'}`, XLSX_STYLE.META_BOX)] },
    { row1: 3, heightPt: 24, cells: [strCell(0, `Ngày lập: ${createdStr}   |   Hạn giao: ${expectedStr}`, XLSX_STYLE.META_HIGHLIGHT), strCell(4, `Tổng số mã: ${grouped.specGroups.length} mã   |   Tổng số tấm: ${grouped.totalPanes} tấm   |   Tổng m²: ${grouped.totalAreaM2.toFixed(3)} m²`, XLSX_STYLE.META_HIGHLIGHT), strCell(8, `Ghi chú: ${order.note || 'Gia công đúng bản vẽ kỹ thuật'}`, XLSX_STYLE.META_HIGHLIGHT)] },
    { row1: 4, heightPt: 8, cells: [] },
    { row1: 5, heightPt: 30, cells: headers.map((h, idx) => strCell(idx, h, XLSX_STYLE.TABLE_HEADER)) },
  ];
  const merges: string[] = ['A1:K1', 'A2:D2', 'E2:H2', 'I2:K2', 'A3:D3', 'E3:H3', 'I3:K3'];
  const anchors: SheetDrawingAnchor[] = [];

  grouped.specGroups.forEach((g, idx) => {
    const r = 6 + idx;
    const asset = paneAssets.get(g.geometryKey);
    if (asset) anchors.push({ assetId: asset.id, col0: 2, startRow0: r - 1, endRow0: r - 1 });
    rows.push({
      row1: r,
      heightPt: 106,
      cells: [
        numCell(0, idx + 1, XLSX_STYLE.CELL_CENTER),
        strCell(1, g.specCode, XLSX_STYLE.CELL_CODE),
        emptyCell(2, XLSX_STYLE.CELL_CENTER),
        strCell(3, g.glassType, XLSX_STYLE.CELL_TEXT),
        strCell(4, formatPaneShapeSummary(g.frameShape, g.archConfig), XLSX_STYLE.CELL_CENTER),
        numCell(5, g.widthMm, XLSX_STYLE.CELL_INT),
        numCell(6, g.heightMm, XLSX_STYLE.CELL_INT),
        numCell(7, g.qty, XLSX_STYLE.CELL_INT_BOLD),
        numCell(8, g.totalAreaM2, XLSX_STYLE.CELL_AREA),
        strCell(9, GLASS_GRIND_LABEL_MAP[g.grindType] || g.grindType, XLSX_STYLE.CELL_CENTER),
        strCell(10, g.positionsSummary, XLSX_STYLE.CELL_TEXT),
      ],
    });
  });

  const lastDataRow = Math.max(6, 5 + grouped.specGroups.length);
  const totalRow = 6 + grouped.specGroups.length;
  merges.push(`A${totalRow}:G${totalRow}`, `J${totalRow}:K${totalRow}`);
  rows.push({
    row1: totalRow,
    heightPt: 28,
    cells: [
      strCell(0, 'TỔNG CỘNG ĐƠN ĐẶT KÍNH:', XLSX_STYLE.TOTAL_LABEL),
      fCell(7, `SUM(H6:H${lastDataRow})`, grouped.totalPanes, XLSX_STYLE.TOTAL_INT),
      fCell(8, `SUM(I6:I${lastDataRow})`, grouped.totalAreaM2, XLSX_STYLE.TOTAL_AREA),
      emptyCell(9, XLSX_STYLE.TOTAL_LABEL),
    ],
  });
  appendSignatureBlock(rows, merges, totalRow + 1);

  return { name: 'Dat_Kinh_Nha_May', colWidths: [6, 11, 28, 30, 20, 12, 12, 14, 17, 16, 34], freezeTopRows: 5, rows, merges, anchors };
}

function formatDoorBannerTitle(sec: DoorGlassSection): string {
  if (sec.isManualGroup) {
    return `NHÓM KÍNH LẺ / DỰ PHÒNG / THAY THẾ NGOÀI CỬA   |   Tổng: ${sec.totalPanes} tấm (${sec.totalAreaM2.toFixed(3)} m²)`;
  }
  const parts = [`MÃ CỬA: ${sec.positionCode} — ${sec.doorName}`];
  if (sec.floorName) parts.push(`Tầng: ${sec.floorName}`);
  if (sec.doorWidthMm > 0 && sec.doorHeightMm > 0) parts.push(`Phủ bì: ${Math.round(sec.doorWidthMm)} × ${Math.round(sec.doorHeightMm)} mm`);
  if (sec.colorName) parts.push(`Màu nhôm: ${sec.colorName}`);
  parts.push(`Tổng: ${sec.totalPanes} tấm (${sec.totalAreaM2.toFixed(3)} m²)`);
  return parts.join('   |   ');
}

function buildDoorDetailSheet(
  order: GlassOrder,
  grouped: GroupedGlassOrderData,
  paneAssets: Map<string, ExcelImageAsset>,
  doorAssets: Map<string, ExcelImageAsset>,
): WorksheetSpec {
  const { createdStr, expectedStr, prodOrderStr } = formatOrderMeta(order);
  const headers = [
    'Bản vẽ CAD Bộ cửa', 'Ký hiệu ô kính', 'Hình vẽ & Kích thước tấm kính', 'Chủng loại kính',
    'Hình dạng', 'Rộng (mm)', 'Cao (mm)', 'Diện tích (m²)', 'Mài cạnh', 'Ghi chú',
  ];
  const rows: SheetRowSpec[] = [
    { row1: 1, heightPt: 34, cells: [strCell(0, `CHI TIẾT Ô KÍNH THEO BẢN VẼ TỪNG MÃ CỬA — MÃ ĐƠN: ${order.code}`, XLSX_STYLE.TITLE_BANNER)] },
    { row1: 2, heightPt: 24, cells: [strCell(0, `Dự án: ${order.projectName || '—'}`, XLSX_STYLE.META_BOX), strCell(4, `Lệnh SX: ${prodOrderStr}`, XLSX_STYLE.META_BOX), strCell(7, `Nhà máy kính: ${order.supplierName || '—'}`, XLSX_STYLE.META_BOX)] },
    { row1: 3, heightPt: 24, cells: [strCell(0, `Ngày lập: ${createdStr}   |   Hạn giao: ${expectedStr}   |   Đối chiếu mã [K-xx] với Sheet Đặt kính`, XLSX_STYLE.META_HIGHLIGHT), strCell(6, `Tổng cộng: ${grouped.totalPanes} tấm   |   Tổng diện tích: ${grouped.totalAreaM2.toFixed(3)} m²`, XLSX_STYLE.META_HIGHLIGHT)] },
    { row1: 4, heightPt: 8, cells: [] },
    { row1: 5, heightPt: 30, cells: headers.map((h, idx) => strCell(idx, h, XLSX_STYLE.TABLE_HEADER)) },
  ];
  const merges: string[] = ['A1:J1', 'A2:D2', 'E2:G2', 'H2:J2', 'A3:F3', 'G3:J3'];
  const anchors: SheetDrawingAnchor[] = [];
  let curRow = 6;

  for (const sec of grouped.doorSections) {
    merges.push(`A${curRow}:J${curRow}`);
    rows.push({ row1: curRow, heightPt: 26, cells: [strCell(0, formatDoorBannerTitle(sec), XLSX_STYLE.DOOR_BANNER)] });
    curRow += 1;

    const paneCount = Math.max(1, sec.panes.length);
    const rowHeightPt = Math.max(92, Math.ceil(180 / paneCount));
    const rStart = curRow;
    const rEnd = curRow + paneCount - 1;
    if (paneCount > 1) merges.push(`A${rStart}:A${rEnd}`);

    const doorAsset = doorAssets.get(sec.sectionKey);
    if (!sec.isManualGroup && doorAsset) anchors.push({ assetId: doorAsset.id, col0: 0, startRow0: rStart - 1, endRow0: rEnd - 1 });

    sec.panes.forEach((p, idx) => {
      const r = rStart + idx;
      const paneAsset = paneAssets.get(p.geometryKey);
      if (paneAsset) anchors.push({ assetId: paneAsset.id, col0: 2, startRow0: r - 1, endRow0: r - 1 });
      rows.push({
        row1: r,
        heightPt: rowHeightPt,
        cells: [
          idx === 0 && sec.isManualGroup ? strCell(0, 'Kính lẻ ngoài cửa', XLSX_STYLE.CELL_CENTER) : emptyCell(0, XLSX_STYLE.CELL_CENTER),
          strCell(1, `${p.paneLabel}\n[${p.specCode}]`, XLSX_STYLE.CELL_CODE),
          emptyCell(2, XLSX_STYLE.CELL_CENTER),
          strCell(3, p.item.glassType, XLSX_STYLE.CELL_TEXT),
          strCell(4, formatPaneShapeSummary(p.item.frameShape, p.item.archConfig), XLSX_STYLE.CELL_CENTER),
          numCell(5, p.item.widthMm, XLSX_STYLE.CELL_INT),
          numCell(6, p.item.heightMm, XLSX_STYLE.CELL_INT),
          numCell(7, Number(p.item.areaM2.toFixed(3)), XLSX_STYLE.CELL_AREA),
          strCell(8, GLASS_GRIND_LABEL_MAP[p.item.grindType || ''] || p.item.grindType || 'Mài xiết cạnh', XLSX_STYLE.CELL_CENTER),
          strCell(9, p.noteText, XLSX_STYLE.CELL_TEXT),
        ],
      });
    });
    curRow = rEnd + 1;
  }

  const lastDataRow = Math.max(6, curRow - 1);
  merges.push(`A${curRow}:G${curRow}`, `I${curRow}:J${curRow}`);
  rows.push({
    row1: curRow,
    heightPt: 28,
    cells: [
      strCell(0, `TỔNG CỘNG TOÀN ĐƠN (${grouped.totalPanes} TẤM):`, XLSX_STYLE.TOTAL_LABEL),
      fCell(7, `SUM(H6:H${lastDataRow})`, grouped.totalAreaM2, XLSX_STYLE.TOTAL_AREA),
      emptyCell(8, XLSX_STYLE.TOTAL_LABEL),
    ],
  });

  return { name: 'Chi_Tiet_Theo_Ma_Cua', colWidths: [34, 20, 27, 28, 19, 12, 12, 15, 16, 24], freezeTopRows: 5, rows, merges, anchors };
}

export function buildGlassOrderWorksheets(
  order: GlassOrder,
  grouped: GroupedGlassOrderData,
  paneAssets: Map<string, ExcelImageAsset>,
  doorAssets: Map<string, ExcelImageAsset>,
): WorksheetSpec[] {
  return [
    buildFactorySpecSheet(order, grouped, paneAssets),
    buildDoorDetailSheet(order, grouped, paneAssets, doorAssets),
  ];
}
