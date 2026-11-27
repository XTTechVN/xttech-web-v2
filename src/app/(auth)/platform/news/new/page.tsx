'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeading } from '@/components-remake';
import { AccessDenied } from '@/components/access-denied';
import { ListState } from '../../_components/states';
import { NewsForm } from '../_components/news-form';
import { usePlatformCan } from '../../_components/use-platform-can';

export default function PlatformNewsCreatePage() {
  const { can, isReady } = usePlatformCan();
  if (!isReady)
    return (
      <div className="p-4 md:p-6">
        <ListState kind="loading" />
      </div>
    );
  if (!can('news:create')) return <AccessDenied />;
  return (
    <div className="flex flex-col gap-3 p-4 pb-0 md:gap-4 md:p-6 md:pb-0">
      <Link href="/platform/news" className="inline-flex min-h-11 w-fit items-center gap-1 text-sm font-medium text-slate-600 active:text-slate-900">
        <ArrowLeft size={16} aria-hidden="true" />
        Tin tức
      </Link>
      <PageHeading className="mb-0" title="Viết bài mới" />
      <NewsForm />
    </div>
  );
}
