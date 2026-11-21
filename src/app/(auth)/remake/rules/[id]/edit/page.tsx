'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDocumentById } from '@/actions';
import { useCan } from '@/hooks';
import { BackLink, PageHeader } from '../../../_components/page-header';
import { EmptyState, ErrorState, ListSkeleton } from '../../../_components/state-views';
import { RuleEditor } from '../../_components/rule-editor';
import { ruleActions } from '../../_lib/rule-access';

// Sửa dự thảo văn bản (chỉ khi còn là bản nháp).
export default function RemakeEditRulePage() {
  const id = Number(useParams<{ id: string }>().id);
  const router = useRouter();
  const qc = useQueryClient();
  const { can, me, isReady } = useCan();
  const q = useQuery({ queryKey: ['rules', 'detail', id], queryFn: () => getDocumentById(id), enabled: isReady && can('rule:read') });

  if (!isReady || q.isLoading) return <ListSkeleton />;
  if (q.isError || !q.data)
    return (
      <ErrorState title="Không tải được văn bản" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => q.refetch()} />
    );
  const canEdit = ruleActions(q.data, {
    userId: me?.user.id ?? '',
    isPublisher: can('document:publish'),
    canApprove: can('document:approve'),
    canDelete: can('document:delete'),
  }).canEdit;
  const back = `/remake/rules/${id}`;
  if (!canEdit) return <EmptyState title="Không sửa được văn bản này" description="Chỉ người có quyền ban hành mới sửa được bản nháp." />;

  return (
    <>
      <BackLink href={back} label="Chi tiết văn bản" />
      <PageHeader title="Sửa dự thảo" description={q.data.code} />
      <RuleEditor
        doc={q.data}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ['rules'] });
          router.push(back);
        }}
        onCancel={() => router.push(back)}
      />
    </>
  );
}
