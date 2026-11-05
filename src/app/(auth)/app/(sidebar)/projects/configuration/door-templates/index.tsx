'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getDoors, getDoorSeriesList, getBrands, deleteDoor } from '@/actions';
import { getDefaultBrandId, normalizeDoorType, type Door } from '@/types';
import { Search, Plus, LayoutGrid } from 'lucide-react';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import { BrandSidebar } from '../../_components';
import { ConfirmActionModal, DoorStudioModal, Select } from '@/components';
import { DoorCard } from './_components/door-card';

const DOOR_TYPES: Array<{ value: string | null; label: string }> = [
  { value: null, label: 'Tất cả' },
  { value: 'casement_door', label: 'Cửa đi mở quay' },
  { value: 'sliding_door', label: 'Cửa đi lùa' },
  { value: 'casement_window', label: 'Cửa sổ mở quay' },
  { value: 'sliding_window', label: 'Cửa sổ lùa' },
  { value: 'folding_door', label: 'Cửa gấp xếp' },
  { value: 'sliding_casement_door', label: 'Cửa trượt quay' },
  { value: 'glass_wall', label: 'Vách kính' },
  { value: 'curtain_wall', label: 'Mặt dựng' },
  { value: 'composite', label: 'Tổng hợp' },
];

function matchDoorType(doorType: string | null | undefined, filterType: string | null): boolean {
  if (!filterType) return true;
  if (!doorType) return false;
  return normalizeDoorType(doorType) === normalizeDoorType(filterType);
}

export default function DoorTemplatesTab() {
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [studioDoor, setStudioDoor] = useState<Door | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [doorToDelete, setDoorToDelete] = useState<Door | null>(null);

  const { data: brandsData } = useQuery({
    queryKey: ['brands', 'aluminum'],
    queryFn: async () => (await getBrands({ limit: 9999, offset: 0, allowDeleted: false, brandType: 'aluminum' })).items || [],
  });
  const brandsList = useMemo(() => brandsData ?? [], [brandsData]);

  const sortedBrands = useMemo(
    () => [...brandsList].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })),
    [brandsList],
  );

  // Tự động chọn hãng đầu tiên (Derived State - tránh setState trong useEffect)
  const activeBrandId = selectedBrandId ?? getDefaultBrandId(sortedBrands);

  const { data: seriesData } = useQuery({
    queryKey: ['door-series', activeBrandId],
    queryFn: () => getDoorSeriesList({ brandId: activeBrandId || undefined, limit: 9999, offset: 0 }),
    enabled: activeBrandId !== null,
  });
  const seriesList = seriesData?.items || [];

  const { data: doorsData, isLoading } = useQuery({
    queryKey: ['door-templates', activeBrandId],
    queryFn: () => getDoors({ brandId: activeBrandId || undefined, limit: 9999, offset: 0 }),
    enabled: activeBrandId !== null,
  });
  const allDoors = useMemo(() => doorsData?.items ?? [], [doorsData]);

  const { mutate: deleteDoorMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteDoor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['door-templates'] });
      queryClient.invalidateQueries({ queryKey: ['doors'] });
      queryClient.invalidateQueries({ queryKey: ['doors-stats'] });
      toast.success('Xóa mẫu cửa thành công');
      setDoorToDelete(null);
    },
    onError: (error) => {
      showErrorToast(error, 'Xóa mẫu cửa thất bại');
    },
  });

  const handleEditDoor = (door: Door) => {
    setStudioDoor(door);
    setIsStudioOpen(true);
  };

  const handleCopyDoor = (door: Door) => {
    const clonedConfig = door.systemConfig
      ? (structuredClone(door.systemConfig) as Record<string, unknown>)
      : undefined;

    const copiedDoor: Door = {
      ...door,
      id: 0,
      name: `${door.name}_COPY`,
      code: `${door.code || door.name}_COPY`,
      systemConfig: clonedConfig,
    };

    setStudioDoor(copiedDoor);
    setIsStudioOpen(true);
  };

  const handleDeleteDoor = (door: Door) => {
    setDoorToDelete(door);
  };

  const filteredDoors = useMemo(() => {
    let result = allDoors;
    if (selectedSeriesId) result = result.filter((d) => d.doorSeriesId === selectedSeriesId);
    if (selectedType) result = result.filter((d) => matchDoorType(d.type, selectedType));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(q) || Boolean(d.code && d.code.toLowerCase().includes(q)));
    }
    return result;
  }, [allDoors, selectedSeriesId, selectedType, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, Door[]>();
    for (const door of filteredDoors) {
      const key = door.doorSeries?.name || '— Chưa phân series —';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(door);
    }
    return map;
  }, [filteredDoors]);

  const tabCounts = useMemo(() => {
    const baseList = selectedSeriesId ? allDoors.filter((d) => d.doorSeriesId === selectedSeriesId) : allDoors;
    const counts: Record<string, number> = { all: baseList.length };
    for (const d of baseList) {
      const norm = d.type ? normalizeDoorType(d.type) : null;
      if (norm) counts[norm] = (counts[norm] || 0) + 1;
    }
    return counts;
  }, [allDoors, selectedSeriesId]);

  return (
    <div className="flex flex-col md:flex-row items-start min-h-[calc(100vh-105px)]">
      <BrandSidebar
        brands={brandsList}
        selectedBrandId={activeBrandId}
        onSelectBrand={(id) => {
          setSelectedBrandId(id);
          setSelectedSeriesId(null);
        }}
      />

      <div className="flex-1 flex flex-col gap-0 min-w-0 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            {seriesList.length > 0 && (
              <Select
                value={selectedSeriesId ?? ''}
                onChange={(e) => setSelectedSeriesId(e.target.value ? Number(e.target.value) : null)}
                options={[
                  { value: '', label: 'Tất cả series' },
                  ...seriesList.map((s) => ({
                    value: s.id,
                    label: s.name,
                  })),
                ]}
                placeholder="Tất cả series"
                className="h-9 py-0 min-w-[180px] text-sm md:text-sm rounded-lg border-slate-200 bg-white text-slate-700"
              />
            )}

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm mã hoặc tên mẫu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 h-9 w-56 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setStudioDoor(null);
              setIsStudioOpen(true);
            }}
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition cursor-pointer shrink-0"
          >
            <Plus size={15} /> Tạo mẫu mới
          </button>
        </div>

        <div className="flex items-center gap-1 px-4 pt-2.5 pb-0 overflow-x-auto [scrollbar-width:none]">
          {DOOR_TYPES.map((t) => {
            const count = t.value ? (tabCounts[t.value] || 0) : tabCounts.all;
            const isSelected = selectedType === t.value;
            return (
              <button
                key={String(t.value)}
                type="button"
                onClick={() => setSelectedType(t.value)}
                className={`shrink-0 px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isSelected ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{t.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="h-px bg-slate-200 mx-4 mb-4" />

        <div className="px-4 pb-6 flex flex-col gap-6">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl overflow-hidden border border-slate-200">
                  <div className="aspect-[4/3] bg-slate-100" />
                  <div className="p-3 flex flex-col gap-1.5">
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                    <div className="h-4 bg-slate-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDoors.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
              <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
                <LayoutGrid size={26} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-600">
                {search ? 'Không tìm thấy mẫu cửa phù hợp' : 'Chưa có mẫu cửa nào'}
              </p>
              <p className="text-xs">Nhấn &quot;Tạo mẫu mới&quot; để thêm mẫu cửa đầu tiên.</p>
            </div>
          ) : (
            Array.from(grouped.entries()).map(([seriesName, doors]) => (
              <div key={seriesName}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider border border-slate-200 rounded px-2 py-0.5 bg-slate-50">
                    {seriesName}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] text-slate-400">{doors.length} mẫu</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {doors.map((door) => (
                    <DoorCard
                      key={door.id}
                      door={door}
                      onEdit={handleEditDoor}
                      onCopy={handleCopyDoor}
                      onDelete={handleDeleteDoor}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <DoorStudioModal
        key={studioDoor ? `studio-${studioDoor.id}-${studioDoor.code}` : `studio-new-${activeBrandId}`}
        isOpen={isStudioOpen}
        door={studioDoor}
        defaultBrandId={activeBrandId}
        onClose={() => {
          setIsStudioOpen(false);
          setStudioDoor(null);
        }}
      />

      <ConfirmActionModal
        isOpen={Boolean(doorToDelete)}
        onClose={() => setDoorToDelete(null)}
        title="Xác nhận xóa mẫu cửa"
        description={
          <>
            Bạn có chắc chắn muốn xóa mẫu cửa{' '}
            <strong className="text-slate-900 font-semibold">{doorToDelete?.name}</strong>
            {doorToDelete?.code ? ` (${doorToDelete.code})` : ''}?
          </>
        }
        onConfirm={() => {
          if (doorToDelete) {
            deleteDoorMutation(doorToDelete.id);
          }
        }}
        loading={isDeleting}
        confirmText="Xác nhận xóa"
        cancelText="Hủy"
        variant="danger"
      />
    </div>
  );
}
