'use client';

import React from 'react';
import { Ban, Highlighter, Palette, RotateCcw, X } from 'lucide-react';
import {
  HIGHLIGHT_COLOR_PALETTE,
  TEXT_COLOR_PALETTE,
} from './rich-text-editor.constants';

export interface ColorPickerPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTextColor: (color: string | null) => void;
  onSelectHighlightColor: (color: string | null) => void;
  onClearAllFormatting: () => void;
}

export function ColorPickerPopover({
  isOpen,
  onClose,
  onSelectTextColor,
  onSelectHighlightColor,
  onClearAllFormatting,
}: ColorPickerPopoverProps) {
  if (!isOpen) return null;

  return (
    <div className="px-3 py-2.5 bg-slate-50/95 border-b border-slate-200 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Nhóm Màu chữ */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 mr-1">
            <Palette size={13} className="text-primary" />
            Màu chữ:
          </span>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelectTextColor(null)}
            title="Đặt lại màu chữ đen mặc định (#0F172A)"
            className="inline-flex items-center gap-1 px-2 h-6 rounded text-[11px] font-medium bg-white border border-slate-300 text-slate-700 hover:border-primary hover:text-primary transition-colors cursor-pointer"
          >
            <RotateCcw size={11} />
            <span>Mặc định</span>
          </button>

          {TEXT_COLOR_PALETTE.map((item) => (
            <button
              key={item.value}
              type="button"
              title={`Màu chữ: ${item.label}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelectTextColor(item.value)}
              className="w-5 h-5 rounded-full border border-slate-300 hover:scale-110 transition-transform cursor-pointer shadow-2xs shrink-0"
              style={{ backgroundColor: item.value }}
            />
          ))}

          <label
            title="Chọn màu chữ tùy chỉnh"
            className="inline-flex items-center gap-1 px-1.5 h-6 rounded bg-white border border-slate-200 text-[10px] font-medium text-slate-600 hover:border-primary cursor-pointer"
          >
            <span>Tùy chỉnh</span>
            <input
              type="color"
              defaultValue="#045863"
              onChange={(e) => onSelectTextColor(e.target.value)}
              className="w-4 h-4 border-0 p-0 bg-transparent cursor-pointer"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={onClose}
          title="Đóng bảng màu"
          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      {/* Nhóm Màu nền / Tô sáng */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 mr-1">
            <Highlighter size={13} className="text-primary" />
            Màu nền:
          </span>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelectHighlightColor(null)}
            title="Xóa màu nền (đưa nền đen về nền trắng trong suốt)"
            className="inline-flex items-center gap-1 px-2 h-6 rounded text-[11px] font-semibold bg-white border border-rose-300 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Ban size={11} />
            <span>Không màu / Xóa nền đen</span>
          </button>

          {HIGHLIGHT_COLOR_PALETTE.map((item) => (
            <button
              key={item.value}
              type="button"
              title={`Màu nền: ${item.label}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelectHighlightColor(item.value)}
              className="w-5 h-5 rounded border border-slate-300 hover:scale-110 transition-transform cursor-pointer shadow-2xs shrink-0"
              style={{ backgroundColor: item.value }}
            />
          ))}

          <label
            title="Chọn màu nền tùy chỉnh"
            className="inline-flex items-center gap-1 px-1.5 h-6 rounded bg-white border border-slate-200 text-[10px] font-medium text-slate-600 hover:border-primary cursor-pointer"
          >
            <span>Tùy chỉnh</span>
            <input
              type="color"
              defaultValue="#FEF08A"
              onChange={(e) => onSelectHighlightColor(e.target.value)}
              className="w-4 h-4 border-0 p-0 bg-transparent cursor-pointer"
            />
          </label>
        </div>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClearAllFormatting}
          title="Đưa vùng bôi đen (hoặc toàn bộ đoạn văn) về chữ đen nền trắng mặc định"
          className="inline-flex items-center gap-1 px-2.5 h-6 rounded text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/15 border border-primary/20 transition-colors cursor-pointer"
        >
          <RotateCcw size={11} />
          <span>Reset chữ đen nền trắng</span>
        </button>
      </div>
    </div>
  );
}

