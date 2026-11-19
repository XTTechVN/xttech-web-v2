'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { INTRODUCE_EASE_OUT, TARGET_AUDIENCES } from './introduce.constants';

export function IntroduceAudienceSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section className="border-b border-slate-100 bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3, margin: '0px 0px -80px 0px' }}
          transition={{ duration: 0.5, ease: INTRODUCE_EASE_OUT }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            Đối tượng sử dụng
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl">
            XTTECH phù hợp với <span className="text-primary">những ai?</span>
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Linh hoạt cho mọi quy mô từ xưởng gia công, đội thợ hiện trường đến tổng thầu lớn.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {TARGET_AUDIENCES.map((aud, idx) => {
            const Icon = aud.icon;
            const isActive = idx === activeIdx;
            const slideFromX = idx % 2 === 0 ? -36 : 36;
            const rowDelay = Math.floor(idx / 2) * 0.12;

            return (
              <motion.div
                key={aud.title}
                initial={{ opacity: 0, x: slideFromX }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25, margin: '0px 0px -80px 0px' }}
                transition={{ duration: 0.5, delay: rowDelay, ease: INTRODUCE_EASE_OUT }}
              >
                <motion.div
                  animate={{ y: isActive ? -3 : 0 }}
                  transition={{ duration: 0.3, ease: INTRODUCE_EASE_OUT }}
                  whileHover={{ y: -4 }}
                  onMouseEnter={() => setActiveIdx(idx)}
                  className={`relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border bg-white p-6 transition-all duration-300 ${
                    isActive
                      ? 'border-primary/40 shadow-lg shadow-primary/10'
                      : 'border-slate-200/90 shadow-xs hover:border-primary/30 hover:shadow-md'
                  }`}
                >
                {isActive && (
                  <motion.span
                    layoutId="audienceActiveBar"
                    transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                    className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-hero-accent to-primary"
                  />
                )}

                <div>
                  <div className="flex items-center gap-3.5">
                    <motion.span
                      animate={isActive ? { scale: 1.08 } : { scale: 1 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
                        isActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.span>
                    <div>
                      <h3 className={`text-base font-extrabold transition-colors ${isActive ? 'text-primary' : 'text-slate-900'}`}>
                        {aud.title}
                      </h3>
                      <p className="text-xs font-medium text-primary/85">{aud.subtitle}</p>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    {aud.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
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
