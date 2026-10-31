'use client';

import React, { useState } from 'react';
import {
  FrameShape,
  SashOpenType,
  SashConfig,
  ColorSwatch,
  ALUMINUM_PALETTE,
  HARDWARE_PALETTE,
} from '../studio-types';
import { FrameShapePicker } from './frame-shape-picker';
import { SashTypePicker } from './sash-type-picker';
import {
  Undo2,
  Redo2,
  RotateCcw,
  Ruler,
  Palette,
  Columns,
  Rows,
  DoorClosed,
  LayoutGrid,
  Grid,
  Scissors,
  Trash2,
} from 'lucide-react';

interface ToolboxLeftProps {
  w: number;
  h: number;
  aluminumColor: string;
  hardwareColor: string;
  frameShape: FrameShape;
  currentSashType: SashOpenType;
  activeTab: 'frame' | 'sash';
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onChangeDimension: (w: number, h: number) => void;
  onSelectAluminumColor: (hex: string) => void;
  onSelectHardwareColor: (hex: string) => void;
  onSelectFrameShape: (shape: FrameShape) => void;
  selectedCellId: string | null;
  onSelectSashType: (sashType: SashOpenType) => void;
  onSplitMullion: (count: number, direction: 'vertical' | 'horizontal') => void;
  onCoupleFrame: (direction: 'vertical' | 'horizontal') => void;
  onSplitSashMullion?: (count: number, direction: 'vertical' | 'horizontal') => void;
  onDeleteSelected?: () => void;
  onChangeTab: (tab: 'frame' | 'sash') => void;
  aluminumColors?: ColorSwatch[];
  isInsideSash?: boolean;
  sashConfig?: SashConfig;
  onChangeSashConfig?: (updates: Partial<SashConfig>) => void;
}

export const ToolboxLeft: React.FC<ToolboxLeftProps> = ({
  w,
  h,
  aluminumColor,
  hardwareColor,
  frameShape,
  currentSashType,
  selectedCellId,
  activeTab,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onChangeDimension,
  onSelectAluminumColor,
  onSelectHardwareColor,
  onSelectFrameShape,
  onSelectSashType,
  onSplitMullion,
  onCoupleFrame,
  onSplitSashMullion,
  onDeleteSelected,
  onChangeTab,
  aluminumColors,
  isInsideSash,
  sashConfig,
  onChangeSashConfig,
}) => {
  const [frameSplitCount, setFrameSplitCount] = useState<number>(2);

  const activeColorPalette = aluminumColors && aluminumColors.length > 0 ? aluminumColors : ALUMINUM_PALETTE;
  const cleanAluminumColor = (aluminumColor || '').trim().toLowerCase();
  const activeColor = activeColorPalette.find(
    (c) => (c.colorHex || '').trim().toLowerCase() === cleanAluminumColor
  );
  const activeHwColor = HARDWARE_PALETTE.find(
    (c) => c.colorHex.toLowerCase() === hardwareColor.toLowerCase()
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-3 p-3.5 text-xs select-none bg-slate-50/60">
      {/* 1. Kích thước & Lịch sử thao tác */}
      <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs">
            <Ruler size={14} className="text-primary" />
            <span>Kích thước phủ bì</span>
          </div>

          <button
            type="button"
            onClick={onReset}
            title="Đặt lại bản vẽ"
            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {/* Inputs W & H */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-md bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
              <span>Rộng (W)</span>
              <span className="text-[10px] text-slate-400">mm</span>
            </div>
            <input
              type="number"
              value={w}
              onChange={(e) => onChangeDimension(Number(e.target.value), h)}
              className="w-full h-7 px-2 font-bold text-slate-900 text-xs rounded border border-slate-200 bg-white focus:outline-none focus:border-primary text-center"
            />
          </div>
          <div className="p-2 rounded-md bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
              <span>Cao (H)</span>
              <span className="text-[10px] text-slate-400">mm</span>
            </div>
            <input
              type="number"
              value={h}
              onChange={(e) => onChangeDimension(w, Number(e.target.value))}
              className="w-full h-7 px-2 font-bold text-slate-900 text-xs rounded border border-slate-200 bg-white focus:outline-none focus:border-primary text-center"
            />
          </div>
        </div>
      </div>

      {/* 2. Màu nhôm & Phụ kiện */}
      <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs">
          <Palette size={14} className="text-primary" />
          <span>Màu hoàn thiện</span>
        </div>

        {/* Màu nhôm */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span>Màu nhôm</span>
            {activeColor && (
              <span className="text-[11px] text-primary font-medium truncate max-w-[140px]">
                {activeColor.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {activeColorPalette.map((col) => {
              const isSelected = cleanAluminumColor === (col.colorHex || '').trim().toLowerCase();
              return (
                <button
                  key={col.code}
                  type="button"
                  title={col.name}
                  onClick={() => onSelectAluminumColor(col.colorHex.trim())}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer border ${
                    isSelected
                      ? 'ring-2 ring-primary ring-offset-1 scale-105 shadow-2xs border-white'
                      : 'border-slate-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: col.colorHex }}
                />
              );
            })}
          </div>
        </div>

        {/* Màu phụ kiện */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span>Màu phụ kiện</span>
            {activeHwColor && (
              <span className="text-[11px] text-primary font-medium truncate max-w-[140px]">
                {activeHwColor.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {HARDWARE_PALETTE.map((col) => {
              const isSelected = hardwareColor.toLowerCase() === col.colorHex.toLowerCase();
              return (
                <button
                  key={col.code}
                  type="button"
                  title={col.name}
                  onClick={() => onSelectHardwareColor(col.colorHex)}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer border ${
                    isSelected
                      ? 'ring-2 ring-primary ring-offset-1 scale-105 shadow-2xs border-white'
                      : 'border-slate-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: col.colorHex }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Action History: Undo / Redo / Xóa (Ảnh 4) */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Hoàn tác (Undo)"
          className="h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-35 disabled:pointer-events-none flex items-center justify-center gap-1 transition-all cursor-pointer text-xs font-semibold shadow-2xs"
        >
          <Undo2 size={13} />
          <span>Undo</span>
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Làm lại (Redo)"
          className="h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-35 disabled:pointer-events-none flex items-center justify-center gap-1 transition-all cursor-pointer text-xs font-semibold shadow-2xs"
        >
          <Redo2 size={13} />
          <span>Redo</span>
        </button>
        <button
          type="button"
          onClick={onDeleteSelected || onReset}
          title="Xóa ô / Đố / Cánh"
          className="h-8 rounded-lg border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-600 flex items-center justify-center gap-1 transition-all cursor-pointer text-xs font-semibold shadow-2xs"
        >
          <Trash2 size={13} />
          <span>Xóa</span>
        </button>
      </div>

      {/* 4. Segmented Tab Switcher: Kiểu khung vs Kiểu cánh (Ảnh 3 & 4) */}
      <div className="p-1 bg-slate-100 rounded-lg border border-slate-200/80 grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => onChangeTab('frame')}
          className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'frame'
              ? 'bg-white text-slate-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block" />
          <span>Kiểu khung</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeTab('sash')}
          className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'sash'
              ? 'bg-white text-slate-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-xs bg-amber-700 inline-block" />
          <span>Kiểu cánh</span>
        </button>
      </div>

      {/* 5. Sub-panel View */}
      {activeTab === 'frame' ? (
        <div className="flex flex-col space-y-3 text-xs">
          {/* Box: Chia đố khung (Đố T) - Ảnh 3 */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs">
              <Grid size={14} className="text-primary" />
              <span>Chia đố khung</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={frameSplitCount}
                  onChange={(e) => setFrameSplitCount(Math.max(1, Math.min(20, Number(e.target.value))))}
                  className="w-11 h-7 text-center text-xs font-bold rounded border border-slate-200 bg-white focus:outline-none focus:border-primary"
                />
                <span className="text-slate-500 font-medium">ô</span>
              </div>
              <button
                type="button"
                onClick={() => onSplitMullion(frameSplitCount, 'vertical')}
                className="flex-1 h-7 px-2 rounded-md border border-emerald-300 bg-emerald-50/50 hover:bg-emerald-500 hover:text-white text-emerald-700 font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Columns size={12} />
                <span>Dọc</span>
              </button>
              <button
                type="button"
                onClick={() => onSplitMullion(frameSplitCount, 'horizontal')}
                className="flex-1 h-7 px-2 rounded-md border border-emerald-300 bg-emerald-50/50 hover:bg-emerald-500 hover:text-white text-emerald-700 font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Rows size={12} />
                <span>Ngang</span>
              </button>
            </div>
          </div>

          {/* Box: Tách khung (Nối ghép khung) - Ảnh 3 */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs">
              <Scissors size={14} className="text-primary" />
              <span>Tách khung</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onCoupleFrame('vertical')}
                className="h-7 px-2 rounded-md border border-amber-300 bg-amber-50/50 hover:bg-amber-500 hover:text-white text-amber-800 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Columns size={12} />
                <span>Dọc</span>
              </button>
              <button
                type="button"
                onClick={() => onCoupleFrame('horizontal')}
                className="h-7 px-2 rounded-md border border-amber-300 bg-amber-50/50 hover:bg-amber-500 hover:text-white text-amber-800 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Rows size={12} />
                <span>Ngang</span>
              </button>
            </div>
          </div>

          {/* Box: Hình dạng khung bao */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2">
            <div className="font-semibold text-slate-800 text-xs">Hình dạng khung bao</div>
            <FrameShapePicker currentShape={frameShape} onSelectShape={onSelectFrameShape} />
          </div>
        </div>
      ) : (
        <SashTypePicker
          currentSashType={currentSashType}
          selectedCellId={selectedCellId}
          isInsideSash={isInsideSash}
          sashConfig={sashConfig}
          onChangeSashConfig={onChangeSashConfig}
          onSelectSashType={onSelectSashType}
          onSplitSashMullion={onSplitSashMullion}
        />
      )}
    </div>
  );
};
