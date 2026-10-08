'use client';

import React from 'react';
import type { GlassCategory } from '@/types';
import { ShieldCheck, Wrench, Layers } from 'lucide-react';

export type GlassGasketCategoryFilter = 'all' | 'gaskets' | number;

interface GlassCategorySidebarProps {
  categories: GlassCategory[];
  selectedCategory: GlassGasketCategoryFilter;
  onSelectCategory: (cat: GlassGasketCategoryFilter) => void;
  gasketCount?: number;
  glassCount?: number;
}

export function GlassCategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  gasketCount = 0,
  glassCount = 0,
}: GlassCategorySidebarProps) {
  // Sắp xếp nhóm chủng loại theo sortOrder
  const sortedCategories = [...categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <div className="w-full md:w-56 lg:w-60 shrink-0 bg-white border-b md:border-b-0 md:border-r border-slate-200 rounded-none p-3 flex flex-row md:flex-col gap-1.5 shadow-none sticky top-0 z-10 md:h-[calc(100vh-105px)] overflow-x-auto md:overflow-x-hidden md:overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="hidden md:block px-2.5 py-1.5 mb-1 text-xs font-semibold text-slate-500">
        Phân loại vật tư tấm
      </div>

      {/* Mục: Tất cả kính / tấm */}
      <button
        type="button"
        onClick={() => onSelectCategory('all')}
        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 md:w-full text-left ${
          selectedCategory === 'all'
            ? 'bg-primary text-white shadow-xs'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck size={15} className="shrink-0" />
          <span className="truncate">Tất cả quy cách tấm</span>
        </div>
        {glassCount > 0 && (
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ml-1.5 ${
              selectedCategory === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {glassCount}
          </span>
        )}
      </button>

      {/* Từng Nhóm Chủng Loại Kính/Panel */}
      {sortedCategories.map((cat) => {
        const isSelected = selectedCategory === cat.id;

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

      <div className="hidden md:block my-2 border-t border-slate-100" />
      <div className="hidden md:block px-2.5 py-1 text-xs font-semibold text-slate-500">
        Vật tư chèn & ron
      </div>

      {/* Mục: Gioăng ron & Keo phụ trợ */}
      <button
        type="button"
        onClick={() => onSelectCategory('gaskets')}
        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 md:w-full text-left ${
          selectedCategory === 'gaskets'
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
              selectedCategory === 'gaskets'
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
