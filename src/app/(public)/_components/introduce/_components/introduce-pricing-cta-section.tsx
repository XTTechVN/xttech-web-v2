'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, User } from 'lucide-react';
import { DEVELOPER_TEAM_MEMBERS } from './introduce.constants';

interface IntroducePricingCtaSectionProps {
  onOpenRegister: () => void;
}

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function IntroducePricingCtaSection({ onOpenRegister }: IntroducePricingCtaSectionProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % DEVELOPER_TEAM_MEMBERS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <section className="bg-slate-50/70 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            Đội ngũ phát triển
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl">
            Những người <span className="text-primary">phát triển XTTECH</span>
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Đội ngũ kỹ sư phần mềm và chuyên gia quy trình ngành nhôm kính – xây dựng đồng hành trực tiếp cùng xưởng.
          </p>
        </motion.div>

        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {DEVELOPER_TEAM_MEMBERS.map((member, idx) => {
            const isActive = idx === activeIdx;

            return (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                animate={isActive ? { y: -4 } : { y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.06, ease: EASE_OUT }}
                whileHover={{ y: -5 }}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                  isActive
                    ? 'border-primary/40 shadow-lg shadow-primary/10'
                    : 'border-slate-200/90 shadow-xs hover:border-primary/35 hover:shadow-md'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="teamActiveBar"
                    transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                    className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1 bg-linear-to-r from-primary via-hero-accent to-primary"
                  />
                )}

                {/* Khung ảnh trống chờ cập nhật */}
                <div className="flex aspect-4/3 w-full items-center justify-center border-b border-slate-100 bg-slate-100/80 text-slate-400">
                  <div className="flex flex-col items-center gap-1.5">
                    <motion.span
                      animate={isActive ? { scale: 1.08 } : { scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className={`flex h-12 w-12 items-center justify-center rounded-full shadow-xs transition-colors duration-300 ${
                        isActive ? 'bg-primary text-white' : 'bg-white text-slate-400'
                      }`}
                    >
                      <User className="h-6 w-6" />
                    </motion.span>
                    <span className="text-[11px] font-medium text-slate-400">Ảnh đại diện</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className={`text-base font-extrabold transition-colors ${isActive ? 'text-primary' : 'text-slate-900'}`}>
                    {member.name}
                  </h3>
                  <p className="mt-0.5 text-xs font-bold text-primary/85">{member.role}</p>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Banner CTA Đăng ký tư vấn / Demo */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.48, ease: EASE_OUT }}
          className="relative mt-12 overflow-hidden rounded-2xl bg-linear-to-r from-hero-bg-from via-primary to-hero-bg-to p-6 text-white shadow-lg sm:p-10"
        >
          <motion.div
            aria-hidden="true"
            animate={{ x: ['-15%', '15%', '-15%'], opacity: [0.25, 0.5, 0.25] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -top-20 right-10 h-60 w-60 rounded-full bg-hero-accent/20 blur-3xl"
          />

          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h3 className="text-xl font-black uppercase sm:text-2xl">
                Sẵn sàng số hóa xưởng nhôm kính & công trình của bạn?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-teal-50/90">
                Đăng ký nhận tài khoản dùng thử G0 hoặc đặt lịch chuyên viên XTTECH hướng dẫn trực tiếp 1-1 theo đúng hệ nhôm và quy trình xưởng của bạn.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={onOpenRegister}
                className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-hero-accent px-6 py-3.5 text-sm font-bold text-hero-ink shadow-md transition-colors hover:bg-hero-accent-hover"
              >
                <span>Đăng ký nhận phần mềm</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-primary"
              >
                Xem bảng giá
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
