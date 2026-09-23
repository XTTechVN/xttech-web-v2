'use client';

import React, { useState, useRef } from 'react';
import { DoorCadRenderer } from '../cad-engine/door-cad-renderer';
import { FrameShape, SceneCellNode, FrameConfig, SashConfig, MullionInfo } from '../studio-types';
import { Plus, Minus, Target, Check, X } from 'lucide-react';

interface CanvasCadViewProps {
  w: number;
  h: number;
  aluminumColor: string;
  hardwareColor: string;
  frameShape: FrameShape;
  rootCell: SceneCellNode;
  selectedCellId: string | null;
  onSelectCell: (cellId: string | null) => void;
  onSelectMullion?: (mullion: MullionInfo) => void;
  selectedMullionId?: string | null;
  onUpdateDimension: (target: 'w' | 'h' | 'cell', value: number, cellId?: string) => void;
  frameConfig?: FrameConfig;
  sashConfig?: SashConfig;
}

export const CanvasCadView: React.FC<CanvasCadViewProps> = ({
  w,
  h,
  aluminumColor,
  hardwareColor,
  frameShape,
  rootCell,
  selectedCellId,
  onSelectCell,
  onSelectMullion,
  selectedMullionId,
  onUpdateDimension,
  frameConfig,
  sashConfig,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);

  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    panX: number;
    panY: number;
    hasMoved: boolean;
  }>({ startX: 0, startY: 0, panX: 0, panY: 0, hasMoved: false });

  // Dimension Edit Dialog State
  const [editTarget, setEditTarget] = useState<{
    type: 'w' | 'h' | 'cell';
    cellId?: string;
    currentVal: number;
    title: string;
  } | null>(null);
  const [inputVal, setInputVal] = useState<number>(0);

  const handleZoomIn = () => setZoom((prev) => Math.min(3.5, Number((prev + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.3, Number((prev - 0.15).toFixed(2))));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Wheel zoom listener with non-passive support to prevent page scrolling
  React.useEffect(() => {
    const area = canvasAreaRef.current;
    if (!area) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prev) => {
        const next = Number((prev * zoomFactor).toFixed(2));
        return Math.min(3.5, Math.max(0.3, next));
      });
    };

    area.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      area.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Pan (Click & drag on canvas background)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left click or middle click
    if (e.button !== 0 && e.button !== 1) return;

    // Ignore clicks on buttons, inputs or dimension edit triggers
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, text[class*="cursor-pointer"]')) {
      return;
    }

    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panX: pan.x,
      panY: pan.y,
      hasMoved: false,
    };
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragStartRef.current.hasMoved = true;
      }
      setPan({
        x: dragStartRef.current.panX + dx,
        y: dragStartRef.current.panY + dy,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleStartEdit = (target: 'w' | 'h' | 'cell', cellId?: string) => {
    let initialVal = w;
    let title = 'Tổng chiều rộng (W)';

    if (target === 'h') {
      initialVal = h;
      title = 'Tổng chiều cao (H)';
    } else if (target === 'cell' && cellId) {
      // find leaf cell width
      const findCell = (node: SceneCellNode): SceneCellNode | null => {
        if (node.id === cellId) return node;
        if (node.children) {
          for (const c of node.children) {
            const found = findCell(c);
            if (found) return found;
          }
        }
        return null;
      };
      const cNode = findCell(rootCell);
      initialVal = cNode?.w || Math.round(w / 2);
      title = `Chiều rộng cánh/ô (${cellId})`;
    }

    setInputVal(initialVal);
    setEditTarget({ type: target, cellId, currentVal: initialVal, title });
  };

  const handleConfirmEdit = () => {
    if (editTarget && inputVal > 0) {
      onUpdateDimension(editTarget.type, inputVal, editTarget.cellId);
      setEditTarget(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 flex flex-col h-full bg-slate-50 overflow-hidden border-x border-gray-200 select-none"
    >
      {/* Top Floating Zoom Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur p-1 rounded-xl shadow-md border border-gray-200 z-10">
        <button
          type="button"
          title="Phóng to"
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          title="Thu nhỏ"
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
        >
          <Minus size={16} />
        </button>
        <div className="w-px h-4 bg-gray-300 mx-0.5" />
        <button
          type="button"
          title="Đặt lại góc nhìn"
          onClick={handleResetZoom}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
        >
          <Target size={15} />
        </button>
      </div>

      {/* Inline Quick Dimension Edit Popover */}
      {editTarget && (
        <div className="absolute top-3 left-3 bg-white p-3 rounded-2xl shadow-xl border border-blue-200 z-20 flex flex-col gap-2 w-64 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between text-xs font-bold text-gray-800">
            <span>{editTarget.title}</span>
            <button
              type="button"
              onClick={() => setEditTarget(null)}
              className="p-0.5 text-gray-400 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              autoFocus
              value={inputVal}
              onChange={(e) => setInputVal(Number(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmEdit()}
              className="flex-1 h-8 px-2.5 font-mono font-bold text-sm rounded-lg border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <span className="text-xs text-gray-500 font-medium">mm</span>
            <button
              type="button"
              onClick={handleConfirmEdit}
              className="h-8 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center cursor-pointer shadow-xs"
            >
              <Check size={14} />
            </button>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            {[-50, -10, 10, 50].map((delta) => (
              <button
                key={delta}
                type="button"
                onClick={() => setInputVal((prev) => Math.max(100, prev + delta))}
                className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 font-mono text-gray-700"
              >
                {delta > 0 ? `+${delta}` : delta}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CAD Canvas Area with Blueprint Grid */}
      <div
        ref={canvasAreaRef}
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          if (dragStartRef.current.hasMoved) return;
          const target = e.target as HTMLElement;
          if (target.closest('g.cursor-pointer, button, input, text[class*="cursor-pointer"]')) {
            return;
          }
          onSelectCell(null);
        }}
        className={`flex-1 overflow-hidden flex items-center justify-center p-6 pb-14 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          className="bg-white rounded-2xl shadow-xl border border-gray-200/90 p-3 w-full max-w-[500px] aspect-[500/500] flex items-center justify-center will-change-transform"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.12s ease-out',
          }}
        >
          <DoorCadRenderer
            w={w}
            h={h}
            aluminumColor={aluminumColor}
            hardwareColor={hardwareColor}
            frameShape={frameShape}
            rootCell={rootCell}
            selectedCellId={selectedCellId}
            onSelectCell={onSelectCell}
            onSelectMullion={onSelectMullion}
            selectedMullionId={selectedMullionId}
            onEditDimension={handleStartEdit}
            frameConfig={frameConfig}
            sashConfig={sashConfig}
          />
        </div>
      </div>

      {/* Bottom Guide Bar */}
      <div className="h-8 shrink-0 z-10 bg-white/95 border-t border-gray-200 px-4 flex items-center justify-between text-[11px] text-gray-500 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400">Hướng dẫn:</span>
          <span>Click ô = chọn</span>
          <span className="text-gray-300">·</span>
          <span>Kéo nền ngoài = di chuyển</span>
          <span className="text-gray-300">·</span>
          <span>Scroll = zoom</span>
          <span className="text-gray-300">·</span>
          <span className="text-blue-600 font-semibold cursor-pointer">Click số đo = sửa</span>
        </div>
        <div className="font-mono text-gray-400">Tỷ lệ 1:10 • {Math.round(zoom * 100)}%</div>
      </div>
    </div>
  );
};
