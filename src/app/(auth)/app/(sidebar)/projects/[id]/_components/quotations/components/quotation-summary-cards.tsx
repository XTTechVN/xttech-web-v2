'use client';

import React from 'react';
import { Badge } from '@/components';
import { QUOTATION_STATUS_MAP } from '@/config';
import type { ProjectQuotationDetail } from '@/types';
import { formatCurrency } from '@/utils';

interface SummaryCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  valueClass?: string;
}

function SummaryCard({ label, value, hint, valueClass = 'text-slate-800' }: SummaryCardProps) {
  return (
    <div className="bg-white p-3.5 rounded-lg border border-slate-200/70 shadow-2xs">
      <span className="text-xs font-medium text-slate-500 block">{label}</span>
      <div className={`text-base font-bold mt-1 ${valueClass}`}>{value}</div>
      {hint && <div className="text-[11px] text-slate-400 mt-0.5">{hint}</div>}
    </div>
  );
}

export function QuotationSummaryCards({ quotation }: { quotation: ProjectQuotationDetail }) {
  const status = QUOTATION_STATUS_MAP[quotation.status];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      <SummaryCard
        label="Báo giá hiện hành"
        value={
          <span className="flex items-center gap-2">
            {quotation.code}
            <Badge variant={status?.variant ?? 'default'} size="sm">
              {status?.label ?? quotation.status}
            </Badge>
          </span>
        }
        hint={`Phiên bản v${quotation.version}`}
        valueClass="text-primary"
      />
      <SummaryCard
        label="Chi phí làm ra"
        value={formatCurrency(quotation.workshopPrice)}
        hint="Giá vốn toàn bộ"
      />
      <SummaryCard
        label="Khách phải trả (đã gồm thuế)"
        value={formatCurrency(quotation.totalAmount)}
        hint="Giá trị dùng để lập hợp đồng"
      />
      <SummaryCard
        label="Tiền lãi"
        value={`+${formatCurrency(quotation.totalProfit)}`}
        hint={`${(quotation.effectiveMarginPercent ?? 0).toFixed(1)}% trên giá bán`}
        valueClass="text-emerald-600"
      />
    </div>
  );
}
