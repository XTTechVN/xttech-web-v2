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
    <section className="relative overflow-hidden bg-linear-to-b from-primary/10 via-primary/4 to-white border-b border-slate-200/80 pt-10 sm:pt-14">
      {/* Hiệu ứng nền trang trí đồng bộ hệ sinh thái XTTech */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-full max-w-lg -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="w-full px-4 sm:px-8 lg:px-32">
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

          <div className="relative w-full lg:w-96 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm bài viết, kỹ thuật nhôm kính, dự án..."
              fullWidth
              className="pl-9 pr-9"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Xóa tìm kiếm"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Bộ lọc Chuyên mục thiết kế dạng Tab gạch chân tối giản */}
        <div className="mt-8 flex flex-wrap items-center gap-6 sm:gap-8">
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
      </div>
    </section>
  );
}
