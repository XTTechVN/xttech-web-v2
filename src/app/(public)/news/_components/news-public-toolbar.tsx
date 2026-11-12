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

export function NewsPublicToolbar({ searchInput, onSearchChange, selectedCategory, onSelectCategory }: NewsPublicToolbarProps) {
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
            Cập nhật công nghệ, công trình tiêu biểu & <span className="text-primary">giải pháp nhôm kính hiện đại</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Khám phá các bài viết chuyên sâu về kỹ thuật gia công cửa nhôm, xu hướng kiến trúc mặt dựng, hoạt động doanh nghiệp và các dự án thực tế
            từ đội ngũ kỹ sư XTTECH.
          </p>
        </div>

        {/* Hàng ngang đồng bộ: Trái là Tab Chuyên mục | Phải là Ô tìm kiếm (Cùng 1 hàng, thẳng hàng tuyệt đối, hiển thị trọn vẹn đủ chữ) */}
        <div className="mt-8 flex items-center justify-between gap-3 sm:gap-4 border-b border-slate-200/80">
          {/* Danh sách Tabs chuyên mục: gap tối ưu để đủ chữ "Khuyến mãi và Sự kiện" không bao giờ bị cắt xén */}
          <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-3.5 xl:gap-4 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-w-0 flex-1">
            <button
              type="button"
              onClick={() => onSelectCategory(undefined)}
              className={`relative pb-3 pt-2 text-xs sm:text-[13px] transition-colors cursor-pointer shrink-0 border-b-2 -mb-px ${
                !selectedCategory ? 'border-primary text-slate-900 font-bold' : 'border-transparent text-slate-600 hover:text-slate-900 font-medium'
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
                  className={`relative pb-3 pt-2 text-xs sm:text-[13px] transition-colors cursor-pointer shrink-0 border-b-2 -mb-px ${
                    isActive ? 'border-primary text-slate-900 font-bold' : 'border-transparent text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Ô tìm kiếm: Kích thước tinh gọn, căn thẳng hàng tâm theo chiều dọc với hàng tab */}
          <div className="relative w-36 sm:w-44 md:w-48 lg:w-52 shrink-0 pb-1.5 -mb-px">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm..."
              fullWidth
              className="pl-8 pr-7 h-8 text-xs bg-white/90 border-slate-200 focus:bg-white"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Xóa tìm kiếm"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer z-10"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
