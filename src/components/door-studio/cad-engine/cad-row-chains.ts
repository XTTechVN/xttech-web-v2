import { MullionBar, VerticalSlice } from './cad-types';

/** Một hàng trong chuỗi hàng của 1 cột (px theo hệ tọa độ SVG, mm là số đo thật) */
export interface ColumnRow {
  yTop: number;
  yBottom: number;
  mm: number;
  editableCellId?: string;
}

export interface ColumnRowChain {
  columnIndex: number;
  /** Mép trái / phải của cột (px) */
  xLeft: number;
  xRight: number;
  rows: ColumnRow[];
}

interface RowChainViewport {
  ox: number;
  oy: number;
  fw: number;
  fh: number;
  /** Chiều cao cửa (mm) */
  h: number;
}

const ALIGN_TOLERANCE_MM = 0.5;

/**
 * Chuỗi hàng riêng của từng cột: lấy các đố ngang có tâm x nằm trong cột, sắp theo y,
 * biên hàng dùng TÂM đố; mm đo thật theo bản vẽ, sai số làm tròn dồn vào hàng cuối (tổng = h).
 */
export const getColumnRowChains = (
  mullions: MullionBar[],
  vertSlices: VerticalSlice[],
  viewport: RowChainViewport
): ColumnRowChain[] => {
  const { ox, oy, fw, fh, h } = viewport;
  const totalW = vertSlices.reduce((sum, slice) => sum + slice.w, 0) || 1;
  const horizMullions = mullions.filter((m) => m.info.direction === 'horizontal');
  const mmPerPx = h / (fh || 1);

  return vertSlices.map((slice, columnIndex) => {
    const colLeft = ox + (slice.xStart / totalW) * fw;
    const colRight = ox + (slice.xEnd / totalW) * fw;
    const colCenter = (colLeft + colRight) / 2;
    const columnMullions = horizMullions
      .filter((m) => m.x <= colCenter && colCenter <= m.x + m.w)
      .sort((a, b) => a.y - b.y);

    const edges = [oy, ...columnMullions.map((m) => m.y + m.h / 2), oy + fh];
    const rows: ColumnRow[] = [];
    let usedMm = 0;
    for (let idx = 0; idx < edges.length - 1; idx++) {
      const isLastRow = idx === edges.length - 2;
      const mm = isLastRow ? h - usedMm : Math.round((edges[idx + 1] - edges[idx]) * mmPerPx);
      usedMm += mm;
      const mullion = idx === 0 ? columnMullions[0] : columnMullions[idx - 1];
      const editableCellId = columnMullions.length === 0
        ? undefined
        : idx === 0
          ? mullion.info.childId
          : mullion.info.nextChildId;
      rows.push({ yTop: edges[idx], yBottom: edges[idx + 1], mm, editableCellId });
    }
    return { columnIndex, xLeft: colLeft, xRight: colRight, rows };
  });
};

/** Các cột nhiều hàng (>= 2 hàng) — cột 1 hàng không tham gia so sánh thẳng hàng */
export const getMultiRowChains = (chains: ColumnRowChain[]): ColumnRowChain[] =>
  chains.filter((chain) => chain.rows.length > 1);

/** Thẳng hàng: mọi cột nhiều hàng có cùng số hàng và cùng biên hàng (sai số < 0.5mm quy đổi) */
export const isRowChainsAligned = (chains: ColumnRowChain[], viewport: RowChainViewport): boolean => {
  const multiRowChains = getMultiRowChains(chains);
  if (multiRowChains.length <= 1) return true;
  const mmPerPx = viewport.h / (viewport.fh || 1);
  const [reference, ...others] = multiRowChains;
  return others.every(
    (chain) =>
      chain.rows.length === reference.rows.length &&
      chain.rows.every((row, idx) => Math.abs(row.yTop - reference.rows[idx].yTop) * mmPerPx < ALIGN_TOLERANCE_MM)
  );
};
