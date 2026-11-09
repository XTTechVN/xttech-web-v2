'use client';

import React, { useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Flame,
  Newspaper,
  RotateCcw,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import { Badge, Button, Skeleton } from '@/components';
import { NEWS_CATEGORY_BADGE_MAP, NEWS_CATEGORY_MAP, NEWS_CATEGORY_OPTIONS } from '@/config';
import { getPublicNewsList } from '@/actions';
import { useDebounce } from '@/hooks';
import type { NewsCategory } from '@/types';
import { NewsArticleCard } from './news-article-card';
import { NewsPublicToolbar, type PublicNewsSortMode } from './news-public-toolbar';

const PAGE_LIMIT = 8;
const VALID_CATEGORIES = new Set<string>(NEWS_CATEGORY_OPTIONS.map((item) => item.value));

export function NewsPublicListing() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | undefined>(() => {
    const raw = searchParams.get('category') || '';
    return VALID_CATEGORIES.has(raw) ? (raw as NewsCategory) : undefined;
  });
  const [sortMode, setSortMode] = useState<PublicNewsSortMode>(() => {
    if (searchParams.get('isFeatured') === 'true') return 'featured';
    if (searchParams.get('popular') === 'true') return 'popular';
    if (searchParams.get('hot') === 'true') return 'hot';
    return 'latest';
  });
  const [page, setPage] = useState(1);
  const [sidebarTab, setSidebarTab] = useState<'featured' | 'popular' | 'hot'>('popular');

  const isFeaturedFilter = sortMode === 'featured';
  const isPopular = sortMode === 'popular';
  const isHot = sortMode === 'hot';

  const debouncedSearch = useDebounce(searchInput.trim(), 350);
  const offset = (page - 1) * PAGE_LIMIT;

  // 1. Call API lấy danh sách bài viết chính theo đúng cờ đang chọn (isFeatured, popular, hot, category, search)
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'public-news-list',
      'main',
      debouncedSearch,
      selectedCategory,
      isFeaturedFilter,
      isPopular,
      isHot,
      offset,
      PAGE_LIMIT,
    ],
    queryFn: () =>
      getPublicNewsList({
        search: debouncedSearch || undefined,
        category: selectedCategory,
        isFeatured: isFeaturedFilter ? true : undefined,
        popular: isPopular ? true : undefined,
        hot: isHot ? true : undefined,
        offset,
        limit: PAGE_LIMIT,
      }),
  });

  // 2. Call API riêng cho khu vực Tiêu điểm nổi bật (isFeatured = true) - cùng root key 'public-news-list'
  const showSpotlightSection =
    page === 1 && !debouncedSearch && !selectedCategory && sortMode === 'latest';

  const { data: featuredData, isLoading: isLoadingFeatured } = useQuery({
    queryKey: ['public-news-list', 'featured-spotlight'],
    queryFn: () =>
      getPublicNewsList({
        isFeatured: true,
        limit: 4,
      }),
    enabled: showSpotlightSection,
  });

  // 3. Call API cho Bảng tin Xu hướng (Sidebar) theo đúng 1 trong 3 cờ: isFeatured=true | popular=true | hot=true
  const { data: sidebarData, isLoading: isSidebarLoading } = useQuery({
    queryKey: ['public-news-list', 'sidebar-flag', sidebarTab],
    queryFn: () =>
      getPublicNewsList({
        isFeatured: sidebarTab === 'featured' ? true : undefined,
        popular: sidebarTab === 'popular' ? true : undefined,
        hot: sidebarTab === 'hot' ? true : undefined,
        limit: 5,
      }),
  });

  const articles = data?.items || [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const featuredArticles = featuredData?.items || [];
  const primaryFeatured = showSpotlightSection
    ? featuredArticles[0] || articles.find((item) => item.isFeatured) || null
    : null;
  const subFeaturedList = showSpotlightSection
    ? featuredArticles.filter((item) => item.id !== primaryFeatured?.id).slice(0, 3)
    : [];

  const gridArticles = primaryFeatured
    ? articles.filter((item) => item.id !== primaryFeatured.id)
    : articles;

  const sidebarArticles = sidebarData?.items || [];

  const syncUrlParams = (nextCategory?: NewsCategory, nextMode?: PublicNewsSortMode) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (nextCategory) {
      params.set('category', nextCategory);
    } else {
      params.delete('category');
    }
    params.delete('isFeatured');
    params.delete('popular');
    params.delete('hot');
    if (nextMode === 'featured') {
      params.set('isFeatured', 'true');
    } else if (nextMode === 'popular') {
      params.set('popular', 'true');
    } else if (nextMode === 'hot') {
      params.set('hot', 'true');
    }
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
  };

  const handleSelectCategory = (category?: NewsCategory) => {
    setSelectedCategory(category);
    setPage(1);
    syncUrlParams(category, sortMode);
  };

  const handleSelectSortMode = (mode: PublicNewsSortMode) => {
    setSortMode(mode);
    setPage(1);
    syncUrlParams(selectedCategory, mode);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    setSelectedCategory(undefined);
    setSortMode('latest');
    setPage(1);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', pathname);
    }
  };

  const hasActiveFilter = Boolean(
    debouncedSearch || selectedCategory || isFeaturedFilter || isPopular || isHot,
  );

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      <NewsPublicToolbar
        searchInput={searchInput}
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        sortMode={sortMode}
        onSelectSortMode={handleSelectSortMode}
      />

      <div className="w-full px-4 sm:px-8 lg:px-32 pt-8 sm:pt-10 space-y-10">
        {/* Thanh trạng thái bộ lọc đang kích hoạt */}
        {hasActiveFilter && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 px-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <span className="font-semibold text-slate-600">Đang lọc theo:</span>
              {selectedCategory && (
                <Badge
                  variant={NEWS_CATEGORY_BADGE_MAP[selectedCategory]?.variant || 'primary'}
                  size="sm"
                  pill
                >
                  Chuyên mục: {NEWS_CATEGORY_MAP[selectedCategory]}
                </Badge>
              )}
              {isFeaturedFilter && (
                <Badge variant="warning" size="sm" pill>
                  Cờ: Bài viết nổi bật
                </Badge>
              )}
              {isPopular && (
                <Badge variant="info" size="sm" pill>
                  Cờ: Nhiều người xem nhất
                </Badge>
              )}
              {isHot && (
                <Badge variant="danger" size="sm" pill>
                  Cờ: Tin Hot / Yêu thích
                </Badge>
              )}
              {debouncedSearch && (
                <Badge variant="default" size="sm" pill>
                  Từ khóa: &ldquo;{debouncedSearch}&rdquo;
                </Badge>
              )}
              <span className="text-xs text-slate-400 font-mono tabular-nums ml-1">
                ({total} kết quả)
              </span>
            </div>

            <button
              type="button"
              onClick={handleClearAllFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại mặc định</span>
            </button>
          </div>
        )}

        {/* KHU VỰC TIÊU ĐIỂM NỔI BẬT (isFeatured = true) */}
        {showSpotlightSection && (isLoadingFeatured || primaryFeatured) && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    Tiêu điểm & Bài viết nổi bật
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectSortMode('featured')}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:underline cursor-pointer"
              >
                <span>Xem tất cả bài nổi bật</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {isLoadingFeatured && !primaryFeatured ? (
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
            ) : (
              primaryFeatured && (
                <div className="space-y-4">
                  <NewsArticleCard article={primaryFeatured} featured />

                  {subFeaturedList.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {subFeaturedList.map((subItem) => (
                        <NewsArticleCard key={subItem.id} article={subItem} compact />
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </section>
        )}

        {/* BỐ CỤC 2 CỘT: DANH SÁCH BÀI VIẾT CHÍNH (TRÁI) + SIDEBAR XEM NHIỀU & CHUYÊN MỤC (PHẢI) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cột chính: Danh sách bài viết */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                {sortMode === 'featured' ? (
                  <Star className="w-5 h-5 text-amber-500" />
                ) : sortMode === 'popular' ? (
                  <Eye className="w-5 h-5 text-sky-600" />
                ) : sortMode === 'hot' ? (
                  <Flame className="w-5 h-5 text-rose-600" />
                ) : (
                  <Newspaper className="w-5 h-5 text-primary" />
                )}
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {sortMode === 'featured'
                    ? 'Danh sách bài viết nổi bật'
                    : sortMode === 'popular'
                      ? 'Bài viết nhiều người xem nhất'
                      : sortMode === 'hot'
                        ? 'Bài viết Hot & được yêu thích'
                        : selectedCategory
                          ? NEWS_CATEGORY_MAP[selectedCategory]
                          : 'Tin tức & Bài viết mới cập nhật'}
                </h2>
              </div>

              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {total} bài viết
              </span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            ) : articles.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center my-2 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Newspaper className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Chưa tìm thấy bài viết phù hợp
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed max-w-md mx-auto">
                  {hasActiveFilter
                    ? 'Không có bài viết nào khớp với bộ lọc hiện tại. Hãy thử đổi từ khóa, cờ lọc hoặc chuyên mục khác.'
                    : 'Hiện tại chưa có bài viết tin tức nào được xuất bản.'}
                </p>
                {hasActiveFilter && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={handleClearAllFilters}
                  >
                    Xóa toàn bộ bộ lọc
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(gridArticles.length > 0 ? gridArticles : articles).map((article) => (
                    <NewsArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                  <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs sm:text-sm text-slate-500">
                      Trang{' '}
                      <span className="font-mono tabular-nums font-bold text-slate-800">
                        {page}
                      </span>{' '}
                      /{' '}
                      <span className="font-mono tabular-nums font-bold text-slate-800">
                        {totalPages}
                      </span>{' '}
                      (Tổng{' '}
                      <span className="font-mono tabular-nums font-bold text-primary">{total}</span>{' '}
                      bài viết)
                    </p>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1 || isFetching}
                        leftIcon={<ChevronLeft className="w-4 h-4" />}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Trước
                      </Button>

                      {Array.from({ length: totalPages })
                        .map((_, i) => i + 1)
                        .filter(
                          (p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1),
                        )
                        .map((p, idx, arr) => {
                          const prev = arr[idx - 1];
                          const showEllipsis = prev && p - prev > 1;
                          return (
                            <React.Fragment key={p}>
                              {showEllipsis && (
                                <span className="px-1.5 text-xs text-slate-400">...</span>
                              )}
                              <button
                                type="button"
                                onClick={() => setPage(p)}
                                disabled={isFetching}
                                className={`w-8 h-8 rounded-lg text-xs font-mono tabular-nums font-bold transition-colors cursor-pointer ${
                                  p === page
                                    ? 'bg-primary text-white shadow-2xs'
                                    : 'bg-white border border-slate-200 text-slate-700 hover:border-primary/40 hover:text-primary'
                                }`}
                              >
                                {p}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages || isFetching}
                        rightIcon={<ChevronRight className="w-4 h-4" />}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Tiếp
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cột phải (Sticky Sidebar): 3 cờ riêng biệt (popular=true | hot=true | isFeatured=true) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-22">
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Bảng tin Xu hướng
                  </h3>
                </div>
              </div>

              {/* Chuyển đổi giữa đủ 3 cờ: popular=true | hot=true | isFeatured=true */}
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100">
                <button
                  type="button"
                  onClick={() => setSidebarTab('popular')}
                  className={`inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    sidebarTab === 'popular'
                      ? 'bg-white text-sky-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Xem nhiều</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab('hot')}
                  className={`inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    sidebarTab === 'hot'
                      ? 'bg-white text-rose-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Tin Hot</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab('featured')}
                  className={`inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    sidebarTab === 'featured'
                      ? 'bg-white text-amber-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Nổi bật</span>
                </button>
              </div>

              {isSidebarLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-20 w-full rounded-xl" />
                  ))}
                </div>
              ) : sidebarArticles.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  Chưa có dữ liệu bài viết trong mục này.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {sidebarArticles.map((item, index) => (
                    <NewsArticleCard key={item.id} article={item} compact rank={index + 1} />
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleSelectSortMode(sidebarTab)}
                className="w-full py-2 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>
                  {sidebarTab === 'popular'
                    ? 'Lọc tất cả bài nhiều người xem'
                    : sidebarTab === 'hot'
                      ? 'Lọc tất cả bài viết Hot'
                      : 'Lọc tất cả bài viết nổi bật'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
