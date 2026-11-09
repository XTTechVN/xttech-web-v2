import { Suspense } from 'react';
import { Skeleton } from '@/components';
import { NewsPublicListing } from './_components/news-public-listing';

function NewsListingFallback() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
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
  return (
    <main>
      <Suspense fallback={<NewsListingFallback />}>
        <NewsPublicListing />
      </Suspense>
    </main>
  );
}
