'use client';

import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PLATFORM_CAPABILITIES } from '@/app/(public)/_components/introduce/_components/introduce.constants';
import { INTRODUCE_EASE_OUT, useSpotlightCycle } from '@/app/(public)/_components/introduce/_components/use-spotlight-cycle';

export function IntroducePlatformSection() {
  const { activeIdx, setActiveIdx, pauseProps } = useSpotlightCycle(PLATFORM_CAPABILITIES.length, 3200);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleSelectCard = (idx: number) => {
    const normalized = (idx + PLATFORM_CAPABILITIES.length) % PLATFORM_CAPABILITIES.length;
    setActiveIdx(normalized);

    const container = trackRef.current;
    const targetCard = cardRefs.current[normalized];
    if (container && targetCard && typeof window !== 'undefined' && window.innerWidth < 1024) {
      container.scrollTo({
        left: Math.max(0, targetCard.offsetLeft - 16),
        behavior: 'smooth',
      });
    }
  };

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

        {/* Mobile: Vuốt ngang + bấm nút trượt qua lại | Desktop: Lưới 3x2 */}
        <div
          ref={trackRef}
          {...pauseProps}
          className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:mt-10 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {PLATFORM_CAPABILITIES.map((item, idx) => {
            const Icon = item.icon;
            const isActive = idx === activeIdx;

            return (
              <motion.div
                key={item.title}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                onClick={() => handleSelectCard(idx)}
                onMouseEnter={() => setActiveIdx(idx)}
                animate={{ y: isActive ? -3 : 0 }}
                transition={{ duration: 0.3, ease: INTRODUCE_EASE_OUT }}
                whileHover={{ y: -4 }}
                className={`group relative flex w-[82%] max-w-[300px] shrink-0 snap-center cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 sm:w-[310px] lg:w-auto lg:max-w-none lg:shrink ${
                  isActive
                    ? 'border-primary bg-linear-to-br from-[#064e57] via-[#043e46] to-[#032a30] text-white shadow-xl shadow-primary/20'
                    : 'border-slate-200/85 bg-white text-slate-900 shadow-xs hover:border-primary/30 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <motion.span
                      animate={isActive ? { scale: 1.06 } : { scale: 1 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
                        isActive
                          ? 'bg-white text-primary shadow-md'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.span>
                    <span
                      className={`font-mono text-2xl font-black tracking-tight transition-colors ${
                        isActive ? 'text-white/55' : 'text-slate-400/80'
                      }`}
                    >
                      0{idx + 1}
                    </span>
                  </div>

                  <h3
                    className={`mt-4 text-base font-extrabold transition-colors ${
                      isActive ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`mt-1.5 text-sm leading-relaxed transition-colors ${
                      isActive ? 'text-teal-50/90' : 'text-slate-600'
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>

                {/* Pill tags phía dưới thẻ giống mẫu */}
                <div className="mt-4 flex flex-wrap gap-1.5 pt-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${
                        isActive
                          ? 'bg-white/12 text-white/95'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Điều hướng chấm nằm giữa 2 nút trượt qua lại trên mobile */}
        <div className="mt-4 flex items-center justify-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => handleSelectCard(activeIdx - 1)}
            aria-label="Phân hệ trước"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-2xs transition-colors hover:border-primary hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1.5">
            {PLATFORM_CAPABILITIES.map((item, idx) => {
              const isDotActive = idx === activeIdx;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => handleSelectCard(idx)}
                  aria-label={`Xem ${item.title}`}
                  className={`h-2 cursor-pointer rounded-full transition-all duration-300 ${
                    isDotActive ? 'w-6 bg-primary' : 'w-2 bg-slate-300 hover:bg-primary/50'
                  }`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleSelectCard(activeIdx + 1)}
            aria-label="Phân hệ tiếp theo"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-2xs transition-colors hover:border-primary hover:text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
