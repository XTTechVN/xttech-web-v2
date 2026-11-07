'use client';

import React, { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import { Button, Skeleton } from '@/components';
import { NEWS_CATEGORY_OPTIONS } from '@/config';
import { getPublicNewsList } from '@/actions';
import { useDebounce } from '@/hooks';
import type { NewsCategory } from '@/types';
import { NewsArticleCard } from './news-article-card';
import { NewsPublicToolbar, type PublicNewsSortMode } from './news-public-toolbar';

const PAGE_LIMIT = 9;
const VALID_CATEGORIES = new Set<string>(NEWS_CATEGORY_OPTIONS.map((item) => item.value));

export function NewsPublicListing() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const rawCategory = searchParams.get('category') || '';
  const selectedCategory: NewsCategory | undefined = VALID_CATEGORIES.has(rawCategory)
    ? (rawCategory as NewsCategory)
    : undefined;

  const isPopular = searchParams.get('popular') === 'true';
  const isHot = !isPopular && searchParams.get('hot') === 'true';
  const sortMode: PublicNewsSortMode = isPopular ? 'popular' : isHot ? 'hot' : 'latest';

  const debouncedSearch = useDebounce(searchInput.trim(), 350);
  const offset = (page - 1) * PAGE_LIMIT;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'public-news-list',
      debouncedSearch,
      selectedCategory,
      isPopular,
      isHot,
      offset,
      PAGE_LIMIT,
    ],
    queryFn: () =>
      getPublicNewsList({
        search: debouncedSearch || undefined,
        category: selectedCategory,
        popular: isPopular || undefined,
        hot: isHot || undefined,
        offset,
        limit: PAGE_LIMIT,
      }),
  });

  const articles = data?.items || [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const isDefaultFirstPage =
    page === 1 && !debouncedSearch && !selectedCategory && !isPopular && !isHot;
  const featuredArticle =
    isDefaultFirstPage && articles.length > 0
      ? articles.find((item) => item.isFeatured) || articles[0]
      : null;
  const gridArticles = featuredArticle
    ? articles.filter((item) => item.id !== featuredArticle.id)
    : articles;

  const updateUrlParams = (updater: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    setPage(1);
  };

  const handleSelectCategory = (category?: NewsCategory) => {
    updateUrlParams((params) => {
      if (category) {
        params.set('category', category);
      } else {
        params.delete('category');
      }
    });
  };

  const handleSelectSortMode = (mode: PublicNewsSortMode) => {
    updateUrlParams((params) => {
      params.delete('popular');
      params.delete('hot');
      if (mode === 'popular') {
        params.set('popular', 'true');
      } else if (mode === 'hot') {
        params.set('hot', 'true');
      }
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    setPage(1);
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilter = Boolean(debouncedSearch || selectedCategory || isPopular || isHot);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <NewsPublicToolbar
        searchInput={searchInput}
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        sortMode={sortMode}
        onSelectSortMode={handleSelectSortMode}
      />

      {/* Danh sách bài viết */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {isLoading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 bg-white rounded-2xl border border-slate-200/80">
              <Skeleton className="lg:col-span-7 h-64 sm:h-80 rounded-xl" />
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-32 rounded-full" />
                  <Skeleton className="h-8 w-full rounded-lg" />
                  <Skeleton className="h-8 w-4/5 rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-3"
                >
                  <Skeleton className="h-44 w-full rounded-lg" />
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-12 w-full rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto my-6 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Chưa tìm thấy bài viết phù hợp
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              {hasActiveFilter
                ? 'Không có bài viết nào khớp với bộ lọc hiện tại. Hãy thử từ khóa hoặc chuyên mục khác.'
                : 'Hiện tại chưa có bài viết tin tức nào được xuất bản.'}
            </p>
            {hasActiveFilter && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleClearAllFilters}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {featuredArticle && <NewsArticleCard article={featuredArticle} featured />}

            {gridArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridArticles.map((article) => (
                  <NewsArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs sm:text-sm text-slate-500">
                  Hiển thị trang{' '}
                  <span className="font-mono tabular-nums font-bold text-slate-800">{page}</span> /{' '}
                  <span className="font-mono tabular-nums font-bold text-slate-800">
                    {totalPages}
                  </span>{' '}
                  (Tổng cộng{' '}
                  <span className="font-mono tabular-nums font-bold text-primary">{total}</span> bài
                  viết)
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || isFetching}
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Trang trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || isFetching}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Trang tiếp
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
