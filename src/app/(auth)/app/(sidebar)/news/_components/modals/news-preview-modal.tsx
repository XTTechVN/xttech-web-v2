'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  ExternalLink,
  Eye,
  Heart,
  MessageSquare,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import { Badge, Button, Modal, Skeleton } from '@/components';
import { ConfirmActionModal } from '@/components/documents';
import {
  NEWS_CATEGORY_BADGE_MAP,
  NEWS_CATEGORY_MAP,
  NEWS_STATUS_BADGE_MAP,
} from '@/config';
import { deleteNewsComment, getAdminNewsComments, getAdminNewsDetail } from '@/actions';
import { getFileUrl, sanitizeNewsHtml, showErrorToast, showSuccessToast } from '@/utils';
import queryClient from '@/utils/query';
import type { NewsArticle, NewsComment } from '@/types';

export interface NewsPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsArticle | null;
}

export function NewsPreviewModal({ isOpen, onClose, article }: NewsPreviewModalProps) {
  const [commentToDelete, setCommentToDelete] = useState<NewsComment | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);

  const { data: detailArticle } = useQuery({
    queryKey: ['admin-news-detail', article?.id],
    queryFn: () => getAdminNewsDetail(article!.id),
    enabled: Boolean(isOpen && article?.id),
    initialData: article || undefined,
  });

  const currentArticle = detailArticle || article;

  const { data: commentsData, isLoading: isLoadingComments } = useQuery({
    queryKey: ['admin-news-comments', currentArticle?.id],
    queryFn: () => getAdminNewsComments(currentArticle!.id, { offset: 0, limit: 50 }),
    enabled: Boolean(isOpen && currentArticle?.id),
  });

  const sanitizedHtml = useMemo(
    () => sanitizeNewsHtml(currentArticle?.content || ''),
    [currentArticle?.content],
  );

  if (!currentArticle) return null;

  const categoryBadge = NEWS_CATEGORY_BADGE_MAP[currentArticle.category] || {
    label: NEWS_CATEGORY_MAP[currentArticle.category] || currentArticle.category,
    variant: 'primary' as const,
  };
  const statusBadge = NEWS_STATUS_BADGE_MAP[currentArticle.status];
  const thumbnailSrc = getFileUrl(currentArticle.thumbnailUrl);
  const comments = commentsData?.items || [];

  const handleConfirmDeleteComment = async () => {
    if (!commentToDelete) return;
    setIsDeletingComment(true);
    try {
      await deleteNewsComment(commentToDelete.id);
      setCommentToDelete(null);
      showSuccessToast('Đã xóa cứng bình luận.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-news-comments', currentArticle.id] }),
        queryClient.invalidateQueries({ queryKey: ['admin-news-detail', currentArticle.id] }),
        queryClient.invalidateQueries({ queryKey: ['admin-news'] }),
      ]);
    } catch (err) {
      showErrorToast(err, 'Không thể xóa bình luận.');
    } finally {
      setIsDeletingComment(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        title="Xem trước bài viết & Quản trị bình luận"
        footer={
          <div className="flex items-center justify-between w-full gap-3">
            {currentArticle.status === 'published' ? (
              <Link
                href={`/news/${encodeURIComponent(currentArticle.slug)}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Mở trên trang công khai
              </Link>
            ) : (
              <span className="text-xs text-amber-600 font-medium">
                Bài viết đang ở trạng thái Bản nháp (Chưa hiển thị công khai)
              </span>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              Đóng
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Thông tin tiêu đề & trạng thái */}
          <div className="space-y-3 pb-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusBadge.variant} size="sm">
                {statusBadge.label}
              </Badge>
              <Badge variant={categoryBadge.variant} size="sm">
                {categoryBadge.label}
              </Badge>
              {currentArticle.isFeatured && (
                <Badge variant="primary" size="sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Tiêu điểm
                </Badge>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {currentArticle.title}
            </h2>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span className="font-mono tabular-nums">
                  {currentArticle.createdAt
                    ? dayjs(currentArticle.createdAt).format('DD/MM/YYYY HH:mm')
                    : '--'}
                </span>
                <span>•</span>
                <span>
                  Tác giả:{' '}
                  <strong className="text-slate-700">
                    {currentArticle.author?.fullName ||
                      currentArticle.author?.username ||
                      'Quản trị viên'}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-4 font-mono tabular-nums">
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  {currentArticle.viewCount}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  {currentArticle.likeCount}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  {commentsData?.meta?.total ?? currentArticle.commentCount}
                </span>
              </div>
            </div>
          </div>

          {currentArticle.summary && (
            <div className="p-3.5 rounded-xl bg-primary/5 border-l-4 border-primary text-sm text-slate-700 font-medium">
              {currentArticle.summary}
            </div>
          )}

          {thumbnailSrc && (
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <img
                src={thumbnailSrc}
                alt={currentArticle.title}
                className="w-full max-h-80 object-cover mx-auto"
              />
            </div>
          )}

          <div
            className="text-sm sm:text-base text-slate-800 leading-relaxed space-y-3 [&_figure]:my-4 [&_figcaption]:text-xs [&_figcaption]:text-slate-500 [&_figcaption]:italic [&_figcaption]:text-center [&_img]:max-w-full [&_img]:rounded-lg [&_img]:mx-auto [&_video]:max-w-full [&_video]:rounded-lg [&_video]:mx-auto [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:mx-auto [&_iframe]:border-0 [&_iframe]:shadow-sm [&_h2]:text-lg [&_h2]:font-bold [&_h3]:text-base [&_h3]:font-bold [&_h4]:text-sm [&_h4]:font-bold [&_ul]:my-3 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:my-3 [&_ol]:pl-5 [&_ol]:list-decimal [&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:bg-primary/5 [&_blockquote]:px-3.5 [&_blockquote]:py-2 [&_blockquote]:rounded-r-lg [&_blockquote]:italic [&_hr]:my-4 [&_hr]:border-slate-200 [&_a]:text-primary [&_a]:font-medium [&_a]:underline [&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_mark]:rounded-xs [&_s]:line-through [&_del]:line-through"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />

          {/* Quản trị bình luận của bài viết */}
          <div className="pt-6 border-t border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span>Danh sách bình luận của bài viết</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono tabular-nums bg-primary/10 text-primary">
                {commentsData?.meta?.total ?? comments.length}
              </span>
            </h3>

            {isLoadingComments ? (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-3">
                Bài viết này chưa có bình luận nào.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold uppercase">
                        {c.authorName.trim().charAt(0) || <User className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-slate-900">{c.authorName}</span>
                          <span className="text-slate-400 font-mono tabular-nums">
                            {c.createdAt ? dayjs(c.createdAt).format('DD/MM/YYYY HH:mm') : '--'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1 whitespace-pre-line break-words">
                          {c.content}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCommentToDelete(c)}
                      title="Xóa cứng bình luận này"
                      className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmActionModal
        isOpen={Boolean(commentToDelete)}
        onClose={() => setCommentToDelete(null)}
        title="Xóa cứng bình luận"
        description={
          <>
            Bạn có chắc chắn muốn xóa vĩnh viễn bình luận của{' '}
            <strong className="text-slate-900">{commentToDelete?.authorName}</strong>?
          </>
        }
        confirmText="Xóa vĩnh viễn"
        variant="danger"
        loading={isDeletingComment}
        onConfirm={handleConfirmDeleteComment}
      />
    </>
  );
}
