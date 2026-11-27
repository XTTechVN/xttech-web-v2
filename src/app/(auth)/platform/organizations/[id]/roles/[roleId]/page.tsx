'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Tag } from '@/components-remake';
import { getPlatformOrgRoles, getPlatformPermissions } from '@/actions';
import type { PlatformPermission } from '@/types';
import { SCOPE_LABEL, groupBy } from '../../../../_components/group-by';
import { ListState } from '../../../../_components/states';

export default function PlatformRolePage({ params }: { params: Promise<{ id: string; roleId: string }> }) {
  const { id, roleId } = use(params);
  const roles = useQuery({ queryKey: ['platform-org-roles', Number(id)], queryFn: () => getPlatformOrgRoles(Number(id)) });
  const perms = useQuery({ queryKey: ['platform-permissions'], queryFn: getPlatformPermissions });
  const role = roles.data?.find((r) => r.id === roleId);
  const catalog = new Map<string, PlatformPermission>((perms.data ?? []).map((p) => [p.code, p]));

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <Link
        href={`/platform/organizations/${id}/roles`}
        className="inline-flex min-h-11 w-fit items-center gap-1 text-sm font-medium text-slate-600 active:text-slate-900"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Vai trò & quyền
      </Link>
      {roles.isLoading && <ListState kind="loading" />}
      {roles.isError && <ListState kind="error" onRetry={() => roles.refetch()} />}
      {roles.data && !role && <ListState kind="empty" emptyText="Không tìm thấy vai trò này." />}
      {role && (
        <>
          <header className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="min-w-0 truncate font-heading text-lg font-semibold text-slate-900">{role.name}</h2>
              <Tag tone={role.isSystem ? 'slate' : 'amber'} className="flex-none">
                {role.isSystem ? 'Mẫu' : 'Tuỳ biến'}
              </Tag>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 [overflow-wrap:anywhere]">
              {role.code} · {role.memberCount} người · {role.grants.length} quyền
            </p>
            {role.description && <p className="mt-1 text-sm text-slate-600 [overflow-wrap:anywhere]">{role.description}</p>}
          </header>
          {role.grants.length === 0 ? (
            <ListState kind="empty" emptyText="Vai trò này chưa được gắn quyền nào." />
          ) : (
            <div className="overflow-hidden rounded-block border border-slate-200/80 bg-white">
              {groupBy(role.grants, (g) => catalog.get(g.code)?.module ?? 'Khác').map(([module, items]) => (
                <section key={module} className="border-b border-slate-100 last:border-0">
                  <h3 className="bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
                    {module} · {items.length}
                  </h3>
                  <ul className="divide-y divide-slate-100">
                    {items.map((g) => (
                      <li key={g.code} className="flex min-h-12 items-center justify-between gap-3 px-4 py-2">
                        <span className="min-w-0">
                          <span className="block text-sm text-slate-900 [overflow-wrap:anywhere]">{catalog.get(g.code)?.nameVi ?? g.code}</span>
                          <span className="block truncate text-xs text-slate-500">{g.code}</span>
                        </span>
                        <Tag tone={g.effect === 'deny' ? 'red' : 'slate'} className="flex-none">
                          {g.effect === 'deny' ? 'Từ chối' : (SCOPE_LABEL[g.scope] ?? g.scope)}
                        </Tag>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
