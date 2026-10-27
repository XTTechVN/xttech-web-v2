'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { revertDoorProgress } from '@/actions';
import { Button, Modal, Select, Textarea } from '@/components';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import type { ProgressStepCode, ProjectDoorPosition } from '@/types';
import { FULL_STATUS_ORDER, PROGRESS_STEP_LABEL } from '../utils';

interface RevertProgressModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  selectedPositions: ProjectDoorPosition[];
  currentStep?: ProgressStepCode;
  onSuccess: () => void;
}

/** Admin lùi mốc tiến độ của các cửa đã chọn — bắt buộc nhập lý do, được lưu vào nhật ký tiến độ. */
export function RevertProgressModal(props: RevertProgressModalProps) {
  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} title="Lùi trạng thái tiến độ" className="max-w-md w-full">
      {props.isOpen && props.currentStep && <RevertForm {...props} currentStep={props.currentStep} />}
    </Modal>
  );
}

function RevertForm({
  projectId,
  onClose,
  selectedPositions,
  currentStep,
  onSuccess,
}: RevertProgressModalProps & { currentStep: ProgressStepCode }) {
  const earlierSteps = FULL_STATUS_ORDER.slice(0, FULL_STATUS_ORDER.indexOf(currentStep));
  const [targetStep, setTargetStep] = useState<string>(earlierSteps[earlierSteps.length - 1] ?? '');
  const [reason, setReason] = useState('');

  const revert = useMutation({
    mutationFn: () =>
      revertDoorProgress(projectId, {
        positionIds: selectedPositions.map((p) => p.id),
        targetStep: targetStep as ProgressStepCode,
        reason: reason.trim(),
      }),
    onSuccess: () => {
      ['progress_matrix', 'production_orders', 'project_positions', 'project', 'project_overview'].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key, projectId] }),
      );
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(`Đã lùi ${selectedPositions.length} cửa về "${PROGRESS_STEP_LABEL[targetStep as ProgressStepCode]}"`);
      onSuccess();
      onClose();
    },
    onError: (error) => showErrorToast(error, 'Không lùi được trạng thái'),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-800">
        <AlertTriangle size={14} className="mt-px shrink-0" />
        Lùi {selectedPositions.length} cửa từ &quot;{PROGRESS_STEP_LABEL[currentStep]}&quot;. Thao tác được ghi vào nhật
        ký tiến độ kèm lý do.
      </div>
      <Select
        label="Lùi về mốc"
        value={targetStep}
        onChange={(e) => setTargetStep(e.target.value)}
        options={earlierSteps.map((step) => ({ value: step, label: PROGRESS_STEP_LABEL[step] }))}
        fullWidth
      />
      <Textarea
        label="Lý do (bắt buộc)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        fullWidth
      />
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
        <Button variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
        <Button
          size="sm"
          variant="danger"
          disabled={!targetStep || reason.trim().length < 5}
          loading={revert.isPending}
          onClick={() => revert.mutate()}
        >
          Xác nhận lùi mốc
        </Button>
      </div>
    </div>
  );
}
