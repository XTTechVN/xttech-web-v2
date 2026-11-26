'use client';

import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  CheckSquare,
  Download,
  FileSpreadsheet,
  GitCompare,
  Landmark,
  Users,
} from 'lucide-react';
import { Alert, Skeleton, type TabItem } from '@/components';
import type {
  FinanceSetting,
  FinanceTabKey,
  FinanceUserPermission,
  StatutoryFormCode,
  StatutoryPeriodChecklistItem,
  StatutoryPeriodType,
} from '@/types';
import { getErrorMessage } from '@/utils';
import { BctcStatementsSection } from './bctc-statements-section';
import { ExportHistorySection } from './export-history-section';
import { PeriodChecklistSection } from './period-checklist-section';
import { PitEntriesSection } from './pit-entries-section';
import { ReconciliationPanel } from './reconciliation-panel';
import { StatutoryTaxHeader } from './statutory-tax-header';
import {
  STATUTORY_SUBTABS,
  toFilingFrequency,
  type StatutorySubTabKey,
} from './statutory-tax-tab.constants';
import { TaxDeclarationEditor } from './tax-declaration-editor';
import { useStatutoryFilingActions } from './use-statutory-filing-actions';
import { useStatutoryPeriodFilings } from './use-statutory-period-filings';

export interface StatutoryTaxTabProps {
  setting: FinanceSetting | null;
  myPermissions: FinanceUserPermission | null;
  refreshSignal?: number;
  onOpenVoucherDetail: (voucherId: number) => void;
  onNavigateTab: (tab: FinanceTabKey) => void;
}

const SUBTAB_ICONS: Record<StatutorySubTabKey, React.ReactNode> = {
  overview: <CheckSquare size={14} />,
  declarations: <FileSpreadsheet size={14} />,
  pit_ledger: <Users size={14} />,
  bctc: <Landmark size={14} />,
  reconciliation: <GitCompare size={14} />,
  exports: <Download size={14} />,
};

export function StatutoryTaxTab({
  setting,
  myPermissions,
  refreshSignal = 0,
  onOpenVoucherDetail,
  onNavigateTab,
}: StatutoryTaxTabProps) {
  const now = dayjs();
  const [subTab, setSubTab] = useState<StatutorySubTabKey>('overview');
  const [taxYear, setTaxYear] = useState<number>(now.year());
  const [periodType, setPeriodType] = useState<StatutoryPeriodType>('quarter');
  const [periodIndex, setPeriodIndex] = useState<number>(Math.ceil((now.month() + 1) / 3));
  const [activeTaxForm, setActiveTaxForm] = useState<StatutoryFormCode>('01_GTGT');
  const [activeBctcForm, setActiveBctcForm] = useState<StatutoryFormCode>('B01_DN');

  const {
    busyKey,
    handleCompute,
    handleReconcile,
    handleApprove,
    handleExportFiling,
    handleExportXml,
    handleMarkFiled,
    handleCreateSupplemental,
    handleBackfillCashflow,
  } = useStatutoryFilingActions({ taxYear, periodType, periodIndex, setting });

  const { overviewQuery, filingByCode, allFilings } = useStatutoryPeriodFilings({
    taxYear,
    periodType,
    periodIndex,
    refreshSignal,
  });

  const { data: overview, isLoading, isFetching, isError, error, refetch } = overviewQuery;
  const activeTaxFiling = filingByCode[activeTaxForm] ?? null;
  const activeBctcFiling = filingByCode[activeBctcForm] ?? null;

  const findConfig = (code: StatutoryFormCode) =>
    (overview?.configs || []).find((c) => c.formCode === code) || null;

  const tabItems: TabItem[] = useMemo(
    () =>
      STATUTORY_SUBTABS.map((t) => ({
        value: t.value,
        label: t.label,
        icon: SUBTAB_ICONS[t.value],
      })),
    [],
  );

  const handleOpenChecklistForm = (code: StatutoryFormCode) => {
    if (code === '01_GTGT' || code === '05_KK_TNCN' || code === '03_TNDN') {
      setActiveTaxForm(code);
      setSubTab('declarations');
    } else {
      setActiveBctcForm(code);
      setSubTab('bctc');
    }
  };

  const handleExportChecklistItem = async (item: StatutoryPeriodChecklistItem) => {
    const found = filingByCode[item.formCode];
    if (found) await handleExportFiling(found);
  };

  const activeRegime = overview?.accountingRegime || setting?.accountingRegime || 'tt99';

  return (
    <div className="space-y-4">
      <StatutoryTaxHeader
        activeRegime={activeRegime}
        taxYear={taxYear}
        currentYear={now.year()}
        periodType={periodType}
        periodIndex={periodIndex}
        isFetching={isFetching}
        subTab={subTab}
        tabItems={tabItems}
        onChangeYear={setTaxYear}
        onChangePeriodType={setPeriodType}
        onChangePeriodIndex={setPeriodIndex}
        onChangeSubTab={setSubTab}
        onRefresh={() => refetch()}
      />

      {isError && (
        <Alert variant="danger" title="Không thể tải dữ liệu BCTC & kê khai thuế">
          {getErrorMessage(error)}
        </Alert>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <>
          {subTab === 'overview' && (
            <PeriodChecklistSection
              checklist={overview?.checklist || []}
              myPerm={myPermissions}
              busyKey={busyKey}
              onOpenDeclaration={handleOpenChecklistForm}
              onCompute={(code) => handleCompute(code)}
              onReconcile={handleReconcile}
              onApprove={handleApprove}
              onExport={handleExportChecklistItem}
              onMarkFiled={handleMarkFiled}
              onCreateSupplemental={async (code) => {
                const created = await handleCreateSupplemental(code);
                if (created) handleOpenChecklistForm(code);
              }}
            />
          )}

          {subTab === 'declarations' && (
            <TaxDeclarationEditor
              key={`${activeTaxForm}-${activeTaxFiling?.updatedAt || 'none'}`}
              formCode={activeTaxForm}
              filing={activeTaxFiling}
              formConfig={findConfig(activeTaxForm)}
              myPerm={myPermissions}
              busyKey={busyKey}
              onChangeFormCode={setActiveTaxForm}
              onCompute={(overrides) =>
                handleCompute(
                  activeTaxForm,
                  overrides,
                  activeTaxFiling?.declarationKind || 'initial',
                  activeTaxFiling?.supplementalSeq || 0,
                )
              }
              onReconcile={handleReconcile}
              onApprove={handleApprove}
              onExport={handleExportFiling}
              onCreateSupplemental={async (code) => {
                await handleCreateSupplemental(code);
              }}
              onOpenVoucherDetail={onOpenVoucherDetail}
            />
          )}

          {subTab === 'pit_ledger' && (
            <PitEntriesSection
              taxYear={taxYear}
              periodType={toFilingFrequency(periodType)}
              periodIndex={periodIndex}
            />
          )}

          {subTab === 'bctc' && (
            <BctcStatementsSection
              key={`${activeBctcForm}-${activeBctcFiling?.updatedAt || 'none'}`}
              formCode={activeBctcForm}
              filing={activeBctcFiling}
              formConfig={findConfig(activeBctcForm)}
              myPerm={myPermissions}
              busyKey={busyKey}
              onChangeFormCode={setActiveBctcForm}
              onCompute={() => handleCompute(activeBctcForm)}
              onReconcile={handleReconcile}
              onApprove={handleApprove}
              onExport={handleExportFiling}
              onOpenVoucherDetail={onOpenVoucherDetail}
              onBackfillCashflow={handleBackfillCashflow}
            />
          )}

          {subTab === 'reconciliation' && (
            <ReconciliationPanel
              filings={allFilings}
              onJumpToSource={(tab) => onNavigateTab((tab as FinanceTabKey) || 'tax')}
              onNavigateSubTab={setSubTab}
            />
          )}

          {subTab === 'exports' && (
            <ExportHistorySection
              filings={allFilings}
              myPerm={myPermissions}
              busyKey={busyKey}
              onDownloadExcel={handleExportFiling}
              onExportXml={handleExportXml}
            />
          )}
        </>
      )}
    </div>
  );
}
