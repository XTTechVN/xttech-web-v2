'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calculator, Calendar, Plus, RefreshCw, Wrench } from 'lucide-react';
import { Badge, Button, Input } from '@/components';
import { getFinanceDashboard } from '@/actions/finance';
import type { FinanceTabKey, VoucherType } from '@/types';
import { getCurrentMonthDateRange } from './overview-tab.constants';
import { OverviewKpiGrid } from './overview-kpi-grid';
import { OverviewCashflowChart } from './overview-cashflow-chart';
import { OverviewQueuesPanel } from './overview-queues-panel';

export interface OverviewTabProps {
  onCreateVoucher: (mode?: 'workshop' | 'accountant', voucherType?: VoucherType) => void;
  onOpenVoucherDetail: (voucherId: number) => void;
  onNavigateTab: (tab: FinanceTabKey) => void;
}

export function OverviewTab({
  onCreateVoucher,
  onOpenVoucherDetail,
  onNavigateTab,
}: OverviewTabProps) {
  const defaultRange = getCurrentMonthDateRange();
  const [fromDate, setFromDate] = useState(defaultRange.fromDate);
  const [toDate, setToDate] = useState(defaultRange.toDate);

  const {
    data: dashboard,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['finance', 'dashboard', fromDate, toDate],
    queryFn: () => getFinanceDashboard({ fromDate, toDate }),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="primary" size="md">
            Sổ Tài chính hợp nhất
          </Badge>

          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-slate-400" />
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-8 text-xs w-36"
            />
            <span className="text-xs text-slate-400">→</span>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-8 text-xs w-36"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="xs"
            loading={isFetching}
            leftIcon={<RefreshCw size={13} />}
            onClick={() => refetch()}
          >
            Làm mới
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="xs"
            leftIcon={<Wrench size={13} />}
            onClick={() => onCreateVoucher('workshop', 'cash_payment')}
          >
            + Chi Xưởng nhanh
          </Button>
          <Button
            type="button"
            variant="primary"
            size="xs"
            leftIcon={<Calculator size={13} />}
            onClick={() => onCreateVoucher('accountant', 'general_journal')}
          >
            <Plus size={12} className="mr-0.5" />
            Lập Phiếu Kế toán
          </Button>
        </div>
      </div>

      {isLoading || !dashboard ? (
        <div className="p-10 text-center text-sm text-slate-400 bg-white rounded-xl border border-slate-200">
          Đang tải tổng quan tài chính...
        </div>
      ) : (
        <>
          <OverviewKpiGrid dashboard={dashboard} onNavigateTab={onNavigateTab} />
          <OverviewCashflowChart series={dashboard.cashflowSeries} />
          <OverviewQueuesPanel
            dashboard={dashboard}
            onOpenVoucherDetail={onOpenVoucherDetail}
            onNavigateTab={onNavigateTab}
          />
        </>
      )}
    </div>
  );
}
