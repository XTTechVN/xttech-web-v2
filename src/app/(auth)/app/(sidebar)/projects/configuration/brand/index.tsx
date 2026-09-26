'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getBrands, deleteBrand } from '@/actions';
import type { Brand } from '@/types';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import {
  BrandCard,
  BrandToolbar,
  BrandModal,
  BrandDetailModal,
  BrandGridSkeleton,
  BrandEmptyState,
} from './_components';

export default function BrandTab() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  // State Modal toàn màn hình để cấu hình hãng
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailBrand, setDetailBrand] = useState<Brand | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ['brands', search],
    queryFn: async () => {
      return await getBrands({ offset: 0, limit: 9999, search: search || undefined });
    },
  });

  const allBrands = useMemo(() => {
    const items = response?.items || [];
    return [...items].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [response?.items]);

  // Phân loại: Hãng nhôm
  const aluminumBrands = useMemo(() => {
    return allBrands.filter(
      (b) => b.brandType === 'aluminum' || b.brandType === 'both' || !b.brandType
    );
  }, [allBrands]);

  // Phân loại: Hãng phụ kiện
  const accessoryBrands = useMemo(() => {
    return allBrands.filter(
      (b) => b.brandType === 'accessory' || b.brandType === 'both'
    );
  }, [allBrands]);

  const { mutate: deleteBrandMutate } = useMutation({
    mutationFn: (id: number) => deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Xóa thương hiệu thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa thương hiệu'),
  });

  const handleOpenCreateModal = () => {
    setSelectedBrand(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsModalOpen(true);
  };

  const handleOpenDetailModal = (brand: Brand) => {
    setDetailBrand(brand);
    setIsDetailModalOpen(true);
  };

  const handleDeleteBrand = (brand: Brand) => {
    if (confirm(`Xác nhận xóa thương hiệu "${brand.name}" (${brand.code})?`)) {
      deleteBrandMutate(brand.id);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      {/* Toolbar: Tìm kiếm và nút Thêm mới */}
      <BrandToolbar
        search={search}
        onSearchChange={setSearch}
        onAddClick={handleOpenCreateModal}
      />

      {isLoading ? (
        <BrandGridSkeleton count={12} />
      ) : allBrands.length === 0 ? (
        <BrandEmptyState />
      ) : (
        <div className="flex flex-col gap-8">
          {/* Mục 1: Hãng nhôm */}
          <section className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Hãng nhôm
                </h2>
                <p className="text-xs text-slate-500">
                  Các thương hiệu cung cấp thanh profile nhôm và phụ kiện hệ nhôm
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {aluminumBrands.length} thương hiệu
              </span>
            </div>

            {aluminumBrands.length === 0 ? (
              <div className="p-6 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                Không tìm thấy hãng nhôm nào phù hợp
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {aluminumBrands.map((brand) => (
                  <BrandCard
                    key={brand.id}
                    brand={brand}
                    onClick={handleOpenDetailModal}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteBrand}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Mục 2: Hãng phụ kiện */}
          <section className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Hãng phụ kiện
                </h2>
                <p className="text-xs text-slate-500">
                  Các thương hiệu cung cấp phụ kiện cửa, khóa, bản lề, tay nắm...
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {accessoryBrands.length} thương hiệu
              </span>
            </div>

            {accessoryBrands.length === 0 ? (
              <div className="p-6 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                Không tìm thấy hãng phụ kiện nào phù hợp
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {accessoryBrands.map((brand) => (
                  <BrandCard
                    key={brand.id}
                    brand={brand}
                    onClick={handleOpenDetailModal}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteBrand}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Modal Thêm mới / Chỉnh sửa thương hiệu */}
      <BrandModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBrand(null);
        }}
        brand={selectedBrand}
      />

      {/* Modal Toàn màn hình Cấu hình Hãng */}
      <BrandDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBrand(null);
          setDetailBrand(null);
        }}
        brand={detailBrand}
        brands={allBrands}
        onSelectBrand={setDetailBrand}
      />
    </div>
  );
}

