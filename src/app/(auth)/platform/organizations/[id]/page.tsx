'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ClipboardList, KeyRound, Users } from 'lucide-react';
import { getPlatformOrganizations, getPlatformOrgAuditLogs, getPlatformOrgRoles } from '@/actions';
import { AuditRow } from '../../_components/audit-row';
import { ListState } from '../../_components/page-parts';

const Stat = ({ href, icon: Icon, label, value, note }: { href: string; icon: typeof Users; label: string; value?: number; note?: string }) => (
  <Link
    href={href}
    className="flex min-w-0 flex-col gap-1 rounded-lg border border-gray-200 bg-white p-3 transition-colors active:bg-gray-50 md:p-4 [@media(hover:hover)]:hover:border-gray-300"
  >
    <span className="flex items-center gap-1.5 text-xs text-gray-500">
      <Icon size={14} className="hidden flex-none md:block" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </span>
    <span className="font-lexend text-2xl font-semibold text-gray-900">{value ?? '–'}</span>
    <span className="truncate text-xs text-gray-500">{note ?? ' '}</span>
  </Link>
);

export default function PlatformOrganizationOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const id = use(params).id;
  const orgId = Number(id);
  const base = `/platform/organizations/${id}`;
  const orgs = useQuery({ queryKey: ['platform-orgs'], queryFn: getPlatformOrganizations });
  const roles = useQuery({ queryKey: ['platform-org-roles', orgId], queryFn: () => getPlatformOrgRoles(orgId) });
  const recent = useQuery({ queryKey: ['platform-org-audit-recent', orgId], queryFn: () => getPlatformOrgAuditLogs(orgId, 0, 5) });
  const org = orgs.data?.find((o) => o.id === orgId);
  if (!org) return null;

  const custom = roles.data?.filter((r) => !r.isSystem).length ?? 0;
  const info: [string, string][] = [
    ['Mã doanh nghiệp', org.code],
    ['Loại', org.kind],
    ['Trạng thái', org.status === 'active' ? 'Hoạt động' : 'Ngưng hoạt động'],
    ['Ngày tạo', new Date(org.createdAt).toLocaleDateString('vi-VN')],
    ['ID', String(org.id)],
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2 md:gap-4">
        <Stat href={`${base}/users`} icon={Users} label="Người dùng" value={org.userCount} />
        <Stat
          href={`${base}/roles`}
          icon={KeyRound}
          label="Vai trò"
          value={roles.data?.length}
          note={roles.data ? `${custom} tuỳ biến` : undefined}
        />
        <Stat href={`${base}/audit`} icon={ClipboardList} label="Nhật ký" value={recent.data?.meta.total} />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section aria-labelledby="org-info" className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <h2 id="org-info" className="px-4 py-3 text-sm font-semibold text-gray-900">
            Thông tin
          </h2>
          <dl className="divide-y divide-gray-100 border-t border-gray-100">
            {info.map(([k, v]) => (
              <div key={k} className="flex min-h-11 items-center justify-between gap-4 px-4 py-2 text-sm">
                <dt className="flex-none text-gray-500">{k}</dt>
                <dd className="min-w-0 truncate text-right text-gray-900">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section aria-labelledby="org-recent" className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between px-4">
            <h2 id="org-recent" className="py-3 text-sm font-semibold text-gray-900">
              Hoạt động gần đây
            </h2>
            <Link href={`${base}/audit`} className="inline-flex h-11 items-center gap-0.5 text-sm font-medium text-primary active:opacity-70">
              Xem tất cả
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="border-t border-gray-100">
            {recent.isLoading && <div className="h-16 animate-pulse bg-gray-50" aria-busy="true" />}
            {recent.isError && <ListState kind="error" onRetry={() => recent.refetch()} />}
            {recent.data?.items.length === 0 && <p className="px-4 py-6 text-center text-sm text-gray-500">Chưa có hoạt động.</p>}
            <ul className="divide-y divide-gray-100">
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
