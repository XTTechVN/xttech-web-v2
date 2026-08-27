'use client';

import React, { useState } from 'react';
import { Heading, StatsCard } from '@/components';
import Table from './_components/table';
import { Settings, CheckCircle2, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAccessories, deleteAccessory } from '@/actions';
import type { Accessory } from '@/types';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { AccessoryCreateModal, AccessoryUpdateModal, AccessoryDeleteModal } from './_components/modals';

const Page = () => {
  const { data: accessoryData } = useQuery({
    queryKey: ['accessories'],
    queryFn: async () => {
      const res = await getAccessories({ limit: 9999 });
      return res.items;
    },
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [accessoryToDelete, setAccessoryToDelete] = useState<Accessory | null>(null);

  const { mutate: deleteAccessoryMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteAccessory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      toast.success('Xóa phụ kiện thành công');
      setIsDeleteOpen(false);
      setAccessoryToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const totalAccessories = accessoryData?.length || 0;

  const stats = [
    {
      title: 'Tổng loại phụ kiện',
      value: totalAccessories,
      icon: <Settings />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Hàng bán chạy',
      value: 0,
      icon: <ShoppingBag />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Đang hoạt động',
      value: totalAccessories,
      icon: <CheckCircle2 />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Đảm bảo chất lượng',
      value: totalAccessories,
      icon: <ShieldCheck />,
      trend: 0,
      trendDirection: 'up' as const,
    },
  ];

  const handleOpenCreateModal = () => {
    setSelectedAccessory(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (accessory: Accessory) => {
    setSelectedAccessory(accessory);
    setIsFormOpen(true);
  };

  const handleOpenDeleteModal = (accessory: Accessory) => {
    setAccessoryToDelete(accessory);
    setIsDeleteOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
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
      <AccessoryCreateModal
        isOpen={isFormOpen && !selectedAccessory}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedAccessory(null);
        }}
        title="Thêm phụ kiện mới"
        submitText="Xác nhận tạo"
      />

      <AccessoryUpdateModal
        isOpen={isFormOpen && !!selectedAccessory}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedAccessory(null);
        }}
        title="Sửa thông tin phụ kiện"
        submitText="Xác nhận lưu"
        initialData={
          selectedAccessory
            ? {
                id: selectedAccessory.id,
                name: selectedAccessory.name,
                code: selectedAccessory.code,
                specification: selectedAccessory.specification,
                unit: selectedAccessory.unit,
                costPrice: selectedAccessory.costPrice,
                retailPrice: selectedAccessory.retailPrice,
                salePrice: selectedAccessory.salePrice,
                imagePath: selectedAccessory.imagePath,
              }
            : undefined
        }
      />

      <AccessoryDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setAccessoryToDelete(null);
        }}
        accessoryName={accessoryToDelete?.name}
        onConfirm={() => {
          if (accessoryToDelete) deleteAccessoryMutation(accessoryToDelete.id);
        }}
        isPending={isDeleting}
      />
    </div>
  );
};

export default Page;
