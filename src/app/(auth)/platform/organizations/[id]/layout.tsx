'use client';

import { use } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Tabs, Tag } from '@/components-remake';
import { getPlatformOrganizations } from '@/actions';
import { Skeleton } from '@/components';
import { ListState } from '../../_components/states';

const TABS = [
  { value: '', label: 'Tổng quan' },
  { value: '/users', label: 'Người dùng' },
  { value: '/roles', label: 'Vai trò' },
  { value: '/audit', label: 'Nhật ký' },
];

export default function PlatformOrganizationLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const id = use(params).id;
  const path = usePathname();
  const router = useRouter();
  const orgs = useQuery({ queryKey: ['platform-orgs'], queryFn: getPlatformOrganizations });
  const org = orgs.data?.find((o) => o.id === Number(id));
  const base = `/platform/organizations/${id}`;
  const current = TABS.find((t) => t.value && path.startsWith(base + t.value))?.value ?? '';

  return (
    <div className="flex flex-col gap-3 p-4 md:gap-4 md:p-6">
      <Link href="/platform" className="inline-flex min-h-11 w-fit items-center gap-1 text-sm font-medium text-slate-600 active:text-slate-900">
        <ArrowLeft size={16} aria-hidden="true" />
        Tất cả doanh nghiệp
      </Link>
      <header className="min-w-0">
        {org ? (
          <>
            <div className="flex items-center gap-2">
              <h1 className="min-w-0 truncate font-heading text-xl font-semibold text-slate-900 md:text-2xl">{org.name}</h1>
              <Tag tone={org.status === 'active' ? 'green' : 'red'} className="flex-none">
                {org.status === 'active' ? 'Hoạt động' : 'Ngưng hoạt động'}
              </Tag>
            </div>
            <p className="mt-0.5 truncate text-sm text-slate-500">{org.code}</p>
          </>
        ) : (
          <Skeleton className="h-8 w-56 rounded-control" />
        )}
      </header>
      {orgs.isError && <ListState kind="error" onRetry={() => orgs.refetch()} />}
      {orgs.data && !org && <ListState kind="empty" emptyText="Không tìm thấy doanh nghiệp này." />}
      {(org || orgs.isLoading) && (
        <>
          <Tabs tabs={TABS} value={current} onChange={(v) => router.push(base + v)} label="Mục của doanh nghiệp" className="px-0" />
          {children}
        </>
      )}
    </div>
  );
}
