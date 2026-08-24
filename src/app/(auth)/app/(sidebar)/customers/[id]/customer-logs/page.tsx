'use client';

import React from 'react';
import { Breadcrumb } from '@/components';
import { CustomerInfo } from './_components/customer-info';
import { InteractionLogs } from './_components/interaction-logs';
import { useQuery } from '@tanstack/react-query';
import { getCustomer } from '@/actions';



const CustomerLogsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params);
  
  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(Number(id)),
  });

  const breadcrumbs = [
    { label: 'Trang chủ', href: '/app/dashboard' },
    { label: 'Khách hàng', href: '/app/customers' },
    { label: `Chi tiết khách hàng #${id}`, href: '#' },
  ];

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Đang tải dữ liệu khách hàng...</div>;
  }

  if (!customer) {
    return <div className="p-8 text-center text-red-500 font-medium">Không tìm thấy thông tin khách hàng.</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-3">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">
          {customer.name}
        </h1>
      </div>

      <div className="flex flex-col gap-6 mt-2">
        <CustomerInfo customer={customer} />
        <InteractionLogs customerId={Number(id)} />
      </div>
    </div>
  );
};

export default CustomerLogsPage;