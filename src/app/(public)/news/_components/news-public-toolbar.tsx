'use client';

import React from 'react';
import { Clock, Eye, Heart, Search, Sparkles, X } from 'lucide-react';
import { NEWS_CATEGORY_OPTIONS } from '@/config';
import type { NewsCategory } from '@/types';

export type PublicNewsSortMode = 'latest' | 'popular' | 'hot';

export interface NewsPublicToolbarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  selectedCategory?: NewsCategory;
  onSelectCategory: (category?: NewsCategory) => void;
  sortMode: PublicNewsSortMode;
  onSelectSortMode: (mode: PublicNewsSortMode) => void;
}

const SORT_TABS: Array<{
  mode: PublicNewsSortMode;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    mode: 'latest',
    label: 'Mới nhất',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  {
    mode: 'popular',
    label: 'Phổ biến nhất (Nhiều lượt xem)',
    icon: <Eye className="w-3.5 h-3.5" />,
  },
  {
    mode: 'hot',
    label: 'Nổi bật / Yêu thích nhất',
    icon: <Heart className="w-3.5 h-3.5" />,
  },
];

export function NewsPublicToolbar({
  searchInput,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  sortMode,
  onSelectSortMode,
}: NewsPublicToolbarProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/8 via-primary/4 to-transparent border-b border-primary/15 pt-10 pb-10 sm:pt-14 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chuyên trang Tin tức & Kiến thức Nhôm Kính XTTECH</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Cập nhật công nghệ, công trình tiêu biểu & giải pháp nhôm kính hiện đại
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Khám phá các bài viết chuyên sâu về kỹ thuật gia công cửa nhôm, xu hướng kiến trúc mặt
            dựng, hoạt động doanh nghiệp và các dự án thực tế từ đội ngũ kỹ sư XTTECH.
          </p>
        </div>

        {/* Thanh Sắp xếp (Mới nhất / Phổ biến nhất / Yêu thích nhất) & Tìm kiếm */}
        <div className="mt-7 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white border border-slate-200 shadow-2xs w-fit">
            {SORT_TABS.map((tab) => {
              const isActive = sortMode === tab.mode;
              return (
                <button
                  key={tab.mode}
                  type="button"
                  onClick={() => onSelectSortMode(tab.mode)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-slate-600 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm bài viết, chủ đề..."
              className="w-full h-10 pl-10 pr-9 text-sm bg-white border border-slate-200 rounded-full outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Xóa tìm kiếm"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Bộ lọc Chuyên mục */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectCategory(undefined)}
            className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              !selectedCategory
                ? 'bg-primary text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/40 hover:text-primary'
            }`}
          >
            Tất cả chuyên mục
          </button>
          {NEWS_CATEGORY_OPTIONS.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => onSelectCategory(cat.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/40 hover:text-primary'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
