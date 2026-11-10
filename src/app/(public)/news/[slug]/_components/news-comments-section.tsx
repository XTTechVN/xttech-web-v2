'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { MessageSquare, Send, Trash2, User } from 'lucide-react';
import { Button, Input, Skeleton, Textarea } from '@/components';
import { ConfirmActionModal } from '@/components/documents';
import { createPublicNewsComment, deleteNewsComment, getPublicNewsComments } from '@/actions';
import { PUBLIC_NEWS_QUERY_KEYS } from '@/config';
import { usePermission } from '@/hooks';
import queryClient from '@/utils/query';
import { showErrorToast, showSuccessToast } from '@/utils';
import type { NewsArticle, NewsComment, NewsCommentCreate } from '@/types';

export interface NewsCommentsSectionProps {
  slug: string;
  articleId: number;
  commentCount: number;
}

const COMMENTS_LIMIT = 10;

export function NewsCommentsSection({ slug, articleId, commentCount }: NewsCommentsSectionProps) {
  const { user, isManager } = usePermission();
  const [authorName, setAuthorName] = useState(() => user?.fullName || user?.username || '');
  const [content, setContent] = useState('');
  const [nameError, setNameError] = useState('');
  const [contentError, setContentError] = useState('');

  const [page, setPage] = useState(1);
  const [commentToDelete, setCommentToDelete] = useState<NewsComment | null>(null);

  const offset = (page - 1) * COMMENTS_LIMIT;

  const { data, isLoading } = useQuery({
    queryKey: [...PUBLIC_NEWS_QUERY_KEYS.comments(slug), offset, COMMENTS_LIMIT],
    queryFn: () => getPublicNewsComments(slug, { offset, limit: COMMENTS_LIMIT }),
    enabled: Boolean(slug),
  });

  const comments = data?.items || [];
  const total = data?.meta?.total ?? commentCount;
  const totalPages = Math.max(1, Math.ceil(total / COMMENTS_LIMIT));

  const syncCommentCountCache = (delta: number) => {
    queryClient.setQueryData<NewsArticle>(PUBLIC_NEWS_QUERY_KEYS.detail(slug), (old) =>
      old ? { ...old, commentCount: Math.max(0, (old.commentCount || 0) + delta) } : old,
    );
    queryClient.setQueriesData<{ items?: NewsArticle[]; meta?: unknown }>(
      { queryKey: PUBLIC_NEWS_QUERY_KEYS.list },
      (old) => {
        if (!old?.items) return old;
        return {
          ...old,
          items: old.items.map((item) =>
            item.id === articleId
              ? { ...item, commentCount: Math.max(0, (item.commentCount || 0) + delta) }
              : item,
          ),
        };
      },
    );
    queryClient.invalidateQueries({ queryKey: PUBLIC_NEWS_QUERY_KEYS.comments(slug) });
    queryClient.invalidateQueries({ queryKey: PUBLIC_NEWS_QUERY_KEYS.list });
    queryClient.invalidateQueries({ queryKey: ['admin-news-comments', articleId] });
    queryClient.invalidateQueries({ queryKey: ['admin-news-detail', articleId] });
    queryClient.invalidateQueries({ queryKey: ['admin-news'] });
  };

  const createCommentMutation = useMutation({
    mutationFn: (payload: NewsCommentCreate) => createPublicNewsComment(slug, payload),
    onSuccess: () => {
      setContent('');
      setPage(1);
      syncCommentCountCache(1);
      showSuccessToast('Đã gửi bình luận thành công!');
    },
    onError: (err) => {
      showErrorToast(err, 'Không thể gửi bình luận. Vui lòng thử lại.');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteNewsComment(commentId),
    onSuccess: () => {
      setCommentToDelete(null);
      syncCommentCountCache(-1);
      showSuccessToast('Đã xóa bình luận vi phạm.');
    },
    onError: (err) => {
      showErrorToast(err, 'Không thể xóa bình luận.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = authorName.trim();
    const cleanContent = content.trim();

    let hasErr = false;
    if (cleanName.length < 1) {
      setNameError('Vui lòng nhập họ tên hoặc biệt danh');
      hasErr = true;
    } else if (cleanName.length > 100) {
      setNameError('Họ tên không được vượt quá 100 ký tự');
      hasErr = true;
    } else {
      setNameError('');
    }

    if (cleanContent.length < 1) {
      setContentError('Vui lòng nhập nội dung bình luận');
      hasErr = true;
    } else if (cleanContent.length > 2000) {
      setContentError('Nội dung bình luận không được vượt quá 2000 ký tự');
      hasErr = true;
    } else {
      setContentError('');
    }

    if (hasErr) return;

    createCommentMutation.mutate({
      authorName: cleanName,
      content: cleanContent,
    });
  };

  const handleConfirmDelete = () => {
    if (!commentToDelete) return;
    deleteCommentMutation.mutate(commentToDelete.id);
  };

  return (
    <section
      id="comments"
      className="mt-10 pt-8 border-t border-slate-200/80 space-y-6 scroll-mt-24"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Bình luận & Trao đổi</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono tabular-nums bg-primary/10 text-primary">
                {total}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Mọi độc giả đều có thể để lại câu hỏi hoặc ý kiến đóng góp mà không cần đăng nhập.
            </p>
          </div>
        </div>
      </div>

      {/* Form gửi bình luận công khai */}
      <form
        onSubmit={handleSubmit}
        className="p-5 sm:p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Họ và tên của bạn <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Nhập họ tên hoặc đơn vị công tác..."
              value={authorName}
              onChange={(e) => {
                setAuthorName(e.target.value);
                if (nameError) setNameError('');
              }}
              error={nameError}
              maxLength={100}
              fullWidth
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Nội dung bình luận <span className="text-red-500">*</span>
          </label>
          <Textarea
            placeholder="Chia sẻ cảm nghĩ hoặc đặt câu hỏi về bài viết..."
            rows={3}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (contentError) setContentError('');
            }}
            error={contentError}
            maxLength={2000}
            fullWidth
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {content.length}/2000 ký tự
          </span>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={createCommentMutation.isPending}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Gửi bình luận
          </Button>
        </div>
      </form>

      {/* Danh sách bình luận */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2"
            >
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 text-center">
          <p className="text-sm font-semibold text-slate-700">Chưa có bình luận nào</p>
          <p className="text-xs text-slate-500 mt-1">
            Hãy là người đầu tiên để lại bình luận cho bài viết này!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 font-bold text-xs uppercase">
                  {item.authorName.trim().charAt(0) || <User className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{item.authorName}</span>
                    <span className="text-xs text-slate-400 font-mono tabular-nums">
                      • {item.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY HH:mm') : '--'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-700 whitespace-pre-line leading-relaxed wrap-break-word">
                    {item.content}
                  </p>
                </div>
              </div>

              {isManager && (
                <button
                  type="button"
                  onClick={() => setCommentToDelete(item)}
                  title="Xóa bình luận vi phạm (Quản trị viên)"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3">
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                Trang {page}/{totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Tiếp
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmActionModal
        isOpen={Boolean(commentToDelete)}
        onClose={() => setCommentToDelete(null)}
        title="Xóa bình luận vi phạm"
        description={
          <>
            Bạn có chắc chắn muốn xóa vĩnh viễn bình luận của{' '}
            <strong className="text-slate-900">{commentToDelete?.authorName}</strong>?
          </>
        }
        warningNote="Hành động này sẽ xóa cứng bình luận khỏi cơ sở dữ liệu và giảm tổng số bình luận của bài viết."
        confirmText="Xóa vĩnh viễn"
        variant="danger"
        loading={deleteCommentMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}
