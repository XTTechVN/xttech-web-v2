'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDoors, getDoorSeriesList, getBrands } from '@/actions';
import type { Door } from '@/types';
import { BASE_MINIO_URL } from '@/config';
import { Search, Plus, ImageOff, LayoutGrid } from 'lucide-react';
import { AccessoryBrandSidebar } from '../accessories/_components';
import { DoorCreateModal, DoorUpdateModal, DoorDeleteModal } from '../doors/_components/modals';
import { DoorStudioModal } from '../doors/_components/studio';
import { DoorThumbnail } from './_components/door-thumbnail';

// ─── Door type tabs ───────────────────────────────────────────────────────────
const DOOR_TYPES = [
  { value: null, label: 'Tất cả' },
  { value: 'cd', label: 'Cửa đi' },
  { value: 'cs', label: 'Cửa sổ' },
  { value: 'ck', label: 'Cửa kính' },
];


// ─── Card ─────────────────────────────────────────────────────────────────────
function DoorCard({
  door,
  onClick,
}: {
  door: Door;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const hasSvg = !!(door.systemConfig as any)?.rootCell;

  // Fallback image from imagePath / images[]
  const imgUrl = (() => {
    const primary = door.images?.find((i) => i.isPrimary);
    const path = primary?.imagePath ?? door.imagePath;
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BASE_MINIO_URL}/${path.startsWith('/') ? path.slice(1) : path}`;
  })();

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-primary hover:shadow-md transition-all text-left cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] w-full bg-slate-50 flex items-center justify-center overflow-hidden relative">
        {hasSvg ? (
          /* SVG bản vẽ từ systemConfig */
          <div className="w-full h-full p-1.5 group-hover:scale-105 transition-transform duration-300">
            <DoorThumbnail door={door} />
          </div>
        ) : imgUrl && !imgError ? (
          <img
            src={imgUrl}
            alt={door.name}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-slate-300">
            <ImageOff size={28} />
            <span className="text-[11px] font-medium">Chưa có bản vẽ</span>
          </div>
        )}
        {/* Type badge */}
        {door.type && (
          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/90 border border-slate-200 text-slate-600 shadow-xs">
            {door.type}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 border-t border-slate-100">
        {door.code && (
          <p className="text-[11px] font-mono text-slate-400 mb-0.5 truncate">{door.code}</p>
        )}
        <p className="text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors leading-snug line-clamp-2">
          {door.name}
        </p>
        {door.doorSeries?.name && (
          <p className="text-[11px] text-slate-400 mt-1 truncate">{door.doorSeries.name}</p>
        )}
      </div>
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DoorTemplatesTab() {
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editDoor, setEditDoor] = useState<Door | null>(null);
  const [deleteDoor, setDeleteDoor] = useState<Door | null>(null);
  const [studioDoor, setStudioDoor] = useState<Door | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Brands
  const { data: brandsData } = useQuery({
    queryKey: ['brands', 'aluminum'],
    queryFn: async () => {
      const res = await getBrands({ limit: 9999, offset: 0, allowDeleted: false, brandType: 'aluminum' });
      return res.items || [];
    },
  });
  const brandsList = brandsData || [];

  // Auto-select first brand
  const sortedBrands = useMemo(
    () => [...brandsList].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })),
    [brandsList],
  );
  React.useEffect(() => {
    if (selectedBrandId === null && sortedBrands.length > 0) {
      setSelectedBrandId(sortedBrands[0].id);
    }
  }, [sortedBrands, selectedBrandId]);

  // Series
  const { data: seriesData } = useQuery({
    queryKey: ['door-series', selectedBrandId],
    queryFn: () =>
      getDoorSeriesList({
        brandId: selectedBrandId || undefined,
        limit: 9999,
        offset: 0,
      }),
    enabled: selectedBrandId !== null,
  });
  const seriesList = seriesData?.items || [];

  // Reset series when brand changes
  React.useEffect(() => {
    setSelectedSeriesId(null);
  }, [selectedBrandId]);

  // Doors — fetch all for grid (grouping by series)
  const { data: doorsData, isLoading } = useQuery({
    queryKey: ['door-templates', selectedBrandId, selectedSeriesId, selectedType],
    queryFn: () =>
      getDoors({
        brandId: selectedBrandId || undefined,
        doorSeriesId: selectedSeriesId || undefined,
        type: selectedType || undefined,
        limit: 9999,
        offset: 0,
      }),
    enabled: selectedBrandId !== null,
  });
  const allDoors = doorsData?.items || [];

  // Client-side search filter
  const filteredDoors = useMemo(() => {
    if (!search.trim()) return allDoors;
    const q = search.toLowerCase();
    return allDoors.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.code && d.code.toLowerCase().includes(q)),
    );
  }, [allDoors, search]);

  // Group by series
  const grouped = useMemo(() => {
    const map = new Map<string, Door[]>();
    for (const door of filteredDoors) {
      const key = door.doorSeries?.name || '— Chưa phân series —';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(door);
    }
    return map;
  }, [filteredDoors]);

  return (
    <div className="flex flex-col md:flex-row items-start min-h-[calc(100vh-105px)]">
      {/* Brand sidebar */}
      <AccessoryBrandSidebar
        brands={brandsList}
        selectedBrandId={selectedBrandId}
        onSelectBrand={(id) => {
          setSelectedBrandId(id);
          setSelectedSeriesId(null);
        }}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col gap-0 min-w-0 w-full">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Series select */}
            {seriesList.length > 0 && (
              <select
                value={selectedSeriesId ?? ''}
                onChange={(e) => setSelectedSeriesId(e.target.value ? Number(e.target.value) : null)}
                className="h-9 px-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:border-primary transition"
              >
                <option value="">Tất cả series</option>
                {seriesList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}

            {/* Search */}
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
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition cursor-pointer shrink-0"
          >
            <Plus size={15} /> Tạo mẫu mới
          </button>
        </div>

        {/* Door type tabs */}
        <div className="flex items-center gap-0 px-4 pt-3 pb-0 overflow-x-auto [scrollbar-width:none]">
          {DOOR_TYPES.map((t) => (
            <button
              key={String(t.value)}
              type="button"
              onClick={() => setSelectedType(t.value)}
              className={`shrink-0 px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                selectedType === t.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-[10px] font-medium text-slate-400">
                ({t.value ? allDoors.filter((d) => d.type === t.value).length : allDoors.length})
              </span>
            </button>
          ))}
        </div>
        <div className="h-px bg-slate-200 mx-4 mb-4" />

        {/* Grid content */}
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
                {/* Series header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider border border-slate-200 rounded px-2 py-0.5 bg-slate-50">
                    {seriesName}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] text-slate-400">{doors.length} mẫu</span>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {doors.map((door) => (
                    <DoorCard
                      key={door.id}
                      door={door}
                      onClick={() => {
                        setStudioDoor(door);
                        setIsStudioOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals — reuse from doors tab */}
      <DoorStudioModal
        key={studioDoor ? `studio-${studioDoor.id}` : 'studio-new'}
        isOpen={isStudioOpen}
        door={studioDoor}
        onClose={() => {
          setIsStudioOpen(false);
          setStudioDoor(null);
        }}
      />

      <DoorCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tạo mẫu cửa mới"
        submitText="Xác nhận tạo"
      />

      <DoorUpdateModal
        isOpen={!!editDoor}
        onClose={() => setEditDoor(null)}
        title="Sửa mẫu cửa"
        submitText="Lưu thay đổi"
        initialData={editDoor || undefined}
      />

      <DoorDeleteModal
        isOpen={!!deleteDoor}
        onClose={() => setDeleteDoor(null)}
        doorName={deleteDoor?.name}
        onConfirm={() => {}}
        isPending={false}
      />
    </div>
  );
}
