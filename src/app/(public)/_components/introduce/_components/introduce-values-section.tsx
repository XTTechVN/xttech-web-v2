'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Award,
  Compass,
  Cpu,
  Eye,
  HeartHandshake,
  Layers,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { INTRODUCE_EASE_OUT } from '@/app/(public)/_components/introduce/_components/use-spotlight-cycle';

interface ValuePillar {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ValueTabItem {
  id: string;
  label: string;
  headline: string;
  lead: string;
  quote: string;
  items: ValuePillar[];
}

const VALUE_TABS: ValueTabItem[] = [
  {
    id: 'vision',
    label: 'TẦM NHÌN',
    headline: 'Đưa công nghệ chuẩn mực vào từng xưởng sản xuất Việt',
    lead: 'XTTECH hướng tới trở thành đối tác công nghệ tin cậy nhất của cộng đồng doanh nghiệp sản xuất nhôm kính, cơ khí và nhà thầu xây dựng.',
    quote: 'Số hóa không phải xu hướng xa vời, mà là năng lực cạnh tranh cốt lõi của mỗi xưởng.',
    items: [
      {
        title: 'Chuẩn hóa xưởng sản xuất vừa & nhỏ',
        desc: 'Giúp các đơn vị gia công chuyển dịch từ vận hành theo kinh nghiệm rời rạc sang quy trình bài bản dựa trên dữ liệu thực tế.',
        icon: Target,
      },
      {
        title: 'Kết nối liền mạch văn phòng & công trường',
        desc: 'Xóa bỏ khoảng cách thông tin giữa kỹ sư thiết kế, thủ kho, tổ thợ tại phân xưởng và đội ngũ lắp dựng ngoài thực địa.',
        icon: Layers,
      },
      {
        title: 'Kiến tạo hệ sinh thái bền vững',
        desc: 'Xây dựng nền tảng công nghệ mở, liên tục thích ứng với tiêu chuẩn vật liệu và phương thức sản xuất hiện đại.',
        icon: Eye,
      },
    ],
  },
  {
    id: 'mission',
    label: 'SỨ MỆNH',
    headline: 'Giải phóng người thợ khỏi sai sót và thủ công rời rạc',
    lead: 'Chúng tôi tạo ra những công cụ thực dụng, dễ dùng để mọi thành viên trong doanh nghiệp làm việc chính xác và nhẹ nhàng hơn mỗi ngày.',
    quote: 'Công nghệ tốt nhất là công nghệ mà người thợ ngoài xưởng cầm lên là dùng được ngay.',
    items: [
      {
        title: 'Đơn giản hóa nghiệp vụ kỹ thuật phức tạp',
        desc: 'Biến các phép tính vật tư, bản vẽ và điều phối đơn hàng thành thao tác trực quan, hạn chế tối đa nhầm lẫn.',
        icon: Cpu,
      },
      {
        title: 'Tôn trọng thời gian & chi phí của xưởng',
        desc: 'Giảm thiểu hao hụt nguyên vật liệu, rút ngắn thời gian chờ đợi và loại bỏ các chi phí vận hành phát sinh không đáng có.',
        icon: Zap,
      },
      {
        title: 'Sát cánh triển khai đến khi vận hành trơn tru',
        desc: 'Không dừng lại ở việc bàn giao, XTTECH đồng hành đào tạo nhân sự và tinh chỉnh theo đúng nhịp làm việc của từng xưởng.',
        icon: Compass,
      },
    ],
  },
  {
    id: 'core-values',
    label: 'GIÁ TRỊ CỐT LÕI',
    headline: 'Thực chiến tại xưởng. Chính xác đến từng chi tiết.',
    lead: 'Mỗi quyết định kỹ thuật và dịch vụ tại XTTECH đều xoay quanh ba giá trị nền tảng mà đội ngũ luôn giữ vững.',
    quote: 'Sự tin tưởng của chủ xưởng và người thợ là thước đo lớn nhất cho giá trị của XTTECH.',
    items: [
      {
        title: 'Chính xác & Kỷ luật',
        desc: 'Từng con số kỹ thuật, định mức vật tư và dữ liệu vận hành phải chuẩn xác và nhất quán trước khi đến tay khách hàng.',
        icon: ShieldCheck,
      },
      {
        title: 'Thực tế & Dễ tiếp cận',
        desc: 'Không chạy theo hình thức phức tạp; mọi giải pháp đều xuất phát từ nhịp làm việc thật tại xưởng và công trình.',
        icon: Wrench,
      },
      {
        title: 'Tận tâm & Bền bỉ',
        desc: 'Luôn lắng nghe phản hồi từ người dùng cuối, hỗ trợ kịp thời và chịu trách nhiệm đến cùng trong suốt quá trình đồng hành.',
        icon: HeartHandshake,
      },
    ],
  },
  {
    id: 'code-of-conduct',
    label: 'BỘ QUY TẮC ỨNG XỬ XTTECH',
    headline: 'Minh bạch với đối tác, cầu thị với từng góp ý',
    lead: 'Văn hóa làm việc tại XTTECH đề cao sự thẳng thắn, tinh thần trách nhiệm và sự học hỏi không ngừng từ thực tiễn.',
    quote: 'Mỗi bài toán khó từ xưởng là cơ hội để XTTECH hoàn thiện sản phẩm và dịch vụ tốt hơn.',
    items: [
      {
        title: 'Đặt hiệu quả khách hàng lên trước',
        desc: 'Mọi cải tiến đều được đánh giá bằng mức độ tiết kiệm thời gian, vật tư và công sức thực tế cho doanh nghiệp.',
        icon: Users,
      },
      {
        title: 'Cam kết rõ ràng, không né tránh',
        desc: 'Minh bạch về năng lực, tiến độ triển khai và chủ động xử lý triệt để khi phát sinh vướng mắc trong vận hành.',
        icon: Award,
      },
      {
        title: 'Liên tục hoàn thiện mỗi ngày',
        desc: 'Đội ngũ kỹ sư thường xuyên xuống xưởng, lắng nghe thợ và chủ doanh nghiệp để nâng cấp trải nghiệm không ngừng.',
        icon: Sparkles,
      },
    ],
  },
];

export function IntroduceValuesSection() {
  const [activeTabId, setActiveTabId] = useState<string>('core-values');
  const activeIdx = Math.max(
    0,
    VALUE_TABS.findIndex((tab) => tab.id === activeTabId),
  );
  const activeTab = VALUE_TABS[activeIdx];

  return (
    <section className="relative overflow-hidden border-y border-slate-100 bg-white py-14 sm:py-18">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, ease: INTRODUCE_EASE_OUT }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Văn hóa & Định hướng
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl">
            Nền tảng tạo nên <span className="text-primary">giá trị XTTECH</span>
          </h2>
        </motion.div>

        {/* Thanh tab tối giản dạng gạch chân */}
        <div className="mt-8 flex justify-center">
          <div
            role="tablist"
            aria-label="Giá trị và định hướng XTTECH"
            className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-200 sm:gap-6"
          >
            {VALUE_TABS.map((tab, idx) => {
              const isActive = tab.id === activeTabId;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`relative flex cursor-pointer items-center gap-2 px-3 pt-2 pb-3.5 text-xs font-extrabold tracking-wide uppercase transition-colors duration-200 sm:px-4 sm:text-sm ${
                    isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] font-bold transition-colors ${
                      isActive ? 'text-primary' : 'text-slate-400'
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="introduceValuesTabUnderline"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className="absolute inset-x-0 -bottom-px h-[2.5px] rounded-full bg-primary"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bố cục Editorial 2 cột: Tuyên ngôn bên trái + 3 trụ cột tối giản bên phải */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: INTRODUCE_EASE_OUT }}
            className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12"
          >
            {/* Cột trái: Tuyên ngôn & Trích dẫn */}
            <div className="lg:col-span-5">
              <p className="font-mono text-xs font-bold tracking-widest text-primary uppercase">
                0{activeIdx + 1} · {activeTab.label}
              </p>
              <h3 className="mt-2.5 text-2xl font-black tracking-tight text-slate-900 sm:text-[28px] sm:leading-snug">
                {activeTab.headline}
              </h3>
              <p className="mt-3.5 text-sm leading-relaxed text-slate-600 sm:text-base">
                {activeTab.lead}
              </p>

              <blockquote className="mt-6 border-l-2 border-primary pl-4 text-sm font-medium italic leading-relaxed text-slate-700">
                “{activeTab.quote}”
              </blockquote>
            </div>

            {/* Cột phải: Danh sách 3 trụ cột phân tách bằng đường kẻ mảnh, không đóng khung cứng */}
            <div className="divide-y divide-slate-200/80 border-y border-slate-200/80 lg:col-span-7">
              {activeTab.items.map((item, idx) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.28, delay: idx * 0.05, ease: INTRODUCE_EASE_OUT }}
                    className="group flex items-start gap-4 py-5 transition-colors duration-200 hover:bg-slate-50/70 sm:gap-5 sm:px-4 sm:py-6"
                  >
                    <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-primary sm:text-lg">
                        {item.title}
                      </h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
