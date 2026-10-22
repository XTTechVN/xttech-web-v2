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
import { DoorProgressCard } from './door-progress-card';
import { ProgressUpdateModal } from './progress-update-modal';
import {
  PROGRESS_STEP_LABEL,
  PROGRESS_STEP_ORDER,
  getNextStep,
} from './production-labels';

interface DailyProgressPanelProps {
  projectId: number;
  matrix?: ProjectProgressMatrix;
  positions?: ProjectDoorPosition[];
  isLoading: boolean;
}

// Cấu hình hiển thị cho từng mốc tiến độ
const STEP_SECTION_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  producing: {
    label: 'Đang sản xuất',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  factory_done: {
    label: 'Hoàn thành xưởng',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  delivered: {
    label: 'Đã vận chuyển',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  installed: {
    label: 'Đã lắp đặt',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  accepted: {
    label: 'Đã nghiệm thu',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  surveyed: {
    label: 'Chờ sản xuất / Đã đo',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  draft: {
    label: 'Bản vẽ nháp',
    badgeClass: 'bg-slate-50 text-slate-500 border-slate-200',
  },
};

const DISPLAY_STEPS_ORDER: ProgressStepCode[] = [
  'producing',
  'factory_done',
  'delivered',
  'installed',
  'accepted',
  'surveyed',
];

export function DailyProgressPanel({
  projectId,
  matrix,
  positions = [],
  isLoading,
}: DailyProgressPanelProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Tạo map tra cứu matrix item theo positionId
  const matrixItemMap = useMemo(() => {
    const map = new Map<number, ProgressMatrixItem>();
    matrix?.items?.forEach((item) => map.set(item.positionId, item));
    return map;
  }, [matrix]);

  // Chuẩn hóa trạng thái hiện tại của cửa (ưu tiên từ matrix, fallback position status)
  const getDoorStatus = (pos: ProjectDoorPosition): string => {
    const matrixItem = matrixItemMap.get(pos.id);
    return matrixItem?.currentStatus || pos.status || 'draft';
  };

  // Gom nhóm danh sách cửa theo từng mốc tiến độ
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

  // Xác định mốc tiến độ của các cửa đang được chọn
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
      // Nếu đang chọn ở mốc khác thì chuyển sang mốc mới
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
    return <div className="py-12 text-center text-xs text-slate-400">Đang tải dữ liệu tiến độ...</div>;
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
      {/* Danh sách các dòng mốc tiến độ */}
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
            {/* Header dòng tiến độ: Badge + Divider + Số mẫu + Chọn tất cả */}
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  'text-xs font-bold uppercase tracking-wider border rounded-md px-2.5 py-1',
                  config.badgeClass,
                )}
              >
                {config.label}
              </span>
              <div className="flex-1 h-px bg-slate-200" />
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-400">
                  {stepDoors.length} mẫu · {totalArea.toFixed(1)} m²
                </span>
                {stepKey !== 'accepted' && (
                  <button
                    type="button"
                    onClick={() => handleSelectAllInStep(stepDoors)}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    {isAllSelectedInGroup ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                )}
              </div>
            </div>

            {/* Grid các bộ cửa */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
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

      {/* Floating Action Bar khi có cửa được chọn */}
      {selectedIds.length > 0 && selectedStep && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3.5 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-md border border-slate-700/60 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium">
              Đã chọn <b className="text-emerald-400">{selectedIds.length}</b> cửa ở mốc{' '}
              <span className="font-semibold text-slate-200">
                {PROGRESS_STEP_LABEL[selectedStep] || selectedStep}
              </span>
            </span>
          </div>

          {nextStep ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-300 border-l border-slate-700 pl-3">
              <span>Mốc tiếp theo:</span>
              <span className="font-bold text-primary-light flex items-center gap-1 text-emerald-400">
                <ChevronRight size={13} />
                {PROGRESS_STEP_LABEL[nextStep]}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-amber-300 border-l border-slate-700 pl-3">
              (Đã đạt mốc nghiệm thu cao nhất)
            </span>
          )}

          <div className="flex items-center gap-2 pl-2">
            <Button
              variant="primary"
              size="sm"
              disabled={!nextStep}
              onClick={() => setIsUpdateModalOpen(true)}
              className="gap-1.5 font-semibold text-xs shadow-xs"
            >
              <CheckCircle2 size={14} />
              Cập nhật tiến độ
            </Button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Bỏ chọn"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Modal cập nhật tiến độ & nghiệm thu */}
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
