import type { Metadata } from 'next';
import {
  PAGE_SEO_META,
  buildPageMetadata,
  buildPricingJsonLd,
  serializeJsonLd,
} from '@/config';
import PricingPageWrapper from './_components/pricing-page-wrapper';

export const metadata: Metadata = buildPageMetadata(PAGE_SEO_META.pricing);

export default function PricingPage() {
  const jsonLd = buildPricingJsonLd();

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <PricingPageWrapper />
    </main>
  );
}
