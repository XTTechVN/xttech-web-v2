'use client';

import { useQuery } from '@tanstack/react-query';
import { getProjectTechnicalSheets } from '@/actions';
import { technicalSheetsKey } from '../../hooks/use-active-quotation';

export function useTechnicalSheets(projectId: number, designOptionId?: number | null) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: technicalSheetsKey(projectId, designOptionId),
    queryFn: () => getProjectTechnicalSheets(projectId, { designOptionId }),
    enabled: Boolean(projectId),
  });

  return {
    sheets: data ?? [],
    isLoading,
    isError,
    refetch,
  };
}
