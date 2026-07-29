'use client';

// Thành phần riêng cho trang Home
import Banner from './_components/banner';
import StatCard from './_components/stats-card';
import SystemHistory from './_components/system-history';
import AnalyticsChart from './_components/analytics-chart';

// Icon thư viện lucide-react
import { Users, UserPlus, Building2, Briefcase, BarChart3, LayoutGrid } from 'lucide-react';

// Dữ liệu mockup cho stat - card
const statsMockupData = [
  {
    title: 'Số lượng nhân viên',
    value: '10',
    icon: <Users size={18} />,
    trend: 5,
    trendType: 'up',
    bgIcon: 'bg-primary/30 text-primary',
  },
  {
    title: 'Số lượng ứng viên',
    value: '45',
    icon: <UserPlus size={18} />,
    trend: 12,
    trendType: 'up',
    bgIcon: 'bg-primary/30 text-primary',
  },
  {
    title: 'Số người đã chấm công',
    value: '8',
    icon: <Briefcase size={18} />,
    trend: 2,
    trendType: 'up',
    bgIcon: 'bg-primary/30 text-primary',
  },
  {
    title: 'Số buổi đào tạo',
    value: '8',
    icon: <LayoutGrid size={18} />,
    trend: 2,
    trendType: 'up',
    bgIcon: 'bg-primary/30 text-primary',
  },
];

const page = () => {
  return (
    <div className="flex  relative">
      {/* Nội dung chínhg*/}
      <div className="flex-1 min-w-0 flex flex-col p-4 gap-6 md:gap-12">
        <Banner />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {statsMockupData.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              trendType={stat.trendType}
              bgIcon={stat.bgIcon}
            />
          ))}
        </div>
        <div className="md:grid md:grid-cols-12 md:gap-8 flex flex-col gap-2">
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
