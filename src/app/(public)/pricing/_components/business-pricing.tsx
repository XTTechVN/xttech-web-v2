'use client';

import React, { useState } from 'react';
import { Check, ExternalLink, Zap, Layers } from 'lucide-react';

/* Màu nhấn (lime) – dùng chung với các section pricing khác */
const ACCENT = '#d6ff3d';

type BillingCycle = 'month' | 'year';
import {
  BUSINESS_PRICING_DATA,
  formatVnd,
  savePercent,
  type ButtonVariant,
  type PricingPlan as Plan,
} from './mock-data';

const PRICING_DATA = BUSINESS_PRICING_DATA;

interface PriceView {
  price: string;
  unit: string | null;
  /** Dòng phụ dưới giá (một dòng duy nhất) */
  note: string | null;
}

/* Tính nội dung giá hiển thị theo kỳ thanh toán */
const getPriceView = (plan: Plan, cycle: BillingCycle): PriceView => {
  // Gói miễn phí
  if (plan.yearly === null && plan.monthly === null) {
    return { price: 'Miễn phí', unit: null, note: plan.priceSubText };
  }

  const yearly = plan.yearly as number;

  if (cycle === 'month') {
    // Gói chỉ bán theo năm: hiện giá quy đổi /tháng + ghi chú
    if (plan.yearlyOnly || plan.monthly === null) {
      return {
        price: formatVnd(yearly / 12),
        unit: '/tháng',
        note: `Chỉ thanh toán theo năm (${formatVnd(yearly)}/năm)`,
      };
    }
    return {
      price: formatVnd(plan.monthly),
      unit: '/tháng',
      note: `Thanh toán ${formatVnd(plan.monthly)}/tháng`,
    };
  }

  // cycle === 'year'
  const perMonth = `~${formatVnd(yearly / 12)}/tháng`;
  const percent = !plan.yearlyOnly && plan.monthly !== null ? savePercent(plan.monthly, yearly) : 0;
  return {
    price: formatVnd(yearly),
    unit: '/năm',
    note: percent > 0 ? `${perMonth} · Tiết kiệm ${percent}%` : perMonth,
  };
};

/* % tiết kiệm lớn nhất, để hiện trên nút "Theo năm" */
const MAX_SAVE = Math.max(
  0,
  ...PRICING_DATA.plans
    .filter((p) => !p.yearlyOnly && p.monthly !== null && p.yearly !== null)
    .map((p) => savePercent(p.monthly as number, p.yearly as number)),
);

/* ---------- Công tắc Theo tháng / Theo năm ---------- */
const CycleToggle = ({ value, onChange }: { value: BillingCycle; onChange: (v: BillingCycle) => void }) => {
  const options: { id: BillingCycle; label: string }[] = [
    { id: 'month', label: 'Theo tháng' },
    { id: 'year', label: 'Theo năm' },
  ];

  return (
    <div role="tablist" aria-label="Chu kỳ thanh toán" className="inline-flex items-center gap-1 rounded-full bg-primary/5 p-1">
      {options.map((opt) => {
        const isActive = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.id)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              isActive ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-primary'
            }`}
          >
            {opt.label}
            {opt.id === 'year' && MAX_SAVE > 0 && (
              <span className="rounded-full px-1.5 py-0.5 text-[10px] font-extrabold text-primary" style={{ backgroundColor: ACCENT }}>
                -{MAX_SAVE}%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

/* ---------- Nút CTA của thẻ gói ---------- */
const PlanButton = ({ plan }: { plan: Plan }) => {
  const styles: Record<ButtonVariant, string> = {
    outline: 'border-2 border-primary bg-white text-primary group-hover:border-[#d6ff3d] group-hover:bg-[#d6ff3d] group-hover:text-primary',
    solid: 'border-2 border-primary bg-primary text-white group-hover:border-[#d6ff3d] group-hover:bg-[#d6ff3d] group-hover:text-primary',
    accent: 'border-2 border-primary/20 bg-primary/10 text-primary group-hover:border-[#d6ff3d] group-hover:bg-[#d6ff3d] group-hover:text-primary',
  };
  return (
    <button
      type="button"
      className={`flex h-[44px] min-h-[44px] w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
        styles[plan.buttonVariant]
      }`}
    >
      {plan.buttonText}
    </button>
  );
};

/* ---------- Thẻ một gói ---------- */
const PlanCard = ({ plan, cycle }: { plan: Plan; cycle: BillingCycle }) => {
  const view = getPriceView(plan, cycle);
  const isPopular = plan.isPopular;

  return (
    <div
      className={`group relative flex h-full w-[280px] shrink-0 snap-center flex-col rounded-3xl border border-primary/10 bg-white p-6 text-gray-900 shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-primary hover:bg-primary hover:text-white hover:shadow-2xl hover:shadow-primary/30 sm:w-auto sm:shrink sm:snap-align-none ${
        isPopular ? 'lg:z-10' : ''
      }`}
    >
      {isPopular && (
        <div
          className="bg-primary absolute -top-3.5 left-6 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-extrabold text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
        >
          Bán chạy nhất
        </div>
      )}

      <h3 className="line-clamp-1 text-lg font-bold transition-colors duration-300 group-hover:text-white">{plan.name}</h3>

      {/* Giá với hiệu ứng hover */}
      <div className="group/price mt-3 flex h-9 cursor-pointer items-baseline gap-x-1.5">
        <span
          className="inline-block origin-left text-3xl font-extrabold tracking-tight text-primary transition-all duration-300 ease-out group-hover:scale-105 group-hover:text-[#d6ff3d]"
        >
          {view.price}
        </span>
        {view.unit && (
          <span
            className="text-sm text-gray-500 transition-colors duration-300 group-hover:text-white/80"
          >
            {view.unit}
          </span>
        )}
      </div>
      <p
        className="mb-5 mt-2 flex min-h-[34px] items-center text-xs leading-snug text-gray-500 transition-colors duration-300 group-hover:font-semibold group-hover:text-[#d6ff3d]"
      >
        {view.note}
      </p>

      <PlanButton plan={plan} />

      {/* Danh sách tính năng nổi bật */}
      <ul className="mt-6 flex-1 space-y-3.5 border-t border-primary/10 pt-5 transition-colors duration-300 group-hover:border-white/20">
        {plan.highlights.map((h, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-snug">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary transition-colors duration-300 group-hover:text-[#d6ff3d]" strokeWidth={3} />
            <span className="text-gray-500 transition-colors duration-300 group-hover:text-white/80">
              <b className="font-bold text-gray-900 transition-colors duration-300 group-hover:text-white">{h.bold}</b>
              {h.rest && ` ${h.rest}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// 2. COMPONENT CHÍNH RENDER UI
const BusinessPricing = () => {
  const { header, plans, addOns, footerNote } = PRICING_DATA;
  const [cycle, setCycle] = useState<BillingCycle>('year');

  return (
    <div className="w-full bg-white px-4 py-6 font-sans text-gray-900 sm:px-8 lg:px-16 xl:px-24">
      <div className="mx-auto w-full max-w-7xl space-y-4">
        {/* HEADER TOP SECTION */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <h2 className="flex items-center gap-2 text-xl font-extrabold text-primary sm:text-2xl">
                {header.title}
                <ExternalLink className="h-4 w-4 shrink-0 text-primary" />
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary">{header.badge}</span>
              <span className="text-gray-500">{header.subTitle}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-gray-500 md:justify-end md:gap-4">
            <div className="flex items-center gap-1.5">{header.resetNote}</div>
            <CycleToggle value={cycle} onChange={setCycle} />
          </div>
        </div>

        {/* CÁC THẺ GÓI
            - Mobile: vuốt ngang snap-x
            - Tablet (sm): lưới 2 cột
            - Desktop (lg): 4 cột, thẻ "Bán chạy nhất" nhô cao hơn */}
        <div className="-mx-4 overflow-x-auto px-4 pb-4 pt-6 sm:mx-0 sm:overflow-visible sm:px-0 lg:py-8">
          <div className="flex snap-x snap-mandatory gap-4 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} cycle={cycle} />
            ))}
          </div>
        </div>

        {/* MUA THÊM LẺ & GHI CHÚ */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-primary/10 bg-white px-4 py-3 shadow-sm sm:rounded-full sm:px-5">
            <div className="mr-1 flex items-center gap-1.5 text-xs font-bold text-gray-800">
              <Zap className="h-3.5 w-3.5 fill-primary text-primary" />
              <span>Hết lưu lượng? Mua thêm lẻ</span>
            </div>
            {addOns.map((addOn) => (
              <div key={addOn.text} className="flex items-center gap-1 rounded-full bg-primary/5 px-3 py-1.5 text-xs font-medium text-gray-700">
                <span>{addOn.text}</span>
                <span className="font-bold text-primary">{addOn.price}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] text-gray-500">{footerNote}</p>
        </div>
      </div>
    </div>
  );
};

export default BusinessPricing;
