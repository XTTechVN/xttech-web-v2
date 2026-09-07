'use client';

import { useQuery } from '@tanstack/react-query';
import { getEmployees } from '@/actions';
import StatCard from '../_components/stats-card';
import SystemHistory from '../_components/system-history';
import AnalyticsChart from '../_components/analytics-chart';
import Schedule from '../_components/schedule';
import Document from '../_components/document';
import { Users, UserPlus, Briefcase, LayoutGrid } from 'lucide-react';

export const AdminDashboard = () => {

  // Lấy tổng số lượng nhân viên
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['admin-dashboard-employees-count'],
    queryFn: () => getEmployees({ limit: 1 }),
  });

  const totalEmployees = isLoadingEmployees ? '...' : String(employeesData?.meta?.total ?? 0);

  const statsData = [
    {
      title: 'Số lượng nhân viên',
      value: totalEmployees,
      icon: <Users size={18} />,
      trend: 5,
      trendDirection: 'up' as const,
    },
    {
      title: 'Số lượng ứng viên',
      value: '_',
      icon: <UserPlus size={18} />,
      trend: 12,
      trendDirection: 'up' as const,
    },
    {
      title: 'Số người đã chấm công',
      value: '_',
      icon: <Briefcase size={18} />,
      trend: 2,
      trendDirection: 'up' as const,
    },
    {
      title: 'Số buổi đào tạo',
      value: '_',
      icon: <LayoutGrid size={18} />,
      trend: 2,
      trendDirection: 'up' as const,
    },
  ];

  return (
    <div className="flex relative">
      <div className="flex-1 min-w-0 flex flex-col p-1 gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} trend={stat.trend} trendDirection={stat.trendDirection} />
          ))}
        </div>
        <div className="md:grid md:grid-cols-12 md:gap-4 flex flex-col gap-2">
          <div className="col-span-6">
            <Document />
          </div>
          <div className="col-span-6">
            <Schedule />
          </div>
        </div>
        <div className="md:grid md:grid-cols-12 md:gap-4 flex flex-col gap-2">
          <div className="col-span-8">
            <AnalyticsChart />
          </div>
          <div className="col-span-4">
            <SystemHistory />
          </div>
        </div>
      </div>
    </div>
  );
};
