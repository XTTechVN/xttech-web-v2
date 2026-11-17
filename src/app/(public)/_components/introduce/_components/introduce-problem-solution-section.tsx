'use client';

import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PROBLEM_SOLUTIONS } from '@/app/(public)/_components/introduce/_components/introduce.constants';
import { INTRODUCE_EASE_OUT, useSpotlightCycle } from '@/app/(public)/_components/introduce/_components/use-spotlight-cycle';

export function IntroduceProblemSolutionSection() {
  const { activeIdx, setActiveIdx, pauseProps } = useSpotlightCycle(PROBLEM_SOLUTIONS.length, 3200);

  return (
    <section className="border-b border-slate-100 bg-white pt-8 pb-12 sm:pt-10 sm:pb-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: INTRODUCE_EASE_OUT }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600">
            Nỗi đau & Giải pháp
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl">
            Chuyển đổi từ <span className="text-rose-600">quản lý rời rạc</span> sang{' '}
            <span className="text-primary">vận hành đồng bộ</span>
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Giải quyết trực tiếp 4 điểm nghẽn thường gặp tại xưởng sản xuất nhôm kính và đội thi công công trình.
          </p>
        </motion.div>

        <div {...pauseProps} className="mt-10 space-y-4">
          {PROBLEM_SOLUTIONS.map((item, idx) => {
            const isActive = idx === activeIdx;

            return (
              <motion.div
                key={item.problem}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.48, delay: idx * 0.08, ease: INTRODUCE_EASE_OUT }}
                whileHover={{ y: -2 }}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`group relative grid grid-cols-1 overflow-hidden rounded-2xl border bg-white transition-all duration-300 lg:grid-cols-2 ${
                  isActive
                    ? 'border-primary/40 shadow-lg shadow-primary/10'
                    : 'border-slate-200/90 shadow-xs hover:border-primary/30 hover:shadow-md'
                }`}
              >
                {/* Thanh accent trượt mượt bên trái khi row đang spotlight */}
                {isActive && (
                  <motion.span
                    layoutId="problemSolutionActiveBar"
                    transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                    className="pointer-events-none absolute inset-y-0 left-0 z-20 w-1 bg-linear-to-b from-rose-500 via-primary to-emerald-500"
                  />
                )}

                {/* Cột Nỗi đau */}
                <motion.div
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: idx * 0.08 + 0.05, ease: INTRODUCE_EASE_OUT }}
                  className={`flex items-start gap-3.5 border-b border-slate-100 p-5 transition-colors duration-300 sm:p-6 lg:border-r lg:border-b-0 ${
                    isActive ? 'bg-rose-50/75' : 'bg-rose-50/40'
                  }`}
                >
                  <motion.span
                    animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                    transition={{ duration: 1.8, repeat: isActive ? Infinity : 0, ease: 'easeInOut' }}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
                      isActive ? 'bg-rose-500 text-white shadow-xs' : 'bg-rose-100 text-rose-600'
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </motion.span>
                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-rose-600 uppercase">
                      Vấn đề #{idx + 1}
                    </span>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">{item.problem}</p>
                  </div>
                </motion.div>

                {/* Mũi tên chuyển đổi ở giữa (hiển thị trên desktop) */}
                <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:flex">
                  <motion.span
                    animate={isActive ? { x: [0, 3, 0], scale: 1.08 } : { x: 0, scale: 1 }}
                    transition={{
                      x: { duration: 1.2, repeat: isActive ? Infinity : 0, ease: 'easeInOut' },
                      scale: { duration: 0.25 },
                    }}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border shadow-sm transition-colors duration-300 ${
                      isActive
                        ? 'border-primary bg-primary text-white'
                        : 'border-slate-200 bg-white text-slate-400'
                    }`}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </motion.span>
                </div>

                {/* Cột Giải pháp */}
                <motion.div
                  initial={{ opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: idx * 0.08 + 0.1, ease: INTRODUCE_EASE_OUT }}
                  className={`flex items-start gap-3.5 p-5 transition-colors duration-300 sm:p-6 lg:pl-8 ${
                    isActive ? 'bg-emerald-50/65' : 'bg-emerald-50/30'
                  }`}
                >
                  <motion.span
                    animate={isActive ? { scale: 1.08 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
                      isActive ? 'bg-primary text-white shadow-xs' : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </motion.span>
                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-primary uppercase">
                      Giải pháp XTTECH
                    </span>
                    <p className="mt-1 text-sm leading-relaxed font-medium text-slate-800">{item.solution}</p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
