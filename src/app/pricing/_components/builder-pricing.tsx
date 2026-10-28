'use client';

import React, { useState } from 'react';
import { Check, ExternalLink, Zap, Layers } from 'lucide-react';

/* Màu nhấn (lime) – dùng chung với các section pricing khác */
const ACCENT = '#d6ff3d';

type BillingCycle = 'month' | 'year';
type ButtonVariant = 'outline' | 'solid' | 'accent';

/* ---------- Helpers ---------- */
// Format kiểu Việt Nam: 4900000 -> "4.900.000đ" (tự viết để SSR/CSR không lệch)
const formatVnd = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}đ`;

// % tiết kiệm khi trả năm so với trả 12 tháng lẻ
const savePercent = (monthly: number, yearly: number) => Math.round((1 - yearly / (monthly * 12)) * 100);

// 1. DỮ LIỆU MOCKUP NGÀNH XÂY DỰNG & ĐỘI THỢ
const PRICING_DATA = {
  header: {
    title: 'Ngành xây dựng và đội thợ',
    badge: 'Số công trình',
    subTitle: 'XMS Build — Công trình, kho bãi, nhân công',
    slug: '/bang-gia-xay-dung',
    resetNote: 'Reset mùng 1 hàng tháng',
  },
  plans: [
    {
      id: 'free',
      name: 'Miễn phí',
      monthly: null as number | null,
      yearly: null as number | null,
      yearlyOnly: false,
      priceSubText: 'Mãi mãi, không cần thẻ',
      buttonText: 'Dùng thử 10 công trình miễn phí',
      buttonVariant: 'outline' as ButtonVariant,
      isPopular: false,
      highlights: [
        { bold: '10 công trình', rest: 'tổng cả đời' },
        { bold: '3 nhân sự', rest: '' },
        { bold: '3 GB', rest: 'lưu trữ' },
        { bold: '10 dự án', rest: 'và kho vật tư' },
        { bold: 'Thử 3 người', rest: 'chấm công GPS' },
        { bold: 'Kế toán', rest: 'chỉ xem' },
        { bold: 'Hỗ trợ', rest: 'cộng đồng' },
      ],
    },
    {
      id: 'doi-nho',
      name: 'Đội nhỏ',
      monthly: 490000 as number | null,
      yearly: 4900000 as number | null,
      yearlyOnly: false,
      priceSubText: null as string | null,
      buttonText: 'Chọn Đội Nhỏ',
      buttonVariant: 'solid' as ButtonVariant,
      isPopular: false,
      highlights: [
        { bold: '100 công trình', rest: '/ tháng, reset mùng 1' },
        { bold: '10 nhân sự', rest: '' },
        { bold: '20 GB', rest: 'lưu trữ' },
        { bold: '50 dự án', rest: 'và kho vật tư' },
        { bold: '10 người', rest: 'chấm công GPS' },
        { bold: '100 HĐ', rest: 'kế toán giao việc' },
        { bold: 'Chat', rest: 'hỗ trợ 24h' },
      ],
    },
    {
      id: 'doi-lon',
      name: 'Đội lớn',
      monthly: 990000 as number | null,
      yearly: 9900000 as number | null,
      yearlyOnly: false,
      priceSubText: null as string | null,
      buttonText: 'Chọn Đội Lớn',
      buttonVariant: 'accent' as ButtonVariant,
      isPopular: true,
      highlights: [
        { bold: '500 công trình', rest: '/ tháng' },
        { bold: '30 nhân sự', rest: '' },
        { bold: '100 GB', rest: 'lưu trữ' },
        { bold: '200 dự án', rest: 'và kho vật tư' },
        { bold: '20 người', rest: 'chấm công GPS' },
        { bold: '500 HĐ', rest: 'kế toán QR + bảo hành' },
        { bold: 'Hỗ trợ ưu tiên', rest: '1-1' },
      ],
    },
    {
      id: 'tong-thau',
      name: 'Tổng thầu',
      monthly: null as number | null,
      yearly: 24900000 as number | null,
      yearlyOnly: true,
      priceSubText: null as string | null,
      buttonText: 'Liên hệ Tổng Thầu',
      buttonVariant: 'outline' as ButtonVariant,
      isPopular: false,
      highlights: [
        { bold: 'Công trình không giới hạn', rest: '∞' },
        { bold: 'Nhân sự không giới hạn', rest: '' },
        { bold: '1 TB', rest: 'lưu trữ (1024 GB)' },
        { bold: 'Full dự án & kho vật tư', rest: '' },
        { bold: 'Chấm công GPS', rest: 'không giới hạn' },
        { bold: 'Kế toán Full', rest: 'toàn diện' },
        { bold: 'Quản lý', rest: 'tài khoản riêng' },
      ],
    },
  ],
  addOns: [
    { text: '+100 công trình', price: '99k' },
    { text: '+10 nhân sự', price: '99k' },
    { text: '+20GB', price: '99k' },
  ],
  footerNote: '* Áp dụng cho gói 1 gói 2 tự động cộng vào tháng sau',
};

type Plan = (typeof PRICING_DATA.plans)[number];

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
    .map((p) => savePercent(p.monthly as number, p.yearly as number))
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
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-extrabold text-primary"
                style={{ backgroundColor: ACCENT }}
              >
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
    outline: 'border-2 border-primary bg-white text-primary hover:bg-primary/5',
    solid: 'border-2 border-primary bg-primary text-white hover:bg-primary/90',
    accent: 'border-2 text-primary hover:brightness-95',
  };
  return (
    <button
      type="button"
      className={`flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold transition-all ${
        styles[plan.buttonVariant]
      }`}
      style={plan.buttonVariant === 'accent' ? { backgroundColor: ACCENT, borderColor: ACCENT } : undefined}
    >
      {plan.buttonText}
    </button>
  );
};

/* ---------- Thẻ một gói ---------- */
const PlanCard = ({ plan, cycle }: { plan: Plan; cycle: BillingCycle }) => {
  const view = getPriceView(plan, cycle);
  const dark = plan.isPopular;

  return (
    <div
      className={`group relative flex h-full w-[280px] shrink-0 snap-center flex-col rounded-3xl border p-6 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl sm:w-auto sm:shrink sm:snap-align-none ${
        dark
          ? 'border-primary bg-primary pt-9 text-white shadow-xl hover:shadow-primary/30 lg:z-10 lg:-my-4'
          : 'border-primary/10 bg-white text-gray-900 shadow-sm hover:border-primary/30 hover:shadow-lg'
      }`}
    >
      {dark && (
        <div
          className="absolute -top-3.5 left-6 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-extrabold text-primary shadow-sm transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: ACCENT }}
        >
          Bán chạy nhất
        </div>
      )}

      <h3 className="text-lg font-bold">{plan.name}</h3>

      {/* Giá với hiệu ứng hover mềm mại */}
      <div className="group/price mt-3 flex cursor-pointer flex-wrap items-baseline gap-x-1.5">
        <span
          className={`inline-block origin-left text-3xl font-extrabold tracking-tight transition-all duration-300 ease-out group-hover:scale-105 group-hover/price:scale-110 ${
            dark ? 'group-hover/price:text-[#d6ff3d]' : 'group-hover/price:text-primary'
          }`}
        >
          {view.price}
        </span>
        {view.unit && (
          <span
            className={`text-sm transition-colors duration-300 ${
              dark ? 'text-white/70 group-hover/price:text-white' : 'text-gray-500 group-hover/price:text-gray-700'
            }`}
          >
            {view.unit}
          </span>
        )}
      </div>
      <p
        className={`mb-5 mt-2 min-h-[18px] text-xs transition-opacity duration-300 ${dark ? 'font-bold' : 'text-gray-500'}`}
        style={dark ? { color: ACCENT } : undefined}
      >
        {view.note}
      </p>

      <PlanButton plan={plan} />

      {/* Danh sách tính năng nổi bật */}
      <ul className={`mt-6 space-y-3.5 border-t pt-5 ${dark ? 'border-white/20' : 'border-primary/10'}`}>
        {plan.highlights.map((h, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-snug">
            <Check
              className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? '' : 'text-primary'}`}
              style={dark ? { color: ACCENT } : undefined}
              strokeWidth={3}
            />
            <span className={dark ? 'text-white/75' : 'text-gray-500'}>
              <b className={`font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{h.bold}</b>
              {h.rest && ` ${h.rest}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// 2. COMPONENT CHÍNH RENDER UI
const BuiderSpicing = () => {
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
              <div
                key={addOn.text}
                className="flex items-center gap-1 rounded-full bg-primary/5 px-3 py-1.5 text-xs font-medium text-gray-700"
              >
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

export default BuiderSpicing;