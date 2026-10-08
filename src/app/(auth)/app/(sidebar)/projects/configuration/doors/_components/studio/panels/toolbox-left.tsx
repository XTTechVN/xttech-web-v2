'use client';

import React from 'react';
import {
  FrameShape,
  SashOpenType,
  ColorSwatch,
  ALUMINUM_PALETTE,
  HARDWARE_PALETTE,
} from '../studio-types';
import { FrameShapePicker } from './frame-shape-picker';
import { SashTypePicker } from './sash-type-picker';
import { Undo2, Redo2, RotateCcw, Ruler, Palette, Columns, DoorClosed, LayoutGrid } from 'lucide-react';

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
  onChangeTab: (tab: 'frame' | 'sash') => void;
  aluminumColors?: ColorSwatch[];
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
  onChangeTab,
  aluminumColors,
}) => {
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

          {/* Action History: Undo / Redo / Reset */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              title="Hoàn tác (Undo)"
              className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
            >
              <Undo2 size={13} />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              title="Làm lại (Redo)"
              className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
            >
              <Redo2 size={13} />
            </button>
            <button
              type="button"
              onClick={onReset}
              title="Đặt lại bản vẽ"
              className="w-7 h-7 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
            </button>
          </div>
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

      {/* 3. Segmented Tab Switcher: Kiểu khung vs Kiểu cánh */}
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
          <LayoutGrid size={13} className={activeTab === 'frame' ? 'text-primary' : 'text-slate-400'} />
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
          <DoorClosed size={13} className={activeTab === 'sash' ? 'text-primary' : 'text-slate-400'} />
          <span>Kiểu cánh</span>
        </button>
      </div>

      {/* 4. Sub-panel View */}
      {activeTab === 'frame' ? (
        <FrameShapePicker currentShape={frameShape} onSelectShape={onSelectFrameShape} />
      ) : (
        <SashTypePicker
          currentSashType={currentSashType}
          selectedCellId={selectedCellId}
          onSelectSashType={onSelectSashType}
          onSplitMullion={onSplitMullion}
          onCoupleFrame={onCoupleFrame}
        />
      )}
    </div>
  );
};
