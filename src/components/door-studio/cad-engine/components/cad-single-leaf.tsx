import React from 'react';
import { SashConfig, SceneCellNode } from '../../studio-types';
import { CadMetrics, LeafCell } from '../cad-types';
import {
  LeafGeometry,
  hasDefaultLeafHandle,
  resolveHandleHeightMm,
  resolveHandleY,
} from '../cad-leaf-geometry';
import { buildSashSubPanes } from '../cad-leaf-subpanes';
import { renderCadGrille } from './cad-grille';
import { CadLeafHardware, resolveLeafHandleFlags } from './cad-leaf-hardware';
import { CadOpeningSymbol } from './cad-opening-symbol';
import { CadSashBox } from './cad-sash-box';
import { CadGlassEffectOverlay } from './cad-glass-effect-overlay';

interface CadSingleLeafProps {
  node: SceneCellNode;
  leaf: LeafCell;
  allLeaves: LeafCell[];
  geometry: LeafGeometry;
  metrics: CadMetrics;
  isSelected: boolean;
  selectedCellId?: string | null;
  doorHeightMm: number;
  originY: number;
  frameHeightPx: number;
  aluminumColor: string;
  hardwareColor: string;
  sashConfig?: SashConfig;
  onSelectCell: (cellId: string | null) => void;
}

const SLIM_LEAF_STROKE = '#18181b';

/** Cánh hệ Slim (vỏ cúc): khối nhôm liền, không nẹp/kính chi tiết */
const CadSlimLeafBody: React.FC<{
  node: SceneCellNode;
  geometry: LeafGeometry;
  leaf: LeafCell;
  aluminumColor: string;
  onSelectCell: (cellId: string | null) => void;
}> = ({ node, geometry, leaf, aluminumColor, onSelectCell }) => {
  const { sashBox, hasReversalSash, reversalD } = geometry;
  const guideLine = (xRatio: number) => (
    <line
      x1={sashBox.x + sashBox.w * xRatio}
      y1={sashBox.y}
      x2={sashBox.x + sashBox.w * xRatio}
      y2={sashBox.y + sashBox.h}
      stroke={SLIM_LEAF_STROKE}
      strokeOpacity={0.35}
      strokeWidth="0.5"
    />
  );
  return (
    <g>
      {hasReversalSash && (
        <CadSashBox sx={leaf.x} sy={leaf.y} sw={leaf.w} sh={leaf.h} aluminumColor={aluminumColor} joint="45" effectiveSashD={reversalD} />
      )}
      <g
        onClick={(e) => {
          e.stopPropagation();
          onSelectCell(node.id);
        }}
        className="cursor-pointer"
      >
        <rect x={sashBox.x} y={sashBox.y} width={sashBox.w} height={sashBox.h} fill={aluminumColor} stroke="#27272a" strokeWidth="0.9" />
        {guideLine(0.25)}
        {guideLine(0.75)}
        <CadOpeningSymbol
          cx={sashBox.x + 2}
          cy={sashBox.y + 2}
          cw={Math.max(4, sashBox.w - 4)}
          ch={Math.max(4, sashBox.h - 4)}
          type={node.sashType}
        />
      </g>
    </g>
  );
};

/** Ô cánh đơn (mở quay / hất / lật / lùa) hoặc vách kính cố định (Fix) */
export const CadSingleLeaf: React.FC<CadSingleLeafProps> = ({
  node,
  leaf,
  allLeaves,
  geometry,
  metrics,
  isSelected,
  selectedCellId,
  doorHeightMm,
  originY,
  frameHeightPx,
  aluminumColor,
  hardwareColor,
  sashConfig,
  onSelectCell,
}) => {
  const { isFixed, hasReversalWall, hasReversalSash, reversalD, sashBox, inner, sashJoint, thickness } = geometry;
  const flags = resolveLeafHandleFlags(node);
  const isHydraulic = Boolean(sashConfig?.isHydraulic || node.isHydraulic);

  if (!isFixed && sashConfig?.sashStyle === 'slim' && !flags.isSlidingDoorSash) {
    return (
      <CadSlimLeafBody node={node} geometry={geometry} leaf={leaf} aluminumColor={aluminumColor} onSelectCell={onSelectCell} />
    );
  }

  const { subPanes, mullionBars } = buildSashSubPanes({
    node,
    inner,
    isFixed,
    mullionThickness: metrics.sashMullion,
    beadWidth: metrics.bead,
    aluminumColor,
  });

  const isSecondaryOfPair =
    node.sashType === 'swing_left' &&
    node.hasLock !== true &&
    allLeaves.some(
      (other) => other.node.id !== node.id && other.node.sashType === 'swing_right' && Math.abs(other.y - leaf.y) < 10
    );
  const shouldRenderHandle = !isFixed && !isSecondaryOfPair && (node.hasLock ?? hasDefaultLeafHandle(node.sashType));
  const handleY = resolveHandleY(geometry, resolveHandleHeightMm(node, Boolean(sashConfig?.isHydraulic)), {
    doorHeightMm,
    originY,
    frameHeightPx,
  });

  return (
    <g>
      {/* Khung thanh đảo cho ô Fix (Đảo vách) / ô Cánh (Đảo cánh) */}
      {(hasReversalWall || hasReversalSash) && (
        <CadSashBox sx={leaf.x} sy={leaf.y} sw={leaf.w} sh={leaf.h} aluminumColor={aluminumColor} joint="45" effectiveSashD={reversalD} />
      )}

      {/* Khung cánh cửa */}
      {!isFixed && (
        <g
          onClick={(e) => {
            e.stopPropagation();
            onSelectCell(node.id);
          }}
          className="cursor-pointer"
        >
          <CadSashBox
            sx={sashBox.x}
            sy={sashBox.y}
            sw={sashBox.w}
            sh={sashBox.h}
            aluminumColor={aluminumColor}
            joint={sashJoint}
            effectiveSashD={thickness.left}
            thickness={thickness}
          />
        </g>
      )}

      {/* 1. Các thanh đố cánh */}
      {mullionBars.map((bar) => (
        <g key={bar.id}>
          <rect x={bar.x} y={bar.y} width={bar.w} height={bar.h} fill={aluminumColor} stroke="#27272a" strokeWidth="0.7" />
          {bar.w < bar.h ? (
            <>
              <line x1={bar.x} y1={bar.y} x2={bar.x} y2={bar.y + bar.h} stroke={SLIM_LEAF_STROKE} strokeWidth="0.5" />
              <line x1={bar.x + bar.w} y1={bar.y} x2={bar.x + bar.w} y2={bar.y + bar.h} stroke={SLIM_LEAF_STROKE} strokeWidth="0.5" />
            </>
          ) : (
            <>
              <line x1={bar.x} y1={bar.y} x2={bar.x + bar.w} y2={bar.y} stroke={SLIM_LEAF_STROKE} strokeWidth="0.5" />
              <line x1={bar.x} y1={bar.y + bar.h} x2={bar.x + bar.w} y2={bar.y + bar.h} stroke={SLIM_LEAF_STROKE} strokeWidth="0.5" />
            </>
          )}
        </g>
      ))}

      {/* 2. Từng ô kính/pano con và nẹp kính tương ứng */}
      {subPanes.map((sub) => (
        <g key={sub.id}>
          {sub.bead.el}
          <rect
            x={sub.gx}
            y={sub.gy}
            width={sub.gw}
            height={sub.gh}
            fill={sub.paneFill}
            fillOpacity={sub.paneOpacity}
            stroke="none"
            onClick={(e) => {
              e.stopPropagation();
              onSelectCell(sub.id);
            }}
            className="cursor-pointer"
          />
          {sub.node.paneType === 'glass' && (
            <CadGlassEffectOverlay
              cellId={sub.id}
              x={sub.gx}
              y={sub.gy}
              width={sub.gw}
              height={sub.gh}
              effect={sub.node.glassVisualEffect}
              color={sub.node.glassVisualColor}
              splitCount={sub.node.glassSplitCount ?? node.glassSplitCount}
            />
          )}
          {sub.node.paneType === 'glass' &&
            renderCadGrille(sub.gx, sub.gy, sub.gw, sub.gh, sub.node.grilleConfig || node.grilleConfig)}
          {selectedCellId === sub.id && (
            <rect
              x={sub.x + 1}
              y={sub.y + 1}
              width={Math.max(2, sub.w - 2)}
              height={Math.max(2, sub.h - 2)}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.8"
              strokeDasharray="4,2"
              pointerEvents="none"
            />
          )}
        </g>
      ))}

      {/* Ký hiệu mở cửa: Trùm lên toàn bộ diện tích cánh */}
      {!isFixed && <CadOpeningSymbol cx={inner.x} cy={inner.y} cw={inner.w} ch={inner.h} type={node.sashType} />}

      {/* Tay nắm & Khóa */}
      {shouldRenderHandle && (
        <CadLeafHardware
          node={node}
          geometry={geometry}
          handleY={handleY}
          scale={metrics.scale}
          hardwareColor={hardwareColor}
          isHydraulic={isHydraulic}
        />
      )}

      {/* Viền cam khi ô được chọn */}
      {isSelected && (
        <rect
          x={inner.x + 1}
          y={inner.y + 1}
          width={Math.max(2, inner.w - 2)}
          height={Math.max(2, inner.h - 2)}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeDasharray="5,3"
        />
      )}
    </g>
  );
};
