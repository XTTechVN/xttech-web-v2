  'use client';

  // Thành phần dùng chung cho toàn trang
  import { Heading } from '@/components';

  // Các thành phần dùng riêng cho phòng ban
  import StatCart from './_components/stats-card';
  import ActionBar from './_components/action-bar';
  import Table from './_components/table';

  // icons thư viện lucide - react
  import { Building2, Users, UserCheck, Briefcase } from 'lucide-react';

  // API Actions & React Query
  import { getEmployees } from '@/actions/employee';
  import { getDepartments } from '@/actions/department';

  import { useQuery } from '@tanstack/react-query';

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

    const totalDepartments = departmentData?.pagination?.total || 0;
    const activeDepartments = departmentData?.pagination?.total || 0;
    const totalEmployees = employeeData?.pagination?.total || 0;

    // Dữ liệu mockup cho stat - card
    const departmentStats = [
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
        value: Number(activeDepartments),
        icon: <UserCheck />,
        trend: 2,
        trendDirection: 'up' as const,
      },
      {
        title: 'Phòng ban mới',
        value: Number(totalDepartments),
        icon: <Briefcase />,
        trend: 0,
        trendDirection: 'up' as const,
      },
    ];
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
            <StatCart key={index} title={stat.title} value={stat.value} icon={stat.icon} trend={stat.trend} trendDirection={stat.trendDirection} />
          ))}
        </div>
        <ActionBar />
        <Table />
      </div>
    );
  };

  export default Page;
