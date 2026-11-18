'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components';
import { getPlatformOrgRoles, getPlatformPermissions } from '@/actions';
import { GrantRows } from '../../../../_components/grant-rows';
import { ListState } from '../../../../_components/page-parts';

export default function PlatformRolePage({ params }: { params: Promise<{ id: string; roleId: string }> }) {
  const { id, roleId } = use(params);
  const roles = useQuery({ queryKey: ['platform-org-roles', Number(id)], queryFn: () => getPlatformOrgRoles(Number(id)) });
  const perms = useQuery({ queryKey: ['platform-permissions'], queryFn: getPlatformPermissions });
  const role = roles.data?.find((r) => r.id === roleId);
  const catalog = new Map((perms.data ?? []).map((p) => [p.code, p]));

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={`/platform/organizations/${id}/roles`}
        className="inline-flex h-11 w-fit items-center gap-1 text-sm font-medium text-gray-600 active:text-gray-900"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Vai trò & quyền
      </Link>
      {roles.isLoading && <ListState kind="loading" />}
      {roles.isError && <ListState kind="error" onRetry={() => roles.refetch()} />}
      {roles.data && !role && <ListState kind="empty" emptyText="Không tìm thấy vai trò này." />}
      {role && (
        <>
          <header className="flex flex-col gap-1">
            <h2 className="flex items-center gap-2 font-lexend text-lg font-semibold text-gray-900">
              <span className="min-w-0 [overflow-wrap:anywhere]">{role.name}</span>
              <Badge size="sm" variant={role.isSystem ? 'default' : 'warning'} className="flex-none">
                {role.isSystem ? 'Mẫu' : 'Tuỳ biến'}
              </Badge>
            </h2>
            <p className="text-xs text-gray-500 [overflow-wrap:anywhere]">
              {role.code} · {role.memberCount} người · {role.grants.length} quyền
            </p>
            {role.description && <p className="text-sm text-gray-600 [overflow-wrap:anywhere]">{role.description}</p>}
          </header>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <GrantRows grants={role.grants} catalog={catalog} />
          </div>
        </>
      )}
    </div>
  );
}
