import type { Metadata } from 'next';
import {
  PAGE_SEO_META,
  buildIntroduceJsonLd,
  buildPageMetadata,
  serializeJsonLd,
} from '@/config';
import { IntroducePageClient } from './_components';

export const metadata: Metadata = buildPageMetadata(PAGE_SEO_META.introduce);

export default function IntroducePage() {
  const jsonLd = buildIntroduceJsonLd();

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <IntroducePageClient />
    </main>
  );
}
