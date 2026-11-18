'use client';

import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components';
import { getPlatformOrgUsers } from '@/actions';
import type { PlatformUser } from '@/types';
import { ListState } from './page-parts';
import { LoadMore } from './load-more';
import { UserDrawer } from './user-drawer';

const LIMIT = 20;

export const UserList = ({ orgId }: { orgId: number }) => {
  const [selected, setSelected] = useState<PlatformUser | null>(null);
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
  return (
    <>
      <ul className="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
        {items.map((u, i) => (
          <li key={u.id} className="motion-safe:animate-rise" style={{ animationDelay: `${Math.min(i % 20, 5) * 50}ms` }}>
            <button
              type="button"
              onClick={() => setSelected(u)}
              className="flex min-h-16 w-full items-center gap-3 px-4 py-2 text-left active:bg-gray-50"
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-gray-900">{u.fullName || u.username}</span>
                  {u.deletedAt && (
                    <Badge size="sm" variant="danger" className="flex-none">
                      Đã xoá
                    </Badge>
                  )}
                </span>
                <span className="block truncate text-xs text-gray-500">
                  {u.username}
                  {u.email && u.email !== u.username ? ` · ${u.email}` : ''}
                </span>
                <span className="block truncate text-xs text-gray-500 md:hidden">{u.roles.join(', ') || 'Chưa có vai trò'}</span>
              </span>
              <span className="hidden max-w-64 flex-none truncate text-sm text-gray-600 md:block">{u.roles.join(', ') || 'Chưa có vai trò'}</span>
              <ChevronRight size={18} className="flex-none text-gray-400" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <LoadMore visible={items.length} total={total} loading={q.isFetchingNextPage} onClick={() => q.fetchNextPage()} />
      {selected && <UserDrawer user={selected} onClose={() => setSelected(null)} />}
    </>
  );
};
