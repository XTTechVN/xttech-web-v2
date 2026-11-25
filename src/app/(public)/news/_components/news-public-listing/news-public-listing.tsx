'use client';

import React from 'react';
import { NewsPublicToolbar } from '../news-public-toolbar';
import { NewsArchiveList } from './news-archive-list';
import { NewsArchiveSidebar } from './news-archive-sidebar';
import { NewsCategorySections } from './news-category-sections';
import { NewsLeadSection } from './news-lead-section';
import { useNewsPublicListing } from './use-news-public-listing';

export function NewsPublicListing() {
  const listing = useNewsPublicListing();

  return (
    <div className="min-h-screen bg-white pb-20">
      <NewsPublicToolbar
        searchInput={listing.searchInput}
        onSearchChange={listing.handleSearchChange}
        selectedCategory={listing.selectedCategory}
        onSelectCategory={listing.handleSelectCategory}
      />

      {/* =====================================================================
          GIAO DIỆN TRANG TIN TỨC BÁO CHÍ / TẠP CHÍ
         ===================================================================== */}
      {listing.isEditorialView && (
        <div className="space-y-12 pt-8">
          {/* SECTION 1: TOP HERO + TIN MỚI (Cột trái 8 cols) & TIÊU ĐIỂM NỔI BẬT (Cột phải 4 cols) */}
          <NewsLeadSection
            isLoading={listing.isLoading}
            hasArticles={listing.allArticles.length > 0}
            leadHeroArticle={listing.leadHeroArticle}
            latestLeadArticle={listing.latestLeadArticle}
            latestSideArticles={listing.latestSideArticles}
            featuredSlideArticles={listing.featuredSlideArticles}
            safeFeaturedSlideIdx={listing.safeFeaturedSlideIdx}
            setFeaturedSlideIdx={listing.setFeaturedSlideIdx}
            setIsHoveringSlide={listing.setIsHoveringSlide}
          />

          {/* SECTION 2 + 3: DẢI 4 CỘT CHUYÊN MỤC & 2 CỘT CHUYÊN MỤC LỚN */}
          <NewsCategorySections
            isLoading={listing.isLoading}
            categoryArticlesMap={listing.categoryArticlesMap}
            handleSelectCategory={listing.handleSelectCategory}
          />
        </div>
      )}

      {/* =====================================================================
          SECTION 4: DANH SÁCH BÀI VIẾT + CỘT XEM NHIỀU & TIN HOT CỐ ĐỊNH
         ===================================================================== */}
      <section
        id="all-news-archive"
        className="max-w-[1440px] mx-auto w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-12 space-y-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start border-t border-slate-200 pt-10">
          <NewsArchiveList
            isLoading={listing.isLoading}
            isFetching={listing.isFetching}
            selectedCategory={listing.selectedCategory}
            hasActiveFilter={listing.hasActiveFilter}
            paginatedArticles={listing.paginatedArticles}
            total={listing.total}
            totalPages={listing.totalPages}
            page={listing.page}
            setPage={listing.setPage}
            onClearFilters={listing.handleClearAllFilters}
          />
          <NewsArchiveSidebar
            isLoading={listing.isLoading}
            mostViewedArticles={listing.mostViewedArticles}
            hotArticles={listing.hotArticles}
          />
        </div>
      </section>
    </div>
  );
}
