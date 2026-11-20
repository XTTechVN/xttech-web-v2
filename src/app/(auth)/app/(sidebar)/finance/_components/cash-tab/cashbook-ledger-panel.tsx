'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Badge, Button, Input } from '@/components';
import { getCashbookReport } from '@/actions/finance';
import { formatCurrency } from '@/utils/currency';
import { showErrorToast, showSuccessToast } from '@/utils/error';
import { exportCashbookExcel } from '../../_utils';
import { getCurrentMonthDateRange } from '../overview-tab';
import { CashbookLedgerTable } from './cashbook-ledger-table';

export interface CashbookLedgerPanelProps {
  onOpenVoucherDetail: (voucherId: number) => void;
}

export function CashbookLedgerPanel({
  onOpenVoucherDetail,
}: CashbookLedgerPanelProps) {
  const defaultRange = getCurrentMonthDateRange();
  const [fromDate, setFromDate] = useState(defaultRange.fromDate);
  const [toDate, setToDate] = useState(defaultRange.toDate);
  const [exporting, setExporting] = useState(false);

  const { data: report, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['finance', 'reports', 'cashbook', fromDate, toDate],
    queryFn: () => getCashbookReport({ fromDate, toDate }),
  });

  const handleExport = async () => {
    if (!report) return;
    setExporting(true);
    try {
      await exportCashbookExcel(report);
      showSuccessToast('Đã xuất Sổ quỹ tiền mặt S07-DN (.xlsx)');
    } catch (err) {
      showErrorToast(err, 'Không thể xuất file Excel Sổ quỹ');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 items-end">
          <div className="flex items-center gap-2 h-10 px-3 rounded-lg bg-primary/5 border border-primary/20 text-xs font-semibold text-primary">
            <span>Sổ Quỹ Tiền mặt (Mẫu S07-DN)</span>
            <Badge variant="primary" size="sm">TK 1111</Badge>
          </div>
          <Input
            label="Từ ngày"
            type="date"
            fullWidth
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input
            label="Đến ngày"
            type="date"
            fullWidth
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="xs"
            loading={isFetching}
            leftIcon={<RefreshCw size={13} />}
            onClick={() => refetch()}
          >
            Xem sổ
          </Button>
          <Button
            type="button"
            variant="primary"
            size="xs"
            disabled={!report}
            loading={exporting}
            leftIcon={<FileSpreadsheet size={14} />}
            onClick={handleExport}
          >
            Xuất Excel S07-DN
          </Button>
        </div>
      </div>

      {report && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-[11px] text-slate-500">Tồn đầu kỳ</div>
            <div className="text-sm font-mono tabular-nums text-right font-bold text-slate-900 mt-0.5">
              {formatCurrency(report.openingBalance)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-[11px] text-slate-500">Tổng Thu trong kỳ</div>
            <div className="text-sm font-mono tabular-nums text-right font-bold text-emerald-700 mt-0.5">
              +{formatCurrency(report.totalReceipt)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-[11px] text-slate-500">Tổng Chi trong kỳ</div>
            <div className="text-sm font-mono tabular-nums text-right font-bold text-rose-600 mt-0.5">
              -{formatCurrency(report.totalPayment)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
            <div className="text-[11px] text-primary font-semibold">Tồn cuối kỳ (TK 1111)</div>
            <div className="text-sm font-mono tabular-nums text-right font-bold text-primary mt-0.5">
              {formatCurrency(report.closingBalance)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 col-span-2 md:col-span-1">
            <div className="text-[11px] text-amber-800">
              Nháp chờ ghi sổ ({report.pendingDraftCount} phiếu)
            </div>
            <div className="text-sm font-mono tabular-nums text-right font-bold text-amber-700 mt-0.5">
              {formatCurrency(report.pendingDraftAmount)}
            </div>
          </div>
        </div>
      )}

      <CashbookLedgerTable
        report={report}
        isLoading={isLoading}
        onOpenVoucherDetail={onOpenVoucherDetail}
      />
    </div>
  );
}
