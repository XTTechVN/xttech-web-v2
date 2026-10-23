'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { bulkCreateProjectPositions, createProjectPosition } from '@/actions';
import { Modal } from '@/components';
import type { Door, ProjectDoorPosition, ProjectFloor } from '@/types';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import { TemplateDoorCatalogGrid } from './components/template-door-catalog-grid';
import { TemplateDoorFilterBar } from './components/template-door-filter-bar';
import {
  normalizeBulkBaseCode,
  TemplateDoorInfoStep,
} from './components/template-door-info-step';
import { useTemplateDoorPicker } from './hooks/use-template-door-picker';

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
  const [width, setWidth] = useState<number>(1200);
  const [height, setHeight] = useState<number>(2200);
  const [quantity, setQuantity] = useState<number>(1);

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
    setQuantity(1);
    onClose();
  };

  const { mutate: createPositionMutate, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      if (!selectedDoor || !projectId) throw new Error('Thiếu thông tin mẫu cửa hoặc dự án');
      const rawConfig = (selectedDoor.systemConfig || {}) as Record<string, unknown>;
      const validWidth = Number(width) > 0 ? Number(width) : Number(rawConfig.w) || 1200;
      const validHeight = Number(height) > 0 ? Number(height) : Number(rawConfig.h) || 2200;
      const validQty = Math.max(1, Math.min(100, Math.floor(Number(quantity) || 1)));

      const clonedConfig: Record<string, unknown> = {
        ...structuredClone(rawConfig),
        w: validWidth,
        h: validHeight,
        width: validWidth,
        height: validHeight,
      };

      if (validQty === 1) {
        const created = await createProjectPosition(projectId, {
          projectId,
          code: newCode.trim(),
          floorId: targetFloorId ? Number(targetFloorId) : undefined,
          templateDoorId: selectedDoor.id,
          description: description.trim() || selectedDoor.name,
          doorType: selectedDoor.type || 'door',
          width: validWidth,
          height: validHeight,
          brandId: selectedDoor.doorSeries?.brandId || undefined,
          doorSeriesId: selectedDoor.doorSeriesId || undefined,
          systemConfig: clonedConfig,
        });
        return [created];
      }

      return bulkCreateProjectPositions(projectId, {
        projectId,
        baseCode: normalizeBulkBaseCode(newCode),
        quantity: validQty,
        floorId: targetFloorId ? Number(targetFloorId) : undefined,
        templateDoorId: selectedDoor.id,
        description: description.trim() || selectedDoor.name,
        doorType: selectedDoor.type || 'door',
        width: validWidth,
        height: validHeight,
        brandId: selectedDoor.doorSeries?.brandId || undefined,
        doorSeriesId: selectedDoor.doorSeriesId || undefined,
        systemConfig: clonedConfig,
      });
    },
    onSuccess: (createdList) => {
      queryClient.invalidateQueries({ queryKey: ['project_positions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (createdList.length === 1) {
        toast.success(`Đã thêm cửa ${createdList[0].code} vào dự án`);
      } else {
        toast.success(`Đã thêm hàng loạt ${createdList.length} bộ cửa vào dự án`);
      }
      handleClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi thêm cửa vào dự án'),
  });

  const handlePickDoor = (door: Door) => {
    const sc = (door.systemConfig || {}) as Record<string, unknown>;
    const defaultW = Number(sc.w) || Number(sc.width) || 1200;
    const defaultH = Number(sc.h) || Number(sc.height) || 2200;
    if (projectId) {
      setSelectedDoor(door);
      setNewCode('');
      setDescription(door.name || '');
      setWidth(defaultW);
      setHeight(defaultH);
      setQuantity(1);
      setTargetFloorId(typeof selectedFloorId === 'number' ? selectedFloorId : floors?.[0]?.id || 0);
      setStep('info');
    } else if (onSelectDoor) {
      onSelectDoor(door, defaultW, defaultH);
      handleClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'select' ? 'Chọn mẫu cửa' : 'Thông tin cửa mới'}
      size={step === 'select' ? 'xl' : 'md'}
      className={
        step === 'select'
          ? 'md:max-w-6xl xl:max-w-7xl md:w-[94vw] p-0 overflow-hidden'
          : 'max-w-lg w-full p-0 overflow-hidden'
      }
    >
      {step === 'info' ? (
        <TemplateDoorInfoStep
          selectedDoor={selectedDoor}
          newCode={newCode}
          onChangeCode={setNewCode}
          targetFloorId={targetFloorId}
          onChangeFloorId={setTargetFloorId}
          floors={floors}
          width={width}
          onChangeWidth={setWidth}
          height={height}
          onChangeHeight={setHeight}
          quantity={quantity}
          onChangeQuantity={setQuantity}
          description={description}
          onChangeDescription={setDescription}
          isSubmitting={isSubmitting}
          onBack={() => setStep('select')}
          onSubmit={() => createPositionMutate()}
        />
      ) : (
        <div className="flex flex-col h-[82vh]">
          <TemplateDoorFilterBar
            brandsList={picker.brandsList}
            selectedBrandId={picker.selectedBrandId}
            onSelectBrand={picker.setSelectedBrandId}
            seriesList={picker.seriesList}
            selectedSeriesId={picker.selectedSeriesId}
            onSelectSeries={picker.setSelectedSeriesId}
            effectiveSeriesId={picker.effectiveSeriesId}
            groupBySeries={picker.groupBySeries}
            onToggleGroupBySeries={picker.setGroupBySeries}
            selectedType={picker.selectedType}
            onSelectType={picker.setSelectedType}
            typeCounts={picker.typeCounts}
            search={picker.search}
            onChangeSearch={picker.setSearch}
          />

          <div className="flex-1 overflow-y-auto p-5 bg-slate-50/40">
            <TemplateDoorCatalogGrid
              isLoading={picker.isLoadingDoors}
              filteredDoors={picker.filteredDoors}
              groupedDoors={picker.groupedDoors}
              groupBySeries={picker.groupBySeries}
              onSelectDoor={handlePickDoor}
            />
          </div>

          <div className="px-4 py-2.5 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
            <span>{picker.filteredDoors.length} mẫu · Click để chọn và cấu hình</span>
          </div>
        </div>
      )}
    </Modal>
  );
}
