'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { previewProjectQuotation } from '@/actions';
import { showErrorToast } from '@/utils';
import type {
  ProjectQuotationDetail,
  ProjectQuotationPreviewRequest,
  ProjectQuotationPreviewResponse,
} from '@/types';
import {
  buildConfigFromQuotation,
  DEFAULT_PRICING_CONFIG,
  DEFAULT_QUOTATION_NAME,
} from '../utils/quotation-form-utils';

const PREVIEW_DEBOUNCE_MS = 500;

/**
 * Trạng thái form cấu thành giá + tính thử giá real-time (debounce).
 * Form luôn đồng bộ với báo giá hiện hành mỗi khi báo giá được lưu / đồng bộ.
 */
export function useQuotationForm(projectId: number, quotation: ProjectQuotationDetail | null) {
  const [config, setConfig] = useState<ProjectQuotationPreviewRequest>(DEFAULT_PRICING_CONFIG);
  const [name, setName] = useState(DEFAULT_QUOTATION_NAME);
  const [note, setNote] = useState('');

  const quotationId = quotation?.id;
  const quotationUpdatedAt = quotation?.updatedAt;

  useEffect(() => {
    if (!quotation) return;
    setConfig(buildConfigFromQuotation(quotation));
    setName(quotation.name);
    setNote(quotation.note ?? '');
    // Chỉ nạp lại khi báo giá đổi bản ghi hoặc vừa được lưu
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotationId, quotationUpdatedAt]);

  const patchConfig = (patch: Partial<ProjectQuotationPreviewRequest>) =>
    setConfig((prev) => ({ ...prev, ...patch }));

  const toggleFloor = (floorId: number) => {
    const current = config.floorIds ?? [];
    patchConfig({
      floorIds: current.includes(floorId)
        ? current.filter((id) => id !== floorId)
        : [...current, floorId],
    });
  };

  const isMissingFloors = config.scopeType === 'by_floor' && !config.floorIds?.length;
  const { previewResult, isCalculating } = usePricePreview(projectId, config, isMissingFloors);

  return {
    config,
    patchConfig,
    toggleFloor,
    name,
    setName,
    note,
    setNote,
    isMissingFloors,
    previewResult: previewResult as ProjectQuotationPreviewResponse | undefined,
    isCalculating,
  };
}

function usePricePreview(
  projectId: number,
  config: ProjectQuotationPreviewRequest,
  isMissingFloors: boolean,
) {
  const {
    mutate: calculatePreview,
    data: previewResult,
    isPending: isCalculating,
  } = useMutation({
    mutationFn: (payload: ProjectQuotationPreviewRequest) =>
      previewProjectQuotation(projectId, payload),
    onError: (err) => showErrorToast(err, 'Lỗi tính dự toán'),
  });

  useEffect(() => {
    if (isMissingFloors || !projectId) return;
    const timer = setTimeout(() => calculatePreview(config), PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [config, isMissingFloors, projectId, calculatePreview]);

  return { previewResult, isCalculating };
}
