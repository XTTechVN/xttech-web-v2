'use client';

import React from 'react';
import { motion } from 'motion/react';
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

interface ValueBlockItem {
  id: string;
  label: string;
  headline: string;
  lead: string;
  quote: string;
  items: ValuePillar[];
}

const VALUE_BLOCKS: ValueBlockItem[] = [
  {
    id: 'vision',
    label: 'TẦM NHÌN',
    headline: 'Đưa công nghệ chuẩn mực vào từng xưởng sản xuất Việt',
    lead: 'Trở thành đối tác công nghệ tin cậy nhất của cộng đồng doanh nghiệp nhôm kính, cơ khí và nhà thầu xây dựng.',
    quote: 'Số hóa không phải xu hướng xa vời, mà là năng lực cạnh tranh cốt lõi của mỗi xưởng.',
    items: [
      {
        title: 'Chuẩn hóa xưởng vừa & nhỏ',
        desc: 'Chuyển dịch từ vận hành cảm tính sang quy trình bài bản dựa trên dữ liệu thực tế.',
        icon: Target,
      },
      {
        title: 'Kết nối văn phòng & công trường',
        desc: 'Thông suốt thông tin giữa kỹ sư thiết kế, thủ kho, tổ thợ xưởng và đội lắp dựng.',
        icon: Layers,
      },
      {
        title: 'Hệ sinh thái bền vững',
        desc: 'Nền tảng mở liên tục thích ứng với tiêu chuẩn vật liệu và sản xuất hiện đại.',
        icon: Eye,
      },
    ],
  },
  {
    id: 'mission',
    label: 'SỨ MỆNH',
    headline: 'Giải phóng người thợ khỏi sai sót và thủ công rời rạc',
    lead: 'Tạo ra công cụ thực dụng, dễ dùng để mọi thành viên trong xưởng làm việc chính xác và nhẹ nhàng hơn.',
    quote: 'Công nghệ tốt nhất là công nghệ mà người thợ ngoài xưởng cầm lên là dùng được ngay.',
    items: [
      {
        title: 'Đơn giản hóa nghiệp vụ kỹ thuật',
        desc: 'Biến phép tính vật tư, bản vẽ và điều phối đơn hàng thành thao tác trực quan.',
        icon: Cpu,
      },
      {
        title: 'Tối ưu thời gian & chi phí',
        desc: 'Giảm hao hụt nguyên vật liệu, rút ngắn thời gian chờ và loại bỏ chi phí phát sinh.',
        icon: Zap,
      },
      {
        title: 'Sát cánh đến khi vận hành trơn tru',
        desc: 'Đồng hành đào tạo nhân sự và tinh chỉnh theo đúng nhịp làm việc của từng xưởng.',
        icon: Compass,
      },
    ],
  },
  {
    id: 'core-values',
    label: 'GIÁ TRỊ CỐT LÕI',
    headline: 'Thực chiến tại xưởng. Chính xác đến từng chi tiết.',
    lead: 'Mỗi quyết định kỹ thuật và dịch vụ tại XTTECH đều xoay quanh ba giá trị nền tảng.',
    quote: 'Sự tin tưởng của chủ xưởng và người thợ là thước đo lớn nhất cho giá trị của XTTECH.',
    items: [
      {
        title: 'Chính xác & Kỷ luật',
        desc: 'Con số kỹ thuật, định mức vật tư và dữ liệu vận hành luôn chuẩn xác, nhất quán.',
        icon: ShieldCheck,
      },
      {
        title: 'Thực tế & Dễ tiếp cận',
        desc: 'Không chạy theo hình thức phức tạp; mọi giải pháp xuất phát từ nhịp làm việc thật.',
        icon: Wrench,
      },
      {
        title: 'Tận tâm & Bền bỉ',
        desc: 'Lắng nghe người dùng cuối, hỗ trợ kịp thời và chịu trách nhiệm đến cùng.',
        icon: HeartHandshake,
      },
    ],
  },
  {
    id: 'code-of-conduct',
    label: 'BỘ QUY TẮC ỨNG XỬ XTTECH',
    headline: 'Minh bạch với đối tác, cầu thị với từng góp ý',
    lead: 'Văn hóa XTTECH đề cao sự thẳng thắn, trách nhiệm và tinh thần học hỏi từ thực tiễn.',
    quote: 'Mỗi bài toán khó từ xưởng là cơ hội để XTTECH hoàn thiện sản phẩm và dịch vụ tốt hơn.',
    items: [
      {
        title: 'Đặt hiệu quả khách hàng lên trước',
        desc: 'Đánh giá mọi cải tiến bằng mức độ tiết kiệm thời gian, vật tư và công sức thực tế.',
        icon: Users,
      },
      {
        title: 'Cam kết rõ ràng, không né tránh',
        desc: 'Minh bạch năng lực, tiến độ triển khai và chủ động xử lý triệt để vướng mắc.',
        icon: Award,
      },
      {
        title: 'Liên tục hoàn thiện mỗi ngày',
        desc: 'Kỹ sư thường xuyên xuống xưởng lắng nghe thợ và chủ doanh nghiệp để nâng cấp.',
        icon: Sparkles,
      },
    ],
  },
];

export function IntroduceValuesSection() {
  return (
    <section className="relative overflow-hidden border-y border-slate-100 bg-white py-14 sm:py-20">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25, margin: '0px 0px -80px 0px' }}
          transition={{ duration: 0.5, ease: INTRODUCE_EASE_OUT }}
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

        {/* Bố cục dọc 4 chặng: Cuộn tới đâu hiện tới đó, xen kẽ trái/phải */}
        <div className="mt-14 space-y-16 sm:mt-16 sm:space-y-24">
          {VALUE_BLOCKS.map((block, blockIdx) => {
            const isReversed = blockIdx % 2 === 1;

            return (
              <div
                key={block.id}
                className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12"
              >
                {/* Khối tuyên ngôn */}
                <motion.div
                  initial={{ opacity: 0, x: isReversed ? 36 : -36 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.25, margin: '0px 0px -80px 0px' }}
                  transition={{ duration: 0.5, ease: INTRODUCE_EASE_OUT }}
                  className={`lg:col-span-5 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}
                >
                  <div className="inline-flex items-center gap-2.5">
                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-primary px-2 font-mono text-sm font-black text-white shadow-xs">
                      0{blockIdx + 1}
                    </span>
                    <span className="text-lg font-black tracking-wide text-primary uppercase sm:text-xl">
                      {block.label}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-black tracking-tight text-slate-900 sm:text-2xl sm:leading-snug">
                    {block.headline}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                    {block.lead}
                  </p>

                  <blockquote className="mt-5 border-l-2 border-primary pl-4 text-sm font-medium italic leading-relaxed text-slate-700">
                    “{block.quote}”
                  </blockquote>
                </motion.div>

                {/* Khối 3 trụ cột */}
                <motion.div
                  initial={{ opacity: 0, x: isReversed ? -36 : 36 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.25, margin: '0px 0px -80px 0px' }}
                  transition={{ duration: 0.5, delay: 0.08, ease: INTRODUCE_EASE_OUT }}
                  className={`divide-y divide-slate-200/80 border-y border-slate-200/80 lg:col-span-7 ${
                    isReversed ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  {block.items.map((item, idx) => {
                    const Icon = item.icon;

                    return (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.25, margin: '0px 0px -60px 0px' }}
                        transition={{ duration: 0.4, delay: 0.1 + idx * 0.08, ease: INTRODUCE_EASE_OUT }}
                        className="group flex items-start gap-4 py-5 transition-colors duration-200 hover:bg-slate-50/70 sm:gap-5 sm:px-4 sm:py-5"
                      >
                        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                          <Icon className="h-5 w-5" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-base font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-primary sm:text-lg">
                            {item.title}
                          </h4>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600">
                            {item.desc}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
