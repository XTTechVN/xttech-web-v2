'use client';

import StatCard from '../_components/stats-card';
import Schedule from '../_components/schedule';
import Document from '../_components/document';
import { Clock, CalendarCheck, FileText, Sparkles } from 'lucide-react';

const statsMockupData = [
  {
    title: 'Ca làm việc hôm nay',
    value: '_',
    icon: <Clock size={18} />,
    trend: 0,
    trendDirection: 'up' as const,
  },
  {
    title: 'Ngày công tháng này',
    value: '_',
    icon: <CalendarCheck size={18} />,
    trend: 3,
    trendDirection: 'up' as const,
  },
  {
    title: 'Đơn từ & Khiếu nại',
    value: '_',
    icon: <FileText size={18} />,
    trend: 0,
    trendDirection: 'up' as const,
  },
  {
    title: 'Đề xuất & Đóng góp',
    value: '_',
    icon: <Sparkles size={18} />,
    trend: 1,
    trendDirection: 'up' as const,
  },
];

export const EmployeeDashboard = () => {
  return (
    <div className="flex relative">
      <div className="flex-1 min-w-0 flex flex-col p-1 gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {statsMockupData.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              trendDirection={stat.trendDirection}
            />
          ))}
        </div>
        <div className="md:grid md:grid-cols-12 md:gap-4 flex flex-col gap-2">
          <div className="col-span-6">
            <Schedule />
          </div>
          <div className="col-span-6">
            <Document />
          </div>
        </div>
      </div>
    </div>
  );
};
