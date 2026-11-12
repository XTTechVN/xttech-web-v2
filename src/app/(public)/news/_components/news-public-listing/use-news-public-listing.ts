'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PUBLIC_NEWS_QUERY_KEYS } from '@/config';
import { getPublicNewsList } from '@/actions';
import { useDebounce } from '@/hooks';
import type { NewsArticle, NewsCategory } from '@/types';
import {
  FEATURED_SLIDE_INTERVAL_MS,
  FETCH_ALL_LIMIT,
  MAX_FEATURED_SLIDES,
  PAGE_LIMIT,
  VALID_CATEGORIES,
} from './news-public-listing.constants';

/** Gom toàn bộ state, dữ liệu phái sinh & handler của trang danh sách tin tức công khai. */
export function useNewsPublicListing() {
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
    }, FEATURED_SLIDE_INTERVAL_MS);
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

  return {
    searchInput,
    selectedCategory,
    page,
    setPage,
    setFeaturedSlideIdx,
    setIsHoveringSlide,
    safeFeaturedSlideIdx,
    isLoading,
    isFetching,
    hasActiveFilter,
    isEditorialView,
    allArticles,
    total,
    totalPages,
    paginatedArticles,
    featuredSlideArticles,
    mostViewedArticles,
    hotArticles,
    categoryArticlesMap,
    leadHeroArticle,
    latestLeadArticle,
    latestSideArticles,
    handleSelectCategory,
    handleSearchChange,
    handleClearAllFilters,
  };
}
