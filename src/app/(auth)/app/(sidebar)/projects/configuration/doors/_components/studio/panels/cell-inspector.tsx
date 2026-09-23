'use client';

import React from 'react';
import { SceneCellNode, PaneType, BeadType, BeadJointType } from '../studio-types';
import { ShieldCheck, Grid, Sparkles, Layers, SlidersHorizontal, Check } from 'lucide-react';

interface CellInspectorProps {
  selectedCell: SceneCellNode | null;
  onUpdateCell: (updates: Partial<SceneCellNode>) => void;
  onSplitCell: (direction: 'vertical' | 'horizontal') => void;
  onMergeCell: () => void;
  onDeselect: () => void;
}

const GLASS_OPTIONS = [
  'Kính dán an toàn 6.38mm',
  'Kính dán an toàn 8.38mm',
  'Kính dán an toàn 10.38mm',
  'Kính cường lực 8mm',
  'Kính cường lực 10mm',
  'Kính cường lực 12mm',
  'Kính hộp cách âm 5-9-5mm',
];

export const CellInspector: React.FC<CellInspectorProps> = ({
  selectedCell,
  onUpdateCell,
  onSplitCell,
  onMergeCell,
  onDeselect,
}) => {
  if (!selectedCell) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-400 select-none">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
          <Grid size={24} />
        </div>
        <div className="font-semibold text-gray-700 text-xs mb-1">Chưa chọn ô kính nào</div>
        <p className="text-[11px] text-gray-400 max-w-[200px] leading-relaxed">
          Bấm vào từng ô kính trên bản vẽ 2D để tùy chỉnh vật liệu kính, lưới chống muỗi, nan chớp và nẹp.
        </p>
      </div>
    );
  }

  const paneOptions: Array<{ id: PaneType; label: string; icon: string }> = [
    { id: 'glass', label: 'Kính', icon: '🪟' },
    { id: 'screen', label: 'Lưới muỗi', icon: '🦟' },
    { id: 'louver', label: 'Nan chớp', icon: '📑' },
    { id: 'panel', label: 'Panel nhôm', icon: '⬛' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-3.5 p-3.5 text-xs select-none bg-white">
      {/* 1. Header Box */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs">
          <Sparkles size={14} className="text-amber-500" />
          <span>Tùy chọn ô kính</span>
        </div>
        <button
          type="button"
          onClick={onDeselect}
          className="text-[11px] text-blue-600 hover:underline cursor-pointer"
        >
          Đóng ô
        </button>
      </div>

      {/* 2. Cell Dimensions */}
      <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
        <span className="text-blue-700 font-medium">Kích thước ô:</span>
        <span className="font-mono font-bold text-blue-900 text-xs">
          {selectedCell.w} × {selectedCell.h} mm
        </span>
      </div>

      {/* 3. Kiểu mở riêng ô này */}
      <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-1 text-gray-700 font-semibold text-xs mb-1">
          <span>🚪 Kiểu mở riêng ô này</span>
        </div>
        <select
          value={selectedCell.sashType || 'fixed'}
          onChange={(e) => onUpdateCell({ sashType: e.target.value as any })}
          className="w-full h-8 px-2.5 text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 font-medium"
        >
          <option value="fixed">Vách kính cố định (Fix)</option>
          <option value="swing_left">Cánh mở quay trái</option>
          <option value="swing_right">Cánh mở quay phải</option>
          <option value="awning">Cánh mở hất</option>
          <option value="tilt">Cánh mở lật</option>
          <option value="tilt_turn">Cánh mở quay & lật</option>
          <option value="sliding">Cánh trượt lùa</option>
        </select>
      </div>

      {/* 4. Loại vật liệu tấm (Pane Type) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1 text-gray-700 font-semibold text-xs">
          <Layers size={13} className="text-primary" />
          <span>Loại vật liệu tấm</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {paneOptions.map((opt) => {
            const isSelected = selectedCell.paneType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdateCell({ paneType: opt.id })}
                className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 font-semibold text-blue-800 shadow-2xs'
                    : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="text-base">{opt.icon}</span>
                <span className="text-xs">{opt.label}</span>
                {isSelected && <Check size={13} className="ml-auto text-blue-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Chủng loại kính (khi chọn Pane = Glass) */}
      {selectedCell.paneType === 'glass' && (
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-gray-700 font-semibold text-xs mb-1">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Chủng loại kính</span>
          </div>
          <select
            value={selectedCell.glassName || GLASS_OPTIONS[1]}
            onChange={(e) => onUpdateCell({ glassName: e.target.value })}
            className="w-full h-8 px-2.5 text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 font-medium"
          >
            {GLASS_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 5. Tùy chọn Nẹp kính */}
      <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-1.5 text-gray-700 font-semibold text-xs">
          <SlidersHorizontal size={13} className="text-blue-600" />
          <span>Tùy chọn nẹp kính</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'square', label: 'Nẹp vuông' },
            { id: 'bevel', label: 'Nẹp vát' },
            { id: 'round', label: 'Nẹp tròn' },
          ].map((item) => {
            const isSelected = (selectedCell.beadType || 'square') === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onUpdateCell({ beadType: item.id as BeadType })}
                className={`py-1.5 px-1 rounded-lg border text-center text-[10.5px] font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-white text-blue-700 font-bold shadow-2xs'
                    : 'border-gray-200 text-gray-600 bg-white/60 hover:bg-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-gray-500">Góc cắt ngàm nẹp:</span>
          <div className="flex items-center gap-1">
            {[
              { id: '90', label: 'Cắt 90°' },
              { id: '45', label: 'Cắt 45°' },
            ].map((joint) => {
              const isSelected = (selectedCell.beadJoint || '90') === joint.id;
              return (
                <button
                  key={joint.id}
                  type="button"
                  onClick={() => onUpdateCell({ beadJoint: joint.id as BeadJointType })}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {joint.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. Thao tác chia đố trong ô này */}
      <div className="space-y-2 pt-1 border-t border-gray-100">
        <div className="text-gray-700 font-semibold text-xs">Chia đố riêng ô này</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSplitCell('vertical')}
            className="py-1.5 px-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 text-[11px] cursor-pointer"
          >
            | Chia dọc làm 2
          </button>
          <button
            type="button"
            onClick={() => onSplitCell('horizontal')}
            className="py-1.5 px-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 text-[11px] cursor-pointer"
          >
            — Chia ngang làm 2
          </button>
        </div>
        {selectedCell.children && selectedCell.children.length > 0 && (
          <button
            type="button"
            onClick={onMergeCell}
            className="w-full py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 font-semibold text-[11px] hover:bg-red-100 transition-colors cursor-pointer"
          >
            Gộp ô (Xóa đố con)
          </button>
        )}
      </div>
    </div>
  );
};
