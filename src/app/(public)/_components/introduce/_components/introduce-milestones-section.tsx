'use client';

import React, { useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Cpu,
  Factory,
  Rocket,
} from 'lucide-react';
import { INTRODUCE_EASE_OUT, useSpotlightCycle } from '@/app/(public)/_components/introduce/_components/use-spotlight-cycle';

interface MilestoneItem {
  shortPeriod: string;
  period: string;
  shortLabel: string;
  tag: string;
  title: string;
  desc: string;
  activities: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const COMPANY_MILESTONES: MilestoneItem[] = [
  {
    shortPeriod: '09/2025',
    period: 'Tháng 09/2025',
    shortLabel: 'Thành lập',
    tag: 'Khởi đầu',
    title: 'Thành lập Công ty Công nghệ XTTECH',
    desc: 'XTTECH chính thức ra đời với đội ngũ kỹ sư phần mềm và chuyên gia kỹ thuật ngành nhôm kính, đặt nền móng cho sứ mệnh số hóa xưởng sản xuất Việt.',
    activities: [
      'Khảo sát quy trình thực tế tại nhiều xưởng nhôm kính & cơ khí',
      'Xác định điểm nghẽn bóc tách vật tư, cắt phôi và quản lý công trình',
    ],
    icon: Building2,
  },
  {
    shortPeriod: '11/2025',
    period: 'Tháng 11/2025',
    shortLabel: 'Lõi CAD',
    tag: 'Nghiên cứu lõi',
    title: 'Phát triển nền tảng CAD 2D/3D & Thư viện hệ nhôm',
    desc: 'Tập trung xây dựng lõi thiết kế trực quan và chuẩn hóa công thức tính toán thanh nhôm, kính cường lực, phụ kiện theo các hệ nhôm phổ biến.',
    activities: [
      'Xây dựng công cụ vẽ cửa 2D/3D trực tiếp trên trình duyệt',
      'Chuẩn hóa dữ liệu hơn 25+ hệ nhôm và phụ kiện đồng bộ',
    ],
    icon: Cpu,
  },
  {
    shortPeriod: '02/2026',
    period: 'Tháng 02/2026',
    shortLabel: 'Thực chiến',
    tag: 'Thử nghiệm xưởng',
    title: 'Thử nghiệm thực tế & Tối ưu quy trình sản xuất',
    desc: 'Đưa hệ thống vào vận hành thí điểm cùng các xưởng đối tác để kiểm chứng độ chính xác của thuật toán chia cây cắt và thẻ cắt A4.',
    activities: [
      'Tối ưu chia cây nhôm giảm đề-xê dư thừa ngoài phân xưởng',
      'Hoàn thiện luồng kho vật tư, tiến độ ép góc và lắp dựng',
    ],
    icon: Factory,
  },
  {
    shortPeriod: '06/2026',
    period: 'Tháng 06/2026',
    shortLabel: 'Ra mắt XMS',
    tag: 'Hệ sinh thái',
    title: 'Chính thức vận hành hệ sinh thái XTTECH XMS',
    desc: 'Kết nối trọn vẹn quy trình từ khảo sát, báo giá, sản xuất tại xưởng đến chấm công công trình, tài chính và bảo hành điện tử QR.',
    activities: [
      'Ra mắt bộ giải pháp đồng bộ Web & App di động cho thợ công trình',
      'Tích hợp báo giá nhanh, chia sẻ link bản vẽ 2D/3D cho khách hàng',
    ],
    icon: Rocket,
  },
  {
    shortPeriod: 'Hiện tại',
    period: 'Hiện tại',
    shortLabel: 'Mở rộng',
    tag: 'Đồng hành',
    title: 'Đồng hành chuyển đổi số cùng cộng đồng xưởng Việt',
    desc: 'Tiếp tục lắng nghe phản hồi từ chủ xưởng và đội ngũ thi công để nâng cấp sản phẩm mỗi ngày, mở rộng mạng lưới triển khai toàn quốc.',
    activities: [
      'Hỗ trợ thiết lập hệ nhôm và đào tạo vận hành 1-1 cho từng xưởng',
      'Liên tục cập nhật tính năng thông minh và tối ưu trải nghiệm',
    ],
    icon: Compass,
  },
];

export function IntroduceMilestonesSection() {
  const { activeIdx, setActiveIdx, pauseProps } = useSpotlightCycle(COMPANY_MILESTONES.length, 3800);
  const trackRef = useRef<HTMLDivElement>(null);
  const activeItem = COMPANY_MILESTONES[activeIdx];
  const ActiveIcon = activeItem.icon;

  const selectMilestone = (idx: number, element?: HTMLElement | null) => {
    const bounded = (idx + COMPANY_MILESTONES.length) % COMPANY_MILESTONES.length;
    setActiveIdx(bounded);
    element?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  const progressPercent = (activeIdx / (COMPANY_MILESTONES.length - 1)) * 100;

  return (
    <section className="border-b border-slate-100 bg-white py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, ease: INTRODUCE_EASE_OUT }}
          className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
              <Calendar className="h-3.5 w-3.5" />
              Hành trình phát triển
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl">
              Từ dấu mốc <span className="text-primary">tháng 09/2025</span> đến hiện tại
            </h2>
          </div>

          <p className="max-w-md text-sm leading-relaxed text-slate-600">
            Chặng đường hình thành, nghiên cứu thực chiến tại xưởng và từng bước xây dựng nền tảng công nghệ phục vụ ngành nhôm kính Việt Nam.
          </p>
        </motion.div>

        <div {...pauseProps} className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 md:grid-cols-12 md:items-stretch md:gap-8">
          {/* Mobile: Thanh mốc thời gian ngang 1 hàng */}
          <div
            ref={trackRef}
            className="w-full overflow-x-auto pb-1 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
          >
            <div className="inline-flex min-w-full items-start justify-between gap-4 px-2">
              {COMPANY_MILESTONES.map((item, idx) => {
                const Icon = item.icon;
                const isActive = idx === activeIdx;
                const isPassed = idx < activeIdx;

                return (
                  <button
                    key={item.period}
                    type="button"
                    onClick={(e) => selectMilestone(idx, e.currentTarget)}
                    className="group relative z-10 flex shrink-0 cursor-pointer flex-col items-center text-center focus:outline-none"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        isActive
                          ? 'scale-110 border-primary bg-primary text-white shadow-lg shadow-primary/25'
                          : isPassed
                            ? 'border-primary bg-teal-50 text-primary'
                            : 'border-slate-200 bg-white text-slate-400 group-hover:border-primary/40 group-hover:text-primary'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>

                    <span
                      className={`mt-2 font-mono text-xs font-extrabold whitespace-nowrap transition-colors ${
                        isActive ? 'text-primary' : 'text-slate-700 group-hover:text-primary'
                      }`}
                    >
                      {item.shortPeriod}
                    </span>
                    <span className="mt-0.5 text-[11px] font-medium whitespace-nowrap text-slate-500">
                      {item.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop: Trục thời gian dọc bên trái */}
          <div className="relative hidden md:col-span-5 md:flex md:flex-col md:justify-between lg:col-span-4">
            {/* Đường trục dọc căn đúng tâm icon (px-3.5 = 14px + w-10/2 = 20px => 34px) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-8 bottom-8 left-[34px] w-0.5 bg-slate-200"
            >
              <motion.div
                className="w-full bg-primary"
                initial={false}
                animate={{ height: `${progressPercent}%` }}
                transition={{ duration: 0.55, ease: INTRODUCE_EASE_OUT }}
              />
            </div>

            <div className="space-y-2.5">
              {COMPANY_MILESTONES.map((item, idx) => {
                const Icon = item.icon;
                const isActive = idx === activeIdx;
                const isPassed = idx < activeIdx;

                return (
                  <button
                    key={item.period}
                    type="button"
                    onClick={() => selectMilestone(idx)}
                    className={`group relative z-10 flex w-full cursor-pointer items-center gap-4 rounded-lg px-3.5 py-3 text-left transition-colors duration-200 focus:outline-none ${
                      isActive ? 'bg-primary/[0.06]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        isActive
                          ? 'scale-105 border-primary bg-primary text-white shadow-md shadow-primary/25'
                          : isPassed
                            ? 'border-primary bg-teal-50 text-primary'
                            : 'border-slate-200 bg-white text-slate-400 group-hover:border-primary/40 group-hover:text-primary'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-xs font-extrabold transition-colors ${
                            isActive ? 'text-primary' : 'text-slate-500 group-hover:text-primary'
                          }`}
                        >
                          {item.period}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                          {item.shortLabel}
                        </span>
                      </div>
                      <p
                        className={`mt-0.5 truncate text-sm font-bold transition-colors ${
                          isActive ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'
                        }`}
                      >
                        {item.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Khung nội dung chi tiết bên phải (desktop) / bên dưới (mobile) */}
          <div className="flex flex-col justify-center overflow-hidden rounded-lg border border-slate-200/80 bg-linear-to-br from-slate-50/90 via-white to-teal-50/45 p-4 shadow-xs sm:p-6 md:col-span-7 lg:col-span-8 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.period}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: INTRODUCE_EASE_OUT }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      <ActiveIcon className="h-3.5 w-3.5" />
                      {activeItem.tag}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      0{activeIdx + 1} / 0{COMPANY_MILESTONES.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => selectMilestone(activeIdx - 1)}
                      aria-label="Mốc trước"
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:border-primary hover:text-primary"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => selectMilestone(activeIdx + 1)}
                      aria-label="Mốc tiếp theo"
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:border-primary hover:text-primary"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="mt-4 font-mono text-xl font-black tracking-tight text-primary sm:text-2xl">
                  {activeItem.period}
                </p>
                <h3 className="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-2xl">
                  {activeItem.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                  {activeItem.desc}
                </p>

                <ul className="mt-4 space-y-2.5 border-t border-slate-200/80 pt-4">
                  {activeItem.activities.map((activity) => (
                    <li
                      key={activity}
                      className="flex items-start gap-2.5 text-sm font-medium leading-relaxed text-slate-800"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
