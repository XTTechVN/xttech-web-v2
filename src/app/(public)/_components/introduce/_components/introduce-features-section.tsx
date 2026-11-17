'use client';

import React from 'react';
import { motion } from 'motion/react';
import { KEY_FEATURES } from './introduce.constants';

export function IntroduceFeaturesSection() {
  return (
    <section className="border-b border-slate-100 bg-slate-50/70 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            Tính năng nổi bật
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl">
            Công cụ chuyên sâu cho <span className="text-primary">từng bộ phận</span>
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Từ phòng kỹ thuật, kinh doanh, thủ kho đến phân xưởng gia công và đội thợ ngoài công trường.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {KEY_FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.article
                key={feat.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className="group flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-extrabold text-slate-900">{feat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feat.desc}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
