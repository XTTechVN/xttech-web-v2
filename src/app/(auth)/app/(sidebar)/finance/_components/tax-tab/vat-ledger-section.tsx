'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Download, RefreshCw } from 'lucide-react';
import { Alert, Button, Select, Skeleton } from '@/components';
import { getVatLedgerReport } from '@/actions';
import { formatCurrency, getErrorMessage } from '@/utils';
import { exportVatLedgerExcel } from '../../_utils';
import { QUARTER_OPTIONS, TAX_MONTH_OPTIONS } from './tax-tab.constants';
import { VatLedgerTable } from './vat-ledger-table';

interface VatLedgerSectionProps {
  refreshSignal?: number;
  onOpenVoucherDetail: (voucherId: number) => void;
}

export function VatLedgerSection({
  refreshSignal = 0,
  onOpenVoucherDetail,
}: VatLedgerSectionProps) {
  const now = dayjs();
  const [year, setYear] = useState<number>(now.year());
  const [periodKind, setPeriodKind] = useState<'month' | 'quarter'>('month');
  const [month, setMonth] = useState<number>(now.month() + 1);
  const [quarter, setQuarter] = useState<number>(Math.floor(now.month() / 3) + 1);
  const [ledgerView, setLedgerView] = useState<'input' | 'output'>('input');

  const { data: report, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['finance-vat-ledger', year, periodKind, month, quarter, refreshSignal],
    queryFn: () =>
      getVatLedgerReport({
        year,
        month: periodKind === 'month' ? month : undefined,
        quarter: periodKind === 'quarter' ? quarter : undefined,
      }),
  });

  const yearOptions = [now.year() - 1, now.year(), now.year() + 1].map((y) => ({
    value: String(y),
    label: `Năm ${y}`,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-32">
            <Select value={String(year)} onChange={(e) => setYear(Number(e.target.value))} options={yearOptions} fullWidth />
          </div>
          <div className="w-36">
            <Select
              value={periodKind}
              onChange={(e) => setPeriodKind(e.target.value as 'month' | 'quarter')}
              options={[
                { value: 'month', label: 'Theo Tháng' },
                { value: 'quarter', label: 'Theo Quý' },
              ]}
              fullWidth
            />
          </div>
          {periodKind === 'month' ? (
            <div className="w-36">
              <Select value={String(month)} onChange={(e) => setMonth(Number(e.target.value))} options={TAX_MONTH_OPTIONS} fullWidth />
            </div>
          ) : (
            <div className="w-44">
              <Select value={String(quarter)} onChange={(e) => setQuarter(Number(e.target.value))} options={QUARTER_OPTIONS} fullWidth />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {report && (
            <Button variant="outline" size="sm" onClick={() => exportVatLedgerExcel(report)} leftIcon={<Download size={14} />}>
              Xuất Excel Bảng kê (3 Sheets)
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {isError && (
        <Alert variant="danger" title="Không thể tải bảng kê thuế GTGT">
          {getErrorMessage(error)}
        </Alert>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
              <div className="text-xs text-slate-500">GTGT Đầu vào được khấu trừ</div>
              <div className="text-lg font-mono font-bold text-sky-700 tabular-nums mt-1">{formatCurrency(report.deductibleInputVat)}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
              <div className="text-xs text-slate-500">GTGT Đầu vào không ĐK khấu trừ</div>
              <div className="text-lg font-mono font-bold text-amber-700 tabular-nums mt-1">{formatCurrency(report.nonDeductibleInputVat)}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
              <div className="text-xs text-slate-500">GTGT Đầu ra phải kê khai</div>
              <div className="text-lg font-mono font-bold text-emerald-700 tabular-nums mt-1">{formatCurrency(report.totalOutputVat)}</div>
            </div>
            <div className="bg-white rounded-xl border border-primary/30 bg-primary/5 p-3.5">
              <div className="text-xs text-primary font-semibold">
                {report.netVatPayable > 0 ? 'Thuế GTGT phải nộp trong kỳ' : 'Còn được khấu trừ chuyển kỳ sau'}
              </div>
              <div className="text-lg font-mono font-bold text-primary tabular-nums mt-1">
                {formatCurrency(report.netVatPayable > 0 ? report.netVatPayable : report.vatCarriedForward)}
              </div>
            </div>
          </div>

          <VatLedgerTable
            ledgerView={ledgerView}
            report={report}
            onChangeView={setLedgerView}
            onOpenVoucherDetail={onOpenVoucherDetail}
          />
        </>
      ) : null}
    </div>
  );
}
