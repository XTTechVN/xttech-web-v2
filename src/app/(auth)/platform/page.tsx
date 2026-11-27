'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PageHeading, Tag } from '@/components-remake';
import { DataTable, type Column } from '@/components-remake/data-table';
import { getPlatformOrganizations } from '@/actions';
import type { PlatformOrganization } from '@/types';
import { ListState } from './_components/states';
import { SearchBox } from './_components/search-box';

const statusTag = (o: PlatformOrganization) => (
  <Tag tone={o.status === 'active' ? 'green' : 'red'}>{o.status === 'active' ? 'Hoạt động' : 'Ngưng hoạt động'}</Tag>
);

const COLUMNS: Column<PlatformOrganization>[] = [
  {
    key: 'name',
    header: 'Doanh nghiệp',
    className: 'max-w-72',
    render: (o) => <span className="block truncate font-medium text-slate-900">{o.name}</span>,
  },
  { key: 'code', header: 'Mã', render: (o) => o.code },
  { key: 'kind', header: 'Loại', wide: true, render: (o) => o.kind },
  { key: 'users', header: 'Người dùng', className: 'text-right tabular-nums', render: (o) => o.userCount },
  { key: 'status', header: 'Trạng thái', render: statusTag },
];

export default function PlatformOrganizationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const orgs = useQuery({ queryKey: ['platform-orgs'], queryFn: getPlatformOrganizations });
  const keyword = search.trim().toLowerCase();
  const rows = useMemo(
    () => (orgs.data ?? []).filter((o) => !keyword || `${o.name} ${o.code}`.toLowerCase().includes(keyword)),
    [orgs.data, keyword],
  );

  let body;
  if (orgs.isLoading) body = <ListState kind="loading" />;
  else if (orgs.isError) body = <ListState kind="error" onRetry={() => orgs.refetch()} />;
  else if (rows.length === 0)
    body = <ListState kind="empty" emptyText={keyword ? 'Không có doanh nghiệp khớp tìm kiếm.' : 'Chưa có doanh nghiệp nào.'} />;
  else
    body = (
      <DataTable
        caption="Danh sách doanh nghiệp"
        rows={rows}
        rowKey={(o) => o.id}
        columns={COLUMNS}
        onOpen={(o) => router.push(`/platform/organizations/${o.id}`)}
        card={(o) => (
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{o.name}</p>
              <p className="truncate text-xs text-slate-500">
                {o.code} · {o.userCount} người dùng
              </p>
            </div>
            {statusTag(o)}
          </div>
        )}
      />
    );

  return (
    <div className="flex flex-col gap-3 p-4 md:gap-4 md:p-6">
      <PageHeading
        className="mb-0"
        title="Doanh nghiệp"
        description="Chọn một doanh nghiệp để xem tổng quan, người dùng, vai trò và nhật ký. Chỉ đọc; mỗi lần xem đều được ghi lại."
      />
      <SearchBox value={search} onChange={setSearch} label="Tìm doanh nghiệp" placeholder="Tên hoặc mã doanh nghiệp" />
      {body}
    </div>
  );
}
