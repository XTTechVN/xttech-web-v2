'use client';

import React, { useState, useMemo } from 'react';
import { AccessoryCombo, Accessory, SelectedAccessoryItem, Brand } from '@/types';
import { Search, Boxes } from 'lucide-react';
import { ComboCategoryTab, detectComboCategory, detectComboBrand } from './accessories/types';
import { ComboCard } from './accessories/combo-card';
import { SelectedItemsPanel } from './accessories/selected-items-panel';
import { IndividualAccessoriesView } from './accessories/individual-accessories-view';

interface AccessoriesTabViewProps {
  combos: AccessoryCombo[];
  selectedComboIds: number[];
  onToggleCombo: (comboId: number) => void;
  accessories: Accessory[];
  brands?: Brand[];
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
  brands = [],
  selectedAccessories,
  onUpdateAccessoryQty,
  onSetAccessoryQty,
  onClearAll,
}) => {
  const [categoryTab, setCategoryTab] = useState<ComboCategoryTab>('frame');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [expandedComboId, setExpandedComboId] = useState<number | null>(null);

  // Group combos by category for badges
  const categoryCounts = useMemo(() => {
    let frame = 0;
    let sash = 0;
    let opening = 0;
    for (const c of combos) {
      const cat = detectComboCategory(c);
      if (cat === 'frame') frame++;
      else if (cat === 'sash') sash++;
      else if (cat === 'opening') opening++;
    }
    return { frame, sash, opening, all: combos.length };
  }, [combos]);

  // Detected brands in available combos & DB brands
  const dynamicBrandFilters = useMemo(() => {
    const set = new Set<string>();
    // 1. Quét từ danh sách combo thực tế
    for (const c of combos) {
      const b = detectComboBrand(c, brands);
      if (b && b !== 'Khác') set.add(b);
    }
    // 2. Bổ sung các thương hiệu phụ kiện hoặc cả hai từ CSDL
    for (const b of brands) {
      if (b.brandType === 'accessory' || b.brandType === 'both') {
        set.add(b.name);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [combos, brands]);

  // Filter combos based on active category, brand, search
  const filteredCombos = useMemo(() => {
    return combos.filter((c) => {
      // Category filter
      if (categoryTab !== 'all') {
        const cat = detectComboCategory(c);
        if (cat !== categoryTab) return false;
      }
      // Brand filter
      if (brandFilter !== 'all') {
        const b = detectComboBrand(c, brands);
        if (b.toLowerCase() !== brandFilter.toLowerCase()) return false;
      }
      // Search text
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchCode = c.code ? c.code.toLowerCase().includes(q) : false;
        if (!matchName && !matchCode) return false;
      }
      return true;
    });
  }, [combos, categoryTab, brandFilter, search, brands]);

  // Selected Combos list
  const selectedCombos = useMemo(() => {
    return combos.filter((c) => selectedComboIds.includes(c.id));
  }, [combos, selectedComboIds]);

  // Price calculations
  const totalCombosPrice = useMemo(() => {
    return selectedCombos.reduce((sum, c) => sum + (c.totalComboPrice || 0), 0);
  }, [selectedCombos]);

  const totalIndividualPrice = useMemo(() => {
    return selectedAccessories.reduce((sum, item) => {
      const acc = accessories.find((a) => a.id === item.accessoryId);
      const price = acc?.salePrice || acc?.retailPrice || acc?.costPrice || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [selectedAccessories, accessories]);

  const totalAmount = totalCombosPrice + totalIndividualPrice;
  const totalIndividualCount = selectedAccessories.reduce((sum, a) => sum + a.quantity, 0);

  const searchPlaceholder = useMemo(() => {
    if (categoryTab === 'frame') return 'Tìm combo khung...';
    if (categoryTab === 'sash') return 'Tìm combo cánh...';
    if (categoryTab === 'opening') return 'Tìm combo hướng mở, bản lề, khóa...';
    return 'Tìm kiếm bộ combo phụ kiện theo tên, mã...';
  }, [categoryTab]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 overflow-hidden text-xs text-gray-800">
      {/* ===================== TẦNG 1: BỘ LỌC PHÂN LOẠI & THƯƠNG HIỆU ===================== */}
      <div className="p-3 bg-white border-b border-gray-200 shrink-0 space-y-2.5 shadow-2xs">
        {/* Category Switcher Tabs matching Image 2 */}
        <div className="flex items-center gap-1 border-b border-gray-100 pb-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => { setCategoryTab('frame'); setBrandFilter('all'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              categoryTab === 'frame'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>🚪 Khung</span>
            <span className="text-[10px] opacity-80">({categoryCounts.frame})</span>
          </button>

          <button
            type="button"
            onClick={() => { setCategoryTab('sash'); setBrandFilter('all'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              categoryTab === 'sash'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>🪟 Cánh</span>
            <span className="text-[10px] opacity-80">({categoryCounts.sash})</span>
          </button>

          <button
            type="button"
            onClick={() => { setCategoryTab('opening'); setBrandFilter('all'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              categoryTab === 'opening'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>🔁 Hướng mở</span>
            <span className="text-[10px] opacity-80">({categoryCounts.opening})</span>
          </button>

          <button
            type="button"
            onClick={() => { setCategoryTab('all'); setBrandFilter('all'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              categoryTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>Tất cả combo</span>
            <span className="text-[10px] opacity-80">({categoryCounts.all})</span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryTab('individual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ml-auto ${
              categoryTab === 'individual'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <span>📦 Phụ kiện lẻ</span>
            <span className="text-[10px] opacity-80">({accessories.length})</span>
          </button>
        </div>

        {/* Brand Tags Filter matching Image 2 */}
        {categoryTab !== 'individual' && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setBrandFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                brandFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            {dynamicBrandFilters.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => setBrandFilter(brandFilter === brand ? 'all' : brand)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  brandFilter === brand
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        )}

        {/* Search bar */}
        {categoryTab !== 'individual' && (
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* ===================== TẦNG 2 & 3: MAIN SCROLLABLE CONTENT ===================== */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {/* TẦNG 2: KHO COMBO KHẢ DỤNG HOẶC PHỤ KIỆN LẺ */}
        {categoryTab === 'individual' ? (
          <IndividualAccessoriesView
            accessories={accessories}
            selectedAccessories={selectedAccessories}
            onUpdateAccessoryQty={onUpdateAccessoryQty}
            onSetAccessoryQty={onSetAccessoryQty}
          />
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
              <span>Danh mục combo ({filteredCombos.length} bộ khả dụng)</span>
              {brandFilter !== 'all' && (
                <span className="text-blue-600">Đang lọc theo hãng: {brandFilter}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredCombos.map((combo) => (
                <ComboCard
                  key={combo.id}
                  combo={combo}
                  isSelected={selectedComboIds.includes(combo.id)}
                  isExpanded={expandedComboId === combo.id}
                  onToggle={() => onToggleCombo(combo.id)}
                  onToggleExpand={() =>
                    setExpandedComboId(expandedComboId === combo.id ? null : combo.id)
                  }
                />
              ))}
            </div>

            {filteredCombos.length === 0 && (
              <div className="py-8 text-center text-gray-400 space-y-1 bg-white rounded-xl border border-gray-200">
                <Boxes size={24} className="mx-auto text-gray-300" />
                <p className="text-xs">Không tìm thấy combo nào phù hợp với bộ lọc</p>
              </div>
            )}
          </div>
        )}

        {/* TẦNG 3: VÙNG "CHI TIẾT ĐÃ CHỌN" (GIẢI QUYẾT TRIỆT ĐỂ BẤT TIỆN KHI HỦY) */}
        <div className="pt-2 border-t border-gray-200">
          <SelectedItemsPanel
            selectedCombos={selectedCombos}
            onToggleCombo={onToggleCombo}
            selectedAccessories={selectedAccessories}
            accessories={accessories}
            onUpdateAccessoryQty={onUpdateAccessoryQty}
            onSetAccessoryQty={onSetAccessoryQty}
            onClearAll={onClearAll}
          />
        </div>
      </div>

      {/* ===================== FOOTER: SUMMARY BAR ===================== */}
      <div className="p-3 bg-white border-t border-gray-200 shrink-0 flex items-center justify-between shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Đã chọn:</span>
          <span className="px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200">
            {selectedComboIds.length} Combo
          </span>
          <span className="px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {totalIndividualCount} Phụ kiện rời
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-gray-500 font-sans text-xs">Tạm tính:</span>
          <span className="font-bold text-sm sm:text-base text-blue-700">
            {totalAmount > 0 ? `${totalAmount.toLocaleString('vi-VN')} đ` : '0 đ'}
          </span>
        </div>
      </div>
    </div>
  );
};
