import React from 'react';
import { CircleArrowRight, Newspaper } from 'lucide-react';
import { Skeleton } from '@/components';
import type { NewsArticle } from '@/types';
import { NewsArticleCard } from '../news-article-card';
import { NewsFeaturedSlider } from './news-featured-slider';
import { NewsSoftwareRegistrationForm } from '../news-software-registration-form';

interface NewsLeadSectionProps {
  isLoading: boolean;
  hasArticles: boolean;
  leadHeroArticle: NewsArticle | null;
  latestLeadArticle: NewsArticle | null;
  latestSideArticles: NewsArticle[];
  featuredSlideArticles: NewsArticle[];
  safeFeaturedSlideIdx: number;
  setFeaturedSlideIdx: React.Dispatch<React.SetStateAction<number>>;
  setIsHoveringSlide: (isHovering: boolean) => void;
}

export function NewsLeadSection({ isLoading, hasArticles, leadHeroArticle, latestLeadArticle, latestSideArticles, featuredSlideArticles, safeFeaturedSlideIdx, setFeaturedSlideIdx, setIsHoveringSlide }: NewsLeadSectionProps) {
  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16">
          <div className="lg:col-span-8 min-w-0 space-y-6">
            <Skeleton className="w-full aspect-16/9 rounded-lg" />
            <Skeleton className="h-8 w-4/5 rounded" />
            <Skeleton className="h-16 w-full rounded" />
          </div>
          <div className="lg:col-span-4 min-w-0 space-y-6">
            <Skeleton className="w-full h-80 rounded-lg" />
          </div>
        </div>
      ) : !hasArticles ? (
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-start">
          {/* CỘT TRÁI (8 cols): BÀI Đinh (Lead Hero) + Khối "Tin mới" */}
          <div className="lg:col-span-8 min-w-0 space-y-10">
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
                  <div className="md:col-span-6 min-w-0">
                    <NewsArticleCard article={latestLeadArticle} variant="sub-lead" />
                  </div>

                  {/* Cột phải trong khối Tin mới: tối đa 3 bài ngang nhỏ */}
                  {latestSideArticles.length > 0 && (
                    <div className="md:col-span-6 min-w-0 space-y-4">
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

          {/* CỘT PHẢI (4 cols): Khối "Tiêu điểm nổi bật" (Slide) & Form Yêu cầu sử dụng phần mềm */}
          <aside className="lg:col-span-4 min-w-0 w-full space-y-6">
            {featuredSlideArticles.length > 0 && (
              <NewsFeaturedSlider
                articles={featuredSlideArticles}
                activeIndex={safeFeaturedSlideIdx}
                setActiveIndex={setFeaturedSlideIdx}
                onHoverChange={setIsHoveringSlide}
              />
            )}

            {/* Form yêu cầu sử dụng phần mềm XTTECH */}
            <NewsSoftwareRegistrationForm />
          </aside>
        </div>
      )}
    </section>
  );
}
