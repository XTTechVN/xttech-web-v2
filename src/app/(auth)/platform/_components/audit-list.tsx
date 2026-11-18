'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getPlatformOrgAuditLogs } from '@/actions';
import { ListState } from './page-parts';
import { LoadMore } from './load-more';
import { AuditRow } from './audit-row';

const LIMIT = 20;

export const AuditList = ({ orgId }: { orgId: number }) => {
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
    <>
      <ul className="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
        {items.map((l, i) => (
          <li key={l.id} className="motion-safe:animate-rise" style={{ animationDelay: `${Math.min(i, 5) * 50}ms` }}>
            <AuditRow log={l} />
          </li>
        ))}
      </ul>
      <LoadMore visible={items.length} total={total} loading={q.isFetchingNextPage} onClick={() => q.fetchNextPage()} />
    </>
  );
};
