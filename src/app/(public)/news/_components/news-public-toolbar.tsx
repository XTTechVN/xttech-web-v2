'use client';

import React from 'react';
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Clock,
  Eye,
  Flame,
  Layers,
  Search,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { NEWS_CATEGORY_OPTIONS } from '@/config';
import type { NewsCategory } from '@/types';

export type PublicNewsSortMode = 'latest' | 'featured' | 'popular' | 'hot';

export interface NewsPublicToolbarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  selectedCategory?: NewsCategory;
  onSelectCategory: (category?: NewsCategory) => void;
  sortMode: PublicNewsSortMode;
  onSelectSortMode: (mode: PublicNewsSortMode) => void;
  sortOrder?: 'asc' | 'desc';
  onToggleSortOrder?: () => void;
  totalCount?: number;
}

const SORT_TABS: Array<{
  mode: PublicNewsSortMode;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  activeClass: string;
}> = [
  {
    mode: 'latest',
    label: 'Mới nhất',
    shortLabel: 'Mới nhất',
    icon: <Clock className="w-3.5 h-3.5" />,
    activeClass: 'bg-primary text-white shadow-xs',
  },
  {
    mode: 'featured',
    label: 'Bài viết nổi bật',
    shortLabel: 'Nổi bật',
    icon: <Star className="w-3.5 h-3.5" />,
    activeClass: 'bg-amber-500 text-white shadow-xs',
  },
  {
    mode: 'popular',
    label: 'Nhiều người xem',
    shortLabel: 'Xem nhiều',
    icon: <Eye className="w-3.5 h-3.5" />,
    activeClass: 'bg-sky-600 text-white shadow-xs',
  },
  {
    mode: 'hot',
    label: 'Tin Hot / Yêu thích',
    shortLabel: 'Tin Hot',
    icon: <Flame className="w-3.5 h-3.5" />,
    activeClass: 'bg-rose-600 text-white shadow-xs',
  },
];

export function NewsPublicToolbar({
  searchInput,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  sortMode,
  onSelectSortMode,
  sortOrder = 'desc',
  onToggleSortOrder,
  totalCount,
}: NewsPublicToolbarProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/4 to-white border-b border-slate-200/80 pt-10 pb-8 sm:pt-14 sm:pb-10">
      {/* Hiệu ứng nền trang trí đồng bộ hệ sinh thái XTTech */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Chuyên trang Tin tức & Kiến thức Nhôm Kính XTTECH</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Cập nhật công nghệ, công trình tiêu biểu &{' '}
              <span className="text-primary">giải pháp nhôm kính hiện đại</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Khám phá các bài viết chuyên sâu về kỹ thuật gia công cửa nhôm, xu hướng kiến trúc mặt
              dựng, hoạt động doanh nghiệp và các dự án thực tế từ đội ngũ kỹ sư XTTECH.
            </p>
          </div>

          {typeof totalCount === 'number' && (
            <div className="hidden lg:flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs shrink-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  Kho bài viết
                </p>
                <p className="text-sm font-bold text-slate-900">
                  <span className="font-mono tabular-nums text-primary">{totalCount}</span> bài xuất
                  bản
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Thanh Cờ lọc (Mới nhất / Nổi bật / Nhiều người xem / Tin Hot) & Tìm kiếm */}
        <div className="mt-7 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              {SORT_TABS.map((tab) => {
                const isActive = sortMode === tab.mode;
                return (
                  <button
                    key={tab.mode}
                    type="button"
                    onClick={() => onSelectSortMode(tab.mode)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? tab.activeClass
                        : 'text-slate-600 hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {onToggleSortOrder && (
              <button
                type="button"
                onClick={onToggleSortOrder}
                title={
                  sortOrder === 'asc'
                    ? 'Đang xếp: Cũ nhất trước (Nhấn để đổi sang Mới nhất trước)'
                    : 'Đang xếp: Mới nhất trước (Nhấn để đổi sang Cũ nhất trước)'
                }
                className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-600 hover:text-primary hover:border-primary/40 shadow-2xs transition-all cursor-pointer"
              >
                {sortOrder === 'asc' ? (
                  <>
                    <ArrowUpNarrowWide className="w-4 h-4 text-primary" />
                    <span className="hidden sm:inline">Cũ nhất</span>
                  </>
                ) : (
                  <>
                    <ArrowDownWideNarrow className="w-4 h-4 text-primary" />
                    <span className="hidden sm:inline">Mới nhất</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="relative w-full lg:w-88 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm bài viết, kỹ thuật nhôm kính, dự án..."
              className="w-full h-10.5 pl-10 pr-9 text-sm bg-white border border-slate-200/90 rounded-full shadow-2xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 transition-all"
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

        {/* Bộ lọc Chuyên mục (Giữ nguyên toàn bộ chuyên mục cấu hình sẵn) */}
        <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 hidden sm:inline">
            Chuyên mục:
          </span>
          <button
            type="button"
            onClick={() => onSelectCategory(undefined)}
            className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
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
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
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
