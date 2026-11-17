'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { KEY_FEATURES } from './introduce.constants';

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function IntroduceFeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);

  const selectIndex = (nextIdx: number) => {
    const normalized = (nextIdx + KEY_FEATURES.length) % KEY_FEATURES.length;
    setDirection(normalized >= activeIndex ? 1 : -1);
    setActiveIndex(normalized);
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % KEY_FEATURES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const activeFeature = KEY_FEATURES[activeIndex];
  const ActiveIcon = activeFeature.icon;

  return (
    <section className="border-b border-slate-100 bg-slate-50/70 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
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

        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="mt-10 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12"
        >
          {/* Cột trái: Danh sách 6 công cụ chọn nhanh với thanh active trượt mượt */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
            {KEY_FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              const isActive = idx === activeIndex;

              return (
                <button
                  key={feat.title}
                  type="button"
                  onClick={() => selectIndex(idx)}
                  className={`group relative flex min-h-[72px] w-full cursor-pointer items-center gap-3.5 rounded-xl border px-3.5 py-3.5 text-left transition-colors duration-200 ${
                    isActive
                      ? 'border-primary/35 bg-white text-slate-900 shadow-sm'
                      : 'border-slate-200/70 bg-white/60 text-slate-600 hover:border-primary/25 hover:bg-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeFeatureSelectorBar"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className="pointer-events-none absolute inset-y-2.5 left-0 w-1 rounded-r-full bg-primary"
                    />
                  )}

                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'scale-105 bg-primary text-white shadow-xs'
                        : 'bg-primary/10 text-primary group-hover:bg-primary/15'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-extrabold tracking-wider text-primary uppercase">
                      0{idx + 1} · {feat.tag}
                    </span>
                    <p
                      className={`truncate text-xs sm:text-sm ${
                        isActive ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-700'
                      }`}
                    >
                      {feat.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Cột phải: Khung chi tiết tính năng trượt ngang mượt mà */}
          <div className="lg:col-span-8">
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-md sm:p-5">
              {/* Thanh đầu: số thứ tự + điều hướng prev/next */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary px-3 py-0.5 text-xs font-extrabold text-white">
                    {activeFeature.tag}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-400">
                    0{activeIndex + 1} / 0{KEY_FEATURES.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => selectIndex(activeIndex - 1)}
                    aria-label="Tính năng trước"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-primary hover:text-primary"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => selectIndex(activeIndex + 1)}
                    aria-label="Tính năng tiếp theo"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-primary hover:text-primary"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Nội dung trượt theo direction */}
              <div className="relative flex-1 overflow-hidden py-4">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={activeFeature.title}
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -28 }}
                    transition={{ duration: 0.34, ease: EASE_OUT }}
                    className="space-y-4"
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ActiveIcon className="h-7 w-7" />
                      </span>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 sm:text-2xl">
                          {activeFeature.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-600 sm:text-base">
                          {activeFeature.desc}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 sm:p-4">
                      <p className="text-xs font-extrabold tracking-wider text-primary uppercase">
                        Điểm nổi bật trong quy trình
                      </p>
                      <ul className="mt-2.5 space-y-2.5">
                        {activeFeature.highlights.map((item) => (
                          <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700 sm:text-base">
                            <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-600" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Chấm tiến trình phía dưới */}
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  {KEY_FEATURES.map((feat, idx) => {
                    const isDotActive = idx === activeIndex;
                    return (
                      <button
                        key={feat.title}
                        type="button"
                        onClick={() => selectIndex(idx)}
                        aria-label={`Chọn ${feat.title}`}
                        className={`h-2 cursor-pointer rounded-full transition-all duration-300 ${
                          isDotActive ? 'w-7 bg-primary' : 'w-2 bg-slate-200 hover:bg-primary/40'
                        }`}
                      />
                    );
                  })}
                </div>
               
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
