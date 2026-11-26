'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getStatutoryFiling,
  getStatutoryFilingHistory,
  getStatutoryPeriodOverview,
} from '@/actions';
import type { StatutoryFiling, StatutoryFormCode, StatutoryPeriodType } from '@/types';

export function useStatutoryPeriodFilings({
  taxYear,
  periodType,
  periodIndex,
  refreshSignal = 0,
}: {
  taxYear: number;
  periodType: StatutoryPeriodType;
  periodIndex: number;
  refreshSignal?: number;
}) {
  const overviewQuery = useQuery({
    queryKey: ['finance', 'statutory', 'overview', taxYear, periodType, periodIndex, refreshSignal],
    queryFn: () => getStatutoryPeriodOverview({ taxYear, periodType, periodIndex }),
  });

  const historyQuery = useQuery({
    queryKey: ['finance', 'statutory', 'history', taxYear, periodType, periodIndex, refreshSignal],
    queryFn: () => getStatutoryFilingHistory({ taxYear, periodType, periodIndex }),
  });

  const makeFilingQuery = (formCode: StatutoryFormCode) => ({
    queryKey: ['finance', 'statutory', 'filing', formCode, taxYear, periodType, periodIndex, refreshSignal],
    queryFn: () => getStatutoryFiling(formCode, { taxYear, periodType, periodIndex }),
  });

  const vatQuery = useQuery(makeFilingQuery('01_GTGT'));
  const pitQuery = useQuery(makeFilingQuery('05_KK_TNCN'));
  const citQuery = useQuery(makeFilingQuery('03_TNDN'));
  const b01Query = useQuery(makeFilingQuery('B01_DN'));
  const b02Query = useQuery(makeFilingQuery('B02_DN'));
  const b03Query = useQuery(makeFilingQuery('B03_DN'));
  const b09Query = useQuery(makeFilingQuery('B09_DN'));
  const cdtkQuery = useQuery(makeFilingQuery('CDTK'));

  const historyList = historyQuery.data || [];
  const latestFromHistory = (code: StatutoryFormCode, fallback: StatutoryFiling | null) => {
    const matches = historyList.filter((f) => f.formCode === code);
    if (matches.length === 0) return fallback;
    return [...matches].sort((a, b) => b.supplementalSeq - a.supplementalSeq)[0] ?? fallback;
  };

  const filingByCode: Record<StatutoryFormCode, StatutoryFiling | null> = {
    '01_GTGT': latestFromHistory('01_GTGT', vatQuery.data ?? null),
    '05_KK_TNCN': latestFromHistory('05_KK_TNCN', pitQuery.data ?? null),
    '03_TNDN': latestFromHistory('03_TNDN', citQuery.data ?? null),
    B01_DN: latestFromHistory('B01_DN', b01Query.data ?? null),
    B02_DN: latestFromHistory('B02_DN', b02Query.data ?? null),
    B03_DN: latestFromHistory('B03_DN', b03Query.data ?? null),
    B09_DN: latestFromHistory('B09_DN', b09Query.data ?? null),
    CDTK: latestFromHistory('CDTK', cdtkQuery.data ?? null),
  };

  const allFilings =
    historyList.length > 0
      ? historyList
      : Object.values(filingByCode).filter((f): f is StatutoryFiling => Boolean(f));

  return {
    overviewQuery,
    filingByCode,
    allFilings,
  };
}
