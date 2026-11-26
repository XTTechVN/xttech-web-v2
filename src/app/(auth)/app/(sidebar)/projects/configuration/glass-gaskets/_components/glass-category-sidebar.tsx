'use client';

import React, { useMemo } from 'react';
import type { GlassCategory } from '@/types';
import { ShieldCheck, Layers } from 'lucide-react';

export type MaterialTypeFilter = 'all' | 'glass' | 'panel' | 'screen_mesh';
export type GlassGasketCategoryFilter = 'all' | number;

interface GlassCategorySidebarProps {
  categories: GlassCategory[];
  selectedType: MaterialTypeFilter;
  onSelectType: (type: MaterialTypeFilter) => void;
  selectedCategory: GlassGasketCategoryFilter;
  onSelectCategory: (cat: GlassGasketCategoryFilter) => void;
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
  if (code.includes('luoi') || code.includes('mesh') || code.includes('screen') || name.includes('lưới') || name.includes('inox')) {
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

// Thứ tự ưu tiên theo loại chính: Kính -> Tấm -> Lưới
const TYPE_PRIORITY: Record<'glass' | 'panel' | 'screen_mesh', number> = { glass: 1, panel: 2, screen_mesh: 3 };

export function GlassCategorySidebar({
  categories,
  selectedType,
  onSelectType,
  selectedCategory,
  onSelectCategory,
  glassCount = 0,
  glassTypeCounts,
}: GlassCategorySidebarProps) {
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

  return (
    <div className="relative w-full shrink-0 rounded-block border border-slate-200 bg-white md:min-h-64 md:w-48 lg:w-52"><div className="flex flex-row gap-2 overflow-x-auto p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:absolute md:inset-0 md:flex-col md:overflow-x-hidden md:overflow-y-auto">
      {/* 1. Tiêu đề & Bộ lọc 3 loại chính */}
      <div className="hidden md:block">
        <div className="px-1 py-1 mb-2 text-xs font-semibold text-slate-500">Loại vật liệu chính</div>
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100/90 rounded-control">
          {TYPE_TABS.map((tab) => {
            const isActive = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onSelectType(tab.id);
                  onSelectCategory('all');
                }}
                className={`py-1.5 px-1 rounded-control text-[11px] font-semibold transition-all cursor-pointer text-center truncate ${
                  isActive ? 'bg-white text-primary shadow-2xs' : 'text-slate-600 hover:text-slate-900'
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
      <div className="hidden md:block px-1 pt-2 text-[11px] font-semibold text-slate-400">Chủng loại ({filteredCategories.length})</div>

      {/* Nút Xem tất cả trong loại */}
      <button
        type="button"
        onClick={() => onSelectCategory('all')}
        className={`flex items-center justify-between px-3 py-2 rounded-control text-xs font-semibold transition-all cursor-pointer shrink-0 md:w-full text-left ${
          selectedCategory === 'all' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
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
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center justify-between px-3 py-2 rounded-control text-xs font-semibold transition-all cursor-pointer shrink-0 md:w-full text-left ${
                isSelected ? 'bg-primary text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
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

        {filteredCategories.length === 0 && <div className="text-[11px] text-slate-400 italic px-3 py-2">Chưa có chủng loại nào trong mục này</div>}
      </div>
    </div>
    </div>
  );
}
