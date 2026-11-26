import type { Metadata } from 'next';
import {
  PAGE_SEO_META,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  serializeJsonLd,
} from '@/config';
import { LegalPageView } from '../_components';

export const metadata: Metadata = buildPageMetadata(PAGE_SEO_META.privacy);

export default function PrivacyPolicyPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Trang chủ', path: '/' },
    { name: 'Chính sách bảo mật', path: '/privacy-policy' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <LegalPageView policyKey="privacy" />
    </>
  );
}
