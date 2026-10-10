import React, { useState, useRef, useEffect } from 'react';
import { MullionBar, CouplingSeamBar, ResizeSplitParams } from '../cad-types';
import { MullionInfo } from '../../studio-types';

interface CadSplitResizerProps {
  mullions: MullionBar[];
  couplingSeams: CouplingSeamBar[];
  scale: number;
  selectedMullionId?: string | null;
  aluminumColor: string;
  onSelectMullion?: (mullion: MullionInfo) => void;
  onResizeSplit?: (params: ResizeSplitParams) => void;
}

interface ActiveDragInfo {
  id: string;
  type: 'mullion' | 'coupling';
  direction: 'vertical' | 'horizontal';
  parentNodeId: string;
  splitIndex: number;
  childId: string;
  nextChildId: string;
  initDim1: number;
  initDim2: number;
  totalDim: number;
  curDim1: number;
  curDim2: number;
  badgeX: number;
  badgeY: number;
}

/**
 * Component quản lý tương tác chuột cho Đố T (Mullions) và Vách ghép (Coupling Seams):
 * - Hover: Đổi con trỏ thành col-resize / row-resize, highlight đường chia.
 * - Giữ chuột phải (Right-Click Drag) hoặc chuột trái: Kéo trượt điều chỉnh tỉ lệ 2 ô liền kề.
 * - Realtime Live Badge: Hiển thị số đo milimet trực tiếp ngay tại vị trí kéo.
 */
export const CadSplitResizer: React.FC<CadSplitResizerProps> = ({
  mullions,
  couplingSeams,
  scale,
  selectedMullionId,
  aluminumColor,
  onSelectMullion,
  onResizeSplit,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeDrag, setActiveDrag] = useState<ActiveDragInfo | null>(null);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    activeInfo: ActiveDragInfo;
    lastReportedDim1: number;
  } | null>(null);

  // Global mousemove và mouseup khi đang kéo chuột
  useEffect(() => {
    if (!activeDrag) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { startX, startY, activeInfo } = dragRef.current;
      const isVert = activeInfo.direction === 'vertical';

      const deltaScreen = isVert ? e.clientX - startX : e.clientY - startY;
      // Quy đổi từ pixel màn hình sang milimet thực tế
      const deltaMm = deltaScreen / (scale || 1);
      // Làm tròn theo bước nhảy 5mm chuẩn kỹ thuật
      const deltaSnapped = Math.round(deltaMm / 5) * 5;

      // Giới hạn an toàn tối thiểu mỗi ô 100mm
      const minDim = 100;
      const maxDim = activeInfo.totalDim - minDim;
      const newDim1 = Math.max(minDim, Math.min(maxDim, activeInfo.initDim1 + deltaSnapped));
      const newDim2 = activeInfo.totalDim - newDim1;

      // Cập nhật vị trí hiển thị badge
      const updatedBadgeX = activeInfo.badgeX + (isVert ? deltaScreen : 0);
      const updatedBadgeY = activeInfo.badgeY + (isVert ? 0 : deltaScreen);

      setActiveDrag((prev) =>
        prev
          ? {
              ...prev,
              curDim1: newDim1,
              curDim2: newDim2,
              badgeX: updatedBadgeX,
              badgeY: updatedBadgeY,
            }
          : null
      );

      // Báo cáo thay đổi real-time nếu có thay đổi số đo
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

    const handleMouseUp = (e: MouseEvent) => {
      if (dragRef.current) {
        const { activeInfo, lastReportedDim1 } = dragRef.current;
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
      dragRef.current = null;
      setActiveDrag(null);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp, { passive: false });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeDrag, scale, onResizeSplit]);

  const handleStartDrag = (
    e: React.MouseEvent,
    info: {
      id: string;
      type: 'mullion' | 'coupling';
      direction: 'vertical' | 'horizontal';
      parentNodeId: string;
      splitIndex: number;
      childId: string;
      nextChildId: string;
      dimension: number;
      nextDimension: number;
      totalDimension: number;
      centerX: number;
      centerY: number;
    }
  ) => {
    // Chặn chuột phải mở context menu
    e.preventDefault();
    e.stopPropagation();

    // Hỗ trợ cả kéo chuột phải (button 2) lẫn chuột trái (button 0)
    if (e.button !== 2 && e.button !== 0) return;

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
      curDim1: info.dimension,
      curDim2: info.nextDimension,
      badgeX: info.centerX,
      badgeY: info.centerY,
    };

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      activeInfo,
      lastReportedDim1: info.dimension,
    };

    setActiveDrag(activeInfo);
  };

  return (
    <g key="split-resizer-layer">
      {/* 1. Các thanh Đố T (Mullions) */}
      {mullions.map((m, idx) => {
        const isHovered = hoveredId === m.info.id;
        const isSelected = selectedMullionId === m.info.id;
        const isDragging = activeDrag?.id === m.info.id;
        const isVert = m.info.direction === 'vertical';

        // Hitbox mở rộng để người dùng dễ rê chuột trúng thanh đố mảnh
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
            onMouseDown={(e) => {
              if (e.button === 2) {
                // Chuột phải: Kích hoạt chế độ kéo trượt di chuyển đố tức thì
                handleStartDrag(e, {
                  id: m.info.id,
                  type: 'mullion',
                  direction: m.info.direction,
                  parentNodeId: m.info.parentNodeId,
                  splitIndex: m.info.mullionIndex,
                  childId: m.info.childId,
                  nextChildId: m.info.nextChildId || '',
                  dimension: m.info.dimension,
                  nextDimension: Math.max(100, m.info.totalDimension - m.info.dimension),
                  totalDimension: m.info.totalDimension,
                  centerX: m.x + m.w / 2,
                  centerY: m.y + m.h / 2,
                });
              } else if (e.button === 0) {
                // Chuột trái: Click để mở modal chỉnh thông số hoặc kéo thả nếu rê chuột
                onSelectMullion?.(m.info);
              }
            }}
          >
            {/* Hitbox trong suốt */}
            <rect x={hitboxX} y={hitboxY} width={hitboxW} height={hitboxH} fill="transparent" />

            {/* Thanh đố hiển thị thực tế */}
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

            {/* Đường chỉ sáng tương tác khi hover hoặc kéo */}
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
            onMouseDown={(e) => {
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
              });
            }}
          >
            {/* Hitbox mở rộng trên đường ghép khung */}
            <rect x={cs.x} y={cs.y} width={cs.w} height={cs.h} fill="transparent" />

            {/* Đường highlight khi hover/kéo tách khung */}
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

      {/* 3. Floating Dimension Badge Tooltip khi đang kéo */}
      {activeDrag && (
        <g transform={`translate(${activeDrag.badgeX}, ${activeDrag.badgeY})`} className="pointer-events-none select-none">
          {(() => {
            const isVert = activeDrag.direction === 'vertical';
            const labelText = isVert
              ? `◄ ${activeDrag.curDim1} mm  |  ${activeDrag.curDim2} mm ►`
              : `▲ ${activeDrag.curDim1} mm  |  ${activeDrag.curDim2} mm ▼`;
            const badgeW = 160;
            const badgeH = 26;
            const offX = -badgeW / 2;
            const offY = -badgeH / 2 - 20;

            return (
              <g transform={`translate(${offX}, ${offY})`}>
                {/* Nền badge bo góc hiệu ứng dark glow */}
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
                {/* Mũi tên trỏ xuống */}
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
