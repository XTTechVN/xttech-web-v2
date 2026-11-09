'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { Calendar, Eye, Heart, MessageSquare, Newspaper, Sparkles } from 'lucide-react';
import { Badge, Avatar } from '@/components';
import {
  isNewsArticleLiked,
  NEWS_CATEGORY_BADGE_MAP,
  NEWS_CATEGORY_MAP,
  setNewsArticleLiked,
} from '@/config';
import { togglePublicNewsLike } from '@/actions';
import { getFileUrl, showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import type { NewsArticle } from '@/types';

export type NewsCardVariant =
  | 'default'
  | 'featured'
  | 'lead-hero'
  | 'sub-lead'
  | 'horizontal-sm'
  | 'horizontal-md'
  | 'bullet'
  | 'numbered'
  | 'compact';

export interface NewsArticleCardProps {
  article: NewsArticle;
  featured?: boolean;
  compact?: boolean;
  variant?: NewsCardVariant;
  rank?: number;
  showDateOnBullet?: boolean;
  hideDescription?: boolean;
}

export function NewsArticleCard({
  article,
  featured = false,
  compact = false,
  variant,
  rank,
  showDateOnBullet = false,
  hideDescription = false,
}: NewsArticleCardProps) {
  const [optimisticLike, setOptimisticLike] = useState<{
    articleId: number;
    liked: boolean;
    likeCount: number;
  } | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const lastClickTimeRef = useRef<number>(0);

  const resolvedVariant: NewsCardVariant =
    variant || (featured ? 'featured' : compact ? 'compact' : 'default');

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
      : isNewsArticleLiked(article.id);

  const currentLikeCount =
    optimisticLike?.articleId === article.id ? optimisticLike.likeCount : article.likeCount;

  const handleQuickLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiking) return;

    const nextLiked = !isLiked;
    const nextCount = Math.max(0, currentLikeCount + (nextLiked ? 1 : -1));
    setOptimisticLike({ articleId: article.id, liked: nextLiked, likeCount: nextCount });
    setNewsArticleLiked(article.id, nextLiked);
    setIsLiking(true);

    try {
      const res = await togglePublicNewsLike(article.slug, {
        action: nextLiked ? 'like' : 'unlike',
      });
      setOptimisticLike({ articleId: article.id, liked: nextLiked, likeCount: res.likeCount });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['public-news-list'] }),
        queryClient.invalidateQueries({ queryKey: ['public-news-detail', article.slug] }),
        queryClient.invalidateQueries({ queryKey: ['admin-news'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-news-detail', article.id] }),
      ]);
    } catch (err) {
      setOptimisticLike({ articleId: article.id, liked: !nextLiked, likeCount: currentLikeCount });
      setNewsArticleLiked(article.id, !nextLiked);
      showErrorToast(err, 'Không thể cập nhật lượt yêu thích.');
    } finally {
      setIsLiking(false);
    }
  };

  const categoryBadge = NEWS_CATEGORY_BADGE_MAP[article.category] || {
    label: NEWS_CATEGORY_MAP[article.category] || article.category,
    variant: 'primary' as const,
    className: 'bg-primary/10 text-primary border-primary/20',
  };

  const thumbnailSrc = getFileUrl(article.thumbnailUrl);
  const authorDisplayName =
    article.author?.fullName || article.author?.username || 'Ban biên tập XTTECH';
  const authorAvatarSrc = getFileUrl(article.author?.avatar) || undefined;
  const formattedDate = article.createdAt ? dayjs(article.createdAt).format('DD/MM/YYYY') : '--';
  const href = `/news/${encodeURIComponent(article.slug)}`;

  // 1. Kiểu Bài tiêu điểm lớn đầu trang (Ảnh lớn ở trên, tiêu đề lớn + tóm tắt + ngày ở dưới - Ảnh 1)
  if (resolvedVariant === 'lead-hero' || resolvedVariant === 'featured') {
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
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-teal-50 text-primary/40 p-8">
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
              <span className="inline-flex items-center gap-1" title="Lượt xem">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {article.viewCount}
              </span>
              <button
                type="button"
                onClick={handleQuickLike}
                disabled={isLiking}
                className={`inline-flex items-center gap-1 cursor-pointer ${
                  isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    isLiked ? 'text-rose-500 fill-rose-500' : 'text-rose-500'
                  }`}
                />
                {currentLikeCount}
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

  // 2. Kiểu Bài chính của một khối ("Tin mới" bên trái, hoặc bài đầu tiên của cột Chuyên mục - Ảnh 2)
  if (resolvedVariant === 'sub-lead') {
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
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-slate-50 text-primary/35">
              <Newspaper className="w-10 h-10 stroke-[1.5]" />
            </div>
          )}
        </div>
        <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
          {article.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono tabular-nums">
          <span>{formattedDate}</span>
          <span className="inline-flex items-center gap-1">
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

  // 3. Kiểu Ngang nhỏ (3 bài bên phải của mục "Tin mới" - Ảnh 2)
  if (resolvedVariant === 'horizontal-sm') {
    return (
      <Link href={href} onClick={handleCardClick} className="group flex items-start gap-3.5">
        <div className="relative w-32 sm:w-36 aspect-16/10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
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
        <div className="min-w-0 flex-1 space-y-1.5">
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
            {article.title}
          </h4>
          <div className="flex items-center gap-2.5 text-xs text-slate-400 font-mono tabular-nums">
            <span>{formattedDate}</span>
            <span className="inline-flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {article.viewCount}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // 4. Kiểu Ngang vừa có Tóm tắt (Khối 2 cột chuyên sâu giống "Giải thưởng / Câu chuyện thành công" - Ảnh 3)
  if (resolvedVariant === 'horizontal-md') {
    return (
      <Link
        href={href}
        onClick={handleCardClick}
        className="group grid grid-cols-1 sm:grid-cols-12 gap-4 items-start"
      >
        <div className="sm:col-span-5 relative aspect-16/10 rounded-lg overflow-hidden bg-slate-100">
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
        <div className="sm:col-span-7 space-y-1.5">
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

  // 5. Kiểu Dấu chấm đầu dòng (Bullet list trong khối Sự kiện & dưới các cột chuyên mục - Ảnh 2 & 3)
  if (resolvedVariant === 'bullet') {
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

  // 6. Kiểu Đánh số thứ tự lớn 1, 2, 3, 4, 5 (Giống cột "Kiến thức quản trị" ở Ảnh 3)
  if (resolvedVariant === 'numbered' || resolvedVariant === 'compact') {
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
            <span className="inline-flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {article.viewCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart
                className={`w-3 h-3 ${isLiked ? 'text-rose-500 fill-rose-500' : 'text-rose-500'}`}
              />
              {currentLikeCount}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // 7. Kiểu Card Lưới tiêu chuẩn (Khi lọc theo chuyên mục / tìm kiếm / phân trang)
  return (
    <Link
      href={href}
      onClick={handleCardClick}
      className="group flex flex-col rounded-xl overflow-hidden bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-primary/30 transition-all duration-300 h-full"
    >
      <div className="relative aspect-16/10 bg-primary/5 overflow-hidden shrink-0">
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-slate-50 text-primary/40">
            <Newspaper className="w-10 h-10 stroke-[1.5]" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          {article.isFeatured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500 text-white shadow-xs">
              <Sparkles className="w-3 h-3" />
              Nổi bật
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

      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-mono tabular-nums">{formattedDate}</span>
          </div>

          <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
            {article.title}
          </h3>

          {article.summary && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
              {article.summary}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar src={authorAvatarSrc} name={authorDisplayName} size="xs" />
            <span className="font-medium text-slate-700 truncate max-w-[120px]">
              {authorDisplayName}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span
              className="inline-flex items-center gap-1 font-mono tabular-nums"
              title="Lượt xem"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              {article.viewCount}
            </span>
            <button
              type="button"
              onClick={handleQuickLike}
              disabled={isLiking}
              title={isLiked ? 'Bỏ thả tim' : 'Thả tim bài viết'}
              className={`inline-flex items-center gap-1 font-mono tabular-nums transition-colors cursor-pointer ${
                isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isLiked ? 'text-rose-500 fill-rose-500' : 'text-rose-500'
                }`}
              />
              {currentLikeCount}
            </button>
            <span
              className="inline-flex items-center gap-1 font-mono tabular-nums"
              title="Bình luận"
            >
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              {article.commentCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
