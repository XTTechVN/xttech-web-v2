'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getProjectFloors,
  createProjectFloor,
  deleteProjectFloor,
  getProjectPositions,
  updateProjectPosition,
  deleteProjectPosition,
  duplicateProjectPosition,
  measureProjectPosition,
} from '@/actions';
import type {
  ProjectDoorPosition,
  MeasurePositionResponse,
  ProjectDoorPositionUpdate,
} from '@/types';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';

export function useProjectPositions(projectId: number) {
  const [selectedFloorId, setSelectedFloorId] = useState<number | 'all'>('all');

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

  return {
    floors,
    allPositions,
    positions,
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
  };
}

