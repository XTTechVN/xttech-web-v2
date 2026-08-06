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
    <div className="flex flex-col p-3 gap-4">
      <div className="flex flex-col gap-2">
        <Heading size="h1" className="text-primary text-2xl md:text-4xl">
          Chi tiết phòng ban{departmentDetail?.name ? ` - ${departmentDetail.name}` : ''}
        </Heading>
        <Heading size="h3" className="text-gray-500 text-sm md:text-lg">
          Danh sách các vị trí trong phòng ban sẽ được hiển thị tại đây
        </Heading>
      </div>
      <ActionBar />
      <Table />
    </div>
  );
};

export default Page;
