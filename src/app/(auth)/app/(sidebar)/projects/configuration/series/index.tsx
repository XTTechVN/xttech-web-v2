'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getBrands, getDoorSeriesList, deleteDoorSeries } from '@/actions';
import type { DoorSeries } from '@/types';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import { BrandSidebar } from '../../_components';
import {
  SeriesToolbar,
  SeriesTable,
  SeriesModal,
  SeriesSkeleton,
  SeriesEmptyState,
} from './_components';

export default function SeriesTab() {
  const [search, setSearch] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<DoorSeries | null>(null);

  // Queries
  const { data: brandsData, isLoading: isBrandsLoading } = useQuery({
    queryKey: ['brands', 'aluminum'],
    queryFn: async () => (await getBrands({ offset: 0, limit: 9999, brandType: 'aluminum' })).items,
  });

  const { data: seriesData, isLoading: isSeriesLoading } = useQuery({
    queryKey: ['door-series'],
    queryFn: async () => (await getDoorSeriesList({ offset: 0, limit: 9999 })).items,
  });

  const brandsList = useMemo(() => brandsData ?? [], [brandsData]);
  const seriesList = useMemo(() => seriesData ?? [], [seriesData]);

  const sortedBrands = useMemo(() => {
    return [...brandsList].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [brandsList]);

  // Tự động lấy hãng đầu tiên nếu chưa chọn (Derived State - tránh setState trong useEffect)
  const activeBrandId = selectedBrandId ?? sortedBrands[0]?.id ?? null;

  // Mutations
  const { mutate: deleteSeriesMutate } = useMutation({
    mutationFn: (id: number) => deleteDoorSeries(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['door-series'] });
      toast.success('Xóa hệ nhôm thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa hệ nhôm'),
  });

  // Lọc và sắp xếp danh sách hệ nhôm theo hãng & từ khóa tìm kiếm
  const filteredSeries = useMemo(() => {
    return seriesList
      .filter((s) => {
        const matchBrand = activeBrandId === null || s.brandId === activeBrandId;
        if (!matchBrand) return false;

        if (!search.trim()) return true;
        const query = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(query) ||
          s.code.toLowerCase().includes(query) ||
          (s.brand?.name && s.brand.name.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [seriesList, activeBrandId, search]);

  const selectedBrand = useMemo(() => {
    return activeBrandId ? brandsList.find((b) => b.id === activeBrandId) : null;
  }, [brandsList, activeBrandId]);

  const handleOpenCreateModal = () => {
    setSelectedSeries(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (series: DoorSeries) => {
    setSelectedSeries(series);
    setIsModalOpen(true);
  };

  const handleDeleteSeries = (series: DoorSeries) => {
    if (confirm(`Xác nhận xóa hệ nhôm "${series.name}" (${series.code})?`)) {
      deleteSeriesMutate(series.id);
    }
  };

  const isLoading = isBrandsLoading || isSeriesLoading;

  return (
    <div className="flex flex-col md:flex-row items-start min-h-[calc(100vh-105px)]">
      {/* Cột lọc danh sách Hãng nhôm bên trái */}
      <BrandSidebar
        brands={brandsList}
        selectedBrandId={activeBrandId}
        onSelectBrand={setSelectedBrandId}
      />

      {/* Khu vực nội dung danh sách Hệ nhôm bên phải */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 w-full p-4">
        {/* Toolbar: Tìm kiếm & Thêm mới */}
        <SeriesToolbar
          search={search}
          onSearchChange={setSearch}
          onAddClick={handleOpenCreateModal}
        />

        {/* Danh sách hệ nhôm dạng bảng (HTML table / tr / td) */}
        {isLoading ? (
          <SeriesSkeleton count={6} />
        ) : filteredSeries.length === 0 ? (
          <SeriesEmptyState selectedBrandName={selectedBrand?.name} />
        ) : (
          <SeriesTable
            seriesList={filteredSeries}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteSeries}
          />
        )}
      </div>

      {/* Modal Thêm mới / Sửa hệ nhôm */}
      <SeriesModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSeries(null);
        }}
        series={selectedSeries}
        brands={brandsList}
        defaultBrandId={activeBrandId}
      />
    </div>
  );
}
