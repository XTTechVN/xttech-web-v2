'use client';

// Thành phần riêng cho trang Home
import StatCard from './_components/stats-card';
import SystemHistory from './_components/system-history';
import AnalyticsChart from './_components/analytics-chart';
import Schedule from './_components/schedule';
import Document from './_components/document';

// Thành phần dùng chung cho toàn bộ trang
import { Heading } from '@/components';

// Icon thư viện lucide-react
import { Users, UserPlus, Briefcase, LayoutGrid } from 'lucide-react';
<<<<<<< HEAD:src/app/(auth)/app/(sidebar)/dashboard/page.tsx

import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils';
=======
>>>>>>> 08032d9 (feat: add reusable TableAction component and clean up unused imports in admin dashboard):src/app/(auth)/app/admin/dashboard/page.tsx

// Dữ liệu mockup cho stat - card
const statsMockupData = [
  {
    title: 'Số lượng nhân viên',
    value: '10',
    icon: <Users size={18} />,
    trend: 5,
    trendDirection: 'up' as const,
  },
  {
    title: 'Số lượng ứng viên',
    value: '45',
    icon: <UserPlus size={18} />,
    trend: 12,
    trendDirection: 'up' as const,
  },
  {
    title: 'Số người đã chấm công',
    value: '8',
    icon: <Briefcase size={18} />,
    trend: 2,
    trendDirection: 'up' as const,
  },
  {
    title: 'Số buổi đào tạo',
    value: '8',
    icon: <LayoutGrid size={18} />,
    trend: 2,
    trendDirection: 'up' as const,
  },
];

const page = () => {
  return (
    <div className="flex relative">
      <div className="flex-1 min-w-0 flex flex-col p-3 gap-4">
        <div className="flex flex-col gap-2">
          <Heading size="h1" className="text-primary text-2xl md:text-4xl">
            XTTECH xin chào ! Quyên
          </Heading>
          <Heading size="h3" className="text-gray-500 text-sm md:text-lg">
            Quản lý nội bộ báo cáo an toàn hiệu quả cho doanh nghiệp
          </Heading>
        </div>
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

export default page;
