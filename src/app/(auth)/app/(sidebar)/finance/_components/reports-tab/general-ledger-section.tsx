'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Eye, RefreshCw } from 'lucide-react';
import { Alert, Badge, Button, Select, Skeleton, TableSearch } from '@/components';
import { getGeneralLedgerReport } from '@/actions';
import { getTaxDeductibleBadge } from '@/config/finance';
import type { Account, ReportViewMode } from '@/types';
import { formatCurrency, getErrorMessage, includesSearchText } from '@/utils';
import { exportGeneralLedgerExcel } from '../../_utils';

interface GeneralLedgerSectionProps {
  accounts: Account[];
  selectedAccountId?: number;
  fromDate: string;
  toDate: string;
  reportViewMode: ReportViewMode;
  refreshSignal?: number;
  onSelectAccountId: (accountId: number | undefined) => void;
  onOpenVoucherDetail: (voucherId: number) => void;
}

export function GeneralLedgerSection({
  accounts,
  selectedAccountId,
  fromDate,
  toDate,
  reportViewMode,
  refreshSignal = 0,
  onSelectAccountId,
  onOpenVoucherDetail,
}: GeneralLedgerSectionProps) {
  const [search, setSearch] = useState('');

  const { data: report, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: [
      'finance-general-ledger',
      selectedAccountId,
      fromDate,
      toDate,
      reportViewMode,
      refreshSignal,
    ],
    queryFn: () =>
      getGeneralLedgerReport({
        accountId: selectedAccountId,
        fromDate,
        toDate,
        reportViewMode,
      }),
  });

  const accountOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả tài khoản' },
      ...accounts.map((a) => ({ value: String(a.id), label: `${a.accountCode} - ${a.name}` })),
    ],
    [accounts],
  );

  const items = useMemo(() => {
    const raw = report?.items || [];
    if (!search.trim()) return raw;
    return raw.filter(
      (entry) =>
        includesSearchText(entry.voucherNo, search) ||
        includesSearchText(entry.description, search) ||
        includesSearchText(entry.contraAccountCode, search) ||
        includesSearchText(entry.partnerName, search),
    );
  }, [report, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="w-72">
            <Select
              value={selectedAccountId ? String(selectedAccountId) : ''}
              onChange={(e) => onSelectAccountId(e.target.value ? Number(e.target.value) : undefined)}
              options={accountOptions}
              searchable
              fullWidth
            />
          </div>
          <TableSearch placeholder="Tìm số CT, TK đối ứng, diễn giải..." value={search} onChange={setSearch} className="w-64" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {report && (
            <Button variant="outline" size="sm" onClick={() => exportGeneralLedgerExcel(report)} leftIcon={<Download size={14} />}>
              Xuất Excel S03b-DN
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
        <Alert variant="danger" title="Không thể tải Sổ cái S03b-DN">
          {getErrorMessage(error)}
        </Alert>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="text-[11px] text-slate-500">Đầu kỳ (Nợ / Có)</div>
              <div className="text-xs font-mono font-bold text-slate-900 mt-1">
                {formatCurrency(report.openingDebit)} / {formatCurrency(report.openingCredit)}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="text-[11px] text-slate-500">Tổng phát sinh Nợ</div>
              <div className="text-sm font-mono font-bold text-emerald-700 tabular-nums mt-1">{formatCurrency(report.periodDebit)}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="text-[11px] text-slate-500">Tổng phát sinh Có</div>
              <div className="text-sm font-mono font-bold text-rose-700 tabular-nums mt-1">{formatCurrency(report.periodCredit)}</div>
            </div>
            <div className="bg-white rounded-xl border border-primary/30 bg-primary/5 p-3">
              <div className="text-[11px] text-primary font-semibold">Cuối kỳ (Nợ / Có)</div>
              <div className="text-xs font-mono font-bold text-primary mt-1">
                {formatCurrency(report.closingDebit)} / {formatCurrency(report.closingCredit)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Ngày GS</th>
                    <th className="p-3">Số CT</th>
                    <th className="p-3">TK</th>
                    <th className="p-3">TK ĐƯ</th>
                    <th className="p-3">Diễn giải &amp; Đối tượng</th>
                    <th className="p-3 text-right">PS Nợ</th>
                    <th className="p-3 text-right">PS Có</th>
                    <th className="p-3 text-right">Số dư lũy kế</th>
                    <th className="p-3 text-center">Tính hợp lệ thuế (B4)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        Không có phát sinh ghi sổ cái S03b-DN trong kỳ.
                      </td>
                    </tr>
                  ) : (
                    items.map((entry) => {
                      const deductibleMeta = getTaxDeductibleBadge(entry.isTaxDeductible);
                      return (
                        <tr key={entry.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono whitespace-nowrap">{entry.postingDate.slice(0, 10)}</td>
                          <td className="p-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onOpenVoucherDetail(entry.voucherId)}
                              className="inline-flex items-center gap-1 font-mono font-bold text-primary hover:underline cursor-pointer"
                            >
                              <Eye size={12} />
                              {entry.voucherNo}
                            </button>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-900">{entry.accountCode}</td>
                          <td className="p-3"><Badge variant="default" size="sm">{entry.contraAccountCode}</Badge></td>
                          <td className="p-3 max-w-xs">
                            <div className="text-slate-900 font-medium line-clamp-2">{entry.description}</div>
                            {(entry.partnerName || entry.projectName) && (
                              <div className="text-[11px] text-slate-500">
                                {entry.partnerName || ''}
                                {entry.partnerName && entry.projectCode ? ' • ' : ''}
                                {entry.projectCode || entry.projectName || ''}
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-mono tabular-nums text-right">
                            {entry.debitAmount > 0 ? formatCurrency(entry.debitAmount) : '-'}
                          </td>
                          <td className="p-3 font-mono tabular-nums text-right">
                            {entry.creditAmount > 0 ? formatCurrency(entry.creditAmount) : '-'}
                          </td>
                          <td className="p-3 font-mono tabular-nums text-right font-bold text-slate-900">
                            {formatCurrency(entry.runningBalance)}
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant={deductibleMeta.variant} size="sm">
                              {deductibleMeta.shortLabel || deductibleMeta.label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot className="bg-primary/5 text-primary font-bold border-t-2 border-primary/20">
                  <tr>
                    <td colSpan={5} className="p-3 text-right uppercase">Cộng phát sinh trong kỳ ({items.length} dòng)</td>
                    <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(report.periodDebit)}</td>
                    <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(report.periodCredit)}</td>
                    <td colSpan={2} />
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
