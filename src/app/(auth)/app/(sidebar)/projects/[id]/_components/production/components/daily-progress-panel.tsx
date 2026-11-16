'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { ROLE_CODES, usePermission } from '@/hooks';
import { cn } from '@/utils/cn';
import type {
  ProgressMatrixItem,
  ProgressStepCode,
  ProjectDoorPosition,
  ProjectProgressMatrix,
} from '@/types';
import { ProgressUpdateModal } from '../modals/progress-update-modal';
import { RevertProgressModal } from '../modals/revert-progress-modal';
import { useAdvanceProgress } from '../hooks';
import {
  DISPLAY_STEPS_ORDER,
  mapToStandardProgressStep,
  PROGRESS_STEP_LABEL,
  resolveDailyProgressActionState,
  STEP_SECTION_CONFIG,
} from '../utils';
import { DailyProgressActionBar } from './daily-progress-action-bar';
import { DoorProgressCard } from './door-progress-card';

interface DailyProgressPanelProps {
  projectId: number;
  matrix?: ProjectProgressMatrix;
  positions?: ProjectDoorPosition[];
  isLoading: boolean;
}

export function DailyProgressPanel({
  projectId,
  matrix,
  positions = [],
  isLoading,
}: DailyProgressPanelProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isRevertModalOpen, setIsRevertModalOpen] = useState(false);
  const { isAdmin, hasRole } = usePermission();

  const canManageOutsourcedProcurement =
    isAdmin || hasRole([ROLE_CODES.SALE, ROLE_CODES.ACCOUNTANT, ROLE_CODES.TECHNICIAN]);

  const matrixItemMap = useMemo(() => {
    const map = new Map<number, ProgressMatrixItem>();
    matrix?.items?.forEach((item) => map.set(item.positionId, item));
    return map;
  }, [matrix]);

  const getDoorStatus = useCallback(
    (pos: ProjectDoorPosition): string => matrixItemMap.get(pos.id)?.currentStatus || pos.status || 'draft',
    [matrixItemMap],
  );

  const advance = useAdvanceProgress(projectId, () => setSelectedIds([]));

  const groupedDoors = useMemo(() => {
    const groups = new Map<string, ProjectDoorPosition[]>();
    positions.forEach((pos) => {
      const status = mapToStandardProgressStep(getDoorStatus(pos));
      const list = groups.get(status) ?? [];
      list.push(pos);
      groups.set(status, list);
    });
    return groups;
  }, [positions, getDoorStatus]);

  const selectedStep = useMemo<ProgressStepCode | null>(() => {
    if (selectedIds.length === 0) return null;
    const first = positions.find((p) => p.id === selectedIds[0]);
    return first ? mapToStandardProgressStep(getDoorStatus(first)) : null;
  }, [selectedIds, positions, getDoorStatus]);

  const selectedPositions = useMemo(
    () => positions.filter((p) => selectedIds.includes(p.id)),
    [positions, selectedIds],
  );

  const actionState = useMemo(
    () =>
      resolveDailyProgressActionState(
        selectedStep,
        selectedPositions,
        canManageOutsourcedProcurement,
      ),
    [selectedStep, selectedPositions, canManageOutsourcedProcurement],
  );

  const toggleSelect = (id: number) => {
    const clickedDoor = positions.find((p) => p.id === id);
    if (!clickedDoor) return;
    const clickedStep = mapToStandardProgressStep(getDoorStatus(clickedDoor));
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (selectedStep && selectedStep !== clickedStep) return [id];
      return [...prev, id];
    });
  };

  const handleSelectAllInStep = (stepDoors: ProjectDoorPosition[]) => {
    const stepDoorIds = stepDoors.map((d) => d.id);
    const isAllSelected = stepDoorIds.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      isAllSelected ? prev.filter((id) => !stepDoorIds.includes(id)) : Array.from(new Set(stepDoorIds)),
    );
  };

  const handleSelectOutsourcedSurveyed = (stepDoors: ProjectDoorPosition[]) => {
    const outsourcedIds = stepDoors
      .filter((d) => d.fulfillmentType === 'outsourced')
      .map((d) => d.id);
    if (outsourcedIds.length === 0) return;
    const isAllSelected = outsourcedIds.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      isAllSelected ? prev.filter((id) => !outsourcedIds.includes(id)) : outsourcedIds,
    );
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-slate-400">Đang tải dữ liệu tiến độ...</div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate-400">
        Dự án chưa có vị trí cửa nào để theo dõi tiến độ.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {DISPLAY_STEPS_ORDER.map((stepKey) => {
        const stepDoors = groupedDoors.get(stepKey) || [];
        const hasDoors = stepDoors.length > 0;
        const config = STEP_SECTION_CONFIG[stepKey] || {
          label: PROGRESS_STEP_LABEL[stepKey as ProgressStepCode] || stepKey,
          badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
        };
        const totalArea = stepDoors.reduce((acc, cur) => acc + (cur.areaM2 || 0), 0);
        const isAllSelectedInGroup =
          hasDoors && stepDoors.every((d) => selectedIds.includes(d.id));
        const outsourcedInStep =
          stepKey === 'surveyed'
            ? stepDoors.filter((d) => d.fulfillmentType === 'outsourced')
            : [];

        return (
          <div key={stepKey} className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={cn(
                  'rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wider',
                  config.badgeClass,
                )}
              >
                {config.label}
              </span>
              <div className="h-px flex-1 bg-slate-200" />
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[11px] text-slate-400">
                  {hasDoors ? `${stepDoors.length} mẫu · ${totalArea.toFixed(1)} m²` : '0 mẫu'}
                </span>
                {outsourcedInStep.length > 0 && canManageOutsourcedProcurement && (
                  <button
                    type="button"
                    onClick={() => handleSelectOutsourcedSurveyed(stepDoors)}
                    className="cursor-pointer rounded-md border border-primary/25 bg-primary/5 px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/10"
                  >
                    Chọn nhanh cửa NCC ({outsourcedInStep.length})
                  </button>
                )}
                {hasDoors && stepKey !== 'accepted' && (
                  <button
                    type="button"
                    onClick={() => handleSelectAllInStep(stepDoors)}
                    className="cursor-pointer text-[11px] font-semibold text-primary hover:underline"
                  >
                    {isAllSelectedInGroup ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                )}
              </div>
            </div>

            {hasDoors ? (
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {stepDoors.map((door) => (
                  <DoorProgressCard
                    key={door.id}
                    position={door}
                    matrixItem={matrixItemMap.get(door.id)}
                    isSelected={selectedIds.includes(door.id)}
                    onToggle={toggleSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 py-4 text-center text-xs text-slate-400">
                Không có cửa nào trong giai đoạn này
              </div>
            )}
          </div>
        );
      })}

      {selectedIds.length > 0 && selectedStep && (
        <DailyProgressActionBar
          selectedCount={selectedIds.length}
          selectedStep={selectedStep}
          nextStep={actionState.nextStep}
          isOutsourcedOnly={actionState.isOutsourcedOnly}
          blockedHint={actionState.blockedHint}
          hideAdvanceButton={actionState.hideAdvanceButton}
          isPending={advance.isPending}
          isAdmin={isAdmin}
          onAdvance={() => {
            if (!actionState.nextStep || advance.isPending) return;
            advance.mutate({ positionIds: selectedIds, targetStep: actionState.nextStep });
          }}
          onOpenRevert={() => setIsRevertModalOpen(true)}
          onClear={() => setSelectedIds([])}
        />
      )}

      <RevertProgressModal
        projectId={projectId}
        isOpen={isRevertModalOpen}
        onClose={() => setIsRevertModalOpen(false)}
        selectedPositions={selectedPositions}
        currentStep={selectedStep ?? undefined}
        onSuccess={() => setSelectedIds([])}
      />

      <ProgressUpdateModal
        projectId={projectId}
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        selectedPositions={selectedPositions}
        currentStep={selectedStep ?? undefined}
        onSuccess={() => setSelectedIds([])}
      />
    </div>
  );
}
