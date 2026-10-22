'use client';

import React from 'react';

// Khối nhập liệu: tiêu đề + mô tả dễ hiểu
export function PriceBlock({
  title,
  description,
  className = '',
  children,
}: {
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`bg-white rounded-lg border border-slate-200/60 p-5 shadow-xs space-y-4 ${className}`}>
      <div>
        <span className="text-xs font-bold text-slate-700 block">{title}</span>
        <span className="text-[11px] text-slate-400 block mt-0.5">{description}</span>
      </div>
      {children}
    </section>
  );
}

export function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-slate-400 -mt-1.5">{children}</p>;
}

const ROW_TONE_CLASS = {
  red: 'text-red-600',
  green: 'text-emerald-600',
  primary: 'text-primary',
} as const;

// Một dòng "tên - số tiền" trong bảng phân tích
export function ResultRow({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: keyof typeof ROW_TONE_CLASS;
}) {
  const toneClass = tone ? ROW_TONE_CLASS[tone] : 'text-slate-700';
  return (
    <div className="flex justify-between gap-3 py-1.5 text-xs">
      <span className={strong ? 'font-bold text-slate-600' : 'text-slate-400'}>{label}</span>
      <span className={`${strong ? 'font-bold' : ''} ${toneClass}`}>{value}</span>
    </div>
  );
}

// Panel trực quan: giá chưa thuế gồm những khoản nào, mỗi khoản chiếm bao nhiêu %
export interface CompositionData {
  materialCost: number;
  laborCost: number;
  aluminumWasteCost: number;
  otherCost: number;
  workshopPrice: number;
  totalProfit: number;
  totalAmountBeforeVat: number;
}

export function CompositionPanel({ data }: { data: CompositionData }) {
  // Chi phí chung của xưởng = giá xưởng - (vật tư + công + hao hụt + chi phí khác)
  const managementCost =
    data.workshopPrice -
    data.materialCost -
    data.laborCost -
    data.aluminumWasteCost -
    data.otherCost;

  const rows = [
    { key: 'A', label: 'Vật tư', value: data.materialCost, bar: 'bg-sky-400' },
    { key: 'B', label: 'Tiền công thợ', value: data.laborCost, bar: 'bg-amber-400' },
    { key: 'C', label: 'Nhôm hao hụt', value: data.aluminumWasteCost, bar: 'bg-orange-400' },
    { key: 'D', label: 'Chi phí khác', value: data.otherCost, bar: 'bg-slate-400' },
    { key: 'E', label: 'Chi phí chung của xưởng', value: managementCost, bar: 'bg-violet-400' },
    { key: 'F', label: 'Tiền lãi', value: data.totalProfit, bar: 'bg-emerald-500' },
  ];
  const total = data.totalAmountBeforeVat;

  return (
    <div>
      {rows.map((row) => {
        const percent = total > 0 ? (row.value / total) * 100 : 0;
        return (
          <div key={row.key} className="py-1.5">
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="text-slate-600">
                {row.key} · {row.label}
              </span>
              <span className="flex items-baseline gap-3">
                <span className="text-[11px] text-slate-400">{percent.toFixed(0)}%</span>
                <span className="font-bold text-slate-800 min-w-20 text-right">
                  {row.value.toLocaleString('vi-VN')}
                </span>
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${row.bar}`}
                style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
              />
            </div>
          </div>
        );
      })}
      <div className="flex justify-between gap-3 border-t border-slate-100 mt-2 pt-2 text-xs">
        <span className="font-bold text-slate-700">Tổng giá (chưa tính thuế)</span>
        <span className="font-bold text-slate-800">{total.toLocaleString('vi-VN')}</span>
      </div>
    </div>
  );
}
