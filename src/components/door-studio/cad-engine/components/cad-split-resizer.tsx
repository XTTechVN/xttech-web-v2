import React, { useState, useRef, useEffect } from 'react';
import { MullionBar, CouplingSeamBar, ResizeSplitParams, LeafCell } from '../cad-types';
import { MullionInfo, SashConfig } from '../../studio-types';

interface CadSplitResizerProps {
  mullions: MullionBar[];
  couplingSeams: CouplingSeamBar[];
  leaves?: LeafCell[];
  scale: number;
  h?: number;
  oy?: number;
  fh?: number;
  sashD?: number;
  sashConfig?: SashConfig;
  selectedMullionId?: string | null;
  aluminumColor: string;
  onSelectCell?: (cellId: string | null) => void;
  onSelectMullion?: (mullion: MullionInfo) => void;
  onResizeSplit?: (params: ResizeSplitParams) => void;
  onUpdateDimension?: (
    target: 'w' | 'h' | 'cell' | 'cell-w' | 'cell-h' | 'handleHeight',
    value: number,
    cellId?: string,
    isFinal?: boolean
  ) => void;
}

interface ActiveDragInfo {
  id: string;
  type: 'mullion' | 'coupling' | 'handle';
  direction: 'vertical' | 'horizontal';
  parentNodeId: string;
  splitIndex: number;
  childId: string;
  nextChildId: string;
  initDim1: number;
  initDim2: number;
  totalDim: number;
  minDim?: number;
  maxDim?: number;
  curDim1: number;
  curDim2: number;
  badgeX: number;
  badgeY: number;
  hasMoved: boolean;
}

interface HandleDragZone {
  id: string;
  cellId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  centerX: number;
  centerY: number;
  handleHeight: number;
  minHeight: number;
  maxHeight: number;
}

/**
 * Component quản lý tương tác chuột cho Đố T (Mullions), Vách ghép (Coupling Seams) và Tay nắm khóa (Lock Handles):
 * - Đố T & Vách ghép: Kéo ngang/dọc điều chỉnh tỉ lệ 2 ô liền kề; click tĩnh mở modal thông số đố.
 * - Tay nắm khóa: Giữ chuột và kéo trực tiếp lên/xuống (ns-resize) để thay đổi cao độ khóa real-time (không bật modal).
 * - Realtime Live Badge: Hiển thị số đo milimet trực tiếp ngay tại vị trí kéo.
 */
export const CadSplitResizer: React.FC<CadSplitResizerProps> = ({
  mullions,
  couplingSeams,
  leaves = [],
  scale,
  h = 2200,
  oy = 0,
  fh = 400,
  sashD = 12,
  sashConfig,
  selectedMullionId,
  aluminumColor,
  onSelectCell,
  onSelectMullion,
  onResizeSplit,
  onUpdateDimension,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeDrag, setActiveDrag] = useState<ActiveDragInfo | null>(null);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    activeInfo: ActiveDragInfo;
    lastReportedDim1: number;
    hasMoved: boolean;
    isLeftClick: boolean;
    mullionInfo?: MullionInfo;
    svgEl?: SVGSVGElement | null;
  } | null>(null);

  // Tính toán danh sách vùng kéo-thả cho tất cả các Tay nắm khóa trên cửa
  const handleZones: HandleDragZone[] = React.useMemo(() => {
    const zones: HandleDragZone[] = [];
    for (const leaf of leaves) {
      const { node, x: cx, y: cy, w: cw, h: ch } = leaf;
      if (node.sashType === 'fixed') continue;

      const isBottomOrTopHandle =
        node.sashType === 'awning' ||
        node.sashType === 'tilt' ||
        node.sashType === 'mo-hat' ||
        node.sashType === 'mo-lat' ||
        node.sashType === 'tilt_down';
      if (isBottomOrTopHandle) continue;

      const isSecondaryOfPair =
        node.sashType === 'swing_left' &&
        node.hasLock !== true &&
        leaves.some(
          (other) =>
            other.node.id !== node.id &&
            other.node.sashType === 'swing_right' &&
            Math.abs(other.y - cy) < 10
        );
      if (isSecondaryOfPair) continue;

      const sashHasHandle = [
        'swing_double',
        'swing_left',
        'swing_right',
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
      ].includes(node.sashType || '');

      const shouldRenderHandle = (node.hasLock ?? sashHasHandle) && node.hasLock !== false;
      if (!shouldRenderHandle) continue;

      const isHydraulic = Boolean(sashConfig?.isHydraulic || node.isHydraulic);
      const handleHVal = node.handleHeight || (isHydraulic ? 1050 : Math.round(node.h / 2));
      const lockYCalc = oy + fh - Math.round((handleHVal / (h || 1)) * fh);
      const bottomBound = cy + ch - sashD - 10;
      const topBound = cy + sashD + 20;
      const handleY = Math.max(topBound, Math.min(bottomBound, lockYCalc));

      let centerX = cx + cw / 2;
      let hitW = 28;
      if (node.sashType === 'swing_double') {
        centerX = cx + cw / 2 + (isHydraulic ? 0 : 6);
        hitW = 36;
      } else {
        const isRightHandle =
          node.sashType === 'swing_left' ||
          node.sashType === 'tilt_turn' ||
          node.sashType === 'le-trai-mo-ra' ||
          node.sashType === 'le-trai-mo-vao' ||
          node.sashType === 'gap-xep-le-trai' ||
          node.sashType === 'lua-trai' ||
          Boolean(node.sashJoiner) ||
          node.handleType === 'd-trai';
        centerX = isRightHandle ? cx + cw - sashD / 2 : cx + sashD / 2;
      }

      const hitH = isHydraulic
        ? Math.max(48, Math.round(Math.min(ch - 40, Math.max(70, 750 * scale))))
        : 34;

      const leafBottomMm = Math.max(0, Math.round(((oy + fh - (cy + ch)) / (fh || 1)) * h));
      const leafTopMm = Math.min(h, Math.round(((oy + fh - cy) / (fh || 1)) * h));
      const minHeight = Math.max(100, leafBottomMm + 80);
      const maxHeight = Math.min(h - 80, Math.max(minHeight + 40, leafTopMm - 80));

      zones.push({
        id: `handle-zone-${node.id}`,
        cellId: node.id,
        x: centerX - hitW / 2,
        y: handleY - hitH / 2,
        w: hitW,
        h: hitH,
        centerX,
        centerY: handleY,
        handleHeight: handleHVal,
        minHeight,
        maxHeight,
      });
    }
    return zones;
  }, [leaves, oy, fh, h, sashD, sashConfig, scale]);

  // Global mousemove / touchmove và mouseup / touchend khi đang kéo
  useEffect(() => {
    if (!activeDrag) return;

    const handleMove = (clientX: number, clientY: number) => {
      if (!dragRef.current) return;
      const { startX, startY, activeInfo, svgEl } = dragRef.current;

      // Trường hợp kéo Tay nắm khóa (vertical drag: kéo lên = tăng cao độ, kéo xuống = giảm cao độ)
      if (activeInfo.type === 'handle') {
        const deltaScreenY = clientY - startY;
        const totalMovement = Math.hypot(clientX - startX, clientY - startY);

        if (!dragRef.current.hasMoved) {
          if (totalMovement < 2) return;
          dragRef.current.hasMoved = true;
        }

        const ctm = svgEl?.getScreenCTM();
        const pxToVbY = ctm ? 1 / (ctm.d || 1) : 1;
        // Kéo lên trên (deltaScreenY < 0) làm tăng cao độ khóa tính từ đáy cửa
        const deltaMm = (-deltaScreenY * pxToVbY) / (scale || 1);
        const deltaSnapped = Math.round(deltaMm / 5) * 5;

        const minH = activeInfo.minDim ?? 150;
        const maxH = activeInfo.maxDim ?? Math.max(200, h - 100);
        const newHandleH = Math.max(minH, Math.min(maxH, activeInfo.initDim1 + deltaSnapped));

        const updatedBadgeY = oy + fh - Math.round((newHandleH / (h || 1)) * fh);

        setActiveDrag((prev) =>
          prev
            ? {
                ...prev,
                curDim1: newHandleH,
                badgeY: updatedBadgeY,
                hasMoved: true,
              }
            : null
        );

        if (newHandleH !== dragRef.current.lastReportedDim1) {
          dragRef.current.lastReportedDim1 = newHandleH;
          onUpdateDimension?.('handleHeight', newHandleH, activeInfo.childId, false);
        }
        return;
      }

      // Trường hợp kéo Đố T (mullion) hoặc Vách ghép (coupling)
      const isVert = activeInfo.direction === 'vertical';
      const deltaScreen = isVert ? clientX - startX : clientY - startY;
      const totalMovement = Math.hypot(clientX - startX, clientY - startY);

      if (!dragRef.current.hasMoved) {
        if (totalMovement < 3) return;
        dragRef.current.hasMoved = true;
      }

      const ctm = svgEl?.getScreenCTM();
      const pxToVb = ctm ? (isVert ? 1 / (ctm.a || 1) : 1 / (ctm.d || 1)) : 1;
      const deltaMm = (deltaScreen * pxToVb) / (scale || 1);
      const deltaSnapped = Math.round(deltaMm / 5) * 5;

      const minDim = Math.min(50, Math.max(20, Math.floor(activeInfo.totalDim * 0.15)));
      const maxDim = activeInfo.totalDim - minDim;
      const newDim1 = Math.max(minDim, Math.min(maxDim, activeInfo.initDim1 + deltaSnapped));
      const newDim2 = activeInfo.totalDim - newDim1;

      const deltaVb = deltaMm * (scale || 1);
      const updatedBadgeX = activeInfo.badgeX + (isVert ? deltaVb : 0);
      const updatedBadgeY = activeInfo.badgeY + (isVert ? 0 : deltaVb);

      setActiveDrag((prev) =>
        prev
          ? {
              ...prev,
              curDim1: newDim1,
              curDim2: newDim2,
              badgeX: updatedBadgeX,
              badgeY: updatedBadgeY,
              hasMoved: true,
            }
          : null
      );

      if (newDim1 !== dragRef.current.lastReportedDim1) {
        dragRef.current.lastReportedDim1 = newDim1;
        onResizeSplit?.({
          parentNodeId: activeInfo.parentNodeId,
          splitIndex: activeInfo.splitIndex,
          direction: activeInfo.direction,
          childId: activeInfo.childId,
          nextChildId: activeInfo.nextChildId,
          newDimension: newDim1,
          isFinal: false,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      if (dragRef.current) {
        const { activeInfo, lastReportedDim1, hasMoved, isLeftClick, mullionInfo } = dragRef.current;
        if (activeInfo.type === 'handle') {
          if (hasMoved) {
            onUpdateDimension?.('handleHeight', lastReportedDim1, activeInfo.childId, true);
          } else {
            onSelectCell?.(activeInfo.childId);
          }
        } else if (!hasMoved) {
          if (isLeftClick && mullionInfo) {
            onSelectMullion?.(mullionInfo);
          }
        } else {
          onResizeSplit?.({
            parentNodeId: activeInfo.parentNodeId,
            splitIndex: activeInfo.splitIndex,
            direction: activeInfo.direction,
            childId: activeInfo.childId,
            nextChildId: activeInfo.nextChildId,
            newDimension: lastReportedDim1,
            isFinal: true,
          });
        }
      }
      dragRef.current = null;
      setActiveDrag(null);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleEnd, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd, { passive: false });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [activeDrag, scale, h, oy, fh, onResizeSplit, onSelectMullion, onUpdateDimension, onSelectCell]);

  const handleStartDrag = (
    e: React.MouseEvent | React.TouchEvent,
    info: {
      id: string;
      type: 'mullion' | 'coupling' | 'handle';
      direction: 'vertical' | 'horizontal';
      parentNodeId: string;
      splitIndex: number;
      childId: string;
      nextChildId: string;
      dimension: number;
      nextDimension: number;
      totalDimension: number;
      minDim?: number;
      maxDim?: number;
      centerX: number;
      centerY: number;
      mullionInfo?: MullionInfo;
    }
  ) => {
    e.stopPropagation();

    let clientX = 0;
    let clientY = 0;
    let isLeftClick = true;

    if ('touches' in e) {
      if (e.touches.length !== 1) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      e.preventDefault();
      if (e.button !== 0 && e.button !== 2) return;
      clientX = e.clientX;
      clientY = e.clientY;
      isLeftClick = e.button === 0;
    }

    const activeInfo: ActiveDragInfo = {
      id: info.id,
      type: info.type,
      direction: info.direction,
      parentNodeId: info.parentNodeId,
      splitIndex: info.splitIndex,
      childId: info.childId,
      nextChildId: info.nextChildId,
      initDim1: info.dimension,
      initDim2: info.nextDimension,
      totalDim: info.totalDimension,
      minDim: info.minDim,
      maxDim: info.maxDim,
      curDim1: info.dimension,
      curDim2: info.nextDimension,
      badgeX: info.centerX,
      badgeY: info.centerY,
      hasMoved: false,
    };

    const targetEl = e.currentTarget as SVGGraphicsElement;
    const svgEl = targetEl.ownerSVGElement;

    dragRef.current = {
      startX: clientX,
      startY: clientY,
      activeInfo,
      lastReportedDim1: info.dimension,
      hasMoved: false,
      isLeftClick,
      mullionInfo: info.mullionInfo,
      svgEl,
    };

    setActiveDrag(activeInfo);
  };

  return (
    <g key="split-resizer-layer">
      {/* 1. Các thanh Đố T (Mullions: gồm cả đố khung và đố cánh) */}
      {mullions.map((m) => {
        const isHovered = hoveredId === m.info.id;
        const isSelected = selectedMullionId === m.info.id;
        const isDragging = activeDrag?.id === m.info.id;
        const isVert = m.info.direction === 'vertical';

        const hitboxX = isVert ? m.x - 7 : m.x;
        const hitboxY = isVert ? m.y : m.y - 7;
        const hitboxW = isVert ? m.w + 14 : m.w;
        const hitboxH = isVert ? m.h : m.h + 14;

        return (
          <g
            key={`mullion-group-${m.info.id}`}
            className="group"
            style={{ cursor: isVert ? 'col-resize' : 'row-resize' }}
            onMouseEnter={() => setHoveredId(m.info.id)}
            onMouseLeave={() => setHoveredId((prev) => (prev === m.info.id ? null : prev))}
            onContextMenu={(e) => e.preventDefault()}
            onMouseDown={(e) =>
              handleStartDrag(e, {
                id: m.info.id,
                type: 'mullion',
                direction: m.info.direction,
                parentNodeId: m.info.parentNodeId,
                splitIndex: m.info.mullionIndex,
                childId: m.info.childId,
                nextChildId: m.info.nextChildId || '',
                dimension: m.info.dimension,
                nextDimension: Math.max(20, m.info.totalDimension - m.info.dimension),
                totalDimension: m.info.totalDimension,
                centerX: m.x + m.w / 2,
                centerY: m.y + m.h / 2,
                mullionInfo: m.info,
              })
            }
          >
            <rect x={hitboxX} y={hitboxY} width={hitboxW} height={hitboxH} fill="transparent" />

            <rect
              x={m.x}
              y={m.y}
              width={m.w}
              height={m.h}
              fill={isDragging ? '#3b82f6' : isSelected || isHovered ? '#f59e0b' : aluminumColor}
              stroke={isDragging ? '#1d4ed8' : isSelected || isHovered ? '#b45309' : '#27272a'}
              strokeWidth={isDragging ? 2 : isSelected || isHovered ? 1.5 : 0.7}
              className="transition-colors duration-150"
            />

            {(isHovered || isDragging) && (
              <line
                x1={isVert ? m.x + m.w / 2 : m.x}
                y1={isVert ? m.y : m.y + m.h / 2}
                x2={isVert ? m.x + m.w / 2 : m.x + m.w}
                y2={isVert ? m.y + m.h : m.y + m.h / 2}
                stroke={isDragging ? '#60a5fa' : '#fbbf24'}
                strokeWidth={isDragging ? 2.5 : 1.5}
                strokeDasharray="4,2"
              />
            )}
          </g>
        );
      })}

      {/* 2. Các vách ghép Tách khung (Frame Coupling Seams) */}
      {couplingSeams.map((cs) => {
        const isHovered = hoveredId === cs.id;
        const isDragging = activeDrag?.id === cs.id;
        const isVert = cs.direction === 'vertical';

        return (
          <g
            key={`coupling-group-${cs.id}`}
            style={{ cursor: isVert ? 'col-resize' : 'row-resize' }}
            onMouseEnter={() => setHoveredId(cs.id)}
            onMouseLeave={() => setHoveredId((prev) => (prev === cs.id ? null : prev))}
            onContextMenu={(e) => e.preventDefault()}
            onMouseDown={(e) =>
              handleStartDrag(e, {
                id: cs.id,
                type: 'coupling',
                direction: cs.direction,
                parentNodeId: cs.parentNodeId,
                splitIndex: cs.splitIndex,
                childId: cs.childId,
                nextChildId: cs.nextChildId,
                dimension: cs.dimension,
                nextDimension: cs.nextDimension,
                totalDimension: cs.totalDimension,
                centerX: cs.x + cs.w / 2,
                centerY: cs.y + cs.h / 2,
              })
            }
          >
            <rect x={cs.x} y={cs.y} width={cs.w} height={cs.h} fill="transparent" />

            {(isHovered || isDragging) && (
              <line
                x1={isVert ? cs.x + cs.w / 2 : cs.x}
                y1={isVert ? cs.y : cs.y + cs.h / 2}
                x2={isVert ? cs.x + cs.w / 2 : cs.x + cs.w}
                y2={isVert ? cs.y + cs.h : cs.y + cs.h / 2}
                stroke={isDragging ? '#3b82f6' : '#0284c7'}
                strokeWidth={isDragging ? 3 : 2}
                strokeDasharray="5,2"
              />
            )}
          </g>
        );
      })}

      {/* 3. Các vùng Kéo-Thả Tay nắm khóa trực tiếp (Hold & Drag Handle Height) */}
      {handleZones.map((hz) => {
        const isHovered = hoveredId === hz.id;
        const isDragging = activeDrag?.id === hz.id;

        return (
          <g
            key={hz.id}
            style={{ cursor: 'ns-resize' }}
            onMouseEnter={() => setHoveredId(hz.id)}
            onMouseLeave={() => setHoveredId((prev) => (prev === hz.id ? null : prev))}
            onContextMenu={(e) => e.preventDefault()}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => {
              onSelectCell?.(hz.cellId);
              handleStartDrag(e, {
                id: hz.id,
                type: 'handle',
                direction: 'horizontal',
                parentNodeId: hz.cellId,
                splitIndex: 0,
                childId: hz.cellId,
                nextChildId: '',
                dimension: hz.handleHeight,
                nextDimension: 0,
                totalDimension: h,
                minDim: hz.minHeight,
                maxDim: hz.maxHeight,
                centerX: hz.centerX,
                centerY: hz.centerY,
              });
            }}
            onTouchStart={(e) => {
              onSelectCell?.(hz.cellId);
              handleStartDrag(e, {
                id: hz.id,
                type: 'handle',
                direction: 'horizontal',
                parentNodeId: hz.cellId,
                splitIndex: 0,
                childId: hz.cellId,
                nextChildId: '',
                dimension: hz.handleHeight,
                nextDimension: 0,
                totalDimension: h,
                minDim: hz.minHeight,
                maxDim: hz.maxHeight,
                centerX: hz.centerX,
                centerY: hz.centerY,
              });
            }}
          >
            {/* Vùng bắt chuột (Hitbox) mở rộng bao quanh tay nắm khóa */}
            <rect x={hz.x} y={hz.y} width={hz.w} height={hz.h} rx={5} fill="transparent" />

            {/* Viền sáng gợi ý kéo dọc khi hover hoặc đang giữ kéo */}
            {(isHovered || isDragging) && (
              <rect
                x={hz.x + 2}
                y={hz.y + 2}
                width={Math.max(8, hz.w - 4)}
                height={Math.max(12, hz.h - 4)}
                rx={4}
                fill={isDragging ? '#38bdf8' : '#f59e0b'}
                fillOpacity={0.18}
                stroke={isDragging ? '#0284c7' : '#d97706'}
                strokeWidth={1.2}
                strokeDasharray="3,2"
              />
            )}
          </g>
        );
      })}

      {/* 4. Floating Dimension Badge Tooltip khi đang kéo */}
      {activeDrag && activeDrag.hasMoved && (
        <g transform={`translate(${activeDrag.badgeX}, ${activeDrag.badgeY})`} className="pointer-events-none select-none">
          {(() => {
            const isHandle = activeDrag.type === 'handle';
            const isVert = activeDrag.direction === 'vertical';
            const labelText = isHandle
              ? `▲ Cao độ khóa: ${activeDrag.curDim1} mm ▼`
              : isVert
                ? `◄ ${activeDrag.curDim1} mm  |  ${activeDrag.curDim2} mm ►`
                : `▲ ${activeDrag.curDim1} mm  |  ${activeDrag.curDim2} mm ▼`;
            const badgeW = isHandle ? 148 : 160;
            const badgeH = 26;
            const offX = -badgeW / 2;
            const offY = -badgeH / 2 - 22;

            return (
              <g transform={`translate(${offX}, ${offY})`}>
                <rect
                  x={0}
                  y={0}
                  width={badgeW}
                  height={badgeH}
                  rx={6}
                  fill="#0f172a"
                  fillOpacity={0.92}
                  stroke="#38bdf8"
                  strokeWidth={1.5}
                />
                <polygon
                  points={`${badgeW / 2 - 5},${badgeH} ${badgeW / 2 + 5},${badgeH} ${badgeW / 2},${badgeH + 5}`}
                  fill="#0f172a"
                  stroke="#38bdf8"
                  strokeWidth={1}
                />
                <text
                  x={badgeW / 2}
                  y={badgeH / 2 + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="700"
                >
                  {labelText}
                </text>
              </g>
            );
          })()}
        </g>
      )}
    </g>
  );
};
