'use client';

import React from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { ArrowRight, Eye, Heart, Newspaper, Sparkles, TrendingUp } from 'lucide-react';
import { NEWS_CATEGORY_MAP } from '@/config';
import { getFileUrl } from '@/utils';
import type { NewsArticle, NewsCategory } from '@/types';

export interface NewsRelatedArticlesProps {
  articles: NewsArticle[];
  popularArticles?: NewsArticle[];
  category?: NewsCategory;
}

export function NewsRelatedArticles({
  articles,
  popularArticles = [],
  category,
}: NewsRelatedArticlesProps) {
  const hasRelated = articles && articles.length > 0;
  const hasPopular = popularArticles && popularArticles.length > 0;

  if (!hasRelated && !hasPopular) return null;

  return (
    <div className="mt-10 space-y-10">
      {hasRelated && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Bài viết cùng chuyên mục{category ? `: ${NEWS_CATEGORY_MAP[category]}` : ''}
            </h2>
            {category && (
              <Link
                href={`/news?category=${encodeURIComponent(category)}`}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-primary hover:underline"
              >
                <span>Xem thêm</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {articles.map((rel) => {
              const relThumb = getFileUrl(rel.thumbnailUrl);
              return (
                <Link
                  key={rel.id}
                  href={`/news/${encodeURIComponent(rel.slug)}`}
                  className="group p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-primary/40 shadow-2xs transition-all flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2.5">
                    <div className="relative aspect-16/10 rounded-lg bg-primary/5 overflow-hidden">
                      {relThumb ? (
                        <img
                          src={relThumb}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/40">
                          <Newspaper className="w-7 h-7" />
                        </div>
                      )}
                      {rel.isFeatured && (
                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500 text-white shadow-2xs">
                          <Sparkles className="w-2.5 h-2.5" />
                          Nổi bật
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                      {rel.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums pt-2 border-t border-slate-100">
                    <span>{rel.createdAt ? dayjs(rel.createdAt).format('DD/MM/YYYY') : '--'}</span>
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-400" />
                        {rel.viewCount}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-500" />
                        {rel.likeCount}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {hasPopular && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Bài viết nhiều người xem nhất
              </h2>
            </div>
            <Link
              href="/news?popular=true"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-primary hover:underline"
            >
              <span>Xem bảng xếp hạng</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {popularArticles.map((pop) => {
              const popThumb = getFileUrl(pop.thumbnailUrl);
              return (
                <Link
                  key={pop.id}
                  href={`/news/${encodeURIComponent(pop.slug)}`}
                  className="group p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-primary/40 shadow-2xs transition-all flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2.5">
                    <div className="relative aspect-16/10 rounded-lg bg-primary/5 overflow-hidden">
                      {popThumb ? (
                        <img
                          src={popThumb}
                          alt={pop.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/40">
                          <Newspaper className="w-7 h-7" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                      {pop.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums pt-2 border-t border-slate-100">
                    <span>{pop.createdAt ? dayjs(pop.createdAt).format('DD/MM/YYYY') : '--'}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-primary">
                      <Eye className="w-3.5 h-3.5" />
                      {pop.viewCount} lượt xem
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
