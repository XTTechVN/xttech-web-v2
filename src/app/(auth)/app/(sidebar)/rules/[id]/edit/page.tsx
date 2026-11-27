'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getDocumentById } from '@/actions';
import { TabState } from '@/components-remake';
import { AccessDenied } from '@/components/access-denied';
import { useCan } from '@/hooks';
import { useAuthStore } from '@/stores';
import { RuleForm } from '../../_components/rule-form';
import { RulePageShell } from '../../_components/rule-page-shell';
import { getRuleActions } from '../../_utils/rule-permissions';

export default function EditRulePage() {
  const id = Number(useParams<{ id: string }>().id);
  const router = useRouter();
  const { can, isReady } = useCan();
  const user = useAuthStore((s) => s.user);
  const allowed = isReady && can('document:create');
  const q = useQuery({ queryKey: ['document', id], queryFn: () => getDocumentById(id), enabled: allowed });

  if (!isReady) return null;
  if (!allowed) return <AccessDenied />;
  const d = q.data;
  if (d && !getRuleActions(d, { currentUserId: user?.id ?? '', isManager: can('document:publish'), canApprove: can('document:approve') }).canEdit) return <AccessDenied />;
  return (
    <RulePageShell title="Sửa dự thảo" subtitle={d?.supersedesDoc ? `Thay thế [${d.supersedesDoc.code}] ${d.supersedesDoc.title}` : undefined}>
      <TabState loading={q.isLoading} error={q.isError} onRetry={() => q.refetch()} empty={false} emptyText="">
        {d && <RuleForm key={d.id} document={d} onSaved={() => router.push('/app/rules')} />}
      </TabState>
    </RulePageShell>
  );
}
