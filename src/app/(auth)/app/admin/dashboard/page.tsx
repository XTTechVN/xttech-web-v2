'use client';

import React, { useState } from 'react';

// Thành phần riêng cho trang Home
import Banner from './_components/banner';
import StatCard from './_components/stat-card';
import SystemHistory from './_components/system-history';
import AnalyticsChart from './_components/analytics-chart';
// Icon thư viện lucide-react
import { Users, UserPlus, Building2, Briefcase, BarChart3, LayoutGrid } from 'lucide-react';

const page = () => {
  // Dữ liệu mockup cho stat - card
  const statsMockupData = [
    {
      title: 'Số lượng nhân viên',
      value: '10',
      icon: <Users size={18} />,
      trend: 5,
      trendType: 'up',
      bgIcon: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Số lượng ứng viên',
      value: '45',
      icon: <UserPlus size={18} />,
      trend: 12,
      trendType: 'up',
      bgIcon: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Số người đã gửi báo cáo',
      value: '12',
      icon: <Building2 size={18} />,
      trend: 0,
      trendType: 'up',
      bgIcon: 'bg-orange-50 text-orange-600',
    },
    {
      title: 'Số người đã chấm công',
      value: '8',
      icon: <Briefcase size={18} />,
      trend: 2,
      trendType: 'up',
      bgIcon: 'bg-red-50 text-red-600',
    },
    {
      title: 'Số người đang đúng tiến độ học',
      value: '8',
      icon: <BarChart3 size={18} />,
      trend: 2,
      trendType: 'up',
      bgIcon: 'bg-pink-50 text-pink-600',
    },
    {
      title: 'Số buổi đào tạo',
      value: '8',
      icon: <LayoutGrid size={18} />,
      trend: 2,
      trendType: 'up',
      bgIcon: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="flex  relative">
      {/* Nội dung chínhg*/}
      <div className="flex-1 min-w-0 flex flex-col p-4 gap-12">
        <Banner />
        <div className="flex flex-row overflow-x-auto pb-2 md:grid md:grid-cols-3 lg:grid-cols-6 gap-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {statsMockupData.map((stat, index) => (
            <div key={index} className="">
              <StatCard title={stat.title} value={stat.value} icon={stat.icon} trend={stat.trend} trendType={stat.trendType} bgIcon={stat.bgIcon} />
            </div>
          ))}
        </div>
        <div className="md:grid md:grid-cols-12 md:gap-2 flex flex-col gap-2">
          <div className="col-span-7">
            <AnalyticsChart />
          </div>
          <div className="col-span-5">
            <SystemHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
