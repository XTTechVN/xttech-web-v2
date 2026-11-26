'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList } from 'lucide-react';
import { getProject } from '@/actions';
import { Skeleton } from '@/components';
import type { ProjectFloor } from '@/types';
import {
  ProductionSheetCard,
  filterTechnicalSheets,
  printProductionSheets,
  type FulfillmentFilter,
} from '../../shared/technical-sheets';
import { useTechnicalSheets } from '../hooks/use-technical-sheets';
import { QuotationTechnicalSheetsToolbar } from './quotation-technical-sheets-toolbar';

interface QuotationTechnicalSheetsTabProps {
  projectId: number;
  designOptionId: number | null;
  floors: ProjectFloor[];
}

export function QuotationTechnicalSheetsTab({
  projectId,
  designOptionId,
  floors,
}: QuotationTechnicalSheetsTabProps) {
  const [floorId, setFloorId] = useState<number | 'all'>('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<FulfillmentFilter>('all');
  const [selectedPositionId, setSelectedPositionId] = useState<number | 'all'>('all');
  const [isPrinting, setIsPrinting] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const { sheets, isLoading, isError } = useTechnicalSheets(projectId, designOptionId);
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
    enabled: Boolean(projectId),
  });

  const selectableSheets = useMemo(
    () => filterTechnicalSheets(sheets, floorId, fulfillmentFilter),
    [sheets, floorId, fulfillmentFilter],
  );

  const effectivePositionId: number | 'all' =
    selectedPositionId !== 'all' &&
    selectableSheets.some((item) => item.positionId === selectedPositionId)
      ? selectedPositionId
      : 'all';

  const displayedSheets = useMemo(
    () =>
      effectivePositionId === 'all'
        ? selectableSheets
        : selectableSheets.filter((item) => item.positionId === effectivePositionId),
    [selectableSheets, effectivePositionId],
  );

  const updateFilter = (nextFloorId: number | 'all', nextSource: FulfillmentFilter) => {
    setFloorId(nextFloorId);
    setFulfillmentFilter(nextSource);
    if (
      selectedPositionId !== 'all' &&
      !filterTechnicalSheets(sheets, nextFloorId, nextSource).some(
        (item) => item.positionId === selectedPositionId,
      )
    ) {
      setSelectedPositionId('all');
    }
  };

  const projectCode = project?.code || sheets[0]?.orderCode || String(projectId);

  const handlePrint = async () => {
    if (!printAreaRef.current || displayedSheets.length === 0) return;
    setIsPrinting(true);
    try {
      await printProductionSheets(printAreaRef.current, projectCode, 'Ho-so-ky-thuat');
    } finally {
      setIsPrinting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200/80 bg-red-50/50 p-6 text-center text-xs text-red-600">
        Không thể tải hồ sơ kỹ thuật các bộ cửa. Vui lòng thử lại.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <QuotationTechnicalSheetsToolbar
        floors={floors}
        selectableSheets={selectableSheets}
        displayedCount={displayedSheets.length}
        floorId={floorId}
        fulfillmentFilter={fulfillmentFilter}
        selectedPositionId={effectivePositionId}
        isPrinting={isPrinting}
        isLoading={isLoading}
        onFloorChange={(nextFloor) => updateFilter(nextFloor, fulfillmentFilter)}
        onFulfillmentChange={(nextSource) => updateFilter(floorId, nextSource)}
        onSelectPosition={setSelectedPositionId}
        onPrint={handlePrint}
      />

      {displayedSheets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white p-10 text-center text-xs text-slate-400">
          <ClipboardList size={28} className="text-slate-300" />
          <p>
            {sheets.length === 0
              ? 'Dự án chưa có bộ cửa nào để hiển thị hồ sơ kỹ thuật.'
              : 'Không có bộ cửa nào phù hợp bộ lọc tầng hoặc nguồn cửa.'}
          </p>
        </div>
      ) : (
        <div
          id="technical-sheets-print-container"
          ref={printAreaRef}
          className="sheets-print-container space-y-5"
        >
          {displayedSheets.map((sheet, idx) => (
            <div key={sheet.positionId} className="print-page-break">
              <ProductionSheetCard sheet={sheet} index={idx} compactHeader={true} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
