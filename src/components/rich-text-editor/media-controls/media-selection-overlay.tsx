'use client';

import React, { type PointerEvent } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  GripVertical,
  PanelLeft,
  PanelRight,
  Trash2,
} from 'lucide-react';
import type { MediaDropLine, MediaOverlayRect } from './use-media-controls';
import { WIDTH_PRESETS, type FigureAlign } from './media-controls.utils';

const TOOLBAR_ESTIMATED_WIDTH = 440;
const TOOLBAR_HEIGHT = 36;

export interface MediaSelectionOverlayProps {
  rect: MediaOverlayRect;
  dropLine: MediaDropLine | null;
  onSetAlign: (align: FigureAlign) => void;
  onSetWidth: (percent: number) => void;
  onMoveStep: (direction: 'up' | 'down') => void;
  onRemove: () => void;
  onResizeStart: (e: PointerEvent<HTMLElement>) => void;
  onMoveStart: (e: PointerEvent<HTMLElement>) => void;
}

interface ToolButtonProps {
  title: string;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function ToolButton({ title, active, danger, onClick, children }: ToolButtonProps) {
  const tone = danger
    ? 'text-rose-600 hover:bg-rose-50'
    : active
      ? 'bg-primary text-white'
      : 'text-slate-600 hover:bg-slate-100';
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`h-7 min-w-7 px-1.5 inline-flex items-center justify-center rounded-md text-[11px] font-semibold transition-colors ${tone}`}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="w-px h-4 bg-slate-200 mx-0.5 shrink-0" />;

const ALIGN_ITEMS: { value: FigureAlign; title: string; icon: React.ReactNode }[] = [
  { value: 'left', title: 'Căn trái', icon: <AlignLeft className="w-3.5 h-3.5" /> },
  { value: 'center', title: 'Căn giữa', icon: <AlignCenter className="w-3.5 h-3.5" /> },
  { value: 'right', title: 'Căn phải', icon: <AlignRight className="w-3.5 h-3.5" /> },
  { value: 'float-left', title: 'Bao chữ bên phải (ảnh nằm trái)', icon: <PanelLeft className="w-3.5 h-3.5" /> },
  { value: 'float-right', title: 'Bao chữ bên trái (ảnh nằm phải)', icon: <PanelRight className="w-3.5 h-3.5" /> },
];

export function MediaSelectionOverlay({
  rect,
  dropLine,
  onSetAlign,
  onSetWidth,
  onMoveStep,
  onRemove,
  onResizeStart,
  onMoveStart,
}: MediaSelectionOverlayProps) {
  const centeredLeft = rect.left + rect.width / 2 - TOOLBAR_ESTIMATED_WIDTH / 2;
  const toolbarLeft = Math.max(
    4,
    Math.min(centeredLeft, rect.containerWidth - TOOLBAR_ESTIMATED_WIDTH - 4),
  );
  const toolbarTop = Math.max(48, rect.top - TOOLBAR_HEIGHT - 6);

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div
        className="absolute rounded-lg border-2 border-primary"
        style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
      >
        <button
          type="button"
          title="Kéo để thay đổi kích thước"
          aria-label="Kéo để thay đổi kích thước"
          onPointerDown={onResizeStart}
          className="absolute -right-2 -bottom-2 w-4 h-4 rounded-full bg-primary border-2 border-white shadow cursor-nwse-resize pointer-events-auto touch-none"
        />
      </div>

      <div
        className="absolute pointer-events-auto flex items-center gap-0.5 p-1 rounded-lg bg-white border border-slate-200 shadow-lg"
        style={{ top: toolbarTop, left: toolbarLeft, height: TOOLBAR_HEIGHT }}
        onMouseDown={(e) => e.preventDefault()}
      >
        <button
          type="button"
          title="Giữ và kéo để di chuyển vị trí"
          aria-label="Giữ và kéo để di chuyển vị trí"
          onPointerDown={onMoveStart}
          className="h-7 w-6 inline-flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <ToolButton title="Đưa lên trên" onClick={() => onMoveStep('up')}>
          <ArrowUp className="w-3.5 h-3.5" />
        </ToolButton>
        <ToolButton title="Đưa xuống dưới" onClick={() => onMoveStep('down')}>
          <ArrowDown className="w-3.5 h-3.5" />
        </ToolButton>
        <Divider />
        {WIDTH_PRESETS.map((preset) => (
          <ToolButton
            key={preset}
            title={`Rộng ${preset}%`}
            active={rect.widthPercent === preset}
            onClick={() => onSetWidth(preset)}
          >
            <span className="font-mono tabular-nums">{preset}%</span>
          </ToolButton>
        ))}
        <Divider />
        {ALIGN_ITEMS.map((item) => (
          <ToolButton
            key={item.value}
            title={item.title}
            active={rect.align === item.value}
            onClick={() => onSetAlign(item.value)}
          >
            {item.icon}
          </ToolButton>
        ))}
        <Divider />
        <ToolButton title="Xóa khỏi bài viết" danger onClick={onRemove}>
          <Trash2 className="w-3.5 h-3.5" />
        </ToolButton>
      </div>

      {dropLine && (
        <div
          className="news-rich-media-drop-indicator"
          style={{ top: dropLine.top - 1, left: dropLine.left, width: dropLine.width }}
        />
      )}
    </div>
  );
}

