'use client';

import React from 'react';
import { ArticleCard } from './ArticleCard';
import { ArticleItem } from './HeroArticle';

interface ArticleGridProps {
  articles: ArticleItem[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const ArticleGrid: React.FC<ArticleGridProps> = ({
  articles,
  onLoadMore,
  hasMore = true,
}) => {
  return (
    <section className="flex flex-col items-center">
      {/* 3-column Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* Button Xem thêm bài viết */}
      {hasMore && (
        <div className="mt-10 mb-6">
          <button
            type="button"
            onClick={onLoadMore}
            className="px-6 py-2.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-98"
          >
            Xem thêm bài viết
          </button>
        </div>
      )}
    </section>
  );
};

export default ArticleGrid;

