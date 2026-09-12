'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '@/actions';
import StatCard from '../_components/stats-card';
import SystemHistory from '../_components/system-history';
import MobileHeader from '../_components/mobile-header';
import QuickAttendanceCard from '../_components/quick-attendance-card';
import QuickActionsGrid from '../_components/quick-actions-grid';
import WeeklyAttendanceChart from '../_components/weekly-attendance-chart';
import LiveStaffWidget from '../_components/live-staff-widget';
import { FolderGit2, CheckCircle2, Clock, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const SaleDashboard = () => {
  const router = useRouter();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => getDashboardSummary(),
    refetchInterval: 60000,
  });

  const isCheckedIn = Boolean(data?.myAttendance?.checkIn);
  const checkInText = isCheckedIn
    ? `Vào lúc ${data?.myAttendance?.checkIn?.slice(0, 5)}`
    : 'Chưa vào ca';

  const statsData = [
    {
      title: 'Dự án đang theo dõi',
      value: isLoading ? '...' : `${data?.activeProjectsCount ?? 0} dự án`,
      icon: <FolderGit2 size={18} />,
      onClick: () => router.push('/app/projects'),
    },
    {
      title: 'Trạng thái điểm danh',
      value: isCheckedIn ? 'Đang làm việc' : 'Chưa vào ca',
      icon: <Clock size={18} />,
      onClick: () => router.push('/app/attendances'),
    },
    {
      title: 'Giờ check-in',
      value: checkInText,
      icon: <CheckCircle2 size={18} />,
      onClick: () => router.push('/app/attendances'),
    },
    {
      title: 'Tổng nhân sự công ty',
      value: isLoading ? '...' : `${data?.totalEmployees ?? 0} người`,
      icon: <Users size={18} />,
      onClick: () => router.push('/app/employees'),
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
        <SystemHistory />
      </div>

      {/* 2. Desktop Sale View */}
      <div className="hidden md:flex flex-col gap-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={0}
              onClick={stat.onClick}
            />
          ))}
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 flex flex-col gap-4">
            <QuickAttendanceCard attendance={data?.myAttendance} />
            <WeeklyAttendanceChart
              data={data?.weeklyStats}
              todayCount={data?.todayAttendancesCount}
            />
          </div>

          <div className="col-span-4 flex flex-col gap-4">
            <LiveStaffWidget />
            <SystemHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDashboard;
