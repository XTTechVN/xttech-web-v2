import type { Metadata } from 'next';
import { PAGE_SEO_META, buildPageMetadata } from '@/config';
import { IntroduceContent } from '../_components';

export const metadata: Metadata = buildPageMetadata(PAGE_SEO_META.introduce);

export default function IntroducePage() {
  return (
    <main>
      <IntroduceContent />
    </main>
  );
}
