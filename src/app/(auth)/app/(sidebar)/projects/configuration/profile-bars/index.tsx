'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getBrands, getProfileBars, deleteProfileBar } from '@/actions';
import type { ProfileBar } from '@/types';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import {
  ProfileBarSidebar,
  ProfileBarToolbar,
  ProfileBarTable,
  ProfileBarModal,
  ProfileBarSkeleton,
  ProfileBarEmptyState,
} from './_components';

export default function ProfileBarsTab() {
  const [search, setSearch] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBar, setSelectedBar] = useState<ProfileBar | null>(null);

  // Queries danh sách thương hiệu (chỉ lấy hãng nhôm)
  const { data: brandsData, isLoading: isBrandsLoading } = useQuery({
    queryKey: ['brands', 'aluminum'],
    queryFn: async () => (await getBrands({ offset: 0, limit: 9999, brandType: 'aluminum' })).items,
  });

  const brandsList = brandsData || [];

  const sortedBrands = useMemo(() => {
    return [...brandsList].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [brandsList]);

  // Luôn tự động chọn hãng đầu tiên nếu chưa chọn
  useEffect(() => {
    if (selectedBrandId === null && sortedBrands.length > 0) {
      setSelectedBrandId(sortedBrands[0].id);
    }
  }, [sortedBrands, selectedBrandId]);

  // Queries danh sách thanh profile theo Hãng đang chọn
  const { data: profileBarsData, isLoading: isBarsLoading } = useQuery({
    queryKey: ['profile-bars', selectedBrandId, search],
    queryFn: async () => {
      if (!selectedBrandId) return [];
      const res = await getProfileBars({
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

  const profileBars = profileBarsData || [];

  // Mutations xóa thanh profile
  const { mutate: deleteBarMutate } = useMutation({
    mutationFn: (id: number) => deleteProfileBar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-bars'] });
      toast.success('Xóa thanh profile thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa thanh profile'),
  });

  const selectedBrand = useMemo(() => {
    return selectedBrandId ? brandsList.find((b) => b.id === selectedBrandId) : null;
  }, [brandsList, selectedBrandId]);

  const handleOpenCreateModal = () => {
    setSelectedBar(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (bar: ProfileBar) => {
    setSelectedBar(bar);
    setIsModalOpen(true);
  };

  const handleDeleteBar = (bar: ProfileBar) => {
    if (confirm(`Xác nhận xóa thanh profile "${bar.name}" (${bar.code})?`)) {
      deleteBarMutate(bar.id);
    }
  };

  const isLoading = isBrandsLoading || isBarsLoading;

  return (
    <div className="flex flex-col md:flex-row items-start min-h-[calc(100vh-105px)]">
      {/* Cột lọc danh sách Hãng nhôm bên trái */}
      <ProfileBarSidebar
        brands={brandsList}
        selectedBrandId={selectedBrandId}
        onSelectBrand={setSelectedBrandId}
      />

      {/* Khu vực nội dung danh sách Thanh profile bên phải */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 w-full p-4">
        {/* Toolbar: Tìm kiếm & Thêm mới */}
        <ProfileBarToolbar
          search={search}
          onSearchChange={setSearch}
          onAddClick={handleOpenCreateModal}
        />

        {/* Danh sách thanh profile dạng bảng */}
        {isLoading ? (
          <ProfileBarSkeleton count={6} />
        ) : profileBars.length === 0 ? (
          <ProfileBarEmptyState selectedBrandName={selectedBrand?.name} />
        ) : (
          <ProfileBarTable
            profileBars={profileBars}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteBar}
          />
        )}
      </div>

      {/* Modal Thêm mới / Sửa thanh profile */}
      <ProfileBarModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBar(null);
        }}
        profileBar={selectedBar}
        brands={brandsList}
        defaultBrandId={selectedBrandId}
      />
    </div>
  );
}
