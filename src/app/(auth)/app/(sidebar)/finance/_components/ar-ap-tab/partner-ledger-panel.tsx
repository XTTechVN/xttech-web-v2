'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, X } from 'lucide-react';
import { Alert, Badge, Skeleton } from '@/components';
import { getGeneralLedgerReport } from '@/actions';
import type { ArApAgingItem } from '@/types';
import { formatCurrency, getErrorMessage } from '@/utils';

interface PartnerLedgerPanelProps {
  partner: ArApAgingItem;
  kind: 'receivable' | 'payable';
  asOfDate: string;
  onClose: () => void;
  onOpenVoucherDetail: (voucherId: number) => void;
}

export function PartnerLedgerPanel({
  partner,
  kind,
  asOfDate,
  onClose,
  onOpenVoucherDetail,
}: PartnerLedgerPanelProps) {
  const fromDate = `${asOfDate.slice(0, 4)}-01-01`;
  const accountCode =
    partner.partnerType === 'employee'
      ? '141'
      : kind === 'receivable'
        ? '131'
        : '331';

  const { data: report, isLoading, isError, error } = useQuery({
    queryKey: [
      'finance-partner-ledger',
      accountCode,
      partner.partnerType,
      partner.partnerId,
      partner.employeeId ?? null,
      fromDate,
      asOfDate,
    ],
    queryFn: () =>
      getGeneralLedgerReport({
        accountCode,
        fromDate,
        toDate: asOfDate,
        reportViewMode: 'all',
        partnerType: partner.partnerType,
        customerId: partner.partnerType === 'customer' ? partner.partnerId : undefined,
        supplierId: partner.partnerType === 'supplier' ? partner.partnerId : undefined,
        employeeId:
          partner.partnerType === 'employee' ? (partner.employeeId ?? undefined) : undefined,
      }),
  });

  return (
    <div className="bg-white rounded-xl border border-primary/30 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-b border-primary/20">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen size={16} className="text-primary shrink-0" />
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-primary truncate">
              Sổ chi tiết TK {accountCode} — {partner.partnerName}
            </h4>
            <p className="text-[11px] text-slate-600">
              Từ đầu năm đến {asOfDate} • Mã đối tượng: {partner.partnerCode || `#${partner.partnerId}`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {isError && (
        <div className="p-4">
          <Alert variant="danger" title="Không thể tải sổ chi tiết công nợ">
            {getErrorMessage(error)}
          </Alert>
        </div>
      )}

      {isLoading ? (
        <div className="p-4 space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : !report || report.items.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500">
          Chưa có phát sinh ghi sổ chi tiết trong kỳ cho đối tượng này.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Ngày ghi sổ</th>
                <th className="p-2.5">Số chứng từ</th>
                <th className="p-2.5">TK đối ứng</th>
                <th className="p-2.5">Diễn giải</th>
                <th className="p-2.5 text-right">Phát sinh Nợ</th>
                <th className="p-2.5 text-right">Phát sinh Có</th>
                <th className="p-2.5 text-right">Lũy kế</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.items.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="p-2.5 font-mono whitespace-nowrap">{entry.postingDate.slice(0, 10)}</td>
                  <td className="p-2.5">
                    <button
                      type="button"
                      onClick={() => onOpenVoucherDetail(entry.voucherId)}
                      className="font-mono font-semibold text-primary hover:underline cursor-pointer"
                    >
                      {entry.voucherNo}
                    </button>
                  </td>
                  <td className="p-2.5">
                    <Badge variant="default" size="sm">{entry.contraAccountCode}</Badge>
                  </td>
                  <td className="p-2.5 max-w-sm truncate">{entry.description}</td>
                  <td className="p-2.5 font-mono tabular-nums text-right">
                    {entry.debitAmount > 0 ? formatCurrency(entry.debitAmount) : '-'}
                  </td>
                  <td className="p-2.5 font-mono tabular-nums text-right">
                    {entry.creditAmount > 0 ? formatCurrency(entry.creditAmount) : '-'}
                  </td>
                  <td className="p-2.5 font-mono tabular-nums text-right font-semibold text-slate-900">
                    {formatCurrency(entry.runningBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-primary/5 text-primary font-bold border-t border-primary/20">
              <tr>
                <td colSpan={4} className="p-2.5 text-right">
                  Cộng phát sinh &amp; Dư cuối kỳ
                </td>
                <td className="p-2.5 font-mono tabular-nums text-right">{formatCurrency(report.periodDebit)}</td>
                <td className="p-2.5 font-mono tabular-nums text-right">{formatCurrency(report.periodCredit)}</td>
                <td className="p-2.5 font-mono tabular-nums text-right">
                  {formatCurrency(report.closingDebit - report.closingCredit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
