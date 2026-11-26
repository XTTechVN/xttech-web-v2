'use client';

import React, { useRef } from 'react';
import { FileText, ImagePlus, RotateCcw, Settings2, Sparkles, Trash2 } from 'lucide-react';
import { Button, Input, Select, Switch, Textarea } from '@/components';
import { NEWS_CATEGORY_OPTIONS, NEWS_STATUS_OPTIONS } from '@/config';
import type { NewsCategory, NewsStatus } from '@/types';

export interface NewsFormSidebarProps {
  title: string;
  onTitleChange: (title: string) => void;
  titleError?: string;
  slug: string;
  isCustomSlug: boolean;
  onCustomSlugChange: (slug: string) => void;
  onResetSlug: () => void;
  summary: string;
  onSummaryChange: (summary: string) => void;
  category: NewsCategory;
  onCategoryChange: (category: NewsCategory) => void;
  status: NewsStatus;
  onStatusChange: (status: NewsStatus) => void;
  isFeatured: boolean;
  onFeaturedChange: (featured: boolean) => void;
  thumbnailPreview: string;
  onSelectCoverFile: (file: File) => void;
  onRemoveCover: () => void;
}

export function NewsFormSidebar({
  title,
  onTitleChange,
  titleError,
  slug,
  isCustomSlug,
  onCustomSlugChange,
  onResetSlug,
  summary,
  onSummaryChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  isFeatured,
  onFeaturedChange,
  thumbnailPreview,
  onSelectCoverFile,
  onRemoveCover,
}: NewsFormSidebarProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onSelectCoverFile(file);
    e.target.value = '';
  };

  return (
    <div className="lg:col-span-4 lg:h-full lg:overflow-y-auto lg:pr-1 space-y-3.5">
      {/* Khối 1: Thông tin chung & SEO */}
      <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-3">
        <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200/80">
          <FileText className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Thông tin chung & SEO
          </span>
        </div>

        <Input
          label="Tiêu đề bài viết *"
          placeholder="Nhập tiêu đề bài viết tin tức, sự kiện hoặc công trình..."
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          error={titleError}
          fullWidth
        />

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-medium text-gray-700">Đường dẫn tĩnh (Slug SEO)</label>
            {isCustomSlug && title.trim() && (
              <button
                type="button"
                onClick={onResetSlug}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                title="Sinh lại đường dẫn tự động từ tiêu đề bài viết"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Tạo lại từ tiêu đề</span>
              </button>
            )}
          </div>
          <Input
            placeholder="tu-dong-sinh-tu-tieu-de"
            value={slug}
            onChange={(e) => onCustomSlugChange(e.target.value)}
            className="font-mono text-xs"
            fullWidth
          />
        </div>

        <Textarea
          label="Tóm tắt ngắn (Sapo hiển thị ở danh sách)"
          placeholder="Nhập đoạn tóm tắt ngắn gọn 2-3 câu thu hút người đọc..."
          rows={3}
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          fullWidth
        />
      </div>

      {/* Khối 2: Phân loại & Xuất bản */}
      <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-3">
        <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200/80">
          <Settings2 className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Phân loại & Xuất bản
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          <Select
            label="Chuyên mục bài viết *"
            options={NEWS_CATEGORY_OPTIONS}
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as NewsCategory)}
            fullWidth
          />

          <Select
            label="Trạng thái xuất bản *"
            options={NEWS_STATUS_OPTIONS}
            value={status}
            onChange={(e) => onStatusChange(e.target.value as NewsStatus)}
            fullWidth
          />
        </div>

        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Ghim bài viết tiêu điểm</span>
          </div>
          <Switch checked={isFeatured} onChange={(e) => onFeaturedChange(e.target.checked)} />
        </div>
      </div>

      {/* Khối 3: Ảnh bìa bài viết (Thumbnail) */}
      <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">Ảnh bìa bài viết (Thumbnail)</span>
          {thumbnailPreview && (
            <button
              type="button"
              onClick={onRemoveCover}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Gỡ ảnh
            </button>
          )}
        </div>

        {thumbnailPreview ? (
          <div className="relative aspect-16/10 rounded-lg overflow-hidden border border-slate-200 bg-white">
            <img
              src={thumbnailPreview}
              alt="Thumbnail preview"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="w-full aspect-16/10 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors flex flex-col items-center justify-center gap-1.5 text-primary cursor-pointer p-3"
          >
            <ImagePlus className="w-6 h-6" />
            <span className="text-xs font-semibold">Tải lên ảnh bìa đại diện</span>
            <span className="text-[11px] text-slate-500">JPG, PNG, WEBP (Tỷ lệ 16:10)</span>
          </button>
        )}

        {thumbnailPreview && (
          <Button
            type="button"
            variant="outline"
            size="xs"
            fullWidth
            onClick={() => coverInputRef.current?.click()}
          >
            Đổi ảnh bìa khác
          </Button>
        )}

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
