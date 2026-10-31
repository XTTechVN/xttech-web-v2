import React from 'react';
import { SceneCellNode, SashConfig } from '../../studio-types';
import { LeafCell, MullionBar, VerticalSlice } from '../cad-types';

interface CadDimensionOverlayProps {
  w: number;
  h: number;
  ox: number;
  oy: number;
  fw: number;
  fh: number;
  frameD: number;
  sashD: number;
  isOpenBottom: boolean;
  vertSlices: VerticalSlice[];
  horizSlices: SceneCellNode[];
  leaves: LeafCell[];
  mullions?: MullionBar[];
  sashConfig?: SashConfig;
  selectedCellId?: string | null;
  onEditDimension?: (target: 'w' | 'h' | 'cell' | 'cell-w' | 'cell-h' | 'handleHeight', cellId?: string) => void;
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
  frameD,
  sashD,
  isOpenBottom,
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

  const dimSubBotY = oy + fh + 20;
  const dimBotY = oy + fh + (hasVertSubDims ? 44 : 26);
  const dimSubRightX = ox + fw + 20;
  const dimRightX = ox + fw + (hasHorizSubDims ? 44 : 26);

  // Lọc và sắp xếp các đố ngang / đố dọc từ cây layout để gióng thước chuẩn vào tim đố
  const horizMullions = (mullions || [])
    .filter((m) => m.info.direction === 'horizontal')
    .sort((a, b) => a.y - b.y);

  const vertMullions = (mullions || [])
    .filter((m) => m.info.direction === 'vertical')
    .sort((a, b) => a.x - b.x);

  // Tìm tất cả các ô cánh có lắp khóa bên hông để vẽ đường gióng cao độ tay nắm (hỗ trợ nhiều khóa lệch nhau)
  const SIDE_HANDLE_SASH_TYPES = [
    'swing_left',
    'swing_right',
    'swing_double',
    'tilt_turn',
    'le-trai-mo-ra',
    'le-trai-mo-vao',
    'le-phai-mo-ra',
    'le-phai-mo-vao',
    'gap-xep-le-trai',
    'gap-xep-le-phai',
    'lua-trai',
    'lua-phai',
    'canh-truot',
    'sliding',
  ];

  const lockLeaves = leaves.filter((l) => {
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

    const defaultHasHandle = SIDE_HANDLE_SASH_TYPES.includes(l.node.sashType || '');
    return (l.node.hasLock ?? defaultHasHandle) && l.node.hasLock !== false;
  });

  const isGlobalHydraulic = Boolean(sashConfig?.isHydraulic);
  const lockRulerItems = (() => {
    const map = new Map<number, { handleHVal: number; lockY: number; leaf: LeafCell }>();
    for (const l of lockLeaves) {
      const isHyd = Boolean(isGlobalHydraulic || l.node.isHydraulic);
      const handleHVal = l.node.handleHeight || (isHyd ? 1050 : Math.round(l.node.h / 2));
      const lockYCalc = oy + fh - Math.round((handleHVal / h) * fh);
      const bottomBound = l.y + l.h - sashD - 10;
      const topBound = l.y + sashD + 20;
      const lockY = Math.max(topBound, Math.min(bottomBound, lockYCalc));

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
            return vertSlices.map((child, idx) => {
              const isLast = idx === count - 1;
              const leftX = idx === 0 ? ox : ox + Math.round((child.xStart / totalW) * fw);
              const rightX = isLast ? ox + fw : ox + Math.round((child.xEnd / totalW) * fw);
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
                          onEditDimension?.('cell', child.editableCellId || child.id);
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
      {hasHorizSubDims && (
        <g stroke="#2563eb" strokeWidth="0.8">
          {(() => {
            let accumH = 0;
            const count = horizSlices.length;
            return horizSlices.map((child, idx) => {
              const childHScale = Math.round((child.h / h) * fh);
              const fallbackCurY = oy + accumH;
              accumH += childHScale;

              // Gióng chuẩn vào tim đố ngang (Center of Horizontal Mullion)
              const topY =
                idx === 0
                  ? oy
                  : horizMullions[idx - 1]
                    ? Math.round(horizMullions[idx - 1].y + horizMullions[idx - 1].h / 2)
                    : fallbackCurY;

              const botY =
                idx === count - 1
                  ? oy + fh
                  : horizMullions[idx]
                    ? Math.round(horizMullions[idx].y + horizMullions[idx].h / 2)
                    : fallbackCurY + childHScale;

              return (
                <g key={idx}>
                  <line x1={ox + fw} y1={topY} x2={dimSubRightX} y2={topY} strokeDasharray="2,2" />
                  <line x1={ox + fw} y1={botY} x2={dimSubRightX} y2={botY} strokeDasharray="2,2" />
                  <line x1={dimSubRightX} y1={topY} x2={dimSubRightX} y2={botY} strokeWidth="0.9" />
                  <circle cx={dimSubRightX} cy={topY} r={2} fill="#2563eb" />
                  <circle cx={dimSubRightX} cy={botY} r={2} fill="#2563eb" />
                  <text
                    x={dimSubRightX - 3}
                    y={(topY + botY) / 2}
                    fontSize="9.5"
                    fill="#1e40af"
                    fontFamily="system-ui, sans-serif"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    paintOrder="stroke"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                    transform={`rotate(-90, ${dimSubRightX - 3}, ${(topY + botY) / 2})`}
                    className="cursor-pointer hover:fill-red-600 hover:font-bold"
                    onClick={() => onEditDimension?.('cell-h', child.id)}
                  >
                    {child.h}
                  </text>
                </g>
              );
            });
          })()}
        </g>
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
      {lockRulerItems.map((item, idx) => {
        const dimLeftX = ox - (lockRulerItems.length > 1 ? 20 + idx * 22 : 26);
        const isTargetSelected = selectedCellId === item.leaf.node.id;

        return (
          <g key={`lock-ruler-${item.leaf.node.id}-${item.handleHVal}`} stroke="#2563eb" strokeWidth="0.8">
            <line x1={ox} y1={oy + fh} x2={dimLeftX} y2={oy + fh} strokeDasharray="2,2" />
            <line x1={ox} y1={item.lockY} x2={dimLeftX} y2={item.lockY} strokeDasharray="2,2" />
            <line x1={dimLeftX} y1={oy + fh} x2={dimLeftX} y2={item.lockY} strokeWidth={isTargetSelected ? '1.1' : '1'} />
            <circle cx={dimLeftX} cy={oy + fh} r={2} fill="#2563eb" />
            <circle cx={dimLeftX} cy={item.lockY} r={2} fill="#2563eb" />
            <text
              x={dimLeftX - 4}
              y={(oy + fh + item.lockY) / 2}
              fontSize="9.5"
              fill={isTargetSelected ? '#dc2626' : '#1e40af'}
              fontFamily="system-ui, sans-serif"
              fontWeight="700"
              textAnchor="middle"
              dominantBaseline="middle"
              paintOrder="stroke"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinejoin="round"
              transform={`rotate(-90, ${dimLeftX - 4}, ${(oy + fh + item.lockY) / 2})`}
              className="cursor-pointer hover:fill-red-600 hover:font-bold"
              onClick={() => onEditDimension?.('handleHeight', item.leaf.node.id)}
            >
              <title>{`Cao độ tay nắm khóa: ${item.handleHVal} mm (Nhấp để sửa)`}</title>
              {item.handleHVal}
            </text>
          </g>
        );
      })}
    </>
  );
};
