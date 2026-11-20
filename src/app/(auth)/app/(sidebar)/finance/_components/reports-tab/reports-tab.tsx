'use client';

import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { BarChart3, BookOpen, Building2, Scale, TrendingUp } from 'lucide-react';
import { Badge, Button, Input, Tabs, type TabItem } from '@/components';
import type { Account, ReportViewMode } from '@/types';
import { cn } from '@/utils';
import { CashflowSection } from './cashflow-section';
import { GeneralLedgerSection } from './general-ledger-section';
import { ProjectPnlSection } from './project-pnl-section';
import {
  REPORT_SUBTABS,
  REPORT_VIEW_MODE_SEGMENT_ITEMS,
  type ReportSubTabKey,
} from './reports-tab.constants';
import { TrialBalanceSection } from './trial-balance-section';

export interface ReportsTabProps {
  accounts: Account[];
  refreshSignal?: number;
  onOpenVoucherDetail: (voucherId: number) => void;
}

const REPORT_ICONS: Record<ReportSubTabKey, React.ReactNode> = {
  project_pnl: <Building2 size={14} />,
  trial_balance: <Scale size={14} />,
  general_ledger: <BookOpen size={14} />,
  cashflow: <TrendingUp size={14} />,
};

export function ReportsTab({
  accounts,
  refreshSignal = 0,
  onOpenVoucherDetail,
}: ReportsTabProps) {
  const [subTab, setSubTab] = useState<ReportSubTabKey>('project_pnl');
  const [reportViewMode, setReportViewMode] = useState<ReportViewMode>('all');
  const [fromDate, setFromDate] = useState<string>(() =>
    dayjs().startOf('month').format('YYYY-MM-DD'),
  );
  const [toDate, setToDate] = useState<string>(() =>
    dayjs().endOf('month').format('YYYY-MM-DD'),
  );
  const [selectedAccountId, setSelectedAccountId] = useState<number | undefined>();

  const tabItems: TabItem[] = useMemo(
    () =>
      REPORT_SUBTABS.map((t) => ({
        value: t.value,
        label: t.label,
        icon: REPORT_ICONS[t.value],
      })),
    [],
  );

  const applyPreset = (preset: 'month' | 'quarter' | 'year') => {
    const now = dayjs();
    if (preset === 'month') {
      setFromDate(now.startOf('month').format('YYYY-MM-DD'));
      setToDate(now.endOf('month').format('YYYY-MM-DD'));
    } else if (preset === 'quarter') {
      const qStartMonth = Math.floor(now.month() / 3) * 3;
      const start = now.month(qStartMonth).startOf('month');
      const end = now.month(qStartMonth + 2).endOf('month');
      setFromDate(start.format('YYYY-MM-DD'));
      setToDate(end.format('YYYY-MM-DD'));
    } else {
      setFromDate(now.startOf('year').format('YYYY-MM-DD'));
      setToDate(now.endOf('year').format('YYYY-MM-DD'));
    }
  };

  const handleDrillAccount = (accountId: number) => {
    setSelectedAccountId(accountId);
    setSubTab('general_ledger');
  };

  const supportsViewModeFilter =
    subTab === 'project_pnl' || subTab === 'general_ledger';

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BarChart3 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hệ thống Báo cáo Tài chính &amp; Sổ Sách Hợp Nhất
              </h3>
              <p className="text-xs text-slate-500">
                Tổng hợp chuẩn Thông tư 200/133 từ 1 Sổ Tài chính; lọc chi phí được trừ / loại B4 trên Sổ cái &amp; P&amp;L Công trình
              </p>
            </div>
          </div>

          {supportsViewModeFilter ? (
            <div className="inline-flex flex-wrap p-1 rounded-xl bg-slate-100 border border-slate-200 gap-1">
              {REPORT_VIEW_MODE_SEGMENT_ITEMS.map((seg) => {
                const active = reportViewMode === seg.value;
                return (
                  <button
                    key={seg.value}
                    type="button"
                    onClick={() => setReportViewMode(seg.value)}
                    title={seg.hint}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer',
                      active
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60',
                    )}
                  >
                    {seg.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <Badge variant="primary" size="md">
              100% Sổ Tài chính hợp nhất (Cân đối chuẩn)
            </Badge>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="overflow-x-auto pb-0.5">
            <Tabs
              tabs={tabItems}
              activeTab={subTab}
              onChange={(val) => setSubTab(val as ReportSubTabKey)}
              variant="pill"
              size="sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-36">
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <span className="text-xs text-slate-400">→</span>
            <div className="w-36">
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <Button variant="outline" size="xs" onClick={() => applyPreset('month')}>
              Tháng này
            </Button>
            <Button variant="outline" size="xs" onClick={() => applyPreset('quarter')}>
              Quý này
            </Button>
            <Button variant="outline" size="xs" onClick={() => applyPreset('year')}>
              Năm nay
            </Button>
          </div>
        </div>
      </div>

      {subTab === 'project_pnl' && (
        <ProjectPnlSection
          fromDate={fromDate}
          toDate={toDate}
          reportViewMode={reportViewMode}
          refreshSignal={refreshSignal}
        />
      )}

      {subTab === 'trial_balance' && (
        <TrialBalanceSection
          fromDate={fromDate}
          toDate={toDate}
          refreshSignal={refreshSignal}
          onDrillAccount={handleDrillAccount}
        />
      )}

      {subTab === 'general_ledger' && (
        <GeneralLedgerSection
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          fromDate={fromDate}
          toDate={toDate}
          reportViewMode={reportViewMode}
          refreshSignal={refreshSignal}
          onSelectAccountId={setSelectedAccountId}
          onOpenVoucherDetail={onOpenVoucherDetail}
        />
      )}

      {subTab === 'cashflow' && (
        <CashflowSection
          fromDate={fromDate}
          toDate={toDate}
          refreshSignal={refreshSignal}
        />
      )}
    </div>
  );
}
