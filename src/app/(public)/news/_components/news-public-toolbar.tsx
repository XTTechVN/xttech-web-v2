'use client';

import React from 'react';
import { Search, Sparkles, X } from 'lucide-react';
import { Input } from '@/components';
import { NEWS_CATEGORY_OPTIONS } from '@/config';
import type { NewsCategory } from '@/types';

export interface NewsPublicToolbarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  selectedCategory?: NewsCategory;
  onSelectCategory: (category?: NewsCategory) => void;
}

export function NewsPublicToolbar({
  searchInput,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
}: NewsPublicToolbarProps) {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-primary/10 via-primary/4 to-white border-b border-slate-200/80 pt-8 sm:pt-10">
      {/* Hiệu ứng nền trang trí đồng bộ hệ sinh thái XTTech */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-full max-w-lg -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        {/* Khối tiêu đề giới thiệu */}
        <div className="max-w-3xl space-y-3">
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

        {/* Thanh ngang đồng bộ: Trái là Tab Chuyên mục gạch chân (1 dòng cuộn ngang trên mobile) | Phải là Ô tìm kiếm */}
        <div className="mt-7 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-5 sm:gap-7 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => onSelectCategory(undefined)}
              className={`relative pb-3.5 pt-2 text-sm transition-colors cursor-pointer shrink-0 border-b-2 -mb-px ${
                !selectedCategory
                  ? 'border-primary text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              Tất cả
            </button>
            {NEWS_CATEGORY_OPTIONS.map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => onSelectCategory(cat.value)}
                  className={`relative pb-3.5 pt-2 text-sm transition-colors cursor-pointer shrink-0 border-b-2 -mb-px ${
                    isActive
                      ? 'border-primary text-slate-900 font-semibold'
                      : 'border-transparent text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-80 xl:w-72 shrink-0 pb-2.5 xl:pb-1.5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 -mt-1 xl:-mt-0.5 pointer-events-none z-10" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm bài viết, dự án..."
              fullWidth
              className="pl-9 pr-8 h-9 text-xs sm:text-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Xóa tìm kiếm"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 -mt-1 xl:-mt-0.5 text-slate-400 hover:text-slate-600 cursor-pointer z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
