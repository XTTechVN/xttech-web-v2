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
  const isPrimary = plan.id !== 'self';

  return (
    <div className="group relative flex h-full min-h-[580px] w-[285px] shrink-0 snap-center flex-col justify-between rounded-3xl border border-primary/10 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:border-primary/30 hover:shadow-xl sm:h-full sm:min-h-0 sm:w-auto sm:shrink sm:snap-align-none">
      <div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${plan.iconBg} transition-transform duration-300 ease-out group-hover:scale-110`}>
          <Icon className={`h-5 w-5 ${plan.iconColor}`} />
        </div>

        <h3 className="mt-6 text-base font-bold text-primary transition-colors duration-300">{plan.name}</h3>

        {/* Giá với hiệu ứng hover mềm mại */}
        <div className="group/price mt-3 flex cursor-pointer items-baseline gap-1">
          <span className="inline-block origin-left text-3xl font-bold tracking-tight text-primary transition-all duration-300 ease-out group-hover:scale-105 group-hover/price:scale-110">
            {plan.price}
          </span>
          <span className="text-sm text-slate-500 transition-colors duration-300 group-hover/price:text-slate-800">
            {plan.unit}
          </span>
        </div>

        {/* Khối subtitle đồng nhất chiều cao với khối promo của thẻ highlight */}
        <div className="mt-2 flex min-h-[44px] items-center">
          {plan.subtitle ? (
            <p className="text-xs leading-relaxed text-slate-500">{plan.subtitle}</p>
          ) : (
            <span className="block" />
          )}
        </div>
      </div>

      <ul className="mt-4 flex-1 space-y-2.5 border-t border-gray-100 pt-4">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm leading-snug text-slate-600">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary/60 transition-transform duration-300 group-hover:scale-110" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <button
          type="button"
          className={
            isPrimary
              ? 'flex min-h-[48px] w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-primary/90 hover:shadow-md active:scale-[0.98]'
              : 'flex min-h-[48px] w-full items-center justify-center rounded-full border border-primary/20 bg-white px-6 py-3 text-sm font-bold text-primary transition-all duration-300 hover:scale-[1.02] hover:bg-primary/5 active:scale-[0.98]'
          }
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
    <div className="group relative flex h-full min-h-[580px] w-[285px] shrink-0 snap-center flex-col justify-between rounded-3xl border-2 border-primary bg-primary p-6 text-white shadow-xl shadow-primary/20 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/30 sm:h-full sm:min-h-0 sm:w-auto sm:shrink sm:snap-align-none">
      {plan.badge && (
        <span
          className="absolute -top-0.5 right-6 rounded-b-xl px-4 py-1.5 text-[10px] font-bold tracking-wider text-primary shadow-sm transition-transform duration-300 ease-out group-hover:scale-105"
          style={{ backgroundColor: ACCENT }}
        >
          {plan.badge}
        </span>
      )}

      <div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${plan.iconBg} transition-transform duration-300 ease-out group-hover:scale-110`}>
          <Icon className={`h-5 w-5 ${plan.iconColor}`} />
        </div>

        <h3 className="mt-6 text-base font-bold text-white">{plan.name}</h3>

        {/* Giá với hiệu ứng hover mềm mại */}
        <div className="group/price mt-3 flex cursor-pointer items-baseline gap-2">
          <span
            className="inline-block origin-left text-3xl font-bold tracking-tight text-white transition-all duration-300 ease-out group-hover:scale-105 group-hover/price:scale-110 group-hover/price:text-[#d6ff3d]"
          >
            {plan.price}
          </span>
          {plan.oldPrice && (
            <span className="text-sm text-white/60 line-through transition-opacity duration-300 group-hover/price:text-white/40">
              {plan.oldPrice}
            </span>
          )}
          <span className="text-sm text-white/70 transition-colors duration-300 group-hover/price:text-white">
            {plan.unit}
          </span>
        </div>

        {/* Khối promo đồng nhất chiều cao với subtitle */}
        <div className="mt-2 flex min-h-[44px] items-center">
          {plan.promo && (
            <span
              className="inline-block rounded-xl px-2.5 py-1 text-xs font-bold leading-tight text-primary shadow-sm transition-transform duration-300 ease-out group-hover:scale-[1.02]"
              style={{ backgroundColor: ACCENT }}
            >
              {plan.promo}
            </span>
          )}
        </div>
      </div>

      <ul className="mt-4 flex-1 space-y-2.5 border-t border-white/20 pt-4">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm leading-snug font-medium text-white">
            <span
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: ACCENT }}
            >
              <Check className="h-2.5 w-2.5 text-primary" strokeWidth={3} />
            </span>
            <span className="text-white/90">{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <button
          type="button"
          className="group/btn flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-primary shadow-md transition-all duration-300 hover:scale-[1.02] hover:brightness-105 hover:shadow-lg active:scale-[0.98]"
          style={{ backgroundColor: ACCENT }}
        >
          {plan.cta}
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" strokeWidth={2.5} />
        </button>

        {/* Dòng ghi chú 2 dòng */}
        <p className="mt-3 min-h-[32px] text-center text-[11px] leading-tight text-white/70">{plan.note || '\u00A0'}</p>
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
