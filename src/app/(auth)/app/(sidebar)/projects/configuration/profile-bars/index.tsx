'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getBrands,
  getProfileBars,
  deleteProfileBar,
  getDoorSeriesList,
  exportProfileBarsExcel,
} from '@/actions';
import type { ProfileBar } from '@/types';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import { BrandSidebar } from '../../_components';
import {
  ProfileBarToolbar,
  ProfileBarTable,
  ProfileBarModal,
  ProfileBarSkeleton,
  ProfileBarEmptyState,
  ProfileBarExcelModal,
} from './_components';

export default function ProfileBarsTab() {
  const [search, setSearch] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBar, setSelectedBar] = useState<ProfileBar | null>(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Queries danh sách thương hiệu (chỉ lấy hãng nhôm)
  const { data: brandsData, isLoading: isBrandsLoading } = useQuery({
    queryKey: ['brands', 'aluminum'],
    queryFn: async () => (await getBrands({ offset: 0, limit: 9999, brandType: 'aluminum' })).items,
  });

  const brandsList = useMemo(() => brandsData ?? [], [brandsData]);

  const sortedBrands = useMemo(() => {
    return [...brandsList].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [brandsList]);

  // Tự động lấy hãng đầu tiên nếu chưa chọn (Derived State - tránh setState trong useEffect)
  const activeBrandId = selectedBrandId ?? sortedBrands[0]?.id ?? null;

  // Queries danh sách Hệ nhôm theo Hãng đang chọn
  const { data: seriesData } = useQuery({
    queryKey: ['door-series', activeBrandId],
    queryFn: async () => {
      const res = await getDoorSeriesList({
        offset: 0,
        limit: 9999,
        ...(activeBrandId ? { brandId: activeBrandId } : {}),
      });
      return res.items;
    },
    enabled: activeBrandId !== null,
  });

  const seriesList = seriesData || [];

  // Queries danh sách thanh profile theo Hãng + Hệ nhôm đang chọn
  const { data: profileBarsData, isLoading: isBarsLoading } = useQuery({
    queryKey: ['profile-bars', activeBrandId, selectedSeriesId, search],
    queryFn: async () => {
      if (!activeBrandId) return [];
      const res = await getProfileBars({
        brandId: activeBrandId,
        seriesId: selectedSeriesId || undefined,
        limit: 1000,
        offset: 0,
        allowDeleted: false,
        search: search.trim() || undefined,
      });
      return res.items;
    },
    enabled: activeBrandId !== null,
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
    return activeBrandId ? brandsList.find((b) => b.id === activeBrandId) : null;
  }, [brandsList, activeBrandId]);

  const handleSelectBrand = (brandId: number) => {
    setSelectedBrandId(brandId);
    setSelectedSeriesId(null); // reset filter hệ nhôm khi đổi hãng
  };

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

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await exportProfileBarsExcel({
        brandId: activeBrandId,
        seriesId: selectedSeriesId,
      });
      toast.success('Đã xuất file Excel danh sách thanh profile');
    } catch (err) {
      showErrorToast(err, 'Lỗi khi xuất file Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const isLoading = isBrandsLoading || isBarsLoading;

  return (
    <div className="flex flex-col md:flex-row items-start min-h-[calc(100vh-105px)]">
      {/* Cột lọc danh sách Hãng nhôm bên trái */}
      <BrandSidebar
        brands={brandsList}
        selectedBrandId={activeBrandId}
        onSelectBrand={handleSelectBrand}
      />

      {/* Khu vực nội dung danh sách Thanh profile bên phải */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 w-full p-4">
        {/* Toolbar: Tìm kiếm, Lọc hệ nhôm, Xuất/Nhập Excel & Thêm mới */}
        <ProfileBarToolbar
          search={search}
          onSearchChange={setSearch}
          onAddClick={handleOpenCreateModal}
          onExportExcelClick={handleExportExcel}
          onImportExcelClick={() => setIsExcelModalOpen(true)}
          isExporting={isExporting}
          seriesList={seriesList}
          selectedSeriesId={selectedSeriesId}
          onSeriesChange={setSelectedSeriesId}
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
        defaultBrandId={activeBrandId}
      />

      {/* Modal Nhập Excel & Chỉnh sửa trực tiếp */}
      <ProfileBarExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        brands={brandsList}
      />
    </div>
  );
}
