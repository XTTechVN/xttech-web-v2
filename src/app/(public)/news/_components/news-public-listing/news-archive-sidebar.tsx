import React from 'react';
import { Flame } from 'lucide-react';
import { Skeleton } from '@/components';
import type { NewsArticle } from '@/types';
import { NewsArticleCard } from '../news-article-card';

interface NewsArchiveSidebarProps {
  isLoading: boolean;
  mostViewedArticles: NewsArticle[];
  hotArticles: NewsArticle[];
}

export function NewsArchiveSidebar({ isLoading, mostViewedArticles, hotArticles }: NewsArchiveSidebarProps) {
  return (
    <aside className="lg:col-span-4 min-w-0 w-full space-y-8 lg:sticky lg:top-20">
      {/* Khối 1: Đọc nhiều nhất (đánh số 1, 2, 3, 4, 5 cố định như mẫu Ảnh 3) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
          <span className="w-1 h-5 bg-primary rounded-xs shrink-0" />
          <h3 className="text-lg sm:text-xl font-bold text-primary">Đọc nhiều nhất</h3>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : mostViewedArticles.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">Chưa có bài viết.</p>
        ) : (
          <div className="divide-y divide-slate-200">
            {mostViewedArticles.map((item, index) => (
              <NewsArticleCard
                key={item.id}
                article={item}
                variant="numbered"
                rank={index + 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Khối 2: Tin Hot / Được quan tâm (cố định) */}
      {hotArticles.length > 0 && (
        <div className="rounded-lg bg-slate-50/90 border border-slate-200/80 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2.5">
            <Flame className="w-5 h-5 text-red-600 fill-red-500 shrink-0" />
            <h3 className="text-base sm:text-lg font-bold text-red-600">
              Tin Hot & Được yêu thích
            </h3>
          </div>

          <div className="divide-y divide-dashed divide-slate-200">
            {hotArticles.map((item) => (
              <div key={item.id} className="py-2.5 first:pt-0 last:pb-0">
                <NewsArticleCard article={item} variant="bullet" showDateOnBullet />
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
