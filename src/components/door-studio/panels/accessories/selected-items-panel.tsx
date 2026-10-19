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
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center bg-white/70 space-y-2">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Boxes size={22} />
          </div>
          <p className="text-xs font-semibold text-slate-700">
            Chưa có combo phụ kiện nào được gán cho cửa này
          </p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Chọn các mục ở cột bên trái (Khung, Cánh, Hướng mở hoặc Phụ kiện lẻ) để gán vật tư tương ứng.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Selected Combos List */}
          {selectedCombos.length > 0 && (
            <div className="bg-white border border-primary/20 rounded-xl overflow-hidden shadow-2xs">
              <div className="px-3.5 py-2 bg-primary/5 border-b border-primary/10 font-bold text-[11px] text-primary flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Boxes size={13} />
                  <span>Combo phụ kiện đã chọn ({selectedCombos.length})</span>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {selectedCombos.map((c) => {
                  const cat = detectComboCategory(c);
                  const isExpanded = expandedComboId === c.id;
                  const price = c.totalComboPrice || 0;
                  return (
                    <div key={c.id} className="p-3 hover:bg-slate-50/50 transition-colors space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
                              {categoryLabels[cat] || 'Combo'}
                            </span>
                            <span className="font-bold text-slate-900 truncate" title={c.name}>
                              {c.name}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>{c.code || '---'}</span>
                            <span>·</span>
                            <span>{c.comboItems?.length || 0} vật tư</span>
                            <button
                              type="button"
                              onClick={() => setExpandedComboId(isExpanded ? null : c.id)}
                              className="text-primary hover:underline cursor-pointer font-medium"
                            >
                              {isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className={`text-xs ${price > 0 ? 'font-bold text-primary' : 'text-slate-400'}`}>
                            {price > 0 ? `${price.toLocaleString('vi-VN')} đ` : '-'}
                          </span>
                          <button
                            type="button"
                            onClick={() => onToggleCombo(c.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                            title="Hủy combo này"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Expand Details */}
                      {isExpanded && c.comboItems && c.comboItems.length > 0 && (
                        <div className="p-2 bg-slate-50/80 rounded-lg border border-slate-200/60 text-[11px] space-y-1">
                          {c.comboItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-slate-600">
                              <span className="truncate pr-2">
                                {idx + 1}. {item.accessoryName || item.accessoryCode || `Phụ kiện #${item.accessoryId}`}
                              </span>
                              <span className="text-slate-400 shrink-0 font-medium">
                                ×{item.quantity} {item.unit || ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
                        <div className="text-[11px] text-gray-400">
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
                          <span className="w-8 text-center font-bold text-gray-900 text-[11px]">
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

                        <span className="font-bold text-gray-900 text-xs w-20 text-right">
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
