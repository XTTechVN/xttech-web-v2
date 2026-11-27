'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Tag } from '@/components-remake';
import { DataTable, type Column } from '@/components-remake/data-table';
import { getPlatformOrgRoles } from '@/actions';
import type { PlatformRole } from '@/types';
import { ListState } from '../../../_components/states';

const kindTag = (r: PlatformRole) => <Tag tone={r.isSystem ? 'slate' : 'amber'}>{r.isSystem ? 'Mẫu' : 'Tuỳ biến'}</Tag>;

const COLUMNS: Column<PlatformRole>[] = [
  {
    key: 'name',
    header: 'Vai trò',
    className: 'max-w-72',
    render: (r) => <span className="block truncate font-medium text-slate-900">{r.name}</span>,
  },
  { key: 'code', header: 'Mã', render: (r) => r.code },
  { key: 'kind', header: 'Loại', render: kindTag },
  { key: 'members', header: 'Thành viên', className: 'text-right tabular-nums', render: (r) => r.memberCount },
  { key: 'grants', header: 'Quyền', className: 'text-right tabular-nums', render: (r) => r.grants.length },
];

export default function PlatformOrgRolesPage({ params }: { params: Promise<{ id: string }> }) {
  const orgId = Number(use(params).id);
  const router = useRouter();
  const roles = useQuery({ queryKey: ['platform-org-roles', orgId], queryFn: () => getPlatformOrgRoles(orgId) });

  if (roles.isLoading) return <ListState kind="loading" />;
  if (roles.isError) return <ListState kind="error" onRetry={() => roles.refetch()} />;
  if (!roles.data?.length) return <ListState kind="empty" emptyText="Doanh nghiệp này chưa có vai trò nào." />;
  return (
    <DataTable
      caption="Vai trò của doanh nghiệp"
      rows={roles.data}
      rowKey={(r) => r.id}
      columns={COLUMNS}
      onOpen={(r) => router.push(`/platform/organizations/${orgId}/roles/${r.id}`)}
      card={(r) => (
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{r.name}</p>
            <p className="truncate text-xs text-slate-500">
              {r.code} · {r.memberCount} người · {r.grants.length} quyền
            </p>
          </div>
          {kindTag(r)}
        </div>
      )}
    />
  );
}
