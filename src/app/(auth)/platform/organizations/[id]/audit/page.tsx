'use client';

import { use } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getPlatformOrgAuditLogs } from '@/actions';
import { AuditRow } from '../../../_components/audit-row';
import { ListState, LoadMore } from '../../../_components/states';

const LIMIT = 20;

export default function PlatformOrgAuditPage({ params }: { params: Promise<{ id: string }> }) {
  const orgId = Number(use(params).id);
  const q = useInfiniteQuery({
    queryKey: ['platform-org-audit', orgId],
    queryFn: ({ pageParam }) => getPlatformOrgAuditLogs(orgId, pageParam, LIMIT),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.meta.next ? last.meta.offset + last.meta.limit : undefined),
  });
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];
  const total = q.data?.pages[0]?.meta.total ?? 0;

  if (q.isLoading) return <ListState kind="loading" />;
  if (q.isError) return <ListState kind="error" onRetry={() => q.refetch()} />;
  if (items.length === 0) return <ListState kind="empty" emptyText="Chưa có nhật ký hoạt động." />;
  return (
    <div className="flex flex-col gap-3">
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-block border border-slate-200/80 bg-white">
        {items.map((l) => (
          <li key={l.id}>
            <AuditRow log={l} />
          </li>
        ))}
      </ul>
      <LoadMore visible={items.length} total={total} loading={q.isFetchingNextPage} onClick={() => q.fetchNextPage()} />
    </div>
  );
}
