import React from 'react';
import { SceneCellNode, SashConfig } from '../../studio-types';
import { CadMetrics, LeafCell, MullionBar, VerticalSlice } from '../cad-types';
import { hasDefaultLeafHandle, resolveHandleHeightMm, resolveHandleY, resolveLeafGeometry } from '../cad-leaf-geometry';
import { getColumnRowChains, getMultiRowChains, isRowChainsAligned } from '../cad-row-chains';
import { CadRowDimensions } from './cad-row-dimensions';
import { CadLockRulers } from './cad-lock-rulers';

interface CadDimensionOverlayProps {
  w: number;
  h: number;
  ox: number;
  oy: number;
  fw: number;
  fh: number;
  metrics: CadMetrics;
  rootCell?: SceneCellNode;
  vertSlices: VerticalSlice[];
  horizSlices: SceneCellNode[];
  leaves: LeafCell[];
  mullions?: MullionBar[];
  sashConfig?: SashConfig;
  selectedCellId?: string | null;
  onEditDimension?: (
    target: 'w' | 'h' | 'cell' | 'cell-w' | 'cell-h' | 'handleHeight',
    cellId?: string,
    displayedVal?: number
  ) => void;
}

/**
 * Render Hệ thống Thước đo & Kích thước CAD (Dimensions & Sub-dimensions):
 * - Kích thước tổng thể phủ bì Ngang (W) & Cao (H)
 * - Kích thước chia ô phụ (Sub-dimensions) từng cột dọc & hàng ngang
 * - Cao độ tim khóa / tay nắm (Handle Height)
 */
export const CadDimensionOverlay: React.FC<CadDimensionOverlayProps> = ({
  w,
  h,
  ox,
  oy,
  fw,
  fh,
  metrics,
  rootCell,
  vertSlices,
  horizSlices,
  leaves,
  mullions,
  sashConfig,
  selectedCellId,
  onEditDimension,
}) => {
  const hasVertSubDims = vertSlices.length > 1;
  const hasHorizSubDims = horizSlices.length > 1;

  const maxLeafBottomY = leaves.reduce((maxY, l) => Math.max(maxY, l.y + l.h), oy + fh);
  const botRefY = Math.max(oy + fh, maxLeafBottomY);

  const dimSubBotY = botRefY + 20;
  const dimBotY = botRefY + (hasVertSubDims ? 44 : 26);
  const dimSubRightX = ox + fw + 20;
  const dimRightX = ox + fw + (hasHorizSubDims ? 44 : 26);

  // Lọc và sắp xếp các đố ngang / đố dọc từ cây layout để gióng thước chuẩn vào tim đố
  const horizMullions = (mullions || [])
    .filter((m) => m.info.direction === 'horizontal')
    .sort((a, b) => a.y - b.y);

  // Chuỗi hàng đo thật theo từng cột: cửa lệch hàng dùng cột ngoài cùng bên phải làm thước + chip số đo ở các cột còn lại
  const rowViewport = { ox, oy, fw, fh, h };
  const columnChains = getColumnRowChains(mullions || [], vertSlices, rowViewport, rootCell);
  const multiRowChains = getMultiRowChains(columnChains);
  const isRowMisaligned = !isRowChainsAligned(columnChains, rowViewport);
  // Cửa thẳng hàng giữ nguyên cách vẽ cũ, trừ khi danh sách đố trộn nhiều cột không khớp số hàng
  const useChainRuler =
    multiRowChains.length > 1 && (isRowMisaligned || horizMullions.length !== horizSlices.length - 1);
  const rulerChain = useChainRuler ? multiRowChains[multiRowChains.length - 1] : undefined;
  const chipChains = useChainRuler && isRowMisaligned ? multiRowChains.slice(0, -1) : [];

  const vertMullions = (mullions || [])
    .filter((m) => m.info.direction === 'vertical')
    .sort((a, b) => a.x - b.x);

  // Tìm tất cả các ô cánh có lắp khóa bên hông để vẽ đường gióng cao độ tay nắm (hỗ trợ nhiều khóa lệch nhau)

  const isVoCucMode =
    sashConfig?.sashStyle === 'slim' &&
    sashConfig?.family !== 'Cửa đi lùa' &&
    sashConfig?.family !== 'Cửa sổ lùa';

  const lockLeaves = isVoCucMode
    ? []
    : leaves.filter((l) => {
        if (l.node.sashType === 'fixed') return false;
    const isBottomOrTop =
      l.node.sashType === 'awning' ||
      l.node.sashType === 'tilt' ||
      l.node.sashType === 'mo-hat' ||
      l.node.sashType === 'mo-lat' ||
      l.node.sashType === 'tilt_down';
    if (isBottomOrTop) return false;

    const isSecondaryOfPair =
      l.node.sashType === 'swing_left' &&
      l.node.hasLock !== true &&
      leaves.some(
        (other) =>
          other.node.id !== l.node.id &&
          other.node.sashType === 'swing_right' &&
          Math.abs(other.y - l.y) < 10
      );
    if (isSecondaryOfPair) return false;

    const defaultHasHandle = hasDefaultLeafHandle(l.node.sashType);
    return (l.node.hasLock ?? defaultHasHandle) && l.node.hasLock !== false;
  });

  const isGlobalHydraulic = Boolean(sashConfig?.isHydraulic);
  const lockRulerItems = (() => {
    const map = new Map<number, { handleHVal: number; lockY: number; leaf: LeafCell }>();
    for (const l of lockLeaves) {
      const handleHVal = resolveHandleHeightMm(l.node, isGlobalHydraulic);
      const geometry = resolveLeafGeometry(l, leaves, metrics, sashConfig);
      const lockY = resolveHandleY(geometry, handleHVal, { doorHeightMm: h, originY: oy, frameHeightPx: fh });

      const existing = map.get(handleHVal);
      if (!existing || l.node.id === selectedCellId) {
        map.set(handleHVal, { handleHVal, lockY, leaf: l });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.handleHVal - b.handleHVal);
  })();

  return (
    <>
      {/* 1. Sub-Dimension Lines (Bottom: khi có từ 2 cột dọc trở lên) */}
      {hasVertSubDims && (
        <g stroke="#2563eb" strokeWidth="0.8">
          {(() => {
            const totalW = vertSlices.reduce((sum, s) => sum + s.w, 0) || w;
            const count = vertSlices.length;

            // Gióng chuẩn ranh giới giữa cột idx và cột idx + 1 vào tim đố dọc hoặc mép cánh
            const resolveVertBoundaryX = (idx: number): number => {
              const leftSlice = vertSlices[idx];
              const rightSlice = vertSlices[idx + 1];
              const fallbackX = ox + Math.round((leftSlice.xEnd / totalW) * fw);

              if (vertMullions.length === count - 1 && vertMullions[idx]) {
                return Math.round(vertMullions[idx].x + vertMullions[idx].w / 2);
              }

              const leftId = leftSlice.editableCellId || leftSlice.id;
              const rightId = rightSlice?.editableCellId || rightSlice?.id;
              const matchedMullion = vertMullions.find(
                (m) => m.info.childId === leftId || (rightId && m.info.nextChildId === rightId)
              );
              if (matchedMullion) {
                return Math.round(matchedMullion.x + matchedMullion.w / 2);
              }

              const matchedLeaf = leaves.find((l) => l.node.id === leftId);
              if (matchedLeaf) {
                return Math.round(matchedLeaf.x + matchedLeaf.w);
              }

              return fallbackX;
            };

            return vertSlices.map((child, idx) => {
              const isLast = idx === count - 1;
              const leftX = idx === 0 ? ox : resolveVertBoundaryX(idx - 1);
              const rightX = isLast ? ox + fw : resolveVertBoundaryX(idx);
              const segW = rightX - leftX;

              // Tự động tối ưu cỡ chữ chống đè chữ khi chia nhiều ô
              const showText = segW >= 16;
              const fontSize = segW < 32 ? (segW < 22 ? '7' : '8') : '9.5';
              const isEditable = !child.isHybrid && Boolean(child.editableCellId || child.id);

              return (
                <g key={idx}>
                  <line x1={leftX} y1={oy + fh} x2={leftX} y2={dimSubBotY} strokeDasharray="2,2" />
                  <line x1={rightX} y1={oy + fh} x2={rightX} y2={dimSubBotY} strokeDasharray="2,2" />
                  <line x1={leftX} y1={dimSubBotY} x2={rightX} y2={dimSubBotY} strokeWidth="0.9" />
                  <circle cx={leftX} cy={dimSubBotY} r={2} fill="#2563eb" />
                  <circle cx={rightX} cy={dimSubBotY} r={2} fill="#2563eb" />
                  {showText && (
                    <text
                      x={(leftX + rightX) / 2}
                      y={dimSubBotY - 3}
                      textAnchor="middle"
                      fontSize={fontSize}
                      fill="#1e40af"
                      fontFamily="system-ui, sans-serif"
                      fontWeight="700"
                      paintOrder="stroke"
                      stroke="#ffffff"
                      strokeWidth="3.5"
                      strokeLinejoin="round"
                      className={
                        isEditable
                          ? 'cursor-pointer hover:fill-red-600 hover:font-bold'
                          : 'cursor-default select-none'
                      }
                      onClick={() => {
                        if (isEditable) {
                          onEditDimension?.('cell-w', child.editableCellId || child.id, child.w);
                        }
                      }}
                    >
                      <title>
                        {child.isHybrid
                          ? `Khoảng cách định vị đố/cánh: ${child.w} mm`
                          : `Kích thước ô: ${child.w} mm (Nhấp để sửa)`}
                      </title>
                      {child.w}
                    </text>
                  )}
                </g>
              );
            });
          })()}
        </g>
      )}

      {/* 2. Sub-Dimension Lines (Right: khi có từ 2 hàng ngang trở lên) */}
      {(hasHorizSubDims || useChainRuler) && (
        <CadRowDimensions
          ox={ox}
          oy={oy}
          fw={fw}
          fh={fh}
          h={h}
          dimSubRightX={dimSubRightX}
          horizSlices={horizSlices}
          horizMullions={horizMullions}
          rightChain={rulerChain?.rows}
          chipChains={chipChains}
          onEditDimension={onEditDimension}
        />
      )}

      {/* 3. Kích thước tổng thể Chiều rộng (Bottom: W) */}
      <g stroke="#2563eb" strokeWidth="0.8">
        <line x1={ox} y1={oy + fh} x2={ox} y2={dimBotY} strokeDasharray="2,2" />
        <line x1={ox + fw} y1={oy + fh} x2={ox + fw} y2={dimBotY} strokeDasharray="2,2" />
        <line x1={ox} y1={dimBotY} x2={ox + fw} y2={dimBotY} strokeWidth="1" />
        <circle cx={ox} cy={dimBotY} r={2.2} fill="#2563eb" />
        <circle cx={ox + fw} cy={dimBotY} r={2.2} fill="#2563eb" />
        <text
          x={ox + fw / 2}
          y={dimBotY - 4}
          textAnchor="middle"
          fontSize="10.5"
          fill="#1e40af"
          fontFamily="system-ui, sans-serif"
          fontWeight="800"
          paintOrder="stroke"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinejoin="round"
          className="cursor-pointer hover:fill-red-600 hover:font-bold"
          onClick={() => onEditDimension?.('w')}
        >
          {w}
        </text>
      </g>

      {/* 4. Kích thước tổng thể Chiều cao (Right: H) */}
      <g stroke="#2563eb" strokeWidth="0.8">
        <line x1={ox + fw} y1={oy} x2={dimRightX} y2={oy} strokeDasharray="2,2" />
        <line x1={ox + fw} y1={oy + fh} x2={dimRightX} y2={oy + fh} strokeDasharray="2,2" />
        <line x1={dimRightX} y1={oy} x2={dimRightX} y2={oy + fh} strokeWidth="1" />
        <circle cx={dimRightX} cy={oy} r={2.2} fill="#2563eb" />
        <circle cx={dimRightX} cy={oy + fh} r={2.2} fill="#2563eb" />
        <text
          x={dimRightX - 4}
          y={oy + fh / 2}
          fontSize="10.5"
          fill="#1e40af"
          fontFamily="system-ui, sans-serif"
          fontWeight="800"
          textAnchor="middle"
          dominantBaseline="middle"
          paintOrder="stroke"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinejoin="round"
          transform={`rotate(-90, ${dimRightX - 4}, ${oy + fh / 2})`}
          className="cursor-pointer hover:fill-red-600 hover:font-bold"
          onClick={() => onEditDimension?.('h')}
        >
          {h}
        </text>
      </g>

      {/* 5. Cao độ tay nắm khóa (Lock Height: Left - Hỗ trợ hiển thị nhiều khóa lệch nhau) */}
      <CadLockRulers items={lockRulerItems} ox={ox} oy={oy} fh={fh} selectedCellId={selectedCellId} onEditDimension={onEditDimension} />
    </>
  );
};
