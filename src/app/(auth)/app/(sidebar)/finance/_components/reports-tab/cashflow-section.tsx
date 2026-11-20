'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download, RefreshCw } from 'lucide-react';
import { Alert, Button, Select, Skeleton } from '@/components';
import { getCashflowReport } from '@/actions';
import { formatCurrency, getErrorMessage } from '@/utils';
import { exportCashflowExcel } from './reports-export';
import { CASHFLOW_GRANULARITY_OPTIONS } from './reports-tab.constants';

interface CashflowSectionProps {
  fromDate: string;
  toDate: string;
  refreshSignal?: number;
}

export function CashflowSection({
  fromDate,
  toDate,
  refreshSignal = 0,
}: CashflowSectionProps) {
  const [granularity, setGranularity] = useState<'month' | 'day'>('month');

  const { data: report, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['finance-cashflow', fromDate, toDate, granularity, refreshSignal],
    queryFn: () =>
      getCashflowReport({
        fromDate,
        toDate,
        granularity,
      }),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="w-44">
          <Select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as 'month' | 'day')}
            options={CASHFLOW_GRANULARITY_OPTIONS}
            fullWidth
          />
        </div>
        <div className="flex items-center gap-2">
          {report && (
            <Button variant="outline" size="sm" onClick={() => exportCashflowExcel(report)} leftIcon={<Download size={14} />}>
              Xuất Excel Dòng tiền
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
        <Alert variant="danger" title="Không thể tải báo cáo Lưu chuyển dòng tiền">
          {getErrorMessage(error)}
        </Alert>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
              <div className="text-xs text-slate-500">Tổng Dòng tiền Thu vào</div>
              <div className="text-lg font-mono font-bold text-emerald-700 tabular-nums mt-1">{formatCurrency(report.totalIn)}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
              <div className="text-xs text-slate-500">Tổng Dòng tiền Chi ra</div>
              <div className="text-lg font-mono font-bold text-rose-700 tabular-nums mt-1">{formatCurrency(report.totalOut)}</div>
            </div>
            <div className="bg-white rounded-xl border border-primary/30 bg-primary/5 p-3.5">
              <div className="text-xs text-primary font-semibold">Lưu chuyển Tiền thuần</div>
              <div className="text-lg font-mono font-bold text-primary tabular-nums mt-1">{formatCurrency(report.netCashflow)}</div>
            </div>
          </div>

          {report.series.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs font-bold text-slate-700 mb-3">Biểu đồ Lưu chuyển Tiền Thu / Chi theo kỳ</div>
              <div className="h-64 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <BarChart data={report.series}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="periodLabel" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickFormatter={(val: number) => (val >= 1_000_000 ? `${(val / 1_000_000).toFixed(0)}tr` : String(val))}
                    />
                    <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                    <Legend />
                    <Bar dataKey="totalIn" name="Tổng Thu" fill="#045863" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="totalOut" name="Tổng Chi" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Kỳ</th>
                    <th className="p-3 text-right">Thu TM</th>
                    <th className="p-3 text-right">Thu NH</th>
                    <th className="p-3 text-right">Tổng Thu</th>
                    <th className="p-3 text-right">Chi TM</th>
                    <th className="p-3 text-right">Chi NH</th>
                    <th className="p-3 text-right">Tổng Chi</th>
                    <th className="p-3 text-right">Thuần</th>
                    <th className="p-3 text-right">Lũy kế</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.series.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        Chưa có dữ liệu dòng tiền trong khoảng thời gian này.
                      </td>
                    </tr>
                  ) : (
                    report.series.map((item) => (
                      <tr key={item.periodKey} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{item.periodLabel}</td>
                        <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(item.cashIn)}</td>
                        <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(item.bankIn)}</td>
                        <td className="p-3 font-mono tabular-nums text-right font-semibold text-emerald-700">{formatCurrency(item.totalIn)}</td>
                        <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(item.cashOut)}</td>
                        <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(item.bankOut)}</td>
                        <td className="p-3 font-mono tabular-nums text-right font-semibold text-rose-700">{formatCurrency(item.totalOut)}</td>
                        <td className="p-3 font-mono tabular-nums text-right font-bold">{formatCurrency(item.netCashflow)}</td>
                        <td className="p-3 font-mono tabular-nums text-right font-bold text-primary">{formatCurrency(item.cumulativeBalance)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-primary/5 text-primary font-bold border-t-2 border-primary/20">
                  <tr>
                    <td colSpan={3} className="p-3 text-right uppercase">Tổng cộng</td>
                    <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(report.totalIn)}</td>
                    <td colSpan={2} />
                    <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(report.totalOut)}</td>
                    <td className="p-3 font-mono tabular-nums text-right text-sm">{formatCurrency(report.netCashflow)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
