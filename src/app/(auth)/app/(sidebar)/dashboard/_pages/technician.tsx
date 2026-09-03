'use client';

import React from 'react';
import StatCard from '../_components/stats-card';
import Schedule from '../_components/schedule';
import { CalendarRange, ClipboardList, CheckSquare, Clock } from 'lucide-react';

const statsMockupData = [
  {
    title: 'Ca trực hôm nay',
    value: '_',
    icon: <Clock size={18} />,
    trend: 0,
    trendDirection: 'up' as const,
  },
  {
    title: 'Công việc cần làm',
    value: '_',
    icon: <ClipboardList size={18} />,
    trend: 2,
    trendDirection: 'up' as const,
  },
  {
    title: 'Công việc hoàn thành',
    value: '_',
    icon: <CheckSquare size={18} />,
    trend: 5,
    trendDirection: 'up' as const,
  },
  {
    title: 'Ngày công tháng này',
    value: '_',
    icon: <CalendarRange size={18} />,
    trend: 4,
    trendDirection: 'up' as const,
  },
];

export const TechnicianDashboard = () => {
  return (
    <div className="flex relative">
      <div className="flex-1 min-w-0 flex flex-col p-1 gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {statsMockupData.map((stat, index) => (
            <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} trend={stat.trend} trendDirection={stat.trendDirection} />
          ))}
        </div>
        <div className="md:grid md:grid-cols-12 md:gap-4 flex flex-col gap-2">
          <div className="col-span-12">
            <Schedule />
          </div>
        </div>
      </div>
    </div>
  );
};
