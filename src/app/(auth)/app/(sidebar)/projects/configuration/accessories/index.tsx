'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getBrands,
  getAccessories,
  deleteAccessory,
  getAccessoryCategories,
  exportAccessoriesExcel,
} from '@/actions';
import type { Accessory } from '@/types';
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
} from './_components';

export default function AccessoriesTab() {
  const [search, setSearch] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);
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
  const activeBrandId = selectedBrandId ?? sortedBrands[0]?.id ?? null;

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
    if (confirm(`Xác nhận xóa phụ kiện "${acc.name}" (${acc.code || ''})?`)) {
      deleteAccessoryMutate(acc.id);
    }
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

  const isLoading = isBrandsLoading || isAccessoriesLoading;

  return (
    <div className="flex flex-col md:flex-row items-start min-h-[calc(100vh-105px)]">
      {/* Cột lọc danh sách Hãng phụ kiện bên trái */}
      <BrandSidebar
        brands={brandsList}
        selectedBrandId={activeBrandId}
        onSelectBrand={setSelectedBrandId}
      />

      {/* Khu vực nội dung danh sách Phụ kiện bên phải */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 w-full p-4">
        {/* Toolbar: Tìm kiếm, Lọc phân loại, Xuất/Nhập Excel & Thêm mới */}
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
        defaultBrandId={activeBrandId}
      />

      {/* Modal Toàn màn hình Quản lý Danh mục phụ kiện */}
      <AccessoryCategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
      />

      {/* Modal Nhập Excel & Chỉnh sửa trực tiếp */}
      <AccessoryExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        brands={brandsList}
        categories={categoryList}
      />
    </div>
  );
}
