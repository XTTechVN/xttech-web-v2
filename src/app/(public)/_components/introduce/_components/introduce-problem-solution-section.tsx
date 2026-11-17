'use client';

import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { PROBLEM_SOLUTIONS } from './introduce.constants';

export function IntroduceProblemSolutionSection() {
  return (
    <section className="border-b border-slate-100 bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45 }}
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

        <div className="mt-10 space-y-4">
          {PROBLEM_SOLUTIONS.map((item, idx) => (
            <motion.div
              key={item.problem}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.42, delay: idx * 0.06 }}
              className="grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-shadow hover:shadow-md lg:grid-cols-2"
            >
              {/* Cột Nỗi đau */}
              <div className="flex items-start gap-3.5 border-b border-slate-100 bg-rose-50/45 p-5 sm:p-6 lg:border-r lg:border-b-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-rose-600 uppercase">
                    Vấn đề #{idx + 1}
                  </span>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">{item.problem}</p>
                </div>
              </div>

              {/* Cột Giải pháp */}
              <div className="flex items-start gap-3.5 bg-emerald-50/35 p-5 sm:p-6">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-primary uppercase">
                    Giải pháp XTTECH
                  </span>
                  <p className="mt-1 text-sm leading-relaxed font-medium text-slate-800">{item.solution}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
