'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Compass,
  Cpu,
  Factory,
  Rocket,
} from 'lucide-react';
import { INTRODUCE_EASE_OUT } from '@/app/(public)/_components/introduce/_components/use-spotlight-cycle';

interface MilestoneItem {
  period: string;
  tag: string;
  title: string;
  desc: string;
  activities: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const COMPANY_MILESTONES: MilestoneItem[] = [
  {
    period: 'Tháng 09/2025',
    tag: 'Khởi đầu',
    title: 'Thành lập Công ty Công nghệ XTTECH',
    desc: 'Ra đời với đội ngũ kỹ sư phần mềm và chuyên gia ngành nhôm kính, bắt đầu sứ mệnh số hóa xưởng sản xuất Việt.',
    activities: [
      'Khảo sát thực tế tại các xưởng nhôm kính & cơ khí',
      'Xác định bài toán vật tư, cắt phôi và công trình',
    ],
    icon: Building2,
  },
  {
    period: 'Tháng 11/2025',
    tag: 'Nghiên cứu lõi',
    title: 'Phát triển nền tảng CAD 2D/3D',
    desc: 'Xây dựng công cụ vẽ cửa trực quan trên trình duyệt và chuẩn hóa công thức cho hơn 25+ hệ nhôm phổ biến.',
    activities: [
      'Hoàn thiện lõi thiết kế cửa 2D/3D trực tuyến',
      'Chuẩn hóa dữ liệu thanh nhôm, kính & phụ kiện',
    ],
    icon: Cpu,
  },
  {
    period: 'Tháng 02/2026',
    tag: 'Thực chiến',
    title: 'Thử nghiệm tại xưởng đối tác',
    desc: 'Vận hành thí điểm cùng các xưởng gia công để kiểm chứng thuật toán chia cây cắt phôi và thẻ cắt A4.',
    activities: [
      'Tối ưu chia cây nhôm giảm đề-xê dư thừa',
      'Hoàn thiện luồng kho, ép góc và lắp dựng',
    ],
    icon: Factory,
  },
  {
    period: 'Tháng 06/2026',
    tag: 'Ra mắt',
    title: 'Vận hành hệ sinh thái XTTECH XMS',
    desc: 'Kết nối liền mạch từ khảo sát, báo giá, sản xuất xưởng đến chấm công công trình, tài chính và bảo hành QR.',
    activities: [
      'Đồng bộ Web & App di động cho thợ công trình',
      'Chia sẻ link báo giá & bản vẽ 2D/3D nhanh',
    ],
    icon: Rocket,
  },
  {
    period: 'Hiện tại',
    tag: 'Đồng hành',
    title: 'Mở rộng cộng đồng xưởng Việt',
    desc: 'Liên tục nâng cấp tính năng từ phản hồi thực tế của chủ xưởng và đội thợ thi công trên toàn quốc.',
    activities: [
      'Đào tạo & thiết lập hệ nhôm 1-1 theo từng xưởng',
      'Cập nhật công nghệ mới và tối ưu trải nghiệm',
    ],
    icon: Compass,
  },
];

export function IntroduceMilestonesSection() {
  return (
    <section className="border-b border-slate-100 bg-slate-50/50 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25, margin: '0px 0px -80px 0px' }}
            transition={{ duration: 0.48, ease: INTRODUCE_EASE_OUT }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
              <Calendar className="h-3.5 w-3.5" />
              Hành trình phát triển
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl">
              Từ dấu mốc <span className="text-primary">tháng 09/2025</span> đến hiện tại
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25, margin: '0px 0px -80px 0px' }}
            transition={{ duration: 0.48, delay: 0.08, ease: INTRODUCE_EASE_OUT }}
            className="max-w-md text-sm leading-relaxed text-slate-600"
          >
            Chặng đường từ ngày thành lập đến khi xây dựng hệ sinh thái công nghệ phục vụ xưởng nhôm kính Việt.
          </motion.p>
        </div>

        {/* Timeline dọc: Trái 1 trục trên mobile, xen kẽ 2 bên trục giữa trên desktop */}
        <div className="relative mt-12 sm:mt-16">
          {/* Trục dọc: trái trên mobile, chính giữa trên md+ */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-2 bottom-2 left-4 w-0.5 bg-linear-to-b from-primary via-primary/40 to-slate-200 md:left-1/2 md:-translate-x-1/2"
          />

          <div className="space-y-8 md:space-y-10">
            {COMPANY_MILESTONES.map((item, idx) => {
              const Icon = item.icon;
              const isRightOnDesktop = idx % 2 === 1;

              return (
                <div
                  key={item.period}
                  className="relative grid grid-cols-1 items-center md:grid-cols-2 md:gap-12"
                >
                  {/* Điểm mốc icon nằm trên trục */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.25, margin: '0px 0px -80px 0px' }}
                    transition={{ duration: 0.35, ease: INTRODUCE_EASE_OUT }}
                    className="absolute top-5 left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white text-primary shadow-sm md:top-1/2 md:left-1/2 md:h-11 md:w-11 md:-translate-x-1/2 md:-translate-y-1/2"
                  >
                    <Icon className="h-4 w-4 md:h-5 md:w-5" />
                  </motion.div>

                  {/* Thẻ nội dung: Xen kẽ trượt từ trái hoặc từ phải trên desktop */}
                  <motion.div
                    initial={{ opacity: 0, x: isRightOnDesktop ? 36 : -36 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.25, margin: '0px 0px -80px 0px' }}
                    transition={{ duration: 0.5, ease: INTRODUCE_EASE_OUT }}
                    className={`pl-12 md:pl-0 ${
                      isRightOnDesktop ? 'md:col-start-2 md:pl-4' : 'md:col-start-1 md:pr-4'
                    }`}
                  >
                    <div className="group rounded-xl border border-slate-200/85 bg-white p-5 shadow-xs transition-all duration-300 hover:border-primary/35 hover:shadow-md sm:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-base font-black text-primary sm:text-lg">
                          {item.period}
                        </span>
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                          {item.tag}
                        </span>
                      </div>

                      <h3 className="mt-2 text-lg font-black tracking-tight text-slate-900 transition-colors group-hover:text-primary">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.desc}</p>

                      <ul className="mt-3.5 space-y-1.5 border-t border-slate-100 pt-3">
                        {item.activities.map((activity) => (
                          <li
                            key={activity}
                            className="flex items-start gap-2 text-xs font-medium leading-relaxed text-slate-700 sm:text-sm"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
