'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getBrands,
  getProfileBars,
  deleteProfileBar,
  bulkDeleteProfileBars,
  getDoorSeriesList,
  exportProfileBarsExcel,
} from '@/actions';
import { ConfirmActionModal } from '@/components';
import { useBulkDeleteSelection } from '@/hooks';
import { getDefaultBrandId, type ProfileBar } from '@/types';
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
  const [isCopyMode, setIsCopyMode] = useState(false);
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
  const activeBrandId = selectedBrandId ?? getDefaultBrandId(sortedBrands);

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

  const profileBars = useMemo(() => profileBarsData || [], [profileBarsData]);

  const bulkSelection = useBulkDeleteSelection(profileBars);

  // Mutations xóa thanh profile đơn lẻ
  const { mutate: deleteBarMutate } = useMutation({
    mutationFn: (id: number) => deleteProfileBar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-bars'] });
      toast.success('Xóa thanh profile thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa thanh profile'),
  });

  // Mutations xóa hàng loạt thanh profile
  const { mutate: bulkDeleteMutate, isPending: isBulkDeleting } = useMutation({
    mutationFn: (ids: number[]) => bulkDeleteProfileBars({ ids }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['profile-bars'] });
      toast.success(`Đã xóa hàng loạt ${res.deletedCount} thanh profile nhôm`);
      bulkSelection.exitBulkMode();
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa hàng loạt thanh profile'),
  });

  const selectedBrand = useMemo(() => {
    return activeBrandId ? brandsList.find((b) => b.id === activeBrandId) : null;
  }, [brandsList, activeBrandId]);

  const handleSelectBrand = (brandId: number) => {
    setSelectedBrandId(brandId);
    setSelectedSeriesId(null);
  };

  const handleOpenCreateModal = () => {
    setSelectedBar(null);
    setIsCopyMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (bar: ProfileBar) => {
    setSelectedBar(bar);
    setIsCopyMode(false);
    setIsModalOpen(true);
  };

  const handleOpenCopyModal = (bar: ProfileBar) => {
    setSelectedBar(bar);
    setIsCopyMode(true);
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
      <BrandSidebar
        brands={brandsList}
        selectedBrandId={activeBrandId}
        onSelectBrand={handleSelectBrand}
      />

      <div className="flex-1 flex flex-col gap-4 min-w-0 w-full p-4">
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
          isBulkMode={bulkSelection.isBulkMode}
          selectedCount={bulkSelection.selectedCount}
          totalCount={bulkSelection.totalCount}
          isAllSelected={bulkSelection.isAllSelected}
          isBulkDeleting={isBulkDeleting}
          onEnterBulkMode={bulkSelection.enterBulkMode}
          onExitBulkMode={bulkSelection.exitBulkMode}
          onToggleSelectAll={bulkSelection.toggleSelectAll}
          onConfirmBulkDelete={() => bulkSelection.setIsConfirmOpen(true)}
        />

        {isLoading ? (
          <ProfileBarSkeleton count={6} />
        ) : profileBars.length === 0 ? (
          <ProfileBarEmptyState selectedBrandName={selectedBrand?.name} />
        ) : (
          <ProfileBarTable
            profileBars={profileBars}
            onEdit={handleOpenEditModal}
            onCopy={handleOpenCopyModal}
            onDelete={handleDeleteBar}
            isBulkMode={bulkSelection.isBulkMode}
            selectedIdSet={bulkSelection.selectedIdSet}
            isAllSelected={bulkSelection.isAllSelected}
            isPartiallySelected={bulkSelection.isPartiallySelected}
            onToggleSelect={bulkSelection.toggleSelect}
            onToggleSelectAll={bulkSelection.toggleSelectAll}
          />
        )}
      </div>

      <ProfileBarModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBar(null);
        }}
        profileBar={selectedBar}
        isCopy={isCopyMode}
        brands={brandsList}
        defaultBrandId={activeBrandId}
      />

      <ProfileBarExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        brands={brandsList}
      />

      <ConfirmActionModal
        isOpen={bulkSelection.isConfirmOpen}
        onClose={() => bulkSelection.setIsConfirmOpen(false)}
        onConfirm={() => bulkDeleteMutate(bulkSelection.selectedIds)}
        title="Xác nhận xóa hàng loạt thanh profile nhôm"
        description={
          <>
            Bạn có chắc chắn muốn xóa <strong>{bulkSelection.selectedCount}</strong> thanh profile nhôm đã chọn thuộc hãng{' '}
            <strong>{selectedBrand?.name || ''}</strong> không?
          </>
        }
        warningNote="Các thanh profile đã chọn sẽ bị đưa vào trạng thái xóa và ẩn khỏi danh sách cấu hình."
        confirmText={`Xóa ${bulkSelection.selectedCount} thanh profile`}
        variant="danger"
        loading={isBulkDeleting}
      />
    </div>
  );
}
