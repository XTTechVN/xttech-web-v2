'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getBrands,
  getAccessories,
  deleteAccessory,
  bulkDeleteAccessories,
  getAccessoryCategories,
  exportAccessoriesExcel,
} from '@/actions';
import { useBulkDeleteSelection } from '@/hooks';
import { getDefaultBrandId, type Accessory } from '@/types';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import { BrandSidebar } from '../../_components';
import {
  AccessoryToolbar,
  AccessoryTable,
  AccessoryModal,
  AccessorySkeleton,
  AccessoryEmptyState,
  AccessoryCategoryManagerModal,
  AccessoryExcelModal,
  AccessoryDeleteConfirmModal,
} from './_components';

export default function AccessoriesTab() {
  const [search, setSearch] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);
  const [deletingAccessory, setDeletingAccessory] = useState<Accessory | null>(null);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
      if (res.items && res.items.length > 0) {
        return res.items;
      }
      const allRes = await getBrands({ limit: 9999, offset: 0, allowDeleted: false });
      return allRes.items || [];
    },
  });

  const brandsList = useMemo(() => accessoryBrandsData ?? [], [accessoryBrandsData]);

  const sortedBrands = useMemo(() => {
    return [...brandsList].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [brandsList]);

  // Tự động lấy hãng đầu tiên nếu chưa chọn (Derived State - tránh setState trong useEffect)
  const activeBrandId = selectedBrandId ?? getDefaultBrandId(sortedBrands);

  // Queries danh sách phân loại phụ kiện
  const { data: categoriesData } = useQuery({
    queryKey: ['accessory-categories'],
    queryFn: async () => (await getAccessoryCategories({ offset: 0, limit: 9999 })).items,
  });

  const categoryList = categoriesData || [];

  // Queries danh sách phụ kiện theo Hãng + Phân loại đang chọn
  const { data: accessoriesData, isLoading: isAccessoriesLoading } = useQuery({
    queryKey: ['accessories', activeBrandId, selectedCategoryId, search],
    queryFn: async () => {
      if (!activeBrandId) return [];
      const res = await getAccessories({
        brandId: activeBrandId,
        categoryId: selectedCategoryId || undefined,
        limit: 1000,
        offset: 0,
        allowDeleted: false,
        search: search.trim() || undefined,
      });
      return res.items;
    },
    enabled: activeBrandId !== null,
  });

  const accessories = useMemo(() => accessoriesData || [], [accessoriesData]);

  const bulkSelection = useBulkDeleteSelection(accessories);

  const invalidateAccessoryAndComboQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['accessories'] });
    queryClient.invalidateQueries({ queryKey: ['accessories-list'] });
    queryClient.invalidateQueries({ queryKey: ['accessory-combos'] });
    queryClient.invalidateQueries({ queryKey: ['accessory-combos-list'] });
    queryClient.invalidateQueries({ queryKey: ['all-accessories-dropdown'] });
  };

  // Mutations xóa phụ kiện đơn lẻ
  const { mutate: deleteAccessoryMutate, isPending: isDeletingSingle } = useMutation({
    mutationFn: (id: number) => deleteAccessory(id),
    onSuccess: () => {
      invalidateAccessoryAndComboQueries();
      setDeletingAccessory(null);
      toast.success('Đã xóa phụ kiện và các gói combo liên quan');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa phụ kiện'),
  });

  // Mutations xóa hàng loạt phụ kiện
  const { mutate: bulkDeleteMutate, isPending: isBulkDeleting } = useMutation({
    mutationFn: (ids: number[]) => bulkDeleteAccessories({ ids }),
    onSuccess: (res) => {
      invalidateAccessoryAndComboQueries();
      toast.success(`Đã xóa hàng loạt ${res.deletedCount} phụ kiện và các gói combo liên quan`);
      bulkSelection.exitBulkMode();
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa hàng loạt phụ kiện'),
  });

  const selectedBrand = useMemo(() => {
    return activeBrandId ? brandsList.find((b) => b.id === activeBrandId) : null;
  }, [brandsList, activeBrandId]);

  const handleOpenCreateModal = () => {
    setSelectedAccessory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (acc: Accessory) => {
    setSelectedAccessory(acc);
    setIsModalOpen(true);
  };

  const handleDeleteAccessory = (acc: Accessory) => {
    setDeletingAccessory(acc);
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await exportAccessoriesExcel({
        brandId: activeBrandId,
        categoryId: selectedCategoryId,
      });
      toast.success('Đã xuất file Excel danh sách phụ kiện');
    } catch (err) {
      showErrorToast(err, 'Lỗi khi xuất file Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExcelImportSuccess = (
    importedBrandIds: number[],
    importedCategoryIds: Array<number | null>,
  ) => {
    if (
      importedBrandIds.length > 0 &&
      (!activeBrandId || !importedBrandIds.includes(activeBrandId))
    ) {
      setSelectedBrandId(importedBrandIds[0]);
    }
    if (
      selectedCategoryId !== null &&
      importedCategoryIds.some((cid) => cid !== selectedCategoryId)
    ) {
      setSelectedCategoryId(null);
    }
    if (search.trim()) {
      setSearch('');
    }
  };

  const isLoading = isBrandsLoading || isAccessoriesLoading;

  return (
    <div className="flex flex-col md:flex-row items-start min-h-[calc(100vh-105px)]">
      <BrandSidebar
        brands={brandsList}
        selectedBrandId={activeBrandId}
        onSelectBrand={setSelectedBrandId}
      />

      <div className="flex-1 flex flex-col gap-4 min-w-0 w-full p-4">
        <AccessoryToolbar
          search={search}
          onSearchChange={setSearch}
          onAddClick={handleOpenCreateModal}
          onManageCategoriesClick={() => setIsCategoryManagerOpen(true)}
          onExportExcelClick={handleExportExcel}
          onImportExcelClick={() => setIsExcelModalOpen(true)}
          isExporting={isExporting}
          categoryList={categoryList}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={setSelectedCategoryId}
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
          <AccessorySkeleton count={6} />
        ) : accessories.length === 0 ? (
          <AccessoryEmptyState selectedBrandName={selectedBrand?.name} />
        ) : (
          <AccessoryTable
            accessories={accessories}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteAccessory}
            isBulkMode={bulkSelection.isBulkMode}
            selectedIdSet={bulkSelection.selectedIdSet}
            isAllSelected={bulkSelection.isAllSelected}
            isPartiallySelected={bulkSelection.isPartiallySelected}
            onToggleSelect={bulkSelection.toggleSelect}
            onToggleSelectAll={bulkSelection.toggleSelectAll}
          />
        )}
      </div>

      <AccessoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAccessory(null);
        }}
        accessory={selectedAccessory}
        brands={brandsList}
        defaultBrandId={activeBrandId}
      />

      <AccessoryCategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
      />

      <AccessoryExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        brands={brandsList}
        categories={categoryList}
        defaultBrandId={activeBrandId}
        onImportSuccess={handleExcelImportSuccess}
      />

      <AccessoryDeleteConfirmModal
        isOpen={Boolean(deletingAccessory)}
        onClose={() => setDeletingAccessory(null)}
        onConfirm={() => {
          if (deletingAccessory) deleteAccessoryMutate(deletingAccessory.id);
        }}
        mode="single"
        accessory={deletingAccessory}
        loading={isDeletingSingle}
      />

      <AccessoryDeleteConfirmModal
        isOpen={bulkSelection.isConfirmOpen}
        onClose={() => bulkSelection.setIsConfirmOpen(false)}
        onConfirm={() => bulkDeleteMutate(bulkSelection.selectedIds)}
        mode="bulk"
        bulkIds={bulkSelection.selectedIds}
        selectedBrandName={selectedBrand?.name}
        loading={isBulkDeleting}
      />
    </div>
  );
}
