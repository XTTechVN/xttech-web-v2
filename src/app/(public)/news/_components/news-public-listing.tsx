'use client';

import React, { useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useQueries, useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CircleArrowRight,
  Eye,
  Flame,
  Newspaper,
  RotateCcw,
  Star,
} from 'lucide-react';
import { Badge, Button, Skeleton } from '@/components';
import {
  NEWS_CATEGORY_BADGE_MAP,
  NEWS_CATEGORY_MAP,
  NEWS_CATEGORY_OPTIONS,
} from '@/config';
import { getPublicNewsList } from '@/actions';
import { useDebounce } from '@/hooks';
import type { NewsArticle, NewsCategory } from '@/types';
import { NewsArticleCard } from './news-article-card';
import { NewsPublicToolbar, type PublicNewsSortMode } from './news-public-toolbar';

const PAGE_LIMIT = 12;
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

  const hasActiveFilter = Boolean(
    debouncedSearch || selectedCategory || isFeaturedFilter || isPopular || isHot,
  );
  // Hiển thị bố cục tạp chí khi ở trang 1 và không lọc riêng 1 chuyên mục hay từ khóa tìm kiếm
  const isEditorialView = !debouncedSearch && !selectedCategory && page === 1;

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

  // 2. Call API riêng cho khu vực Sự kiện / Tiêu điểm nổi bật (cờ isFeatured = true)
  const { data: featuredData, isLoading: isLoadingFeatured } = useQuery({
    queryKey: ['public-news-list', 'featured-spotlight'],
    queryFn: () =>
      getPublicNewsList({
        isFeatured: true,
        limit: 6,
      }),
    enabled: isEditorialView,
  });

  // 3. Call API riêng cho từng chuyên mục (6 chuyên mục ở Ảnh 3 & Ảnh 4) kèm theo đúng cờ đang chọn
  const categoryQueries = useQueries({
    queries: NEWS_CATEGORY_OPTIONS.map((cat) => ({
      queryKey: [
        'public-news-list',
        'category-section',
        cat.value,
        isFeaturedFilter,
        isPopular,
        isHot,
      ],
      queryFn: () =>
        getPublicNewsList({
          category: cat.value,
          isFeatured: isFeaturedFilter ? true : undefined,
          popular: isPopular ? true : undefined,
          hot: isHot ? true : undefined,
          limit: 4,
        }),
      enabled: isEditorialView,
    })),
  });

  // 4. Call API cho Bảng xếp hạng (1, 2, 3, 4, 5) theo đúng 1 trong 3 cờ: isFeatured=true | popular=true | hot=true
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
  const sidebarArticles = sidebarData?.items || [];

  // Map kết quả từng chuyên mục theo đúng cờ category (không fallback sang chuyên mục khác)
  const categoryArticlesMap = useMemo(() => {
    const map: Record<NewsCategory, { items: NewsArticle[]; isLoading: boolean }> = {
      company_news: { items: [], isLoading: false },
      industry_knowledge: { items: [], isLoading: false },
      project_showcase: { items: [], isLoading: false },
      technology_solution: { items: [], isLoading: false },
      recruitment_culture: { items: [], isLoading: false },
      promotion_event: { items: [], isLoading: false },
    };

    NEWS_CATEGORY_OPTIONS.forEach((cat, idx) => {
      const q = categoryQueries[idx];
      const rawItems = q?.data?.items || [];
      map[cat.value] = {
        items: rawItems.filter((item) => item.category === cat.value),
        isLoading: Boolean(q?.isLoading),
      };
    });

    return map;
  }, [categoryQueries]);

  // Bài đinh đầu trang (Lead Hero): lấy bài đầu tiên theo đúng cờ đang chọn (hoặc bài nổi bật khi ở tab Mới nhất)
  const leadHeroArticle: NewsArticle | null = useMemo(() => {
    if (!isEditorialView) return null;
    if (sortMode === 'latest') {
      return featuredArticles[0] || articles[0] || null;
    }
    return articles[0] || null;
  }, [isEditorialView, sortMode, featuredArticles, articles]);

  // Khối "Tin mới" bên dưới bài Lead Hero (1 bài sub-lead bên trái + 3 bài horizontal-sm bên phải)
  const latestBlockArticles = useMemo(() => {
    if (!isEditorialView) return [];
    return articles.filter((item) => item.id !== leadHeroArticle?.id).slice(0, 4);
  }, [isEditorialView, articles, leadHeroArticle]);

  const latestLeadArticle = latestBlockArticles[0] || null;
  const latestSideArticles = latestBlockArticles.slice(1, 4);

  // Khối "Tiêu điểm nổi bật" cột phải: chỉ lấy đúng các bài có cờ isFeatured = true
  const eventBoxArticles = useMemo(() => {
    if (!isEditorialView) return [];
    const strictFeatured = featuredArticles.filter((item) => item.isFeatured);
    const filtered = strictFeatured.filter((item) => item.id !== leadHeroArticle?.id);
    return (filtered.length > 0 ? filtered : strictFeatured).slice(0, 4);
  }, [isEditorialView, featuredArticles, leadHeroArticle]);

  const eventBoxLead = eventBoxArticles[0] || null;
  const eventBoxBullets = eventBoxArticles.slice(1, 4);

  // Nhóm 6 chuyên mục (4 chuyên mục dải ngang nền xám ở Ảnh 3 + 2 chuyên mục lớn 2 cột ở Ảnh 4)
  const topFourCategories = NEWS_CATEGORY_OPTIONS.slice(0, 4);
  const bottomTwoCategories = NEWS_CATEGORY_OPTIONS.slice(4, 6);

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

  return (
    <div className="min-h-screen bg-white pb-20">
      <NewsPublicToolbar
        searchInput={searchInput}
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        sortMode={sortMode}
        onSelectSortMode={handleSelectSortMode}
      />

      {/* Thanh trạng thái khi đang lọc hoặc tìm kiếm */}
      {hasActiveFilter && (
        <div className="w-full px-4 sm:px-8 lg:px-32 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 px-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <span className="font-semibold text-slate-600">Đang hiển thị:</span>
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
                  Cờ: Bài viết nổi bật (isFeatured)
                </Badge>
              )}
              {isPopular && (
                <Badge variant="info" size="sm" pill>
                  Cờ: Nhiều người xem (popular)
                </Badge>
              )}
              {isHot && (
                <Badge variant="danger" size="sm" pill>
                  Cờ: Tin Hot (hot)
                </Badge>
              )}
              {debouncedSearch && (
                <Badge variant="default" size="sm" pill>
                  Từ khóa: &ldquo;{debouncedSearch}&rdquo;
                </Badge>
              )}
              <span className="text-xs text-slate-400 font-mono tabular-nums ml-1">
                ({total} bài viết)
              </span>
            </div>

            <button
              type="button"
              onClick={handleClearAllFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại mặc định</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          GIAO DIỆN TRANG TIN TỨC BÁO CHÍ / TẠP CHÍ
         ===================================================================== */}
      {isEditorialView && (
        <div className="space-y-12 pt-8">
          {/* SECTION 1: TOP HERO + TIN MỚI (Cột trái 8 cols) & TIÊU ĐIỂM NỔI BẬT (Cột phải 4 cols) */}
          <section className="w-full px-4 sm:px-8 lg:px-32">
            {isLoading && isLoadingFeatured ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                  <Skeleton className="w-full aspect-16/9 rounded-lg" />
                  <Skeleton className="h-8 w-4/5 rounded" />
                  <Skeleton className="h-16 w-full rounded" />
                </div>
                <div className="lg:col-span-4 space-y-6">
                  <Skeleton className="w-full h-80 rounded-lg" />
                </div>
              </div>
            ) : articles.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-12 text-center my-2">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Newspaper className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Chưa có bài viết nào khớp với cờ lọc hiện tại
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
                  Hãy thử chuyển sang cờ lọc khác hoặc xem toàn bộ bài viết mới nhất.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* CỘT TRÁI (8 cols): BÀI Đinh (Lead Hero) + Khối "Tin mới" */}
                <div className="lg:col-span-8 space-y-10">
                  {leadHeroArticle && (
                    <NewsArticleCard article={leadHeroArticle} variant="lead-hero" />
                  )}

                  {/* Khối "Tin mới" */}
                  {latestLeadArticle && (
                    <div className="pt-2 space-y-5 border-t border-slate-200/80">
                      <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                          {sortMode === 'featured'
                            ? 'Tin nổi bật khác'
                            : sortMode === 'popular'
                              ? 'Tin xem nhiều tiếp theo'
                              : sortMode === 'hot'
                                ? 'Tin Hot tiếp theo'
                                : 'Tin mới'}
                        </h2>
                        <button
                          type="button"
                          onClick={() => {
                            const listEl = document.getElementById('all-news-archive');
                            listEl?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer"
                        >
                          <span>Xem thêm</span>
                          <CircleArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {/* Cột trái trong khối Tin mới: 1 bài sub-lead */}
                        <div className="md:col-span-6">
                          <NewsArticleCard article={latestLeadArticle} variant="sub-lead" />
                        </div>

                        {/* Cột phải trong khối Tin mới: tối đa 3 bài ngang nhỏ */}
                        {latestSideArticles.length > 0 && (
                          <div className="md:col-span-6 space-y-4">
                            {latestSideArticles.map((item) => (
                              <NewsArticleCard
                                key={item.id}
                                article={item}
                                variant="horizontal-sm"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* CỘT PHẢI (4 cols): Khối "Tiêu điểm nổi bật" lọc đúng theo cờ isFeatured = true */}
                <aside className="lg:col-span-4 space-y-6">
                  <div className="rounded-lg bg-white border border-slate-200/90 shadow-sm p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <h3 className="text-lg font-bold text-primary">Tiêu điểm nổi bật</h3>
                      <button
                        type="button"
                        onClick={() => handleSelectSortMode('featured')}
                        className="text-xs font-semibold text-slate-500 hover:text-primary cursor-pointer"
                      >
                        Tất cả
                      </button>
                    </div>

                    {isLoadingFeatured ? (
                      <div className="space-y-3">
                        <Skeleton className="w-full aspect-16/10 rounded-md" />
                        <Skeleton className="h-5 w-full rounded" />
                        <Skeleton className="h-4 w-4/5 rounded" />
                      </div>
                    ) : eventBoxLead ? (
                      <>
                        <NewsArticleCard
                          article={eventBoxLead}
                          variant="sub-lead"
                          hideDescription
                        />

                        {eventBoxBullets.length > 0 && (
                          <div className="divide-y divide-dashed divide-slate-200 pt-1">
                            {eventBoxBullets.map((item) => (
                              <div key={item.id} className="py-2.5 first:pt-1 last:pb-0">
                                <NewsArticleCard article={item} variant="bullet" />
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-6 text-center">
                        Chưa có bài viết nào được gắn cờ Nổi bật.
                      </p>
                    )}
                  </div>
                </aside>
              </div>
            )}
          </section>

          {/* SECTION 2: DẢI 4 CỘT CHUYÊN MỤC TRÊN NỀN XÁM NHẠT (Lọc đúng theo từng chuyên mục & cờ đang chọn) */}
          <section className="w-full px-4 sm:px-8 lg:px-32">
            <div className="bg-slate-100/85 border-b-[3px] border-primary px-5 py-8 sm:px-8 rounded-t-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {topFourCategories.map((cat) => {
                  const catState = categoryArticlesMap[cat.value];
                  const catArticles = catState?.items || [];
                  const topCatArticle = catArticles[0];
                  const bulletCatArticles = catArticles.slice(1, 4);

                  return (
                    <div key={cat.value} className="flex flex-col space-y-4">
                      {/* Header kiểu "| Tên chuyên mục" */}
                      <button
                        type="button"
                        onClick={() => handleSelectCategory(cat.value)}
                        className="group flex items-center gap-2 text-left cursor-pointer"
                      >
                        <span className="w-1 h-5 bg-primary rounded-xs shrink-0" />
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                          {cat.label}
                        </h3>
                      </button>

                      {catState?.isLoading ? (
                        <div className="space-y-3">
                          <Skeleton className="w-full aspect-16/10 rounded-md" />
                          <Skeleton className="h-5 w-full rounded" />
                          <Skeleton className="h-4 w-3/4 rounded" />
                        </div>
                      ) : topCatArticle ? (
                        <>
                          <NewsArticleCard
                            article={topCatArticle}
                            variant="sub-lead"
                            hideDescription
                          />

                          {bulletCatArticles.length > 0 && (
                            <div className="divide-y divide-dashed divide-slate-300/80 pt-1">
                              {bulletCatArticles.map((bItem) => (
                                <div key={bItem.id} className="py-2.5 first:pt-1 last:pb-0">
                                  <NewsArticleCard article={bItem} variant="bullet" />
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-slate-400 italic py-4">
                          Chưa có bài viết thuộc chuyên mục {cat.label.toLowerCase()}.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECTION 3: 2 CỘT CHUYÊN MỤC LỚN Side-by-Side (Lọc đúng theo chuyên mục Tuyển dụng & Văn hóa / Khuyến mãi & Sự kiện) */}
          {bottomTwoCategories.length > 0 && (
            <section className="w-full px-4 sm:px-8 lg:px-32">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {bottomTwoCategories.map((cat) => {
                  const catState = categoryArticlesMap[cat.value];
                  const catArticles = catState?.items || [];
                  const mainCatArticle = catArticles[0];
                  const subCatArticles = catArticles.slice(1, 3);

                  return (
                    <div key={cat.value} className="space-y-5">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleSelectCategory(cat.value)}
                          className="group flex items-center gap-2.5 text-left cursor-pointer"
                        >
                          <span className="w-1 h-5 bg-primary rounded-xs shrink-0" />
                          <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                            {cat.label}
                          </h3>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectCategory(cat.value)}
                          className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                        >
                          Xem thêm
                        </button>
                      </div>

                      {catState?.isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                          <Skeleton className="sm:col-span-6 aspect-16/10 rounded-md" />
                          <div className="sm:col-span-6 space-y-2">
                            <Skeleton className="h-5 w-full rounded" />
                            <Skeleton className="h-4 w-24 rounded" />
                            <Skeleton className="h-12 w-full rounded" />
                          </div>
                        </div>
                      ) : mainCatArticle ? (
                        <div className="space-y-4">
                          {/* Bài chính: Ảnh trái (50%) + Tiêu đề, ngày, mô tả phải (50%) */}
                          <NewsArticleCard article={mainCatArticle} variant="horizontal-md" />

                          {/* 2 bài phụ bên dưới chia 2 cột có chấm tròn + ngày tháng */}
                          {subCatArticles.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-200/80">
                              {subCatArticles.map((subItem) => (
                                <NewsArticleCard
                                  key={subItem.id}
                                  article={subItem}
                                  variant="bullet"
                                  showDateOnBullet
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center">
                          <p className="text-xs text-slate-400 italic">
                            Chưa có bài viết thuộc chuyên mục {cat.label.toLowerCase()}.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {/* =====================================================================
          SECTION 4: KHO LƯU TRỮ BÀI VIẾT + BẢNG XẾP HẠNG ĐÁNH SỐ (1, 2, 3, 4, 5)
         ===================================================================== */}
      <section
        id="all-news-archive"
        className="w-full px-4 sm:px-8 lg:px-32 pt-12 space-y-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start border-t border-slate-200 pt-10">
          {/* Cột trái (8 cols): Danh sách tất cả bài viết có phân trang */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-1 h-5 bg-primary rounded-xs shrink-0" />
                <h2 className="text-lg sm:text-xl font-bold text-primary">
                  {sortMode === 'featured'
                    ? 'Bài viết Tiêu điểm'
                    : sortMode === 'popular'
                      ? 'Bài viết Xem nhiều nhất'
                      : sortMode === 'hot'
                        ? 'Bài viết Tin Hot'
                        : selectedCategory
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
            ) : articles.length === 0 ? (
              <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-10 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại.
                </p>
                {hasActiveFilter && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={handleClearAllFilters}
                  >
                    Đặt lại bộ lọc
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="divide-y divide-slate-200/80">
                  {articles.map((article) => (
                    <div key={article.id} className="py-5 first:pt-0 last:pb-0">
                      <NewsArticleCard article={article} variant="horizontal-md" />
                    </div>
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

          {/* Cột phải (4 cols): Bảng xếp hạng đánh số lớn 1, 2, 3, 4, 5 + 3 cờ API riêng */}
          <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-1 h-5 bg-primary rounded-xs shrink-0" />
                <h3 className="text-lg sm:text-xl font-bold text-primary">Xu hướng đọc nhiều</h3>
              </div>
            </div>

            {/* 3 nút chuyển đổi gọi API theo 3 cờ độc lập: popular=true | hot=true | isFeatured=true */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-slate-100">
              <button
                type="button"
                onClick={() => setSidebarTab('popular')}
                className={`inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  sidebarTab === 'popular'
                    ? 'bg-white text-primary shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Xem nhiều</span>
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab('hot')}
                className={`inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
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
                className={`inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  sidebarTab === 'featured'
                    ? 'bg-white text-amber-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Star className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Tiêu điểm</span>
              </button>
            </div>

            {isSidebarLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : sidebarArticles.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                Chưa có dữ liệu bài viết trong mục này.
              </p>
            ) : (
              <div className="divide-y divide-slate-200">
                {sidebarArticles.map((item, index) => (
                  <NewsArticleCard
                    key={item.id}
                    article={item}
                    variant="numbered"
                    rank={index + 1}
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => handleSelectSortMode(sidebarTab)}
              className="w-full py-2.5 rounded-lg bg-slate-100 hover:bg-primary/10 text-primary text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>
                {sidebarTab === 'popular'
                  ? 'Xem toàn bộ bài Xem nhiều'
                  : sidebarTab === 'hot'
                    ? 'Xem toàn bộ bài Tin Hot'
                    : 'Xem toàn bộ bài Tiêu điểm'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </aside>
        </div>
      </section>
    </div>
  );
}
