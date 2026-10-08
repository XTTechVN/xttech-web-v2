'use client';

import React, { useState, useMemo } from 'react';
import { AccessoryCombo, Accessory, SelectedAccessoryItem, Brand } from '@/types';
import { Search, Boxes, Package, Plus } from 'lucide-react';
import { ComboCategoryTab, detectComboCategory, detectComboBrand } from './accessories/types';
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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/60 text-xs">
      {/* ── Header filter bar ── */}
      <div className="bg-white border-b border-slate-200/90 shadow-2xs shrink-0">
        {/* Category tabs */}
        <div className="flex items-center px-4 pt-2.5 pb-2 gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORY_TABS.map((tab) => {
            const isActive = categoryTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setCategoryTab(tab.value);
                  setBrandFilter('all');
                }}
                className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/25 font-bold shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70 hover:text-slate-900'
                }`}
              >
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] rounded-full px-1.5 py-0.2 font-mono font-bold ${
                    isActive ? 'bg-primary/20 text-primary' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {countMap[tab.value]}
                </span>
              </button>
            );
          })}

          {/* Phụ kiện lẻ — separated */}
          <button
            type="button"
            onClick={() => setCategoryTab('individual')}
            className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ml-auto ${
              categoryTab === 'individual'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold shadow-2xs'
                : 'bg-white text-emerald-700/80 hover:bg-emerald-50/60 border border-emerald-200/60'
            }`}
          >
            <Package size={13} className="shrink-0" />
            <span>Phụ kiện lẻ</span>
            <span
              className={`text-[10px] rounded-full px-1.5 py-0.2 font-mono font-bold ${
                categoryTab === 'individual' ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {accessories.length}
            </span>
          </button>
        </div>

        {/* Brand chips + search — only for combo views */}
        {isComboView && (
          <div className="px-4 pb-3 pt-1 border-t border-slate-100 flex flex-col gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-8 h-8.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all shadow-2xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Brand filter pills */}
            {dynamicBrandFilters.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                <span className="text-[11px] font-medium text-slate-400 shrink-0">Hãng:</span>
                <button
                  type="button"
                  onClick={() => setBrandFilter('all')}
                  className={`shrink-0 h-6 px-2.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    brandFilter === 'all'
                      ? 'bg-slate-200 text-slate-900 border border-slate-300'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                  }`}
                >
                  Tất cả ({dynamicBrandFilters.length})
                </button>
                {dynamicBrandFilters.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => setBrandFilter(brandFilter === brand ? 'all' : brand)}
                    className={`shrink-0 h-6 px-2.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                      brandFilter === brand
                        ? 'bg-primary/10 text-primary border border-primary/30 font-semibold shadow-2xs'
                        : 'bg-white border border-slate-200/70 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Scrollable body — 2 cột ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* ── CỘT TRÁI: Kho combo / phụ kiện lẻ ── */}
        <div className="lg:w-[58%] xl:w-[60%] overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-200/90 min-w-0 bg-slate-50/50">
          {categoryTab === 'individual' ? (
            <div className="p-3.5">
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
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse min-w-[520px]">
                      <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10">
                        <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                          <th className="py-2.5 px-3.5">Mã & Tên combo</th>
                          <th className="py-2.5 px-3">Phân loại</th>
                          <th className="py-2.5 px-2.5 text-center">Số món</th>
                          <th className="py-2.5 px-3 text-right">Đơn giá</th>
                          <th className="py-2.5 px-3 text-center w-28">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {filteredCombos.map((combo) => {
                          const isSelected = selectedComboIds.includes(combo.id);
                          const isExpanded = expandedComboId === combo.id;
                          const cat = detectComboCategory(combo);
                          const catLabel = cat === 'frame' ? 'Khung' : cat === 'sash' ? 'Cánh' : 'Hướng mở';
                          const itemsCount = combo.comboItems?.length || 0;
                          const brand = detectComboBrand(combo, brands);

                          return (
                            <React.Fragment key={combo.id}>
                              <tr
                                className={`transition-colors ${
                                  isSelected ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-slate-50/80'
                                }`}
                              >
                                <td className="py-2.5 px-3.5">
                                  <div className="font-semibold text-slate-900">{combo.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                                    <span>{combo.code || '—'}</span>
                                    {brand && brand !== 'Khác' && (
                                      <span className="text-primary font-sans font-medium">· {brand}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-[11px]">
                                  <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/60">
                                    {catLabel}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedComboId(isExpanded ? null : combo.id)}
                                    className="text-[11px] font-medium text-slate-600 hover:text-primary inline-flex items-center gap-0.5 cursor-pointer underline-offset-2 hover:underline"
                                    title="Xem chi tiết các phụ kiện trong combo"
                                  >
                                    <span>{itemsCount} món</span>
                                  </button>
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                                  {combo.totalComboPrice
                                    ? `${combo.totalComboPrice.toLocaleString('vi-VN')} đ`
                                    : '-'}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  {isSelected ? (
                                    <button
                                      type="button"
                                      onClick={() => onToggleCombo(combo.id)}
                                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 mx-auto"
                                    >
                                      <span>Bỏ chọn</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => onToggleCombo(combo.id)}
                                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-primary hover:text-white text-slate-700 font-semibold text-[11px] transition-all cursor-pointer flex items-center gap-1 mx-auto shadow-2xs"
                                    >
                                      <Plus size={11} />
                                      <span>Thêm</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                              {/* Dòng mở rộng chi tiết các món trong combo */}
                              {isExpanded && (
                                <tr className="bg-slate-50/70 border-b border-slate-200/60">
                                  <td colSpan={5} className="py-2 px-4">
                                    <div className="text-[11px] space-y-1 py-1">
                                      <div className="font-semibold text-slate-600 text-[10px] uppercase tracking-wider mb-1">
                                        Chi tiết {itemsCount} vật tư thuộc bộ:
                                      </div>
                                      {combo.comboItems && combo.comboItems.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                          {combo.comboItems.map((item, idx) => (
                                            <div
                                              key={idx}
                                              className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200/70 text-slate-700"
                                            >
                                              <span className="truncate pr-2">
                                                {idx + 1}. {item.accessoryName || item.accessoryCode || `Phụ kiện #${item.accessoryId}`}
                                              </span>
                                              <span className="font-mono text-slate-500 font-medium shrink-0">
                                                ×{item.quantity} {item.unit || ''}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-slate-400 italic">Chưa có chi tiết vật tư</div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
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
