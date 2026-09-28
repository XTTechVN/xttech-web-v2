'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getBrands, getAccessories, deleteAccessory } from '@/actions';
import type { Accessory, Brand } from '@/types';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import {
  AccessoryBrandSidebar,
  AccessoryToolbar,
  AccessoryTable,
  AccessoryModal,
  AccessorySkeleton,
  AccessoryEmptyState,
  AccessoryCategoryManagerModal,
} from './_components';

export default function AccessoriesTab() {
  const [search, setSearch] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);

  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  // Queries danh sách thương hiệu phụ kiện
  const { data: accessoryBrandsData, isLoading: isBrandsLoading } = useQuery({
    queryKey: ['brands', 'accessory'],
    queryFn: async () => {
      const res = await getBrands({
        limit: 9999,
        offset: 0,
        allowDeleted: false,
        brandType: 'accessory',
      });
      // Nếu có hãng phụ kiện thì trả về, nếu không fallback lấy tất cả hãng
      if (res.items && res.items.length > 0) {
        return res.items;
      }
      const allRes = await getBrands({ limit: 9999, offset: 0, allowDeleted: false });
      return allRes.items || [];
    },
  });

  const brandsList = accessoryBrandsData || [];

  const sortedBrands = useMemo(() => {
    return [...brandsList].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [brandsList]);

  // Luôn tự động chọn hãng đầu tiên nếu chưa chọn
  useEffect(() => {
    if (selectedBrandId === null && sortedBrands.length > 0) {
      setSelectedBrandId(sortedBrands[0].id);
    }
  }, [sortedBrands, selectedBrandId]);

  // Queries danh sách phụ kiện theo Hãng đang chọn
  const { data: accessoriesData, isLoading: isAccessoriesLoading } = useQuery({
    queryKey: ['accessories', selectedBrandId, search],
    queryFn: async () => {
      if (!selectedBrandId) return [];
      const res = await getAccessories({
        brandId: selectedBrandId,
        limit: 1000,
        offset: 0,
        allowDeleted: false,
        search: search.trim() || undefined,
      });
      return res.items;
    },
    enabled: selectedBrandId !== null,
  });

  const accessories = accessoriesData || [];

  // Mutations xóa phụ kiện
  const { mutate: deleteAccessoryMutate } = useMutation({
    mutationFn: (id: number) => deleteAccessory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      toast.success('Xóa phụ kiện thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa phụ kiện'),
  });

  const selectedBrand = useMemo(() => {
    return selectedBrandId ? brandsList.find((b) => b.id === selectedBrandId) : null;
  }, [brandsList, selectedBrandId]);

  const handleOpenCreateModal = () => {
    setSelectedAccessory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (acc: Accessory) => {
    setSelectedAccessory(acc);
    setIsModalOpen(true);
  };

  const handleDeleteAccessory = (acc: Accessory) => {
    if (confirm(`Xác nhận xóa phụ kiện "${acc.name}" (${acc.code || ''})?`)) {
      deleteAccessoryMutate(acc.id);
    }
  };

  const isLoading = isBrandsLoading || isAccessoriesLoading;

  return (
    <div className="flex flex-col md:flex-row items-start min-h-[calc(100vh-105px)]">
      {/* Cột lọc danh sách Hãng phụ kiện bên trái */}
      <AccessoryBrandSidebar
        brands={brandsList}
        selectedBrandId={selectedBrandId}
        onSelectBrand={setSelectedBrandId}
      />

      {/* Khu vực nội dung danh sách Phụ kiện bên phải */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 w-full p-4">
        {/* Toolbar: Tìm kiếm & Thêm mới */}
        <AccessoryToolbar
          search={search}
          onSearchChange={setSearch}
          onAddClick={handleOpenCreateModal}
          onManageCategoriesClick={() => setIsCategoryManagerOpen(true)}
        />

        {/* Danh sách phụ kiện dạng bảng */}
        {isLoading ? (
          <AccessorySkeleton count={6} />
        ) : accessories.length === 0 ? (
          <AccessoryEmptyState selectedBrandName={selectedBrand?.name} />
        ) : (
          <AccessoryTable
            accessories={accessories}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteAccessory}
          />
        )}
      </div>

      {/* Modal Thêm mới / Sửa phụ kiện */}
      <AccessoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAccessory(null);
        }}
        accessory={selectedAccessory}
        brands={brandsList}
        defaultBrandId={selectedBrandId}
      />

      {/* Modal Toàn màn hình Quản lý Danh mục phụ kiện */}
      <AccessoryCategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
      />
    </div>
  );
}
