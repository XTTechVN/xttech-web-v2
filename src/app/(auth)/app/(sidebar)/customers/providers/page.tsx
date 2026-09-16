'use client';

import React, { useState } from 'react';
import { Building2, CheckCircle2, Award, Layers } from 'lucide-react';
import { StatsCard, Modal, Button } from '@/components';
import { useQuery, useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import { getCustomerProviders, deleteCustomerProvider } from '@/actions';
import type { CustomerProvider } from '@/types';
import toast from 'react-hot-toast';
import CustomerProviderTable from './_components/table';
import CustomerProviderFormModal from '../_components/provider-form-modal';

export default function CustomerProvidersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<CustomerProvider | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<CustomerProvider | null>(null);

  // Lấy tổng số nhà cung cấp cho khối thống kê
  const { data: providersData } = useQuery({
    queryKey: ['customer-providers', 'stats-total'],
    queryFn: () => getCustomerProviders({ limit: 1 }),
  });

  const totalProviders = providersData?.meta?.total || 0;

  // Khối 4 thẻ thống kê chuẩn hệ thống
  const stats = [
    {
      title: 'Tổng số nhà cung cấp',
      value: Number(totalProviders),
      icon: <Building2 />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Đang hoạt động',
      value: Number(totalProviders),
      icon: <CheckCircle2 />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Nguồn đối tác',
      value: Number(totalProviders),
      icon: <Award />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Mới cập nhật',
      value: Number(totalProviders),
      icon: <Layers />,
      trend: 0,
      trendDirection: 'up' as const,
    },
  ];

  // Mutation xóa nhà cung cấp
  const { mutate: deleteMutate, isPending: isDeletePending } = useMutation({
    mutationFn: deleteCustomerProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-providers'] });
      toast.success('Xóa nhà cung cấp thành công');
      setIsDeleteOpen(false);
      setProviderToDelete(null);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message || error?.message || 'Lỗi khi xóa nhà cung cấp'
      );
    },
  });

  const handleOpenCreateModal = () => {
    setSelectedProvider(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (provider: CustomerProvider) => {
    setSelectedProvider(provider);
    setIsFormOpen(true);
  };

  const handleOpenDeleteModal = (provider: CustomerProvider) => {
    setProviderToDelete(provider);
    setIsDeleteOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Khối thống kê 4 thẻ chuẩn hệ thống */}
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

      {/* Bảng danh sách nhà cung cấp */}
      <CustomerProviderTable
        onAddClick={handleOpenCreateModal}
        onEditClick={handleOpenEditModal}
        onDeleteClick={handleOpenDeleteModal}
      />

      {/* Modal Thêm / Sửa nhà cung cấp */}
      <CustomerProviderFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedProvider(null);
        }}
        title={selectedProvider ? 'Sửa thông tin nhà cung cấp' : 'Thêm nhà cung cấp mới'}
        submitText={selectedProvider ? 'Xác nhận lưu' : 'Xác nhận tạo'}
        initialData={selectedProvider}
      />

      {/* Modal xác nhận xóa */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setProviderToDelete(null);
        }}
        title="Xác nhận xóa nhà cung cấp"
        className="max-w-md w-full"
      >
        <div className="py-2">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa nhà cung cấp{' '}
            <strong className="text-gray-900 font-semibold">{providerToDelete?.name}</strong> (Mã:{' '}
            {providerToDelete?.code})?
          </p>
          <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg border border-amber-200">
            Lưu ý: Thao tác này sẽ xóa mềm nhà cung cấp khỏi danh mục lựa chọn.
          </p>
        </div>
        <div className="flex gap-3 justify-end w-full mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsDeleteOpen(false);
              setProviderToDelete(null);
            }}
            disabled={isDeletePending}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={isDeletePending}
            onClick={() => {
              if (providerToDelete?.id) {
                deleteMutate(providerToDelete.id);
              }
            }}
          >
            {isDeletePending ? 'Đang xóa...' : 'Xác nhận xóa'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
