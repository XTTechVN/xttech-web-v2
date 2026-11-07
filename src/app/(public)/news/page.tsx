import { Suspense } from 'react';
import { Skeleton } from '@/components';
import { Header, Footer } from '../_components';
import { NewsPublicListing } from './_components/news-public-listing';

function NewsListingFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Skeleton className="h-44 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-primary/15 selection:text-primary">
      <Header />
      <main>
        <Suspense fallback={<NewsListingFallback />}>
          <NewsPublicListing />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
