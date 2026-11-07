import React from 'react';
import { SceneCellNode } from '../../studio-types';
import { MullionBar } from '../cad-types';
import { ColumnRow, ColumnRowChain } from '../cad-row-chains';

type EditDimensionHandler = (
  target: 'w' | 'h' | 'cell' | 'cell-w' | 'cell-h' | 'handleHeight',
  cellId?: string
) => void;

interface CadRowDimensionsProps {
  ox: number;
  oy: number;
  fw: number;
  fh: number;
  h: number;
  dimSubRightX: number;
  /** Nhánh cũ (cửa thẳng hàng): hàng danh nghĩa + đố ngang đã sắp theo y */
  horizSlices: SceneCellNode[];
  horizMullions: MullionBar[];
  /** Nhánh lệch hàng: chuỗi hàng đo thật của cột ngoài cùng bên phải (nhiều hàng) */
  rightChain?: ColumnRow[];
  /** Nhánh lệch hàng: các cột còn lại hiện chip số đo từng hàng */
  chipChains?: ColumnRowChain[];
  onEditDimension?: EditDimensionHandler;
}

const MIN_CHIP_ROW_PX = 14;
const CHIP_THICKNESS_PX = 12;

const RulerSegment: React.FC<{
  ox: number;
  fw: number;
  dimSubRightX: number;
  topY: number;
  botY: number;
  label: number;
  cellId?: string;
  onEditDimension?: EditDimensionHandler;
}> = ({ ox, fw, dimSubRightX, topY, botY, label, cellId, onEditDimension }) => (
  <g>
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
      onClick={() => onEditDimension?.('cell-h', cellId)}
    >
      {label}
    </text>
  </g>
);

/** Chip số đo chiều cao hàng đặt ở mép trái hàng trong cột (nền trắng viền xanh, xoay -90°) */
const RowChip: React.FC<{
  xLeft: number;
  row: ColumnRow;
  onEditDimension?: EditDimensionHandler;
}> = ({ xLeft, row, onEditDimension }) => {
  if (row.yBottom - row.yTop < MIN_CHIP_ROW_PX) return null;
  const centerY = (row.yTop + row.yBottom) / 2;
  const centerX = xLeft + CHIP_THICKNESS_PX / 2 + 2;
  const chipLength = Math.min(row.yBottom - row.yTop - 2, String(row.mm).length * 6 + 8);
  return (
    <g
      className={row.editableCellId ? 'cursor-pointer' : 'cursor-default'}
      onClick={(event) => {
        event.stopPropagation();
        if (row.editableCellId) onEditDimension?.('cell-h', row.editableCellId);
      }}
    >
      <rect
        x={centerX - CHIP_THICKNESS_PX / 2}
        y={centerY - chipLength / 2}
        width={CHIP_THICKNESS_PX}
        height={chipLength}
        rx={3}
        fill="#ffffff"
        stroke="#2563eb"
        strokeWidth="0.8"
      />
      <text
        x={centerX}
        y={centerY}
        fontSize="8"
        fontWeight="700"
        fill="#1e3a8a"
        fontFamily="system-ui, sans-serif"
        textAnchor="middle"
        dominantBaseline="middle"
        transform={`rotate(-90, ${centerX}, ${centerY})`}
      >
        <title>{`Chiều cao hàng: ${row.mm} mm (Nhấp để sửa)`}</title>
        {row.mm}
      </text>
    </g>
  );
};

/**
 * Thước chiều cao phụ bên phải bản vẽ.
 * - Cửa thẳng hàng: giữ nguyên cách vẽ cũ (hàng danh nghĩa, gióng theo đố ngang).
 * - Cửa lệch hàng: dùng chuỗi hàng đo thật của cột ngoài cùng bên phải + chip số đo ở các cột còn lại.
 */
export const CadRowDimensions: React.FC<CadRowDimensionsProps> = ({
  ox,
  oy,
  fw,
  fh,
  h,
  dimSubRightX,
  horizSlices,
  horizMullions,
  rightChain,
  chipChains,
  onEditDimension,
}) => {
  const segmentProps = { ox, fw, dimSubRightX, onEditDimension };

  if (rightChain) {
    return (
      <>
        <g stroke="#2563eb" strokeWidth="0.8">
          {rightChain.map((row, idx) => (
            <RulerSegment
              key={idx}
              {...segmentProps}
              topY={Math.round(row.yTop)}
              botY={Math.round(row.yBottom)}
              label={row.mm}
              cellId={row.editableCellId}
            />
          ))}
        </g>
        {(chipChains ?? []).map((chain) =>
          chain.rows.map((row, idx) => (
            <RowChip key={`chip-${chain.columnIndex}-${idx}`} xLeft={chain.xLeft} row={row} onEditDimension={onEditDimension} />
          ))
        )}
      </>
    );
  }

  const count = horizSlices.length;
  const rowScaledHeights = horizSlices.map((child) => Math.round((child.h / h) * fh));
  return (
    <g stroke="#2563eb" strokeWidth="0.8">
      {horizSlices.map((child, idx) => {
        const childHScale = rowScaledHeights[idx];
        const fallbackCurY = oy + rowScaledHeights.slice(0, idx).reduce((sum, value) => sum + value, 0);

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
          <RulerSegment key={idx} {...segmentProps} topY={topY} botY={botY} label={child.h} cellId={child.id} />
        );
      })}
    </g>
  );
};
