'use client';

import React, { useMemo } from 'react';
import type { GlassCategory } from '@/types';
import { ShieldCheck, Wrench, Layers } from 'lucide-react';

export type MaterialTypeFilter = 'all' | 'glass' | 'panel' | 'screen_mesh';
export type GlassGasketCategoryFilter = 'all' | 'gaskets' | number;

interface GlassCategorySidebarProps {
  categories: GlassCategory[];
  selectedType: MaterialTypeFilter;
  onSelectType: (type: MaterialTypeFilter) => void;
  selectedCategory: GlassGasketCategoryFilter;
  onSelectCategory: (cat: GlassGasketCategoryFilter) => void;
  gasketCount?: number;
  glassCount?: number;
  glassTypeCounts?: {
    glass: number;
    panel: number;
    screen_mesh: number;
  };
}

// Helper xác định materialType của category (tương thích cả khi DB chưa set hoặc set qua code/name)
export function getCategoryMaterialType(cat: GlassCategory): 'glass' | 'panel' | 'screen_mesh' {
  if (cat.materialType) return cat.materialType;
  const code = (cat.code || '').toLowerCase();
  const name = (cat.name || '').toLowerCase();

  // Nhận diện Lưới
  if (
    code.includes('luoi') ||
    code.includes('mesh') ||
    code.includes('screen') ||
    name.includes('lưới') ||
    name.includes('inox')
  ) {
    return 'screen_mesh';
  }

  // Nhận diện Tấm / Panel / Pano / Tôn / Composite
  if (
    code.includes('panel') ||
    code.includes('tam') ||
    code.includes('ton') ||
    code.includes('composite') ||
    code.includes('duc') ||
    name.includes('panel') ||
    name.includes('tấm') ||
    name.includes('pano') ||
    name.includes('composite') ||
    name.includes('tôn') ||
    name.includes('đúc') ||
    name.includes('nhân tạo')
  ) {
    return 'panel';
  }

  return 'glass';
}

export function GlassCategorySidebar({
  categories,
  selectedType,
  onSelectType,
  selectedCategory,
  onSelectCategory,
  gasketCount = 0,
  glassCount = 0,
  glassTypeCounts,
}: GlassCategorySidebarProps) {
  // Thứ tự ưu tiên theo loại chính: Kính -> Tấm -> Lưới
  const TYPE_PRIORITY: Record<'glass' | 'panel' | 'screen_mesh', number> = {
    glass: 1,
    panel: 2,
    screen_mesh: 3,
  };

  // Sắp xếp nhóm chủng loại ở FE: 1 theo loại -> 2 theo tên A-Z
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const typeA = getCategoryMaterialType(a);
      const typeB = getCategoryMaterialType(b);
      const priorityDiff = TYPE_PRIORITY[typeA] - TYPE_PRIORITY[typeB];
      if (priorityDiff !== 0) return priorityDiff;
      return (a.name || '').localeCompare(b.name || '', 'vi', { sensitivity: 'base' });
    });
  }, [categories]);

  // Lọc category theo loại chính đang chọn
  const filteredCategories = useMemo(() => {
    if (selectedType === 'all') return sortedCategories;
    return sortedCategories.filter((c) => getCategoryMaterialType(c) === selectedType);
  }, [sortedCategories, selectedType]);

  const TYPE_TABS: Array<{ id: MaterialTypeFilter; label: string; count?: number }> = [
    { id: 'all', label: 'Tất cả', count: glassCount },
    { id: 'glass', label: 'Kính', count: glassTypeCounts?.glass },
    { id: 'panel', label: 'Tấm', count: glassTypeCounts?.panel },
    { id: 'screen_mesh', label: 'Lưới', count: glassTypeCounts?.screen_mesh },
  ];

  const isGasketActive = selectedCategory === 'gaskets';

  return (
    <div className="w-full md:w-60 lg:w-64 shrink-0 bg-white border-b md:border-b-0 md:border-r border-slate-200 rounded-none p-3 flex flex-row md:flex-col gap-2 shadow-none sticky top-0 z-10 md:h-[calc(100vh-105px)] overflow-x-auto md:overflow-x-hidden md:overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* 1. Tiêu đề & Bộ lọc 3 loại chính */}
      <div className="hidden md:block">
        <div className="px-1 py-1 mb-2 text-xs font-semibold text-slate-500">
          Loại vật liệu chính
        </div>
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100/90 rounded-lg">
          {TYPE_TABS.map((tab) => {
            const isActive = !isGasketActive && selectedType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onSelectType(tab.id);
                  onSelectCategory('all');
                }}
                className={`py-1.5 px-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer text-center truncate ${
                  isActive
                    ? 'bg-white text-primary shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={tab.label}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Mục: Tất cả quy cách thuộc loại đang chọn */}
      <div className="hidden md:block px-1 pt-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        Chủng loại ({filteredCategories.length})
      </div>

      {/* Nút Xem tất cả trong loại */}
      <button
        type="button"
        onClick={() => onSelectCategory('all')}
        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 md:w-full text-left ${
          !isGasketActive && selectedCategory === 'all'
            ? 'bg-primary text-white shadow-xs'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck size={15} className="shrink-0" />
          <span className="truncate">
            {selectedType === 'glass'
              ? 'Tất cả loại kính'
              : selectedType === 'panel'
              ? 'Tất cả loại tấm'
              : selectedType === 'screen_mesh'
              ? 'Tất cả loại lưới'
              : 'Tất cả quy cách tấm'}
          </span>
        </div>
      </button>

      {/* 3. Danh sách các Category thuộc loại chính */}
      <div className="flex flex-row md:flex-col gap-1 min-w-0">
        {filteredCategories.map((cat) => {
          const isSelected = !isGasketActive && selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 md:w-full text-left ${
                isSelected
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title={cat.description || cat.name}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Layers size={14} className="shrink-0 opacity-80" />
                <span className="truncate">{cat.name}</span>
              </div>
            </button>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="text-[11px] text-slate-400 italic px-3 py-2">
            Chưa có chủng loại nào trong mục này
          </div>
        )}
      </div>

      <div className="hidden md:block my-1 border-t border-slate-100" />
      <div className="hidden md:block px-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        Vật tư chèn & ron
      </div>

      {/* 4. Mục: Gioăng ron & Keo phụ trợ */}
      <button
        type="button"
        onClick={() => onSelectCategory('gaskets')}
        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 md:w-full text-left ${
          isGasketActive
            ? 'bg-primary text-white shadow-xs'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Wrench size={15} className="shrink-0" />
          <span className="truncate">Gioăng ron & Keo</span>
        </div>
        {gasketCount > 0 && (
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ml-1.5 ${
              isGasketActive
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {gasketCount}
          </span>
        )}
      </button>
    </div>
  );
}
