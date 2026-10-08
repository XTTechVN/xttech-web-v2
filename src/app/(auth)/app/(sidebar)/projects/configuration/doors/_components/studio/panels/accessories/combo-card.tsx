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
      className={`group rounded-xl border transition-all duration-200 bg-white flex flex-col overflow-hidden ${
        isSelected
          ? 'border-primary/60 shadow-xs ring-1 ring-primary/20 bg-primary/[0.02]'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs hover:bg-slate-50/30'
      }`}
    >
      <div className="p-3 flex flex-col gap-2">
        {/* Name + action button */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs text-slate-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors" title={combo.name}>
              {combo.name}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60 truncate">
                {combo.code || '—'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                · {itemsCount} phụ kiện
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggle}
            className={`shrink-0 h-7 px-3 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
              isSelected
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                : 'bg-primary hover:bg-primary/90 text-white'
            }`}
          >
            {isSelected ? (
              <>
                <Check size={12} className="shrink-0 text-emerald-600" />
                <span>Đã thêm</span>
              </>
            ) : (
              <>
                <Plus size={12} className="shrink-0" />
                <span>Thêm</span>
              </>
            )}
          </button>
        </div>

        {/* Price + expand toggle */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-0.5">
          <button
            type="button"
            onClick={onToggleExpand}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-800 transition-colors cursor-pointer font-medium"
          >
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            <span>{isExpanded ? 'Thu gọn' : 'Chi tiết vật tư'}</span>
          </button>

          <span className={`text-xs font-bold tabular-nums ${isSelected ? 'text-primary' : 'text-slate-700'}`}>
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
