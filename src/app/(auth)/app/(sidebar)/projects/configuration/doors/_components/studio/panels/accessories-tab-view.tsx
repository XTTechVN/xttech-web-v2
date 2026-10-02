'use client';

import React, { useState, useMemo } from 'react';
import { AccessoryCombo, Accessory, SelectedAccessoryItem, Brand } from '@/types';
import { Search, Boxes, Package } from 'lucide-react';
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

const CATEGORY_TABS: { value: ComboCategoryTab; label: string; icon: string }[] = [
  { value: 'frame', label: 'Khung', icon: '🚪' },
  { value: 'sash', label: 'Cánh', icon: '🪟' },
  { value: 'opening', label: 'Hướng mở', icon: '🔁' },
  { value: 'all', label: 'Tất cả', icon: '' },
];

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
    let frame = 0, sash = 0, opening = 0;
    for (const c of combos) {
      const cat = detectComboCategory(c);
      if (cat === 'frame') frame++;
      else if (cat === 'sash') sash++;
      else if (cat === 'opening') opening++;
    }
    return { frame, sash, opening, all: combos.length };
  }, [combos]);

  const countMap: Record<ComboCategoryTab, number> = {
    frame: categoryCounts.frame,
    sash: categoryCounts.sash,
    opening: categoryCounts.opening,
    all: categoryCounts.all,
    individual: accessories.length,
  };

  // Detected brands in available combos & DB brands
  const dynamicBrandFilters = useMemo(() => {
    const set = new Set<string>();
    for (const c of combos) {
      const b = detectComboBrand(c, brands);
      if (b && b !== 'Khác') set.add(b);
    }
    for (const b of brands) {
      if (b.brandType === 'accessory' || b.brandType === 'both') set.add(b.name);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [combos, brands]);

  // Filter combos based on active category, brand, search
  const filteredCombos = useMemo(() => {
    return combos.filter((c) => {
      if (categoryTab !== 'all') {
        const cat = detectComboCategory(c);
        if (cat !== categoryTab) return false;
      }
      if (brandFilter !== 'all') {
        const b = detectComboBrand(c, brands);
        if (b.toLowerCase() !== brandFilter.toLowerCase()) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchCode = c.code ? c.code.toLowerCase().includes(q) : false;
        if (!matchName && !matchCode) return false;
      }
      return true;
    });
  }, [combos, categoryTab, brandFilter, search, brands]);

  const selectedCombos = useMemo(() =>
    combos.filter((c) => selectedComboIds.includes(c.id)),
    [combos, selectedComboIds]
  );

  const totalCombosPrice = useMemo(() =>
    selectedCombos.reduce((sum, c) => sum + (c.totalComboPrice || 0), 0),
    [selectedCombos]
  );

  const totalIndividualPrice = useMemo(() =>
    selectedAccessories.reduce((sum, item) => {
      const acc = accessories.find((a) => a.id === item.accessoryId);
      const price = acc?.salePrice || acc?.retailPrice || acc?.costPrice || 0;
      return sum + price * item.quantity;
    }, 0),
    [selectedAccessories, accessories]
  );

  const totalAmount = totalCombosPrice + totalIndividualPrice;
  const totalIndividualCount = selectedAccessories.reduce((sum, a) => sum + a.quantity, 0);

  const searchPlaceholder = useMemo(() => {
    if (categoryTab === 'frame') return 'Tìm combo khung...';
    if (categoryTab === 'sash') return 'Tìm combo cánh...';
    if (categoryTab === 'opening') return 'Tìm combo hướng mở...';
    return 'Tìm kiếm combo...';
  }, [categoryTab]);

  const isComboView = categoryTab !== 'individual';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 text-xs">

      {/* ── Header filter bar ── */}
      <div className="bg-white border-b border-slate-200 shrink-0">

        {/* Category tabs */}
        <div className="flex items-center px-3 pt-2 gap-0.5 overflow-x-auto no-scrollbar">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => { setCategoryTab(tab.value); setBrandFilter('all'); }}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                categoryTab === tab.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}
              <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
                categoryTab === tab.value ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
              }`}>
                {countMap[tab.value]}
              </span>
            </button>
          ))}

          {/* Phụ kiện lẻ — separated */}
          <button
            type="button"
            onClick={() => setCategoryTab('individual')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ml-auto ${
              categoryTab === 'individual'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-emerald-600/70 hover:text-emerald-600'
            }`}
          >
            <Package size={12} />
            Phụ kiện lẻ
            <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
              categoryTab === 'individual' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
            }`}>
              {accessories.length}
            </span>
          </button>
        </div>

        {/* Brand chips + search — only for combo views */}
        {isComboView && (
          <div className="px-3 pb-2.5 pt-1.5 flex flex-col gap-2">
            {/* Brand filter pills */}
            {dynamicBrandFilters.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setBrandFilter('all')}
                  className={`shrink-0 h-6 px-2.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    brandFilter === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả
                </button>
                {dynamicBrandFilters.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => setBrandFilter(brandFilter === brand ? 'all' : brand)}
                    className={`shrink-0 h-6 px-2.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      brandFilter === brand
                        ? 'bg-slate-800 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Scrollable body — 2 cột ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── CỘT TRÁI: Kho combo / phụ kiện lẻ ── */}
        <div className="flex-1 overflow-y-auto border-r border-slate-200 min-w-0">

          {categoryTab === 'individual' ? (
            <div className="p-3">
              <IndividualAccessoriesView
                accessories={accessories}
                selectedAccessories={selectedAccessories}
                onUpdateAccessoryQty={onUpdateAccessoryQty}
                onSetAccessoryQty={onSetAccessoryQty}
              />
            </div>
          ) : (
            <div className="p-3 flex flex-col gap-3">
              {/* Count row */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>
                  {filteredCombos.length} bộ combo khả dụng
                  {brandFilter !== 'all' && (
                    <span className="text-primary ml-1">· {brandFilter}</span>
                  )}
                </span>
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="text-rose-400 hover:text-rose-600 cursor-pointer"
                  >
                    Xóa tìm kiếm
                  </button>
                )}
              </div>

              {filteredCombos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
              ) : (
                <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Boxes size={20} className="text-slate-300" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Không có combo phù hợp</p>
                  <p className="text-[11px] text-slate-400">Thử bỏ bộ lọc hoặc tìm kiếm khác</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── CỘT PHẢI: Chi tiết đã chọn ── */}
        <div className="flex-1 overflow-y-auto bg-white min-w-0">
          <div className="p-3">
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
      </div>

      {/* ── Footer summary ── */}
      <div className="bg-white border-t border-slate-200 px-4 py-2.5 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[11px]">Đã chọn</span>
          {selectedComboIds.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
              {selectedComboIds.length} Combo
            </span>
          )}
          {totalIndividualCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
              {totalIndividualCount} Phụ kiện rời
            </span>
          )}
          {selectedComboIds.length === 0 && totalIndividualCount === 0 && (
            <span className="text-[11px] text-slate-400 italic">Chưa có gì</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500">Tạm tính:</span>
          <span className={`font-bold text-sm tabular-nums ${totalAmount > 0 ? 'text-primary' : 'text-slate-400'}`}>
            {totalAmount > 0 ? `${totalAmount.toLocaleString('vi-VN')} đ` : '0 đ'}
          </span>
        </div>
      </div>
    </div>
  );
};
