'use client';

import React from 'react';
import type { ProjectDetail } from '@/types';
import { useOverviewMaterials, useOverviewSummary } from './hooks';
import {
  MaterialStandardCard,
  ProjectActivitiesCard,
  ProjectKpiSummaryCard,
  ProjectPipelineCard,
  ProjectProgressCard,
} from './components';

interface TabOverviewProps {
  projectId: number;
  project?: ProjectDetail;
  onSelectTab?: (tab: string) => void;
}

export function TabOverview({ projectId, project, onSelectTab }: TabOverviewProps) {
  const {
    currentBrandId,
    updatingField,
    isLoadingBrands,
    isLoadingSeries,
    isLoadingColors,
    brandOptions,
    seriesOptions,
    colorOptions,
    enableCatalogs,
    handleUpdate,
  } = useOverviewMaterials(projectId, project);

  const {
    quotations,
    activeQuotation,
    activeContracts,
    ledgerSummary,
    progressMatrix,
    stepCounts,
    activities,
    isLoadingActivities,
  } = useOverviewSummary(projectId);

  if (!project) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-1">
      {/* Cột trái: Tiêu chuẩn vật tư & Tiến độ phụ trách */}
      <div className="lg:col-span-4 flex flex-col gap-5">
        <MaterialStandardCard
          project={project}
          currentBrandId={currentBrandId}
          updatingField={updatingField}
          isLoadingBrands={isLoadingBrands}
          isLoadingSeries={isLoadingSeries}
          isLoadingColors={isLoadingColors}
          brandOptions={brandOptions}
          seriesOptions={seriesOptions}
          colorOptions={colorOptions}
          onEnableCatalogs={enableCatalogs}
          onUpdate={handleUpdate}
        />

        <ProjectProgressCard
          project={project}
          updatingField={updatingField}
          onUpdate={handleUpdate}
        />
      </div>

      {/* Cột phải: Tiến trình 5 bước, Chỉ số Tài chính & Tiến độ 6 mốc, Nhật ký hoạt động */}
      <div className="lg:col-span-8 flex flex-col gap-5">
        <ProjectPipelineCard
          project={project}
          quotationsCount={quotations.length}
          activeContractsCount={activeContracts.length}
          factoryProgressPercent={progressMatrix?.factoryProgressPercent ?? 0}
          onSelectTab={onSelectTab}
        />

        <ProjectKpiSummaryCard
          activeQuotation={activeQuotation}
          quotationsCount={quotations.length}
          activeContractsCount={activeContracts.length}
          ledgerSummary={ledgerSummary}
          progressMatrix={progressMatrix}
          stepCounts={stepCounts}
          fallbackTotalPositions={project.totalPositions ?? 0}
          onSelectTab={onSelectTab}
        />

        <ProjectActivitiesCard
          activities={activities}
          isLoading={isLoadingActivities}
        />
      </div>
    </div>
  );
}
