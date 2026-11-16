'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getProjectFloors,
  createProjectFloor,
  deleteProjectFloor,
  getProjectPositions,
  createProjectPosition,
  updateProjectPosition,
  deleteProjectPosition,
  duplicateProjectPosition,
  measureProjectPosition,
} from '@/actions';
import type {
  Door,
  ProjectDoorPosition,
  MeasurePositionResponse,
  ProjectDoorPositionUpdate,
} from '@/types';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import {
  generateNextPositionCode,
  type PositionDrawInitPayload,
} from '../modals/position-draw-init-modal';

export function useProjectPositions(projectId: number) {
  const [selectedFloorId, setSelectedFloorId] = useState<number | 'all'>('all');
  const [isDrawInitOpen, setIsDrawInitOpen] = useState(false);
  const [pendingDrawInit, setPendingDrawInit] = useState<PositionDrawInitPayload | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioInitialTab, setStudioInitialTab] = useState<'info' | 'draw'>('info');
  const [studioDoor, setStudioDoor] = useState<Door | null>(null);
  const [editingStudioPosition, setEditingStudioPosition] = useState<ProjectDoorPosition | null>(null);
  const [studioTemplateDoorId, setStudioTemplateDoorId] = useState<number | null>(null);
  const [studioTemplateDoorName, setStudioTemplateDoorName] = useState<string | null>(null);
  const [isReplaceTemplatePickerOpen, setIsReplaceTemplatePickerOpen] = useState(false);

  const { data: floors = [], isLoading: isLoadingFloors } = useQuery({
    queryKey: ['project_floors', projectId],
    queryFn: () => getProjectFloors(projectId),
    enabled: Boolean(projectId),
  });

  const { data: positionsData, isLoading: isLoadingPositions } = useQuery({
    queryKey: ['project_positions', projectId],
    queryFn: () => getProjectPositions(projectId, { limit: 9999 }),
    enabled: Boolean(projectId),
  });

  const allPositions = useMemo(() => positionsData?.items || [], [positionsData]);

  // O(N) Map tính số lượng cửa theo từng tầng thay vì filter O(N*M) trong vòng lặp render
  const floorCountsMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const pos of allPositions) {
      if (pos.floorId != null) {
        map.set(pos.floorId, (map.get(pos.floorId) ?? 0) + 1);
      }
    }
    return map;
  }, [allPositions]);

  const positions = useMemo(() => {
    if (selectedFloorId === 'all') return allPositions;
    return allPositions.filter((pos) => pos.floorId === selectedFloorId);
  }, [allPositions, selectedFloorId]);

  const currentFloorName = useMemo(() => {
    if (selectedFloorId === 'all') return 'Tất cả các tầng';
    return floors.find((f) => f.id === selectedFloorId)?.name || 'Tầng đã chọn';
  }, [floors, selectedFloorId]);

  const invalidatePositionsAndProject = () => {
    queryClient.invalidateQueries({ queryKey: ['project_positions', projectId] });
    queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['project_overview', projectId] });
    queryClient.invalidateQueries({ queryKey: ['project_quotation_active', projectId] });
    queryClient.invalidateQueries({ queryKey: ['project_quotation_sheet', projectId] });
    queryClient.invalidateQueries({ queryKey: ['project_quotations', projectId] });
    queryClient.invalidateQueries({ queryKey: ['progress_matrix', projectId] });
    queryClient.invalidateQueries({ queryKey: ['design_options', projectId] });
  };

  const createFloorMutation = useMutation({
    mutationFn: (name: string) => createProjectFloor(projectId, { name: name.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_floors', projectId] });
      toast.success('Thêm tầng thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi thêm tầng'),
  });

  const deleteFloorMutation = useMutation({
    mutationFn: (floorId: number) => deleteProjectFloor(projectId, floorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_floors', projectId] });
      toast.success('Xóa tầng thành công');
      if (selectedFloorId !== 'all') setSelectedFloorId('all');
    },
    onError: (err) => showErrorToast(err, 'Không thể xóa tầng (có thể đang có cửa)'),
  });

  const duplicatePositionMutation = useMutation({
    mutationFn: (pos: ProjectDoorPosition) => duplicateProjectPosition(projectId, pos.id),
    onSuccess: (newPos) => {
      invalidatePositionsAndProject();
      toast.success(`Đã nhân bản vị trí cửa (${newPos.code})`);
    },
    onError: (err) => showErrorToast(err, 'Lỗi nhân bản'),
  });

  const deletePositionMutation = useMutation({
    mutationFn: (posId: number) => deleteProjectPosition(projectId, posId),
    onSuccess: () => {
      invalidatePositionsAndProject();
      toast.success('Xóa vị trí cửa thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi xóa vị trí cửa'),
  });

  const updatePositionMutation = useMutation({
    mutationFn: ({ posId, data }: { posId: number; data: ProjectDoorPositionUpdate }) =>
      updateProjectPosition(projectId, posId, data),
    onSuccess: () => {
      invalidatePositionsAndProject();
      toast.success('Cập nhật thông tin cửa thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi cập nhật thông tin cửa'),
  });

  const measurePositionMutation = useMutation({
    mutationFn: ({
      posId,
      width,
      height,
      measureNote,
    }: {
      posId: number;
      width: number;
      height: number;
      measureNote?: string;
    }) =>
      measureProjectPosition(projectId, posId, {
        width,
        height,
        measureNote,
      }),
    onSuccess: (res: MeasurePositionResponse) => {
      invalidatePositionsAndProject();
      queryClient.invalidateQueries({ queryKey: ['progress_matrix', projectId] });
      if (res.toleranceExceeded && res.warningMessage) {
        toast.error('Dung sai vượt ngưỡng hợp đồng!', { duration: 5000 });
      } else {
        toast.success('Đã lưu số đo thực tế');
      }
    },
    onError: (err) => showErrorToast(err, 'Lỗi lưu kích thước đo đạc'),
  });

  const handleConfirmDrawInit = (payload: PositionDrawInitPayload) => {
    setIsDrawInitOpen(false);
    setEditingStudioPosition(null);
    setPendingDrawInit(payload);
    setStudioTemplateDoorId(null);
    setStudioTemplateDoorName(null);
    setStudioInitialTab('draw');
    setStudioDoor({
      id: 0,
      name: payload.description || payload.code,
      code: payload.code,
      type: payload.doorType || 'casement_door',
      doorSeriesId: payload.doorSeriesId,
      doorSeries: payload.doorSeries,
      imagePath: null,
      specification: `${payload.width}×${payload.height}mm`,
      systemConfig: {
        w: payload.width,
        h: payload.height,
        width: payload.width,
        height: payload.height,
        brandId: payload.brandId,
        seriesId: payload.doorSeriesId,
        ...(payload.aluminumColor ? { aluminumColor: payload.aluminumColor } : {}),
      },
      createdAt: '',
      updatedAt: '',
    });
    setIsStudioOpen(true);
  };

  const handleOpenStudioForPosition = (pos: ProjectDoorPosition) => {
    setPendingDrawInit(null);
    setEditingStudioPosition(pos);
    setStudioInitialTab(pos.fulfillmentType === 'outsourced' ? 'draw' : 'info');
    setStudioTemplateDoorId(pos.templateDoorId ?? pos.templateDoor?.id ?? null);
    setStudioTemplateDoorName(pos.templateDoor?.name || pos.description || pos.code);
    const sc = (pos.systemConfig || {}) as Record<string, unknown>;
    setStudioDoor({
      id: pos.id,
      name: pos.description || pos.code,
      code: pos.code,
      type: pos.doorType || 'door',
      doorSeriesId: pos.doorSeriesId || undefined,
      imagePath: null,
      specification: `${pos.width}×${pos.height}mm`,
      systemConfig: { ...sc, w: pos.width, h: pos.height },
      createdAt: '',
      updatedAt: '',
    });
    setIsStudioOpen(true);
  };

  const handleCloseStudio = () => {
    setIsStudioOpen(false);
    setStudioDoor(null);
    setEditingStudioPosition(null);
    setPendingDrawInit(null);
    setStudioTemplateDoorId(null);
    setStudioTemplateDoorName(null);
  };

  const handleSwitchStudioTemplateDoor = (pickedDoor: Door, defaultW?: number, defaultH?: number) => {
    if (!editingStudioPosition && !pendingDrawInit) return;
    const rawSc = (pickedDoor.systemConfig || {}) as Record<string, unknown>;
    const fallbackW = editingStudioPosition?.width || pendingDrawInit?.width || 1200;
    const fallbackH = editingStudioPosition?.height || pendingDrawInit?.height || 2200;
    const nextW = editingStudioPosition?.isMeasured
      ? editingStudioPosition.width
      : defaultW || Number(rawSc.w) || Number(rawSc.width) || fallbackW;
    const nextH = editingStudioPosition?.isMeasured
      ? editingStudioPosition.height
      : defaultH || Number(rawSc.h) || Number(rawSc.height) || fallbackH;
    const currentCode =
      editingStudioPosition?.code ||
      studioDoor?.code ||
      pendingDrawInit?.code ||
      generateNextPositionCode(allPositions);

    setStudioTemplateDoorId(pickedDoor.id);
    setStudioTemplateDoorName(pickedDoor.name);
    setStudioDoor({
      id: editingStudioPosition?.id || 0,
      name: pickedDoor.name || editingStudioPosition?.description || pendingDrawInit?.description || currentCode,
      code: currentCode,
      type: pickedDoor.type || editingStudioPosition?.doorType || pendingDrawInit?.doorType || 'door',
      doorSeriesId: pickedDoor.doorSeriesId || editingStudioPosition?.doorSeriesId || pendingDrawInit?.doorSeriesId || undefined,
      doorSeries: pickedDoor.doorSeries || pendingDrawInit?.doorSeries,
      imagePath: pickedDoor.imagePath || null,
      specification: `${nextW}×${nextH}mm`,
      systemConfig: { ...structuredClone(rawSc), w: nextW, h: nextH, width: nextW, height: nextH },
      createdAt: '',
      updatedAt: '',
    });
    toast.success(`Đã áp dụng mẫu cửa: ${pickedDoor.name}`);
  };

  const handleStudioCustomSave = async (saveData: {
    name: string;
    code: string;
    type: string;
    doorSeriesId?: number | null;
    width: number;
    height: number;
    systemConfig: Record<string, unknown>;
  }) => {
    if (editingStudioPosition) {
      const isOutsourced = editingStudioPosition.fulfillmentType === 'outsourced';
      await updateProjectPosition(projectId, editingStudioPosition.id, {
        code: saveData.code.trim() || editingStudioPosition.code,
        width: saveData.width,
        height: saveData.height,
        doorType: saveData.type,
        description: saveData.name,
        templateDoorId: isOutsourced
          ? undefined
          : studioTemplateDoorId ?? editingStudioPosition.templateDoorId ?? undefined,
        doorSeriesId: isOutsourced ? undefined : saveData.doorSeriesId || undefined,
        visualMode: isOutsourced
          ? editingStudioPosition.customImagePath
            ? editingStudioPosition.visualMode
            : 'cad'
          : undefined,
        systemConfig: saveData.systemConfig,
      });
      invalidatePositionsAndProject();
      toast.success(isOutsourced ? 'Đã lưu phác thảo 2D cửa NCC' : 'Đã cập nhật bản vẽ vị trí cửa dự án');
      return;
    }

    const finalCode = saveData.code.trim() || pendingDrawInit?.code || generateNextPositionCode(allPositions);
    const targetFloorId =
      pendingDrawInit?.floorId ?? (typeof selectedFloorId === 'number' ? selectedFloorId : floors[0]?.id);
    const created = await createProjectPosition(projectId, {
      projectId,
      code: finalCode,
      floorId: targetFloorId ? Number(targetFloorId) : undefined,
      templateDoorId: studioTemplateDoorId ?? undefined,
      description: saveData.name.trim() || pendingDrawInit?.description || finalCode,
      doorType: saveData.type || pendingDrawInit?.doorType || 'casement_door',
      width: saveData.width,
      height: saveData.height,
      brandId: pendingDrawInit?.brandId ?? studioDoor?.doorSeries?.brandId ?? undefined,
      doorSeriesId: saveData.doorSeriesId || pendingDrawInit?.doorSeriesId || undefined,
      systemConfig: saveData.systemConfig,
    });
    invalidatePositionsAndProject();
    toast.success(`Đã thêm cửa ${created.code} vào dự án`);
  };

  const hasOutsourcedDoors = useMemo(
    () => allPositions.some((pos) => pos.fulfillmentType === 'outsourced'),
    [allPositions],
  );

  return {
    floors,
    allPositions,
    positions,
    hasOutsourcedDoors,
    floorCountsMap,
    selectedFloorId,
    setSelectedFloorId,
    currentFloorName,
    isLoadingFloors,
    isLoadingPositions,
    createFloorMutation,
    deleteFloorMutation,
    duplicatePositionMutation,
    deletePositionMutation,
    updatePositionMutation,
    measurePositionMutation,
    invalidatePositionsAndProject,
    isDrawInitOpen,
    setIsDrawInitOpen,
    pendingDrawInit,
    isStudioOpen,
    studioInitialTab,
    studioDoor,
    editingStudioPosition,
    studioTemplateDoorName,
    isReplaceTemplatePickerOpen,
    setIsReplaceTemplatePickerOpen,
    handleConfirmDrawInit,
    handleOpenStudioForPosition,
    handleCloseStudio,
    handleSwitchStudioTemplateDoor,
    handleStudioCustomSave,
  };
}

