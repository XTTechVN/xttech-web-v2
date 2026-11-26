import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import { NEWS_CATEGORY_BADGE_MAP, NEWS_CATEGORY_MAP } from '@/config';
import { getFileUrl } from '@/utils';
import type { NewsArticle } from '@/types';

interface HeroFeaturedArticleCardProps {
  article: NewsArticle;
}

/** Thẻ bài viết tiêu biểu trong băng chuyền trang chủ. */
export function HeroFeaturedArticleCard({ article }: HeroFeaturedArticleCardProps) {
  const categoryBadge = NEWS_CATEGORY_BADGE_MAP[article.category] || {
    label: NEWS_CATEGORY_MAP[article.category] || 'Tin tức',
    className: 'bg-primary/10 text-primary border-primary/20',
  };
  const thumbnailSrc = getFileUrl(article.thumbnailUrl);
  const href = `/news/${encodeURIComponent(article.slug)}`;

  return (
    <article className="group flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-2xl">
      <div className="space-y-4">
        <Link href={href} className="relative block aspect-16/10 w-full overflow-hidden rounded-2xl bg-slate-100">
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-linear-to-br from-primary/15 via-primary/5 to-slate-100 p-6 text-center text-primary">
              <Newspaper className="mb-2 h-12 w-12 stroke-[1.5] text-primary/70 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-[11px] font-bold tracking-wider text-primary/80 uppercase">XTTech Digital News</span>
            </div>
          )}
        </Link>

        <div className="space-y-2.5">
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${categoryBadge.className}`}>
            {categoryBadge.label}
          </span>
          <h3 className="line-clamp-2 text-base leading-snug font-bold text-slate-900 transition-colors group-hover:text-primary sm:text-[17px]">
            <Link href={href} className="flex items-start justify-between gap-3">
              <span>{article.title}</span>
              <span className="mt-0.5 shrink-0 text-lg font-bold text-primary transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </h3>
          {article.summary && (
            <p className="line-clamp-2 text-xs leading-relaxed text-slate-500 sm:text-sm">{article.summary}</p>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 text-xs text-slate-400">
        <span>XTTech Insight</span>
        <Link
          href={href}
          className="inline-flex items-center gap-1 font-bold text-primary transition-colors hover:text-primary-dark"
        >
          <span>Chi tiết</span>
          <span>→</span>
        </Link>
      </div>
    </article>
  );
}

