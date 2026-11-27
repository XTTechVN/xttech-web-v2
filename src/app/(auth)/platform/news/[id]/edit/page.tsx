'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { PageHeading } from '@/components-remake';
import { AccessDenied } from '@/components/access-denied';
import { getAdminNewsDetail } from '@/actions';
import { ListState } from '../../../_components/states';
import { NewsForm } from '../../_components/news-form';
import { usePlatformCan } from '../../../_components/use-platform-can';

export default function PlatformNewsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number(use(params).id);
  const { can, isReady } = usePlatformCan();
  const allowed = can('news:update');
  const q = useQuery({ queryKey: ['admin-news', 'detail', id], queryFn: () => getAdminNewsDetail(id), enabled: isReady && allowed });

  if (!isReady)
    return (
      <div className="p-4 md:p-6">
        <ListState kind="loading" />
      </div>
    );
  if (!allowed) return <AccessDenied />;
  return (
    <div className="flex flex-col gap-3 p-4 pb-0 md:gap-4 md:p-6 md:pb-0">
      <Link href="/platform/news" className="inline-flex min-h-11 w-fit items-center gap-1 text-sm font-medium text-slate-600 active:text-slate-900">
        <ArrowLeft size={16} aria-hidden="true" />
        Tin tức
      </Link>
      <PageHeading className="mb-0" title="Sửa bài viết" />
      {q.isLoading && <ListState kind="loading" />}
      {q.isError && <ListState kind="error" onRetry={() => q.refetch()} />}
      {q.data && <NewsForm key={q.data.id} initialData={q.data} />}
    </div>
  );
}
