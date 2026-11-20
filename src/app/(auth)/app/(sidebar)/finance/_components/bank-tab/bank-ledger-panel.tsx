'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Badge, Button, Input, Select } from '@/components';
import { getGeneralLedgerReport } from '@/actions/finance';
import { getTaxDeductibleBadge } from '@/config/finance';
import { formatCurrency } from '@/utils/currency';
import { showErrorToast, showSuccessToast } from '@/utils/error';
import type { BankAccount } from '@/types';
import { exportGeneralLedgerExcel } from '../../_utils';
import { getCurrentMonthDateRange } from '../overview-tab';

export interface BankLedgerPanelProps {
  banks: BankAccount[];
  selectedBankId: number | null;
  onSelectBankId: (bankId: number | null) => void;
  onOpenVoucherDetail: (voucherId: number) => void;
}

export function BankLedgerPanel({
  banks,
  selectedBankId,
  onSelectBankId,
  onOpenVoucherDetail,
}: BankLedgerPanelProps) {
  const defaultRange = getCurrentMonthDateRange();
  const [fromDate, setFromDate] = useState(defaultRange.fromDate);
  const [toDate, setToDate] = useState(defaultRange.toDate);
  const [exporting, setExporting] = useState(false);

  const selectedBank = banks.find((b) => b.id === selectedBankId) || null;
  const effectiveAccountId = selectedBank?.glAccountId;

  const { data: report, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['finance', 'reports', 'bank-ledger', effectiveAccountId, selectedBankId, fromDate, toDate],
    queryFn: () =>
      getGeneralLedgerReport({
        accountId: effectiveAccountId || undefined,
        accountCode: effectiveAccountId ? undefined : '1121',
        bankAccountId: selectedBankId || undefined,
        fromDate,
        toDate,
      }),
  });

  const handleExport = async () => {
    if (!report) return;
    setExporting(true);
    try {
      await exportGeneralLedgerExcel(report);
      showSuccessToast('Đã xuất Sổ Tiền gửi Ngân hàng (.xlsx)');
    } catch (err) {
      showErrorToast(err, 'Không thể xuất file Excel Sổ TGNH');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1">
          <Select
            label="Lọc theo TK Ngân hàng"
            fullWidth
            value={selectedBankId ?? ''}
            options={[
              { value: '', label: 'Tất cả TK 1121' },
              ...banks.map((b) => ({
                value: b.id,
                label: `${b.bankCode} - ${b.accountNumber} (${b.bankName})`,
              })),
            ]}
            onChange={(e) => onSelectBankId(e.target.value ? Number(e.target.value) : null)}
          />
          <Input label="Từ ngày" type="date" fullWidth value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <Input label="Đến ngày" type="date" fullWidth value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button type="button" variant="outline" size="xs" loading={isFetching} leftIcon={<RefreshCw size={13} />} onClick={() => refetch()}>
            Xem sổ
          </Button>
          <Button type="button" variant="primary" size="xs" disabled={!report} loading={exporting} leftIcon={<FileSpreadsheet size={14} />} onClick={handleExport}>
            Xuất Excel TGNH
          </Button>
        </div>
      </div>

      {report && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-[11px] text-slate-500">Số dư đầu kỳ (Nợ)</div>
            <div className="text-sm font-mono tabular-nums text-right font-bold text-slate-900 mt-0.5">
              {formatCurrency(report.openingDebit - report.openingCredit)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-[11px] text-slate-500">Tổng Thu (Phát sinh Nợ)</div>
            <div className="text-sm font-mono tabular-nums text-right font-bold text-emerald-700 mt-0.5">
              +{formatCurrency(report.periodDebit)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-[11px] text-slate-500">Tổng Chi (Phát sinh Có)</div>
            <div className="text-sm font-mono tabular-nums text-right font-bold text-rose-600 mt-0.5">
              -{formatCurrency(report.periodCredit)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
            <div className="text-[11px] text-primary font-semibold">Số dư cuối kỳ</div>
            <div className="text-sm font-mono tabular-nums text-right font-bold text-primary mt-0.5">
              {formatCurrency(report.closingDebit - report.closingCredit)}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Ngày ghi sổ</th>
                <th className="p-3">Số CT</th>
                <th className="p-3">Diễn giải / Đối tượng</th>
                <th className="p-3 text-center">TK ĐƯ</th>
                <th className="p-3 text-right">Thu vào (Nợ)</th>
                <th className="p-3 text-right">Chi ra (Có)</th>
                <th className="p-3 text-right">Số dư lũy kế</th>
                <th className="p-3 text-center">Thuế (B4)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={8} className="p-8 text-center text-slate-400">Đang tổng hợp Sổ tiền gửi ngân hàng...</td></tr>
              ) : !report || report.items.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-slate-400">Chưa có bút toán ngân hàng đã ghi sổ trong kỳ.</td></tr>
              ) : (
                report.items.map((item) => {
                  const taxBadge = getTaxDeductibleBadge(item.isTaxDeductible);
                  return (
                    <tr key={item.id} onClick={() => onOpenVoucherDetail(item.voucherId)} className="hover:bg-slate-50 cursor-pointer">
                      <td className="p-3 whitespace-nowrap">{item.postingDate}</td>
                      <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">{item.voucherNo}</td>
                      <td className="p-3 max-w-[260px]">
                        <div className="font-medium text-slate-800 truncate">{item.description}</div>
                        {item.partnerName && <div className="text-[11px] text-slate-400 truncate">{item.partnerName}</div>}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-700">{item.contraAccountCode}</td>
                      <td className="p-3 font-mono tabular-nums text-right font-semibold text-emerald-700 whitespace-nowrap">
                        {item.debitAmount > 0 ? formatCurrency(item.debitAmount) : '-'}
                      </td>
                      <td className="p-3 font-mono tabular-nums text-right font-semibold text-rose-600 whitespace-nowrap">
                        {item.creditAmount > 0 ? formatCurrency(item.creditAmount) : '-'}
                      </td>
                      <td className="p-3 font-mono tabular-nums text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrency(item.runningBalance)}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={taxBadge.variant} size="sm">
                          {taxBadge.shortLabel || taxBadge.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {report && (
              <tfoot className="bg-primary/5 border-t border-primary/20">
                <tr>
                  <td colSpan={4} className="p-3 text-right font-bold text-primary">CỘNG PHÁT SINH &amp; DƯ CUỐI KỲ:</td>
                  <td className="p-3 font-mono tabular-nums text-right font-bold text-primary">{formatCurrency(report.periodDebit)}</td>
                  <td className="p-3 font-mono tabular-nums text-right font-bold text-primary">{formatCurrency(report.periodCredit)}</td>
                  <td className="p-3 font-mono tabular-nums text-right font-bold text-primary">{formatCurrency(report.closingDebit - report.closingCredit)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
