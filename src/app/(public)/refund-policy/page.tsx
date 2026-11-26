import type { Metadata } from 'next';
import {
  PAGE_SEO_META,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  serializeJsonLd,
} from '@/config';
import { LegalPageView } from '../_components';

export const metadata: Metadata = buildPageMetadata(PAGE_SEO_META.refund);

export default function RefundPolicyPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Trang chủ', path: '/' },
    { name: 'Chính sách hoàn tiền', path: '/refund-policy' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <LegalPageView policyKey="refund" />
    </>
  );
}
