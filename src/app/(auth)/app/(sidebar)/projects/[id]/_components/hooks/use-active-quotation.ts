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
  queryClient.invalidateQueries({ queryKey: ['project_overview', projectId] });
  queryClient.invalidateQueries({ queryKey: ['design_options', projectId] });
  queryClient.invalidateQueries({ queryKey: ['project_positions', projectId] });
  queryClient.invalidateQueries({ queryKey: ['quotation_overview'] });
  queryClient.invalidateQueries({ queryKey: ['project_quotations', projectId] });
};

// Báo giá hiện hành của dự án (cửa chính thức), hoặc của một phương án thiết kế đang chào khách.
// Dùng chung cho tab Báo giá và tab Hợp đồng.
export function useActiveQuotation(projectId: number, designOptionId?: number | null) {
  const { data, isLoading } = useQuery<ProjectQuotationDetail | null>({
    queryKey: [...activeQuotationKey(projectId), designOptionId ?? 'official'],
    queryFn: () => getActiveProjectQuotation(projectId, designOptionId),
    enabled: !!projectId,
  });

  return { quotation: data ?? null, isLoading };
}
