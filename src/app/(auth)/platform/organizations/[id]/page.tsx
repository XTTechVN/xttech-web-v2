'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ClipboardList, KeyRound, Users } from 'lucide-react';
import { StatGrid } from '@/components-remake';
import { getPlatformOrganizations, getPlatformOrgAuditLogs, getPlatformOrgRoles } from '@/actions';
import { AuditRow } from '../../_components/audit-row';
import { ListState } from '../../_components/states';

export default function PlatformOrganizationOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const id = use(params).id;
  const orgId = Number(id);
  const base = `/platform/organizations/${id}`;
  const orgs = useQuery({ queryKey: ['platform-orgs'], queryFn: getPlatformOrganizations });
  const roles = useQuery({ queryKey: ['platform-org-roles', orgId], queryFn: () => getPlatformOrgRoles(orgId) });
  const recent = useQuery({ queryKey: ['platform-org-audit-recent', orgId], queryFn: () => getPlatformOrgAuditLogs(orgId, 0, 5) });
  const org = orgs.data?.find((o) => o.id === orgId);
  if (!org) return null;

  const info: [string, string][] = [
    ['Mã doanh nghiệp', org.code],
    ['Loại', org.kind],
    ['Trạng thái', org.status === 'active' ? 'Hoạt động' : 'Ngưng hoạt động'],
    ['Ngày tạo', new Date(org.createdAt).toLocaleDateString('vi-VN')],
    ['ID', String(org.id)],
  ];

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <StatGrid
        items={[
          { label: 'Người dùng', value: org.userCount, icon: Users },
          { label: 'Vai trò', value: roles.data?.length ?? 0, icon: KeyRound },
          { label: 'Nhật ký', value: recent.data?.meta.total ?? 0, icon: ClipboardList },
        ]}
      />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-3 md:gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section aria-labelledby="org-info" className="overflow-hidden rounded-block border border-slate-200/80 bg-white">
          <h2 id="org-info" className="px-4 py-3 text-sm font-semibold text-slate-900">
            Thông tin
          </h2>
          <dl className="divide-y divide-slate-100 border-t border-slate-100">
            {info.map(([k, v]) => (
              <div key={k} className="flex min-h-11 items-center justify-between gap-4 px-4 py-2 text-sm">
                <dt className="flex-none text-slate-500">{k}</dt>
                <dd className="min-w-0 truncate text-right text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section aria-labelledby="org-recent" className="overflow-hidden rounded-block border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between px-4">
            <h2 id="org-recent" className="py-3 text-sm font-semibold text-slate-900">
              Hoạt động gần đây
            </h2>
            <Link href={`${base}/audit`} className="inline-flex min-h-11 items-center gap-0.5 text-sm font-medium text-primary active:opacity-70">
              Xem tất cả
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="border-t border-slate-100">
            {recent.isLoading && <div className="h-16 animate-pulse bg-slate-50" aria-busy="true" />}
            {recent.isError && <ListState kind="error" onRetry={() => recent.refetch()} />}
            {recent.data?.items.length === 0 && <p className="px-4 py-6 text-center text-sm text-slate-500">Chưa có hoạt động.</p>}
            <ul className="divide-y divide-slate-100">
              {recent.data?.items.map((l) => (
                <li key={l.id}>
                  <AuditRow log={l} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
