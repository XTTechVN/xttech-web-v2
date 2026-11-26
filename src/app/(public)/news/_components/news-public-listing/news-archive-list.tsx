import React from 'react';
import { Button, Skeleton } from '@/components';
import { NEWS_CATEGORY_MAP } from '@/config';
import type { NewsArticle, NewsCategory } from '@/types';
import { NewsArticleCard } from '../news-article-card';
import { NewsPagination } from './news-pagination';

interface NewsArchiveListProps {
  isLoading: boolean;
  isFetching: boolean;
  selectedCategory?: NewsCategory;
  hasActiveFilter: boolean;
  paginatedArticles: NewsArticle[];
  total: number;
  totalPages: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  onClearFilters: () => void;
}

export function NewsArchiveList({ isLoading, isFetching, selectedCategory, hasActiveFilter, paginatedArticles, total, totalPages, page, setPage, onClearFilters }: NewsArchiveListProps) {
  return (
    <div className="lg:col-span-8 min-w-0 space-y-6">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-1 h-5 bg-primary rounded-xs shrink-0" />
          <h2 className="text-lg sm:text-xl font-bold text-primary">
            {selectedCategory
              ? NEWS_CATEGORY_MAP[selectedCategory]
              : 'Tất cả bài viết'}
          </h2>
        </div>

        <span className="text-xs text-slate-500 font-mono tabular-nums">
          {total} bài viết
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <Skeleton className="sm:col-span-5 h-40 w-full rounded-lg" />
              <div className="sm:col-span-7 space-y-3 py-1">
                <Skeleton className="h-6 w-full rounded" />
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-14 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : paginatedArticles.length === 0 ? (
        <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-10 text-center">
          <p className="text-sm font-semibold text-slate-700">
            Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại.
          </p>
          {hasActiveFilter && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onClearFilters}
            >
              Đặt lại bộ lọc
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="divide-y divide-slate-200/80">
            {paginatedArticles.map((article) => (
              <div key={article.id} className="py-5 first:pt-0 last:pb-0">
                <NewsArticleCard article={article} variant="horizontal-md" />
              </div>
            ))}
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <NewsPagination
              page={page}
              totalPages={totalPages}
              total={total}
              isFetching={isFetching}
              setPage={setPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
