import React from 'react';
import { LeafCell } from '../cad-types';

export interface LockRulerItem {
  handleHVal: number;
  lockY: number;
  leaf: LeafCell;
}

interface CadLockRulersProps {
  items: LockRulerItem[];
  ox: number;
  oy: number;
  fh: number;
  selectedCellId?: string | null;
  onEditDimension?: (target: 'handleHeight', cellId?: string, displayedVal?: number) => void;
}

/** Cao độ tay nắm khóa (bên trái bản vẽ) - hỗ trợ nhiều khóa lệch nhau */
export const CadLockRulers: React.FC<CadLockRulersProps> = ({ items, ox, oy, fh, selectedCellId, onEditDimension }) => (
  <>
    {items.map((item, idx) => {
      const dimLeftX = ox - (items.length > 1 ? 20 + idx * 22 : 26);
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
            onClick={() => onEditDimension?.('handleHeight', item.leaf.node.id, item.handleHVal)}
          >
            <title>{`Cao độ tay nắm khóa: ${item.handleHVal} mm (Nhấp để sửa)`}</title>
            {item.handleHVal}
          </text>
        </g>
      );
    })}
  </>
);
