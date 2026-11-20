'use client';

import React from 'react';
import { Badge } from '@/components';
import { getTaxDeductibleBadge } from '@/config/finance';
import { formatCurrency } from '@/utils/currency';
import type { CashbookReport } from '@/types';

export interface CashbookLedgerTableProps {
  report?: CashbookReport;
  isLoading: boolean;
  onOpenVoucherDetail: (voucherId: number) => void;
}

export function CashbookLedgerTable({
  report,
  isLoading,
  onOpenVoucherDetail,
}: CashbookLedgerTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3">Ngày CT</th>
              <th className="p-3">Số CT</th>
              <th className="p-3">Đối tượng / Diễn giải</th>
              <th className="p-3">TK đối ứng</th>
              <th className="p-3 text-right">Thu (VNĐ)</th>
              <th className="p-3 text-right">Chi (VNĐ)</th>
              <th className="p-3 text-right">Tồn quỹ (VNĐ)</th>
              <th className="p-3 text-center">Hóa đơn &amp; Hợp lệ thuế (B4)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  Đang tổng hợp Sổ quỹ S07-DN (TK 1111)...
                </td>
              </tr>
            ) : !report || report.items.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  Không có phát sinh đã ghi sổ trong khoảng thời gian đã chọn.
                </td>
              </tr>
            ) : (
              report.items.map((item) => {
                const taxBadge = getTaxDeductibleBadge(item.isTaxDeductible);
                return (
                  <tr
                    key={item.id}
                    onClick={() => onOpenVoucherDetail(item.voucherId)}
                    className="hover:bg-slate-50 cursor-pointer"
                  >
                    <td className="p-3 whitespace-nowrap">{item.voucherDate}</td>
                    <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.voucherNo}
                    </td>
                    <td className="p-3 max-w-[260px]">
                      <div className="font-medium text-slate-800 truncate">{item.description}</div>
                      {item.partnerName && (
                        <div className="text-[11px] text-slate-400 truncate">
                          {item.partnerName}
                        </div>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="font-mono font-semibold text-slate-700">
                        {item.contraAccountCode || '---'}
                      </span>
                      {item.contraAccountName && (
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {item.contraAccountName}
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-mono tabular-nums text-right font-semibold text-emerald-700 whitespace-nowrap">
                      {item.receiptAmount > 0 ? formatCurrency(item.receiptAmount) : '-'}
                    </td>
                    <td className="p-3 font-mono tabular-nums text-right font-semibold text-rose-600 whitespace-nowrap">
                      {item.paymentAmount > 0 ? formatCurrency(item.paymentAmount) : '-'}
                    </td>
                    <td className="p-3 font-mono tabular-nums text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(item.runningBalance)}
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex flex-wrap items-center justify-center gap-1">
                        <Badge variant={item.hasValidInvoice ? 'info' : 'default'} size="sm">
                          {item.hasValidInvoice ? 'Hóa đơn GTGT' : 'Không HĐ'}
                        </Badge>
                        <Badge variant={taxBadge.variant} size="sm">
                          {taxBadge.shortLabel || taxBadge.label}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {report && (
            <tfoot className="bg-primary/5 border-t border-primary/20">
              <tr>
                <td colSpan={4} className="p-3 text-right font-bold text-primary">
                  CỘNG PHÁT SINH &amp; TỒN CUỐI KỲ (TK 1111):
                </td>
                <td className="p-3 font-mono tabular-nums text-right font-bold text-primary">
                  {formatCurrency(report.totalReceipt)}
                </td>
                <td className="p-3 font-mono tabular-nums text-right font-bold text-primary">
                  {formatCurrency(report.totalPayment)}
                </td>
                <td className="p-3 font-mono tabular-nums text-right font-bold text-primary">
                  {formatCurrency(report.closingBalance)}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
