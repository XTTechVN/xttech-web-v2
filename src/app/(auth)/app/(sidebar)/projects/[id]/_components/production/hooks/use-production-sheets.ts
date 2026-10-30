'use client';

import { useQuery } from '@tanstack/react-query';
import { getProductionOrderSheets } from '@/actions';

// Hook tải toàn bộ thẻ sản xuất (A4) của tất cả các bộ cửa trong một lệnh sản xuất
export function useProductionSheets(projectId: number, orderId: number | null) {
  const isEnabled = !!projectId && orderId !== null;

  const sheetsQuery = useQuery({
    queryKey: ['production_order_sheets', projectId, orderId],
    queryFn: () => getProductionOrderSheets(projectId, orderId as number),
    enabled: isEnabled,
  });

  return {
    sheets: sheetsQuery.data ?? [],
    isLoading: sheetsQuery.isLoading,
    isError: sheetsQuery.isError,
    error: sheetsQuery.error,
    refetch: sheetsQuery.refetch,
  };
}
