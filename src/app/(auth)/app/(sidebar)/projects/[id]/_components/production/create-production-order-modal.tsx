'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createProductionOrder } from '@/actions';
import { Button, Input, Modal } from '@/components';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import type { ProjectDoorPosition } from '@/types';
import { cn } from '@/utils/cn';

interface CreateProductionOrderModalProps {
  projectId: number;
  isOpen: boolean;
  positions: ProjectDoorPosition[];
  onClose: () => void;
}

const DOOR_TYPE_LABEL: Record<string, string> = { door: 'Cửa đi', window: 'Cửa sổ' };

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

  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: () =>
      createProductionOrder(projectId, {
        name: orderName.trim(),
        positionIds: selectedIds,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
      }),
    onSuccess: (order) => {
      ['production_orders', 'progress_matrix', 'project_positions'].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key, projectId] }),
      );
      toast.success(`Đã lập lệnh sản xuất ${order.code}`);
      setSelectedIds([]);
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi lập lệnh sản xuất'),
  });

  const toggle = (position: ProjectDoorPosition) => {
    if (!position.isMeasured) {
      toast.error(`Bộ cửa ${position.code} chưa chốt số đo thực tế! Không thể đưa vào Lệnh sản xuất.`);
      return;
    }
    setSelectedIds((prev) =>
      prev.includes(position.id) ? prev.filter((id) => id !== position.id) : [...prev, position.id],
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lập Lệnh sản xuất theo đợt thi công" className="w-full max-w-lg">
      <div className="space-y-4">
        <Input label="Tên đợt sản xuất *" value={orderName} onChange={(e) => setOrderName(e.target.value)} fullWidth />
        <div className="grid grid-cols-2 gap-3">
          <Input type="date" label="Ngày bắt đầu" value={startDate} onChange={(e) => setStartDate(e.target.value)} fullWidth />
          <Input type="date" label="Hạn hoàn thành" value={dueDate} onChange={(e) => setDueDate(e.target.value)} fullWidth />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Chọn các bộ cửa đưa vào lệnh ({selectedIds.length} đã chọn) *
            </span>
            <span className="text-[11px] font-medium text-slate-400">(Chỉ chọn cửa đã chốt số đo)</span>
          </div>
          <div className="max-h-56 space-y-1.5 overflow-y-auto rounded-lg border border-slate-200 p-2">
            {positions.map((position) => {
              const isMeasured = !!position.isMeasured;
              const isSelected = selectedIds.includes(position.id);
              return (
                <div
                  key={position.id}
                  onClick={() => toggle(position)}
                  title={isMeasured ? undefined : 'Chưa chốt số đo thực tế - Không thể đưa vào lệnh sản xuất'}
                  className={cn(
                    'flex items-center justify-between rounded border p-2 text-xs transition-colors',
                    !isMeasured && 'cursor-not-allowed select-none border-slate-100 bg-slate-50/70 text-slate-400 opacity-60',
                    isMeasured && !isSelected && 'cursor-pointer border-slate-200/60 text-slate-700 hover:bg-slate-50',
                    isMeasured && isSelected && 'cursor-pointer border-primary/30 bg-primary/10 font-semibold text-primary',
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <input type="checkbox" disabled={!isMeasured} checked={isSelected} onChange={() => undefined} className="rounded text-primary" />
                    <span className="font-bold">{position.code}</span>
                    <span className="truncate">
                      - {position.description || DOOR_TYPE_LABEL[position.doorType] || position.doorType}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={cn(
                        'rounded border px-1.5 py-0.5 text-[10px] font-medium',
                        isMeasured ? 'border-emerald-200/60 bg-emerald-50 text-emerald-600' : 'border-amber-200/60 bg-amber-50 text-amber-600',
                      )}
                    >
                      {isMeasured ? 'Đã chốt số đo' : 'Chờ đo thực tế'}
                    </span>
                    <span className="text-slate-500">{position.width}x{position.height} mm</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>Hủy</Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!orderName.trim() || selectedIds.length === 0 || isPending}
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
