'use client';

import React from 'react';
import Link from 'next/link';

export interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  thumbnail?: string;
  coverImage?: string;
  bannerGradient?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  publishedAt: string;
  date?: string;
  readingTime: string;
  views?: number;
}

interface HeroArticleProps {
  article: ArticleItem;
}

export const HeroArticle: React.FC<HeroArticleProps> = ({ article }) => {
  if (!article) return null;

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Visual illustration / blueprint banner */}
      <Link
        href={`/new/${article.slug}`}
        className="block relative h-48 sm:h-56 w-full bg-slate-200/70 overflow-hidden cursor-pointer"
      >
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#94a3b8_1px,transparent_1px),linear-gradient(to_bottom,#94a3b8_1px,transparent_1px)] bg-[size:24px_24px]"
        />

        {article.thumbnail ? (
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 mix-blend-multiply opacity-80"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-mono">
              XTTech Aluminum Precision
            </span>
          </div>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Badge Nổi bật */}
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500 text-white shadow-2xs">
              Nổi bật
            </span>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
            <Link href={`/new/${article.slug}`}>
              {article.title}
            </Link>
          </h2>

          {/* Summary */}
          <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2">
            {article.summary}
          </p>
        </div>

        {/* Meta Info */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
          <span>{article.author.name}</span>
          <span>·</span>
          <span>{article.date || article.publishedAt}</span>
          <span>·</span>
          <span>{article.readingTime}</span>
        </div>
      </div>
    </article>
  );
};

export default HeroArticle;

