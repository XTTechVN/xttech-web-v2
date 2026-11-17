'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Compass } from 'lucide-react';
import { MISSION_PILLARS } from './introduce.constants';

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function IntroduceMissionSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % MISSION_PILLARS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <section className="border-b border-slate-100 bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Cột trái: Tuyên ngôn sứ mệnh */}
          <div className="lg:col-span-5">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary"
            >
              <motion.span
                animate={{ rotate: [0, 15, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex"
              >
                <Compass className="h-3.5 w-3.5" />
              </motion.span>
              <span>Sứ mệnh XTTECH</span>
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: 0.06, ease: EASE_OUT }}
              className="mt-3 text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl"
            >
              Giúp xưởng sản xuất & nhà thầu{' '}
              <span className="text-primary">làm chủ công nghệ</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: 0.12, ease: EASE_OUT }}
              className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base"
            >
              XTTECH ra đời với mong muốn giúp các xưởng nhôm kính, cơ khí và đội ngũ thi công thoát khỏi cảnh quản lý rời rạc, giảm sai sót vật tư và xây dựng nền tảng vận hành bài bản để phát triển đường dài.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: 0.18, ease: EASE_OUT }}
              className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base"
            >
              Chúng tôi tập trung giải quyết những bài toán thực tế nhất mỗi ngày tại xưởng: từ khâu đo đạc ô chờ, lên bản vẽ 2D/3D, chia cây cắt nhôm tối ưu đến kiểm soát kho và nghiệm thu công trình.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: 0.24, ease: EASE_OUT }}
              className="mt-5 rounded-xl border-l-4 border-primary bg-primary/5 px-4 py-4 text-sm font-medium italic leading-relaxed text-slate-700"
            >
              “Công nghệ chỉ thực sự có giá trị khi người thợ ngoài xưởng và chủ doanh nghiệp có thể sử dụng dễ dàng mỗi ngày.”
            </motion.div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                {
                  title: 'Thực tế tại xưởng',
                  desc: 'Thiết kế bám sát quy trình gia công, ép góc và lắp dựng công trình Việt Nam.',
                },
                {
                  title: 'Đồng hành lâu dài',
                  desc: 'Hỗ trợ đào tạo nhân sự, cập nhật hệ nhôm và nâng cấp tính năng liên tục.',
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: 0.28 + idx * 0.06, ease: EASE_OUT }}
                  whileHover={{ y: -3 }}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 transition-colors hover:border-primary/35 hover:bg-white hover:shadow-sm"
                >
                  <p className="text-xs font-extrabold text-primary uppercase">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Cột phải: 4 trụ cột sứ mệnh có spotlight tự chạy mượt mà */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="space-y-4 lg:col-span-7"
          >
            {MISSION_PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              const isActive = idx === activeIdx;

              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, x: 22 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.44, delay: idx * 0.08, ease: EASE_OUT }}
                  whileHover={{ y: -2 }}
                  onMouseEnter={() => setActiveIdx(idx)}
                  className={`group relative flex items-start gap-4 overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                    isActive
                      ? 'border-primary/40 bg-white shadow-lg shadow-primary/10'
                      : 'border-slate-200/90 bg-slate-50/70 hover:border-primary/30 hover:bg-white hover:shadow-md'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="missionActiveBar"
                      transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                      className="pointer-events-none absolute inset-y-3 left-0 w-1 rounded-r-full bg-primary"
                    />
                  )}

                  <motion.span
                    animate={isActive ? { scale: 1.08 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.span>
                  <div>
                    <h3 className={`text-base font-extrabold transition-colors ${isActive ? 'text-primary' : 'text-slate-900'}`}>
                      {pillar.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{pillar.desc}</p>
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
