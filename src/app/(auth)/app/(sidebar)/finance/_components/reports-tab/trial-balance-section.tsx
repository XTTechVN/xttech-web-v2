'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { Alert, Badge, Button, Skeleton, Switch, TableSearch } from '@/components';
import { getTrialBalanceReport } from '@/actions';
import { cn, formatCurrency, getErrorMessage, includesSearchText } from '@/utils';
import { exportTrialBalanceExcel } from '../../_utils';

interface TrialBalanceSectionProps {
  fromDate: string;
  toDate: string;
  refreshSignal?: number;
  onDrillAccount: (accountId: number) => void;
}

export function TrialBalanceSection({
  fromDate,
  toDate,
  refreshSignal = 0,
  onDrillAccount,
}: TrialBalanceSectionProps) {
  const [includeZeroBalance, setIncludeZeroBalance] = useState(false);
  const [search, setSearch] = useState('');

  const { data: report, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['finance-trial-balance', fromDate, toDate, includeZeroBalance, refreshSignal],
    queryFn: () =>
      getTrialBalanceReport({
        fromDate,
        toDate,
        includeZeroBalance,
      }),
  });

  const rows = useMemo(() => {
    const raw = report?.rows || [];
    if (!search.trim()) return raw;
    return raw.filter(
      (r) =>
        includesSearchText(r.accountCode, search) || includesSearchText(r.accountName, search),
    );
  }, [report, search]);

  const isBalanced =
    report !== undefined &&
    report.totalOpeningDebit === report.totalOpeningCredit &&
    report.totalPeriodDebit === report.totalPeriodCredit &&
    report.totalClosingDebit === report.totalClosingCredit;

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <TableSearch placeholder="Tìm mã TK hoặc tên tài khoản..." value={search} onChange={setSearch} className="w-64" />
          <Switch label="Hiện TK không có phát sinh" checked={includeZeroBalance} onChange={(e) => setIncludeZeroBalance(e.target.checked)} />
          {report && (
            <Badge variant={isBalanced ? 'success' : 'warning'} size="md">
              <span className="inline-flex items-center gap-1">
                {isBalanced ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                {isBalanced ? 'Cân đối Nợ = Có' : 'Cần kiểm tra cân đối Nợ/Có'}
              </span>
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {report && (
            <Button variant="outline" size="sm" onClick={() => exportTrialBalanceExcel(report)} leftIcon={<Download size={14} />}>
              Xuất Excel CĐPS
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
        <Alert variant="danger" title="Không thể tải Bảng cân đối phát sinh">
          {getErrorMessage(error)}
        </Alert>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : report ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Mã TK</th>
                  <th className="p-3">Tên tài khoản</th>
                  <th className="p-3 text-right">Đầu kỳ Nợ</th>
                  <th className="p-3 text-right">Đầu kỳ Có</th>
                  <th className="p-3 text-right">Phát sinh Nợ</th>
                  <th className="p-3 text-right">Phát sinh Có</th>
                  <th className="p-3 text-right">Cuối kỳ Nợ</th>
                  <th className="p-3 text-right">Cuối kỳ Có</th>
                  <th className="p-3 text-right">Sổ cái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">
                      Không có tài khoản phát sinh trong kỳ báo cáo.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const isParent = row.level <= 2 && row.accountCode.length <= 3;
                    return (
                      <tr
                        key={row.accountId}
                        className={cn('hover:bg-slate-50 transition-colors', isParent && 'bg-slate-50/70 font-semibold text-slate-900')}
                      >
                        <td
                          className="p-3 font-mono font-bold text-primary whitespace-nowrap"
                          style={{ paddingLeft: `${12 + Math.max(0, row.level - 1) * 14}px` }}
                        >
                          {row.accountCode}
                        </td>
                        <td className="p-3 min-w-[200px]">{row.accountName}</td>
                        <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(row.openingDebit)}</td>
                        <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(row.openingCredit)}</td>
                        <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(row.periodDebit)}</td>
                        <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(row.periodCredit)}</td>
                        <td className="p-3 font-mono tabular-nums text-right font-semibold">{formatCurrency(row.closingDebit)}</td>
                        <td className="p-3 font-mono tabular-nums text-right font-semibold">{formatCurrency(row.closingCredit)}</td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="xs" onClick={() => onDrillAccount(row.accountId)} title="Mở Sổ cái S03b-DN">
                            <ExternalLink size={13} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot className="bg-primary/5 text-primary font-bold border-t-2 border-primary/20">
                <tr>
                  <td colSpan={2} className="p-3 text-right uppercase">Tổng cộng phát sinh &amp; số dư ({rows.length} TK)</td>
                  <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(report.totalOpeningDebit)}</td>
                  <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(report.totalOpeningCredit)}</td>
                  <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(report.totalPeriodDebit)}</td>
                  <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(report.totalPeriodCredit)}</td>
                  <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(report.totalClosingDebit)}</td>
                  <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(report.totalClosingCredit)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
