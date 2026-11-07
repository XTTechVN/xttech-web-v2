import React from 'react';
import { SceneCellNode } from '../../studio-types';
import { CadMetrics, LeafCell } from '../cad-types';
import { LeafGeometry, resolveHandleHeightMm, resolveHandleY } from '../cad-leaf-geometry';
import { renderCadBead } from './cad-bead';
import { renderCadGrille } from './cad-grille';
import { CadOpeningSymbol } from './cad-opening-symbol';
import { CadSashBox } from './cad-sash-box';
import { CadGlassEffectOverlay } from './cad-glass-effect-overlay';
import { CadDoubleDoorHardware } from './cad-leaf-hardware';

const GLASS_FILL = '#b2f5ea';
const MIN_PANE_PX = 4;

interface CadDoubleLeafProps {
  node: SceneCellNode;
  leaf: LeafCell;
  geometry: LeafGeometry;
  metrics: CadMetrics;
  doorHeightMm: number;
  originY: number;
  frameHeightPx: number;
  isGlobalHydraulic: boolean;
  aluminumColor: string;
  hardwareColor: string;
}

/** Ô 2 cánh mở quay đối xứng (swing_double): 2 khung cánh + đố động giữa + tay nắm */
export const CadDoubleLeaf: React.FC<CadDoubleLeafProps> = ({
  node,
  leaf,
  geometry,
  metrics,
  doorHeightMm,
  originY,
  frameHeightPx,
  isGlobalHydraulic,
  aluminumColor,
  hardwareColor,
}) => {
  const { sashBox, thickness, reversalD, hasReversalSash, sashJoint } = geometry;
  const astragalWidth = metrics.astragal;
  const sashWidth = (sashBox.w - astragalWidth) / 2;
  const leftSashX = sashBox.x;
  const rightSashX = leftSashX + sashWidth + astragalWidth;
  const paneWidth = Math.max(MIN_PANE_PX, sashWidth - thickness.left - thickness.right);
  const paneHeight = Math.max(MIN_PANE_PX, sashBox.h - thickness.top - thickness.bottom);
  const beadJoint = node.beadJoint || '90';
  const paneY = sashBox.y + thickness.top;

  const leftBead = renderCadBead(leftSashX + thickness.left, paneY, paneWidth, paneHeight, `${node.id}-bead-1`, aluminumColor, metrics.bead, beadJoint);
  const rightBead = renderCadBead(rightSashX + thickness.left, paneY, paneWidth, paneHeight, `${node.id}-bead-2`, aluminumColor, metrics.bead, beadJoint);

  const isHydraulic = isGlobalHydraulic || Boolean(node.isHydraulic);
  const handleY = resolveHandleY(geometry, resolveHandleHeightMm(node, isGlobalHydraulic), {
    doorHeightMm,
    originY,
    frameHeightPx,
  });

  const renderGlassAndSymbol = (bead: typeof leftBead, symbol: 'swing_left' | 'swing_right') => (
    <>
      {bead.el}
      <rect x={bead.gx2} y={bead.gy2} width={bead.gw2} height={bead.gh2} fill={GLASS_FILL} fillOpacity={0.85} stroke="none" />
      {(node.paneType ?? 'glass') === 'glass' && (
        <CadGlassEffectOverlay
          cellId={`${node.id}-${symbol}`}
          x={bead.gx2}
          y={bead.gy2}
          width={bead.gw2}
          height={bead.gh2}
          effect={node.glassVisualEffect}
          color={node.glassVisualColor}
          splitCount={node.glassSplitCount}
        />
      )}
      {renderCadGrille(bead.gx2, bead.gy2, bead.gw2, bead.gh2, node.grilleConfig)}
      <CadOpeningSymbol cx={bead.gx2} cy={bead.gy2} cw={bead.gw2} ch={bead.gh2} type={symbol} />
    </>
  );

  return (
    <g>
      {/* Khung thanh đảo cho ô 2 cánh (nếu có reversalMode === 'sash') */}
      {hasReversalSash && (
        <CadSashBox sx={leaf.x} sy={leaf.y} sw={leaf.w} sh={leaf.h} aluminumColor={aluminumColor} joint="45" effectiveSashD={reversalD} />
      )}

      <CadSashBox sx={leftSashX} sy={sashBox.y} sw={sashWidth} sh={sashBox.h} aluminumColor={aluminumColor} joint={sashJoint} effectiveSashD={thickness.left} thickness={thickness} />
      {renderGlassAndSymbol(leftBead, 'swing_left')}

      {/* Đố động giữa 2 cánh */}
      <rect x={leftSashX + sashWidth} y={sashBox.y} width={astragalWidth} height={sashBox.h} fill={aluminumColor} stroke="#27272a" strokeWidth="0.7" />

      <CadSashBox sx={rightSashX} sy={sashBox.y} sw={sashWidth} sh={sashBox.h} aluminumColor={aluminumColor} joint={sashJoint} effectiveSashD={thickness.left} thickness={thickness} />
      {renderGlassAndSymbol(rightBead, 'swing_right')}

      <CadDoubleDoorHardware
        leftSashRightStileCenterX={leftSashX + sashWidth - thickness.right / 2}
        rightSashLeftStileCenterX={rightSashX + thickness.left / 2}
        handleY={handleY}
        maxPullLengthPx={sashBox.h - 40}
        scale={metrics.scale}
        hardwareColor={hardwareColor}
        isHydraulic={isHydraulic}
      />
    </g>
  );
};
