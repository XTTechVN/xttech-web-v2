'use client';

import { use } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getPlatformOrgUsers } from '@/actions';
import { ListState } from '../../../_components/states';
import { UserTable } from '../../../_components/user-table';

const LIMIT = 20;

export default function PlatformOrgUsersPage({ params }: { params: Promise<{ id: string }> }) {
  const orgId = Number(use(params).id);
  const q = useInfiniteQuery({
    queryKey: ['platform-org-users', orgId],
    queryFn: ({ pageParam }) => getPlatformOrgUsers(orgId, pageParam, LIMIT),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.meta.next ? last.meta.offset + last.meta.limit : undefined),
  });
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];
  const total = q.data?.pages[0]?.meta.total ?? 0;

  if (q.isLoading) return <ListState kind="loading" />;
  if (q.isError) return <ListState kind="error" onRetry={() => q.refetch()} />;
  if (items.length === 0) return <ListState kind="empty" emptyText="Doanh nghiệp này chưa có người dùng." />;
  return <UserTable rows={items} total={total} loadingMore={q.isFetchingNextPage} onMore={() => q.fetchNextPage()} />;
}
