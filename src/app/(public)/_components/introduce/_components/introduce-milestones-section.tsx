'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Calendar, Compass, Cpu, Factory, Rocket } from 'lucide-react';
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
    desc: 'XTTECH chính thức được thành lập với đội ngũ kỹ sư phần mềm và chuyên gia kỹ thuật ngành nhôm kính, đặt nền móng cho sứ mệnh số hóa xưởng sản xuất Việt.',
    activities: [
      'Khảo sát quy trình thực tế tại nhiều xưởng nhôm kính & cơ khí',
      'Xác định các điểm nghẽn về bóc tách vật tư, cắt phôi và quản lý công trình',
    ],
    icon: Building2,
  },
  {
    period: 'Tháng 11/2025',
    tag: 'Nghiên cứu lõi',
    title: 'Phát triển nền tảng CAD 2D/3D & Thư viện hệ nhôm',
    desc: 'Tập trung xây dựng lõi thiết kế trực quan và chuẩn hóa công thức tính toán thanh nhôm, kính cường lực, phụ kiện theo các hệ nhôm phổ biến tại Việt Nam.',
    activities: [
      'Xây dựng bộ công cụ vẽ cửa 2D/3D trực tiếp trên trình duyệt',
      'Chuẩn hóa dữ liệu hơn 25+ hệ nhôm và phụ kiện đồng bộ',
    ],
    icon: Cpu,
  },
  {
    period: 'Tháng 02/2026',
    tag: 'Thực chiến tại xưởng',
    title: 'Thử nghiệm thực tế & Tối ưu quy trình sản xuất',
    desc: 'Đưa hệ thống vào vận hành thí điểm cùng các xưởng đối tác để kiểm chứng độ chính xác của thuật toán chia cây cắt và thẻ cắt A4.',
    activities: [
      'Thử nghiệm chia cây nhôm tối ưu giảm đề-xê dư thừa ngoài phân xưởng',
      'Hoàn thiện luồng quản lý kho vật tư, tiến độ ép góc và lắp dựng',
    ],
    icon: Factory,
  },
  {
    period: 'Tháng 06/2026',
    tag: 'Ra mắt hệ sinh thái',
    title: 'Chính thức vận hành hệ sinh thái XTTECH XMS',
    desc: 'Kết nối trọn vẹn quy trình từ khảo sát, báo giá, sản xuất tại xưởng đến chấm công công trình, tài chính và bảo hành điện tử QR trên một nền tảng.',
    activities: [
      'Ra mắt bộ giải pháp đồng bộ Web & App di động cho thợ công trình',
      'Tích hợp báo giá nhanh, chia sẻ link bản vẽ 2D/3D cho khách hàng',
    ],
    icon: Rocket,
  },
  {
    period: 'Hiện tại',
    tag: 'Mở rộng & Đồng hành',
    title: 'Đồng hành chuyển đổi số cùng cộng đồng xưởng Việt',
    desc: 'Tiếp tục lắng nghe phản hồi từ chủ xưởng và đội ngũ thi công để nâng cấp sản phẩm mỗi ngày, mở rộng mạng lưới triển khai trên toàn quốc.',
    activities: [
      'Hỗ trợ thiết lập hệ nhôm và đào tạo vận hành 1-1 cho từng xưởng',
      'Liên tục cập nhật tính năng thông minh và tối ưu trải nghiệm người dùng',
    ],
    icon: Compass,
  },
];

export function IntroduceMilestonesSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section className="border-b border-slate-100 bg-white py-14 sm:py-18">
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

        {/* Timeline dọc gọn đẹp */}
        <div className="relative mt-10 pl-6 sm:pl-8">
          {/* Đường trục dọc */}
          <div
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[11px] w-px bg-linear-to-b from-primary via-primary/40 to-slate-200 sm:left-[15px]"
          />

          <div className="space-y-5">
            {COMPANY_MILESTONES.map((item, idx) => {
              const Icon = item.icon;
              const isActive = idx === activeIdx;

              return (
                <motion.div
                  key={item.period}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: idx * 0.05, ease: INTRODUCE_EASE_OUT }}
                  onMouseEnter={() => setActiveIdx(idx)}
                  className="relative"
                >
                  {/* Điểm mốc trên trục */}
                  <span
                    className={`absolute top-6 -left-6 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-300 sm:-left-8 sm:h-8 sm:w-8 ${
                      isActive
                        ? 'scale-110 border-primary bg-primary text-white shadow-md shadow-primary/30'
                        : 'border-primary/30 bg-white text-primary'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </span>

                  <div
                    className={`rounded-2xl border p-5 transition-all duration-300 sm:p-6 ${
                      isActive
                        ? 'border-primary/35 bg-primary/[0.03] shadow-md shadow-primary/5'
                        : 'border-slate-200/80 bg-white hover:border-primary/25 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start lg:gap-6">
                      <div className="lg:col-span-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-extrabold text-primary">
                            {item.period}
                          </span>
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                            {item.tag}
                          </span>
                        </div>
                        <h3 className="mt-2 text-lg font-black tracking-tight text-slate-900">
                          {item.title}
                        </h3>
                      </div>

                      <div className="space-y-3 lg:col-span-8">
                        <p className="text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                          {item.desc}
                        </p>
                        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {item.activities.map((activity) => (
                            <li
                              key={activity}
                              className="flex items-start gap-2 rounded-xl bg-slate-50/90 px-3 py-2 text-xs font-medium leading-relaxed text-slate-700"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
