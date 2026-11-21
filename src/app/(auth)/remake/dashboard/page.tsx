'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '@/actions';
import { Bell } from 'lucide-react';
import { useCan } from '@/hooks';
import { useMeStore } from '@/stores';
import { getFileUrl } from '@/utils';
import { CheckInCard } from './_components/check-in-card';
import { QuickActions } from './_components/quick-actions';
import { AttentionList, useAttention } from './_components/attention-list';
import { WeekTrend } from './_components/week-trend';
import { PageHeader } from '../_components/page-header';
import { ErrorState, ListSkeleton } from '../_components/state-views';

// Tổng quan theo quyền: mỗi khối chỉ hiện khi người dùng có quyền xem dữ liệu đó.
export default function RemakeDashboardPage() {
  const { can, scopeOf } = useCan();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboardSummary });
  const wide = (code: string) => can(code) && scopeOf(code) !== 'own';
  const mine = (review: boolean) => (review ? 'chờ duyệt' : 'của tôi đang chờ');

  const stats =
    data &&
    [
      { show: can('user:read'), label: 'Nhân sự', value: data.totalEmployees, href: '/remake/employees' },
      { show: wide('attendance:read'), label: 'Chấm công hôm nay', value: data.todayAttendancesCount, href: '/remake/attendances' },
      {
        show: can('leave_request:read'),
        label: `Đơn nghỉ ${mine(can('leave_request:review'))}`,
        value: data.pendingLeavesCount,
        href: '/remake/leave-requests',
      },
      {
        show: can('attendance_request:read'),
        label: `Giải trình ${mine(wide('attendance_request:read'))}`,
        value: data.pendingAdjustmentsCount,
        href: '/remake/adjustments',
      },
      { show: can('project:read'), label: 'Dự án đang chạy', value: data.activeProjectsCount, href: '/remake/projects' },
      { show: can('live_map:read'), label: 'Đang online', value: data.onlineStaffCount, href: '/remake/live-map' },
    ].filter((s) => s.show);
  const me = data?.myAttendance;
  const att = useAttention(can, data);
  const [attOpen, setAttOpen] = useState(false);
  const user = useMeStore((m) => m.me?.user);
  const name = user?.fullName || user?.username || '';

  return (
    <>
      <header className="mb-5 flex items-center gap-3 md:hidden">
        <span className="flex size-12 flex-none items-center justify-center overflow-hidden rounded-full bg-rm-primary-soft font-heading text-lg font-semibold text-rm-primary">
          {user?.avatar ? <img src={getFileUrl(user.avatar)} alt="" className="size-full object-cover" /> : name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-rm-muted">Xin chào 👋</p>
          <p className="truncate font-heading text-base font-semibold">{name || '…'}</p>
        </div>
        <button
          type="button"
          onClick={() => setAttOpen(true)}
          aria-label={att.items.length > 0 ? `Thông báo, ${att.items.length} việc cần xem` : 'Thông báo'}
          className="relative flex size-11 flex-none items-center justify-center rounded-full bg-rm-surface transition-transform active:scale-95"
        >
          <Bell size={20} />
          {att.items.length > 0 && (
            <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-rm-danger px-1 text-[10px] font-semibold leading-4 text-white">
              {att.items.length > 9 ? '9+' : att.items.length}
            </span>
          )}
        </button>
      </header>

      <QuickActions />

      <PageHeader title="Tổng quan" description="Việc và số liệu theo quyền của bạn." />

      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState title="Không tải được tổng quan" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />
      )}
      {data && stats && me && (
        <div className="flex flex-col gap-6 md:gap-4">
          <CheckInCard me={me} />

          {stats.length > 0 && (
            <ul className="flex flex-wrap gap-3">
              {stats.map((s) => (
                <li key={s.label} className="min-w-0 flex-[1_1_8.5rem]">
                  <Link
                    href={s.href}
                    className="flex h-full flex-col gap-1 rounded-rm-xl border border-rm-edge bg-rm-surface p-3 active:bg-rm-bg md:hover:bg-rm-bg"
                  >
                    <span className="font-heading text-2xl font-semibold">{s.value}</span>
                    <span className="text-xs text-rm-muted">{s.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[repeat(2,minmax(0,1fr))]">
            <div className="order-last flex md:order-first">
              <WeekTrend can={can} />
            </div>
            <AttentionList att={att} open={attOpen} onOpenChange={setAttOpen} />
          </div>
        </div>
      )}
    </>
  );
}
