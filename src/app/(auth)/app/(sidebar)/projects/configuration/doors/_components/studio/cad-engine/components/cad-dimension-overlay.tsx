import React from 'react';
import { SceneCellNode } from '../../studio-types';
import { LeafCell } from '../cad-types';

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
  vertSlices: { id: string; w: number }[];
  horizSlices: SceneCellNode[];
  leaves: LeafCell[];
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
  onEditDimension,
}) => {
  const hasVertSubDims = vertSlices.length > 1;
  const hasHorizSubDims = horizSlices.length > 1;

  const dimSubBotY = oy + fh + 20;
  const dimBotY = oy + fh + (hasVertSubDims ? 44 : 26);
  const dimSubRightX = ox + fw + 20;
  const dimRightX = ox + fw + (hasHorizSubDims ? 44 : 26);

  // Tìm ô cánh có lắp khóa để vẽ đường gióng cao độ tay nắm
  const lockLeaf = leaves.find(
    (l) =>
      (l.node.hasLock ?? (l.node.sashType === 'swing_left' || l.node.sashType === 'swing_right')) &&
      (l.node.sashType === 'swing_left' || l.node.sashType === 'swing_right') &&
      l.node.hasLock !== false
  );

  return (
    <>
      {/* 1. Sub-Dimension Lines (Bottom: khi có từ 2 cột dọc trở lên) */}
      {hasVertSubDims && (
        <g stroke="#2563eb" strokeWidth="0.8">
          {(() => {
            const totalW = vertSlices.reduce((sum, s) => sum + s.w, 0) || w;
            let accumW = 0;
            return vertSlices.map((child, idx) => {
              const isLast = idx === vertSlices.length - 1;
              const childWScale = isLast ? fw - accumW : Math.round((child.w / totalW) * fw);
              const curX = ox + accumW;
              accumW += childWScale;

              return (
                <g key={idx}>
                  <line x1={curX} y1={oy + fh} x2={curX} y2={dimSubBotY} strokeDasharray="2,2" />
                  <line x1={curX + childWScale} y1={oy + fh} x2={curX + childWScale} y2={dimSubBotY} strokeDasharray="2,2" />
                  <line x1={curX} y1={dimSubBotY} x2={curX + childWScale} y2={dimSubBotY} strokeWidth="0.9" />
                  <circle cx={curX} cy={dimSubBotY} r={2} fill="#2563eb" />
                  <circle cx={curX + childWScale} cy={dimSubBotY} r={2} fill="#2563eb" />
                  <text
                    x={curX + childWScale / 2}
                    y={dimSubBotY - 3}
                    textAnchor="middle"
                    fontSize="9.5"
                    fill="#1e40af"
                    fontFamily="system-ui, sans-serif"
                    fontWeight="700"
                    paintOrder="stroke"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                    className="cursor-pointer hover:fill-red-600 hover:font-bold"
                    onClick={() => onEditDimension?.('cell', child.id)}
                  >
                    {child.w}
                  </text>
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
            return horizSlices.map((child, idx) => {
              const childHScale = Math.round((child.h / h) * fh);
              const curY = oy + accumH;
              accumH += childHScale;

              return (
                <g key={idx}>
                  <line x1={ox + fw} y1={curY} x2={dimSubRightX} y2={curY} strokeDasharray="2,2" />
                  <line x1={ox + fw} y1={curY + childHScale} x2={dimSubRightX} y2={curY + childHScale} strokeDasharray="2,2" />
                  <line x1={dimSubRightX} y1={curY} x2={dimSubRightX} y2={curY + childHScale} strokeWidth="0.9" />
                  <circle cx={dimSubRightX} cy={curY} r={2} fill="#2563eb" />
                  <circle cx={dimSubRightX} cy={curY + childHScale} r={2} fill="#2563eb" />
                  <text
                    x={dimSubRightX - 3}
                    y={curY + childHScale / 2}
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
                    transform={`rotate(-90, ${dimSubRightX - 3}, ${curY + childHScale / 2})`}
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

      {/* 5. Cao độ tay nắm khóa (Lock Height: Left) */}
      {lockLeaf &&
        (() => {
          const handleHVal = lockLeaf.node.handleHeight || Math.round(lockLeaf.node.h / 2);
          const lockYCalc = oy + fh - Math.round((handleHVal / h) * fh);
          const bottomBound = isOpenBottom ? oy + fh - sashD - 10 : oy + fh - frameD - sashD - 10;
          const lockY = Math.max(oy + frameD + 10, Math.min(bottomBound, lockYCalc));
          const dimLeftX = ox - 26;

          return (
            <g stroke="#2563eb" strokeWidth="0.8">
              <line x1={ox} y1={oy + fh} x2={dimLeftX} y2={oy + fh} strokeDasharray="2,2" />
              <line x1={ox} y1={lockY} x2={dimLeftX} y2={lockY} strokeDasharray="2,2" />
              <line x1={dimLeftX} y1={oy + fh} x2={dimLeftX} y2={lockY} strokeWidth="1" />
              <circle cx={dimLeftX} cy={oy + fh} r={2} fill="#2563eb" />
              <circle cx={dimLeftX} cy={lockY} r={2} fill="#2563eb" />
              <text
                x={dimLeftX - 4}
                y={(oy + fh + lockY) / 2}
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
                transform={`rotate(-90, ${dimLeftX - 4}, ${(oy + fh + lockY) / 2})`}
                className="cursor-pointer hover:fill-red-600 hover:font-bold"
                onClick={() => onEditDimension?.('handleHeight', lockLeaf.node.id)}
              >
                {handleHVal}
              </text>
            </g>
          );
        })()}
    </>
  );
};
