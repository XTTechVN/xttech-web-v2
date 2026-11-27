'use client';

import React from 'react';
import Gate from '../_components/gate';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '@/actions';
import StatCard from '../_components/stats-card';
import MobileHeader from '../_components/mobile-header';
import QuickAttendanceCard from '../_components/quick-attendance-card';
import QuickActionsGrid from '../_components/quick-actions-grid';
import PendingApprovalsCard from '../_components/pending-approvals-card';
import WeeklyAttendanceChart from '../_components/weekly-attendance-chart';
import LiveStaffWidget from '../_components/live-staff-widget';
import { Users, CheckCircle2, CalendarOff, ClockAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MyTasksReminderWidget } from '../_components/my-tasks-reminder-widget';
import { LatestRulesWidget } from '../_components/latest-rules-widget';

export const HRDashboard = () => {
  const router = useRouter();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => getDashboardSummary(),
    refetchInterval: 60000,
  });

  const totalEmployees = isLoading ? '...' : String(data?.totalEmployees ?? 0);
  const todayAttendances = isLoading ? '...' : String(data?.todayAttendancesCount ?? 0);
  const pendingLeaves = isLoading ? '...' : String(data?.pendingLeavesCount ?? 0);
  const pendingAdjustments = isLoading ? '...' : String(data?.pendingAdjustmentsCount ?? 0);

  const statsData = [
    {
      title: 'Tổng nhân sự',
      value: totalEmployees,
      icon: <Users size={18} />,
      onClick: () => router.push('/app/employees'),
      requires: 'user:read',
    },
    {
      title: 'Chuyên cần hôm nay',
      value: todayAttendances,
      icon: <CheckCircle2 size={18} />,
      onClick: () => router.push('/app/attendances'),
      requires: 'attendance_report:read',
    },
    {
      title: 'Đơn nghỉ phép chờ duyệt',
      value: pendingLeaves,
      icon: <CalendarOff size={18} />,
      onClick: () => router.push('/app/leave-requests'),
      requires: 'leave_request:read',
    },
    {
      title: 'Giải trình công chờ duyệt',
      value: pendingAdjustments,
      icon: <ClockAlert size={18} />,
      onClick: () => router.push('/app/attendances/adjustments'),
      requires: 'attendance_request:read',
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* 1. Mobile Super-App */}
      <div className="flex md:hidden flex-col gap-3.5">
        <MobileHeader onRefresh={() => refetch()} isRefreshing={isRefetching} />
        <QuickAttendanceCard attendance={data?.myAttendance} />
        <QuickActionsGrid
          pendingLeavesCount={data?.pendingLeavesCount}
          pendingAdjustmentsCount={data?.pendingAdjustmentsCount}
        />
        <Gate any={['staff_task:read']}>
          <MyTasksReminderWidget />
        </Gate>
        <Gate any={['rule:read']}>
          <LatestRulesWidget />
        </Gate>
        <Gate any={['leave_request:review', 'attendance_request:review']}>
          <PendingApprovalsCard
            pendingLeavesCount={data?.pendingLeavesCount ?? 0}
            pendingAdjustmentsCount={data?.pendingAdjustmentsCount ?? 0}
            recentLeaves={data?.recentPendingLeaves}
            recentAdjustments={data?.recentPendingAdjustments}
          />
        </Gate>
      </div>

      {/* 2. Desktop Command Center */}
      <div className="hidden md:flex flex-col gap-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              onClick={stat.onClick}
              requires={stat.requires}
            />
          ))}
        </div>

        <div className="grid grid-cols-12 gap-4 min-w-0">
          {/* Cột trái (8 cols): Biểu đồ thật & Bảng duyệt đơn khẩn cấp */}
          <div className="col-span-8 flex flex-col gap-4 min-w-0">
            <Gate any={['staff_task:read']}>
              <MyTasksReminderWidget />
            </Gate>
            <Gate any={['rule:read']}>
              <LatestRulesWidget />
            </Gate>
            <WeeklyAttendanceChart
              data={data?.weeklyStats}
              todayCount={data?.todayAttendancesCount}
            />
            <Gate any={['leave_request:review', 'attendance_request:review']}>
              <PendingApprovalsCard
                pendingLeavesCount={data?.pendingLeavesCount ?? 0}
                pendingAdjustmentsCount={data?.pendingAdjustmentsCount ?? 0}
                recentLeaves={data?.recentPendingLeaves}
                recentAdjustments={data?.recentPendingAdjustments}
              />
            </Gate>
          </div>

          {/* Cột phải (4 cols): Giám sát nhân viên ngoài thực địa */}
          <div className="col-span-4 flex flex-col gap-4 min-w-0">
            <Gate any={['live_map:read']}>
              <LiveStaffWidget />
            </Gate>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
