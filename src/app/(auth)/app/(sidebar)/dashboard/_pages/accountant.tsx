'use client';

import React from 'react';
import StatCard from '../_components/stats-card';
import Schedule from '../_components/schedule';
import Document from '../_components/document';
import { DollarSign, Wallet, FileSpreadsheet, Receipt } from 'lucide-react';

const statsMockupData = [
  {
    title: 'Ngân sách dự án',
    value: '1.2B',
    icon: <Wallet size={18} />,
    trend: 10,
    trendDirection: 'up' as const,
  },
  {
    title: 'Hóa đơn cần xử lý',
    value: '8',
    icon: <Receipt size={18} />,
    trend: 2,
    trendDirection: 'up' as const,
  },
  {
    title: 'Bảng lương đã duyệt',
    value: '2',
    icon: <FileSpreadsheet size={18} />,
    trend: 0,
    trendDirection: 'up' as const,
  },
  {
    title: 'Doanh thu tháng này',
    value: '450M',
    icon: <DollarSign size={18} />,
    trend: 15,
    trendDirection: 'up' as const,
  },
];

export const AccountantDashboard = () => {
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
