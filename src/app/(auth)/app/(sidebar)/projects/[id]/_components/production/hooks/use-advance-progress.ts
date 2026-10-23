'use client';

import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { advanceDoorProgress } from '@/actions';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import type { AdvanceVariables } from '../types';
import { PROGRESS_STEP_LABEL } from '../utils';

// Chuyển nhiều cửa sang mốc tiến độ kế tiếp; làm mới ma trận, lệnh sản xuất và trạng thái dự án
export function useAdvanceProgress(projectId: number, onDone?: () => void) {
  return useMutation({
    mutationFn: ({ positionIds, targetStep, note, evidenceMedia }: AdvanceVariables) =>
      advanceDoorProgress(projectId, {
        positionIds,
        targetStep,
        note: note || undefined,
        evidenceMedia: evidenceMedia && evidenceMedia.length > 0 ? evidenceMedia : undefined,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['progress_matrix', projectId] });
      queryClient.invalidateQueries({ queryKey: ['production_orders', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project_positions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(
        `Đã cập nhật ${variables.positionIds.length} cửa: ${PROGRESS_STEP_LABEL[variables.targetStep]}`,
      );
      onDone?.();
    },
    onError: (err) => showErrorToast(err, 'Lỗi cập nhật tiến độ'),
  });
}
