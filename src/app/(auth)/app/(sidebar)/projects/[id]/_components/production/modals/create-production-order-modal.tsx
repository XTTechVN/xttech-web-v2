'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createProductionOrder } from '@/actions';
import { Button, Input, Modal } from '@/components';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import type { ProgressStepCode, ProjectDoorPosition } from '@/types';
import {  PROGRESS_STEP_LABEL } from '../utils';
import { ProductionDoorItem } from '../components/production-door-item';


const REWORKABLE_STATUSES = ['factory_done', 'delivering', 'delivered', 'installing', 'installed'];

interface CreateProductionOrderModalProps {
  projectId: number;
  isOpen: boolean;
  positions: ProjectDoorPosition[];
  onClose: () => void;
}

export function CreateProductionOrderModal({
  projectId,
  isOpen,
  positions,
  onClose,
}: CreateProductionOrderModalProps) {
  const [orderName, setOrderName] = useState('Lệnh sản xuất đợt 1');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRework, setIsRework] = useState(false);
  const [reworkReason, setReworkReason] = useState('');

  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: () =>
      createProductionOrder(projectId, {
        name: orderName.trim(),
        positionIds: selectedIds,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        kind: isRework ? 'rework' : 'normal',
        reworkReason: isRework ? reworkReason.trim() : undefined,
      }),
    onSuccess: (order) => {
      [
        'production_orders',
        'progress_matrix',
        'project_positions',
        'project',
        'project_overview',
      ].forEach((key) => queryClient.invalidateQueries({ queryKey: [key, projectId] }));
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(`Đã lập lệnh sản xuất ${order.code}`);
      setSelectedIds([]);
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi lập lệnh sản xuất'),
  });

  // Lệnh thường: cửa đã đo & chờ sản xuất. Lệnh làm lại: cửa đã sản xuất xong nhưng chưa nghiệm thu.
  const isEligible = (position: ProjectDoorPosition): boolean =>
    isRework
      ? REWORKABLE_STATUSES.includes(position.status)
      : !!position.isMeasured && (!position.status || position.status === 'surveyed');

  const toggle = (position: ProjectDoorPosition) => {
    if (isRework) {
      if (!isEligible(position)) {
        toast.error(`Bộ cửa ${position.code} chưa sản xuất xong hoặc đã nghiệm thu nên không thể làm lại.`);
        return;
      }
      setSelectedIds((prev) =>
        prev.includes(position.id) ? prev.filter((id) => id !== position.id) : [...prev, position.id],
      );
      return;
    }
    if (!position.isMeasured) {
      toast.error(
        `Bộ cửa ${position.code} chưa chốt số đo thực tế! Không thể đưa vào Lệnh sản xuất.`,
      );
      return;
    }
    const isSurveyed = !position.status || position.status === 'surveyed';
    if (!isSurveyed) {
      const stepName = PROGRESS_STEP_LABEL[position.status as ProgressStepCode] || position.status;
      toast.error(
        `Bộ cửa ${position.code} hiện ở mốc "${stepName}". Không thể tạo thêm lệnh sản xuất.`,
      );
      return;
    }
    setSelectedIds((prev) =>
      prev.includes(position.id)
        ? prev.filter((id) => id !== position.id)
        : [...prev, position.id],
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lập Lệnh sản xuất theo đợt thi công"
      className="w-full max-w-4xl"
    >
      <div className="space-y-4">
        <Input
          label="Tên đợt sản xuất *"
          value={orderName}
          onChange={(e) => setOrderName(e.target.value)}
          fullWidth
        />
        <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={isRework}
            onChange={(e) => {
              setIsRework(e.target.checked);
              setSelectedIds([]);
            }}
          />
          Lệnh làm lại (cửa lỗi / sai số đã sản xuất xong)
        </label>
        {isRework && (
          <Input
            label="Lý do làm lại *"
            value={reworkReason}
            onChange={(e) => setReworkReason(e.target.value)}
            fullWidth
          />
        )}
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="date"
            label="Ngày bắt đầu"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
          />
          <Input
            type="date"
            label="Hạn hoàn thành"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            fullWidth
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800">
                Chọn các bộ cửa đưa vào lệnh
              </span>
              <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {selectedIds.length} đã chọn
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              {isRework
                ? '(Chỉ chọn cửa đã hoàn thành xuất xưởng hoặc đang lắp đặt)'
                : '(Chỉ chọn cửa đã chốt số đo & chờ sản xuất)'}
            </span>
          </div>

          <div className="max-h-[380px] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/40 p-3 space-y-4">
            {positions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Dự án chưa có vị trí cửa nào.
              </div>
            ) : (
              (() => {
                const grouped = positions.reduce((acc, pos) => {
                  const floorName = pos.floor?.name || 'Tầng khác';
                  if (!acc[floorName]) acc[floorName] = [];
                  acc[floorName].push(pos);
                  return acc;
                }, {} as Record<string, typeof positions>);

                return Object.entries(grouped).map(([floorName, floorPositions]) => (
                  <div key={floorName} className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1">
                      {floorName}
                    </h4>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {floorPositions.map((position) => {
                        const isMeasured = Boolean(position.isMeasured);
                        const isSurveyed = !position.status || position.status === 'surveyed';
                        const isAvailable = isEligible(position);
                        const isSelected = selectedIds.includes(position.id);
                        const stepName =
                          PROGRESS_STEP_LABEL[position.status as ProgressStepCode] || position.status;

                        let statusLabel = '';
                        let statusVariant: 'amber' | 'emerald' | 'purple' | 'slate' = 'slate';
                        let tooltip: string | undefined;

                        if (isRework) {
                          statusLabel = isAvailable ? stepName : 'Chưa thể làm lại';
                          statusVariant = isAvailable ? 'purple' : 'slate';
                          tooltip = !isAvailable
                            ? 'Chưa sản xuất xong hoặc đã nghiệm thu - Không thể làm lại'
                            : undefined;
                        } else {
                          if (!isMeasured) {
                            statusLabel = 'Chờ đo thực tế';
                            statusVariant = 'amber';
                            tooltip = 'Chưa chốt số đo thực tế - Không thể đưa vào lệnh sản xuất';
                          } else if (isSurveyed) {
                            statusLabel = 'Chờ sản xuất';
                            statusVariant = 'emerald';
                          } else {
                            statusLabel = stepName;
                            statusVariant = 'purple';
                            tooltip = `Đang ở mốc "${stepName}" - Không thể tạo thêm lệnh sản xuất`;
                          }
                        }

                        return (
                          <ProductionDoorItem
                            key={position.id}
                            position={position}
                            isSelected={isSelected}
                            isAvailable={isAvailable}
                            onToggle={toggle}
                            statusLabel={statusLabel}
                            statusVariant={statusVariant}
                            tooltip={tooltip}
                          />
                        );
                      })}
                    </div>
                  </div>
                ));
              })()
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={
              !orderName.trim() ||
              selectedIds.length === 0 ||
              isPending ||
              (isRework && reworkReason.trim().length < 3)
            }
            loading={isPending}
            onClick={() => createOrder()}
          >
            Tạo Lệnh ({selectedIds.length} bộ)
          </Button>
        </div>
      </div>
    </Modal>
  );
}

