'use client';

import React from 'react';
import StatCard from '../_components/stats-card';
import Schedule from '../_components/schedule';
import Document from '../_components/document';
import { Briefcase, FolderKanban, Receipt, Users } from 'lucide-react';

const statsMockupData = [
  {
    title: 'Dự án đang theo dõi',
    value: '_',
    icon: <FolderKanban size={18} />,
    trend: 1,
    trendDirection: 'up' as const,
  },
  {
    title: 'Khách hàng quản lý',
    value: '_',
    icon: <Users size={18} />,
    trend: 3,
    trendDirection: 'up' as const,
  },
  {
    title: 'Báo giá đã gửi',
    value: '_',
    icon: <Receipt size={18} />,
    trend: 8,
    trendDirection: 'up' as const,
  },
  {
    title: 'Hợp đồng mới',
    value: '_',
    icon: <Briefcase size={18} />,
    trend: 0,
    trendDirection: 'up' as const,
  },
];

export const SaleDashboard = () => {
  return (
    <div className="flex relative">
      <div className="flex-1 min-w-0 flex flex-col p-1 gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {statsMockupData.map((stat, index) => (
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
      </div>
    </div>
  );
};
