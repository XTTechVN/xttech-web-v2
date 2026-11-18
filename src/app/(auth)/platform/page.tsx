'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Building2, ChevronRight } from 'lucide-react';
import { Badge } from '@/components';
import { getPlatformOrganizations } from '@/actions';
import { ListState, PageHeader } from './_components/page-parts';

export default function PlatformOrganizationsPage() {
  const orgs = useQuery({ queryKey: ['platform-orgs'], queryFn: getPlatformOrganizations });

  return (
    <div className="flex flex-col gap-4 p-4">
      <PageHeader
        title="Doanh nghiệp"
        description="Chọn một doanh nghiệp để xem tổng quan, người dùng, vai trò & quyền và nhật ký. Chỉ đọc; mỗi lần xem đều được ghi lại."
      />
      {orgs.isLoading && <ListState kind="loading" />}
      {orgs.isError && <ListState kind="error" onRetry={() => orgs.refetch()} />}
      {orgs.data && orgs.data.length === 0 && <ListState kind="empty" emptyText="Chưa có doanh nghiệp nào." />}
      {orgs.data && orgs.data.length > 0 && (
        <ul className="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {orgs.data.map((o, i) => (
            <li key={o.id} className="motion-safe:animate-rise" style={{ animationDelay: `${Math.min(i, 5) * 50}ms` }}>
              <Link
                href={`/platform/organizations/${o.id}`}
                className="group flex min-h-16 w-full items-center gap-3 px-4 py-2 transition-colors active:bg-gray-50 [@media(hover:hover)]:hover:bg-gray-50"
              >
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-gray-100 text-gray-500">
                  <Building2 size={16} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-gray-900">{o.name}</span>
                    {o.status !== 'active' && (
                      <Badge size="sm" variant="danger" className="flex-none">
                        Ngưng hoạt động
                      </Badge>
                    )}
                  </span>
                  <span className="block truncate text-xs text-gray-500">
                    {o.code} · {o.kind}
                    <span className="md:hidden"> · {o.userCount} người dùng</span>
                  </span>
                </span>
                <span className="hidden flex-none text-sm text-gray-600 md:block">{o.userCount} người dùng</span>
                <ChevronRight
                  size={18}
                  className="flex-none text-gray-400 transition-transform [@media(hover:hover)]:group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
