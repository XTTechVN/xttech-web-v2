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
import { Clock, Navigation, FolderGit2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const TechnicianDashboard = () => {
  const router = useRouter();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => getDashboardSummary(),
    refetchInterval: 60000,
  });

  const isCheckedIn = Boolean(data?.myAttendance?.checkIn);
  const checkInText = isCheckedIn
    ? `Vào ca lúc ${data?.myAttendance?.checkIn?.slice(0, 5)}`
    : 'Chưa vào ca';

  const statsData = [
    {
      title: 'Trạng thái ca kỹ thuật',
      value: isCheckedIn ? 'Đang thực địa' : 'Chưa điểm danh',
      icon: <Clock size={18} />,
      onClick: () => router.push('/app/attendances'),
    },
    {
      title: 'Giờ check-in hôm nay',
      value: checkInText,
      icon: <CheckCircle2 size={18} />,
      onClick: () => router.push('/app/attendances'),
    },
    {
      title: 'Đồng nghiệp online GPS',
      value: isLoading ? '...' : `${data?.onlineStaffCount ?? 0} người`,
      icon: <Navigation size={18} />,
      onClick: () => router.push('/app/live-map'),
    },
    {
      title: 'Dự án công trình',
      value: isLoading ? '...' : `${data?.activeProjectsCount ?? 0} dự án`,
      icon: <FolderGit2 size={18} />,
      onClick: () => router.push('/app/projects'),
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
        <LiveStaffWidget />
        <SystemHistory />
      </div>

      {/* 2. Desktop Technician View */}
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

export default TechnicianDashboard;
