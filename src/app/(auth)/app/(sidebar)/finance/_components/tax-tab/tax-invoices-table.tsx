'use client';

import React, { useMemo } from 'react';
import { Edit2, Eye, Trash2 } from 'lucide-react';
import { Badge, Button } from '@/components';
import { TAX_INVOICE_DIRECTION_MAP, VAT_RATE_MAP } from '@/config/finance';
import type { TaxInvoice, TaxInvoiceStatus } from '@/types';
import { formatCurrency } from '@/utils';
import { INVOICE_DEDUCTIBLE_BADGE_MAP, INVOICE_STATUS_MAP } from './tax-tab.constants';

interface TaxInvoicesTableProps {
  invoices: TaxInvoice[];
  onEdit: (invoice: TaxInvoice) => void;
  onDelete: (invoice: TaxInvoice) => void;
  onOpenVoucherDetail: (voucherId: number) => void;
}

export function TaxInvoicesTable({
  invoices,
  onEdit,
  onDelete,
  onOpenVoucherDetail,
}: TaxInvoicesTableProps) {
  const totals = useMemo(
    () =>
      invoices.reduce(
        (acc, inv) => ({
          taxable: acc.taxable + inv.taxableAmount,
          vat: acc.vat + inv.vatAmount,
          total: acc.total + inv.totalAmount,
        }),
        { taxable: 0, vat: 0, total: 0 },
      ),
    [invoices],
  );

  return (
    <>
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Loại</th>
                <th className="p-3">Ký hiệu / Số HĐ</th>
                <th className="p-3">Ngày HĐ</th>
                <th className="p-3">MST &amp; Đối tác</th>
                <th className="p-3 text-right">Chưa thuế</th>
                <th className="p-3 text-center">Thuế suất</th>
                <th className="p-3 text-right">Tiền thuế</th>
                <th className="p-3 text-right">Tổng tiền</th>
                <th className="p-3 text-center">Chứng từ</th>
                <th className="p-3 text-center">Khấu trừ / B4</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => {
                const dirMeta = TAX_INVOICE_DIRECTION_MAP[inv.direction];
                const vatMeta = VAT_RATE_MAP[inv.vatRate];
                const stMeta = INVOICE_STATUS_MAP[inv.status as TaxInvoiceStatus];
                const deductibleMeta =
                  INVOICE_DEDUCTIBLE_BADGE_MAP[inv.isTaxDeductible ? 'true' : 'false'];

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <Badge variant={dirMeta?.variant || 'default'} size="sm">
                        {dirMeta?.shortLabel || inv.direction}
                      </Badge>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">
                        {inv.invoiceSeries}-{inv.invoiceNumber}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Kỳ T{inv.taxPeriodMonth}/{inv.taxPeriodYear}
                      </div>
                    </td>
                    <td className="p-3 font-mono whitespace-nowrap">
                      {inv.invoiceDate.slice(0, 10)}
                    </td>
                    <td className="p-3 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">{inv.partnerName}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        MST: {inv.partnerTaxCode}
                      </div>
                    </td>
                    <td className="p-3 font-mono tabular-nums text-right">
                      {formatCurrency(inv.taxableAmount)}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={vatMeta?.variant || 'default'} size="sm">
                        {vatMeta?.shortLabel || inv.vatRate}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono tabular-nums text-right">
                      {formatCurrency(inv.vatAmount)}
                    </td>
                    <td className="p-3 font-mono tabular-nums text-right font-bold text-slate-900">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="p-3 text-center">
                      {inv.voucherId ? (
                        <button
                          type="button"
                          onClick={() => onOpenVoucherDetail(inv.voucherId!)}
                          className="inline-flex items-center gap-1 font-mono font-semibold text-primary hover:underline cursor-pointer"
                        >
                          <Eye size={12} />
                          {inv.voucherNo || `#${inv.voucherId}`}
                        </button>
                      ) : (
                        <span className="text-slate-400">Chưa gắn</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={deductibleMeta.variant} size="sm">
                        {deductibleMeta.shortLabel}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={stMeta?.variant || 'default'} size="sm">
                        {stMeta?.label || inv.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="xs" onClick={() => onEdit(inv)} title="Sửa">
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => onDelete(inv)}
                          title="Xóa"
                          className="text-rose-600"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-primary/5 text-primary font-bold border-t-2 border-primary/20">
              <tr>
                <td colSpan={4} className="p-3 text-right uppercase">
                  Tổng cộng ({invoices.length} hóa đơn)
                </td>
                <td className="p-3 font-mono tabular-nums text-right">
                  {formatCurrency(totals.taxable)}
                </td>
                <td />
                <td className="p-3 font-mono tabular-nums text-right">
                  {formatCurrency(totals.vat)}
                </td>
                <td className="p-3 font-mono tabular-nums text-right text-sm">
                  {formatCurrency(totals.total)}
                </td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {invoices.map((inv) => {
          const dirMeta = TAX_INVOICE_DIRECTION_MAP[inv.direction];
          const deductibleMeta =
            INVOICE_DEDUCTIBLE_BADGE_MAP[inv.isTaxDeductible ? 'true' : 'false'];
          return (
            <div key={inv.id} className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant={dirMeta?.variant || 'default'} size="sm">
                      {dirMeta?.shortLabel || inv.direction}
                    </Badge>
                    <Badge variant={deductibleMeta.variant} size="sm">
                      {deductibleMeta.shortLabel}
                    </Badge>
                  </div>
                  <div className="font-mono font-bold text-sm text-slate-900 mt-1">
                    {inv.invoiceSeries}-{inv.invoiceNumber}
                  </div>
                </div>
                <div className="font-mono tabular-nums text-right font-bold text-primary">
                  {formatCurrency(inv.totalAmount)}
                </div>
              </div>
              <div className="text-xs font-medium text-slate-800">{inv.partnerName}</div>
              <div className="text-[11px] text-slate-500">
                MST: {inv.partnerTaxCode} • {inv.invoiceDate.slice(0, 10)}
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                {inv.voucherId ? (
                  <button
                    type="button"
                    onClick={() => onOpenVoucherDetail(inv.voucherId!)}
                    className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-primary hover:underline cursor-pointer"
                  >
                    <Eye size={12} />
                    {inv.voucherNo || `#${inv.voucherId}`}
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400">Chưa gắn CT</span>
                )}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="xs" onClick={() => onEdit(inv)}>
                    Sửa
                  </Button>
                  <Button variant="danger" size="xs" onClick={() => onDelete(inv)}>
                    Xóa
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
