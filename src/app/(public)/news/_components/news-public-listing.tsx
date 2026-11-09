'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  CircleArrowRight,
  Newspaper,
  RotateCcw,
} from 'lucide-react';
import { Badge, Button, Skeleton } from '@/components';
import {
  NEWS_CATEGORY_BADGE_MAP,
  NEWS_CATEGORY_MAP,
  NEWS_CATEGORY_OPTIONS,
  PUBLIC_NEWS_QUERY_KEYS,
} from '@/config';
import { getPublicNewsList } from '@/actions';
import { useDebounce } from '@/hooks';
import type { NewsArticle, NewsCategory } from '@/types';
import { NewsArticleCard } from './news-article-card';
import { NewsPublicToolbar } from './news-public-toolbar';

const FETCH_ALL_LIMIT = 999;
const PAGE_LIMIT = 12;
const MAX_FEATURED_SLIDES = 5;
const VALID_CATEGORIES = new Set<string>(NEWS_CATEGORY_OPTIONS.map((item) => item.value));

export function NewsPublicListing() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | undefined>(() => {
    const raw = searchParams.get('category') || '';
    return VALID_CATEGORIES.has(raw) ? (raw as NewsCategory) : undefined;
  });
  const [page, setPage] = useState(1);
  const [featuredSlideIdx, setFeaturedSlideIdx] = useState(0);
  const [isHoveringSlide, setIsHoveringSlide] = useState(false);

  const debouncedSearch = useDebounce(searchInput.trim(), 350);

  const hasActiveFilter = Boolean(debouncedSearch || selectedCategory);
  // Hiển thị bố cục tạp chí tự động chia khu vực khi ở trang 1 và không lọc riêng 1 chuyên mục hay tìm kiếm
  const isEditorialView = !hasActiveFilter && page === 1;

  // Call 1 API chính duy nhất lấy limit = 999 với queryKey thống nhất PUBLIC_NEWS_QUERY_KEYS.list
  // Toàn bộ các khu vực (Mới nhất, Nổi bật, Chuyên mục, Xem nhiều, Tin Hot, Tìm kiếm) tự động lọc/sắp xếp trên FE
  const { data, isLoading, isFetching } = useQuery({
    queryKey: PUBLIC_NEWS_QUERY_KEYS.list,
    queryFn: () =>
      getPublicNewsList({
        offset: 0,
        limit: FETCH_ALL_LIMIT,
      }),
  });

  const allArticles = useMemo(() => data?.items || [], [data?.items]);

  // Lọc theo chuyên mục & từ khóa tìm kiếm ngay trên FE từ allArticles (không cần gọi lại API)
  const filteredArticles = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase();
    return allArticles.filter((item) => {
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (keyword) {
        const matchTitle = item.title?.toLowerCase().includes(keyword);
        const matchSummary = item.summary?.toLowerCase().includes(keyword);
        return Boolean(matchTitle || matchSummary);
      }
      return true;
    });
  }, [allArticles, selectedCategory, debouncedSearch]);

  const total = filteredArticles.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  // Phân trang ngay trên FE từ danh sách filteredArticles
  const paginatedArticles = useMemo(() => {
    const start = (page - 1) * PAGE_LIMIT;
    return filteredArticles.slice(start, start + PAGE_LIMIT);
  }, [filteredArticles, page]);

  // 1. Tự động lọc bài viết Nổi bật (isFeatured = true, tối đa 5 bài cho Slide cột phải) trên FE
  const featuredSlideArticles = useMemo(
    () => allArticles.filter((item) => item.isFeatured).slice(0, MAX_FEATURED_SLIDES),
    [allArticles],
  );

  const safeFeaturedSlideIdx =
    featuredSlideArticles.length > 0 ? featuredSlideIdx % featuredSlideArticles.length : 0;

  // Tự động chuyển slide Tiêu điểm nổi bật mỗi 10s (tạm dừng khi di chuột vào, tự reset bộ đếm khi người dùng bấm chọn chấm)
  useEffect(() => {
    if (!isEditorialView || isHoveringSlide || featuredSlideArticles.length <= 1) return;
    const timer = window.setTimeout(() => {
      setFeaturedSlideIdx((prev) => (prev + 1) % featuredSlideArticles.length);
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [isEditorialView, isHoveringSlide, featuredSlideArticles.length, safeFeaturedSlideIdx]);

  // 2. Tự động sắp xếp Top 5 bài viết Xem nhiều nhất (theo viewCount giảm dần) trên FE
  const mostViewedArticles = useMemo(
    () => [...allArticles].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5),
    [allArticles],
  );

  // 3. Tự động sắp xếp Top 4 bài viết Tin Hot / Yêu thích (theo lượt thả tim & bình luận giảm dần) trên FE
  const hotArticles = useMemo(
    () =>
      [...allArticles]
        .sort(
          (a, b) =>
            b.likeCount * 2 + b.commentCount * 2 + b.viewCount -
            (a.likeCount * 2 + a.commentCount * 2 + a.viewCount),
        )
        .slice(0, 4),
    [allArticles],
  );

  // 4. Tự động lọc bài viết cho từng chuyên mục (6 chuyên mục) trên FE
  const categoryArticlesMap = useMemo(() => {
    const map: Record<NewsCategory, NewsArticle[]> = {
      company_news: [],
      industry_knowledge: [],
      project_showcase: [],
      technology_solution: [],
      recruitment_culture: [],
      promotion_event: [],
    };

    for (const item of allArticles) {
      if (map[item.category] && map[item.category].length < 4) {
        map[item.category].push(item);
      }
    }

    return map;
  }, [allArticles]);

  // Bài đinh đầu trang (Lead Hero): lấy bài mới nhất ở cột trái
  const leadHeroArticle: NewsArticle | null = useMemo(() => {
    if (!isEditorialView) return null;
    return allArticles[0] || null;
  }, [isEditorialView, allArticles]);

  // Khối "Tin mới" bên dưới bài Lead Hero (1 bài sub-lead bên trái + 3 bài horizontal-sm bên phải)
  const latestBlockArticles = useMemo(() => {
    if (!isEditorialView) return [];
    return allArticles.filter((item) => item.id !== leadHeroArticle?.id).slice(0, 4);
  }, [isEditorialView, allArticles, leadHeroArticle]);

  const latestLeadArticle = latestBlockArticles[0] || null;
  const latestSideArticles = latestBlockArticles.slice(1, 4);

  // Nhóm 6 chuyên mục (4 chuyên mục dải ngang nền xám + 2 chuyên mục lớn 2 cột)
  const topFourCategories = NEWS_CATEGORY_OPTIONS.slice(0, 4);
  const bottomTwoCategories = NEWS_CATEGORY_OPTIONS.slice(4, 6);

  const syncUrlParams = (nextCategory?: NewsCategory) => {
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
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
  };

  const handleSelectCategory = (category?: NewsCategory) => {
    setSelectedCategory(category);
    setPage(1);
    syncUrlParams(category);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    setSelectedCategory(undefined);
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
      />

      {/* Thanh trạng thái khi đang lọc chuyên mục hoặc tìm kiếm */}
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
              <span>Quay lại tất cả tin tức</span>
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
            {isLoading ? (
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
            ) : allArticles.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-12 text-center my-2">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Newspaper className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Hiện tại chưa có bài viết tin tức nào được xuất bản
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
                  Các bản tin công nghệ, công trình nhôm kính và hoạt động mới nhất của XTTech sẽ
                  được cập nhật tại đây.
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
                          Tin mới
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

                {/* CỘT PHẢI (4 cols): Khối "Tiêu điểm nổi bật" thiết kế dạng Slide (tối đa 5 bài isFeatured = true + chấm tròn chuyển slide) */}
                <aside className="lg:col-span-4 space-y-6">
                  <div
                    className="group/slide rounded-lg bg-white border border-slate-200/90 shadow-sm p-5 space-y-4"
                    onMouseEnter={() => setIsHoveringSlide(true)}
                    onMouseLeave={() => setIsHoveringSlide(false)}
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <h3 className="text-lg font-bold text-primary">Tiêu điểm nổi bật</h3>

                      {featuredSlideArticles.length > 1 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono tabular-nums text-slate-400 mr-1">
                            {safeFeaturedSlideIdx + 1}/{featuredSlideArticles.length}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setFeaturedSlideIdx(
                                (prev) =>
                                  (prev - 1 + featuredSlideArticles.length) %
                                  featuredSlideArticles.length,
                              )
                            }
                            aria-label="Bài nổi bật trước"
                            className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFeaturedSlideIdx(
                                (prev) => (prev + 1) % featuredSlideArticles.length,
                              )
                            }
                            aria-label="Bài nổi bật tiếp theo"
                            className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {featuredSlideArticles.length > 0 ? (
                      <div className="space-y-4">
                        {/* Khung trượt Slide ngang mượt mà (cubic-bezier + hiệu ứng scale & mờ dần) */}
                        <div className="overflow-hidden rounded-md">
                          <div
                            className="flex will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                            style={{
                              transform: `translateX(-${safeFeaturedSlideIdx * 100}%)`,
                            }}
                          >
                            {featuredSlideArticles.map((item, idx) => {
                              const isActive = idx === safeFeaturedSlideIdx;
                              return (
                                <div
                                  key={item.id}
                                  className={`w-full shrink-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                    isActive
                                      ? 'opacity-100 scale-100'
                                      : 'opacity-40 scale-[0.96]'
                                  }`}
                                >
                                  <NewsArticleCard article={item} variant="sub-lead" />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Chấm tròn chuyển slide (Pagination Dots giống mẫu ảnh gửi) */}
                        <div className="flex items-center justify-center gap-2.5 pt-1">
                          {featuredSlideArticles.map((item, idx) => {
                            const isActive = idx === safeFeaturedSlideIdx;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setFeaturedSlideIdx(idx)}
                                aria-label={`Xem bài nổi bật ${idx + 1}`}
                                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                                  isActive
                                    ? 'bg-[#6f857d] scale-110'
                                    : 'bg-slate-300/90 hover:bg-slate-400'
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>
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

          {/* SECTION 2: DẢI 4 CỘT CHUYÊN MỤC TRÊN NỀN XÁM NHẠT */}
          <section className="w-full px-4 sm:px-8 lg:px-32">
            <div className="bg-slate-100/85 border-b-4 border-primary px-5 py-8 sm:px-8 rounded-t-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {topFourCategories.map((cat) => {
                  const catArticles = categoryArticlesMap[cat.value] || [];
                  const topCatArticle = catArticles[0];
                  const bulletCatArticles = catArticles.slice(1, 4);

                  return (
                    <div key={cat.value} className="flex flex-col space-y-4">
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

                      {isLoading ? (
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

          {/* SECTION 3: 2 CỘT CHUYÊN MỤC LỚN Side-by-Side */}
          {bottomTwoCategories.length > 0 && (
            <section className="w-full px-4 sm:px-8 lg:px-32">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {bottomTwoCategories.map((cat) => {
                  const catArticles = categoryArticlesMap[cat.value] || [];
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

                      {isLoading ? (
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
                          <NewsArticleCard article={mainCatArticle} variant="horizontal-md" />

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
          SECTION 4: DANH SÁCH BÀI VIẾT + CỘT XEM NHIỀU & TIN HOT CỐ ĐỊNH
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
                    onClick={handleClearAllFilters}
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

          {/* Cột phải (4 cols): Khối Xem nhiều nhất (1..5) & Tin Hot cố định (Không dùng tab bấm chuyển đổi) */}
          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-20">
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
                <div className="flex items-center gap-2.5 border-b border-slate-200/80 pb-2.5">
                  <span className="w-1 h-5 bg-primary rounded-xs shrink-0" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
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
        </div>
      </section>
    </div>
  );
}
