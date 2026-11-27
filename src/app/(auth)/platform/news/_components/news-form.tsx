'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, RotateCcw, Trash2 } from 'lucide-react';
import { Input, RichTextEditor, Switch, Textarea, type InsertedMediaItem } from '@/components';
import { Button, Select } from '@/components-remake';
import { NEWS_CATEGORY_OPTIONS, NEWS_STATUS_OPTIONS, slugifyVietnamese } from '@/config';
import { createNewsArticle, updateNewsArticle } from '@/actions';
import { getFileUrl, sanitizeNewsHtml, showErrorToast, showSuccessToast } from '@/utils';
import type { NewsArticle, NewsCategory, NewsStatus } from '@/types';
import { refreshNews } from './refresh';

interface PendingMedia {
  tempId: string;
  file: File;
  previewUrl: string;
}

const BOX = 'flex flex-col gap-3 rounded-block border border-slate-200/80 bg-white p-4';

// Form bài viết (thêm và sửa) ở trang riêng: soạn nội dung bên trái, thông tin và ảnh bìa bên phải từ 1024px
export function NewsForm({ initialData }: { initialData?: NewsArticle }) {
  const router = useRouter();
  const coverInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [customSlug, setCustomSlug] = useState(Boolean(initialData?.slug));
  const [category, setCategory] = useState<NewsCategory>(initialData?.category ?? 'company_news');
  const [status, setStatus] = useState<NewsStatus>(initialData?.status ?? 'published');
  const [isFeatured, setIsFeatured] = useState(Boolean(initialData?.isFeatured));
  const [summary, setSummary] = useState(initialData?.summary ?? '');
  const [content, setContent] = useState(() => sanitizeNewsHtml(initialData?.content ?? ''));
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(getFileUrl(initialData?.thumbnailUrl) || '');
  const [removeCover, setRemoveCover] = useState(false);
  const [pending, setPending] = useState<PendingMedia[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  const changeTitle = (v: string) => {
    setTitle(v);
    if (!customSlug) setSlug(slugifyVietnamese(v));
    if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
  };

  const pickCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setRemoveCover(false);
    setCoverPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const insertMedia = (files: File[]): InsertedMediaItem[] => {
    const inserted: InsertedMediaItem[] = [];
    const entries: PendingMedia[] = [];
    files.forEach((file, i) => {
      const tempId = `media-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`;
      const previewUrl = URL.createObjectURL(file);
      inserted.push({
        tempId,
        previewUrl,
        mediaType: file.type.startsWith('video/') ? 'video' : 'image',
        defaultCaption: file.name.replace(/\.[^/.]+$/, ''),
      });
      entries.push({ tempId, file, previewUrl });
    });
    setPending((p) => [...p, ...entries]);
    return inserted;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const html = sanitizeNewsHtml(content.trim());
    const next: typeof errors = {};
    if (cleanTitle.length < 3) next.title = 'Tiêu đề phải có ít nhất 3 ký tự';
    if (!html.replace(/<[^>]*>/g, '').trim() && !/<(img|video|iframe)\b/i.test(html)) next.content = 'Vui lòng nhập nội dung bài viết';
    if (next.title || next.content) {
      setErrors(next);
      return;
    }

    const used = pending.filter((m) => html.includes(m.tempId) || html.includes(m.previewUrl));
    const body = {
      title: cleanTitle,
      slug: slug.trim() || slugifyVietnamese(cleanTitle) || null,
      summary: summary.trim() || null,
      content: html,
      category,
      status,
      isFeatured,
      mediaTempIds: used.map((m) => m.tempId),
    };
    setSaving(true);
    try {
      if (initialData) {
        await updateNewsArticle(
          initialData.id,
          { ...body, thumbnailUrl: removeCover ? null : initialData.thumbnailUrl },
          coverFile,
          used.map((m) => m.file),
        );
        showSuccessToast('Đã cập nhật bài viết');
      } else {
        await createNewsArticle(
          body,
          coverFile,
          used.map((m) => m.file),
        );
        showSuccessToast('Đã đăng bài viết mới');
      }
      refreshNews();
      router.push('/platform/news');
    } catch (err) {
      showErrorToast(err, 'Không thể lưu bài viết. Vui lòng kiểm tra lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 md:gap-4">
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-3 md:gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className={BOX} aria-labelledby="news-content">
          <div className="flex items-center justify-between gap-2">
            <h2 id="news-content" className="text-sm font-semibold text-slate-900">
              Nội dung bài viết *
            </h2>
            {errors.content && (
              <span role="alert" className="text-xs font-medium text-red-700">
                {errors.content}
              </span>
            )}
          </div>
          <RichTextEditor
            value={content}
            onChange={(html) => {
              setContent(html);
              if (errors.content) setErrors((p) => ({ ...p, content: undefined }));
            }}
            placeholder="Soạn nội dung bài viết tại đây. Hỗ trợ đổi màu chữ, chèn ảnh, video và YouTube."
            onInsertMediaFiles={insertMedia}
          />
        </section>

        <div className="flex flex-col gap-3 md:gap-4">
          <section className={BOX} aria-labelledby="news-info">
            <h2 id="news-info" className="text-sm font-semibold text-slate-900">
              Thông tin chung
            </h2>
            <Input
              label="Tiêu đề *"
              placeholder="Nhập tiêu đề bài viết"
              value={title}
              onChange={(e) => changeTitle(e.target.value)}
              error={errors.title}
              fullWidth
            />
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-700">Đường dẫn (slug)</span>
                {customSlug && title.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomSlug(false);
                      setSlug(slugifyVietnamese(title));
                    }}
                    className="inline-flex min-h-11 cursor-pointer items-center gap-1 text-xs font-medium text-primary md:min-h-8"
                  >
                    <RotateCcw size={12} aria-hidden="true" />
                    Tạo lại từ tiêu đề
                  </button>
                )}
              </div>
              <Input
                placeholder="tu-dong-sinh-tu-tieu-de"
                value={slug}
                onChange={(e) => {
                  setCustomSlug(true);
                  setSlug(slugifyVietnamese(e.target.value));
                }}
                fullWidth
              />
            </div>
            <Textarea
              label="Tóm tắt ngắn"
              placeholder="Một đến hai câu hiển thị ở danh sách"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              fullWidth
            />
          </section>

          <section className={BOX} aria-labelledby="news-publish">
            <h2 id="news-publish" className="text-sm font-semibold text-slate-900">
              Phân loại và xuất bản
            </h2>
            <Select label="Chuyên mục" value={category} options={NEWS_CATEGORY_OPTIONS} onChange={(v) => setCategory(v as NewsCategory)} />
            <Select label="Trạng thái" value={status} options={NEWS_STATUS_OPTIONS} onChange={(v) => setStatus(v as NewsStatus)} />
            <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-sm text-slate-900">
              Ghim làm bài tiêu điểm
              <Switch checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            </label>
          </section>

          <section className={BOX} aria-labelledby="news-cover">
            <div className="flex items-center justify-between gap-2">
              <h2 id="news-cover" className="text-sm font-semibold text-slate-900">
                Ảnh bìa
              </h2>
              {coverPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setCoverFile(null);
                    setCoverPreview('');
                    setRemoveCover(true);
                  }}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-1 text-xs font-medium text-red-700 md:min-h-8"
                >
                  <Trash2 size={14} aria-hidden="true" />
                  Gỡ ảnh
                </button>
              )}
            </div>
            {coverPreview ? (
              <img src={coverPreview} alt="Ảnh bìa bài viết" className="aspect-16/10 w-full rounded-control border border-slate-200 object-cover" />
            ) : (
              <button
                type="button"
                onClick={() => coverInput.current?.click()}
                className="flex aspect-16/10 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-control border border-dashed border-slate-300 text-slate-600 active:bg-slate-50"
              >
                <ImagePlus size={24} aria-hidden="true" />
                <span className="text-sm">Tải lên ảnh bìa</span>
                <span className="text-xs text-slate-500">JPG, PNG, WEBP, tỷ lệ 16:10</span>
              </button>
            )}
            {coverPreview && (
              <Button type="button" variant="outline" onClick={() => coverInput.current?.click()}>
                Đổi ảnh bìa
              </Button>
            )}
            <input ref={coverInput} type="file" accept="image/*" onChange={pickCover} className="hidden" aria-label="Chọn ảnh bìa" />
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 flex justify-end gap-2 border-t border-slate-200 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:-mx-6 md:px-6">
        <Button variant="outline" className="flex-1 md:flex-none" disabled={saving} onClick={() => router.push('/platform/news')}>
          Hủy
        </Button>
        <Button type="submit" className="flex-1 md:flex-none" loading={saving}>
          {initialData ? 'Lưu cập nhật' : 'Đăng bài'}
        </Button>
      </div>
    </form>
  );
}
