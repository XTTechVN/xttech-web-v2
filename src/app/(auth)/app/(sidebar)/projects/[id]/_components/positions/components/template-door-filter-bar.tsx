'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Layers, Search, Star, Tag, X } from 'lucide-react';
import type { DoorSeries } from '@/types';
import { DOOR_TYPE_FILTERS, type BrandPillItem } from '../hooks/use-template-door-picker';

const MAX_VISIBLE_BRANDS = 10;
const VISIBLE_TYPE_COUNT = 7;

export interface TemplateDoorFilterBarProps {
  brandsList: BrandPillItem[];
  selectedBrandId: number | null;
  onSelectBrand: (id: number | null) => void;
  seriesList: DoorSeries[];
  selectedSeriesId: number | null;
  onSelectSeries: (id: number | null) => void;
  effectiveSeriesId: number | null;
  groupBySeries: boolean;
  onToggleGroupBySeries: (val: boolean) => void;
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
  typeCounts: Record<string, number>;
  search: string;
  onChangeSearch: (val: string) => void;
}

const pillClass = (active: boolean) =>
  `inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap ${
    active
      ? 'bg-primary text-white font-semibold shadow-2xs'
      : 'bg-slate-100 text-slate-600 font-medium hover:bg-slate-200/80 hover:text-slate-900'
  }`;

const moreBtnClass = (active: boolean) =>
  `inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
    active
      ? 'bg-primary text-white border-primary font-semibold shadow-2xs'
      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
  }`;

const menuItemClass = (active: boolean) =>
  `w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
    active ? 'text-primary font-semibold bg-primary/5' : 'text-slate-700'
  }`;

export function TemplateDoorFilterBar({
  brandsList,
  selectedBrandId,
  onSelectBrand,
  seriesList,
  selectedSeriesId,
  onSelectSeries,
  effectiveSeriesId,
  groupBySeries,
  onToggleGroupBySeries,
  selectedType,
  onSelectType,
  typeCounts,
  search,
  onChangeSearch,
}: TemplateDoorFilterBarProps) {
  const [openMenu, setOpenMenu] = useState<'brands' | 'series' | 'types' | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleBrands = brandsList.slice(0, MAX_VISIBLE_BRANDS);
  const hiddenBrands = brandsList.slice(MAX_VISIBLE_BRANDS);
  const selectedHiddenBrand = hiddenBrands.find((b) => b.id === selectedBrandId);

  const visibleTypes = DOOR_TYPE_FILTERS.slice(0, VISIBLE_TYPE_COUNT);
  const hiddenTypes = DOOR_TYPE_FILTERS.slice(VISIBLE_TYPE_COUNT);
  const selectedHiddenType = hiddenTypes.find((t) => t.value === selectedType);
  const activeSeries = seriesList.find((s) => s.id === selectedSeriesId);

  return (
    <div ref={barRef} className="px-4 py-3 border-b border-slate-200 bg-white space-y-2.5">
      {/* Hàng 1: Pills chọn Hãng nhôm */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-medium text-slate-400 mr-1 shrink-0">Hãng:</span>
        <button type="button" onClick={() => onSelectBrand(null)} className={pillClass(selectedBrandId === null)}>
          Tất cả
        </button>

        {visibleBrands.map((brand) => {
          const isSelected = selectedBrandId === brand.id;
          return (
            <button key={brand.id} type="button" onClick={() => onSelectBrand(brand.id)} className={pillClass(isSelected)}>
              <span>{brand.name}</span>
              {brand.isDefault && (
                <Star size={11} className={isSelected ? 'fill-amber-300 text-amber-300' : 'fill-amber-400 text-amber-400'} />
              )}
            </button>
          );
        })}

        {hiddenBrands.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'brands' ? null : 'brands')}
              className={moreBtnClass(Boolean(selectedHiddenBrand))}
            >
              <span>{selectedHiddenBrand ? selectedHiddenBrand.name : `Xem thêm (${hiddenBrands.length})`}</span>
              <ChevronDown size={12} />
            </button>
            {openMenu === 'brands' && (
              <div className="absolute left-0 top-full mt-1.5 w-52 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                {hiddenBrands.map((brand) => (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => {
                      onSelectBrand(brand.id);
                      setOpenMenu(null);
                    }}
                    className={menuItemClass(selectedBrandId === brand.id)}
                  >
                    <span className="truncate">{brand.name}</span>
                    {selectedBrandId === brand.id && <Check size={12} className="text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hàng 2: Tìm kiếm + Nút Serie */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm mẫu cửa..."
            value={search}
            onChange={(e) => onChangeSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-8 border border-slate-200 rounded-lg text-xs bg-slate-50/60 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-primary transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => onChangeSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'series' ? null : 'series')}
            className={`h-9 px-3.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
              groupBySeries || activeSeries
                ? 'bg-primary text-white border-primary shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Tag size={13} />
            <span>{activeSeries ? `Serie: ${activeSeries.code || activeSeries.name}` : 'Serie'}</span>
            <ChevronDown size={12} />
          </button>

          {openMenu === 'series' && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                  <Layers size={12} className="text-primary" />
                  Gom nhóm theo Serie
                </span>
                <input
                  type="checkbox"
                  checked={groupBySeries}
                  onChange={(e) => onToggleGroupBySeries(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                />
              </div>
              <div className="max-h-56 overflow-y-auto py-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelectSeries(null);
                    setOpenMenu(null);
                  }}
                  className={menuItemClass(selectedSeriesId === null)}
                >
                  <span>Tất cả Serie ({seriesList.length})</span>
                  {selectedSeriesId === null && <Check size={12} className="text-primary shrink-0" />}
                </button>
                {seriesList.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onSelectSeries(s.id);
                      setOpenMenu(null);
                    }}
                    className={menuItemClass(selectedSeriesId === s.id)}
                  >
                    <span className="truncate flex items-center gap-1">
                      <span>{s.name || s.code}</span>
                      {effectiveSeriesId === s.id && <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />}
                    </span>
                    {selectedSeriesId === s.id && <Check size={12} className="text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hàng 3: Pills lọc Loại cửa kèm số lượng */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {visibleTypes.map((type) => {
          const count = type.value ? typeCounts[type.value] || 0 : typeCounts.all || 0;
          return (
            <button
              key={type.value ?? 'all'}
              type="button"
              onClick={() => onSelectType(type.value)}
              className={pillClass(selectedType === type.value)}
            >
              {type.label} ({count})
            </button>
          );
        })}

        {hiddenTypes.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'types' ? null : 'types')}
              className={moreBtnClass(Boolean(selectedHiddenType))}
            >
              <span>
                {selectedHiddenType
                  ? `${selectedHiddenType.label} (${typeCounts[selectedHiddenType.value!] || 0})`
                  : `Xem thêm (${hiddenTypes.length})`}
              </span>
              <ChevronDown size={12} />
            </button>
            {openMenu === 'types' && (
              <div className="absolute left-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                {hiddenTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      onSelectType(type.value);
                      setOpenMenu(null);
                    }}
                    className={menuItemClass(selectedType === type.value)}
                  >
                    <span>{type.label} ({typeCounts[type.value!] || 0})</span>
                    {selectedType === type.value && <Check size={12} className="text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
