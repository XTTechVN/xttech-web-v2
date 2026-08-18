'use client';

// Thành phần dùng chung cho toàn trang
import { Heading } from '@/components';

// Các thành phần dùng riêng cho nhân viên
import { StatCart } from './_components';
import { ActionBar } from './_components';
import { Table } from './_components';

// icons thư viện lucide - react
import { Building2, Users, UserCheck, Briefcase } from 'lucide-react';

// API Actions & React Query
import { useQuery } from '@tanstack/react-query';
import { getEmployees } from '@/actions/employee';
import { getDepartments } from '@/actions/department';

const Page = () => {
  // Lấy tổng số phòng ban
  const { data: departmentData } = useQuery({
    queryKey: ['departments', 'total'],
    queryFn: () => getDepartments({ limit: 1 }),
  });

  // Lấy tổng số nhân viên
  const { data: employeeData } = useQuery({
    queryKey: ['employees', 'total'],
    queryFn: () => getEmployees({ limit: 1 }),
  });

  const totalDepartments = departmentData?.meta?.total || 0;
  const totalEmployees = employeeData?.meta?.total || 0;

  // Dữ liệu mockup cho stat - card
  const employeeStats = [
    {
      title: 'Tổng số phòng ban',
      value: Number(totalDepartments),
      icon: <Building2 />,
      trend: 10,
      trendDirection: 'up' as const,
    },
    {
      title: 'Tổng số nhân sự',
      value: totalEmployees,
      icon: <Users />,
      trend: 15,
      trendDirection: 'up' as const,
    },
    {
      title: 'Đang hoạt động',
      value: Number(totalEmployees),
      icon: <UserCheck />,
      trend: 2,
      trendDirection: 'up' as const,
    },
    {
      title: 'Nhân viên mới',
      value: Number(totalEmployees),
      icon: <Briefcase />,
      trend: 0,
      trendDirection: 'up' as const,
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {employeeStats.map((stat, index) => (
          <StatCart key={index} title={stat.title} value={stat.value} icon={stat.icon} trend={stat.trend} trendDirection={stat.trendDirection} />
        ))}
      </div>
      <ActionBar />
      <Table />
    </div>
  );
};

export default Page;
