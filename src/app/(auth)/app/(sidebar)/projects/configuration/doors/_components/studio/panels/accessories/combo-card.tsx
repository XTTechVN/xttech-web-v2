'use client';

import React from 'react';
import { AccessoryCombo } from '@/types';
import { ChevronDown, ChevronUp, Check, Plus } from 'lucide-react';

interface ComboCardProps {
  combo: AccessoryCombo;
  isSelected: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onToggleExpand: () => void;
}

export const ComboCard: React.FC<ComboCardProps> = ({
  combo,
  isSelected,
  isExpanded,
  onToggle,
  onToggleExpand,
}) => {
  const itemsCount = combo.comboItems?.length || 0;

  return (
    <div
      className={`rounded-xl border transition-all duration-150 bg-white flex flex-col overflow-hidden ${
        isSelected
          ? 'border-primary/50 shadow-sm ring-1 ring-primary/20 bg-primary/[0.02]'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="p-3 flex flex-col gap-2">
        {/* Name + action button */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs text-slate-800 leading-snug line-clamp-2" title={combo.name}>
              {combo.name}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
              {combo.code || '—'} · {itemsCount} phụ kiện
            </p>
          </div>

          <button
            type="button"
            onClick={onToggle}
            className={`shrink-0 h-7 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              isSelected
                ? 'bg-primary text-white hover:bg-rose-500'
                : 'bg-amber-400 hover:bg-amber-500 text-white'
            }`}
          >
            {isSelected ? (
              <>
                <Check size={11} className="shrink-0" />
                <span className="hidden group-hover:inline">Bỏ</span>
                <span className="group-hover:hidden">Đã thêm</span>
              </>
            ) : (
              <>
                <Plus size={11} className="shrink-0" />
                Thêm
              </>
            )}
          </button>
        </div>

        {/* Price + expand toggle */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={onToggleExpand}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-primary transition-colors cursor-pointer font-medium"
          >
            {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            {isExpanded ? 'Ẩn' : 'Chi tiết vật tư'}
          </button>

          <span className={`text-[12px] font-bold tabular-nums ${isSelected ? 'text-primary' : 'text-slate-600'}`}>
            {combo.totalComboPrice
              ? combo.totalComboPrice.toLocaleString('vi-VN') + ' đ'
              : 'Liên hệ'}
          </span>
        </div>
      </div>

      {/* Expandable detail */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-3 py-2 max-h-36 overflow-y-auto">
          {combo.comboItems && combo.comboItems.length > 0 ? (
            <div className="flex flex-col gap-1">
              {combo.comboItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600 py-0.5 border-b border-slate-100 last:border-0">
                  <span className="truncate pr-2 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-[9px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    {item.accessoryName || item.accessoryCode || `Phụ kiện #${item.accessoryId}`}
                  </span>
                  <span className="font-mono text-slate-400 shrink-0">
                    ×{item.quantity} {item.unit || ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[11px] text-slate-400 italic py-2">Chưa có chi tiết vật tư</p>
          )}
        </div>
      )}
    </div>
  );
};
