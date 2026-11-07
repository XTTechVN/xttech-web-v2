'use client';

import React from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { Newspaper } from 'lucide-react';
import { getFileUrl } from '@/utils';
import type { NewsArticle } from '@/types';

export interface NewsRelatedArticlesProps {
  articles: NewsArticle[];
}

export function NewsRelatedArticles({ articles }: NewsRelatedArticlesProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="mt-10 space-y-4">
      <h2 className="text-lg sm:text-xl font-bold text-slate-900">Bài viết cùng chuyên mục</h2>
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
                <div className="aspect-16/10 rounded-lg bg-primary/5 overflow-hidden">
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
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                  {rel.title}
                </h3>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums pt-2 border-t border-slate-100">
                <span>{rel.createdAt ? dayjs(rel.createdAt).format('DD/MM/YYYY') : '--'}</span>
                <span>{rel.viewCount} lượt xem</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
