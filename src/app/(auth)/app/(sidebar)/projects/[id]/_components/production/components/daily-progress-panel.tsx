'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components';
import { cn } from '@/utils/cn';
import type {
  ProgressMatrixItem,
  ProgressStepCode,
  ProjectDoorPosition,
  ProjectProgressMatrix,
} from '@/types';
import { ProgressUpdateModal } from '../modals/progress-update-modal';
import {
  DISPLAY_STEPS_ORDER,
  getNextStep,
  PROGRESS_STEP_LABEL,
  STEP_SECTION_CONFIG,
} from '../utils';
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

  const matrixItemMap = useMemo(() => {
    const map = new Map<number, ProgressMatrixItem>();
    matrix?.items?.forEach((item) => map.set(item.positionId, item));
    return map;
  }, [matrix]);

  const getDoorStatus = (pos: ProjectDoorPosition): string => {
    const matrixItem = matrixItemMap.get(pos.id);
    return matrixItem?.currentStatus || pos.status || 'draft';
  };

  const groupedDoors = useMemo(() => {
    const groups = new Map<string, ProjectDoorPosition[]>();
    positions.forEach((pos) => {
      const status = getDoorStatus(pos);
      const list = groups.get(status) ?? [];
      list.push(pos);
      groups.set(status, list);
    });
    return groups;
  }, [positions, matrixItemMap]);

  const selectedStep = useMemo(() => {
    if (selectedIds.length === 0) return null;
    const firstSelected = positions.find((p) => p.id === selectedIds[0]);
    return firstSelected ? (getDoorStatus(firstSelected) as ProgressStepCode) : null;
  }, [selectedIds, positions, matrixItemMap]);

  const toggleSelect = (id: number) => {
    const clickedDoor = positions.find((p) => p.id === id);
    if (!clickedDoor) return;

    const clickedStep = getDoorStatus(clickedDoor);

    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (selectedStep && selectedStep !== clickedStep) {
        return [id];
      }
      return [...prev, id];
    });
  };

  const handleSelectAllInStep = (stepDoors: ProjectDoorPosition[]) => {
    const stepDoorIds = stepDoors.map((d) => d.id);
    const isAllSelected = stepDoorIds.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) => {
      if (isAllSelected) {
        return prev.filter((id) => !stepDoorIds.includes(id));
      }
      return Array.from(new Set([...stepDoorIds]));
    });
  };

  const selectedPositions = useMemo(
    () => positions.filter((p) => selectedIds.includes(p.id)),
    [positions, selectedIds],
  );

  const nextStep = selectedStep ? getNextStep(selectedStep) : null;

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
        if (stepDoors.length === 0) return null;

        const config = STEP_SECTION_CONFIG[stepKey] || {
          label: PROGRESS_STEP_LABEL[stepKey as ProgressStepCode] || stepKey,
          badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
        };
        const totalArea = stepDoors.reduce((acc, cur) => acc + (cur.areaM2 || 0), 0);
        const isAllSelectedInGroup =
          stepDoors.length > 0 && stepDoors.every((d) => selectedIds.includes(d.id));

        return (
          <div key={stepKey} className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  'rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wider',
                  config.badgeClass,
                )}
              >
                {config.label}
              </span>
              <div className="h-px flex-1 bg-slate-200" />
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-400">
                  {stepDoors.length} mẫu · {totalArea.toFixed(1)} m²
                </span>
                {stepKey !== 'accepted' && (
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
          </div>
        );
      })}

      {selectedIds.length > 0 && selectedStep && (
        <div className="animate-in fade-in slide-in-from-bottom-3 fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3.5 rounded-xl border border-slate-700/60 bg-slate-900/95 px-4 py-2.5 text-white shadow-xl backdrop-blur-md transition-all duration-200">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs font-medium">
              Đã chọn <b className="text-emerald-400">{selectedIds.length}</b> cửa ở mốc{' '}
              <span className="font-semibold text-slate-200">
                {PROGRESS_STEP_LABEL[selectedStep] || selectedStep}
              </span>
            </span>
          </div>

          {nextStep ? (
            <div className="flex items-center gap-1.5 border-l border-slate-700 pl-3 text-xs text-slate-300">
              <span>Mốc tiếp theo:</span>
              <span className="flex items-center gap-1 font-bold text-emerald-400">
                <ChevronRight size={13} />
                {PROGRESS_STEP_LABEL[nextStep]}
              </span>
            </div>
          ) : (
            <span className="border-l border-slate-700 pl-3 text-[11px] text-amber-300">
              (Đã đạt mốc nghiệm thu cao nhất)
            </span>
          )}

          <div className="flex items-center gap-2 pl-2">
            <Button
              variant="primary"
              size="sm"
              disabled={!nextStep}
              onClick={() => setIsUpdateModalOpen(true)}
              className="gap-1.5 text-xs font-semibold shadow-xs"
            >
              <CheckCircle2 size={14} />
              Cập nhật tiến độ
            </Button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              title="Bỏ chọn"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

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

