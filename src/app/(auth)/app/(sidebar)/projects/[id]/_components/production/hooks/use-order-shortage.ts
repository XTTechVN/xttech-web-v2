'use client';

import { useQuery } from '@tanstack/react-query';
import { checkProjectMaterialShortage } from '@/actions';
import type { ShortageCheckResponse } from '@/types';

// Kiểm tra tồn kho cho riêng một lệnh sản xuất (cùng API với "Kiểm soát thiếu hụt" ở Kho)
export function useOrderShortage(projectId: number, orderId: number | null, isEnabled: boolean) {
  const query = useQuery<ShortageCheckResponse>({
    queryKey: ['order_shortage', projectId, orderId],
    queryFn: () => checkProjectMaterialShortage(projectId, orderId as number),
    enabled: isEnabled && !!projectId && orderId !== null,
    staleTime: 0,
  });

  const shortages = query.data?.shortages ?? [];
  // Chưa khai báo trong kho hoặc chưa gán mã profile -> backend không thể lập phiếu xuất
  const hasBlockingItems = shortages.some((item) => !item.itemId || item.isConfigured === false);

  return { ...query, shortages, hasBlockingItems };
}
