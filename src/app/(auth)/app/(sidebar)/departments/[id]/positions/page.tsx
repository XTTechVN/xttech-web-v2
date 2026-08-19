'use client';

// Thành phần dùng chung cho toàn trang
import { Heading } from '@/components';

// Các thành phần dùng riêng cho phòng ban
import ActionBar from './_components/action-bar';
import Table from './_components/table';

// API Actions & React Query
import { getDepartment } from '@/actions';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

const Page = () => {
  const params = useParams();
  const departmentId = Number(params.id);

  // Lấy thông tin phòng ban hiện tại
  const { data: departmentDetail } = useQuery({
    queryKey: ['department', departmentId],
    queryFn: () => getDepartment(departmentId),
    enabled: !!departmentId,
  });

  return (
    <div className="flex flex-col gap-4">dsdsdx 
      <ActionBar />
      <Table />
    </div>
  );
};

export default Page;
