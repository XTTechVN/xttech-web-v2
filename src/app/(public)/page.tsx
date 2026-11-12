import type { Metadata } from 'next';
import {
  PAGE_SEO_META,
  buildHomeJsonLd,
  buildPageMetadata,
  serializeJsonLd,
} from '@/config';
import { syncProjectImages } from '@/lib/sync-project-assets';
import { Hero } from './_components';

export const metadata: Metadata = buildPageMetadata(PAGE_SEO_META.home);

export default function Home() {
  syncProjectImages();
  const jsonLd = buildHomeJsonLd();

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <Hero />
    </main>
  );
}
