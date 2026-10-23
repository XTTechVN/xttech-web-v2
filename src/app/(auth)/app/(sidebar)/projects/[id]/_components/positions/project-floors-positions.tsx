'use client';

import React, { useState } from 'react';
import { FolderOpen, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateProjectPosition } from '@/actions';
import { Button, DoorStudioModal } from '@/components';
import type { Door, ProjectDoorPosition, ProjectFloor } from '@/types';
import { FloorSidebar } from './components/floor-sidebar';
import { PositionCard } from './components/position-card';
import { useProjectPositions } from './hooks/use-project-positions';
import { ConfirmDeleteModal } from './modals/confirm-delete-modal';
import { FloorCreateModal } from './modals/floor-create-modal';
import { PositionEditModal } from './modals/position-edit-modal';
import { PositionMeasureModal } from './modals/position-measure-modal';
import { PositionQrModal } from './modals/position-qr-modal';
import { TemplateDoorPickerModal } from './template-door-picker-modal';

interface ProjectFloorsPositionsProps {
  projectId: number;
}

export function ProjectFloorsPositions({ projectId }: ProjectFloorsPositionsProps) {
  const {
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
  } = useProjectPositions(projectId);

  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [editingBasicPos, setEditingBasicPos] = useState<ProjectDoorPosition | null>(null);
  const [measuringPos, setMeasuringPos] = useState<ProjectDoorPosition | null>(null);
  const [qrModalPos, setQrModalPos] = useState<ProjectDoorPosition | null>(null);
  const [floorToDelete, setFloorToDelete] = useState<ProjectFloor | null>(null);
  const [positionToDelete, setPositionToDelete] = useState<ProjectDoorPosition | null>(null);

  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioDoor, setStudioDoor] = useState<Door | null>(null);
  const [editingStudioPosition, setEditingStudioPosition] = useState<ProjectDoorPosition | null>(null);

  const handleOpenStudioForPosition = (pos: ProjectDoorPosition) => {
    setEditingStudioPosition(pos);
    const sc = (pos.systemConfig || {}) as Record<string, unknown>;
    const pseudoDoor: Door = {
      id: pos.id,
      name: pos.description || pos.code,
      code: pos.code,
      type: pos.doorType || 'door',
      doorSeriesId: pos.doorSeriesId || undefined,
      imagePath: null,
      specification: `${pos.width}×${pos.height}mm`,
      systemConfig: {
        ...sc,
        w: pos.width,
        h: pos.height,
      },
      createdAt: '',
      updatedAt: '',
    };
    setStudioDoor(pseudoDoor);
    setIsStudioOpen(true);
  };

  const handleStudioCustomSave = async (saveData: {
    name: string;
    code: string;
    type: string;
    doorSeriesId?: number | null;
    width: number;
    height: number;
    systemConfig: Record<string, unknown>;
    imageB64?: string;
  }) => {
    if (!editingStudioPosition) return;
    await updateProjectPosition(projectId, editingStudioPosition.id, {
      width: saveData.width,
      height: saveData.height,
      doorType: saveData.type,
      description: saveData.name,
      doorSeriesId: saveData.doorSeriesId || undefined,
      systemConfig: saveData.systemConfig,
    });
    invalidatePositionsAndProject();
    toast.success('Đã cập nhật bản vẽ vị trí cửa dự án');
  };

  return (
    <div className="flex flex-col md:flex-row items-start gap-4">
      <FloorSidebar
        floors={floors}
        selectedFloorId={selectedFloorId}
        totalCount={allPositions.length}
        floorCountsMap={floorCountsMap}
        isLoading={isLoadingFloors}
        onSelectFloor={setSelectedFloorId}
        onAddFloorClick={() => setIsFloorModalOpen(true)}
        onDeleteFloor={(floor) => setFloorToDelete(floor)}
      />

      <div className="flex-1 w-full bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>{positions.length} vị trí cửa</span>
              <span className="text-xs text-slate-400 font-normal">({currentFloorName})</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => setIsPickerOpen(true)}
              className="h-8 text-xs font-semibold"
            >
              Mẫu cửa
            </Button>
          </div>
        </div>

        {isLoadingPositions ? (
          <div className="py-16 text-center text-xs text-slate-400">Đang tải dữ liệu cửa...</div>
        ) : positions.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 bg-slate-50 text-slate-300 rounded-full">
              <FolderOpen size={36} />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Chưa có vị trí cửa nào trong {currentFloorName.toLowerCase()}.
            </p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => setIsPickerOpen(true)}
              className="text-xs"
            >
              Chọn mẫu cửa ngay
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {positions.map((pos) => (
              <PositionCard
                key={pos.id}
                position={pos}
                isDuplicating={duplicatePositionMutation.isPending}
                onOpenStudio={handleOpenStudioForPosition}
                onEdit={setEditingBasicPos}
                onMeasure={setMeasuringPos}
                onQrCode={setQrModalPos}
                onDuplicate={(p) => duplicatePositionMutation.mutate(p)}
                onDelete={(p) => setPositionToDelete(p)}
              />
            ))}
          </div>
        )}
      </div>

      <TemplateDoorPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        projectId={projectId}
        floors={floors}
        selectedFloorId={selectedFloorId}
        existingPositions={allPositions}
      />

      <PositionEditModal
        position={editingBasicPos}
        floors={floors}
        isSubmitting={updatePositionMutation.isPending}
        onClose={() => setEditingBasicPos(null)}
        onSubmit={(posId, data) =>
          updatePositionMutation.mutate({ posId, data }, { onSuccess: () => setEditingBasicPos(null) })
        }
      />

      <FloorCreateModal
        isOpen={isFloorModalOpen}
        isSubmitting={createFloorMutation.isPending}
        onClose={() => setIsFloorModalOpen(false)}
        onSubmit={(name) =>
          createFloorMutation.mutate(name, { onSuccess: () => setIsFloorModalOpen(false) })
        }
      />

      <PositionMeasureModal
        position={measuringPos}
        isSubmitting={measurePositionMutation.isPending}
        onClose={() => setMeasuringPos(null)}
        onMeasure={(payload, onSuccess) => measurePositionMutation.mutate(payload, { onSuccess })}
      />

      <PositionQrModal position={qrModalPos} onClose={() => setQrModalPos(null)} />

      <ConfirmDeleteModal
        isOpen={Boolean(floorToDelete)}
        title="Xác nhận xóa tầng"
        description={
          <>
            Bạn có chắc chắn muốn xóa tầng{' '}
            <strong className="text-slate-900 font-semibold">{floorToDelete?.name}</strong>?
          </>
        }
        isPending={deleteFloorMutation.isPending}
        onClose={() => setFloorToDelete(null)}
        onConfirm={() => {
          if (floorToDelete) {
            deleteFloorMutation.mutate(floorToDelete.id, {
              onSettled: () => setFloorToDelete(null),
            });
          }
        }}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(positionToDelete)}
        title="Xác nhận xóa vị trí cửa"
        description={
          <>
            Bạn có chắc chắn muốn xóa vị trí cửa{' '}
            <strong className="text-slate-900 font-semibold">{positionToDelete?.code}</strong>
            {positionToDelete?.description ? ` (${positionToDelete.description})` : ''}?
          </>
        }
        isPending={deletePositionMutation.isPending}
        onClose={() => setPositionToDelete(null)}
        onConfirm={() => {
          if (positionToDelete) {
            deletePositionMutation.mutate(positionToDelete.id, {
              onSettled: () => setPositionToDelete(null),
            });
          }
        }}
      />

      <DoorStudioModal
        isOpen={isStudioOpen}
        onClose={() => {
          setIsStudioOpen(false);
          setStudioDoor(null);
          setEditingStudioPosition(null);
        }}
        door={studioDoor}
        onCustomSave={handleStudioCustomSave}
      />
    </div>
  );
}
