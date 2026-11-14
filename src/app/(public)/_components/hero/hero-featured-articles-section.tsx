'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { getPublicNewsList } from '@/actions';
import { PUBLIC_NEWS_QUERY_KEYS } from '@/config';
import type { NewsArticle } from '@/types';
import { HeroFeaturedArticleCard } from './hero-featured-article-card';
import { useHeroMarquee } from './use-hero-marquee';

/** Số bài tối đa lấy từ API tin tức công khai. */
const FEATURED_ARTICLES_LIMIT = 12;
/** Số bài tối thiểu trong 1 dải để băng chuyền phủ đủ chiều rộng màn hình. */
const MIN_ITEMS_PER_STRIP = 6;

export function HeroFeaturedArticlesSection() {
  const { trackRef, viewportHandlers } = useHeroMarquee();
  const { data } = useQuery({
    queryKey: PUBLIC_NEWS_QUERY_KEYS.list,
    queryFn: () => getPublicNewsList({ limit: FEATURED_ARTICLES_LIMIT }),
  });

  const articles = (data?.items || []) as NewsArticle[];
  if (articles.length === 0) return null;

  // Lặp danh sách đủ dài cho 1 dải, rồi nhân đôi dải để chạy vòng lặp liền mạch (-50%)
  const repeat = Math.max(1, Math.ceil(MIN_ITEMS_PER_STRIP / articles.length));
  const strip = Array.from({ length: repeat }, () => articles).flat();
  const track = [...strip, ...strip];

  return (
    <section className="overflow-hidden border-t border-slate-100 bg-[#fcfdfd] py-8 lg:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 text-center sm:mb-5 sm:text-left">
          <h2 className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl lg:text-4xl">
            Bài viết tiêu biểu
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
            Kiến thức quản trị sản xuất, bóc tách bareme &amp; xu hướng công nghệ ngành nhôm kính
          </p>
        </div>
      </div>

      {/* Dải thước phim: giới hạn trong vùng nội dung, tự trượt, dừng khi hover, kéo trái/phải được */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          {...viewportHandlers}
          className="relative cursor-grab touch-pan-y overflow-hidden py-4 select-none active:cursor-grabbing [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
        >
          <div ref={trackRef} className="flex w-max will-change-transform">
            {track.map((article, i) => (
              <div key={`${article.id}-${i}`} className="w-[290px] shrink-0 px-3 sm:w-[340px] lg:w-[400px]">
                <HeroFeaturedArticleCard article={article} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 text-center sm:mt-12">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold text-primary shadow-2xs transition-all hover:border-primary hover:bg-primary/5 sm:text-sm"
        >
          <span>Xem tất cả bài viết</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

export default HeroFeaturedArticlesSection;
