'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, FileSpreadsheet } from 'lucide-react';
import { ECOSYSTEM_MODULES, INTRODUCE_QUICK_STATS } from '@/app/(public)/_components/introduce/_components/introduce.constants';
import { INTRODUCE_EASE_OUT, useSpotlightCycle } from '@/app/(public)/_components/introduce/_components/use-spotlight-cycle';

interface IntroduceHeroSectionProps {
  onOpenRegister: () => void;
}

export function IntroduceHeroSection({ onOpenRegister }: IntroduceHeroSectionProps) {
  const { activeIdx: activeModIdx, setActiveIdx: setActiveModIdx, pauseProps } = useSpotlightCycle(
    ECOSYSTEM_MODULES.length,
    3200,
  );
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-hero-bg-from via-primary to-hero-bg-to pt-12 pb-10 text-white sm:pt-16 sm:pb-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.18) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />
      <motion.div
        aria-hidden="true"
        animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-hero-accent/15 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        animate={{ scale: [1.05, 0.96, 1.05], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-teal-300/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: INTRODUCE_EASE_OUT }}
            className="text-3xl font-black tracking-tight text-white uppercase sm:text-4xl lg:text-5xl lg:leading-[1.16]"
          >
            Phần mềm quản trị sản xuất cho{' '}
            <span className="text-hero-accent">Xưởng Nhôm Kính & Nhà Thầu</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: INTRODUCE_EASE_OUT }}
            className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-teal-50/95 sm:text-base"
          >
            <strong>XTTECH</strong> đồng bộ toàn bộ quy trình từ khảo sát ô chờ, thiết kế cửa CAD 2D/3D, bóc tách vật tư và xuất thẻ cắt A4 đến quản lý kho, chấm công tại công trình và báo cáo lãi/lỗ trên một hệ thống duy nhất.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24, ease: INTRODUCE_EASE_OUT }}
            className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <button
              type="button"
              onClick={onOpenRegister}
              className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-hero-accent px-6 py-3.5 text-sm font-bold text-hero-ink shadow-lg shadow-black/20 transition-all hover:bg-hero-accent-hover sm:w-auto"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Đăng ký dùng thử miễn phí</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <Link
              href="/pricing"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-xs transition-all hover:border-white hover:bg-white hover:text-primary sm:w-auto"
            >
              <span>Xem bảng giá dịch vụ</span>
            </Link>
          </motion.div>
        </div>

        {/* 3 phân hệ cốt lõi */}
        <div {...pauseProps} className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {ECOSYSTEM_MODULES.map((mod, idx) => {
            const Icon = mod.icon;
            const isActive = idx === activeModIdx;
            return (
              <motion.div
                key={mod.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: isActive ? -4 : 0 }}
                transition={{ duration: 0.35, ease: INTRODUCE_EASE_OUT }}
                whileHover={{ y: -5 }}
                onMouseEnter={() => setActiveModIdx(idx)}
                className={`group relative overflow-hidden rounded-lg border bg-white/95 p-4 text-slate-900 transition-shadow duration-300 ${
                  isActive ? 'border-hero-accent shadow-2xl' : 'border-white/70 shadow-xl shadow-black/15 hover:shadow-2xl'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="heroModuleActiveBar"
                    transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                    className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-hero-accent to-primary"
                  />
                )}
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm transition-transform duration-200 group-hover:scale-105 group-hover:rotate-3">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-primary uppercase">
                      {mod.code}
                    </span>
                    <h2 className="mt-0.5 text-sm font-extrabold text-slate-900 sm:text-base">{mod.name}</h2>
                  </div>
                </div>
                <p className="mt-2.5 border-t border-slate-100 pt-2.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {mod.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* 4 điểm mạnh vận hành */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {INTRODUCE_QUICK_STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.value}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: 0.32 + idx * 0.06, ease: INTRODUCE_EASE_OUT }}
                whileHover={{ y: -2, scale: 1.01 }}
                className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm transition-colors hover:border-hero-accent/40 hover:bg-white/15"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-hero-accent text-hero-ink shadow-xs">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-extrabold text-white sm:text-sm">{stat.value}</p>
                  <p className="truncate text-[11px] text-teal-100/85">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
