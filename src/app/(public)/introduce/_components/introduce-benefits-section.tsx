'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import {
  BENEFIT_STEP_STYLES,
  INTRODUCE_EASE_OUT,
  SOFTWARE_BENEFITS,
} from '../_constants/introduce.constants';

export function IntroduceBenefitsSection() {
  return (
    <section className="border-b border-t border-slate-100 bg-white py-16 sm:py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25, margin: '0px 0px -60px 0px' }}
            transition={{ duration: 0.5, ease: INTRODUCE_EASE_OUT }}
            className="space-y-6 lg:col-span-5 lg:sticky lg:top-28"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Lợi ích vận hành thực tế</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:leading-[1.18]">
                Giá trị thực tế khi <span className="text-primary">vận hành trên XTTECH</span>
              </h2>
              <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
                XTTECH chuẩn hóa toàn diện quy trình từ khảo sát ô chờ, bóc tách vật tư và xuất thẻ cắt A4 đến quản lý
                kho và giám sát công trình — giúp chủ xưởng loại bỏ hao hụt và bảo vệ biên lợi nhuận.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/pricing"
                className="group inline-flex items-center gap-2.5 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/35"
              >
                <span>Khám phá giải pháp</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-200/80 pt-6">
              <div>
                <p className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">-90%</p>
                <p className="mt-1 text-xs font-medium text-slate-500">Thời gian bóc tách &amp; ra thẻ cắt</p>
              </div>
              <div>
                <p className="text-2xl font-black tracking-tight text-primary sm:text-3xl">-15%</p>
                <p className="mt-1 text-xs font-medium text-slate-500">Tỷ lệ hao hụt phôi nhôm xưởng</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4 sm:space-y-4.5 lg:col-span-7 relative">
            {SOFTWARE_BENEFITS.map((benefit, idx) => {
              const Icon = benefit.icon;
              const stepNumber = String(idx + 1).padStart(2, '0');
              const style = BENEFIT_STEP_STYLES[idx] || BENEFIT_STEP_STYLES[0];

              return (
                <div key={benefit.title} className={`relative ${style.offsetClass}`}>
                  {idx > 0 && (
                    <motion.div
                      aria-hidden="true"
                      initial={{ opacity: 0, scaleY: 0 }}
                      whileInView={{ opacity: 1, scaleY: 1 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.4, delay: idx * 0.1, ease: 'easeOut' }}
                      className="pointer-events-none absolute -left-6 sm:-left-6 lg:-left-8 xl:-left-10 w-6 sm:w-6 lg:w-8 xl:w-10 -top-4 sm:-top-4.5 h-[calc(50%+1rem)] sm:h-[calc(50%+1.125rem)] border-b-2 border-l-2 border-emerald-400/60 rounded-bl-2xl hidden sm:block origin-top"
                    />
                  )}

                  <motion.div
                    initial={{ opacity: 0, x: 28, y: 14 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, amount: 0.2, margin: '0px 0px -40px 0px' }}
                    transition={{
                      duration: 0.52,
                      delay: idx * 0.11,
                      ease: INTRODUCE_EASE_OUT,
                    }}
                    className={`group relative flex items-center justify-between gap-4 sm:gap-5 overflow-hidden rounded-2xl sm:rounded-3xl border p-4 sm:p-5 sm:px-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:translate-x-1 ${style.card}`}
                  >
                    <div
                      className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-black transition-transform duration-300 group-hover:scale-105 ${style.circle}`}
                    >
                      {stepNumber}
                    </div>

                    <div className="flex-1 min-w-0 pr-1">
                      <h3 className={`text-sm sm:text-base font-extrabold tracking-tight transition-colors duration-200 ${style.title}`}>
                        {benefit.title}
                      </h3>
                      <p className={`mt-1 text-xs sm:text-sm leading-relaxed line-clamp-2 ${style.desc}`}>
                        {benefit.desc}
                      </p>
                    </div>

                    <div className={`shrink-0 transition-transform duration-300 group-hover:scale-115 ${style.icon}`}>
                      <Icon className="h-5 w-5 sm:h-5.5 sm:w-5.5 stroke-[1.8]" />
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
