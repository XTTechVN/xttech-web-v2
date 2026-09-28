'use client';

import React, { useState, useMemo } from 'react';
import { AccessoryCombo, Accessory, SelectedAccessoryItem } from '@/types';
import { ACCESSORY_UNIT_CONFIG } from '@/types/accessory';
import {
  Wrench,
  Package,
  Boxes,
  CheckCircle2,
  Search,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
} from 'lucide-react';

interface AccessoriesTabViewProps {
  combos: AccessoryCombo[];
  selectedComboIds: number[];
  onToggleCombo: (comboId: number) => void;
  accessories: Accessory[];
  selectedAccessories: SelectedAccessoryItem[];
  onUpdateAccessoryQty: (accessoryId: number, delta: number) => void;
  onSetAccessoryQty: (accessoryId: number, qty: number) => void;
  onClearAll?: () => void;
  hardwareColor?: string;
  onChangeHardwareColor?: (color: string) => void;
}

export const AccessoriesTabView: React.FC<AccessoriesTabViewProps> = ({
  combos,
  selectedComboIds,
  onToggleCombo,
  accessories,
  selectedAccessories,
  onUpdateAccessoryQty,
  onSetAccessoryQty,
  onClearAll,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'combos' | 'individual'>('combos');
  const [comboSearch, setComboSearch] = useState<string>('');
  const [accSearch, setAccSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedComboId, setExpandedComboId] = useState<number | null>(null);

  // Map quantity for quick lookup: accessoryId -> quantity
  const selectedAccMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const item of selectedAccessories) {
      map.set(item.accessoryId, item.quantity);
    }
    return map;
  }, [selectedAccessories]);

  // Filter Combos
  const filteredCombos = useMemo(() => {
    if (!comboSearch.trim()) return combos;
    const q = comboSearch.toLowerCase();
    return combos.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.code && c.code.toLowerCase().includes(q))
    );
  }, [combos, comboSearch]);

  // Categories list for individual accessories
  const categories = useMemo(() => {
    const set = new Set<string>();
    accessories.forEach((a) => {
      if (a.category?.name) set.add(a.category.name);
    });
    return Array.from(set);
  }, [accessories]);

  // Filter Individual Accessories
  const filteredAccessories = useMemo(() => {
    return accessories.filter((a) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (a.category?.name !== selectedCategory) return false;
      }
      // Search query
      if (accSearch.trim()) {
        const q = accSearch.toLowerCase();
        const matchName = a.name.toLowerCase().includes(q);
        const matchCode = a.code ? a.code.toLowerCase().includes(q) : false;
        const matchSpec = a.specification ? a.specification.toLowerCase().includes(q) : false;
        if (!matchName && !matchCode && !matchSpec) return false;
      }
      return true;
    });
  }, [accessories, selectedCategory, accSearch]);

  // Calculate totals
  const totalCombosPrice = useMemo(() => {
    return combos
      .filter((c) => selectedComboIds.includes(c.id))
      .reduce((sum, c) => sum + (c.totalComboPrice || 0), 0);
  }, [combos, selectedComboIds]);

  const totalIndividualPrice = useMemo(() => {
    return selectedAccessories.reduce((sum, item) => {
      const acc = accessories.find((a) => a.id === item.accessoryId);
      const price = acc?.salePrice || acc?.retailPrice || acc?.costPrice || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [selectedAccessories, accessories]);

  const totalAccessoryAmount = totalCombosPrice + totalIndividualPrice;
  const totalSelectedIndividualCount = selectedAccessories.reduce((s, a) => s + a.quantity, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 overflow-hidden text-xs text-gray-800">
      {/* Header Info Banner */}
      <div className="p-4 bg-white border-b border-gray-200 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Quản Lý Phụ Kiện & Vật Tư Kim Khí</h3>
            <p className="text-[11px] text-gray-500">
              Có thể chọn nhiều combo phụ kiện đồng bộ và bổ sung các món phụ kiện lẻ theo nhu cầu
            </p>
          </div>
        </div>

        {/* Sub-Tab Navigation Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSubTab('combos')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'combos'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Boxes size={14} />
            <span>1. Combo Phụ Kiện</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                selectedComboIds.length > 0
                  ? 'bg-blue-100 text-blue-700 font-bold'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {selectedComboIds.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('individual')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'individual'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package size={14} />
            <span>2. Phụ Kiện Lẻ / Rời</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                selectedAccessories.length > 0
                  ? 'bg-emerald-100 text-emerald-700 font-bold'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {selectedAccessories.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* ===================== SUB-TAB 1: COMBOS ===================== */}
        {activeSubTab === 'combos' && (
          <div className="space-y-4">
            {/* Search bar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={comboSearch}
                  onChange={(e) => setComboSearch(e.target.value)}
                  placeholder="Tìm kiếm bộ combo phụ kiện theo tên, mã..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
                {filteredCombos.length} bộ combo khả dụng
              </div>
            </div>

            {/* Combos Grid */}
            <div className="grid grid-cols-2 gap-4">
              {filteredCombos.map((c) => {
                const isSelected = selectedComboIds.includes(c.id);
                const isExpanded = expandedComboId === c.id;
                const itemsCount = c.comboItems?.length || 0;

                return (
                  <div
                    key={c.id}
                    className={`rounded-2xl border transition-all bg-white flex flex-col justify-between overflow-hidden ${
                      isSelected
                        ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20 bg-blue-50/10'
                        : 'border-gray-200 hover:border-gray-300 shadow-2xs'
                    }`}
                  >
                    <div className="p-4 space-y-3">
                      {/* Top Row: Name + Multi-select Checkbox */}
                      <div className="flex items-start justify-between gap-2">
                        <div
                          onClick={() => onToggleCombo(c.id)}
                          className="flex-1 cursor-pointer select-none"
                        >
                          <div className="font-bold text-sm text-gray-900 hover:text-blue-600 transition-colors">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                            Mã: {c.code || '---'}
                          </div>
                        </div>

                        {/* Checkbox Button */}
                        <button
                          type="button"
                          onClick={() => onToggleCombo(c.id)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'border border-gray-300 hover:border-gray-400 bg-white text-transparent'
                          }`}
                          title={isSelected ? 'Bỏ chọn combo này' : 'Chọn combo này'}
                        >
                          <CheckCircle2 size={15} />
                        </button>
                      </div>

                      {/* Middle Row: Items Count & Price */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Layers size={13} className="text-gray-400" />
                          <span>{itemsCount} món vật tư</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-sm text-blue-700 font-mono">
                            {c.totalComboPrice
                              ? c.totalComboPrice.toLocaleString('vi-VN') + ' đ'
                              : 'Liên hệ'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expand/Collapse Item Details */}
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => setExpandedComboId(isExpanded ? null : c.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết vật tư'}</span>
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>

                      {isSelected && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                          ✓ Đã áp dụng
                        </span>
                      )}
                    </div>

                    {/* Collapsible Item Details List */}
                    {isExpanded && (
                      <div className="p-3 bg-slate-50/80 border-t border-slate-100 divide-y divide-slate-200/60 max-h-48 overflow-y-auto">
                        {c.comboItems && c.comboItems.length > 0 ? (
                          c.comboItems.map((item, idx) => (
                            <div
                              key={idx}
                              className="py-1.5 flex items-center justify-between text-[11px]"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-mono text-[9px]">
                                  {idx + 1}
                                </span>
                                <span className="font-medium text-slate-800">
                                  {item.accessoryName || item.accessoryCode || `Phụ kiện #${item.accessoryId}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 font-mono text-slate-500">
                                <span>{item.quantity} {item.unit || 'món'}</span>
                                {item.unitPrice ? (
                                  <span className="text-slate-400">
                                    ({item.unitPrice.toLocaleString('vi-VN')} đ)
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-2 text-center text-slate-400 italic">
                            Chưa có chi tiết vật tư trong combo này
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredCombos.length === 0 && (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <Boxes size={32} className="mx-auto text-gray-300" />
                <p>Không tìm thấy combo phụ kiện nào phù hợp</p>
              </div>
            )}
          </div>
        )}

        {/* ===================== SUB-TAB 2: INDIVIDUAL ACCESSORIES ===================== */}
        {activeSubTab === 'individual' && (
          <div className="space-y-4">
            {/* Search and Category Filters */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={accSearch}
                  onChange={(e) => setAccSearch(e.target.value)}
                  placeholder="Tìm phụ kiện theo tên, mã (bản lề, khóa, ke góc, chốt...)"
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Category Pills Filter */}
              {categories.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-sm">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Tất cả ({accessories.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Accessories Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50/70">
                    <th className="py-2.5 px-4">Mã & Tên phụ kiện</th>
                    <th className="py-2.5 px-3">Phân loại</th>
                    <th className="py-2.5 px-3 text-center">ĐVT</th>
                    <th className="py-2.5 px-3 text-right">Đơn giá tham khảo</th>
                    <th className="py-2.5 px-4 text-center w-36">Số lượng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredAccessories.map((acc) => {
                    const currentQty = selectedAccMap.get(acc.id) || 0;
                    const isSelected = currentQty > 0;
                    const price = acc.salePrice || acc.retailPrice || acc.costPrice || 0;
                    const unitCfg = acc.unit ? ACCESSORY_UNIT_CONFIG[acc.unit] : null;

                    return (
                      <tr
                        key={acc.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-gray-50/80'
                        }`}
                      >
                        {/* Name & Code */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900">{acc.name}</div>
                          <div className="text-[11px] text-gray-400 font-mono">
                            Mã: {acc.code || '---'} {acc.specification && `| ${acc.specification}`}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <span className="text-gray-600 text-[11px]">
                            {acc.category?.name || 'Phụ kiện lẻ'}
                          </span>
                        </td>

                        {/* Unit */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              unitCfg ? unitCfg.className : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            {unitCfg ? unitCfg.label : acc.unit || 'Cái'}
                          </span>
                        </td>

                        {/* Unit Price */}
                        <td className="py-3 px-3 text-right font-mono font-semibold text-gray-900">
                          {price > 0 ? price.toLocaleString('vi-VN') + ' đ' : '-'}
                        </td>

                        {/* Quantity Controls */}
                        <td className="py-3 px-4 text-center">
                          {isSelected ? (
                            <div className="inline-flex items-center gap-1 bg-white border border-blue-300 rounded-xl p-0.5 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => onUpdateAccessoryQty(acc.id, -1)}
                                className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
                                title="Giảm 1"
                              >
                                <Minus size={12} />
                              </button>

                              <input
                                type="number"
                                min={0}
                                value={currentQty}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  onSetAccessoryQty(acc.id, isNaN(val) ? 0 : val);
                                }}
                                className="w-10 text-center font-bold font-mono text-xs text-blue-700 focus:outline-none"
                              />

                              <button
                                type="button"
                                onClick={() => onUpdateAccessoryQty(acc.id, 1)}
                                className="w-6 h-6 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-700 transition-colors cursor-pointer"
                                title="Tăng 1"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onUpdateAccessoryQty(acc.id, 1)}
                              className="px-3 py-1 rounded-xl bg-gray-100 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 text-gray-700 font-semibold text-[11px] transition-all cursor-pointer flex items-center gap-1 mx-auto"
                            >
                              <Plus size={12} />
                              <span>Thêm</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredAccessories.length === 0 && (
                <div className="py-12 text-center text-gray-400 space-y-2">
                  <Package size={32} className="mx-auto text-gray-300" />
                  <p>Không tìm thấy phụ kiện nào phù hợp</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===================== BOTTOM SUMMARY BAR ===================== */}
      <div className="p-3.5 bg-white border-t border-gray-200 shrink-0 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-600">Đã chọn:</span>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200">
              {selectedComboIds.length} Combo
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              {totalSelectedIndividualCount} Phụ kiện rời ({selectedAccessories.length} loại)
            </span>
          </div>

          {(selectedComboIds.length > 0 || selectedAccessories.length > 0) && onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-[11px] text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Bỏ chọn tất cả</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-medium">Tổng tiền phụ kiện tạm tính:</span>
          <span className="font-bold text-base text-blue-700 font-mono">
            {totalAccessoryAmount > 0
              ? totalAccessoryAmount.toLocaleString('vi-VN') + ' đ'
              : '0 đ'}
          </span>
        </div>
      </div>
    </div>
  );
};
