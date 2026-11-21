'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDocumentById } from '@/actions';
import { useCan } from '@/hooks';
import { BackLink, PageHeader } from '../../_components/page-header';
import { EmptyState, ListSkeleton } from '../../_components/state-views';
import { RuleEditor } from '../_components/rule-editor';

function Content() {
  const router = useRouter();
  const qc = useQueryClient();
  const { can, isReady } = useCan();
  const replaceId = Number(useSearchParams().get('replace')) || 0;
  const target = useQuery({ queryKey: ['rules', 'detail', replaceId], queryFn: () => getDocumentById(replaceId), enabled: replaceId > 0 });

  if (!isReady || (replaceId > 0 && target.isLoading)) return <ListSkeleton />;
  if (!can('document:publish'))
    return <EmptyState title="Bạn chưa có quyền soạn văn bản ban hành" description="Liên hệ quản trị viên để được cấp quyền." />;
  const done = () => {
    qc.invalidateQueries({ queryKey: ['rules'] });
    router.push('/remake/rules');
  };
  return (
    <>
      <BackLink href="/remake/rules" label="Văn bản ban hành" />
      <PageHeader title={replaceId ? 'Soạn văn bản thay thế' : 'Soạn văn bản'} description="Soạn dự thảo, gửi duyệt hoặc ban hành." />
      <RuleEditor doc={null} replacing={target.data ?? null} onSaved={done} onCancel={() => router.push('/remake/rules')} />
    </>
  );
}

// Soạn văn bản mới (nhiều ô và nội dung dài nên là trang riêng).
export default function RemakeNewRulePage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <Content />
    </Suspense>
  );
}
