'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getDoors, getDoorSeriesList, getBrands, createProjectPosition } from '@/actions';
import type { Door, ProjectFloor, ProjectDoorPosition } from '@/types';
import { BASE_MINIO_URL } from '@/config';
import { Search, ImageOff, Plus, Layers, ArrowLeft } from 'lucide-react';
import { Modal, Button, Select, Input } from '@/components';
import { DoorThumbnail } from '../../configuration/door-templates/_components/door-thumbnail';
import { getDoorTypeConfig, normalizeDoorType } from '@/types';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';

interface TemplateDoorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: number;
  floors?: ProjectFloor[];
  selectedFloorId?: number | 'all';
  existingPositions?: ProjectDoorPosition[];
  onSelectDoor?: (door: Door, customWidth?: number, customHeight?: number) => void;
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

function getSmartInitialCode(doorCode: string | null | undefined, existingCodes: string[]): string {
  const base = (doorCode || 'D1').trim();
  const existingSet = new Set(existingCodes.map((c) => c.toLowerCase()));

  if (!existingSet.has(base.toLowerCase())) {
    return base;
  }

  const match = base.match(/^(.*?)([-_]?)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const sep = match[2];
    const digits = match[3];
    const padLen = digits.length;
    const startNum = parseInt(digits, 10);
    for (let i = 1; i <= 999; i++) {
      const candidate = `${prefix}${sep}${(startNum + i).toString().padStart(padLen, '0')}`;
      if (!existingSet.has(candidate.toLowerCase())) {
        return candidate;
      }
    }
  }

  for (let i = 1; i <= 999; i++) {
    const candidate = `${base}-${i.toString().padStart(2, '0')}`;
    if (!existingSet.has(candidate.toLowerCase())) {
      return candidate;
    }
  }

  return `${base}-${Date.now().toString().slice(-4)}`;
}

export function TemplateDoorPickerModal({
  isOpen,
  onClose,
  projectId,
  floors = [],
  selectedFloorId = 'all',
  existingPositions = [],
  onSelectDoor,
}: TemplateDoorPickerModalProps) {
  // Step: 'select' (chọn mẫu cửa) -> 'info' (điền newcode, description)
  const [step, setStep] = useState<'select' | 'info'>('select');
  const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);
  const [newCode, setNewCode] = useState('');
  const [description, setDescription] = useState('');
  const [targetFloorId, setTargetFloorId] = useState<number>(0);

  // Filters for Step 1
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const handleClose = () => {
    setStep('select');
    setSelectedDoor(null);
    setNewCode('');
    setDescription('');
    onClose();
  };

  // Lấy danh sách Hãng (Chỉ lấy hãng cung cấp nhôm)
  const { data: brandsData } = useQuery({
    queryKey: ['brands-picker', 'aluminum'],
    queryFn: () => getBrands({ limit: 100, brandType: 'aluminum' }),
    enabled: isOpen,
  });
  const brandsList = useMemo(() => {
    const list = (brandsData?.items || []).filter(
      (b) => !b.brandType || b.brandType === 'aluminum' || b.brandType === 'both'
    );
    return list.sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [brandsData]);

  const brandOptions = useMemo(() => {
    return brandsList.map((b) => ({
      value: b.id,
      label: b.name,
    }));
  }, [brandsList]);

  // Tự động chọn brand đầu tiên nếu chưa chọn hoặc nếu brand hiện tại không nằm trong danh sách
  React.useEffect(() => {
    if (brandsList.length > 0) {
      const isCurrentBrandValid = brandsList.some((b) => b.id === selectedBrandId);
      if (!selectedBrandId || !isCurrentBrandValid) {
        setSelectedBrandId(brandsList[0].id);
        setSelectedSeriesId(null);
      }
    }
  }, [brandsList, selectedBrandId]);

  // Lấy danh sách Series theo Brand được chọn
  const { data: seriesData } = useQuery({
    queryKey: ['series-picker', selectedBrandId],
    queryFn: () => getDoorSeriesList({ brandId: selectedBrandId! }),
    enabled: isOpen && !!selectedBrandId,
  });
  const seriesList = seriesData?.items || [];
  const seriesOptions = useMemo(() => {
    return seriesList.map((s) => ({
      value: s.id,
      label: `${s.code} - ${s.name}`,
    }));
  }, [seriesList]);

  // Lấy danh sách Doors theo Brand
  const { data: doorsData, isLoading: isLoadingDoors } = useQuery({
    queryKey: ['doors-picker', selectedBrandId],
    queryFn: () => getDoors({ brandId: selectedBrandId!, limit: 1000 }),
    enabled: isOpen && !!selectedBrandId,
  });
  const allDoors = doorsData?.items || [];

  // Lọc dữ liệu phía Client
  const filteredDoors = useMemo(() => {
    let result = allDoors;
    if (selectedSeriesId) {
      result = result.filter((d) => d.doorSeriesId === selectedSeriesId);
    }
    if (selectedType) {
      result = result.filter((d) => matchDoorType(d.type, selectedType));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.code && d.code.toLowerCase().includes(q))
      );
    }
    return result;
  }, [allDoors, selectedSeriesId, selectedType, search]);

  // Mutation gửi tạo vị trí cửa lên backend
  const { mutate: createPositionMutate, isPending: isSubmitting } = useMutation({
    mutationFn: () => {
      if (!selectedDoor) throw new Error('Chưa chọn mẫu cửa');
      if (!projectId) throw new Error('Không xác định được dự án');
      const sc = (selectedDoor.systemConfig || {}) as Record<string, any>;
      return createProjectPosition(projectId, {
        projectId,
        code: newCode.trim(),
        floorId: targetFloorId ? Number(targetFloorId) : undefined,
        templateDoorId: selectedDoor.id,
        description: description.trim() || selectedDoor.name,
        doorType: selectedDoor.type || 'door',
        width: Number(sc.w) || 1200,
        height: Number(sc.h) || 2200,
        brandId: selectedDoor.doorSeries?.brandId || undefined,
        doorSeriesId: selectedDoor.doorSeriesId || undefined,
        systemConfig: sc,
      });
    },
    onSuccess: (newPos) => {
      queryClient.invalidateQueries({ queryKey: ['project_positions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success(`Đã thêm cửa ${newPos.code} vào dự án`);
      handleClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi thêm cửa vào dự án'),
  });

  const handlePickDoor = (door: Door) => {
    if (projectId) {
      setSelectedDoor(door);
      setNewCode('');
      setDescription(door.name || '');
      setTargetFloorId(
        typeof selectedFloorId === 'number'
          ? selectedFloorId
          : floors?.[0]?.id || 0
      );
      setStep('info');
    } else if (onSelectDoor) {
      onSelectDoor(door);
      handleClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'select' ? 'Chọn Mẫu Cửa Từ Thư Viện Catalogue' : 'Thông tin cửa mới'}
      size={step === 'select' ? 'xl' : 'md'}
      className={
        step === 'select'
          ? 'md:max-w-6xl xl:max-w-7xl md:w-[94vw] p-0 overflow-hidden'
          : 'max-w-lg w-full p-0 overflow-hidden'
      }
    >
      {step === 'info' ? (
        /* ========================================================================= */
        /* BƯỚC 2: ĐIỀN THÔNG TIN (NEWCODE, DESCRIPTION) -> GỬI LÊN BACKEND */
        /* ========================================================================= */
        <div className="flex flex-col">
          {/* Header Bar */}
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <button
              type="button"
              onClick={() => setStep('select')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-primary font-medium cursor-pointer transition-colors"
            >
              <ArrowLeft size={14} /> Chọn mẫu khác
            </button>
          </div>

          <div className="p-4 space-y-3.5">
            {/* Thumbnail Preview nhỏ của mẫu cửa đã chọn */}
            <div className="flex items-center gap-3 p-2.5 bg-slate-50/70 border border-slate-200/80 rounded-lg">
              <div className="w-14 h-14 bg-white border border-slate-200 rounded shrink-0 flex items-center justify-center overflow-hidden p-1">
                {selectedDoor && (
                  <DoorThumbnail door={selectedDoor} hideDimensions className="w-full h-full" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-800 truncate">
                  {selectedDoor?.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  Mẫu: {selectedDoor?.code} • Kích thước: {(selectedDoor?.systemConfig as any)?.w || 1200} × {(selectedDoor?.systemConfig as any)?.h || 2200} mm
                </p>
              </div>
            </div>

            {/* Form Fields: newcode & description */}
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                <Input
                  label="Mã cửa (Code) *"
                  placeholder="Nhập mã cửa (VD: D1-01)"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  autoFocus
                  fullWidth
                />

                {floors && floors.length > 0 && (
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-semibold text-gray-700 select-none">
                      Tầng bố trí *
                    </label>
                    <select
                      value={targetFloorId}
                      onChange={(e) => setTargetFloorId(Number(e.target.value))}
                      className="w-full h-10 px-3 text-base md:text-sm bg-white border border-gray-200 rounded-md outline-none hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 transition-all duration-200"
                    >
                      {floors.map((fl) => (
                        <option key={fl.id} value={fl.id}>
                          {fl.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <Input
                label="Mô tả"
                placeholder="VD: Cửa đi phòng khách"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
            <Button variant="outline" size="sm" onClick={() => setStep('select')}>
              Quay lại
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!newCode.trim() || isSubmitting}
              loading={isSubmitting}
              onClick={() => createPositionMutate()}
            >
              Thêm vào dự án
            </Button>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* BƯỚC 1: CHỌN MẪU CỬA TỪ CATALOGUE */
        /* ========================================================================= */
        <div className="flex flex-col h-[80vh]">
          {/* Top Filters */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Chọn Hãng */}
              <div className="w-48">
                <Select
                  value={selectedBrandId ?? ''}
                  options={brandOptions}
                  onChange={(e) => {
                    setSelectedBrandId(e.target.value ? Number(e.target.value) : null);
                    setSelectedSeriesId(null);
                  }}
                  className="h-8 text-xs font-semibold"
                  placeholder="Chọn hãng..."
                />
              </div>

              {/* Chọn Series */}
              <div className="w-48">
                <Select
                  value={selectedSeriesId ?? ''}
                  options={seriesOptions}
                  onChange={(e) => setSelectedSeriesId(e.target.value ? Number(e.target.value) : null)}
                  className="h-8 text-xs"
                  placeholder="Tất cả hệ nhôm"
                />
              </div>

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
          </div>

          {/* Quick Filter: Loại cửa (Tabs) */}
          <div className="px-3 py-2 border-b border-slate-200 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {DOOR_TYPES.map((type) => {
              const isSelected = selectedType === type.value;
              return (
                <button
                  key={type.value ?? 'all'}
                  type="button"
                  onClick={() => setSelectedType(type.value)}
                  className={`px-2.5 py-1 text-xs rounded font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {type.label}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
                {filteredDoors.map((door) => {
                  const sc = (door.systemConfig || {}) as Record<string, any>;
                  const hasSvg = !!sc.rootCell;
                  const typeConfig = getDoorTypeConfig(door.type);

                  return (
                    <div
                      key={door.id}
                      onClick={() => handlePickDoor(door)}
                      className="group bg-white rounded-lg border border-slate-200/80 hover:border-primary hover:shadow-md transition-all p-2.5 flex flex-col justify-between cursor-pointer"
                    >
                      {/* Thumbnail SVG hoặc Image */}
                      <div className="aspect-[4/3] w-full bg-slate-50/80 rounded flex items-center justify-center overflow-hidden relative mb-2 border border-slate-100/70">
                        {hasSvg ? (
                          <div className="w-full h-full p-1.5 group-hover:scale-105 transition-transform duration-300 pointer-events-none">
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
                            className="w-full h-full object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-slate-300">
                            <ImageOff size={22} />
                            <span className="text-[10px]">Chưa có bản vẽ</span>
                          </div>
                        )}

                        {/* Badge loại cửa nổi trên góc thumbnail */}
                        <span className={`absolute top-1.5 right-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded shadow-2xs backdrop-blur-xs border ${typeConfig.className}`}>
                          {typeConfig.label}
                        </span>
                      </div>

                      {/* Metadata */}
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-800 truncate" title={door.code || `#${door.id}`}>
                          {door.code || `#${door.id}`}
                        </div>
                        <p className="text-[11px] text-slate-600 truncate font-medium group-hover:text-primary transition-colors" title={door.name}>
                          {door.name}
                        </p>
                        <div className="pt-1.5 flex items-center justify-between border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                          <span>
                            {sc.w || 1200} x {sc.h || 2200} mm
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
      )}
    </Modal>
  );
}
