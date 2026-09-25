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
  BrandGridSkeleton,
  BrandEmptyState,
} from './_components';

export default function BrandTab() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ['brands', search],
    queryFn: async () => {
      return await getBrands({ offset: 0, limit: 9999, search: search || undefined });
    },
  });

  const brands = useMemo(() => {
    const items = response?.items || [];
    return [...items].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [response?.items]);

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

  const handleDeleteBrand = (brand: Brand) => {
    if (confirm(`Xác nhận xóa thương hiệu "${brand.name}" (${brand.code})?`)) {
      deleteBrandMutate(brand.id);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-5">
      {/* Toolbar: Tìm kiếm và nút Thêm mới */}
      <BrandToolbar
        search={search}
        onSearchChange={setSearch}
        onAddClick={handleOpenCreateModal}
      />

      {/* Grid danh sách thương hiệu */}
      {isLoading ? (
        <BrandGridSkeleton count={12} />
      ) : brands.length === 0 ? (
        <BrandEmptyState />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {brands.map((brand) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteBrand}
            />
          ))}
        </div>
      )}

      {/* Modal Thêm mới / Chỉnh sửa */}
      <BrandModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBrand(null);
        }}
        brand={selectedBrand}
      />
    </div>
  );
}
