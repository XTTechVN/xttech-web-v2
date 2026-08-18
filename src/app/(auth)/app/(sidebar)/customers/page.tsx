'use client';

import React, { useState } from 'react';
import { Heading, StatsCard } from '@/components';
import Table from './_components/table';
import { Users, UserCheck, ShieldAlert, Award } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getCustomers, deleteCustomer } from '@/actions';
import type { Customer } from '@/types';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { CustomerFormModal, CustomerDeleteModal } from './_components/modals';

const Page = () => {
  const { data: customerData } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await getCustomers({ limit: 9999 });
      return res.items;
    },
  });

  // State quản lý các modal tập trung
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Mutation xóa khách hàng
  const { mutate: deleteCustomerMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Xóa khách hàng thành công');
      setIsDeleteOpen(false);
      setCustomerToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const totalCustomers = customerData?.length || 0;

  const stats = [
    {
      title: 'Tổng số khách hàng',
      value: totalCustomers,
      icon: <Users />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Khách hàng active',
      value: totalCustomers,
      icon: <UserCheck />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Khách hàng VIP',
      value: 0,
      icon: <Award />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Cần liên hệ lại',
      value: 0,
      icon: <ShieldAlert />,
      trend: 0,
      trendDirection: 'up' as const,
    },
  ];

  const handleOpenCreateModal = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleOpenDeleteModal = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Heading size="h1" className="text-primary text-2xl md:text-4xl">
          Quản lý khách hàng
        </Heading>
        <Heading size="h3" className="text-gray-500 text-sm md:text-lg">
          Danh sách khách hàng trong hệ thống
        </Heading>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendDirection={stat.trendDirection}
          />
        ))}
      </div>
      <Table 
        onEditClick={handleOpenEditModal}
        onDeleteClick={handleOpenDeleteModal}
        onAddClick={handleOpenCreateModal}
      />

      {/* Modal Zone */}
      <CustomerFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCustomer(null);
        }}
        title={selectedCustomer ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng mới'}
        submitText={selectedCustomer ? 'Xác nhận lưu' : 'Xác nhận tạo'}
        initialData={
          selectedCustomer
            ? {
                id: selectedCustomer.id,
                name: selectedCustomer.name,
                address: selectedCustomer.address,
                identifyCode: selectedCustomer.identifyCode,
                email: selectedCustomer.email,
                phone: selectedCustomer.phone,
              }
            : undefined
        }
      />

      <CustomerDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setCustomerToDelete(null);
        }}
        customerName={customerToDelete?.name}
        onConfirm={() => {
          if (customerToDelete) deleteCustomerMutation(customerToDelete.id);
        }}
        isPending={isDeleting}
      />
    </div>
  );
};

export default Page;