'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getDocumentById, markDocumentAsRead } from '@/actions/document';
import { TabState } from '@/components-remake';
import { AccessDenied } from '@/components/access-denied';
import { DocumentPreviewModal } from '@/components/documents';
import { useCan } from '@/hooks';
import { useAuthStore } from '@/stores';
import type { DocumentItem } from '@/types';
import { RULES_QUERY_KEYS } from '@/utils';
import queryClient from '@/utils/query';
import { RuleDeleteConfirm } from '../_components/rule-delete-confirm';
import { RuleDetail } from '../_components/rule-detail';
import { RulePageShell } from '../_components/rule-page-shell';
import { RulePublishDrawer } from '../_components/rule-publish-drawer';
import { useRuleActions } from '../_hooks/use-rule-actions';

// Chi tiết một văn bản ban hành: xem, thẩm định, ban hành, xác nhận đã đọc, sửa, xóa
export default function RuleDetailPage() {
  const id = Number(useParams<{ id: string }>().id);
  const router = useRouter();
  const { can, isReady } = useCan();
  const user = useAuthStore((s) => s.user);
  const [publishing, setPublishing] = useState<DocumentItem | null>(null);
  const [deleting, setDeleting] = useState<DocumentItem | null>(null);
  const [preview, setPreview] = useState<DocumentItem | null>(null);
  const canRead = isReady && can('rule:read');
  const q = useQuery({ queryKey: RULES_QUERY_KEYS.detail(id), queryFn: () => getDocumentById(id), enabled: canRead });
  const doc = q.data;

  const actions = useRuleActions({
    onDone: () => {
      setPublishing(null);
      if (deleting) router.push('/app/rules');
      setDeleting(null);
    },
  });
  const busy = actions.reviewMutation.isPending || actions.acknowledgeMutation.isPending;

  if (!isReady) return null;
  if (!can('rule:read')) return <AccessDenied />;

  const isManager = can('document:publish');
  const openPreview = async (d: DocumentItem) => {
    if (d.isRead === false) {
      await markDocumentAsRead(d.id).catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: RULES_QUERY_KEYS.root });
    }
    setPreview(d);
  };
  const review = async (d: DocumentItem, approved: boolean, note?: string, thenPublish?: boolean) => {
    try {
      await actions.reviewMutation.mutateAsync({ id: d.id, isApproved: approved, note });
      if (thenPublish) setPublishing({ ...d, status: 'approved', approvalStatus: 'approved' });
    } catch {
      // lỗi đã được báo bằng toast ở mutation
    }
  };

  return (
    <RulePageShell title={doc?.title ?? 'Chi tiết văn bản'}>
      <TabState loading={q.isLoading} error={q.isError} onRetry={() => q.refetch()} empty={!doc} emptyText="Không tìm thấy văn bản.">
        {doc && (
          <RuleDetail
            doc={doc}
            context={{ currentUserId: user?.id ?? '', isManager, canApprove: can('document:approve') }}
            busy={busy}
            handlers={{
              onPreview: openPreview,
              onEdit: (d) => router.push(`/app/rules/${d.id}/edit`),
              onReplace: (d) => router.push(`/app/rules/new?replace=${d.id}`),
              onDelete: setDeleting,
              onPublish: setPublishing,
              onAcknowledge: (d) => actions.acknowledgeMutation.mutate(d.id),
              onReview: review,
            }}
          />
        )}
      </TabState>
      <RulePublishDrawer
        key={publishing?.id ?? 0}
        document={publishing}
        canPublishCompany={isManager}
        pending={actions.publishMutation.isPending}
        onClose={() => setPublishing(null)}
        onConfirm={(payload) => publishing && actions.publishMutation.mutate({ id: publishing.id, payload })}
      />
      <RuleDeleteConfirm doc={deleting} pending={actions.deleteMutation.isPending} onClose={() => setDeleting(null)} onConfirm={(d) => actions.deleteMutation.mutate(d.id)} />
      <DocumentPreviewModal
        isOpen={!!preview}
        document={preview}
        onClose={() => {
          setPreview(null);
          queryClient.invalidateQueries({ queryKey: RULES_QUERY_KEYS.root });
        }}
      />
    </RulePageShell>
  );
}
