'use client';

import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { MullionInfo } from '../../studio-types';

interface MullionAdvancedTabProps {
  mullion: MullionInfo;
  isSashMullion: boolean;
  onLocalTranspose?: (parentId: string, mullionIndex: number) => void;
  onClose: () => void;
}

export const MullionAdvancedTab: React.FC<MullionAdvancedTabProps> = ({
  mullion, isSashMullion, onLocalTranspose, onClose,
}) => {
  const [activeEnd, setActiveEnd] = useState<'start' | 'end'>('end');
  const isHoriz = mullion.direction === 'horizontal';
  const canTranspose = Boolean(onLocalTranspose) && !isSashMullion;

  const handleTranspose = () => {
    if (!canTranspose || !onLocalTranspose) return;
    onLocalTranspose(mullion.parentNodeId, mullion.mullionIndex);
    onClose();
  };

  return (
    <div className="p-5 pt-2 flex flex-col gap-3.5">
      {isSashMullion ? (
        <div className="bg-amber-50/90 border border-amber-200/90 p-3 rounded-2xl text-[11px] text-amber-950 font-medium leading-relaxed">
          <span className="font-bold text-amber-800">Đố cánh không hỗ trợ Local transpose:</span>{' '}
          Đảo chiều ưu tiên giao điểm đố chỉ áp dụng cho hệ đố khung bao. Đố cánh luôn cắt vuông lọt lòng cánh.
        </div>
      ) : (
        <div className="bg-emerald-50/80 border border-emerald-200/90 p-3 rounded-2xl text-[11px] text-emerald-950 font-medium leading-relaxed">
          <span className="font-bold text-emerald-800">Local transpose:</span> mọi đoạn đố dùng cùng
          quy tắc H↔V; ancestor cùng hướng chỉ mang tọa độ, crossing thật mới làm đổi precedence.
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700">Đầu đang thao tác</label>
        <div className="grid grid-cols-2 gap-2">
          {(['start', 'end'] as const).map((endKey) => (
            <button
              key={endKey}
              type="button"
              disabled={isSashMullion}
              onClick={() => setActiveEnd(endKey)}
              className={cn(
                'py-2 rounded-xl text-xs font-semibold border transition-all',
                isSashMullion
                  ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                  : activeEnd === endKey
                    ? 'border-teal-500 bg-teal-50/60 text-teal-800 font-bold shadow-2xs cursor-pointer'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer'
              )}
            >
              {endKey === 'start' ? (isHoriz ? 'Đầu trái' : 'Đầu trên') : (isHoriz ? 'Đầu phải' : 'Đầu dưới')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700">Chuyển qua mốc kế tiếp</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleTranspose}
            disabled={!canTranspose}
            className={cn(
              'py-2 rounded-xl text-xs font-medium border transition-colors',
              canTranspose ? 'border-teal-500 bg-teal-50/70 text-teal-800 hover:bg-teal-100/80 cursor-pointer font-semibold' : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
            )}
          >
            {isHoriz ? '← Qua trái' : '↑ Lên trên'}
          </button>
          <button
            type="button"
            onClick={handleTranspose}
            disabled={!canTranspose}
            className={cn(
              'py-2 rounded-xl text-xs font-medium border transition-colors',
              canTranspose ? 'border-teal-500 bg-teal-50/70 text-teal-800 hover:bg-teal-100/80 cursor-pointer font-semibold' : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
            )}
          >
            {isHoriz ? 'Qua phải →' : 'Xuống dưới ↓'}
          </button>
        </div>
        {onLocalTranspose && (
          <button
            type="button"
            disabled={!canTranspose}
            onClick={handleTranspose}
            className={cn(
              'mt-1 w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs',
              canTranspose ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            )}
          >
            <ArrowLeftRight size={14} />
            <span>Đảo chiều ưu tiên đố (Local transpose)</span>
          </button>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200/90 p-3 rounded-2xl text-[11px] text-slate-500 space-y-1.5 leading-relaxed">
        <div><span className="font-semibold text-slate-700">← Qua trái:</span> Đầu này chưa nằm trên giao điểm mà thanh vuông góc đã bị tách thành hai.</div>
        <div><span className="font-semibold text-slate-700">Qua phải →:</span> Không còn crossing ancestor kế tiếp.</div>
      </div>

      <button type="button" onClick={onClose} className="mt-1 w-full h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer active:scale-[0.98]">
        Đóng
      </button>
    </div>
  );
};
