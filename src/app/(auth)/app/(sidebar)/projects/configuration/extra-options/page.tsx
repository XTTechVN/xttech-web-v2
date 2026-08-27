'use client';

import React, { useState } from 'react';
import { Heading, StatsCard } from '@/components';
import Table from './_components/table';
import { Settings, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getExtraOptions, deleteExtraOption } from '@/actions';
import type { ExtraOption } from '@/types';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { ExtraOptionCreateModal, ExtraOptionUpdateModal, ExtraOptionDeleteModal } from './_components/modals';

const Page = () => {
  const { data: optionData } = useQuery({
    queryKey: ['extra-options'],
    queryFn: async () => {
      const res = await getExtraOptions({ limit: 9999 });
      return res.items;
    },
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ExtraOption | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState<ExtraOption | null>(null);

  const { mutate: deleteOptionMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteExtraOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extra-options'] });
      toast.success('Xóa tùy chọn phát sinh thành công');
      setIsDeleteOpen(false);
      setOptionToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Xóa thất bại');
    },
  });

  const totalOptions = optionData?.length || 0;

  const stats = [
    {
      title: 'Tổng số tùy chọn',
      value: totalOptions,
      icon: <Settings />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Đang hoạt động',
      value: totalOptions,
      icon: <CheckCircle2 />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Độ tin cậy',
      value: totalOptions,
      icon: <ShieldCheck />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Yêu cầu tùy biến',
      value: totalOptions,
      icon: <Activity />,
      trend: 0,
      trendDirection: 'up' as const,
    },
  ];

  const handleOpenCreateModal = () => {
    setSelectedOption(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (option: ExtraOption) => {
    setSelectedOption(option);
    setIsFormOpen(true);
  };

  const handleOpenDeleteModal = (option: ExtraOption) => {
    setOptionToDelete(option);
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
      <ExtraOptionCreateModal
        isOpen={isFormOpen && !selectedOption}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedOption(null);
        }}
        title="Thêm tùy chọn phát sinh"
        submitText="Xác nhận tạo"
      />

      <ExtraOptionUpdateModal
        isOpen={isFormOpen && !!selectedOption}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedOption(null);
        }}
        title="Sửa tùy chọn phát sinh"
        submitText="Xác nhận lưu"
        initialData={
          selectedOption
            ? {
                id: selectedOption.id,
                name: selectedOption.name,
                code: selectedOption.code,
                costPrice: selectedOption.costPrice,
                retailPrice: selectedOption.retailPrice,
                salePrice: selectedOption.salePrice,
                unit: selectedOption.unit,
              }
            : undefined
        }
      />

      <ExtraOptionDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setOptionToDelete(null);
        }}
        optionName={optionToDelete?.name}
        onConfirm={() => {
          if (optionToDelete) deleteOptionMutation(optionToDelete.id);
        }}
        isPending={isDeleting}
      />
    </div>
  );
};

export default Page;
