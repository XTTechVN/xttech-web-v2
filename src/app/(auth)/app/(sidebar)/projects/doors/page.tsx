'use client';

import React, { useState } from 'react';
import { Heading, StatsCard } from '@/components';
import Table from './_components/table';
import { Columns, Eye, EyeOff, LayoutGrid } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getDoors, deleteDoor } from '@/actions';
import type { Door } from '@/types';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { DoorCreateModal, DoorUpdateModal, DoorDeleteModal } from './_components/modals';

const Page = () => {
  const { data: doorData } = useQuery({
    queryKey: ['doors'],
    queryFn: async () => {
      const res = await getDoors({ limit: 9999 });
      return res.items;
    },
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [doorToDelete, setDoorToDelete] = useState<Door | null>(null);

  const { mutate: deleteDoorMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteDoor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doors'] });
      toast.success('Xóa loại cửa thành công');
      setIsDeleteOpen(false);
      setDoorToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const totalDoors = doorData?.length || 0;

  const stats = [
    {
      title: 'Tổng số loại cửa',
      value: totalDoors,
      icon: <Columns />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Thiết kế mẫu',
      value: totalDoors,
      icon: <LayoutGrid />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Đang hiển thị',
      value: totalDoors,
      icon: <Eye />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Đã ẩn',
      value: 0,
      icon: <EyeOff />,
      trend: 0,
      trendDirection: 'up' as const,
    },
  ];

  const handleOpenCreateModal = () => {
    setSelectedDoor(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (door: Door) => {
    setSelectedDoor(door);
    setIsFormOpen(true);
  };

  const handleOpenDeleteModal = (door: Door) => {
    setDoorToDelete(door);
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
      <DoorCreateModal
        isOpen={isFormOpen && !selectedDoor}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedDoor(null);
        }}
        title="Thêm thiết kế cửa mới"
        submitText="Xác nhận tạo"
      />

      <DoorUpdateModal
        isOpen={isFormOpen && !!selectedDoor}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedDoor(null);
        }}
        title="Sửa thiết kế cửa"
        submitText="Xác nhận lưu"
        initialData={
          selectedDoor
            ? {
                id: selectedDoor.id,
                name: selectedDoor.name,
                type: selectedDoor.type,
                code: selectedDoor.code,
                imagePath: selectedDoor.imagePath,
                specification: selectedDoor.specification,
              }
            : undefined
        }
      />

      <DoorDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDoorToDelete(null);
        }}
        doorName={doorToDelete?.name}
        onConfirm={() => {
          if (doorToDelete) deleteDoorMutation(doorToDelete.id);
        }}
        isPending={isDeleting}
      />
    </div>
  );
};

export default Page;
