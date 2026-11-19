'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { INTRODUCE_EASE_OUT, SOFTWARE_BENEFITS } from './introduce.constants';

export function IntroduceBenefitsSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section className="border-b border-slate-100 bg-slate-50/50 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3, margin: '0px 0px -80px 0px' }}
          transition={{ duration: 0.5, ease: INTRODUCE_EASE_OUT }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            Lợi ích mang lại
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl">
            Giá trị thực tế khi <span className="text-primary">vận hành trên XTTECH</span>
          </h2>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SOFTWARE_BENEFITS.map((benefit, idx) => {
            const Icon = benefit.icon;
            const isActive = idx === activeIdx;
            const slideFromX = idx < 2 ? -32 : 32;

            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: slideFromX }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25, margin: '0px 0px -80px 0px' }}
                transition={{ duration: 0.5, delay: (idx % 2) * 0.1, ease: INTRODUCE_EASE_OUT }}
              >
                <motion.div
                  animate={{ y: isActive ? -4 : 0 }}
                  transition={{ duration: 0.3, ease: INTRODUCE_EASE_OUT }}
                  whileHover={{ y: -5 }}
                  onMouseEnter={() => setActiveIdx(idx)}
                  className={`relative h-full overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
                    isActive
                      ? 'border-primary/40 bg-white shadow-lg shadow-primary/10'
                      : 'border-slate-200/80 bg-white shadow-xs hover:border-primary/30 hover:shadow-md'
                  }`}
                >
                {isActive && (
                  <motion.span
                    layoutId="benefitActiveBar"
                    transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                    className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-hero-accent to-emerald-500"
                  />
                )}

                <motion.span
                  animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={{ duration: 1.8, repeat: isActive ? Infinity : 0, ease: 'easeInOut' }}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300 ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </motion.span>
                <h3 className={`mt-4 text-base font-extrabold transition-colors ${isActive ? 'text-primary' : 'text-slate-900'}`}>
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{benefit.desc}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
