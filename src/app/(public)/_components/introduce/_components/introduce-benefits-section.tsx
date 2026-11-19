'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { INTRODUCE_EASE_OUT, SOFTWARE_BENEFITS } from './introduce.constants';

export function IntroduceBenefitsSection() {
  return (
    <section className="border-b border-t border-slate-100 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14">
          {/* ===================== CỘT TRÁI: TIÊU ĐỀ, ĐỊNH HƯỚNG & NÚT CTA (Theo bố cục Ảnh 1) ===================== */}
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
                Giá trị thực tế khi{' '}
                <span className="text-primary">vận hành trên XTTECH</span>
              </h2>
              <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
                XTTECH chuẩn hóa toàn diện quy trình từ khảo sát ô chờ, bóc tách vật tư và xuất thẻ cắt A4 đến quản lý kho và giám sát công trình — giúp chủ xưởng loại bỏ hao hụt và bảo vệ biên lợi nhuận.
              </p>
            </div>

            {/* Nút CTA nổi bật */}
            <div className="pt-2">
              <Link
                href="/pricing"
                className="group inline-flex items-center gap-2.5 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/35"
              >
                <span>Khám phá giải pháp</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Chỉ số thực tế tạo niềm tin (Social proof numbers) */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200/80 pt-6">
              <div>
                <p className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">-90%</p>
                <p className="mt-1 text-xs font-medium text-slate-500">Thời gian bóc tách & ra thẻ cắt</p>
              </div>
              <div>
                <p className="text-2xl font-black tracking-tight text-primary sm:text-3xl">-15%</p>
                <p className="mt-1 text-xs font-medium text-slate-500">Tỷ lệ hao hụt phôi nhôm xưởng</p>
              </div>
            </div>
          </motion.div>

          {/* ===================== CỘT PHẢI: LƯỚI 4 GIÁ TRỊ VẬN HÀNH (UI Bento/Grid hiện đại) ===================== */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-7">
            {SOFTWARE_BENEFITS.map((benefit, idx) => {
              const Icon = benefit.icon;
              const stepNumber = String(idx + 1).padStart(2, '0');

              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2, margin: '0px 0px -40px 0px' }}
                  transition={{
                    duration: 0.48,
                    delay: idx * 0.08,
                    ease: INTRODUCE_EASE_OUT,
                  }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                >
                  {/* Dải màu line hover tinh tế ở đáy thẻ */}
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-primary to-emerald-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div>
                    {/* Hàng trên: Icon tròn + Số thứ tự phong cách tối giản */}
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-md group-hover:shadow-primary/25">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-black tracking-widest text-slate-300 transition-colors duration-300 group-hover:text-primary/60">
                        {stepNumber}
                      </span>
                    </div>

                    {/* Tiêu đề & nội dung lợi ích */}
                    <h3 className="mt-5 text-base font-bold text-slate-900 transition-colors duration-200 group-hover:text-primary sm:text-lg">
                      {benefit.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {benefit.desc}
                    </p>
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
