'use client';

import React from 'react';
import { CheckCircle2, FileX2 } from 'lucide-react';
import { Switch } from '@/components';
import { cn } from '@/utils/cn';
import type { VoucherType } from '@/types';
import { DEFAULT_NON_CASH_VAT_THRESHOLD } from './voucher-editor.constants';
import { InvoiceDeductibilityBanner } from './invoice-deductibility-banner';

export interface HasValidInvoiceSelectorProps {
  hasValidInvoice: boolean;
  onChange: (hasValidInvoice: boolean) => void;
  voucherType: VoucherType;
  totalAmount: number;
  nonCashVatThreshold?: number;
  nonInvoiceMediumThreshold?: number;
  nonInvoiceLargeThreshold?: number;
  hasVatInputLine?: boolean;
  hasLinkedInvoices?: boolean;
  hasCostAccountLine?: boolean;
  hasArchFix6ExemptLine?: boolean;
  hasProjectContext?: boolean;
  has811WithProject?: boolean;
  disabled?: boolean;
}

export function HasValidInvoiceSelector({
  hasValidInvoice,
  onChange,
  voucherType,
  totalAmount,
  nonCashVatThreshold = DEFAULT_NON_CASH_VAT_THRESHOLD,
  nonInvoiceMediumThreshold = 500_000,
  nonInvoiceLargeThreshold = 2_000_000,
  hasVatInputLine = false,
  hasLinkedInvoices = false,
  hasCostAccountLine = false,
  hasArchFix6ExemptLine = false,
  hasProjectContext = false,
  has811WithProject = false,
  disabled = false,
}: HasValidInvoiceSelectorProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-white">
        <div className="flex items-start gap-2.5">
          <div
            className={cn(
              'p-2 rounded-lg shrink-0 mt-0.5',
              hasValidInvoice
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700',
            )}
          >
            {hasValidInvoice ? <CheckCircle2 size={16} /> : <FileX2 size={16} />}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              {hasValidInvoice
                ? 'Có Hóa đơn GTGT hợp lệ (Đủ điều kiện Thuế)'
                : 'Không có Hóa đơn GTGT (Hoặc chứng từ nội bộ)'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Bật nếu giao dịch có Hóa đơn điện tử GTGT hợp pháp; tắt nếu là chi nội bộ, chi lẻ không hóa đơn hoặc bút toán tổng hợp.
            </div>
          </div>
        </div>

        <div className="shrink-0 pl-9 sm:pl-0">
          <Switch
            label="Có Hóa đơn GTGT hợp lệ"
            checked={hasValidInvoice}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
          />
        </div>
      </div>

      <InvoiceDeductibilityBanner
        voucherType={voucherType}
        hasValidInvoice={hasValidInvoice}
        totalAmount={totalAmount}
        nonCashVatThreshold={nonCashVatThreshold}
        nonInvoiceMediumThreshold={nonInvoiceMediumThreshold}
        nonInvoiceLargeThreshold={nonInvoiceLargeThreshold}
        hasVatInputLine={hasVatInputLine}
        hasLinkedInvoices={hasLinkedInvoices}
        hasCostAccountLine={hasCostAccountLine}
        hasArchFix6ExemptLine={hasArchFix6ExemptLine}
        hasProjectContext={hasProjectContext}
        has811WithProject={has811WithProject}
      />
    </div>
  );
}

export const TaxModeSelector = HasValidInvoiceSelector;
