import React from 'react';
import { ArrowUpRight, Building2, Check, GraduationCap, Rocket, Video, type LucideIcon } from 'lucide-react';

/*
  Màu dùng trong file:
  - primary        : màu chủ đạo của bạn (tailwind.config)
  - accent (lime)  : #d6ff3d  -> màu nhấn, nổi bật trên nền primary đậm
  Muốn đổi accent chỉ cần sửa hằng số ACCENT bên dưới.
*/
const ACCENT = '#d6ff3d';

/* ---------- Mock data ---------- */
type Plan = {
  id: string;
  name: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  price: string;
  unit: string;
  oldPrice?: string;
  subtitle?: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  badge?: string;
  promo?: string;
  note?: string;
};

const plans: Plan[] = [
  {
    id: 'self',
    name: 'Tự học',
    icon: GraduationCap,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    price: '0đ',
    unit: '/mãi mãi',
    features: ['Kho video 120+ bài', 'Tài liệu & biểu mẫu', 'Cộng đồng hỗ trợ'],
    cta: 'Bắt đầu học',
  },
  {
    id: 'online',
    name: 'Đồng hành Online',
    icon: Video,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    price: '5tr',
    unit: '/3 tháng',
    subtitle: '12 buổi 1-1 qua Meet, setup hệ thống',
    features: ['Setup 10 hệ nhóm / 50 công trình', 'Quy trình báo giá → nghiệm thu', 'Bàn giao quản trị viên'],
    cta: 'Chọn gói Online',
  },
  {
    id: 'onsite',
    name: 'Đào tạo tận xưởng',
    icon: Building2,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    price: '8tr',
    unit: '/ngày',
    subtitle: 'Chuyên gia đến tận nơi, cầm tay chỉ việc',
    features: ['Đào tạo 2 ca: văn phòng + xưởng', 'Chuẩn hóa kho, mã hàng', 'Kèm 1 tháng G2'],
    cta: 'Đặt lịch xưởng',
  },
  {
    id: 'full',
    name: 'Tái cấu trúc toàn diện',
    icon: Rocket,
    iconBg: 'bg-white/15',
    iconColor: 'text-[#d6ff3d]',
    price: '15tr',
    oldPrice: '30tr',
    unit: '/lần',
    promo: 'Tặng 1 tháng G2 • Combo G4 = 44.9tr năm đầu',
    features: [
      'Audit xưởng 3 ngày, vẽ lại flow',
      'Tái cấu trúc nhân sự + KPI',
      'Bàn giao Tổng Thầu G4 full không giới hạn',
      'Bảo hành vận hành 12 tháng',
    ],
    cta: 'Nhận combo 44.9tr năm đầu',
    highlight: true,
    badge: 'BEST VALUE • TIẾT KIỆM 50%',
    note: 'Chỉ 5 suất / tháng • Đã bao gồm G4 1TB + 1 tháng G2',
  },
];

/* ---------- Cards ---------- */
const NormalCard = ({ plan }: { plan: Plan }) => {
  const Icon = plan.icon;
  const isPrimary = plan.id !== 'self';

  return (
    <div className="group relative flex h-full w-[285px] shrink-0 snap-center flex-col rounded-3xl border border-primary/10 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:border-primary/30 hover:shadow-xl sm:w-auto sm:shrink sm:snap-align-none">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${plan.iconBg} transition-transform duration-300 ease-out group-hover:scale-110`}>
        <Icon className={`h-5 w-5 ${plan.iconColor}`} />
      </div>

      <h3 className="mt-6 text-base font-bold text-primary transition-colors duration-300">{plan.name}</h3>

      {/* Giá với hiệu ứng hover mềm mại */}
      <div className="group/price mt-4 flex cursor-pointer items-baseline gap-1">
        <span className="inline-block origin-left text-3xl font-bold tracking-tight text-primary transition-all duration-300 ease-out group-hover:scale-105 group-hover/price:scale-110">
          {plan.price}
        </span>
        <span className="text-sm text-slate-500 transition-colors duration-300 group-hover/price:text-slate-800">
          {plan.unit}
        </span>
      </div>

      {plan.subtitle && <p className="mt-1 text-xs text-slate-500">{plan.subtitle}</p>}

      <ul className="mt-5 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-slate-600">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary/60 transition-transform duration-300 group-hover:scale-110" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <button
          type="button"
          className={
            isPrimary
              ? 'w-full rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-primary/90 hover:shadow-md active:scale-[0.98]'
              : 'w-full rounded-full border border-primary/20 bg-white px-6 py-3.5 text-sm font-bold text-primary transition-all duration-300 hover:scale-[1.02] hover:bg-primary/5 active:scale-[0.98]'
          }
        >
          {plan.cta}
        </button>
      </div>
    </div>
  );
};

const HighlightCard = ({ plan }: { plan: Plan }) => {
  const Icon = plan.icon;

  return (
    // wrapper tạo bóng cứng lệch phải-dưới với animation nâng thẻ mượt mà khi hover
    <div className="group relative h-full w-[285px] shrink-0 snap-center pb-3 pr-3 transition-transform duration-300 ease-out hover:-translate-y-2 sm:w-auto sm:shrink sm:snap-align-none">
      <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-3xl bg-primary/30 transition-all duration-300 ease-out group-hover:translate-x-3.5 group-hover:translate-y-3.5 group-hover:bg-primary/40" />

      <div className="relative flex h-full flex-col rounded-3xl border-2 border-primary bg-primary p-6 shadow-xl transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-primary/30">
        {plan.badge && (
          <span
            className="absolute -top-0.5 right-6 rounded-b-xl px-4 py-1.5 text-[10px] font-bold tracking-wider text-primary shadow-sm transition-transform duration-300 ease-out group-hover:scale-105"
            style={{ backgroundColor: ACCENT }}
          >
            {plan.badge}
          </span>
        )}

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${plan.iconBg} transition-transform duration-300 ease-out group-hover:scale-110`}>
          <Icon className={`h-5 w-5 ${plan.iconColor}`} />
        </div>

        <h3 className="mt-6 text-base font-bold text-white">{plan.name}</h3>

        {/* Giá với hiệu ứng hover mềm mại */}
        <div className="group/price mt-4 flex cursor-pointer items-baseline gap-2">
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

        {plan.promo && (
          <div
            className="mt-3 inline-block rounded-2xl px-4 py-2 text-xs font-bold leading-snug text-primary shadow-sm transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            style={{ backgroundColor: ACCENT }}
          >
            {plan.promo}
          </div>
        )}

        <ul className="mt-5 space-y-3">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm font-medium text-white">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: ACCENT }}
              >
                <Check className="h-3 w-3 text-primary" strokeWidth={3} />
              </span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          <button
            type="button"
            className="group/btn flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold text-primary shadow-md transition-all duration-300 hover:scale-[1.02] hover:brightness-105 hover:shadow-lg active:scale-[0.98]"
            style={{ backgroundColor: ACCENT }}
          >
            {plan.cta}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" strokeWidth={2.5} />
          </button>

          {plan.note && <p className="mt-4 text-center text-[11px] text-white/70">{plan.note}</p>}
        </div>
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
          <div className="flex snap-x snap-mandatory gap-4 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 xl:grid-cols-4 xl:gap-6">
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
