'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Badge, Button } from '@/components';
import { TAX_INVOICE_DIRECTION_MAP, VAT_RATE_MAP } from '@/config/finance';
import { formatCurrency } from '@/utils/currency';
import type { TaxInvoice } from '@/types';

export interface AccountantInvoiceListProps {
  linkedInvoices: TaxInvoice[];
  onGenerateVatLineFromInvoice: (invoice: TaxInvoice) => void;
  onUnlinkInvoice: (invoiceId: number) => void;
  disabled?: boolean;
}

export function AccountantInvoiceList({
  linkedInvoices,
  onGenerateVatLineFromInvoice,
  onUnlinkInvoice,
  disabled = false,
}: AccountantInvoiceListProps) {
  if (linkedInvoices.length === 0) return null;

  return (
    <div className="space-y-2">
      {linkedInvoices.map((inv) => {
        const dirMeta = TAX_INVOICE_DIRECTION_MAP[inv.direction];
        const vatMeta = VAT_RATE_MAP[inv.vatRate];
        return (
          <div
            key={inv.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-slate-200 bg-white text-xs"
          >
            <div className="space-y-0.5 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant={dirMeta?.variant || 'info'} size="sm">
                  {dirMeta?.shortLabel || inv.direction}
                </Badge>
                <span className="font-mono font-bold text-slate-900">
                  {inv.invoiceSeries} / {inv.invoiceNumber}
                </span>
                <span className="text-slate-400">({inv.invoiceDate})</span>
                <Badge variant={vatMeta?.variant || 'default'} size="sm">
                  VAT {vatMeta?.shortLabel || inv.vatRate}
                </Badge>
              </div>
              <div className="text-slate-600 truncate">
                MST <span className="font-mono">{inv.partnerTaxCode}</span> — {inv.partnerName}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right font-mono tabular-nums">
                <div className="text-[11px] text-slate-500">
                  Chưa thuế: {formatCurrency(inv.taxableAmount)} | VAT:{' '}
                  {formatCurrency(inv.vatAmount)}
                </div>
                <div className="font-bold text-primary">{formatCurrency(inv.totalAmount)}</div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                disabled={disabled}
                onClick={() => onGenerateVatLineFromInvoice(inv)}
              >
                + Dòng VAT
              </Button>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onUnlinkInvoice(inv.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                  title="Gỡ liên kết hóa đơn"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
