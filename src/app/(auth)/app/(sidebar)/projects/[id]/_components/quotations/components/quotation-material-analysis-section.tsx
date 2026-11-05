'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layers } from 'lucide-react';
import { getProjectQuotationMaterialAnalysis } from '@/actions';
import { Skeleton } from '@/components';
import type { QuotationMaterialAnalysisResponse } from '@/types';
import { quotationMaterialAnalysisKey } from '../../hooks/use-active-quotation';
import { QuotationBomTables } from './quotation-bom-tables';
import { QuotationProductionCostCard } from './quotation-production-cost-card';

interface QuotationMaterialAnalysisSectionProps {
  projectId: number;
  quotationId: number;
  selectedPositionId?: number | null;
  onSelectPosition?: (positionId: number | null) => void;
}

export function QuotationMaterialAnalysisSection({
  projectId,
  quotationId,
  selectedPositionId: controlledPositionId,
  onSelectPosition,
}: QuotationMaterialAnalysisSectionProps) {
  const [internalPositionId, setInternalPositionId] = useState<number | null>(null);
  const selectedPositionId =
    controlledPositionId !== undefined ? controlledPositionId : internalPositionId;

  const handleSelectPosition = (posId: number | null) => {
    if (onSelectPosition) {
      onSelectPosition(posId);
    } else {
      setInternalPositionId(posId);
    }
  };

  const { data, isLoading, isError } = useQuery<QuotationMaterialAnalysisResponse>({
    queryKey: [...quotationMaterialAnalysisKey(projectId), quotationId],
    queryFn: () => getProjectQuotationMaterialAnalysis(projectId, quotationId),
    enabled: Boolean(projectId && quotationId),
  });

  const positionMap = useMemo(() => {
    if (!data?.byPositions) return new Map();
    return new Map(data.byPositions.map((pos) => [pos.positionId, pos]));
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200/80 bg-red-50/50 p-4 text-center text-xs text-red-600">
        Không thể tải dữ liệu phân tích cấu thành giá sản xuất &amp; thống kê vật tư.
      </div>
    );
  }

  const selectedPosition =
    selectedPositionId !== null ? positionMap.get(selectedPositionId) ?? null : null;
  const activeBreakdown = selectedPosition ? selectedPosition.breakdown : data.overall;

  return (
    <div className="space-y-4">
      {/* Thanh lọc phạm vi bóc tách O(1) */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Layers size={15} className="text-primary shrink-0" />
          <span>Phạm vi bóc tách định mức &amp; vật tư:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleSelectPosition(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedPosition === null
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            Tất cả bộ cửa ({data.totalPositions} bộ)
          </button>
          {data.byPositions.map((pos) => {
            const isActive = selectedPosition?.positionId === pos.positionId;
            return (
              <button
                key={pos.positionId}
                type="button"
                onClick={() => handleSelectPosition(pos.positionId)}
                title={`${pos.positionCode} · ${pos.doorName} (${pos.width}×${pos.height} mm - ${pos.floorName})`}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <span className="font-mono font-bold">{pos.positionCode}</span>
                <span className="opacity-85"> · {pos.doorName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Khối 1: Phân tích cấu thành giá sản xuất */}
      <QuotationProductionCostCard
        costBreakdown={activeBreakdown.costBreakdown}
        accessoryMode={data.accessoryMode}
      />

      {/* Khối 2, 3, 4: Thống kê Profile, Kính, Roan/Vật tư phụ/Phụ kiện */}
      <QuotationBomTables breakdown={activeBreakdown} />
    </div>
  );
}

