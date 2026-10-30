/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { MullionInfo, MullionCutType } from '../studio-types';
import { ProfileBar } from '@/types';
import { Ruler, Trash2, Check, X } from 'lucide-react';

interface MullionInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mullion: MullionInfo | null;
  profileBars: ProfileBar[];
  onSave: (params: {
    dimension: number;
    profileId?: number;
    cutType?: MullionCutType;
  }) => void;
  onDeleteMullion: () => void;
}

const CUT_TYPE_LABELS: Record<MullionCutType, string> = {
  inside_frame: 'Lọt khung →',
  overlap: 'Phủ khung →',
  miter: 'Cắt mòi 45° →',
  square: 'Vuông 90° →',
};

export const MullionInspectorModal: React.FC<MullionInspectorModalProps> = ({
  isOpen,
  onClose,
  mullion,
  profileBars,
  onSave,
  onDeleteMullion,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  const [dimension, setDimension] = useState<number>(0);
  const [selectedProfileId, setSelectedProfileId] = useState<number | undefined>(undefined);
  const [cutType, setCutType] = useState<MullionCutType>('inside_frame');

  // Advanced Tab State
  const [activeEnd, setActiveEnd] = useState<'start' | 'end'>('end');

  useEffect(() => {
    if (mullion) {
      setDimension(mullion.dimension);
      setSelectedProfileId(mullion.profileId);
      setCutType(mullion.cutType || 'inside_frame');
      setActiveTab('basic');
    }
  }, [mullion]);

  if (!isOpen || !mullion) return null;

  const isHoriz = mullion.direction === 'horizontal';
  const orientationLabel = isHoriz ? 'đứng' : 'ngang';

  // Filter mullion profile bars (prefer barType === 'MULLION' or 'mullion', fallback to all)
  const mullionProfiles = profileBars.filter(
    (b) =>
      b.barType?.toLowerCase() === 'mullion' ||
      b.name.toLowerCase().includes('đố') ||
      b.code.toLowerCase().includes('do')
  );
  const availableProfiles = mullionProfiles.length > 0 ? mullionProfiles : profileBars;

  const handleSave = () => {
    onSave({
      dimension,
      profileId: selectedProfileId,
      cutType,
    });
    onClose();
  };

  const handleCycleCutType = () => {
    const types: MullionCutType[] = ['inside_frame', 'overlap', 'square', 'miter'];
    const nextIdx = (types.indexOf(cutType) + 1) % types.length;
    setCutType(types[nextIdx]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-[340px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Ruler size={16} className="text-slate-600 rotate-45" />
            <span>Kích thước khoang ({orientationLabel})</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 py-2">
          <div className="flex bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'basic'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Cơ bản
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('advanced')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'advanced'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Nâng cao
            </button>
          </div>
        </div>

        {/* Tab 1: Cơ bản */}
        {activeTab === 'basic' ? (
          <div className="p-5 pt-2 flex flex-col gap-3.5">
            {/* Tổng kích thước */}
            <div className="text-xs font-medium text-slate-600">
              Tổng: <span className="font-bold text-slate-900">{mullion.totalDimension}</span> mm
            </div>

            {/* Input Kích thước khoang */}
            <div>
              <div className="relative">
                <input
                  type="number"
                  autoFocus
                  value={dimension}
                  onChange={(e) => setDimension(Number(e.target.value))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  className="w-full h-12 px-3.5 rounded-2xl border-2 border-orange-400 font-mono font-bold text-lg text-slate-900 bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15 transition-all shadow-inner"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  mm
                </span>
              </div>
            </div>

            {/* Override cây đố khung */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Override cây đố khung:
              </label>
              <select
                value={selectedProfileId ?? ''}
                onChange={(e) =>
                  setSelectedProfileId(e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 cursor-pointer truncate"
              >
                <option value="">(Mặc định theo hệ nhôm)</option>
                {availableProfiles.map((bar) => (
                  <option key={bar.id} value={bar.id}>
                    {bar.code} – {bar.name}
                  </option>
                ))}
              </select>
              {selectedProfileId && (
                <button
                  type="button"
                  onClick={() => setSelectedProfileId(undefined)}
                  className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 self-start cursor-pointer transition-colors"
                >
                  × Reset về mặc định
                </button>
              )}
            </div>

            {/* Kiểu cắt */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-600 font-medium">Kiểu cắt:</span>
              <button
                type="button"
                onClick={handleCycleCutType}
                className="px-3.5 py-1.5 rounded-full border border-orange-400 text-orange-600 font-semibold text-xs hover:bg-orange-50 transition-colors cursor-pointer"
              >
                {CUT_TYPE_LABELS[cutType]}
              </button>
            </div>

            {/* Xóa đố này */}
            <button
              type="button"
              onClick={() => {
                onDeleteMullion();
                onClose();
              }}
              className="mt-1 w-full py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/90 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Trash2 size={14} />
              <span>Xóa đố này</span>
            </button>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 h-11 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer hover:shadow-md active:scale-[0.98]"
              >
                <Check size={15} />
                <span>Lưu</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer active:scale-[0.98]"
              >
                Hủy
              </button>
            </div>
          </div>
        ) : (
          /* Tab 2: Nâng cao */
          <div className="p-5 pt-2 flex flex-col gap-3.5">
            {/* Callout Notice */}
            <div className="bg-emerald-50/80 border border-emerald-200/90 p-3 rounded-2xl text-[11px] text-emerald-950 font-medium leading-relaxed">
              <span className="font-bold text-emerald-800">Local transpose:</span> mọi đoạn đố dùng cùng quy tắc H↔V; ancestor cùng hướng chỉ mang tọa độ, crossing thật mới làm đổi precedence.
            </div>

            {/* Đầu đang thao tác */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Đầu đang thao tác</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveEnd('start')}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    activeEnd === 'start'
                      ? 'border-teal-500 bg-teal-50/60 text-teal-800 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {isHoriz ? 'Đầu trái' : 'Đầu trên'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEnd('end')}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    activeEnd === 'end'
                      ? 'border-teal-500 bg-teal-50/60 text-teal-800 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {isHoriz ? 'Đầu phải' : 'Đầu dưới'}
                </button>
              </div>
            </div>

            {/* Chuyển qua mốc kế tiếp */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Chuyển qua mốc kế tiếp</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="py-2 rounded-xl text-xs font-medium border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                  disabled
                >
                  {isHoriz ? '← Qua trái' : '↑ Lên trên'}
                </button>
                <button
                  type="button"
                  className="py-2 rounded-xl text-xs font-medium border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                  disabled
                >
                  {isHoriz ? 'Qua phải →' : 'Xuống dưới ↓'}
                </button>
              </div>
            </div>

            {/* Chú giải mốc */}
            <div className="bg-slate-50 border border-slate-200/90 p-3 rounded-2xl text-[11px] text-slate-500 space-y-1.5 leading-relaxed">
              <div>
                <span className="font-semibold text-slate-700">← Qua trái:</span> Đầu này chưa nằm trên giao điểm mà thanh vuông góc đã bị tách thành hai.
              </div>
              <div>
                <span className="font-semibold text-slate-700">Qua phải →:</span> Không còn crossing ancestor kế tiếp.
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="mt-1 w-full h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer active:scale-[0.98]"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
