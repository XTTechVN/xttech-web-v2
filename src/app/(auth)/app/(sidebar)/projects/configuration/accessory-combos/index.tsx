'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAccessoryCombos, deleteAccessoryCombo, getBrands } from '@/actions';
import type { AccessoryCombo } from '@/types';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import { ComboModal } from '@/components';
import { BrandSidebar } from '../../_components';
import { ComboToolbar, ComboTable } from './_components';

const PAGE_SIZE = 20;

export default function AccessoryCombosTab() {
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<AccessoryCombo | null>(null);

  // Query danh sách hãng phụ kiện
  const { data: brandsData } = useQuery({
    queryKey: ['brands', 'accessory'],
    queryFn: async () => {
      const res = await getBrands({ limit: 9999, offset: 0, allowDeleted: false, brandType: 'accessory' });
      if (res.items && res.items.length > 0) return res.items;
      const allRes = await getBrands({ limit: 9999, offset: 0, allowDeleted: false });
      return allRes.items || [];
    },
  });

  const brandsList = useMemo(() => brandsData ?? [], [brandsData]);
  const sortedBrands = useMemo(
    () => [...brandsList].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })),
    [brandsList],
  );

  // Tự động chọn hãng đầu tiên (Derived State - tránh setState trong useEffect)
  const activeBrandId = selectedBrandId ?? sortedBrands[0]?.id ?? null;

  // Debounce search
  const searchTimer = useRef<NodeJS.Timeout | null>(null);
  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setOffset(0);
    }, 350);
  };

  const handleSelectBrand = (brandId: number) => {
    setSelectedBrandId(brandId);
    setOffset(0);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['accessory-combos', activeBrandId, debouncedSearch, offset],
    queryFn: () =>
      getAccessoryCombos({
        brandId: activeBrandId || undefined,
        search: debouncedSearch.trim() || undefined,
        limit: PAGE_SIZE,
        offset,
      }),
    enabled: activeBrandId !== null,
  });

  const combos = data?.items || [];
  const total = data?.meta?.total ?? 0;

  const { mutate: deleteMutate } = useMutation({
    mutationFn: (id: number) => deleteAccessoryCombo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessory-combos'] });
      queryClient.invalidateQueries({ queryKey: ['accessory-combos-list'] });
      toast.success('Xóa gói combo thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa gói combo'),
  });

  const handleOpenCreate = () => {
    setSelectedCombo(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (combo: AccessoryCombo) => {
    setSelectedCombo(combo);
    setIsModalOpen(true);
  };

  const handleDelete = (combo: AccessoryCombo) => {
    if (confirm(`Xác nhận xóa gói combo "${combo.name}" (${combo.code})?`)) {
      deleteMutate(combo.id);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-start min-h-[calc(100vh-105px)]">
      {/* Sidebar lọc theo Hãng */}
      <BrandSidebar
        brands={brandsList}
        selectedBrandId={activeBrandId}
        onSelectBrand={handleSelectBrand}
      />

      {/* Nội dung bên phải */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 w-full p-4">
        <ComboToolbar
          search={search}
          onSearchChange={handleSearchChange}
          onAddClick={handleOpenCreate}
          total={total}
        />

        <ComboTable
          combos={combos}
          isLoading={isLoading}
          search={debouncedSearch}
          total={total}
          offset={offset}
          pageSize={PAGE_SIZE}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onPageChange={setOffset}
        />
      </div>

      <ComboModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCombo(null);
        }}
        combo={selectedCombo}
        brandId={activeBrandId}
      />
    </div>
  );
}
