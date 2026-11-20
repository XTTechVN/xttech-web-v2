'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { RefreshCw, Users } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Skeleton,
  TableSearch,
} from '@/components';
import { getGeneralLedgerReport, getVouchers } from '@/actions';
import { formatCurrency, getErrorMessage, includesSearchText } from '@/utils';
import { EmployeeAdvanceVoucherList } from './employee-advance-voucher-list';

interface EmployeeAdvanceSectionProps {
  refreshSignal?: number;
  onOpenVoucherDetail: (voucherId: number) => void;
}

interface EmployeeBalanceRow {
  employeeName: string;
  advanceTotal: number;
  settledTotal: number;
  remainingBalance: number;
}

export function EmployeeAdvanceSection({
  refreshSignal = 0,
  onOpenVoucherDetail,
}: EmployeeAdvanceSectionProps) {
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['finance-employee-advance-141', refreshSignal],
    queryFn: async () => {
      const fromDate = dayjs().startOf('year').format('YYYY-MM-DD');
      const toDate = dayjs().format('YYYY-MM-DD');
      const [vRes, glRes] = await Promise.all([
        getVouchers({ partnerType: 'employee', limit: 200 }),
        getGeneralLedgerReport({
          accountCode: '141',
          fromDate,
          toDate,
          reportViewMode: 'all',
        }).catch(() => null),
      ]);
      return {
        vouchers: vRes.items || [],
        ledgerEntries: glRes?.items || [],
      };
    },
  });

  const employeeSummaryRows = useMemo<EmployeeBalanceRow[]>(() => {
    const entries = data?.ledgerEntries || [];
    const map = new Map<string, EmployeeBalanceRow>();
    for (const entry of entries) {
      const name = entry.partnerName || 'Nhân viên chưa gán tên';
      const cur = map.get(name) || { employeeName: name, advanceTotal: 0, settledTotal: 0, remainingBalance: 0 };
      cur.advanceTotal += entry.debitAmount;
      cur.settledTotal += entry.creditAmount;
      cur.remainingBalance = cur.advanceTotal - cur.settledTotal;
      map.set(name, cur);
    }
    return Array.from(map.values()).filter(
      (r) => !search.trim() || includesSearchText(r.employeeName, search),
    );
  }, [data?.ledgerEntries, search]);

  const filteredVouchers = useMemo(() => {
    const list = data?.vouchers || [];
    return list.filter(
      (v) =>
        !search.trim() ||
        includesSearchText(v.voucherNo, search) ||
        includesSearchText(v.contactName || v.partnerName, search) ||
        includesSearchText(v.description, search),
    );
  }, [data?.vouchers, search]);

  const totals = useMemo(
    () =>
      employeeSummaryRows.reduce(
        (acc, r) => ({
          advance: acc.advance + r.advanceTotal,
          settled: acc.settled + r.settledTotal,
          remaining: acc.remaining + r.remainingBalance,
        }),
        { advance: 0, settled: 0, remaining: 0 },
      ),
    [employeeSummaryRows],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <TableSearch placeholder="Tìm nhân viên, đội thợ, số chứng từ 141..." value={search} onChange={setSearch} className="w-72" />
          <Badge variant="default" size="sm">
            100% Sổ Tài chính
          </Badge>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="primary" size="md">
            Còn nợ tạm ứng 141: {formatCurrency(totals.remaining)}
          </Badge>
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
        <Alert variant="danger" title="Không thể tải dữ liệu tạm ứng TK 141">
          {getErrorMessage(error)}
        </Alert>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <Users size={15} className="text-primary" />
              <h4 className="text-sm font-bold text-slate-900">
                Tổng hợp Tạm ứng / Hoàn ứng theo Nhân viên (TK 141)
              </h4>
            </div>
            {employeeSummaryRows.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Chưa có bút toán ghi sổ TK 141 trong năm hiện tại.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Nhân viên / Đội thợ</th>
                      <th className="p-3 text-right">Đã tạm ứng</th>
                      <th className="p-3 text-right">Đã hoàn ứng</th>
                      <th className="p-3 text-right">Còn phải thu hồi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employeeSummaryRows.map((row) => (
                      <tr key={row.employeeName} className="hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-900">{row.employeeName}</td>
                        <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(row.advanceTotal)}</td>
                        <td className="p-3 font-mono tabular-nums text-right text-emerald-700">{formatCurrency(row.settledTotal)}</td>
                        <td className="p-3 font-mono tabular-nums text-right font-bold text-primary">{formatCurrency(row.remainingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-primary/5 text-primary font-bold border-t-2 border-primary/20">
                    <tr>
                      <td className="p-3">TỔNG CỘNG TK 141</td>
                      <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(totals.advance)}</td>
                      <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(totals.settled)}</td>
                      <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(totals.remaining)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <EmployeeAdvanceVoucherList
            vouchers={filteredVouchers}
            onOpenVoucherDetail={onOpenVoucherDetail}
          />
        </div>
      )}
    </div>
  );
}
