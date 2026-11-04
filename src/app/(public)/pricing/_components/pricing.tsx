import React from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { IMPLEMENTATION_PRICING_PLANS as plans, type ImplementationPlan as Plan } from './mock-data';

/*
  Màu dùng trong file:
  - primary        : màu chủ đạo của bạn (tailwind.config)
  - accent (lime)  : #d6ff3d  -> màu nhấn, nổi bật trên nền primary đậm
  Muốn đổi accent chỉ cần sửa hằng số ACCENT bên dưới.
*/
const ACCENT = '#d6ff3d';

/* ---------- Cards ---------- */
const NormalCard = ({ plan }: { plan: Plan }) => {
  const Icon = plan.icon;

  return (
    <div className="group relative flex h-full min-h-[580px] w-[285px] shrink-0 snap-center flex-col justify-between rounded-3xl border border-primary/10 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-primary hover:bg-primary hover:text-white hover:shadow-2xl hover:shadow-primary/30 sm:h-full sm:min-h-0 sm:w-auto sm:shrink sm:snap-align-none">
      <div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-[#d6ff3d] group-hover:text-primary">
          <Icon className="h-5 w-5 text-primary transition-colors duration-300 group-hover:text-primary" />
        </div>

        <h3 className="mt-6 text-base font-bold text-primary transition-colors duration-300 group-hover:text-white">{plan.name}</h3>

        {/* Giá với hiệu ứng hover */}
        <div className="group/price mt-3 flex cursor-pointer items-baseline gap-1">
          <span className="inline-block origin-left text-3xl font-bold tracking-tight text-primary transition-all duration-300 ease-out group-hover:scale-105 group-hover:text-[#d6ff3d]">
            {plan.price}
          </span>
          <span className="text-sm text-slate-500 transition-colors duration-300 group-hover:text-white/80">
            {plan.unit}
          </span>
        </div>

        {/* Khối subtitle */}
        <div className="mt-2 flex min-h-[44px] items-center">
          {plan.subtitle ? (
            <p className="text-xs leading-relaxed text-slate-500 transition-colors duration-300 group-hover:font-semibold group-hover:text-[#d6ff3d]">{plan.subtitle}</p>
          ) : (
            <span className="block" />
          )}
        </div>
      </div>

      <ul className="mt-4 flex-1 space-y-2.5 border-t border-primary/10 pt-4 transition-colors duration-300 group-hover:border-white/20">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm leading-snug text-slate-600 transition-colors duration-300 group-hover:text-white/90">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#d6ff3d]">
              <Check className="h-2.5 w-2.5 text-primary" strokeWidth={3} />
            </span>
            <span className="transition-colors duration-300 group-hover:text-white">{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <button
          type="button"
          className="flex min-h-[48px] w-full items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-6 py-3 text-sm font-bold text-primary shadow-sm transition-all duration-300 group-hover:border-[#d6ff3d] group-hover:bg-[#d6ff3d] group-hover:text-primary group-hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          {plan.cta}
        </button>
        {/* Dành khoảng trống 2 dòng tương ứng với note ở thẻ cuối */}
        <p className="mt-3 min-h-[32px] text-center text-[11px] leading-tight text-transparent select-none">&nbsp;</p>
      </div>
    </div>
  );
};

const HighlightCard = ({ plan }: { plan: Plan }) => {
  const Icon = plan.icon;

  return (
    <div className="group relative flex h-full min-h-[580px] w-[285px] shrink-0 snap-center flex-col justify-between rounded-3xl border border-primary/10 bg-white p-6 text-gray-900 shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-primary hover:bg-primary hover:text-white hover:shadow-2xl hover:shadow-primary/30 sm:h-full sm:min-h-0 sm:w-auto sm:shrink sm:snap-align-none">
      {plan.badge && (
        <span
          className="absolute -top-3.5 right-6 whitespace-nowrap rounded-full bg-primary px-3.5 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-[#d6ff3d] group-hover:text-primary"
        >
          {plan.badge}
        </span>
      )}

      <div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-[#d6ff3d] group-hover:text-primary">
          <Icon className="h-5 w-5 text-primary transition-colors duration-300 group-hover:text-primary" />
        </div>

        <h3 className="mt-6 text-base font-bold text-primary transition-colors duration-300 group-hover:text-white">{plan.name}</h3>

        {/* Giá với hiệu ứng hover mềm mại */}
        <div className="group/price mt-3 flex cursor-pointer items-baseline gap-2">
          <span
            className="inline-block origin-left text-3xl font-bold tracking-tight text-primary transition-all duration-300 ease-out group-hover:scale-105 group-hover:text-[#d6ff3d]"
          >
            {plan.price}
          </span>
          {plan.oldPrice && (
            <span className="text-sm text-gray-400 line-through transition-colors duration-300 group-hover:text-white/60">
              {plan.oldPrice}
            </span>
          )}
          <span className="text-sm text-gray-500 transition-colors duration-300 group-hover:text-white/80">
            {plan.unit}
          </span>
        </div>

        {/* Khối promo đồng nhất chiều cao với subtitle */}
        <div className="mt-2 flex min-h-[44px] items-center">
          {plan.promo && (
            <span
              className="inline-block rounded-xl border border-primary/10 bg-primary/5 px-2.5 py-1 text-xs font-semibold leading-tight text-primary shadow-sm transition-all duration-300 ease-out group-hover:scale-[1.02] group-hover:border-transparent group-hover:bg-[#d6ff3d] group-hover:font-bold group-hover:text-primary"
            >
              {plan.promo}
            </span>
          )}
        </div>
      </div>

      <ul className="mt-4 flex-1 space-y-2.5 border-t border-primary/10 pt-4 transition-colors duration-300 group-hover:border-white/20">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm leading-snug text-gray-600 transition-colors duration-300 group-hover:text-white/90">
            <span
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#d6ff3d]"
            >
              <Check className="h-2.5 w-2.5 text-primary" strokeWidth={3} />
            </span>
            <span className="transition-colors duration-300 group-hover:text-white">{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <button
          type="button"
          className="group/btn flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-6 py-3 text-sm font-bold text-primary shadow-sm transition-all duration-300 group-hover:border-[#d6ff3d] group-hover:bg-[#d6ff3d] group-hover:text-primary group-hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          {plan.cta}
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" strokeWidth={2.5} />
        </button>

        {/* Dòng ghi chú 2 dòng */}
        <p className="mt-3 min-h-[32px] text-center text-[11px] leading-tight text-gray-400 transition-colors duration-300 group-hover:text-white/80">{plan.note || '\u00A0'}</p>
      </div>
    </div>
  );
};

/* ---------- Section ---------- */
const Pricing = () => {
  return (
    <section id="pricing" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Mobile: vuốt ngang snap-x
            Tablet (sm): lưới 2 cột
            Desktop (xl): lưới 4 cột */}
        <div className="-mx-4 overflow-x-auto px-4 pb-6 pt-4 sm:mx-0 sm:overflow-visible sm:px-0 sm:py-0">
          <div className="flex snap-x snap-mandatory items-stretch gap-4 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 xl:grid-cols-4 xl:gap-6">
            {plans.map((plan) =>
              plan.highlight ? (
                <HighlightCard key={plan.id} plan={plan} />
              ) : (
                <NormalCard key={plan.id} plan={plan} />
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
