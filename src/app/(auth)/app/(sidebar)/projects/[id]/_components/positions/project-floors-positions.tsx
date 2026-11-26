'use client';

import React, { useState } from 'react';
import { FolderOpen, PenTool, Plus, Store } from 'lucide-react';
import { Button, DoorStudioModal } from '@/components';
import type { ProjectDoorPosition, ProjectFloor } from '@/types';
import { SupplierQuoteUpdateModal } from '../shared';
import { FloorSidebar } from './components/floor-sidebar';
import { PositionCard } from './components/position-card';
import { PositionsHeaderBar } from './components/positions-header-bar';
import { useProjectPositions } from './hooks/use-project-positions';
import { ConfirmDeleteModal } from './modals/confirm-delete-modal';
import { FloorCreateModal } from './modals/floor-create-modal';
import { OutsourcedRfqModal } from './modals/outsourced-rfq-modal';
import { PositionDrawInitModal } from './modals/position-draw-init-modal';
import { PositionEditModal } from './modals/position-edit-modal';
import { PositionMeasureModal } from './modals/position-measure-modal';
import { PositionQrModal } from './modals/position-qr-modal';
import { SupplierDoorPickerModal } from './modals/supplier-door-picker-modal';
import { TemplateDoorPickerModal } from './template-door-picker-modal';

interface ProjectFloorsPositionsProps {
  projectId: number;
}

export function ProjectFloorsPositions({ projectId }: ProjectFloorsPositionsProps) {
  const {
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
  } = useProjectPositions(projectId);

  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSupplierPickerOpen, setIsSupplierPickerOpen] = useState(false);
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [quoteModalPos, setQuoteModalPos] = useState<ProjectDoorPosition | null>(null);
  const [editingBasicPos, setEditingBasicPos] = useState<ProjectDoorPosition | null>(null);
  const [measuringPos, setMeasuringPos] = useState<ProjectDoorPosition | null>(null);
  const [qrModalPos, setQrModalPos] = useState<ProjectDoorPosition | null>(null);
  const [floorToDelete, setFloorToDelete] = useState<ProjectFloor | null>(null);
  const [positionToDelete, setPositionToDelete] = useState<ProjectDoorPosition | null>(null);

  const isStudioSketchMode = editingStudioPosition?.fulfillmentType === 'outsourced';
  const studioBrandId =
    editingStudioPosition?.brandId ?? pendingDrawInit?.brandId ?? studioDoor?.doorSeries?.brandId ?? null;
  const studioSeriesId =
    studioDoor?.doorSeriesId ?? editingStudioPosition?.doorSeriesId ?? pendingDrawInit?.doorSeriesId ?? null;

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
        <PositionsHeaderBar
          positionsCount={positions.length}
          currentFloorName={currentFloorName}
          hasOutsourcedDoors={hasOutsourcedDoors}
          onOpenDrawInit={() => setIsDrawInitOpen(true)}
          onOpenTemplatePicker={() => setIsPickerOpen(true)}
          onOpenSupplierPicker={() => setIsSupplierPickerOpen(true)}
          onOpenRfqModal={() => setIsRfqModalOpen(true)}
        />

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
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Store size={14} />}
                onClick={() => setIsSupplierPickerOpen(true)}
                className="text-xs font-semibold border-primary/30 text-primary hover:bg-primary/5"
              >
                Thêm cửa NCC
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<PenTool size={14} />}
                onClick={() => setIsDrawInitOpen(true)}
                className="text-xs font-semibold border-primary/30 text-primary hover:bg-primary/5"
              >
                Vẽ cửa mới
              </Button>
              <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setIsPickerOpen(true)} className="text-xs">
                Chọn mẫu cửa ngay
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {positions.map((pos) => (
              <PositionCard
                key={pos.id}
                position={pos}
                isDuplicating={duplicatePositionMutation.isPending}
                onOpenStudio={handleOpenStudioForPosition}
                onOpenSupplierQuote={setQuoteModalPos}
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

      <PositionDrawInitModal
        isOpen={isDrawInitOpen}
        onClose={() => setIsDrawInitOpen(false)}
        projectId={projectId}
        floors={floors}
        selectedFloorId={selectedFloorId}
        existingPositions={allPositions}
        onConfirm={handleConfirmDrawInit}
      />

      <TemplateDoorPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        projectId={projectId}
        floors={floors}
        selectedFloorId={selectedFloorId}
        existingPositions={allPositions}
      />

      <SupplierDoorPickerModal
        isOpen={isSupplierPickerOpen}
        onClose={() => setIsSupplierPickerOpen(false)}
        projectId={projectId}
        floors={floors}
        selectedFloorId={selectedFloorId}
        existingPositions={allPositions}
        onOpenSketchAfterCreate={handleOpenStudioForPosition}
      />

      <OutsourcedRfqModal
        isOpen={isRfqModalOpen}
        onClose={() => setIsRfqModalOpen(false)}
        projectId={projectId}
        positions={allPositions}
      />

      <SupplierQuoteUpdateModal
        isOpen={Boolean(quoteModalPos)}
        onClose={() => setQuoteModalPos(null)}
        projectId={projectId}
        position={quoteModalPos}
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
        onSubmit={(name) => createFloorMutation.mutate(name, { onSuccess: () => setIsFloorModalOpen(false) })}
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
            Bạn có chắc chắn muốn xóa tầng <strong className="text-slate-900 font-semibold">{floorToDelete?.name}</strong>?
          </>
        }
        isPending={deleteFloorMutation.isPending}
        onClose={() => setFloorToDelete(null)}
        onConfirm={() => {
          if (floorToDelete) {
            deleteFloorMutation.mutate(floorToDelete.id, { onSettled: () => setFloorToDelete(null) });
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
            deletePositionMutation.mutate(positionToDelete.id, { onSettled: () => setPositionToDelete(null) });
          }
        }}
      />

      <DoorStudioModal
        isOpen={isStudioOpen}
        onClose={handleCloseStudio}
        door={studioDoor}
        defaultBrandId={studioBrandId}
        initialTab={studioInitialTab}
        sketchMode={isStudioSketchMode}
        templateDoorName={studioTemplateDoorName}
        onOpenTemplatePicker={isStudioSketchMode ? undefined : () => setIsReplaceTemplatePickerOpen(true)}
        onCustomSave={handleStudioCustomSave}
      />

      <TemplateDoorPickerModal
        isOpen={isReplaceTemplatePickerOpen}
        onClose={() => setIsReplaceTemplatePickerOpen(false)}
        projectId={projectId}
        defaultBrandId={studioBrandId}
        defaultSeriesId={studioSeriesId}
        onSelectDoor={handleSwitchStudioTemplateDoor}
      />
    </div>
  );
}
