'use client';

import { useQuery } from '@tanstack/react-query';
import { getActiveProjectQuotation } from '@/actions';
import queryClient from '@/utils/query';
import type { ProjectQuotationDetail } from '@/types';

export const activeQuotationKey = (projectId: number) => ['project_quotation_active', projectId];

export const quotationSheetKey = (projectId: number) => ['project_quotation_sheet', projectId];

// Làm mới mọi dữ liệu phụ thuộc báo giá hiện hành (báo giá, bảng báo giá, dự án)
export const invalidateQuotationQueries = (projectId: number) => {
  queryClient.invalidateQueries({ queryKey: activeQuotationKey(projectId) });
  queryClient.invalidateQueries({ queryKey: quotationSheetKey(projectId) });
  queryClient.invalidateQueries({ queryKey: ['project', projectId] });
};

// Báo giá hiện hành duy nhất của dự án, dùng chung cho tab Báo giá và tab Hợp đồng
export function useActiveQuotation(projectId: number) {
  const { data, isLoading } = useQuery<ProjectQuotationDetail | null>({
    queryKey: activeQuotationKey(projectId),
    queryFn: () => getActiveProjectQuotation(projectId),
    enabled: !!projectId,
  });

  return { quotation: data ?? null, isLoading };
}
