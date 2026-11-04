import React from 'react';
import { CreditCard, Rocket, Layers, HardHat, Briefcase } from 'lucide-react';

interface ServiceBannerProps {
  activeMainTab?: string;
  onMainTabChange?: (tabId: string) => void;
}

/* Màu nhấn (lime) – dùng chung với section Pricing */
const ACCENT = '#d6ff3d';

const MAIN_TABS = [
  { id: 'bang-gia', label: 'Bảng giá', icon: CreditCard },
  { id: 'trien-khai', label: 'Triển khai', icon: Rocket },
];

/* 3 ngành hiển thị dưới tiêu đề – khớp với 3 tab ở PricingTabs */
const INDUSTRIES = [
  { label: 'Nhôm Kính & Nội Thất', icon: Layers },
  { label: 'Xây dựng & Đội thợ', icon: HardHat },
  { label: 'HCNS, Kế Toán, Kinh doanh', icon: Briefcase },
];

const ServiceBanner = ({ activeMainTab = 'bang-gia', onMainTabChange }: ServiceBannerProps) => {
  return (
    // Cùng padding + max-width với tab / bảng giá để thẳng lề
    <div className="w-full bg-white px-4 py-6 font-sans sm:px-8 lg:px-16 xl:px-24">
      {/* Giới hạn bề rộng + gap cố định => 2 cột không bị đẩy ra xa nhau */}
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-14">
        {/* Phần bên trái: Tiêu đề & Mô tả */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* Top Badge */}
          <span className="text-xs font-bold uppercase text-primary sm:text-sm">
            XT Tech • Mindmap Pricing • Google One Style
          </span>

          {/* Main Title */}
          <h1 className="mb-2 text-2xl font-extrabold leading-[1.15] tracking-tight text-gray-900 sm:text-4xl xl:text-5xl">
            Bảng giá minh bạch cho ngành{' '}
            <span className="text-primary">Nhôm , Xây dựng & Kinh doanh</span> 
          </h1>

          {/* 3 ngành áp dụng */}
          <div className="mb-4 flex flex-wrap items-center gap-2 lg:mb-6">
            {INDUSTRIES.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary sm:text-sm"
              >
                <Icon className="h-4 w-4" />
                {label}
              </span>
            ))}
          </div>

        </div>

        {/* Phần bên phải: Tab chính + Thẻ xem trước giá */}
        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[520px]">
          {/* 2 Tab chính: Bảng giá / Triển khai */}
          {onMainTabChange && (
            <div className="flex w-full items-center gap-1 rounded-xl bg-primary/5 p-1 sm:w-fit">
              {MAIN_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeMainTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onMainTabChange(tab.id)}
                    className={`
                      flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all duration-200 sm:flex-none sm:px-6
                      ${
                        isActive
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-transparent text-gray-500 hover:bg-white/70 hover:text-primary'
                      }
                    `}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Thẻ xem trước giá theo năm */}
          <div className="relative w-full rounded-2xl border border-primary/10 bg-white p-4 shadow-sm sm:p-6">
            {/* Badge -20% */}
            <div
              className="absolute -top-3 right-6 rounded-full px-3 py-1 text-xs font-bold text-primary shadow-sm"
              style={{ backgroundColor: ACCENT }}
            >
              -20%
            </div>

            <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Tiết kiệm khi trả theo năm
            </div>

            {/* Pricing Cards Grid */}
            <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
              {/* Gói 1 */}
              <div className="group flex cursor-pointer flex-col justify-between rounded-xl border border-primary/10 bg-primary/5 p-2 text-center transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-white hover:shadow-lg sm:p-3">
                <div>
                  <div className="text-base font-bold text-primary transition-colors group-hover:text-[#d6ff3d] sm:text-lg">
                    590k
                  </div>
                  <div className="mt-0.5 text-[10px] text-gray-400 line-through transition-colors group-hover:text-white/70">
                    ~5.9tr/năm
                  </div>
                </div>
                <div className="mt-2 rounded bg-primary/10 px-1 py-0.5 text-[9px] font-semibold text-primary transition-all group-hover:bg-[#d6ff3d] group-hover:text-primary sm:text-[10px]">
                  Tiết kiệm 1.18tr
                </div>
              </div>

              {/* Gói 2 */}
              <div className="group flex cursor-pointer flex-col justify-between rounded-xl border border-primary/10 bg-primary/5 p-2 text-center transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-white hover:shadow-lg sm:p-3">
                <div>
                  <div className="text-base font-bold text-primary transition-colors group-hover:text-[#d6ff3d] sm:text-lg">
                    1.29tr
                  </div>
                  <div className="mt-0.5 text-[10px] text-gray-400 line-through transition-colors group-hover:text-white/70">
                    ~12.9tr/năm
                  </div>
                </div>
                <div className="mt-2 rounded bg-primary/10 px-1 py-0.5 text-[9px] font-semibold text-primary transition-all group-hover:bg-[#d6ff3d] group-hover:text-primary sm:text-[10px]">
                  Tiết kiệm 2.58tr
                </div>
              </div>

              {/* Gói 3 */}
              <div className="group flex cursor-pointer flex-col justify-between rounded-xl border border-primary/10 bg-primary/5 p-2 text-center transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-white hover:shadow-lg sm:p-3">
                <div>
                  <div className="text-sm font-bold text-primary transition-colors group-hover:text-[#d6ff3d] sm:text-base">
                    29.9tr
                  </div>
                  <div className="mt-0.5 text-[10px] font-medium text-gray-500 transition-colors group-hover:text-white/80">
                    Tổng Thầu
                  </div>
                </div>
                <div className="mt-2 rounded bg-primary/10 px-1 py-0.5 text-[9px] font-semibold text-primary transition-all group-hover:bg-[#d6ff3d] group-hover:text-primary sm:text-[10px]">
                  1TB • ∞
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="border-t border-gray-100 pt-3 text-[10px] leading-relaxed text-gray-400 sm:text-[11px]">
              * Gói Tổng Thầu chỉ có theo năm. Giá đã bao gồm VAT, hỗ trợ 1-1. Mua thêm lẻ áp dụng khi vượt hạn
              mức.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceBanner;