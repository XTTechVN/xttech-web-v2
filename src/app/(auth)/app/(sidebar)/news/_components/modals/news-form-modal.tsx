'use client';

import React, { useState } from 'react';
import {
  Button,
  Input,
  Modal,
  RichTextEditor,
  Textarea,
  type InsertedMediaItem,
} from '@/components';
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
  const [category, setCategory] = useState<NewsCategory>(() => initialData?.category || 'company_news');
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
    const cleanContent = content.trim();

    const nextErrors: { title?: string; content?: string } = {};
    if (cleanTitle.length < 3) nextErrors.title = 'Tiêu đề bài viết phải có ít nhất 3 ký tự';

    const textOnly = cleanContent.replace(/<[^>]*>/g, '').trim();
    const hasMediaTag = /<(img|video|iframe)\b/i.test(cleanContent);
    if (!textOnly && !hasMediaTag) nextErrors.content = 'Vui lòng nhập nội dung bài viết';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const activeMedia = pendingMediaList.filter(
      (entry) => cleanContent.includes(entry.tempId) || cleanContent.includes(entry.previewUrl),
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
            content: cleanContent,
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
            content: cleanContent,
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
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-4">
            <Input
              label="Tiêu đề bài viết *"
              placeholder="Nhập tiêu đề bài viết tin tức, sự kiện hoặc công trình..."
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              error={errors.title}
              fullWidth
            />
            <Input
              label="Đường dẫn tĩnh (Slug SEO)"
              placeholder="tu-dong-sinh-tu-tieu-de"
              value={slug}
              onChange={(e) => {
                setIsCustomSlug(true);
                setSlug(slugifyVietnamese(e.target.value));
              }}
              fullWidth
            />
            <Textarea
              label="Tóm tắt ngắn (Sapo hiển thị ở danh sách)"
              placeholder="Nhập đoạn tóm tắt ngắn gọn 2-3 câu thu hút người đọc..."
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              fullWidth
            />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700">
                  Nội dung chi tiết bài viết (Hỗ trợ chèn nhiều Ảnh / Video kèm chú thích) *
                </label>
                {pendingMediaList.length > 0 && (
                  <span className="text-[11px] font-mono tabular-nums text-primary font-semibold">
                    Đã đính kèm {pendingMediaList.length} media mới
                  </span>
                )}
              </div>
              <RichTextEditor
                value={content}
                onChange={(html) => {
                  setContent(html);
                  if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
                }}
                placeholder="Soạn thảo nội dung bài viết... Nhấn nút 'Chèn Ảnh / Video' trên thanh công cụ để chèn hình ảnh/video trực tiếp vào vị trí con trỏ."
                minHeightClass="min-h-72 max-h-[460px]"
                onInsertMediaFiles={handleInsertMediaFiles}
              />
              {errors.content && <p className="text-xs text-red-500">{errors.content}</p>}
            </div>
          </div>

          <NewsFormSidebar
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
