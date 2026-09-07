'use client';

import React, { useState } from 'react';
import { Heading, StatsCard } from '@/components';
import Table from './_components/table';
import { PackageOpen, Activity, AlertTriangle, BadgeDollarSign } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getMaterials, deleteMaterial } from '@/actions';
import type { Material } from '@/types';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { MaterialCreateModal, MaterialUpdateModal, MaterialDeleteModal } from './_components/modals';

const Page = () => {
  const { data: materialData } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const res = await getMaterials({ limit: 9999 });
      return res.items;
    },
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);

  const { mutate: deleteMaterialMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Xóa hệ nhôm thành công');
      setIsDeleteOpen(false);
      setMaterialToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const totalMaterials = materialData?.length || 0;

  const stats = [
    {
      title: 'Tổng loại hệ nhôm',
      value: totalMaterials,
      icon: <PackageOpen />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Đang hoạt động',
      value: totalMaterials,
      icon: <Activity />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Đơn giá trung bình',
      value: 0,
      icon: <BadgeDollarSign />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Cần cập nhật giá',
      value: 0,
      icon: <AlertTriangle />,
      trend: 0,
      trendDirection: 'up' as const,
    },
  ];

  const handleOpenCreateModal = () => {
    setSelectedMaterial(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (material: Material) => {
    setSelectedMaterial(material);
    setIsFormOpen(true);
  };

  const handleOpenDeleteModal = (material: Material) => {
    setMaterialToDelete(material);
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
      <MaterialCreateModal
        isOpen={isFormOpen && !selectedMaterial}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedMaterial(null);
        }}
        title="Thêm hệ nhôm mới"
        submitText="Xác nhận tạo"
      />

      <MaterialUpdateModal
        isOpen={isFormOpen && !!selectedMaterial}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedMaterial(null);
        }}
        title="Sửa thông tin hệ nhôm"
        submitText="Xác nhận lưu"
        initialData={
          selectedMaterial
            ? {
                id: selectedMaterial.id,
                name: selectedMaterial.name,
                code: selectedMaterial.code,
                specification: selectedMaterial.specification,
                description: selectedMaterial.description,
                costPrice: selectedMaterial.costPrice,
                retailPrice: selectedMaterial.retailPrice,
                salePrice: selectedMaterial.salePrice,
                unit: selectedMaterial.unit,
              }
            : undefined
        }
      />

      <MaterialDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setMaterialToDelete(null);
        }}
        materialName={materialToDelete?.name}
        onConfirm={() => {
          if (materialToDelete) deleteMaterialMutation(materialToDelete.id);
        }}
        isPending={isDeleting}
      />
    </div>
  );
};

export default Page;
