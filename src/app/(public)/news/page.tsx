import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Skeleton } from '@/components';
import {
  PAGE_SEO_META,
  buildNewsListingJsonLd,
  buildPageMetadata,
  serializeJsonLd,
} from '@/config';
import { NewsPublicListing } from './_components/news-public-listing';

export const metadata: Metadata = buildPageMetadata(PAGE_SEO_META.news);

function NewsListingFallback() {
  return (
    <div className="w-full space-y-8 px-4 py-12 sm:px-8 lg:px-32">
      <Skeleton className="h-44 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function NewsPage() {
  const jsonLd = buildNewsListingJsonLd();

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <Suspense fallback={<NewsListingFallback />}>
        <NewsPublicListing />
      </Suspense>
    </main>
  );
}
