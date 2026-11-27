'use client';

import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { PageHeading } from '@/components-remake';
import { searchPlatformUsers } from '@/actions';
import { useDebounce } from '@/hooks';
import { ListState } from '../_components/states';
import { SearchBox } from '../_components/search-box';
import { UserTable } from '../_components/user-table';

const LIMIT = 20;

export default function PlatformUsersPage() {
  const [search, setSearch] = useState('');
  const term = useDebounce(search.trim(), 300);
  const q = useInfiniteQuery({
    queryKey: ['platform-users', term],
    queryFn: ({ pageParam }) => searchPlatformUsers(term, pageParam, LIMIT),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.meta.next ? last.meta.offset + last.meta.limit : undefined),
  });
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];
  const total = q.data?.pages[0]?.meta.total ?? 0;

  let body;
  if (q.isLoading) body = <ListState kind="loading" />;
  else if (q.isError) body = <ListState kind="error" onRetry={() => q.refetch()} />;
  else if (items.length === 0) body = <ListState kind="empty" emptyText={term ? `Không có người dùng khớp "${term}".` : 'Chưa có người dùng nào.'} />;
  else body = <UserTable withOrg rows={items} total={total} loadingMore={q.isFetchingNextPage} onMore={() => q.fetchNextPage()} />;

  return (
    <div className="flex flex-col gap-3 p-4 md:gap-4 md:p-6">
      <PageHeading className="mb-0" title="Người dùng" description="Người dùng của mọi doanh nghiệp. Chỉ đọc; mỗi lần xem đều được ghi lại." />
      <SearchBox value={search} onChange={setSearch} label="Tìm người dùng" placeholder="Tên đăng nhập, họ tên hoặc email" />
      {body}
    </div>
  );
}
