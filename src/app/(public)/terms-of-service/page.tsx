import type { Metadata } from 'next';
import {
  PAGE_SEO_META,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  serializeJsonLd,
} from '@/config';
import { LegalPageView } from '../_components';

export const metadata: Metadata = buildPageMetadata(PAGE_SEO_META.terms);

export default function TermsOfServicePage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Trang chủ', path: '/' },
    { name: 'Điều khoản dịch vụ', path: '/terms-of-service' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <LegalPageView policyKey="terms" />
    </>
  );
}
