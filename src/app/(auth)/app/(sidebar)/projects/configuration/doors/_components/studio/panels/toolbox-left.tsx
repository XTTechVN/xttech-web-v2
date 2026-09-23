'use client';

import React from 'react';
import {
  FrameShape,
  SashOpenType,
  ALUMINUM_PALETTE,
  HARDWARE_PALETTE,
} from '../studio-types';
import { FrameShapePicker } from './frame-shape-picker';
import { SashTypePicker } from './sash-type-picker';
import { Undo2, Redo2, Trash2 } from 'lucide-react';

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
}) => {
  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-3.5 p-3.5 text-xs select-none pr-2 bg-slate-50/50">
      {/* 1. Kích thước (mm) & Màu sắc */}
      <div className="p-3 bg-white rounded-2xl border border-gray-200/90 shadow-2xs space-y-3">
        <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs">
          <span>📐 Kích thước (mm)</span>
        </div>

        {/* Inputs W & H */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-[11px] text-gray-500 font-medium block mb-1">W</label>
            <input
              type="number"
              value={w}
              onChange={(e) => onChangeDimension(Number(e.target.value), h)}
              className="w-full h-8 px-2.5 font-bold font-mono text-xs rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-[11px] text-gray-500 font-medium block mb-1">H</label>
            <input
              type="number"
              value={h}
              onChange={(e) => onChangeDimension(w, Number(e.target.value))}
              className="w-full h-8 px-2.5 font-bold font-mono text-xs rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Màu nhôm */}
        <div>
          <div className="text-[11px] text-gray-600 font-medium mb-1.5">Màu nhôm</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {ALUMINUM_PALETTE.map((col) => {
              const isSelected = aluminumColor === col.colorHex;
              return (
                <button
                  key={col.code}
                  type="button"
                  title={col.name}
                  onClick={() => onSelectAluminumColor(col.colorHex)}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer border ${
                    isSelected
                      ? 'ring-2 ring-blue-500 ring-offset-2 scale-110 shadow-xs border-transparent'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: col.colorHex }}
                />
              );
            })}
          </div>
        </div>

        {/* Màu phụ kiện */}
        <div>
          <div className="text-[11px] text-gray-600 font-medium mb-1.5">Màu phụ kiện</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {HARDWARE_PALETTE.map((col) => {
              const isSelected = hardwareColor === col.colorHex;
              return (
                <button
                  key={col.code}
                  type="button"
                  title={col.name}
                  onClick={() => onSelectHardwareColor(col.colorHex)}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer border ${
                    isSelected
                      ? 'ring-2 ring-blue-500 ring-offset-2 scale-110 shadow-xs border-transparent'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: col.colorHex }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Action History (Undo, Redo, Xóa) */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="h-8 px-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium text-[11px] flex items-center justify-center gap-1 hover:bg-gray-50 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
        >
          <Undo2 size={13} />
          <span>Undo</span>
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="h-8 px-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium text-[11px] flex items-center justify-center gap-1 hover:bg-gray-50 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
        >
          <Redo2 size={13} />
          <span>Redo</span>
        </button>
        <button
          type="button"
          onClick={onReset}
          className="h-8 px-2 rounded-xl bg-red-50/70 border border-red-200/80 text-red-600 font-medium text-[11px] flex items-center justify-center gap-1 hover:bg-red-100 transition-colors cursor-pointer shadow-2xs"
        >
          <Trash2 size={13} />
          <span>Xóa</span>
        </button>
      </div>

      {/* 3. Tab Switcher: Kiểu khung vs Kiểu cánh */}
      <div className="p-1 bg-gray-200/70 rounded-xl grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => onChangeTab('frame')}
          className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'frame'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span>■ Kiểu khung</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeTab('sash')}
          className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'sash'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span>🚪 Kiểu cánh</span>
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
