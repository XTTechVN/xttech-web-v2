'use client';

import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronRight, Search } from 'lucide-react';
import { Badge } from '@/components';
import { searchPlatformUsers } from '@/actions';
import { useDebounce } from '@/hooks';
import type { PlatformGlobalUser } from '@/types';
import { LoadMore } from '../_components/load-more';
import { ListState, PageHeader } from '../_components/page-parts';
import { UserDrawer } from '../_components/user-drawer';

const LIMIT = 20;

export default function PlatformUsersPage() {
  const [search, setSearch] = useState('');
  const term = useDebounce(search.trim(), 300);
  const [selected, setSelected] = useState<PlatformGlobalUser | null>(null);
  const q = useInfiniteQuery({
    queryKey: ['platform-users', term],
    queryFn: ({ pageParam }) => searchPlatformUsers(term, pageParam, LIMIT),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.meta.next ? last.meta.offset + last.meta.limit : undefined),
  });
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];
  const total = q.data?.pages[0]?.meta.total ?? 0;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <PageHeader title="Người dùng" description="Người dùng của mọi doanh nghiệp. Chỉ đọc; mỗi lần xem đều được ghi lại." />
      <div className="sticky top-14 z-10 -mx-4 bg-gray-50 px-4 py-1 md:static md:mx-0 md:bg-transparent md:px-0">
        <label htmlFor="platform-user-search" className="sr-only">
          Tìm người dùng
        </label>
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            id="platform-user-search"
            type="search"
            inputMode="search"
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tên đăng nhập, họ tên hoặc email"
            className="h-11 w-full rounded-md border border-gray-200 bg-white pl-10 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 md:text-sm"
          />
        </div>
      </div>
      {q.isLoading && <ListState kind="loading" />}
      {q.isError && <ListState kind="error" onRetry={() => q.refetch()} />}
      {q.data && items.length === 0 && (
        <ListState kind="empty" emptyText={term ? `Không có người dùng khớp "${term}".` : 'Chưa có người dùng nào.'} />
      )}
      {items.length > 0 && (
        <>
          <ul className="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
            {items.map((u, i) => (
              <li key={u.id} className="motion-safe:animate-rise" style={{ animationDelay: `${Math.min(i % LIMIT, 5) * 50}ms` }}>
                <button
                  type="button"
                  onClick={() => setSelected(u)}
                  className="flex min-h-16 w-full items-center gap-3 px-4 py-2 text-left transition-colors active:bg-gray-50 [@media(hover:hover)]:hover:bg-gray-50"
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
                    <span className="block truncate text-xs text-gray-500 md:hidden">{u.orgName}</span>
                  </span>
                  <span className="hidden max-w-64 flex-none truncate text-sm text-gray-600 md:block">{u.orgName}</span>
                  <ChevronRight size={18} className="flex-none text-gray-400" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <LoadMore visible={items.length} total={total} loading={q.isFetchingNextPage} onClick={() => q.fetchNextPage()} />
        </>
      )}
      {selected && <UserDrawer user={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
