'use client';

import React from 'react';
import { AlertTriangle, Calculator, Info, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components';
import { formatCurrency } from '@/utils';

export interface CitEstimateMetrics {
  accountingProfit: number;
  nonDeductibleExpenseTotal: number;
  nonDeductibleInventoryWipTotal: number;
  taxableIncome: number;
  estimatedCitAmount: number;
  taxSavingsLostEstimate: number;
}

export interface CitEstimateCardProps {
  metrics: CitEstimateMetrics;
  periodLabel?: string;
}

export function CitEstimateCard({ metrics, periodLabel }: CitEstimateCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Calculator size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Dự toán Thuế TNDN (20%) &amp; Điều chỉnh Chỉ tiêu B4
            </h4>
            <p className="text-[11px] text-slate-500">
              Quy đổi tự động từ Lợi nhuận kế toán sang Thu nhập chịu thuế trên Sổ Tài chính hợp nhất
            </p>
          </div>
        </div>
        {periodLabel && (
          <Badge variant="primary" size="sm">
            Kỳ: {periodLabel}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <div className="text-xs text-slate-600">Lợi nhuận kế toán trước thuế</div>
          <div className="text-lg font-mono font-bold text-slate-900 tabular-nums text-right mt-1.5">
            {formatCurrency(metrics.accountingProfit)}
          </div>
          <div className="text-[11px] text-slate-400 text-right mt-0.5">
            Kết quả KD (TK 911 → 4212)
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-medium text-amber-900">
              Chi phí không được trừ (B4)
            </span>
            <Badge variant="warning" size="sm">
              + B4
            </Badge>
          </div>
          <div className="text-lg font-mono font-bold text-amber-800 tabular-nums text-right mt-1.5">
            {formatCurrency(metrics.nonDeductibleExpenseTotal)}
          </div>
          <div className="text-[11px] text-amber-700 text-right mt-0.5">
            Cộng tăng vào thu nhập chịu thuế kỳ này
          </div>
        </div>

        <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-3.5">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-medium text-sky-900">
              Tồn kho / Dở dang chưa có HĐ
            </span>
            <Badge variant="info" size="sm">
              Cảnh báo riêng
            </Badge>
          </div>
          <div className="text-lg font-mono font-bold text-sky-900 tabular-nums text-right mt-1.5">
            {formatCurrency(metrics.nonDeductibleInventoryWipTotal)}
          </div>
          <div className="text-[11px] text-sky-700 text-right mt-0.5 flex items-center justify-end gap-1">
            <Info size={11} className="shrink-0" />
            <span>Chưa kết chuyển giá vốn — không cộng B4</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="text-xs text-slate-600">Thu nhập chịu thuế TNDN</div>
          <div className="text-lg font-mono font-bold text-slate-900 tabular-nums text-right mt-1.5">
            {formatCurrency(metrics.taxableIncome)}
          </div>
          <div className="text-[11px] text-slate-400 text-right mt-0.5">
            = LN kế toán + CP loại trừ B4
          </div>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-bold text-primary">
              Thuế TNDN dự kiến (20%)
            </span>
            <Badge variant="primary" size="sm">
              CIT 20%
            </Badge>
          </div>
          <div className="text-lg font-mono font-bold text-primary tabular-nums text-right mt-1.5">
            {formatCurrency(metrics.estimatedCitAmount)}
          </div>
          <div className="text-[11px] text-primary/80 text-right mt-0.5">
            20% × Thu nhập chịu thuế dương
          </div>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-medium text-rose-900 flex items-center gap-1">
              <AlertTriangle size={13} className="text-rose-600 shrink-0" />
              Thuế TNDN tăng thêm do thiếu HĐ
            </span>
          </div>
          <div className="text-lg font-mono font-bold text-rose-700 tabular-nums text-right mt-1.5">
            {formatCurrency(metrics.taxSavingsLostEstimate)}
          </div>
          <div className="text-[11px] text-rose-600 text-right mt-0.5">
            Ước tính thiệt hại thuế (20% phần B4)
          </div>
        </div>
      </div>

      {metrics.nonDeductibleInventoryWipTotal > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50/60 px-3 py-2 text-[11px] text-sky-900">
          <ShieldAlert size={14} className="text-sky-700 shrink-0 mt-0.5" />
          <span>
            Khoản <strong>{formatCurrency(metrics.nonDeductibleInventoryWipTotal)}</strong> nằm trên
            tài khoản Tồn kho / Dở dang (152, 154...) chưa có hóa đơn hợp lệ. Giá trị này chỉ
            được cảnh báo theo dõi riêng và <strong>không cộng vào chỉ tiêu B4</strong> cho tới khi
            xuất dùng / nghiệm thu kết chuyển giá vốn.
          </span>
        </div>
      )}
    </div>
  );
}
