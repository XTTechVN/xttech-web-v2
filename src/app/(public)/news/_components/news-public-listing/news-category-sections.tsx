import React from 'react';
import { Skeleton } from '@/components';
import type { NewsArticle, NewsCategory } from '@/types';
import { NewsArticleCard } from '../news-article-card';
import { NEWS_CATEGORY_OPTIONS } from '@/config';

interface NewsCategorySectionsProps {
  isLoading: boolean;
  categoryArticlesMap: Record<NewsCategory, NewsArticle[]>;
  handleSelectCategory: (category?: NewsCategory) => void;
}

export function NewsCategorySections({ isLoading, categoryArticlesMap, handleSelectCategory }: NewsCategorySectionsProps) {
  // Nhóm 6 chuyên mục (4 chuyên mục dải ngang nền xám + 2 chuyên mục lớn 2 cột)
  const topFourCategories = NEWS_CATEGORY_OPTIONS.slice(0, 4);
  const bottomTwoCategories = NEWS_CATEGORY_OPTIONS.slice(4, 6);

  return (
    <>
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100/85 border-b-4 border-primary px-5 py-8 sm:px-8 rounded-t-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {topFourCategories.map((cat) => {
              const catArticles = categoryArticlesMap[cat.value] || [];
              const topCatArticle = catArticles[0];
              const bulletCatArticles = catArticles.slice(1, 4);

              return (
                <div key={cat.value} className="flex flex-col min-w-0 space-y-4">
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
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {bottomTwoCategories.map((cat) => {
              const catArticles = categoryArticlesMap[cat.value] || [];
              const mainCatArticle = catArticles[0];
              const subCatArticles = catArticles.slice(1, 3);

              return (
                <div key={cat.value} className="min-w-0 space-y-5">
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
    </>
  );
}
