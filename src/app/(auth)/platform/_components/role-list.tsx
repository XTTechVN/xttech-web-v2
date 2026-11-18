'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components';
import { getPlatformOrgRoles } from '@/actions';
import { ListState } from './page-parts';

export const RoleList = ({ orgId }: { orgId: number }) => {
  const roles = useQuery({ queryKey: ['platform-org-roles', orgId], queryFn: () => getPlatformOrgRoles(orgId) });

  if (roles.isLoading) return <ListState kind="loading" />;
  if (roles.isError) return <ListState kind="error" onRetry={() => roles.refetch()} />;
  if (!roles.data?.length) return <ListState kind="empty" emptyText="Doanh nghiệp này chưa có vai trò nào." />;
  return (
    <ul className="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
      {roles.data.map((r, i) => (
        <li key={r.id} className="motion-safe:animate-rise" style={{ animationDelay: `${Math.min(i, 5) * 50}ms` }}>
          <Link href={`/platform/organizations/${orgId}/roles/${r.id}`} className="flex min-h-16 items-center gap-3 px-4 py-2 active:bg-gray-50">
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-gray-900">{r.name}</span>
                <Badge size="sm" variant={r.isSystem ? 'default' : 'warning'} className="flex-none">
                  {r.isSystem ? 'Mẫu' : 'Tuỳ biến'}
                </Badge>
              </span>
              <span className="block truncate text-xs text-gray-500">
                {r.code} · {r.memberCount} người · {r.grants.length} quyền
              </span>
            </span>
            <ChevronRight size={18} className="flex-none text-gray-400" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
};
