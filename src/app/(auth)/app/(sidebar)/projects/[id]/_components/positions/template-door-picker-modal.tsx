'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, ImageOff, Layers, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { createProjectPosition } from '@/actions';
import { Button, Input, Modal, Select } from '@/components';
import { BASE_MINIO_URL } from '@/config';
import { getDoorTypeConfig, type Door, type ProjectDoorPosition, type ProjectFloor } from '@/types';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import { DoorThumbnail } from '../../../configuration/door-templates/_components/door-thumbnail';
import { DOOR_TYPE_FILTERS, useTemplateDoorPicker } from './hooks/use-template-door-picker';

export interface TemplateDoorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: number;
  defaultBrandId?: number | null;
  defaultSeriesId?: number | null;
  floors?: ProjectFloor[];
  selectedFloorId?: number | 'all';
  existingPositions?: ProjectDoorPosition[];
  onSelectDoor?: (door: Door, customWidth?: number, customHeight?: number) => void;
}

export function TemplateDoorPickerModal({
  isOpen,
  onClose,
  projectId,
  defaultBrandId,
  defaultSeriesId,
  floors = [],
  selectedFloorId = 'all',
  onSelectDoor,
}: TemplateDoorPickerModalProps) {
  const [step, setStep] = useState<'select' | 'info'>('select');
  const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);
  const [newCode, setNewCode] = useState('');
  const [description, setDescription] = useState('');
  const [targetFloorId, setTargetFloorId] = useState<number>(0);

  const picker = useTemplateDoorPicker({
    isOpen,
    projectId,
    propDefaultBrandId: defaultBrandId,
    propDefaultSeriesId: defaultSeriesId,
  });

  const handleClose = () => {
    setStep('select');
    setSelectedDoor(null);
    setNewCode('');
    setDescription('');
    onClose();
  };

  const { mutate: createPositionMutate, isPending: isSubmitting } = useMutation({
    mutationFn: () => {
      if (!selectedDoor || !projectId) throw new Error('Thiếu thông tin mẫu cửa hoặc dự án');
      const sc = (selectedDoor.systemConfig || {}) as Record<string, unknown>;
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
      setTargetFloorId(typeof selectedFloorId === 'number' ? selectedFloorId : floors?.[0]?.id || 0);
      setStep('info');
    } else if (onSelectDoor) {
      onSelectDoor(door);
      handleClose();
    }
  };

  const selectedDoorConfig = (selectedDoor?.systemConfig || {}) as Record<string, unknown>;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'select' ? 'Chọn Mẫu Cửa Từ Thư Viện Catalogue' : 'Thông tin cửa mới'}
      size={step === 'select' ? 'xl' : 'md'}
      className={step === 'select' ? 'md:max-w-6xl xl:max-w-7xl md:w-[94vw] p-0 overflow-hidden' : 'max-w-lg w-full p-0 overflow-hidden'}
    >
      {step === 'info' ? (
        <div className="flex flex-col">
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
            <div className="flex items-center gap-3 p-2.5 bg-slate-50/70 border border-slate-200/80 rounded-lg">
              <div className="w-14 h-14 bg-white border border-slate-200 rounded shrink-0 flex items-center justify-center overflow-hidden p-1">
                {selectedDoor && <DoorThumbnail door={selectedDoor} hideDimensions className="w-full h-full" />}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-800 truncate">{selectedDoor?.name}</h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  Mẫu: {selectedDoor?.code} • Kích thước: {Number(selectedDoorConfig.w) || 1200} × {Number(selectedDoorConfig.h) || 2200} mm
                </p>
              </div>
            </div>

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

                {floors.length > 0 && (
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-semibold text-gray-700 select-none">Tầng bố trí *</label>
                    <select
                      value={targetFloorId}
                      onChange={(e) => setTargetFloorId(Number(e.target.value))}
                      className="w-full h-10 px-3 text-base md:text-sm bg-white border border-gray-200 rounded-md outline-none hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 transition-all duration-200"
                    >
                      {floors.map((fl) => (
                        <option key={fl.id} value={fl.id}>{fl.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <Input label="Mô tả" placeholder="VD: Cửa đi phòng khách" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth />
            </div>
          </div>

          <div className="p-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
            <Button variant="outline" size="sm" onClick={() => setStep('select')}>Quay lại</Button>
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
        <div className="flex flex-col h-[80vh]">
          <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-48">
                <Select
                  value={picker.selectedBrandId ?? ''}
                  options={picker.brandOptions}
                  onChange={(e) => {
                    picker.setSelectedBrandId(e.target.value ? Number(e.target.value) : null);
                    picker.setSelectedSeriesId(null);
                  }}
                  className="h-8 text-xs font-semibold"
                  placeholder="Chọn hãng..."
                />
              </div>

              <div className="w-48">
                <Select
                  value={picker.selectedSeriesId ?? ''}
                  options={picker.seriesOptions}
                  onChange={(e) => picker.setSelectedSeriesId(e.target.value ? Number(e.target.value) : null)}
                  className="h-8 text-xs"
                  placeholder="Tất cả hệ nhôm"
                />
              </div>

              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm mã hoặc tên cửa..."
                  value={picker.search}
                  onChange={(e) => picker.setSearch(e.target.value)}
                  className="h-8 pl-8 pr-3 border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-none focus:border-primary w-48"
                />
              </div>
            </div>
          </div>

          <div className="px-3 py-2 border-b border-slate-200 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {DOOR_TYPE_FILTERS.map((type) => {
              const isSelected = picker.selectedType === type.value;
              return (
                <button
                  key={type.value ?? 'all'}
                  type="button"
                  onClick={() => picker.setSelectedType(type.value)}
                  className={`px-2.5 py-1 text-xs rounded font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected ? 'bg-primary text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/40">
            {picker.isLoadingDoors ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Đang tải danh mục mẫu cửa...</div>
            ) : picker.filteredDoors.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                <Layers size={24} className="text-slate-300" />
                <span>Không tìm thấy mẫu cửa nào phù hợp.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
                {picker.filteredDoors.map((door) => {
                  const sc = (door.systemConfig || {}) as Record<string, unknown>;
                  const hasSvg = Boolean(sc.rootCell);
                  const typeConfig = getDoorTypeConfig(door.type);

                  return (
                    <div
                      key={door.id}
                      onClick={() => handlePickDoor(door)}
                      className="group bg-white rounded-lg border border-slate-200/80 hover:border-primary hover:shadow-md transition-all p-2.5 flex flex-col justify-between cursor-pointer"
                    >
                      <div className="aspect-[4/3] w-full bg-slate-50/80 rounded flex items-center justify-center overflow-hidden relative mb-2 border border-slate-100/70">
                        {hasSvg ? (
                          <div className="w-full h-full p-1.5 group-hover:scale-105 transition-transform duration-300 pointer-events-none">
                            <DoorThumbnail door={door} hideDimensions className="w-full h-full" />
                          </div>
                        ) : door.imagePath ? (
                          <img
                            src={door.imagePath.startsWith('http') ? door.imagePath : `${BASE_MINIO_URL}/${door.imagePath.replace(/^\//, '')}`}
                            alt={door.name}
                            className="w-full h-full object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-slate-300">
                            <ImageOff size={22} />
                            <span className="text-[10px]">Chưa có bản vẽ</span>
                          </div>
                        )}
                        <span className={`absolute top-1.5 right-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded shadow-2xs backdrop-blur-xs border ${typeConfig.className}`}>
                          {typeConfig.label}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-800 truncate" title={door.code || `#${door.id}`}>{door.code || `#${door.id}`}</div>
                        <p className="text-[11px] text-slate-600 truncate font-medium group-hover:text-primary transition-colors" title={door.name}>{door.name}</p>
                        <div className="pt-1.5 flex items-center justify-between border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                          <span>{Number(sc.w) || 1200} x {Number(sc.h) || 2200} mm</span>
                          <span className="text-primary font-bold inline-flex items-center gap-0.5"><Plus size={10} /> Chọn</span>
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

