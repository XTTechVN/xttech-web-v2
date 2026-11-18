'use client';

import { use } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2 } from 'lucide-react';
import { Badge } from '@/components';
import { getPlatformOrganizations } from '@/actions';
import { cn } from '@/utils/cn';
import { ListState } from '../../_components/page-parts';

const TABS = [
  { path: '', label: 'Tổng quan' },
  { path: '/users', label: 'Người dùng' },
  { path: '/roles', label: 'Vai trò' },
  { path: '/audit', label: 'Nhật ký' },
] as const;

export default function PlatformOrganizationLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const id = use(params).id;
  const pathname = usePathname();
  const orgs = useQuery({ queryKey: ['platform-orgs'], queryFn: getPlatformOrganizations });
  const org = orgs.data?.find((o) => o.id === Number(id));
  const base = `/platform/organizations/${id}`;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <Link href="/platform" className="inline-flex h-11 w-fit items-center gap-1 text-sm font-medium text-gray-600 active:text-gray-900">
          <ArrowLeft size={16} aria-hidden="true" />
          Tất cả doanh nghiệp
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-gray-100 text-gray-500">
            <Building2 size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            {org ? (
              <>
                <h1 className="flex items-center gap-2 font-lexend text-xl font-semibold tracking-tight text-gray-900">
                  <span className="min-w-0 truncate">{org.name}</span>
                  <Badge size="sm" variant={org.status === 'active' ? 'success' : 'danger'} className="flex-none">
                    {org.status === 'active' ? 'Hoạt động' : 'Ngưng hoạt động'}
                  </Badge>
                </h1>
                <p className="truncate text-xs text-gray-500">{org.code}</p>
              </>
            ) : (
              <div className="h-6 w-48 animate-pulse rounded bg-gray-100" />
            )}
          </div>
        </div>
      </div>
      {orgs.isError && <ListState kind="error" onRetry={() => orgs.refetch()} />}
      {orgs.data && !org && <ListState kind="empty" emptyText="Không tìm thấy doanh nghiệp này." />}
      {(org || orgs.isLoading) && (
        <>
          <nav
            aria-label="Mục của doanh nghiệp"
            className="-mx-4 flex overflow-x-auto border-b border-gray-200 px-4 md:mx-0 md:px-0 [scrollbar-width:none]"
          >
            {TABS.map((t) => {
              const href = `${base}${t.path}`;
              const active = t.path === '' ? pathname === base : pathname.startsWith(href);
              return (
                <Link
                  key={t.path}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    "relative inline-flex h-11 flex-none items-center px-2.5 text-sm font-medium transition-colors after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:content-[''] active:bg-gray-50 md:px-4 md:after:inset-x-4",
                    active ? 'text-primary after:scale-x-100' : 'text-gray-500 [@media(hover:hover)]:hover:text-gray-900',
                  )}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
          {children}
        </>
      )}
    </div>
  );
}
