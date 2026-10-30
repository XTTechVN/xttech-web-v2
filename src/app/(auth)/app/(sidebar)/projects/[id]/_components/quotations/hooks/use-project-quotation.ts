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
import { EDITABLE_QUOTATION_STATUSES } from '@/config';
import { invalidateQuotationQueries, useActiveQuotation } from '../../hooks/use-active-quotation';

export interface SaveQuotationInput {
  config: ProjectQuotationPreviewRequest;
  name: string;
  note: string;
}

/**
 * Báo giá hiện hành của dòng báo giá (cửa chính thức hoặc một phương án thiết kế):
 * lập lần đầu, sửa tại chỗ khi còn nháp / chờ duyệt / đã duyệt (sửa xong phải trình lại),
 * hoặc lập phiên bản mới khi báo giá đã gửi khách / khách đã quyết định / đã khóa theo hợp đồng.
 */
export function useProjectQuotation(projectId: number, designOptionId: number | null = null) {
  const { quotation, isLoading } = useActiveQuotation(projectId, designOptionId);
  const isEditable =
    !!quotation && !quotation.isLocked && EDITABLE_QUOTATION_STATUSES.includes(quotation.status);

  const { data: floors = [] } = useQuery<ProjectFloor[]>({
    queryKey: ['project_floors', projectId],
    queryFn: () => getProjectFloors(projectId),
    enabled: !!projectId,
  });

  const { mutate: saveQuotation, isPending: isSaving } = useMutation({
    mutationFn: ({ config, name, note }: SaveQuotationInput) =>
      quotation && isEditable
        ? updateProjectQuotation(projectId, quotation.id, { ...config, name, note })
        : createProjectQuotationOfficial(projectId, {
            ...config,
            designOptionId,
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
    mutationFn: () => syncProjectQuotation(projectId, { designOptionId }),
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
    isEditable,
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
