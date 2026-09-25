'use client';

import React, { useState } from 'react';
import { StatsCard, Button } from '@/components';
import { TableData } from '@/components/table';
import { ComboTable } from './_components/combo-table';
import { ComboModal } from './_components/combo-modal';
import {
  Package,
  Layers,
  Settings,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  FolderKanban,
  Filter,
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getAccessories,
  deleteAccessory,
  getAccessoryCombos,
  getAccessoryCategories,
  deleteAccessoryCategory,
  updateAccessoryCategory,
  getBrands,
} from '@/actions';
import type { Accessory, AccessoryCombo, AccessoryCategory, AccessoryCategoryUpdate, AccessoryQueryParams } from '@/types';
import { getAccessoryUnitConfig, ACCESSORY_COLOR_MAP } from '@/types';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import {
  AccessoryCreateModal,
  AccessoryUpdateModal,
  AccessoryDeleteModal,
} from './_components/modals';
import { AccessoryCategoryFormModal } from './_components/category-form-modal';
import { showErrorToast, formatCurrency, getFileUrl } from '@/utils';

type SubTab = 'accessories' | 'combos' | 'categories';

const Page = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('accessories');
  const [filterBrandId, setFilterBrandId] = useState<string>('all');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Queries
  const { data: accessoryData } = useQuery({
    queryKey: ['accessories'],
    queryFn: async () => (await getAccessories({ limit: 9999 })).items,
  });

  const { data: comboData } = useQuery({
    queryKey: ['accessory-combos'],
    queryFn: async () => (await getAccessoryCombos({ limit: 9999 })).items,
  });

  const { data: categoryData } = useQuery({
    queryKey: ['accessory-categories'],
    queryFn: async () => (await getAccessoryCategories({ limit: 9999 })).items,
  });

  const { data: brandData } = useQuery({
    queryKey: ['brands-list-accessories'],
    queryFn: async () => (await getBrands({ limit: 9999 })).items,
  });

  // Modal states for Accessories
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [accessoryToDelete, setAccessoryToDelete] = useState<Accessory | null>(null);

  // Modal states for Combos
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<AccessoryCombo | null>(null);

  // Modal states for Categories
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AccessoryCategory | null>(null);

  // Mutations
  const { mutate: deleteAccessoryMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteAccessory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      toast.success('Xóa phụ kiện thành công');
      setIsDeleteOpen(false);
      setAccessoryToDelete(null);
    },
    onError: (error) => showErrorToast(error, 'Xóa phụ kiện thất bại'),
  });

  const { mutate: deleteCategoryMutation } = useMutation({
    mutationFn: (id: number) => deleteAccessoryCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessory-categories'] });
      toast.success('Xóa nhóm phụ kiện thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa nhóm phụ kiện'),
  });

  const { mutate: updateCategoryMutation } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AccessoryCategoryUpdate }) =>
      updateAccessoryCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessory-categories'] });
      toast.success('Đã cập nhật thứ tự hiển thị');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi cập nhật thứ tự'),
  });

  const totalAccessories = accessoryData?.length || 0;
  const totalCombos = comboData?.length || 0;
  const totalCategories = categoryData?.length || 0;

  const stats = [
    {
      title: 'Mã phụ kiện đơn lẻ',
      value: totalAccessories,
      icon: <Package className="text-primary" />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Gói combo phụ kiện',
      value: totalCombos,
      icon: <Layers className="text-indigo-600" />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Nhóm chủng loại',
      value: totalCategories,
      icon: <Settings className="text-amber-600" />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Đang lưu hành',
      value: totalAccessories + totalCombos,
      icon: <CheckCircle2 className="text-emerald-600" />,
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

  // Hoán đổi thứ tự hiển thị sort_order trực quan
  const handleSwapSortOrder = (currentCat: AccessoryCategory, direction: 'up' | 'down') => {
    const list = [...(categoryData || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const currentIndex = list.findIndex((c) => c.id === currentCat.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const targetCat = list[targetIndex];
    const currentOrder = currentCat.sortOrder ?? currentIndex + 1;
    const targetOrder = targetCat.sortOrder ?? targetIndex + 1;

    const newTargetOrder = currentOrder === targetOrder ? targetOrder + (direction === 'up' ? 1 : -1) : targetOrder;

    updateCategoryMutation({
      id: currentCat.id,
      data: { sortOrder: newTargetOrder },
    });
  };

  // Columns for Accessories
  const accessoryColumns = [
    {
      key: 'image',
      label: 'Ảnh',
      minWidth: '70px',
      cell: (row: Accessory) => (
        <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
          {row.imagePath ? (
            <img
              src={getFileUrl(row.imagePath)}
              alt={row.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-5 h-5 text-gray-400" />
          )}
        </div>
      ),
    },
    {
      key: 'code',
      label: 'Mã hiệu',
      minWidth: '120px',
      cell: (row: Accessory) => (
        <span className="font-semibold text-gray-900">{row.code || '—'}</span>
      ),
    },
    {
      key: 'name',
      label: 'Tên phụ kiện & Phân loại',
      minWidth: '250px',
      cell: (row: Accessory) => (
        <div>
          <p className="font-semibold text-gray-900 leading-snug">{row.name}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {row.brand && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Hãng: {row.brand.name}
              </span>
            )}
            {row.category && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {row.category.name}
              </span>
            )}
            {row.color && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                Màu: {ACCESSORY_COLOR_MAP[row.color.toLowerCase()] || row.color}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'unit',
      label: 'ĐVT',
      minWidth: '85px',
      cell: (row: Accessory) => {
        const config = getAccessoryUnitConfig(row.unit);
        return (
          <span
            className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold border ${config.className}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'unitPrice',
      label: 'Đơn giá chuẩn',
      minWidth: '120px',
      cell: (row: Accessory) => (
        <span className="font-bold text-gray-900">{formatCurrency(row.unitPrice ?? 0)}</span>
      ),
    },
    {
      key: 'salePrice',
      label: 'Giá đại lý',
      minWidth: '120px',
      cell: (row: Accessory) => (
        <span className="font-semibold text-emerald-700">{formatCurrency(row.salePrice ?? 0)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '100px',
      cell: (row: Accessory) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}
        >
          {row.isActive !== false ? 'Đang bán' : 'Tạm ngưng'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      minWidth: '110px',
      cell: (row: Accessory) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            title="Sửa thông tin"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => handleOpenDeleteModal(row)}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            title="Xóa"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  // Columns for Categories
  const categoryColumns = [
    {
      key: 'sortOrder',
      label: 'Thứ tự',
      minWidth: '110px',
      cell: (row: AccessoryCategory, index: number) => (
        <div className="flex items-center gap-1.5">
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold border border-slate-200">
            #{row.sortOrder ?? index + 1}
          </span>
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => handleSwapSortOrder(row, 'up')}
              className="p-0.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              title="Chuyển lên trên"
            >
              <ArrowUp size={12} />
            </button>
            <button
              type="button"
              disabled={index === (categoryData?.length || 0) - 1}
              onClick={() => handleSwapSortOrder(row, 'down')}
              className="p-0.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              title="Chuyển xuống dưới"
            >
              <ArrowDown size={12} />
            </button>
          </div>
        </div>
      ),
    },
    {
      key: 'code',
      label: 'Mã nhóm',
      minWidth: '130px',
      cell: (row: AccessoryCategory) => (
        <span className="font-semibold text-gray-900">{row.code}</span>
      ),
    },
    {
      key: 'name',
      label: 'Tên nhóm chủng loại',
      minWidth: '220px',
      cell: (row: AccessoryCategory) => (
        <p className="font-semibold text-gray-900">{row.name}</p>
      ),
    },
    {
      key: 'description',
      label: 'Mô tả / Ứng dụng',
      minWidth: '240px',
      cell: (row: AccessoryCategory) => (
        <span className="text-xs text-gray-600">{row.description || '—'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      minWidth: '110px',
      cell: (row: AccessoryCategory) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedCategory(row);
              setIsCategoryModalOpen(true);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            title="Sửa thông tin"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Xác nhận xóa nhóm phụ kiện "${row.name}"?`)) {
                deleteCategoryMutation(row.id);
              }
            }}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            title="Xóa"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Stats Cards Header */}
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

      {/* SubTab Navigation & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveSubTab('accessories')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
              activeSubTab === 'accessories'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package size={16} />
            Phụ kiện đơn lẻ ({totalAccessories})
          </button>

          <button
            onClick={() => setActiveSubTab('combos')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
              activeSubTab === 'combos'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers size={16} />
            Bộ Combo phụ kiện ({totalCombos})
          </button>

          <button
            onClick={() => setActiveSubTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
              activeSubTab === 'categories'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings size={16} />
            Nhóm chủng loại ({totalCategories})
          </button>
        </div>

        {/* Nút hành động chính theo từng Subtab */}
        <div>
          {activeSubTab === 'accessories' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={15} />}
              onClick={handleOpenCreateModal}
            >
              Thêm phụ kiện mới
            </Button>
          )}

          {activeSubTab === 'combos' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={15} />}
              onClick={() => {
                setSelectedCombo(null);
                setIsComboModalOpen(true);
              }}
            >
              Tạo gói combo mới
            </Button>
          )}

          {activeSubTab === 'categories' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={15} />}
              onClick={() => {
                setSelectedCategory(null);
                setIsCategoryModalOpen(true);
              }}
            >
              Thêm nhóm phụ kiện
            </Button>
          )}
        </div>
      </div>

      {/* Subtab Table Content */}
      {activeSubTab === 'accessories' && (
        <div className="flex flex-col gap-3">
          {/* Toolbar lọc nhanh */}
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-xs flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <Filter size={14} />
              Bộ lọc:
            </div>

            {/* Lọc theo Thương hiệu */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-600 font-medium">Hãng:</label>
              <select
                value={filterBrandId}
                onChange={(e) => setFilterBrandId(e.target.value)}
                className="h-8 px-2.5 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:border-primary focus:bg-white cursor-pointer font-medium"
              >
                <option value="all">Tất cả thương hiệu ({brandData?.length || 0})</option>
                {brandData?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Lọc theo Nhóm phụ kiện */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-600 font-medium">Nhóm:</label>
              <select
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
                className="h-8 px-2.5 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:border-primary focus:bg-white cursor-pointer font-medium"
              >
                <option value="all">Tất cả nhóm loại ({categoryData?.length || 0})</option>
                {categoryData?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Lọc theo Trạng thái */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-600 font-medium">Trạng thái:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-8 px-2.5 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:border-primary focus:bg-white cursor-pointer font-medium"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang kinh doanh</option>
                <option value="inactive">Tạm ngưng</option>
              </select>
            </div>

            {(filterBrandId !== 'all' || filterCategoryId !== 'all' || filterStatus !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setFilterBrandId('all');
                  setFilterCategoryId('all');
                  setFilterStatus('all');
                }}
                className="text-xs text-rose-600 hover:underline font-semibold ml-auto cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          <TableData
            fetcher={async ({ offset, limit }) => {
              const params: AccessoryQueryParams = { offset, limit };
              if (filterBrandId !== 'all') params.brandId = Number(filterBrandId);
              if (filterCategoryId !== 'all') params.categoryId = Number(filterCategoryId);
              if (filterStatus !== 'all') params.isActive = filterStatus === 'active';
              return await getAccessories(params);
            }}
            columns={accessoryColumns}
            queryKey={['accessories', filterBrandId, filterCategoryId, filterStatus]}
          />
        </div>
      )}

      {activeSubTab === 'combos' && (
        <ComboTable
          onEdit={(combo) => {
            setSelectedCombo(combo);
            setIsComboModalOpen(true);
          }}
        />
      )}

      {activeSubTab === 'categories' && (
        <TableData
          fetcher={async ({ offset, limit }) => {
            return await getAccessoryCategories({ offset, limit });
          }}
          columns={categoryColumns}
          queryKey={['accessory-categories']}
        />
      )}

      {/* Modal Zone for Accessories */}
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
                categoryId: selectedAccessory.categoryId,
                brandId: selectedAccessory.brandId,
                specification: selectedAccessory.specification,
                unit: selectedAccessory.unit,
                unitPrice: selectedAccessory.unitPrice,
                color: selectedAccessory.color,
                costPrice: selectedAccessory.costPrice,
                retailPrice: selectedAccessory.retailPrice,
                salePrice: selectedAccessory.salePrice,
                imagePath: selectedAccessory.imagePath,
                isActive: selectedAccessory.isActive,
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

      {/* Modal Zone for Combos */}
      {isComboModalOpen && (
        <ComboModal
          isOpen={isComboModalOpen}
          onClose={() => {
            setIsComboModalOpen(false);
            setSelectedCombo(null);
          }}
          combo={selectedCombo}
          accessories={accessoryData || []}
        />
      )}

      {/* Modal Zone for Categories */}
      <AccessoryCategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
      />
    </div>
  );
};

export default Page;
