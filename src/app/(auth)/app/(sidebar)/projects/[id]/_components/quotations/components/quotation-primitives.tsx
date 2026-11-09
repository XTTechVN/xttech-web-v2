'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip } from '@/components';

// Nút dấu ? giải thích 2 cách tính giá bán cho người không chuyên môn
export function PricingModeHelpTooltip() {
  return (
    <Tooltip
      position="top"
      className="w-80 sm:w-96 whitespace-normal text-left p-3.5 leading-relaxed right-0 left-auto translate-x-0 font-normal shadow-xl border border-slate-700"
      content={
        <div className="space-y-2.5 text-[11px] text-slate-100">
          <div className="font-bold text-xs text-white border-b border-slate-700 pb-1.5">
            Phân biệt 2 cách tính giá bán (chưa gồm thuế VAT)
          </div>

          <div className="space-y-1">
            <div className="font-semibold text-emerald-300">
              1. Cộng thêm % lãi vào chi phí (Tính xuôi từ vốn)
            </div>
            <p className="text-slate-300">
              Lấy tổng chi phí làm cửa làm gốc, rồi cộng thêm % tiền lãi bạn muốn.
            </p>
            <div className="bg-slate-800/90 rounded px-2 py-1 text-slate-200">
              <span className="font-semibold text-amber-300">Ví dụ:</span> Làm bộ cửa hết{' '}
              <b>10 triệu</b> tiền vốn, cộng thêm <b>30% lãi</b> (3 triệu) → Giá bán ={' '}
              <b>13 triệu</b>.
            </div>
          </div>

          <div className="space-y-1 pt-1 border-t border-slate-800">
            <div className="font-semibold text-sky-300">
              2. Đặt % lãi mong muốn trên giá bán (Tính trên số tiền thu về)
            </div>
            <p className="text-slate-300">
              Trong tổng số tiền khách trả, bạn muốn tiền lãi chiếm đúng bao nhiêu % (phần còn lại là
              chi phí).
            </p>
            <div className="bg-slate-800/90 rounded px-2 py-1 text-slate-200">
              <span className="font-semibold text-amber-300">Ví dụ:</span> Làm bộ cửa hết{' '}
              <b>7 triệu</b> tiền vốn, muốn lãi chiếm <b>30% giá bán</b> (vốn chiếm 70%) → Giá bán ={' '}
              <b>7 ÷ 0,7 = 10 triệu</b> (lãi đúng 3 triệu = 30% của 10 triệu).
            </div>
          </div>

          <div className="text-[10px] text-slate-300 bg-primary/30 border border-primary/40 rounded px-2 py-1">
            💡 <b>Lưu ý:</b> Cùng nhập một con số % (ví dụ 30%), <b>Cách 2</b> sẽ cho ra giá bán và
            tiền lãi cao hơn <b>Cách 1</b>.
          </div>
        </div>
      }
    >
      <button
        type="button"
        aria-label="Giải thích cách tính giá bán"
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors cursor-help"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
    </Tooltip>
  );
}

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
