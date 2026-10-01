'use client';

import React from 'react';
import { AccessoryCombo } from '@/types';
import { ChevronDown, ChevronUp, Layers, Check } from 'lucide-react';

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
      className={`rounded-xl border transition-all bg-white flex flex-col justify-between overflow-hidden ${
        isSelected
          ? 'border-blue-500 shadow-sm ring-1 ring-blue-500/30 bg-blue-50/10'
          : 'border-gray-200 hover:border-gray-300 shadow-2xs'
      }`}
    >
      <div className="p-3.5 space-y-2">
        {/* Top: Name & Action Button */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-bold text-xs sm:text-sm text-gray-900 truncate" title={combo.name}>
              {combo.name}
            </div>
            <div className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">
              {combo.code || '---'} · {itemsCount} phụ kiện
            </div>
          </div>

          {/* Action button matching Reference Image 2 */}
          <button
            type="button"
            onClick={onToggle}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
              isSelected
                ? 'bg-blue-600 hover:bg-rose-600 text-white shadow-xs group'
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
            }`}
          >
            {isSelected ? (
              <>
                <Check size={12} className="group-hover:hidden" />
                <span className="group-hover:hidden">Đã thêm</span>
                <span className="hidden group-hover:inline">✕ Bỏ chọn</span>
              </>
            ) : (
              <span>+ Thêm</span>
            )}
          </button>
        </div>

        {/* Price & Expand */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
          <button
            type="button"
            onClick={onToggleExpand}
            className="text-gray-500 hover:text-blue-600 font-medium flex items-center gap-1 cursor-pointer text-[11px]"
          >
            <span>{isExpanded ? 'Ẩn chi tiết' : 'Chi tiết vật tư'}</span>
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          <span className="font-mono font-bold text-blue-700">
            {combo.totalComboPrice ? `${combo.totalComboPrice.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
          </span>
        </div>
      </div>

      {/* Expandable item details */}
      {isExpanded && (
        <div className="p-2.5 bg-slate-50 border-t border-slate-100 divide-y divide-slate-200/60 max-h-36 overflow-y-auto text-[11px]">
          {combo.comboItems && combo.comboItems.length > 0 ? (
            combo.comboItems.map((item, idx) => (
              <div key={idx} className="py-1 flex items-center justify-between text-gray-700">
                <span className="truncate pr-2">
                  {idx + 1}. {item.accessoryName || item.accessoryCode || `Phụ kiện #${item.accessoryId}`}
                </span>
                <span className="font-mono text-gray-500 shrink-0">
                  {item.quantity} {item.unit || 'món'}
                </span>
              </div>
            ))
          ) : (
            <div className="py-1 text-center text-gray-400 italic">Chưa có chi tiết vật tư</div>
          )}
        </div>
      )}
    </div>
  );
};
