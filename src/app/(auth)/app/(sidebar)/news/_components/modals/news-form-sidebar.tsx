'use client';

import React, { useRef } from 'react';
import { ImagePlus, Sparkles, Trash2 } from 'lucide-react';
import { Button, Select, Switch } from '@/components';
import { NEWS_CATEGORY_OPTIONS, NEWS_STATUS_OPTIONS } from '@/config';
import type { NewsCategory, NewsStatus } from '@/types';

export interface NewsFormSidebarProps {
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
    <div className="lg:col-span-4 space-y-4">
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
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

        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Ghim bài viết tiêu điểm</span>
          </div>
          <Switch checked={isFeatured} onChange={(e) => onFeaturedChange(e.target.checked)} />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
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
            <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="w-full aspect-16/10 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors flex flex-col items-center justify-center gap-2 text-primary cursor-pointer p-4"
          >
            <ImagePlus className="w-7 h-7" />
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
