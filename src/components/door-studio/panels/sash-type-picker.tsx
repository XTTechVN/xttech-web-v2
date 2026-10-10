'use client';

import React, { useState } from 'react';
import { SashOpenType } from '../studio-types';
import { Columns, Rows, Grid, Scissors } from 'lucide-react';

interface SashTypePickerProps {
  currentSashType: SashOpenType;
  selectedCellId: string | null;
  onSelectSashType: (sashType: SashOpenType) => void;
  onSplitMullion: (count: number, direction: 'vertical' | 'horizontal') => void;
  onCoupleFrame: (direction: 'vertical' | 'horizontal') => void;
}

interface SashVisualItem {
  id: SashOpenType;
  name: string;
  renderSvg: () => React.ReactNode;
}

export const SashTypePicker: React.FC<SashTypePickerProps> = ({
  currentSashType,
  selectedCellId,
  onSelectSashType,
  onSplitMullion,
  onCoupleFrame,
}) => {
  const [splitCount, setSplitCount] = useState<number>(2);

  const sashItems: SashVisualItem[] = [
    {
      id: 'fixed',
      name: 'Vách cố định',
      renderSvg: () => (
        <svg viewBox="0 0 36 36" className="w-8 h-8">
          <rect x="3" y="3" width="30" height="30" fill="#955F20" stroke="#475569" strokeWidth="1" />
          <rect x="7" y="7" width="22" height="22" fill="#b2f5ea" />
        </svg>
      ),
    },
    {
      id: 'swing_double',
      name: '2 cánh mở quay',
      renderSvg: () => (
        <svg viewBox="0 0 36 36" className="w-8 h-8">
          <rect x="3" y="3" width="30" height="30" fill="#955F20" stroke="#475569" strokeWidth="1" />
          <rect x="6" y="6" width="11" height="24" fill="#b2f5ea" />
          <rect x="19" y="6" width="11" height="24" fill="#b2f5ea" />
          <polyline points="6,6 17,18 6,30" fill="none" stroke="#e53e3e" strokeWidth="1.2" />
          <polyline points="30,6 19,18 30,30" fill="none" stroke="#e53e3e" strokeWidth="1.2" />
        </svg>
      ),
    },
    {
      id: 'swing_left',
      name: '1 cánh quay trái',
      renderSvg: () => (
        <svg viewBox="0 0 36 36" className="w-8 h-8">
          <rect x="3" y="3" width="30" height="30" fill="#955F20" stroke="#475569" strokeWidth="1" />
          <rect x="7" y="7" width="22" height="22" fill="#b2f5ea" />
          <polyline points="7,7 29,18 7,29" fill="none" stroke="#e53e3e" strokeWidth="1.4" />
        </svg>
      ),
    },
    {
      id: 'swing_right',
      name: '1 cánh quay phải',
      renderSvg: () => (
        <svg viewBox="0 0 36 36" className="w-8 h-8">
          <rect x="3" y="3" width="30" height="30" fill="#955F20" stroke="#475569" strokeWidth="1" />
          <rect x="7" y="7" width="22" height="22" fill="#b2f5ea" />
          <polyline points="29,7 7,18 29,29" fill="none" stroke="#e53e3e" strokeWidth="1.4" />
        </svg>
      ),
    },
    {
      id: 'awning',
      name: 'Mở hất (Khóa dưới)',
      renderSvg: () => (
        <svg viewBox="0 0 36 36" className="w-8 h-8">
          <rect x="3" y="3" width="30" height="30" fill="#955F20" stroke="#475569" strokeWidth="1" />
          <rect x="7" y="7" width="22" height="22" fill="#b2f5ea" />
          <polyline points="7,7 18,29 29,7" fill="none" stroke="#e53e3e" strokeWidth="1.4" />
          <rect x="15" y="27" width="6" height="2" fill="#1E293B" rx="0.5" />
        </svg>
      ),
    },
    {
      id: 'tilt',
      name: 'Mở lật (Khóa dưới)',
      renderSvg: () => (
        <svg viewBox="0 0 36 36" className="w-8 h-8">
          <rect x="3" y="3" width="30" height="30" fill="#955F20" stroke="#475569" strokeWidth="1" />
          <rect x="7" y="7" width="22" height="22" fill="#b2f5ea" />
          <polyline points="7,29 18,7 29,29" fill="none" stroke="#e53e3e" strokeWidth="1.4" strokeDasharray="2,2" />
          <rect x="15" y="27" width="6" height="2" fill="#1E293B" rx="0.5" />
        </svg>
      ),
    },
    {
      id: 'tilt_down',
      name: 'Lật xuống (Khóa trên)',
      renderSvg: () => (
        <svg viewBox="0 0 36 36" className="w-8 h-8">
          <rect x="3" y="3" width="30" height="30" fill="#955F20" stroke="#475569" strokeWidth="1" />
          <rect x="7" y="7" width="22" height="22" fill="#b2f5ea" />
          <polyline points="7,7 18,29 29,7" fill="none" stroke="#e53e3e" strokeWidth="1.4" strokeDasharray="2,2" />
          <rect x="15" y="7" width="6" height="2" fill="#1E293B" rx="0.5" />
        </svg>
      ),
    },
    {
      id: 'tilt_turn',
      name: 'Quay & Lật',
      renderSvg: () => (
        <svg viewBox="0 0 36 36" className="w-8 h-8">
          <rect x="3" y="3" width="30" height="30" fill="#955F20" stroke="#475569" strokeWidth="1" />
          <rect x="7" y="7" width="22" height="22" fill="#b2f5ea" />
          <polyline points="7,7 29,18 7,29" fill="none" stroke="#e53e3e" strokeWidth="1" />
          <polyline points="7,29 18,7 29,29" fill="none" stroke="#e53e3e" strokeWidth="1" strokeDasharray="2,2" />
        </svg>
      ),
    },
    {
      id: 'sliding',
      name: 'Cánh trượt lùa',
      renderSvg: () => (
        <svg viewBox="0 0 36 36" className="w-8 h-8">
          <rect x="3" y="3" width="30" height="30" fill="#955F20" stroke="#475569" strokeWidth="1" />
          <rect x="7" y="7" width="22" height="22" fill="#b2f5ea" />
          <line x1="10" y1="18" x2="26" y2="18" stroke="#e53e3e" strokeWidth="1.5" />
          <polyline points="14,15 10,18 14,21" fill="none" stroke="#e53e3e" strokeWidth="1.2" />
          <polyline points="22,15 26,18 22,21" fill="none" stroke="#e53e3e" strokeWidth="1.2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-3 text-xs">
      {/* 1. Box: Chia đố khung (Đố T) */}
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
              max={6}
              value={splitCount}
              onChange={(e) => setSplitCount(Math.max(1, Math.min(6, Number(e.target.value))))}
              className="w-10 h-7 text-center text-xs font-bold rounded border border-slate-200 bg-white focus:outline-none focus:border-primary"
            />
            <span className="text-slate-500 font-medium">ô</span>
          </div>
          <button
            type="button"
            onClick={() => onSplitMullion(splitCount, 'vertical')}
            className="flex-1 h-7 px-2 rounded bg-slate-100 hover:bg-primary hover:text-white text-slate-700 font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <Columns size={12} />
            <span>Dọc</span>
          </button>
          <button
            type="button"
            onClick={() => onSplitMullion(splitCount, 'horizontal')}
            className="flex-1 h-7 px-2 rounded bg-slate-100 hover:bg-primary hover:text-white text-slate-700 font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <Rows size={12} />
            <span>Ngang</span>
          </button>
        </div>
      </div>

      {/* 2. Box: Tách khung (Nối khung) */}
      <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs">
          <Scissors size={14} className="text-primary" />
          <span>Tách ghép khung</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onCoupleFrame('vertical')}
            className="h-7 px-2 rounded bg-slate-100 hover:bg-primary hover:text-white text-slate-700 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Columns size={12} />
            <span>Ghép dọc</span>
          </button>
          <button
            type="button"
            onClick={() => onCoupleFrame('horizontal')}
            className="h-7 px-2 rounded bg-slate-100 hover:bg-primary hover:text-white text-slate-700 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Rows size={12} />
            <span>Ghép ngang</span>
          </button>
        </div>
      </div>

      {/* 3. Kiểu cánh (Gán cho ô đang chọn) */}
      <div className="space-y-2 pt-1">
        <div className="font-semibold text-slate-800 text-xs flex items-center justify-between">
          <span>Kiểu cánh</span>
          {selectedCellId ? (
            <span className="text-[10px] text-primary font-semibold bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
              Ô: {selectedCellId}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-normal">Chưa chọn ô</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {sashItems.map((item) => {
            const isSelected = currentSashType === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSashType(item.id)}
                className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary shadow-2xs font-semibold'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="shrink-0">{item.renderSvg()}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs truncate">{item.name}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
