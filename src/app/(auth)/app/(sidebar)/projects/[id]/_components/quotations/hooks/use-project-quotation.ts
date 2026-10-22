'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createProjectQuotationOfficial,
  getProjectFloors,
  syncProjectQuotation,
  updateProjectQuotation,
} from '@/actions';
import { showErrorToast } from '@/utils';
import type {
  ProjectFloor,
  ProjectQuotationPreviewRequest,
  ProjectQuotationUpdatePayload,
} from '@/types';
import { invalidateQuotationQueries, useActiveQuotation } from '../../hooks/use-active-quotation';

export interface SaveQuotationInput {
  config: ProjectQuotationPreviewRequest;
  name: string;
  note: string;
}

/**
 * Báo giá hiện hành duy nhất của dự án ("Single Living Quotation"):
 * lập lần đầu, sửa tại chỗ, hoặc đồng bộ lại khi dữ liệu cửa thay đổi.
 */
export function useProjectQuotation(projectId: number) {
  const { quotation, isLoading } = useActiveQuotation(projectId);

  const { data: floors = [] } = useQuery<ProjectFloor[]>({
    queryKey: ['project_floors', projectId],
    queryFn: () => getProjectFloors(projectId),
    enabled: !!projectId,
  });

  const { mutate: saveQuotation, isPending: isSaving } = useMutation({
    mutationFn: ({ config, name, note }: SaveQuotationInput) =>
      quotation
        ? updateProjectQuotation(projectId, quotation.id, { ...config, name, note })
        : createProjectQuotationOfficial(projectId, {
            ...config,
            projectId,
            name,
            note: note || undefined,
          }),
    onSuccess: (res) => {
      invalidateQuotationQueries(projectId);
      toast.success(`Đã lưu báo giá ${res.code} (v${res.version})`);
    },
    onError: (err) => showErrorToast(err, 'Lỗi lưu báo giá'),
  });

  const { mutate: syncQuotation, isPending: isSyncing } = useMutation({
    mutationFn: () => syncProjectQuotation(projectId),
    onSuccess: (res) => {
      invalidateQuotationQueries(projectId);
      toast.success(`Đã đồng bộ báo giá ${res.code} (v${res.version}) theo dữ liệu cửa mới nhất`);
    },
    onError: (err) => showErrorToast(err, 'Lỗi đồng bộ báo giá'),
  });

  const { mutate: savePrices, isPending: isSavingPrices } = useMutation({
    mutationFn: (payload: ProjectQuotationUpdatePayload) =>
      updateProjectQuotation(projectId, quotation!.id, payload),
    onSuccess: () => {
      invalidateQuotationQueries(projectId);
      toast.success('Đã lưu giá bán');
    },
    onError: (err) => showErrorToast(err, 'Lỗi lưu giá bán'),
  });

  return {
    quotation,
    floors,
    isLoading,
    saveQuotation,
    isSaving,
    syncQuotation,
    isSyncing,
    savePrices,
    isSavingPrices,
  };
}
