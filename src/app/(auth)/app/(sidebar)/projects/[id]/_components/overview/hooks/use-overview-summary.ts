'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getProjectActivities,
  getProjectContracts,
  getProjectLedgerSummary,
  getProjectProgressMatrix,
  getProjectQuotations,
} from '@/actions';
import type { ProgressStepCode } from '@/types';

const INITIAL_STEP_COUNTS: Record<ProgressStepCode, number> = {
  surveyed: 0,
  producing: 0,
  factory_done: 0,
  delivered: 0,
  installed: 0,
  accepted: 0,
};

export function useOverviewSummary(projectId: number) {
  const { data: quotationsData, isLoading: isLoadingQuotations } = useQuery({
    queryKey: ['project_quotations', projectId],
    queryFn: () => getProjectQuotations(projectId),
    enabled: !!projectId,
  });

  const { data: contractsData, isLoading: isLoadingContracts } = useQuery({
    queryKey: ['project_contracts', projectId],
    queryFn: () => getProjectContracts(projectId),
    enabled: !!projectId,
  });

  const { data: ledgerSummary, isLoading: isLoadingLedger } = useQuery({
    queryKey: ['project_ledger_summary', projectId],
    queryFn: () => getProjectLedgerSummary(projectId),
    enabled: !!projectId,
  });

  const { data: progressMatrix, isLoading: isLoadingMatrix } = useQuery({
    queryKey: ['progress_matrix', projectId],
    queryFn: () => getProjectProgressMatrix(projectId),
    enabled: !!projectId,
  });

  const { data: activitiesData, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['project_activities', projectId],
    queryFn: () => getProjectActivities(projectId, { limit: 15 }),
    enabled: !!projectId,
  });

  const quotations = quotationsData?.items ?? [];
  const contracts = contractsData?.items ?? [];
  const activities = activitiesData?.items ?? [];

  const activeQuotation = useMemo(
    () => quotations.find((q) => q.isSelected) ?? quotations[0] ?? null,
    [quotations],
  );

  const activeContracts = useMemo(
    () => contracts.filter((c) => c.status !== 'cancelled'),
    [contracts],
  );

  const stepCounts = useMemo(() => {
    const counts: Record<ProgressStepCode, number> = { ...INITIAL_STEP_COUNTS };
    progressMatrix?.items?.forEach((item) => {
      if (item.currentStatus && item.currentStatus in counts) {
        counts[item.currentStatus] += 1;
      }
    });
    return counts;
  }, [progressMatrix]);

  return {
    quotations,
    activeQuotation,
    activeContracts,
    ledgerSummary,
    progressMatrix,
    stepCounts,
    activities,
    isLoadingSummary:
      isLoadingQuotations || isLoadingContracts || isLoadingLedger || isLoadingMatrix,
    isLoadingActivities,
  };
}

