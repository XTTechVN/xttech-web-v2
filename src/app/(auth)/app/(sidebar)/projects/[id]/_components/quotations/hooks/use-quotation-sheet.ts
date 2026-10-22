'use client';

import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { exportProjectQuotationExcel, getProjectQuotationSheet } from '@/actions';
import { showErrorToast } from '@/utils';
import type { QuotationAccessoryMode, QuotationSheet } from '@/types';
import { quotationSheetKey } from '../../hooks/use-active-quotation';

/**
 * Bảng báo giá theo tầng của báo giá hiện hành.
 * Chế độ gộp/tách phụ kiện chỉ đổi cách hiển thị, không ghi lại giá đã lưu.
 */
export function useQuotationSheet(
  projectId: number,
  quotationId: number,
  initialMode: QuotationAccessoryMode,
) {
  const [accessoryMode, setAccessoryMode] = useState<QuotationAccessoryMode>(initialMode);

  const { data: sheet, isLoading } = useQuery<QuotationSheet>({
    queryKey: [...quotationSheetKey(projectId), quotationId, accessoryMode],
    queryFn: () => getProjectQuotationSheet(projectId, quotationId, accessoryMode),
    placeholderData: keepPreviousData,
  });

  const { mutate: exportExcel, isPending: isExporting } = useMutation({
    mutationFn: (filename: string) =>
      exportProjectQuotationExcel(projectId, quotationId, filename, accessoryMode),
    onError: (err) => showErrorToast(err, 'Lỗi xuất Excel báo giá'),
  });

  return { sheet, isLoading, accessoryMode, setAccessoryMode, exportExcel, isExporting };
}
