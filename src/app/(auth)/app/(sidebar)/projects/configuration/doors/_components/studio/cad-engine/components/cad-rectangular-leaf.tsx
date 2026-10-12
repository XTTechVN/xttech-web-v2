import React from 'react';
import { SashCornerJoint, GlassGrilleConfig, SceneCellNode } from '../../studio-types';
import { CAD_CONFIG } from '../cad-config';
import { LeafCell } from '../cad-types';
import { CadOpeningSymbol } from './cad-opening-symbol';
import { renderCadBead } from './cad-bead';
import { CadSashBox } from './cad-sash-box';
import { GrilleMotifSvg } from '../../panels/grille-motif-svgs';

const renderCadGrille = (
  gx: number,
  gy: number,
  gw: number,
  gh: number,
  grilleConfig?: GlassGrilleConfig
) => {
  if (!grilleConfig || !grilleConfig.enabled) return null;
  const {
    hasGrid,
    hasBorder,
    hasCorner,
    barColor = '#D4AF37',
    barWidth = 6,
    cols = 1,
    rows = 1,
    borderOffset = 95,
    cornerSize = 180,
    colPositions,
    rowPositions,
    motifs = [],
  } = grilleConfig;

  const origW = grilleConfig.glassW || gw || 1;
  const origH = grilleConfig.glassH || gh || 1;
  const scaleX = gw / origW;
  const scaleY = gh / origH;
  const bw = Math.max(1.2, barWidth * scaleX);

  const bOffset = borderOffset * scaleX;
  const cDist = cornerSize * scaleX; // Khoảng cách từ mép ngoài tới đường nan góc (180mm)

  // Tọa độ các thanh nan dọc
  const vBars = (colPositions && colPositions.length === cols - 1)
    ? colPositions.map((pos) => gx + pos * scaleX)
    : Array.from({ length: cols - 1 }).map((_, i) => gx + ((i + 1) / cols) * gw);

  // Tọa độ các thanh nan ngang
  const hBars = (rowPositions && rowPositions.length === rows - 1)
    ? rowPositions.map((pos) => gy + pos * scaleY)
    : Array.from({ length: rows - 1 }).map((_, i) => gy + ((i + 1) / rows) * gh);

  const maskId = `grille-leaf-mask-${Math.round(gx)}-${Math.round(gy)}`;

  return (
    <g id="glass-grille">
      {motifs.length > 0 && (
        <defs>
          <mask id={maskId}>
            <rect x={gx - 10} y={gy - 10} width={gw + 20} height={gh + 20} fill="white" />
            {motifs.map((m) => {
              const mx = gx + (m.x ?? origW / 2) * scaleX;
              const my = gy + (m.y ?? origH / 2) * scaleY;
              const mw = Math.max(8, (m.width || 100) * scaleX);
              const mh = Math.max(8, (m.height || 100) * scaleY);
              const motifType = m.motifType || 'flower_classic';

              if (motifType === 'rhombus' || motifType === 'kim_cuong_vuong' || motifType === '3') {
                const pTop = `${mx},${my - mh / 2 + 1}`;
                const pRight = `${mx + mw / 2 - 1},${my}`;
                const pBottom = `${mx},${my + mh / 2 - 1}`;
                const pLeft = `${mx - mw / 2 + 1},${my}`;
                return (
                  <polygon
                    key={`leaf-mask-rhombus-${m.id}`}
                    points={`${pTop} ${pRight} ${pBottom} ${pLeft}`}
                    fill="black"
                  />
                );
              }

              if (motifType === 'lotus' || motifType === 'tram_kim_cuong' || motifType === '4') {
                const pTop = `${mx},${my - mh / 2 + 2}`;
                const pRight = `${mx + mw / 2 - 2},${my}`;
                const pBottom = `${mx},${my + mh / 2 - 2}`;
                const pLeft = `${mx - mw / 2 + 2},${my}`;
                return (
                  <polygon
                    key={`leaf-mask-lotus-${m.id}`}
                    points={`${pTop} ${pRight} ${pBottom} ${pLeft}`}
                    fill="black"
                  />
                );
              }

              return (
                <rect
                  key={`leaf-mask-rect-${m.id}`}
                  x={mx - mw / 2 + 1.5}
                  y={my - mh / 2 + 1.5}
                  width={mw - 3}
                  height={mh - 3}
                  rx="3"
                  fill="black"
                />
              );
            })}
          </mask>
        </defs>
      )}

      {/* 1. Nan chia lưới */}
      {hasGrid && (
        <g mask={motifs.length > 0 ? `url(#${maskId})` : undefined}>
          {vBars.map((x, i) => (
            <line key={`v-${i}`} x1={x} y1={gy} x2={x} y2={gy + gh} stroke={barColor} strokeWidth={bw} />
          ))}
          {hBars.map((y, i) => (
            <line key={`h-${i}`} x1={gx} y1={y} x2={gx + gw} y2={y} stroke={barColor} strokeWidth={bw} />
          ))}
        </g>
      )}
      {/* 2. Nan viền chu vi */}
      {hasBorder && (
        <rect
          x={gx + bOffset}
          y={gy + bOffset}
          width={Math.max(0, gw - bOffset * 2)}
          height={Math.max(0, gh - bOffset * 2)}
          fill="none"
          stroke={barColor}
          strokeWidth={bw}
        />
      )}
      {/* 3. Nan góc */}
      {hasCorner && (
        <g stroke={barColor} strokeWidth={bw} fill="none">
          <path d={`M ${gx + bOffset} ${gy + cDist} L ${gx + cDist} ${gy + cDist} L ${gx + cDist} ${gy + bOffset}`} />
          <path d={`M ${gx + gw - bOffset} ${gy + cDist} L ${gx + gw - cDist} ${gy + cDist} L ${gx + gw - cDist} ${gy + bOffset}`} />
          <path d={`M ${gx + bOffset} ${gy + gh - cDist} L ${gx + cDist} ${gy + gh - cDist} L ${gx + cDist} ${gy + gh - bOffset}`} />
          <path d={`M ${gx + gw - bOffset} ${gy + gh - cDist} L ${gx + gw - cDist} ${gy + gh - cDist} L ${gx + gw - cDist} ${gy + gh - bOffset}`} />
        </g>
      )}
      {/* 4. Hoa văn đúc tại giao điểm nan */}
      {motifs.map((m) => {
        const mx = gx + (m.x ?? origW / 2) * scaleX;
        const my = gy + (m.y ?? origH / 2) * scaleY;
        const mw = Math.max(8, (m.width || 100) * scaleX);
        const mh = Math.max(8, (m.height || 100) * scaleY);
        const motifType = m.motifType || 'flower_classic';

        return (
          <g key={m.id} transform={`translate(${mx - mw / 2}, ${my - mh / 2})`}>
            <GrilleMotifSvg
              motifType={motifType}
              color={barColor}
              width={mw}
              height={mh}
            />
          </g>
        );
      })}
    </g>
  );
};

interface CadRectangularLeafProps {
  leaf: LeafCell;
  allLeaves: LeafCell[];
  isSelected: boolean;
  selectedCellId?: string | null;
  sashD: number;
  beadW: number;
  mullionT: number;
  frameD: number;
  h: number;
  oy: number;
  fh: number;
  aluminumColor: string;
  hardwareColor: string;
  sashJoint: SashCornerJoint;
  isOpenBottom: boolean;
  onSelectCell: (cellId: string | null) => void;
  onEditDimension?: (target: 'w' | 'h' | 'cell' | 'cell-w' | 'cell-h' | 'handleHeight', cellId?: string) => void;
}

/**
 * Tính độ dày khung cánh thích ứng động theo kích thước ô cánh để tránh chiếm quá nhiều diện tích kính
 */
const getAdaptiveSashD = (cellW: number, cellH: number, isDoubleChild: boolean, isSliding: boolean, sashD: number) => {
  const ratioW = isSliding ? 0.12 : isDoubleChild ? 0.16 : 0.18;
  const maxAllowedW = Math.max(8, Math.floor(cellW * ratioW));
  const maxAllowedH = Math.max(8, Math.floor(cellH * 0.12));
  const maxAllowed = Math.min(maxAllowedW, maxAllowedH);

  const candidate = isSliding ? Math.round(sashD * 0.85) : sashD;
  return Math.max(8, Math.min(candidate, maxAllowed));
};

/**
 * Render ô cánh/vách chữ nhật thông thường:
 * - Cửa 2 cánh mở quay đối xứng (swing_double)
 * - Cửa 1 cánh mở quay / lật / hất / trượt
 * - Ô vách kính cố định (Fixed)
 */
export const CadRectangularLeaf: React.FC<CadRectangularLeafProps> = ({
  leaf,
  allLeaves,
  isSelected,
  selectedCellId,
  sashD,
  mullionT,
  frameD,
  h,
  oy,
  fh,
  aluminumColor,
  hardwareColor,
  sashJoint,
  isOpenBottom,
  onSelectCell,
  onEditDimension,
}) => {
  const { node, x: cx, y: cy, w: cw, h: ch } = leaf;
  const isFixed = node.sashType === 'fixed';
  const isDouble = node.sashType === 'swing_double';
  const isSliding = node.sashType === 'sliding';

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onSelectCell(node.id);
      }}
      className="cursor-pointer"
    >
      {/* Case A: 2 cánh mở quay đối xứng (swing_double) */}
      {isDouble ? (
        (() => {
          const astW = Math.max(
            CAD_CONFIG.MULLION.ASTRAGAL_MIN,
            Math.min(CAD_CONFIG.MULLION.ASTRAGAL_MAX, Math.round(mullionT * CAD_CONFIG.MULLION.ASTRAGAL_RATIO))
          );
          const s1W = Math.floor((cw - astW) / 2);
          const s2W = cw - astW - s1W;
          const dSash1 = getAdaptiveSashD(s1W, ch, true, false, sashD);
          const dSash2 = getAdaptiveSashD(s2W, ch, true, false, sashD);
          const s1X = cx;
          const s2X = cx + s1W + astW;
          const pane1W = Math.max(4, s1W - 2 * dSash1);
          const pane2W = Math.max(4, s2W - 2 * dSash2);
          const paneH1 = Math.max(4, ch - 2 * dSash1);
          const paneH2 = Math.max(4, ch - 2 * dSash2);

          const beadJoint = node.beadJoint || '90';
          const bead1 = renderCadBead(
            s1X + dSash1,
            cy + dSash1,
            pane1W,
            paneH1,
            `${node.id}-bead-1`,
            aluminumColor,
            Math.max(CAD_CONFIG.BEAD.MIN_W, Math.min(CAD_CONFIG.BEAD.MAX_W, Math.round(dSash1 * CAD_CONFIG.BEAD.NORMAL_RATIO))),
            beadJoint
          );

          const bead2 = renderCadBead(
            s2X + dSash2,
            cy + dSash2,
            pane2W,
            paneH2,
            `${node.id}-bead-2`,
            aluminumColor,
            Math.max(CAD_CONFIG.BEAD.MIN_W, Math.min(CAD_CONFIG.BEAD.MAX_W, Math.round(dSash2 * CAD_CONFIG.BEAD.NORMAL_RATIO))),
            beadJoint
          );

          // Tay nắm trên cánh phải
          const handleHVal = node.handleHeight || Math.round(node.h / 2);
          const lockYCalc = oy + fh - Math.round((handleHVal / h) * fh);
          const handleY = Math.max(cy + dSash2 + 20, Math.min(cy + ch - dSash2 - 20, lockYCalc));
          const plateW = 4.5;
          const plateH = 22;
          const leverW = 14;
          const leverH = 3.5;
          const plateX = s2X + dSash2 / 2 - plateW / 2;
          const plateY = handleY - plateH / 2;
          const leverX = plateX + plateW / 2;
          const leverY = handleY - leverH / 2;

          return (
            <g>
              {/* Cánh trái */}
              <CadSashBox sx={s1X} sy={cy} sw={s1W} sh={ch} aluminumColor={aluminumColor} joint={sashJoint} effectiveSashD={dSash1} />
              {bead1.el}
              <rect x={bead1.gx2} y={bead1.gy2} width={bead1.gw2} height={bead1.gh2} fill="#b2f5ea" fillOpacity={0.85} stroke="none" />
              {renderCadGrille(bead1.gx2, bead1.gy2, bead1.gw2, bead1.gh2, node.grilleConfig)}
              <CadOpeningSymbol cx={bead1.gx2} cy={bead1.gy2} cw={bead1.gw2} ch={bead1.gh2} type="swing_left" />

              {/* Đố động giữa 2 cánh */}
              <rect x={cx + s1W} y={cy} width={astW} height={ch} fill={aluminumColor} stroke="#27272a" strokeWidth="0.7" />

              {/* Cánh phải */}
              <CadSashBox sx={s2X} sy={cy} sw={s2W} sh={ch} aluminumColor={aluminumColor} joint={sashJoint} effectiveSashD={dSash2} />
              {bead2.el}
              <rect x={bead2.gx2} y={bead2.gy2} width={bead2.gw2} height={bead2.gh2} fill="#b2f5ea" fillOpacity={0.85} stroke="none" />
              {renderCadGrille(bead2.gx2, bead2.gy2, bead2.gw2, bead2.gh2, node.grilleConfig)}
              <CadOpeningSymbol cx={bead2.gx2} cy={bead2.gy2} cw={bead2.gw2} ch={bead2.gh2} type="swing_right" />

              {/* Tay gạt khóa */}
              <g
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditDimension?.('handleHeight', node.id);
                }}
              >
                <rect x={plateX} y={plateY} width={plateW} height={plateH} rx={1.5} fill={hardwareColor} stroke="#000" strokeWidth="0.5" />
                <circle cx={plateX + plateW / 2} cy={handleY + 5.5} r={1} fill="#111" />
                <rect x={leverX} y={leverY} width={leverW} height={leverH} rx={1.2} fill={hardwareColor} stroke="#000" strokeWidth="0.5" />
              </g>
            </g>
          );
        })()
      ) : (
        /* Case B: Single sash hoặc fixed pane */
        (() => {
          const dSash = isFixed ? 0 : getAdaptiveSashD(cw, ch, false, isSliding, sashD);
          const dBead = isFixed
            ? Math.max(CAD_CONFIG.BEAD.MIN_W, Math.min(CAD_CONFIG.BEAD.MAX_W, Math.round(frameD * CAD_CONFIG.BEAD.FIXED_RATIO)))
            : Math.max(CAD_CONFIG.BEAD.MIN_W, Math.min(CAD_CONFIG.BEAD.MAX_W, Math.round(dSash * CAD_CONFIG.BEAD.NORMAL_RATIO)));
          const beadJoint = node.beadJoint || '90';
          const hasBead = true;
          const innerX = isFixed ? cx : cx + dSash;
          const innerY = isFixed ? cy : cy + dSash;
          const innerW = Math.max(4, isFixed ? cw : cw - 2 * dSash);
          const innerH = Math.max(4, isFixed ? ch : ch - 2 * dSash);

          const hasSashMullions = !isFixed && Boolean(node.sashMullions && node.sashMullions.count > 1);
          const smCount = hasSashMullions ? (node.sashMullions?.count || 2) : 1;
          const smDir = node.sashMullions?.direction || 'vertical';
          const smPositions = node.sashMullions?.positions;
          const smT = Math.max(14, Math.min(32, Math.round(dSash * 0.7)));

          const paneFill =
            node.paneType === 'screen'
              ? 'url(#screen-mesh)'
              : node.paneType === 'louver'
                ? 'url(#louver-pattern)'
                : node.paneType === 'panel'
                  ? aluminumColor
                  : '#b2f5ea';
          const paneOpacity = node.paneType === 'glass' ? 0.85 : 0.95;

          const totalMullionT = (smCount - 1) * smT;
          const availSpanW = Math.max(10, innerW - (smDir === 'vertical' ? totalMullionT : 0));
          const availSpanH = Math.max(10, innerH - (smDir === 'horizontal' ? totalMullionT : 0));
          const totalPos =
            smPositions && smPositions.length === smCount
              ? smPositions.reduce((a, b) => a + b, 0)
              : smCount;

          interface SashSubPaneRenderItem {
            id: string;
            node: SceneCellNode;
            x: number;
            y: number;
            w: number;
            h: number;
            bead: any;
            gx: number;
            gy: number;
            gw: number;
            gh: number;
            paneFill: string;
            paneOpacity: number;
          }

          interface SashMullionBarRenderItem {
            id: string;
            x: number;
            y: number;
            w: number;
            h: number;
          }

          const sashSubPanes: SashSubPaneRenderItem[] = [];
          const sashMullionBars: SashMullionBarRenderItem[] = [];

          const traverseSashSubTree = (
            currNode: SceneCellNode,
            bx: number,
            by: number,
            bw: number,
            bh: number
          ) => {
            if (
              currNode.children &&
              currNode.children.length > 0 &&
              currNode.splitType === 'sash_mullion'
            ) {
              const isVert = currNode.splitDirection === 'vertical';
              const count = currNode.children.length;
              const mullionSpace = (count - 1) * smT;
              const availSpace = Math.max(10, (isVert ? bw : bh) - mullionSpace);
              const totalWeight = currNode.children.reduce(
                (sum: number, c: SceneCellNode) => sum + ((isVert ? c.w : c.h) || 1),
                0
              );

              let cur = 0;
              let spanCur = 0;
              currNode.children.forEach((child: SceneCellNode, idx: number) => {
                const isLast = idx === count - 1;
                const weight = (isVert ? child.w : child.h) || 1;
                const ratio = totalWeight > 0 ? weight / totalWeight : 1 / count;
                const childSpan = isLast ? availSpace - spanCur : Math.round(availSpace * ratio);
                const cw = isVert ? childSpan : bw;
                const ch = isVert ? bh : childSpan;
                const cx = isVert ? bx + cur : bx;
                const cy = isVert ? by : by + cur;

                traverseSashSubTree(child, cx, cy, cw, ch);
                cur += isVert ? cw : ch;
                spanCur += isVert ? cw : ch;

                if (idx < count - 1) {
                  sashMullionBars.push({
                    id: `${currNode.id}-sm-bar-${idx}`,
                    x: isVert ? bx + cur : bx,
                    y: isVert ? by : by + cur,
                    w: isVert ? smT : bw,
                    h: isVert ? bh : smT,
                  });
                  cur += smT;
                }
              });
              return;
            }

            // Ô lá con trong cánh
            const bead_i = hasBead
              ? renderCadBead(bx, by, bw, bh, `${currNode.id}-bead`, aluminumColor, dBead, beadJoint)
              : null;
            const gx_i = bead_i ? bead_i.gx2 : bx;
            const gy_i = bead_i ? bead_i.gy2 : by;
            const gw_i = bead_i ? bead_i.gw2 : bw;
            const gh_i = bead_i ? bead_i.gh2 : bh;

            const pFill =
              currNode.paneType === 'screen'
                ? 'url(#screen-mesh)'
                : currNode.paneType === 'louver'
                  ? 'url(#louver-pattern)'
                  : currNode.paneType === 'panel'
                    ? aluminumColor
                    : '#b2f5ea';
            const pOpacity = currNode.paneType === 'glass' ? 0.85 : 0.95;

            sashSubPanes.push({
              id: currNode.id,
              node: currNode,
              x: bx,
              y: by,
              w: bw,
              h: bh,
              bead: bead_i,
              gx: gx_i,
              gy: gy_i,
              gw: gw_i,
              gh: gh_i,
              paneFill: pFill,
              paneOpacity: pOpacity,
            });
          };

          // Khởi động duyệt đệ quy cây ô trong cánh
          if (node.children && node.children.length > 0 && node.splitType === 'sash_mullion') {
            traverseSashSubTree(node, innerX, innerY, innerW, innerH);
          } else if (hasSashMullions) {
            // Hỗ trợ cấu hình sashMullions phẳng cũ
            if (smDir === 'vertical') {
              let curX = innerX;
              let spanCur = 0;
              for (let i = 0; i < smCount; i++) {
                const isLast = i === smCount - 1;
                const ratio =
                  smPositions && smPositions.length === smCount
                    ? smPositions[i] / totalPos
                    : 1 / smCount;
                const wSub = isLast ? availSpanW - spanCur : Math.round(availSpanW * ratio);
                spanCur += wSub;

                const bead_i = hasBead
                  ? renderCadBead(curX, innerY, wSub, innerH, `${node.id}-sm-bead-${i}`, aluminumColor, dBead, beadJoint)
                  : null;
                sashSubPanes.push({
                  id: `${node.id}-sm-${i}`,
                  node,
                  x: curX,
                  y: innerY,
                  w: wSub,
                  h: innerH,
                  bead: bead_i,
                  gx: bead_i ? bead_i.gx2 : curX,
                  gy: bead_i ? bead_i.gy2 : innerY,
                  gw: bead_i ? bead_i.gw2 : wSub,
                  gh: bead_i ? bead_i.gh2 : innerH,
                  paneFill,
                  paneOpacity,
                });

                if (i < smCount - 1) {
                  sashMullionBars.push({
                    id: `${node.id}-sm-bar-${i}`,
                    x: curX + wSub,
                    y: innerY,
                    w: smT,
                    h: innerH,
                  });
                }
                curX += wSub + smT;
              }
            } else {
              let curY = innerY;
              let spanCur = 0;
              for (let i = 0; i < smCount; i++) {
                const isLast = i === smCount - 1;
                const ratio =
                  smPositions && smPositions.length === smCount
                    ? smPositions[i] / totalPos
                    : 1 / smCount;
                const hSub = isLast ? availSpanH - spanCur : Math.round(availSpanH * ratio);
                spanCur += hSub;

                const bead_i = hasBead
                  ? renderCadBead(innerX, curY, innerW, hSub, `${node.id}-sm-bead-${i}`, aluminumColor, dBead, beadJoint)
                  : null;
                sashSubPanes.push({
                  id: `${node.id}-sm-${i}`,
                  node,
                  x: innerX,
                  y: curY,
                  w: innerW,
                  h: hSub,
                  bead: bead_i,
                  gx: bead_i ? bead_i.gx2 : innerX,
                  gy: bead_i ? bead_i.gy2 : curY,
                  gw: bead_i ? bead_i.gw2 : innerW,
                  gh: bead_i ? bead_i.gh2 : hSub,
                  paneFill,
                  paneOpacity,
                });

                if (i < smCount - 1) {
                  sashMullionBars.push({
                    id: `${node.id}-sm-bar-${i}`,
                    x: innerX,
                    y: curY + hSub,
                    w: innerW,
                    h: smT,
                  });
                }
                curY += hSub + smT;
              }
            }
          } else {
            // Ô đơn (chưa chia đố)
            const beadSingle = hasBead
              ? renderCadBead(innerX, innerY, innerW, innerH, `${node.id}-bead`, aluminumColor, dBead, beadJoint)
              : null;
            sashSubPanes.push({
              id: node.id,
              node,
              x: innerX,
              y: innerY,
              w: innerW,
              h: innerH,
              bead: beadSingle,
              gx: beadSingle ? beadSingle.gx2 : innerX,
              gy: beadSingle ? beadSingle.gy2 : innerY,
              gw: beadSingle ? beadSingle.gw2 : innerW,
              gh: beadSingle ? beadSingle.gh2 : innerH,
              paneFill,
              paneOpacity,
            });
          }

          // Kiểm tra xem cánh này có nên vẽ tay nắm không
          const isSecondaryOfPair =
            node.sashType === 'swing_left' &&
            node.hasLock !== true &&
            allLeaves.some(
              (other) =>
                other.node.id !== node.id &&
                other.node.sashType === 'swing_right' &&
                Math.abs(other.y - cy) < 10
            );

          const sashHasHandle = ['swing_left', 'swing_right', 'tilt_turn', 'awning', 'tilt', 'tilt_down'].includes(node.sashType || '');
          const shouldRenderHandle = !isFixed && !isSecondaryOfPair && (node.hasLock ?? sashHasHandle);

          const isBottomHandle = node.sashType === 'awning' || node.sashType === 'tilt';
          const isTopHandle = node.sashType === 'tilt_down';
          const isRightHandle = node.sashType === 'swing_left' || node.sashType === 'tilt_turn';
          const isLeftHandle = node.sashType === 'swing_right';

          const handleHVal = node.handleHeight || Math.round(node.h / 2);
          const lockYCalc = oy + fh - Math.round((handleHVal / h) * fh);
          const bottomBound = isOpenBottom ? oy + fh - dSash - 10 : oy + fh - frameD - dSash - 10;
          const handleY = Math.max(cy + dSash + 20, Math.min(bottomBound, lockYCalc));

          const plateW = 4.5;
          const plateH = 22;
          const leverW = 14;
          const leverH = 3.5;

          return (
            <g>
              {!isFixed && (
                <CadSashBox sx={cx} sy={cy} sw={cw} sh={ch} aluminumColor={aluminumColor} joint={sashJoint} effectiveSashD={dSash} />
              )}

              {/* 1. Các thanh đố cánh */}
              {sashMullionBars.map((m) => (
                <g key={m.id}>
                  <rect
                    x={m.x}
                    y={m.y}
                    width={m.w}
                    height={m.h}
                    fill={aluminumColor}
                    stroke="#27272a"
                    strokeWidth="0.7"
                  />
                  {m.w < m.h ? (
                    <>
                      <line x1={m.x} y1={m.y} x2={m.x} y2={m.y + m.h} stroke="#18181b" strokeWidth="0.5" />
                      <line x1={m.x + m.w} y1={m.y} x2={m.x + m.w} y2={m.y + m.h} stroke="#18181b" strokeWidth="0.5" />
                    </>
                  ) : (
                    <>
                      <line x1={m.x} y1={m.y} x2={m.x + m.w} y2={m.y} stroke="#18181b" strokeWidth="0.5" />
                      <line x1={m.x} y1={m.y + m.h} x2={m.x + m.w} y2={m.y + m.h} stroke="#18181b" strokeWidth="0.5" />
                    </>
                  )}
                </g>
              ))}

              {/* 2. Từng ô kính/pano con và nẹp kính tương ứng */}
              {sashSubPanes.map((sub) => {
                const isSubSelected = selectedCellId === sub.id;
                return (
                  <g key={sub.id}>
                    {sub.bead?.el}
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
                    {sub.node.paneType === 'glass' &&
                      renderCadGrille(sub.gx, sub.gy, sub.gw, sub.gh, sub.node.grilleConfig || node.grilleConfig)}

                    {/* Viền cam khi ô con này được chọn */}
                    {isSubSelected && (
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
                );
              })}

              {/* Ký hiệu mở cửa: Trùm lên toàn bộ diện tích cánh (Hình 5) */}
              {!isFixed && (
                <CadOpeningSymbol cx={innerX} cy={innerY} cw={innerW} ch={innerH} type={node.sashType} />
              )}

              {/* Tay nắm */}
              {shouldRenderHandle && (
                <>
                  {isBottomHandle && (
                    <rect
                      x={cx + cw / 2 - 8}
                      y={cy + ch - dSash / 2 - 1.5}
                      width={16}
                      height={3.5}
                      rx={1}
                      fill={hardwareColor}
                      stroke="#000"
                      strokeWidth="0.5"
                    />
                  )}
                  {isTopHandle && (
                    <rect
                      x={cx + cw / 2 - 8}
                      y={cy + dSash / 2 - 1.5}
                      width={16}
                      height={3.5}
                      rx={1}
                      fill={hardwareColor}
                      stroke="#000"
                      strokeWidth="0.5"
                    />
                  )}
                  {isRightHandle && (
                    <g
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditDimension?.('handleHeight', node.id);
                      }}
                    >
                      <rect
                        x={cx + cw - dSash / 2 - plateW / 2}
                        y={handleY - plateH / 2}
                        width={plateW}
                        height={plateH}
                        rx={1.5}
                        fill={hardwareColor}
                        stroke="#000"
                        strokeWidth="0.5"
                      />
                      <circle cx={cx + cw - dSash / 2} cy={handleY + 5.5} r={1} fill="#111" />
                      <rect
                        x={cx + cw - dSash / 2 - plateW / 2 + plateW / 2 - leverW}
                        y={handleY - leverH / 2}
                        width={leverW}
                        height={leverH}
                        rx={1.2}
                        fill={hardwareColor}
                        stroke="#000"
                        strokeWidth="0.5"
                      />
                    </g>
                  )}
                  {isLeftHandle && (
                    <g
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditDimension?.('handleHeight', node.id);
                      }}
                    >
                      <rect
                        x={cx + dSash / 2 - plateW / 2}
                        y={handleY - plateH / 2}
                        width={plateW}
                        height={plateH}
                        rx={1.5}
                        fill={hardwareColor}
                        stroke="#000"
                        strokeWidth="0.5"
                      />
                      <circle cx={cx + dSash / 2} cy={handleY + 5.5} r={1} fill="#111" />
                      <rect
                        x={cx + dSash / 2 + plateW / 2}
                        y={handleY - leverH / 2}
                        width={leverW}
                        height={leverH}
                        rx={1.2}
                        fill={hardwareColor}
                        stroke="#000"
                        strokeWidth="0.5"
                      />
                    </g>
                  )}
                </>
              )}

              {/* Viền cam khi ô được chọn */}
              {isSelected && (
                <rect
                  x={innerX + 1}
                  y={innerY + 1}
                  width={Math.max(2, innerW - 2)}
                  height={Math.max(2, innerH - 2)}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="5,3"
                />
              )}
            </g>
          );
        })()
      )}
    </g>
  );
};
