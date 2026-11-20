'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { Badge, Button } from '@/components';
import { VAT_RATE_MAP } from '@/config/finance';
import type { TaxInvoice, VatLedgerReport } from '@/types';
import { formatCurrency } from '@/utils';
import { INVOICE_DEDUCTIBLE_BADGE_MAP } from './tax-tab.constants';

interface VatLedgerTableProps {
  ledgerView: 'input' | 'output';
  report: VatLedgerReport;
  onChangeView: (view: 'input' | 'output') => void;
  onOpenVoucherDetail: (voucherId: number) => void;
}

export function VatLedgerTable({
  ledgerView,
  report,
  onChangeView,
  onOpenVoucherDetail,
}: VatLedgerTableProps) {
  const rows: TaxInvoice[] =
    ledgerView === 'input' ? report.inputInvoices : report.outputInvoices;
  const totalTaxable =
    ledgerView === 'input' ? report.totalInputTaxable : report.totalOutputTaxable;
  const totalVat =
    ledgerView === 'input' ? report.totalInputVat : report.totalOutputVat;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="flex items-center gap-2 p-3 border-b border-slate-200 bg-slate-50">
        <Button
          variant={ledgerView === 'input' ? 'primary' : 'outline'}
          size="xs"
          onClick={() => onChangeView('input')}
        >
          Bảng kê Mua vào ({report.inputInvoices.length})
        </Button>
        <Button
          variant={ledgerView === 'output' ? 'primary' : 'outline'}
          size="xs"
          onClick={() => onChangeView('output')}
        >
          Bảng kê Bán ra ({report.outputInvoices.length})
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3">Ký hiệu / Số HĐ</th>
              <th className="p-3">Ngày HĐ</th>
              <th className="p-3">MST &amp; Đối tác</th>
              <th className="p-3 text-right">Giá trị chưa thuế</th>
              <th className="p-3 text-center">Thuế suất</th>
              <th className="p-3 text-right">Tiền thuế GTGT</th>
              <th className="p-3 text-center">Khấu trừ</th>
              <th className="p-3 text-center">Số CT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  Không có hóa đơn trong kỳ này.
                </td>
              </tr>
            ) : (
              rows.map((inv) => {
                const deductibleMeta =
                  INVOICE_DEDUCTIBLE_BADGE_MAP[inv.isTaxDeductible ? 'true' : 'false'];
                return (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {inv.invoiceSeries}-{inv.invoiceNumber}
                    </td>
                    <td className="p-3 font-mono whitespace-nowrap">
                      {inv.invoiceDate.slice(0, 10)}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-900">{inv.partnerName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{inv.partnerTaxCode}</div>
                    </td>
                    <td className="p-3 font-mono tabular-nums text-right">
                      {formatCurrency(inv.taxableAmount)}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={VAT_RATE_MAP[inv.vatRate]?.variant || 'default'} size="sm">
                        {VAT_RATE_MAP[inv.vatRate]?.shortLabel || inv.vatRate}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono tabular-nums text-right font-semibold">
                      {formatCurrency(inv.vatAmount)}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={deductibleMeta.variant} size="sm">
                        {deductibleMeta.shortLabel}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      {inv.voucherId ? (
                        <button
                          type="button"
                          onClick={() => onOpenVoucherDetail(inv.voucherId!)}
                          className="inline-flex items-center gap-1 font-mono text-primary hover:underline cursor-pointer"
                        >
                          <Eye size={12} />
                          {inv.voucherNo || `#${inv.voucherId}`}
                        </button>
                      ) : (
                        '---'
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot className="bg-primary/5 text-primary font-bold border-t-2 border-primary/20">
            <tr>
              <td colSpan={3} className="p-3 text-right uppercase">
                Tổng cộng bảng kê
              </td>
              <td className="p-3 font-mono tabular-nums text-right">
                {formatCurrency(totalTaxable)}
              </td>
              <td />
              <td className="p-3 font-mono tabular-nums text-right">
                {formatCurrency(totalVat)}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
