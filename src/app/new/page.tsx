'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '../_components';
import { NewsHeaderBar } from './_components/NewsHeaderBar';
import { CategoryFilter } from './_components/CategoryFilter';
import { HeroArticle } from './_components/HeroArticle';
import { TrendingSidebar } from './_components/TrendingSidebar';
import { ArticleGrid } from './_components/ArticleGrid';
import {
  CATEGORIES,
  mockArticles,
  mockTrendingArticles,
} from './mockup-data/home';

export default function PublicNewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [displayCount, setDisplayCount] = useState(6);

  // Lọc bài viết theo danh mục & từ khoá tìm kiếm
  const filteredArticles = useMemo(() => {
    let result = [...mockArticles];

    // Lọc theo chuyên mục
    if (activeCategoryId !== 'all') {
      result = result.filter(
        (article) =>
          article.category.id === activeCategoryId ||
          article.category.slug === activeCategoryId,
      );
    }

    // Lọc theo tìm kiếm tiêu đề hoặc tóm tắt
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (article) =>
          article.title.toLowerCase().includes(q) ||
          article.summary.toLowerCase().includes(q) ||
          article.author.name.toLowerCase().includes(q),
      );
    }

    return result;
  }, [activeCategoryId, searchQuery]);

  const visibleArticles = filteredArticles.slice(0, displayCount);
  const hasMore = displayCount < filteredArticles.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 6);
  };

  // Bài viết nổi bật (Hero) & Tin đọc nhiều
  const heroArticle = mockArticles[0];
  const trendingArticles = mockTrendingArticles;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      {/* Main Website Header (không có footer) */}
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl flex-1 flex flex-col gap-6">
        {/* Top Header Bar của chuyên trang: Logo "Nhôm Kính Today" & Ô tìm kiếm */}
        <NewsHeaderBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Thanh danh mục lọc bài viết */}
        <CategoryFilter
          categories={CATEGORIES}
          activeCategoryId={activeCategoryId}
          onSelectCategory={(catId) => {
            setActiveCategoryId(catId);
            setDisplayCount(6);
          }}
        />

        {/* Khối Hero + Đọc nhiều nhất (chỉ hiển thị đầy đủ khi ở tab Tất cả và không tìm kiếm) */}
        {activeCategoryId === 'all' && !searchQuery.trim() && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Bài viết nổi bật bên trái (8 cột) */}
            <div className="lg:col-span-8 flex flex-col">
              <HeroArticle article={heroArticle} />
            </div>

            {/* Đọc nhiều nhất bên phải (4 cột) */}
            <div className="lg:col-span-4 flex flex-col">
              <TrendingSidebar items={trendingArticles} />
            </div>
          </section>
        )}

        {/* Danh sách lưới các bài viết */}
        <section className="mt-2">
          {visibleArticles.length > 0 ? (
            <ArticleGrid
              articles={visibleArticles}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 my-4 shadow-2xs">
              <p className="text-slate-500 text-sm font-medium">
                Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
