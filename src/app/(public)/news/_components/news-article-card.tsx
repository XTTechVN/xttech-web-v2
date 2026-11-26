'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { useMutation } from '@tanstack/react-query';
import { Eye, Heart, MessageSquare, Newspaper, Sparkles } from 'lucide-react';
import { Badge } from '@/components';
import {
  isNewsArticleLiked,
  NEWS_CATEGORY_BADGE_MAP,
  NEWS_CATEGORY_MAP,
  PUBLIC_NEWS_QUERY_KEYS,
  setNewsArticleLiked,
} from '@/config';
import { togglePublicNewsLike } from '@/actions';
import { getFileUrl, showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import type { NewsArticle } from '@/types';

export type NewsCardVariant =
  | 'lead-hero'
  | 'sub-lead'
  | 'horizontal-sm'
  | 'horizontal-md'
  | 'bullet'
  | 'numbered';

export interface NewsArticleCardProps {
  article: NewsArticle;
  variant?: NewsCardVariant;
  rank?: number;
  showDateOnBullet?: boolean;
  hideDescription?: boolean;
  initialIsLiked?: boolean;
}

export function NewsArticleCard({
  article,
  variant = 'horizontal-md',
  rank,
  showDateOnBullet = false,
  hideDescription = false,
  initialIsLiked,
}: NewsArticleCardProps) {
  const [clientLiked, setClientLiked] = useState<boolean>(initialIsLiked ?? false);
  const [optimisticLike, setOptimisticLike] = useState<{
    articleId: number;
    liked: boolean;
    likeCount: number;
  } | null>(null);
  const lastClickTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!article?.id) return;
    const stored = isNewsArticleLiked(article.id);
    if (stored !== clientLiked) {
      setClientLiked(stored);
    }
  }, [article?.id, clientLiked]);

  // Chặn double-click hoặc click liên tiếp vào bài viết để chống spam view
  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const now = Date.now();
    if (e.detail > 1 || now - lastClickTimeRef.current < 1000) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    lastClickTimeRef.current = now;
  };

  const isLiked =
    optimisticLike?.articleId === article.id
      ? optimisticLike.liked
      : clientLiked;

  const currentLikeCount =
    optimisticLike?.articleId === article.id ? optimisticLike.likeCount : article.likeCount;

  const likeMutation = useMutation({
    mutationFn: (nextLiked: boolean) =>
      togglePublicNewsLike(article.slug, {
        action: nextLiked ? 'like' : 'unlike',
      }),
    onMutate: (nextLiked) => {
      const prevCount = currentLikeCount;
      const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1));
      setOptimisticLike({ articleId: article.id, liked: nextLiked, likeCount: nextCount });
      setNewsArticleLiked(article.id, nextLiked);
      setClientLiked(nextLiked);
      return { prevLiked: !nextLiked, prevCount };
    },
    onSuccess: (res, nextLiked) => {
      setOptimisticLike({ articleId: article.id, liked: nextLiked, likeCount: res.likeCount });
      setClientLiked(nextLiked);
      queryClient.setQueryData<NewsArticle>(PUBLIC_NEWS_QUERY_KEYS.detail(article.slug), (old) =>
        old ? { ...old, likeCount: res.likeCount } : old,
      );
      queryClient.setQueriesData<{ items?: NewsArticle[]; meta?: unknown }>(
        { queryKey: PUBLIC_NEWS_QUERY_KEYS.list },
        (old) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === article.id ? { ...item, likeCount: res.likeCount } : item,
            ),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: PUBLIC_NEWS_QUERY_KEYS.list });
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['admin-news-detail', article.id] });
    },
    onError: (err, _nextLiked, context) => {
      if (context) {
        setOptimisticLike({
          articleId: article.id,
          liked: context.prevLiked,
          likeCount: context.prevCount,
        });
        setNewsArticleLiked(article.id, context.prevLiked);
        setClientLiked(context.prevLiked);
      }
      showErrorToast(err, 'Không thể cập nhật lượt yêu thích.');
    },
  });

  const handleQuickLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (likeMutation.isPending) return;
    likeMutation.mutate(!isLiked);
  };

  const categoryBadge = NEWS_CATEGORY_BADGE_MAP[article.category] || {
    label: NEWS_CATEGORY_MAP[article.category] || article.category,
    variant: 'primary' as const,
  };

  const thumbnailSrc = getFileUrl(article.thumbnailUrl);
  const formattedDate = article.createdAt ? dayjs(article.createdAt).format('DD/MM/YYYY') : '--';
  const href = `/news/${encodeURIComponent(article.slug)}`;

  // 1. Kiểu Bài tiêu điểm lớn đầu trang (Lead Hero)
  if (variant === 'lead-hero') {
    return (
      <Link href={href} onClick={handleCardClick} className="group block space-y-3.5">
        <div className="relative aspect-16/9 w-full rounded-xl overflow-hidden bg-slate-100">
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-primary/15 via-primary/5 to-teal-50 text-primary/40 p-8">
              <Newspaper className="w-16 h-16 stroke-[1.5]" />
              <span className="mt-2 text-xs font-semibold uppercase tracking-widest text-primary/60">
                XTTECH News & Insights
              </span>
            </div>
          )}
          <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-2">
            {article.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-sm">
                <Sparkles className="w-3 h-3" />
                Tiêu điểm
              </span>
            )}
            <Badge
              variant={categoryBadge.variant}
              size="sm"
              pill
              className="bg-white/95 backdrop-blur-xs shadow-xs"
            >
              {categoryBadge.label}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
            {article.title}
          </h2>

          {article.summary && (
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed line-clamp-2">
              {article.summary}
            </p>
          )}

          <div className="flex items-center justify-between gap-4 pt-1 text-xs text-slate-500">
            <span className="font-mono tabular-nums">{formattedDate}</span>
            <div className="flex items-center gap-3.5 font-mono tabular-nums">
              <span className="inline-flex items-center gap-1" title="Lượt xem" suppressHydrationWarning>
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {article.viewCount}
              </span>
              <button
                type="button"
                onClick={handleQuickLike}
                disabled={likeMutation.isPending}
                suppressHydrationWarning
                className={`inline-flex items-center gap-1 cursor-pointer ${
                  isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    isLiked ? 'text-rose-500 fill-rose-500' : 'text-rose-500'
                  }`}
                />
                <span suppressHydrationWarning>{currentLikeCount}</span>
              </button>
              <span className="inline-flex items-center gap-1" title="Bình luận">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                {article.commentCount}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // 2. Kiểu Bài chính của một khối ("Tin mới", Slide "Tiêu điểm nổi bật", hoặc bài đầu cột Chuyên mục)
  if (variant === 'sub-lead') {
    return (
      <Link href={href} onClick={handleCardClick} className="group block space-y-2.5">
        <div className="relative aspect-16/10 w-full rounded-lg overflow-hidden bg-slate-100">
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-slate-50 text-primary/35">
              <Newspaper className="w-10 h-10 stroke-[1.5]" />
            </div>
          )}
        </div>
        <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
          {article.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono tabular-nums">
          <span>{formattedDate}</span>
          <span className="inline-flex items-center gap-1" suppressHydrationWarning>
            <Eye className="w-3 h-3" />
            {article.viewCount}
          </span>
        </div>
        {!hideDescription && article.summary && (
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
            {article.summary}
          </p>
        )}
      </Link>
    );
  }

  // 3. Kiểu Ngang nhỏ (3 bài bên phải của mục "Tin mới")
  if (variant === 'horizontal-sm') {
    return (
      <Link href={href} onClick={handleCardClick} className="group grid grid-cols-12 gap-3.5 items-start">
        <div className="col-span-5 relative w-full aspect-16/10 rounded-lg overflow-hidden bg-slate-100">
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary/35">
              <Newspaper className="w-7 h-7" />
            </div>
          )}
        </div>
        <div className="col-span-7 min-w-0 space-y-1.5">
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
            {article.title}
          </h4>
          <div className="flex items-center gap-2.5 text-xs text-slate-400 font-mono tabular-nums">
            <span>{formattedDate}</span>
            <span className="inline-flex items-center gap-1" suppressHydrationWarning>
              <Eye className="w-3 h-3" />
              {article.viewCount}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // 4. Kiểu Dấu chấm đầu dòng (Bullet list)
  if (variant === 'bullet') {
    return (
      <Link href={href} onClick={handleCardClick} className="group block py-2.5 first:pt-0 last:pb-0">
        <div className="flex items-start gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
          <div className="min-w-0 flex-1 space-y-1">
            <h4 className="text-xs sm:text-sm font-medium text-slate-800 group-hover:text-primary transition-colors leading-snug line-clamp-2">
              {article.title}
            </h4>
            {showDateOnBullet && (
              <p className="text-[11px] text-slate-400 font-mono tabular-nums">{formattedDate}</p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // 5. Kiểu Đánh số thứ tự lớn 1..5 (Cột "Đọc nhiều nhất")
  if (variant === 'numbered') {
    return (
      <Link
        href={href}
        onClick={handleCardClick}
        className="group flex items-center gap-4 py-3 first:pt-0 last:pb-0"
      >
        <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-slate-400/80 group-hover:text-primary transition-colors w-6 text-center shrink-0 select-none">
          {rank ?? 1}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h4>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono tabular-nums">
            <span>{formattedDate}</span>
            <span className="inline-flex items-center gap-1" suppressHydrationWarning>
              <Eye className="w-3 h-3" />
              {article.viewCount}
            </span>
            <button
              type="button"
              onClick={handleQuickLike}
              disabled={likeMutation.isPending}
              suppressHydrationWarning
              title={isLiked ? 'Bỏ thả tim' : 'Thả tim bài viết'}
              className={`inline-flex items-center gap-1 cursor-pointer transition-colors ${
                isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
              }`}
            >
              <Heart
                className={`w-3 h-3 ${isLiked ? 'text-rose-500 fill-rose-500' : 'text-rose-500'}`}
              />
              <span suppressHydrationWarning>{currentLikeCount}</span>
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // 6. Kiểu Ngang vừa có Tóm tắt (horizontal-md - mặc định cho danh sách bài viết & khối 2 cột chuyên mục)
  return (
    <Link
      href={href}
      onClick={handleCardClick}
      className="group grid grid-cols-1 sm:grid-cols-12 gap-4 items-start"
    >
      <div className="sm:col-span-5 min-w-0 relative w-full aspect-16/10 rounded-lg overflow-hidden bg-slate-100">
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary/35">
            <Newspaper className="w-8 h-8" />
          </div>
        )}
      </div>
      <div className="sm:col-span-7 min-w-0 space-y-1.5">
        <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
          {article.title}
        </h3>
        <div className="text-xs text-slate-400 font-mono tabular-nums">{formattedDate}</div>
        {article.summary && (
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
            {article.summary}
          </p>
        )}
      </div>
    </Link>
  );
}
