import React from 'react';
import { SashConfig } from '../../studio-types';
import { CadMetrics, LeafCell } from '../cad-types';
import { resolveLeafGeometry } from '../cad-leaf-geometry';
import { CadDoubleLeaf } from './cad-double-leaf';
import { CadSingleLeaf } from './cad-single-leaf';

const FLOOR_GAP_TOLERANCE_PX = 1;
const FLOOR_TOUCH_TOLERANCE_PX = 2;

interface CadRectangularLeafProps {
  leaf: LeafCell;
  allLeaves: LeafCell[];
  isSelected: boolean;
  selectedCellId?: string | null;
  metrics: CadMetrics;
  h: number;
  oy: number;
  fh: number;
  aluminumColor: string;
  hardwareColor: string;
  isOpenBottom: boolean;
  sashConfig?: SashConfig;
  onSelectCell: (cellId: string | null) => void;
}

/**
 * Render ô cánh/vách chữ nhật thông thường:
 * - Cửa 2 cánh mở quay đối xứng (swing_double)
 * - Cửa 1 cánh mở quay / lật / hất / trượt
 * - Ô vách kính cố định (Fixed)
 * Hình học (độ dày từng cạnh, lòng trong, đảo khung) lấy từ `resolveLeafGeometry` dùng chung với đố cánh & vùng kéo tay nắm.
 */
export const CadRectangularLeaf: React.FC<CadRectangularLeafProps> = ({
  leaf,
  allLeaves,
  isSelected,
  selectedCellId,
  metrics,
  h,
  oy,
  fh,
  aluminumColor,
  hardwareColor,
  isOpenBottom,
  sashConfig,
  onSelectCell,
}) => {
  const { node, x: cx, y: cy, w: cw, h: ch, rawX = cx, rawY = cy, rawW = cw, rawH = ch, touchesFloor = false } = leaf;
  const geometry = resolveLeafGeometry(leaf, allLeaves, metrics, sashConfig);
  const isGlobalHydraulic = Boolean(sashConfig?.isHydraulic);

  // Lưu ý: độ lệch Hở nền / Ngậm ngang / Ngậm dọc đã được tính tại nguồn buildCadLayout (leaf.x, leaf.y, leaf.w, leaf.h)
  const isTouchingFloor =
    touchesFloor || (isOpenBottom && Math.abs(rawY + rawH - (oy + fh)) < FLOOR_TOUCH_TOLERANCE_PX);
  const hasFloorGap = isTouchingFloor && !geometry.isFixed && Math.abs(cy + ch - (oy + fh)) >= FLOOR_GAP_TOLERANCE_PX;
  const isFloorOverhang = hasFloorGap && cy + ch > oy + fh;

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onSelectCell(node.id);
      }}
      className="cursor-pointer"
    >
      {geometry.isDouble ? (
        <CadDoubleLeaf
          node={node}
          leaf={leaf}
          geometry={geometry}
          metrics={metrics}
          doorHeightMm={h}
          originY={oy}
          frameHeightPx={fh}
          isGlobalHydraulic={isGlobalHydraulic}
          aluminumColor={aluminumColor}
          hardwareColor={hardwareColor}
        />
      ) : (
        <CadSingleLeaf
          node={node}
          leaf={leaf}
          allLeaves={allLeaves}
          geometry={geometry}
          metrics={metrics}
          isSelected={isSelected}
          selectedCellId={selectedCellId}
          doorHeightMm={h}
          originY={oy}
          frameHeightPx={fh}
          aluminumColor={aluminumColor}
          hardwareColor={hardwareColor}
          sashConfig={sashConfig}
          onSelectCell={onSelectCell}
        />
      )}

      {/* Đường chuẩn mặt sàn nét đứt khi có khoảng hở nền dương hoặc âm nền */}
      {hasFloorGap && (
        <line
          x1={rawX}
          y1={oy + fh - 0.5}
          x2={rawX + rawW}
          y2={oy + fh - 0.5}
          stroke={isFloorOverhang ? '#334155' : '#64748b'}
          strokeWidth={isFloorOverhang ? '1.1' : '0.9'}
          strokeDasharray={isFloorOverhang ? '4,2' : '3,2'}
          pointerEvents="none"
        />
      )}
    </g>
  );
};
