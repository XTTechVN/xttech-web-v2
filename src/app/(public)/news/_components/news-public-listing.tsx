'use client';

import React, { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Flame,
  FolderOpen,
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sidebarTab, setSidebarTab] = useState<'popular' | 'hot'>('popular');

  const rawCategory = searchParams.get('category') || '';
  const selectedCategory: NewsCategory | undefined = VALID_CATEGORIES.has(rawCategory)
    ? (rawCategory as NewsCategory)
    : undefined;

  const isFeaturedFilter = searchParams.get('isFeatured') === 'true';
  const isPopular = !isFeaturedFilter && searchParams.get('popular') === 'true';
  const isHot = !isFeaturedFilter && !isPopular && searchParams.get('hot') === 'true';

  const sortMode: PublicNewsSortMode = isFeaturedFilter
    ? 'featured'
    : isPopular
      ? 'popular'
      : isHot
        ? 'hot'
        : 'latest';

  const debouncedSearch = useDebounce(searchInput.trim(), 350);
  const offset = (page - 1) * PAGE_LIMIT;

  // 1. Call API lấy danh sách bài viết chính theo đầy đủ các cờ (category, isFeatured, popular, hot, search, sortOrder)
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'public-news-list',
      debouncedSearch,
      selectedCategory,
      isFeaturedFilter,
      isPopular,
      isHot,
      sortOrder,
      offset,
      PAGE_LIMIT,
    ],
    queryFn: () =>
      getPublicNewsList({
        search: debouncedSearch || undefined,
        category: selectedCategory,
        isFeatured: isFeaturedFilter || undefined,
        popular: isPopular || undefined,
        hot: isHot || undefined,
        sortBy: 'createdAt',
        sortOrder,
        offset,
        limit: PAGE_LIMIT,
      }),
  });

  // 2. Call API riêng cho khu vực Tiêu điểm nổi bật (isFeatured = true)
  const showSpotlightSection =
    page === 1 && !debouncedSearch && sortMode === 'latest' && sortOrder === 'desc';

  const { data: featuredData, isLoading: isLoadingFeatured } = useQuery({
    queryKey: ['public-news-featured-spotlight', selectedCategory],
    queryFn: () =>
      getPublicNewsList({
        isFeatured: true,
        category: selectedCategory,
        limit: 4,
      }),
    enabled: showSpotlightSection,
  });

  // 3. Call API riêng cho Bảng xếp hạng Bài viết nhiều người xem (popular = true)
  const { data: popularData, isLoading: isLoadingPopular } = useQuery({
    queryKey: ['public-news-popular-sidebar'],
    queryFn: () =>
      getPublicNewsList({
        popular: true,
        limit: 5,
      }),
  });

  // 4. Call API riêng cho Bảng xếp hạng Tin Hot / Yêu thích (hot = true)
  const { data: hotData, isLoading: isLoadingHot } = useQuery({
    queryKey: ['public-news-hot-sidebar'],
    queryFn: () =>
      getPublicNewsList({
        hot: true,
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

  const popularArticles = popularData?.items || [];
  const hotArticles = hotData?.items || [];
  const sidebarArticles = sidebarTab === 'popular' ? popularArticles : hotArticles;
  const isSidebarLoading = sidebarTab === 'popular' ? isLoadingPopular : isLoadingHot;

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
      params.delete('isFeatured');
      params.delete('popular');
      params.delete('hot');
      if (mode === 'featured') {
        params.set('isFeatured', 'true');
      } else if (mode === 'popular') {
        params.set('popular', 'true');
      } else if (mode === 'hot') {
        params.set('hot', 'true');
      }
    });
  };

  const handleToggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    setSortOrder('desc');
    setPage(1);
    router.replace(pathname, { scroll: false });
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
        sortOrder={sortOrder}
        onToggleSortOrder={handleToggleSortOrder}
        totalCount={total}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-10">
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

          {/* Cột phải (Sticky Sidebar): Top Xem nhiều (popular=true), Tin Hot (hot=true) & Chuyên mục */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-22">
            {/* Widget 1: Bảng xếp hạng Xem nhiều / Tin Hot */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Bảng tin Xu hướng
                  </h3>
                </div>
              </div>

              {/* Chuyển đổi giữa cờ popular=true và hot=true */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100">
                <button
                  type="button"
                  onClick={() => setSidebarTab('popular')}
                  className={`inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    sidebarTab === 'popular'
                      ? 'bg-white text-primary shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem nhiều nhất</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab('hot')}
                  className={`inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    sidebarTab === 'hot'
                      ? 'bg-white text-rose-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Tin Hot / Yêu thích</span>
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
                    : 'Lọc tất cả bài viết Hot'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Widget 2: Khám phá theo Chuyên mục (Giữ đầy đủ chuyên mục) */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs p-5 space-y-3.5">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-primary" />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Chuyên mục bài viết
                </h3>
              </div>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectCategory(undefined)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    !selectedCategory
                      ? 'bg-primary text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-primary'
                  }`}
                >
                  <span>Tất cả chuyên mục</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-75" />
                </button>

                {NEWS_CATEGORY_OPTIONS.map((cat) => {
                  const isActive = selectedCategory === cat.value;
                  const badgeInfo = NEWS_CATEGORY_BADGE_MAP[cat.value];
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleSelectCategory(cat.value)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-primary text-white shadow-2xs'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-primary'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isActive
                            ? 'bg-white'
                            : badgeInfo?.variant === 'success'
                              ? 'bg-emerald-500'
                              : badgeInfo?.variant === 'info'
                                ? 'bg-sky-500'
                                : badgeInfo?.variant === 'warning'
                                  ? 'bg-amber-500'
                                  : badgeInfo?.variant === 'danger'
                                    ? 'bg-rose-500'
                                    : 'bg-primary'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
