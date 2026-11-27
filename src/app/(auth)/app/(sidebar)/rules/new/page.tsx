'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getDocumentById } from '@/actions';
import { TabState } from '@/components-remake';
import { AccessDenied } from '@/components/access-denied';
import { useCan } from '@/hooks';
import { RuleForm } from '../_components/rule-form';
import { RulePageShell } from '../_components/rule-page-shell';

function NewRule() {
  const router = useRouter();
  const { can, isReady } = useCan();
  const replaceId = Number(useSearchParams().get('replace')) || null;
  const allowed = isReady && can('document:create');
  const target = useQuery({ queryKey: ['document', replaceId], queryFn: () => getDocumentById(replaceId!), enabled: allowed && !!replaceId });

  if (!isReady) return null;
  if (!allowed) return <AccessDenied />;
  const title = replaceId ? 'Soạn văn bản thay thế' : can('document:publish') ? 'Soạn văn bản' : 'Soạn dự thảo';
  return (
    <RulePageShell title={title} subtitle={target.data ? `Thay thế [${target.data.code}] ${target.data.title}` : undefined}>
      <TabState loading={!!replaceId && target.isLoading} error={!!replaceId && target.isError} onRetry={() => target.refetch()} empty={false} emptyText="">
        <RuleForm supersedingDoc={target.data ?? null} document={null} onSaved={() => router.push('/app/rules')} />
      </TabState>
    </RulePageShell>
  );
}

export default function NewRulePage() {
  return (
    <Suspense>
      <NewRule />
    </Suspense>
  );
}
