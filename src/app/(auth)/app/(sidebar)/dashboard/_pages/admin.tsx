'use client';

import React from 'react';
import Gate from '../_components/gate';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '@/actions';
import StatCard from '../_components/stats-card';
import SystemHistory from '../_components/system-history';
import MobileHeader from '../_components/mobile-header';
import QuickAttendanceCard from '../_components/quick-attendance-card';
import QuickActionsGrid from '../_components/quick-actions-grid';
import PendingApprovalsCard from '../_components/pending-approvals-card';
import WeeklyAttendanceChart from '../_components/weekly-attendance-chart';
import LiveStaffWidget from '../_components/live-staff-widget';
import ProjectReportCard from '../_components/project-report-card';
import { Users, CheckCircle2, ClockAlert, FolderGit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DepartmentRosterWidget } from '../_components/department-roster-widget';
import { MyTasksReminderWidget } from '../_components/my-tasks-reminder-widget';
import { LatestRulesWidget } from '../_components/latest-rules-widget';

export const AdminDashboard = () => {
  const router = useRouter();

  // Truy vấn dữ liệu thống kê tổng hợp thực tế từ backend
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => getDashboardSummary(),
    refetchInterval: 60000,
  });

  const totalEmployees = isLoading ? '...' : String(data?.totalEmployees ?? 0);
  const todayAttendances = isLoading ? '...' : String(data?.todayAttendancesCount ?? 0);
  const totalPending = isLoading
    ? '...'
    : String((data?.pendingLeavesCount ?? 0) + (data?.pendingAdjustmentsCount ?? 0));
  const activeProjects = isLoading ? '...' : String(data?.activeProjectsCount ?? 0);

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
      title: 'Hồ sơ chờ phê duyệt',
      value: totalPending,
      icon: <ClockAlert size={18} />,
      onClick: () => router.push('/app/leave-requests'),
      requires: 'leave_request:read',
    },
    {
      title: 'Dự án đang triển khai',
      value: activeProjects,
      icon: <FolderGit2 size={18} />,
      onClick: () => router.push('/app/projects'),
      requires: 'project:read',
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* 1. Giao diện MOBILE: Chuẩn Super-App Doanh nghiệp (Lark Suite / Base.vn) */}
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
        <Gate any={['leave_request:review']}>
          <PendingApprovalsCard
            pendingLeavesCount={data?.pendingLeavesCount ?? 0}
            pendingAdjustmentsCount={data?.pendingAdjustmentsCount ?? 0}
            recentLeaves={data?.recentPendingLeaves}
            recentAdjustments={data?.recentPendingAdjustments}
          />
        </Gate>
        <Gate any={['attendance_report:read']}>
          <DepartmentRosterWidget />
        </Gate>
        <Gate any={['audit_log:read']}>
          <SystemHistory />
        </Gate>
      </div>

      {/* 2. Giao diện DESKTOP: Bảng điều hành chỉ huy (Command Center) */}
      <div className="hidden md:flex flex-col gap-4">
        {/* Hàng thẻ thống kê chỉ số thực tế */}
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

        {/* Bento Grid: Cột chính & Cột giám sát */}
        <div className="grid grid-cols-12 gap-4 min-w-0">
          {/* Cột trái (8 cols): Biểu đồ thật & Bảng duyệt đơn khẩn cấp */}
          <div className="col-span-8 flex flex-col gap-4 min-w-0">
            <Gate any={['staff_task:read']}>
              <MyTasksReminderWidget />
            </Gate>
            <Gate any={['rule:read']}>
              <LatestRulesWidget />
            </Gate>
            <Gate any={['project:view_stats']}>
              <ProjectReportCard />
            </Gate>
            <WeeklyAttendanceChart
              data={data?.weeklyStats}
              todayCount={data?.todayAttendancesCount}
            />
            <Gate any={['leave_request:review']}>
              <PendingApprovalsCard
                pendingLeavesCount={data?.pendingLeavesCount ?? 0}
                pendingAdjustmentsCount={data?.pendingAdjustmentsCount ?? 0}
                recentLeaves={data?.recentPendingLeaves}
                recentAdjustments={data?.recentPendingAdjustments}
              />
            </Gate>
          </div>

          {/* Cột phải (4 cols): Giám sát thực địa GPS & Lịch sử thao tác hệ thống */}
          <div className="col-span-4 flex flex-col gap-4 min-w-0">
            <Gate any={['live_map:read']}>
              <LiveStaffWidget />
            </Gate>
            <Gate any={['audit_log:read']}>
              <SystemHistory />
            </Gate>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
