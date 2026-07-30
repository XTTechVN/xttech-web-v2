import { Heading } from '@/components';
import StatCart from './_components/stats-card';
import { Building2, Users, UserCheck, Briefcase } from 'lucide-react';

const departmentStats = [
  {
    title: 'Tổng số phòng ban',
    value: '8',
    icon: <Building2 />,
    trend: 10,
    trendDirection: 'up' as const,
  },
  {
    title: 'Tổng số nhân sự',
    value: '124',
    icon: <Users />,
    trend: 15,
    trendDirection: 'up' as const,
  },
  {
    title: 'Đang hoạt động',
    value: '118',
    icon: <UserCheck />,
    trend: 2,
    trendDirection: 'up' as const,
  },
  {
    title: 'Phòng ban mới',
    value: '1',
    icon: <Briefcase />,
    trend: 0,
    trendDirection: 'up' as const,
  },
];

const Page = () => {
  return (
    <div className="flex flex-col p-3 gap-4">
      <div className="flex flex-col gap-2">
        <Heading size="h1" className="text-primary text-2xl md:text-4xl">
          Quản lý phòng ban
        </Heading>
        <Heading size="h3" className="text-gray-500 text-sm md:text-lg">
          Danh sách các phòng ban sẽ đc hiển thị tại đây
        </Heading>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {departmentStats.map((stat, index) => (
          <StatCart
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendDirection={stat.trendDirection}
          />
        ))}
      </div>
    </div>
  );
};

export default Page;
