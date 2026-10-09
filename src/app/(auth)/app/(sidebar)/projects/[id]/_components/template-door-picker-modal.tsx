'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDoors, getDoorSeriesList, getBrands } from '@/actions';
import type { Door } from '@/types';
import { BASE_MINIO_URL } from '@/config';
import { Search, ImageOff, Plus, Layers } from 'lucide-react';
import { Modal, Button, Badge } from '@/components';
import { DoorThumbnail } from '../../configuration/door-templates/_components/door-thumbnail';
import { getDoorTypeConfig, normalizeDoorType } from '@/types';

interface TemplateDoorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDoor: (door: Door, customWidth?: number, customHeight?: number) => void;
}

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

export function TemplateDoorPickerModal({
  isOpen,
  onClose,
  onSelectDoor,
}: TemplateDoorPickerModalProps) {
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Lấy danh sách Hãng
  const { data: brandsData } = useQuery({
    queryKey: ['brands-picker'],
    queryFn: () => getBrands({ limit: 100 }),
    enabled: isOpen,
  });
  const brandsList = brandsData?.items || [];

  // Tự động chọn brand đầu tiên nếu chưa chọn
  React.useEffect(() => {
    if (brandsList.length > 0 && selectedBrandId === null) {
      setSelectedBrandId(brandsList[0].id);
    }
  }, [brandsList, selectedBrandId]);

  // Lấy Series theo Hãng
  const { data: seriesData } = useQuery({
    queryKey: ['series-picker', selectedBrandId],
    queryFn: () =>
      getDoorSeriesList({
        brandId: selectedBrandId || undefined,
        limit: 100,
      }),
    enabled: !!selectedBrandId && isOpen,
  });
  const seriesList = seriesData?.items || [];

  // Lấy Mẫu cửa (Doors)
  const { data: doorsData, isLoading: isLoadingDoors } = useQuery({
    queryKey: ['doors-picker', selectedBrandId],
    queryFn: () =>
      getDoors({
        brandId: selectedBrandId || undefined,
        limit: 1000,
      }),
    enabled: !!selectedBrandId && isOpen,
  });
  const allDoors = doorsData?.items || [];

  const filteredDoors = useMemo(() => {
    let result = allDoors;
    if (selectedSeriesId) {
      result = result.filter((d) => d.doorSeriesId === selectedSeriesId);
    }
    if (selectedType) {
      result = result.filter((d) => matchDoorType(d.type, selectedType));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.code && d.code.toLowerCase().includes(q))
      );
    }
    return result;
  }, [allDoors, selectedSeriesId, selectedType, search]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chọn Mẫu Cửa Từ Thư Viện Catalogue"
      className="max-w-5xl w-full p-0 overflow-hidden"
    >
      <div className="flex flex-col h-[75vh]">
        {/* Top Filters */}
        <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Chọn Hãng */}
            <select
              value={selectedBrandId ?? ''}
              onChange={(e) => {
                setSelectedBrandId(e.target.value ? Number(e.target.value) : null);
                setSelectedSeriesId(null);
              }}
              className="h-8 px-2.5 border border-slate-200 rounded-md text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:border-primary"
            >
              {brandsList.map((b) => (
                <option key={b.id} value={b.id}>
                  Hãng: {b.name}
                </option>
              ))}
            </select>

            {/* Chọn Series */}
            <select
              value={selectedSeriesId ?? ''}
              onChange={(e) => setSelectedSeriesId(e.target.value ? Number(e.target.value) : null)}
              className="h-8 px-2.5 border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-none focus:border-primary"
            >
              <option value="">Tất cả hệ nhôm</option>
              {seriesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Tìm kiếm */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm mã hoặc tên cửa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 pr-3 border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-none focus:border-primary w-48"
              />
            </div>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {filteredDoors.length} mẫu cửa phù hợp
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 overflow-x-auto bg-white shrink-0">
          {DOOR_TYPES.map((t) => {
            const isSelected = selectedType === t.value;
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => setSelectedType(t.value)}
                className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Grid List Mẫu Cửa */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/40">
          {isLoadingDoors ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Đang tải danh mục mẫu cửa...
            </div>
          ) : filteredDoors.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
              <Layers size={24} className="text-slate-300" />
              <span>Không tìm thấy mẫu cửa nào phù hợp.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredDoors.map((door) => {
                const sc = (door.systemConfig || {}) as Record<string, any>;
                const hasSvg = !!sc.rootCell;
                const typeConfig = getDoorTypeConfig(door.type);

                return (
                  <div
                    key={door.id}
                    onClick={() => {
                      onSelectDoor(door);
                      onClose();
                    }}
                    className="group bg-white rounded-lg border border-slate-200/80 hover:border-primary hover:shadow-md transition-all p-2.5 flex flex-col justify-between cursor-pointer"
                  >
                    {/* Thumbnail SVG hoặc Image */}
                    <div className="aspect-[4/3] w-full bg-slate-50 rounded flex items-center justify-center overflow-hidden relative mb-2">
                      {hasSvg ? (
                        <div className="w-full h-full p-1 group-hover:scale-105 transition-transform duration-300 pointer-events-none">
                          <DoorThumbnail door={door} hideDimensions className="w-full h-full" />
                        </div>
                      ) : door.imagePath ? (
                        <img
                          src={
                            door.imagePath.startsWith('http')
                              ? door.imagePath
                              : `${BASE_MINIO_URL}/${door.imagePath.replace(/^\//, '')}`
                          }
                          alt={door.name}
                          className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-300">
                          <ImageOff size={22} />
                          <span className="text-[10px]">Chưa có bản vẽ</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[11px] font-bold text-slate-800 truncate">
                          {door.code || `#${door.id}`}
                        </span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${typeConfig.className}`}>
                          {typeConfig.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug group-hover:text-primary transition-colors font-medium">
                        {door.name}
                      </p>
                      <div className="pt-1.5 flex items-center justify-between border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                        <span>
                          {sc.w || 1200} × {sc.h || 2200} mm
                        </span>
                        <span className="text-primary font-bold inline-flex items-center gap-0.5">
                          <Plus size={10} /> Chọn
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
