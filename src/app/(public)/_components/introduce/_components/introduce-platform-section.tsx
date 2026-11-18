'use client';

import React from 'react';
import { motion } from 'motion/react';
import { PLATFORM_CAPABILITIES } from '@/app/(public)/_components/introduce/_components/introduce.constants';
import { INTRODUCE_EASE_OUT, useSpotlightCycle } from '@/app/(public)/_components/introduce/_components/use-spotlight-cycle';

export function IntroducePlatformSection() {
  const { activeIdx, setActiveIdx, pauseProps } = useSpotlightCycle(PLATFORM_CAPABILITIES.length, 2800);

  return (
    <section className="border-b border-slate-100 bg-sky-50/45 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, ease: INTRODUCE_EASE_OUT }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center rounded-full border border-primary/15 bg-white px-3.5 py-1 text-xs font-bold text-primary shadow-2xs">
            Năng lực nền tảng
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl">
            Một nền tảng cho nhiều bài toán{' '}
            <span className="text-primary">quản trị doanh nghiệp</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            XTTECH kết nối đồng bộ từ thiết kế kỹ thuật CAD 2D/3D, sản xuất tại xưởng, kiểm soát kho vật tư đến thi công công trình, nhân sự, bán hàng và báo cáo tài chính.
          </p>
        </motion.div>

        <div
          {...pauseProps}
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
        >
          {PLATFORM_CAPABILITIES.map((item, idx) => {
            const Icon = item.icon;
            const isActive = idx === activeIdx;

            return (
              <motion.div
                key={item.title}
                animate={{ y: isActive ? -3 : 0 }}
                transition={{ duration: 0.3, ease: INTRODUCE_EASE_OUT }}
                whileHover={{ y: -4 }}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white p-5 text-left transition-all duration-300 ${
                  isActive
                    ? 'border-primary/40 shadow-lg shadow-primary/10'
                    : 'border-slate-200/80 shadow-xs hover:border-primary/30 hover:shadow-md'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="platformCapabilityActiveBar"
                    transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                    className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-hero-accent to-primary"
                  />
                )}

                <div className="flex items-center justify-between gap-3">
                  <motion.span
                    animate={isActive ? { scale: 1.06 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
                      isActive ? 'bg-primary text-white shadow-xs' : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.span>
                  <span
                    className={`font-mono text-xs font-bold transition-colors ${
                      isActive ? 'text-primary' : 'text-slate-300'
                    }`}
                  >
                    0{idx + 1}
                  </span>
                </div>

                <h3
                  className={`mt-4 text-base font-extrabold transition-colors ${
                    isActive ? 'text-primary' : 'text-slate-900'
                  }`}
                >
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
