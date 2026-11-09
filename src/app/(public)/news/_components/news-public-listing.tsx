'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CircleArrowRight,
  Eye,
  Flame,
  Newspaper,
  RotateCcw,
  Sparkles,
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
  const isEditorialHome = !hasActiveFilter && page === 1;

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

  // 2. Call API riêng cho khu vực Sự kiện / Tiêu điểm nổi bật (isFeatured = true)
  const { data: featuredData, isLoading: isLoadingFeatured } = useQuery({
    queryKey: ['public-news-list', 'featured-spotlight'],
    queryFn: () =>
      getPublicNewsList({
        isFeatured: true,
        limit: 6,
      }),
    enabled: isEditorialHome,
  });

  // 3. Call API lấy kho bài viết lớn hơn ở trang chủ để phân bổ vào các cột chuyên mục báo chí
  const { data: catalogData } = useQuery({
    queryKey: ['public-news-list', 'editorial-catalog'],
    queryFn: () =>
      getPublicNewsList({
        limit: 40,
      }),
    enabled: isEditorialHome,
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
  const catalogArticles = catalogData?.items?.length ? catalogData.items : articles;
  const sidebarArticles = sidebarData?.items || [];

  // Phân bổ bài viết cho bố cục Tạp chí / Trang tin tức (Tham khảo Ảnh 1, 2, 3)
  const leadHeroArticle: NewsArticle | null = useMemo(() => {
    if (!isEditorialHome) return null;
    return featuredArticles[0] || articles[0] || null;
  }, [isEditorialHome, featuredArticles, articles]);

  // Khối "Tin mới" bên dưới bài Lead Hero (1 bài sub-lead bên trái + 3 bài horizontal-sm bên phải)
  const latestBlockArticles = useMemo(() => {
    if (!isEditorialHome) return [];
    return articles.filter((item) => item.id !== leadHeroArticle?.id).slice(0, 4);
  }, [isEditorialHome, articles, leadHeroArticle]);

  const latestLeadArticle = latestBlockArticles[0] || leadHeroArticle || null;
  const latestSideArticles = latestBlockArticles.slice(1, 4);

  // Khối "Tiêu điểm / Sự kiện" cột phải (1 bài sub-lead + 2-3 bài dấu chấm tròn ngăn cách nét đứt)
  const eventBoxArticles = useMemo(() => {
    if (!isEditorialHome) return [];
    const pool = featuredArticles.length > 0 ? featuredArticles : articles;
    const filtered = pool.filter((item) => item.id !== leadHeroArticle?.id);
    return (filtered.length > 0 ? filtered : pool).slice(0, 4);
  }, [isEditorialHome, featuredArticles, articles, leadHeroArticle]);

  const eventBoxLead = eventBoxArticles[0] || null;
  const eventBoxBullets = eventBoxArticles.slice(1, 4);

  // Nhóm bài viết theo 6 chuyên mục (4 chuyên mục dải ngang nền xám + 2 chuyên mục lớn 2 cột)
  const topFourCategories = NEWS_CATEGORY_OPTIONS.slice(0, 4);
  const bottomTwoCategories = NEWS_CATEGORY_OPTIONS.slice(4, 6);

  const getArticlesForCategory = (cat: NewsCategory, fallbackStartIdx: number) => {
    const matched = catalogArticles.filter((item) => item.category === cat);
    if (matched.length > 0) return matched;
    // Nếu chuyên mục chưa có bài riêng trên DB test, hiển thị bài viết mới nhất để giữ bố cục trang tin tức đẹp mắt
    return catalogArticles.slice(fallbackStartIdx, fallbackStartIdx + 4);
  };

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
                  Cờ: Tiêu điểm nổi bật
                </Badge>
              )}
              {isPopular && (
                <Badge variant="info" size="sm" pill>
                  Cờ: Xem nhiều nhất
                </Badge>
              )}
              {isHot && (
                <Badge variant="danger" size="sm" pill>
                  Cờ: Tin Hot
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
              <span>Quay lại Trang chủ Tin tức</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          GIAO DIỆN TRANG CHỦ BÁO CHÍ / TẠP CHÍ (Tham khảo mẫu Ảnh 1, 2, 3)
         ===================================================================== */}
      {isEditorialHome && (
        <div className="space-y-12 pt-8">
          {/* SECTION 1: TOP HERO + TIN MỚI (Cột trái 8 cols) & BANNER + SỰ KIỆN TIÊU ĐIỂM (Cột phải 4 cols) */}
          <section className="w-full px-4 sm:px-8 lg:px-32">
            {isLoading && isLoadingFeatured ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                  <Skeleton className="w-full aspect-16/9 rounded-lg" />
                  <Skeleton className="h-8 w-4/5 rounded" />
                  <Skeleton className="h-16 w-full rounded" />
                </div>
                <div className="lg:col-span-4 space-y-6">
                  <Skeleton className="w-full h-56 rounded-lg" />
                  <Skeleton className="w-full h-80 rounded-lg" />
                </div>
              </div>
            ) : articles.length === 0 ? (
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

                  {/* Khối "Tin mới" (Mẫu Ảnh 1 & Ảnh 2: Tiêu đề Tin mới + Xem thêm ->, dưới là 1 bài trái + 3 bài ngang phải) */}
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
                        {/* Cột trái trong khối Tin mới: 1 bài sub-lead có ảnh + tiêu đề + ngày + mô tả */}
                        <div className="md:col-span-6">
                          <NewsArticleCard article={latestLeadArticle} variant="sub-lead" />
                        </div>

                        {/* Cột phải trong khối Tin mới: 3 bài ngang nhỏ (ảnh trái, tiêu đề + ngày phải) */}
                        <div className="md:col-span-6 space-y-4">
                          {(latestSideArticles.length > 0 ? latestSideArticles : articles.slice(0, 3)).map(
                            (item) => (
                              <NewsArticleCard
                                key={item.id}
                                article={item}
                                variant="horizontal-sm"
                              />
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* CỘT PHẢI (4 cols): Box Sự kiện / Tiêu điểm nổi bật (Mẫu Ảnh 1 & 2) */}
                <aside className="lg:col-span-4 space-y-6">
                  {/* Box 1: Giải pháp / Chuyên đề XTTech (Tương tự thẻ промо phía trên Sự kiện ở Ảnh 1) */}
                  <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#045863] via-[#066a77] to-[#033d45] text-white p-6 shadow-sm">
                    <div className="relative z-10 space-y-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                        Giải pháp XTTech 4.0
                      </span>
                      <h3 className="text-base sm:text-lg font-extrabold leading-snug">
                        Tự động hóa thiết kế CAD & Quản trị sản xuất Nhôm Kính toàn diện
                      </h3>
                      <p className="text-xs text-white/80 leading-relaxed">
                        Bóc tách vật tư chính xác, tối ưu cắt nhôm - kính và số hóa quy trình vận
                        hành xưởng trên một nền tảng duy nhất.
                      </p>
                      <div className="pt-1">
                        <Link
                          href="/solutions"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition-colors shadow-xs"
                        >
                          <span>Khám phá giải pháp</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                    <div className="pointer-events-none absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/10 blur-xl" />
                  </div>

                  {/* Box 2: Khối "Tiêu điểm / Sự kiện" (Mẫu Ảnh 1 & Ảnh 2: Khung trắng đổ bóng nhẹ, chữ tiêu đề nổi bật, 1 bài ảnh + các bài chấm tròn ngăn cách nét đứt) */}
                  {eventBoxLead && (
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
                    </div>
                  )}
                </aside>
              </div>
            )}
          </section>

          {/* SECTION 2: BANNER NGANG GIỮA TRANG (Tham khảo mẫu Ảnh 2) */}
          {articles.length > 0 && (
            <section className="w-full px-4 sm:px-8 lg:px-32">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#033d45] via-[#045863] to-[#0a7c8c] px-6 py-6 sm:px-10 sm:py-7 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1.5 text-center md:text-left max-w-2xl">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
                    Hệ sinh thái phần mềm & Công nghệ Nhôm Kính XTTech
                  </p>
                  <h3 className="text-lg sm:text-2xl font-extrabold tracking-tight">
                    Tăng tốc thiết kế kỹ thuật & Chuẩn hóa quản lý dự án Nhôm Kính
                  </h3>
                </div>
                <div className="shrink-0">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-sm transition-transform hover:-translate-y-0.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Đăng ký tư vấn miễn phí</span>
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 3: DẢI 4 CỘT CHUYÊN MỤC TRÊN NỀN XÁM NHẠT + ĐƯỜNG KẺ ĐẬM PHÍA DƯỚI (Tham khảo mẫu Ảnh 2 & đầu Ảnh 3) */}
          {articles.length > 0 && (
            <section className="w-full px-4 sm:px-8 lg:px-32">
              <div className="bg-slate-100/85 border-b-[3px] border-primary px-5 py-8 sm:px-8 rounded-t-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {topFourCategories.map((cat, idx) => {
                    const catArticles = getArticlesForCategory(cat.value, idx);
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

                        {topCatArticle ? (
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
                            Đang cập nhật bài viết...
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* SECTION 4: 2 CỘT CHUYÊN MỤC LỚN Sille-by-Side (Tham khảo mục "| Giải thưởng" & "| Câu chuyện thành công" ở Ảnh 3) */}
          {articles.length > 0 && bottomTwoCategories.length > 0 && (
            <section className="w-full px-4 sm:px-8 lg:px-32">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {bottomTwoCategories.map((cat, idx) => {
                  const catArticles = getArticlesForCategory(cat.value, idx + 2);
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

                      {mainCatArticle && (
                        <div className="space-y-4">
                          {/* Bài chính: Ảnh trái (50%) + Tiêu đề, ngày, mô tả phải (50%) */}
                          <NewsArticleCard article={mainCatArticle} variant="horizontal-md" />

                          {/* 2 bài phụ bên dưới chia 2 cột có chấm tròn + ngày tháng (Mẫu Ảnh 3) */}
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
          SECTION 5: KHO LƯU TRỮ BÀI VIẾT + BẢNG XẾP HẠNG ĐÁNH SỐ (1, 2, 3, 4, 5 - Mẫu cuối Ảnh 3)
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

          {/* Cột phải (4 cols): Bảng xếp hạng đánh số lớn 1, 2, 3, 4, 5 (Mẫu "Kiến thức quản trị" ở Ảnh 3) + 3 cờ API riêng */}
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
