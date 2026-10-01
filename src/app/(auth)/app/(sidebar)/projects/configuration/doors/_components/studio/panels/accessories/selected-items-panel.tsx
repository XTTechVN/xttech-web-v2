'use client';

import React, { useState } from 'react';
import { AccessoryCombo, Accessory, SelectedAccessoryItem } from '@/types';
import { Trash2, X, ChevronDown, ChevronUp, Package, Boxes, Minus, Plus } from 'lucide-react';
import { detectComboCategory } from './types';

interface SelectedItemsPanelProps {
  selectedCombos: AccessoryCombo[];
  onToggleCombo: (comboId: number) => void;
  selectedAccessories: SelectedAccessoryItem[];
  accessories: Accessory[];
  onUpdateAccessoryQty: (accessoryId: number, delta: number) => void;
  onSetAccessoryQty: (accessoryId: number, qty: number) => void;
  onClearAll?: () => void;
}

export const SelectedItemsPanel: React.FC<SelectedItemsPanelProps> = ({
  selectedCombos,
  onToggleCombo,
  selectedAccessories,
  accessories,
  onUpdateAccessoryQty,
  onSetAccessoryQty,
  onClearAll,
}) => {
  const [expandedComboId, setExpandedComboId] = useState<number | null>(null);

  const totalCount = selectedCombos.length + selectedAccessories.length;

  const categoryLabels: Record<string, string> = {
    frame: 'Khung',
    sash: 'Cánh',
    opening: 'Hướng mở',
  };

  return (
    <div className="space-y-2.5">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
          <span>Chi tiết ({totalCount} mục đã chọn)</span>
          {selectedCombos.length > 0 && (
            <span className="text-[11px] font-normal text-blue-600">
              ({selectedCombos.length} combo)
            </span>
          )}
          {selectedAccessories.length > 0 && (
            <span className="text-[11px] font-normal text-emerald-600">
              ({selectedAccessories.length} phụ kiện rời)
            </span>
          )}
        </div>

        {totalCount > 0 && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Trash2 size={12} />
            <span>Hủy tất cả</span>
          </button>
        )}
      </div>

      {/* Empty State matching Reference Image 2 */}
      {totalCount === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-white/60 space-y-1.5">
          <p className="text-xs text-gray-500 font-medium">
            Chưa có combo phụ kiện nào được gán cho cửa này.
          </p>
          <p className="text-[11px] text-gray-400">
            💡 Chọn các tab ở trên (Khung, Cánh, Hướng mở) để gán combo có sẵn.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Selected Combos Grid */}
          {selectedCombos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedCombos.map((c) => {
                const cat = detectComboCategory(c);
                const isExpanded = expandedComboId === c.id;
                return (
                  <div
                    key={c.id}
                    className="p-3 bg-white border border-blue-200 rounded-xl shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {categoryLabels[cat] || 'Combo'}
                          </span>
                          <span className="font-bold text-xs text-gray-900 truncate" title={c.name}>
                            {c.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                          {c.code || '---'} · {c.comboItems?.length || 0} món ·{' '}
                          <span className="font-bold text-blue-700">
                            {c.totalComboPrice ? `${c.totalComboPrice.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                          </span>
                        </div>
                      </div>

                      {/* Immediate cancel button */}
                      <button
                        type="button"
                        onClick={() => onToggleCombo(c.id)}
                        className="px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 transition-all flex items-center gap-0.5 cursor-pointer shrink-0"
                        title="Hủy bỏ combo này"
                      >
                        <X size={12} />
                        <span>Hủy</span>
                      </button>
                    </div>

                    {/* Expand Details */}
                    {c.comboItems && c.comboItems.length > 0 && (
                      <div className="border-t border-gray-100 pt-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setExpandedComboId(isExpanded ? null : c.id)}
                          className="text-gray-400 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}</span>
                          {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        </button>
                        {isExpanded && (
                          <div className="mt-1 space-y-0.5 pl-2 border-l-2 border-blue-200 text-gray-600">
                            {c.comboItems.map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="truncate pr-2">
                                  {idx + 1}. {item.accessoryName || item.accessoryCode}
                                </span>
                                <span className="font-mono text-gray-500 shrink-0">
                                  x{item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected Individual Accessories List */}
          {selectedAccessories.length > 0 && (
            <div className="bg-white border border-emerald-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="px-3 py-1.5 bg-emerald-50/70 border-b border-emerald-100 font-bold text-[11px] text-emerald-800 flex items-center gap-1.5">
                <Package size={13} />
                <span>Phụ kiện rời đã chọn ({selectedAccessories.length})</span>
              </div>
              <div className="divide-y divide-gray-100">
                {selectedAccessories.map((item, idx) => {
                  const acc = accessories.find((a) => a.id === item.accessoryId);
                  const price = acc?.salePrice || acc?.retailPrice || acc?.costPrice || 0;
                  return (
                    <div
                      key={`sel-acc-${item.accessoryId}-${idx}`}
                      className="px-3 py-2 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 truncate">
                          {acc?.name || `Phụ kiện #${item.accessoryId}`}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          {acc?.code || '---'} {price > 0 && `· ${price.toLocaleString('vi-VN')} đ/${acc?.unit || 'cái'}`}
                        </div>
                      </div>

                      {/* Stepper Controls */}
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1 border border-gray-300 rounded-lg p-0.5 bg-gray-50">
                          <button
                            type="button"
                            onClick={() => onUpdateAccessoryQty(item.accessoryId, -1)}
                            className="w-5 h-5 rounded flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-gray-900 text-[11px]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateAccessoryQty(item.accessoryId, 1)}
                            className="w-5 h-5 rounded flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        <span className="font-mono font-bold text-gray-900 text-xs w-20 text-right">
                          {(price * item.quantity).toLocaleString('vi-VN')} đ
                        </span>

                        <button
                          type="button"
                          onClick={() => onSetAccessoryQty(item.accessoryId, 0)}
                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                          title="Xóa phụ kiện này"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
