'use client';

import React, { useState } from 'react';
import { FileCode2 } from 'lucide-react';
import { Button, Modal, RichTextEditor, type InsertedMediaItem } from '@/components';
import { slugifyVietnamese } from '@/config';
import { createNewsArticle, updateNewsArticle } from '@/actions';
import { getFileUrl, sanitizeNewsHtml, showErrorToast, showSuccessToast } from '@/utils';
import type { NewsArticle, NewsCategory, NewsStatus } from '@/types';
import { NewsFormSidebar } from './news-form-sidebar';

export interface NewsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: NewsArticle | null;
  onSuccess: () => void;
}

interface PendingMediaEntry {
  tempId: string;
  file: File;
  previewUrl: string;
}

export function NewsFormModal({ isOpen, onClose, initialData, onSuccess }: NewsFormModalProps) {
  const isEditMode = Boolean(initialData);

  const [title, setTitle] = useState(() => initialData?.title || '');
  const [slug, setSlug] = useState(() => initialData?.slug || '');
  const [isCustomSlug, setIsCustomSlug] = useState(() => Boolean(initialData?.slug));
  const [category, setCategory] = useState<NewsCategory>(
    () => initialData?.category || 'company_news',
  );
  const [status, setStatus] = useState<NewsStatus>(() => initialData?.status || 'published');
  const [isFeatured, setIsFeatured] = useState(() => Boolean(initialData?.isFeatured));
  const [summary, setSummary] = useState(() => initialData?.summary || '');
  const [content, setContent] = useState(() => sanitizeNewsHtml(initialData?.content || ''));

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(
    () => getFileUrl(initialData?.thumbnailUrl) || '',
  );
  const [removeExistingThumbnail, setRemoveExistingThumbnail] = useState(false);
  const [pendingMediaList, setPendingMediaList] = useState<PendingMediaEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  const handleTitleChange = (nextTitle: string) => {
    setTitle(nextTitle);
    if (!isCustomSlug) setSlug(slugifyVietnamese(nextTitle));
    if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
  };

  const handleCustomSlugChange = (rawSlug: string) => {
    setIsCustomSlug(true);
    setSlug(slugifyVietnamese(rawSlug));
  };

  const handleResetSlug = () => {
    setIsCustomSlug(false);
    setSlug(slugifyVietnamese(title));
  };

  const handleSelectCoverFile = (file: File) => {
    setThumbnailFile(file);
    setRemoveExistingThumbnail(false);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleRemoveCover = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
    setRemoveExistingThumbnail(true);
  };

  const handleInsertMediaFiles = (files: File[]): InsertedMediaItem[] => {
    const inserted: InsertedMediaItem[] = [];
    const entries: PendingMediaEntry[] = [];

    files.forEach((file, idx) => {
      const tempId = `media-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`;
      const previewUrl = URL.createObjectURL(file);
      const mediaType: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';
      const defaultCaption = file.name.replace(/\.[^/.]+$/, '');
      inserted.push({ tempId, previewUrl, mediaType, defaultCaption });
      entries.push({ tempId, file, previewUrl });
    });

    setPendingMediaList((prev) => [...prev, ...entries]);
    return inserted;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const sanitizedContent = sanitizeNewsHtml(content.trim());

    const nextErrors: { title?: string; content?: string } = {};
    if (cleanTitle.length < 3) nextErrors.title = 'Tiêu đề bài viết phải có ít nhất 3 ký tự';

    const textOnly = sanitizedContent.replace(/<[^>]*>/g, '').trim();
    const hasMediaTag = /<(img|video|iframe)\b/i.test(sanitizedContent);
    if (!textOnly && !hasMediaTag) nextErrors.content = 'Vui lòng nhập nội dung bài viết';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      if (nextErrors.title) {
        showErrorToast(null, 'Vui lòng nhập Tiêu đề bài viết ở cột Thông tin chung bên phải.');
      }
      return;
    }

    const activeMedia = pendingMediaList.filter(
      (entry) =>
        sanitizedContent.includes(entry.tempId) || sanitizedContent.includes(entry.previewUrl),
    );
    const mediaTempIds = activeMedia.map((entry) => entry.tempId);
    const mediaFiles = activeMedia.map((entry) => entry.file);

    setIsSubmitting(true);
    try {
      const cleanSlug = slug.trim() || slugifyVietnamese(cleanTitle);
      const cleanSummary = summary.trim() || null;

      if (isEditMode && initialData) {
        await updateNewsArticle(
          initialData.id,
          {
            title: cleanTitle,
            slug: cleanSlug || null,
            summary: cleanSummary,
            content: sanitizedContent,
            category,
            status,
            isFeatured,
            thumbnailUrl: removeExistingThumbnail ? null : initialData.thumbnailUrl,
            mediaTempIds,
          },
          thumbnailFile,
          mediaFiles,
        );
        showSuccessToast('Đã cập nhật bài viết thành công!');
      } else {
        await createNewsArticle(
          {
            title: cleanTitle,
            slug: cleanSlug || null,
            summary: cleanSummary,
            content: sanitizedContent,
            category,
            status,
            isFeatured,
            mediaTempIds,
          },
          thumbnailFile,
          mediaFiles,
        );
        showSuccessToast('Đã đăng bài viết mới thành công!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      showErrorToast(err, 'Không thể lưu bài viết. Vui lòng kiểm tra lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      disabled={isSubmitting}
      size="xl"
      className="md:max-w-7xl md:w-[95vw] lg:h-[calc(100vh-3.5rem)]"
      bodyClassName="p-4 sm:p-5 overflow-y-auto lg:overflow-hidden flex flex-col"
      title={isEditMode ? 'Chỉnh sửa bài viết tin tức' : 'Đăng bài viết tin tức mới'}
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button variant="primary" size="sm" loading={isSubmitting} onClick={handleSubmit}>
            {isEditMode ? 'Lưu cập nhật' : 'Xuất bản / Lưu bài viết'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
          {/* Cột bên trái: Chỉ dành riêng cho Trình biên soạn nội dung */}
          <div className="lg:col-span-8 flex flex-col min-h-0 h-full space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
              <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                <FileCode2 className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Trình biên soạn nội dung bài viết (Hỗ trợ đổi màu chữ, màu nền, chèn Ảnh / Video /
                  YouTube) *
                </span>
              </label>

              <div className="flex items-center gap-3">
                {pendingMediaList.length > 0 && (
                  <span className="text-[11px] font-mono tabular-nums text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
                    Đã đính kèm {pendingMediaList.length} media mới
                  </span>
                )}
                {errors.content && (
                  <span className="text-xs font-semibold text-rose-600">{errors.content}</span>
                )}
              </div>
            </div>

            <RichTextEditor
              value={content}
              onChange={(html) => {
                setContent(html);
                if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
              }}
              placeholder="Soạn thảo nội dung bài viết tại đây... Khi copy-paste từ trang web khác có nền đen, hệ thống sẽ tự động làm sạch nền đen giúp bạn."
              fullHeight
              onInsertMediaFiles={handleInsertMediaFiles}
            />
          </div>

          {/* Cột bên phải: Thông tin chung, SEO, Phân loại & Ảnh bìa */}
          <NewsFormSidebar
            title={title}
            onTitleChange={handleTitleChange}
            titleError={errors.title}
            slug={slug}
            isCustomSlug={isCustomSlug}
            onCustomSlugChange={handleCustomSlugChange}
            onResetSlug={handleResetSlug}
            summary={summary}
            onSummaryChange={setSummary}
            category={category}
            onCategoryChange={setCategory}
            status={status}
            onStatusChange={setStatus}
            isFeatured={isFeatured}
            onFeaturedChange={setIsFeatured}
            thumbnailPreview={thumbnailPreview}
            onSelectCoverFile={handleSelectCoverFile}
            onRemoveCover={handleRemoveCover}
          />
        </div>
      </form>
    </Modal>
  );
}
