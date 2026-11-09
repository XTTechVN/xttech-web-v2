'use client';

import React from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { ArrowRight, Calendar, Eye, Heart, MessageSquare, Newspaper, Sparkles } from 'lucide-react';
import { Badge, Avatar } from '@/components';
import { NEWS_CATEGORY_BADGE_MAP, NEWS_CATEGORY_MAP } from '@/config';
import { getFileUrl } from '@/utils';
import type { NewsArticle } from '@/types';

export interface NewsArticleCardProps {
  article: NewsArticle;
  featured?: boolean;
}

export function NewsArticleCard({ article, featured = false }: NewsArticleCardProps) {
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

  if (featured) {
    return (
      <Link
        href={`/news/${encodeURIComponent(article.slug)}`}
        className="group relative grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden bg-white border border-primary/20 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all duration-300"
      >
        <div className="relative lg:col-span-7 aspect-16/10 lg:aspect-auto lg:min-h-[340px] bg-primary/5 overflow-hidden">
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-teal-50 text-primary/40 p-8">
              <Newspaper className="w-16 h-16 stroke-[1.5]" />
              <span className="mt-2 text-xs font-semibold uppercase tracking-widest text-primary/60">
                XTTECH News & Insights
              </span>
            </div>
          )}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            {article.isFeatured && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Tiêu điểm
              </span>
            )}
            <Badge
              variant={categoryBadge.variant}
              size="md"
              pill
              className="bg-white/95 backdrop-blur-xs shadow-xs"
            >
              {categoryBadge.label}
            </Badge>
          </div>
        </div>

        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between gap-5 bg-white">
          <div className="space-y-3.5">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span className="font-mono tabular-nums">{formattedDate}</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="font-semibold text-primary">{categoryBadge.label}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-3">
              {article.title}
            </h2>

            {article.summary && (
              <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                {article.summary}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar src={authorAvatarSrc} name={authorDisplayName} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{authorDisplayName}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                  <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    {article.viewCount}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    {article.likeCount}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    {article.commentCount}
                  </span>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
              Đọc chi tiết
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/news/${encodeURIComponent(article.slug)}`}
      className="group flex flex-col rounded-xl overflow-hidden bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-300 h-full"
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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary text-white shadow-xs">
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
          <span className="font-medium text-slate-700 truncate max-w-[140px]">
            {authorDisplayName}
          </span>
          <div className="flex items-center gap-3 shrink-0">
            <span
              className="inline-flex items-center gap-1 font-mono tabular-nums"
              title="Lượt xem"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              {article.viewCount}
            </span>
            <span
              className="inline-flex items-center gap-1 font-mono tabular-nums"
              title="Lượt yêu thích"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              {article.likeCount}
            </span>
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
