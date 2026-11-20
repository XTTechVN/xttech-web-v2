'use client';

import React from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '@/utils/currency';
import type { CashflowSeriesItem } from '@/types';

export interface OverviewCashflowChartProps {
  series: CashflowSeriesItem[];
}

interface ChartTooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
}

function CashflowChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs space-y-1.5">
      <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">{label}</div>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center justify-between gap-4">
          <span className="text-slate-600">{entry.name}:</span>
          <span
            className="font-mono tabular-nums font-bold"
            style={{ color: entry.color || '#045863' }}
          >
            {formatCurrency(entry.value ?? 0)}
          </span>
        </div>
      ))}
    </div>
  );
}

const formatAxisMillion = (value: number): string => {
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}tỷ`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${Math.round(value / 1_000_000)}tr`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${Math.round(value / 1_000)}k`;
  }
  return String(value);
};

export function OverviewCashflowChart({ series }: OverviewCashflowChartProps) {
  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Biểu đồ Lưu chuyển Dòng tiền (Thu / Chi / Lũy kế)
          </h3>
          <p className="text-xs text-slate-500">
            Tổng hợp dòng tiền mặt tại Két &amp; Tiền gửi Ngân hàng theo kỳ
          </p>
        </div>
      </div>

      {series.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
          Chưa có dữ liệu dòng tiền phát sinh trong kỳ đã chọn.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="periodLabel" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis
                tickFormatter={formatAxisMillion}
                tick={{ fontSize: 11, fill: '#64748b' }}
                width={52}
              />
              <Tooltip content={<CashflowChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="totalIn"
                name="Tổng Thu"
                fill="#045863"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="totalOut"
                name="Tổng Chi"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Line
                type="monotone"
                dataKey="cumulativeBalance"
                name="Số dư lũy kế"
                stroke="#0ea5e9"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
