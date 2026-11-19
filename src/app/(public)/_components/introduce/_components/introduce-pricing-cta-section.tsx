
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Plus } from 'lucide-react';
import { DEVELOPER_TEAM_MEMBERS, INTRODUCE_EASE_OUT } from './introduce.constants';

interface IntroducePricingCtaSectionProps {
  onOpenRegister: () => void;
}

export function IntroducePricingCtaSection({ onOpenRegister }: IntroducePricingCtaSectionProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header 2 bên: Trái trượt từ trái, Phải trượt từ phải */}
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25, margin: '0px 0px -80px 0px' }}
            transition={{ duration: 0.48, ease: INTRODUCE_EASE_OUT }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-slate-50 px-3 py-1 text-[11px] font-extrabold tracking-wider text-primary uppercase shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Đội ngũ phát triển
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Gặp những người <span className="text-primary">xây nên XMS</span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25, margin: '0px 0px -80px 0px' }}
            transition={{ duration: 0.48, delay: 0.08, ease: INTRODUCE_EASE_OUT }}
            className="max-w-sm text-sm leading-relaxed text-slate-600"
          >
            Đội ngũ kỹ sư và thiết kế đồng hành trực tiếp cùng xưởng nhôm kính. Rê chuột vào thành viên để xem chi tiết.
          </motion.p>
        </div>

        {/* Desktop: Accordion mở rộng ngang mượt mà */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1, ease: INTRODUCE_EASE_OUT }}
          className="mt-10 hidden h-[420px] gap-4 lg:flex xl:h-[440px]"
        >
          {DEVELOPER_TEAM_MEMBERS.map((member, idx) => {
            const isActive = idx === activeIdx;

            return (
              <motion.button
                key={member.name}
                type="button"
                onMouseEnter={() => setActiveIdx(idx)}
                onFocus={() => setActiveIdx(idx)}
                animate={{ flexGrow: isActive ? 2.1 : 0.9 }}
                transition={{ duration: 0.55, ease: INTRODUCE_EASE_OUT }}
                style={{ flexBasis: 0 }}
                className="group relative flex h-full min-w-0 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl text-left shadow-md transition-shadow duration-300 will-change-[flex-grow] hover:shadow-xl focus:outline-none"
              >
                {/* Ảnh nền sáng rõ + căn object-top để ảnh chân dung vuông không bị cắt phần trên */}
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className={`absolute inset-0 h-full w-full object-cover object-top transition-[transform,filter] duration-700 ease-out ${
                    isActive ? 'scale-100 brightness-105' : 'scale-105 brightness-95'
                  }`}
                />
                <div
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    isActive
                      ? 'bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent'
                      : 'bg-linear-to-t from-[#03343b]/75 via-[#045863]/25 to-transparent'
                  }`}
                />

                {/* Hàng trên: Số thứ tự + nút (+) khi thu gọn */}
                <div className="relative z-10 flex w-full items-center justify-between p-5">
                  <span className="font-mono text-xs font-extrabold tracking-wider text-white/90">0{idx + 1}</span>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-xs transition-all duration-300 ease-out ${
                      isActive ? 'pointer-events-none scale-75 opacity-0' : 'scale-100 opacity-100 group-hover:rotate-90 group-hover:bg-white/25'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </div>

                {/* Hàng dưới: Nội dung chi tiết khi mở rộng hoặc tên vai trò khi thu gọn */}
                <div className="relative z-10 w-full p-5 sm:p-6">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {isActive ? (
                      <motion.div
                        key="expanded"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.3, ease: INTRODUCE_EASE_OUT }}
                        className="max-w-md space-y-2.5"
                      >
                        <span className="inline-flex items-center rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-bold text-hero-accent backdrop-blur-xs">
                          {member.role}
                        </span>
                        <h3 className="text-2xl font-black tracking-tight text-white">{member.name}</h3>
                        <p className="text-sm leading-relaxed text-teal-50/90">{member.bio}</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="collapsed"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.25, ease: INTRODUCE_EASE_OUT }}
                        className="space-y-1"
                      >
                        <p className="truncate text-lg font-black tracking-tight text-white">
                          {member.name.trim().split(/\s+/).pop()}
                        </p>
                        <p className="line-clamp-2 min-h-[2rem] text-xs font-semibold leading-snug text-hero-accent">
                          {member.role}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Mobile / Tablet: Accordion dọc nền sáng gọn đẹp */}
        <div className="mt-8 space-y-3 lg:hidden">
          {DEVELOPER_TEAM_MEMBERS.map((member, idx) => {
            const isActive = idx === activeIdx;

            return (
              <div
                key={member.name}
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? 'border-primary/40 bg-linear-to-br from-teal-50/75 via-white to-sky-50/60 shadow-md shadow-primary/10'
                    : 'border-slate-200/90 bg-slate-50/70 shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className={`h-10 w-10 shrink-0 rounded-full object-cover object-top ring-2 transition-all ${
                        isActive ? 'ring-primary' : 'ring-white'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-extrabold text-primary">0{idx + 1}</span>
                        <p className={`truncate text-sm font-extrabold ${isActive ? 'text-primary' : 'text-slate-900'}`}>
                          {member.name}
                        </p>
                      </div>
                      <p className="truncate text-xs font-medium text-slate-500">{member.role}</p>
                    </div>
                  </div>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      isActive
                        ? 'pointer-events-none scale-75 opacity-0'
                        : 'scale-100 border-slate-200 bg-white text-slate-500 opacity-100'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: INTRODUCE_EASE_OUT }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-3.5 border-t border-primary/10 px-4 py-3.5">
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="h-24 w-24 shrink-0 rounded-xl object-cover object-top shadow-xs sm:h-28 sm:w-28"
                        />
                        <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">{member.bio}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Banner CTA Đăng ký tư vấn / Demo */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.48, ease: INTRODUCE_EASE_OUT }}
          className="relative mt-12 overflow-hidden rounded-2xl bg-linear-to-r from-hero-bg-from via-primary to-hero-bg-to p-6 text-white shadow-lg sm:p-10"
        >
          <motion.div
            aria-hidden="true"
            animate={{ x: ['-15%', '15%', '-15%'], opacity: [0.25, 0.5, 0.25] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -top-20 right-10 h-60 w-60 rounded-full bg-hero-accent/20 blur-3xl"
          />

          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25, margin: '0px 0px -80px 0px' }}
              transition={{ duration: 0.48, ease: INTRODUCE_EASE_OUT }}
              className="max-w-2xl"
            >
              <h3 className="text-xl font-black uppercase sm:text-2xl">Sẵn sàng số hóa xưởng nhôm kính & công trình của bạn?</h3>
              <p className="mt-2 text-sm leading-relaxed text-teal-50/90">
                Đăng ký dùng thử G0 hoặc đặt lịch chuyên viên XTTECH hướng dẫn 1-1 theo đúng hệ nhôm của xưởng.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25, margin: '0px 0px -80px 0px' }}
              transition={{ duration: 0.48, delay: 0.08, ease: INTRODUCE_EASE_OUT }}
              className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
            >
              <button
                type="button"
                onClick={onOpenRegister}
                className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-hero-accent px-6 py-3.5 text-sm font-bold text-hero-ink shadow-md transition-colors hover:bg-hero-accent-hover"
              >
                <span>Đăng ký sử dụng miễn phí</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-primary"
              >
                Xem bảng giá
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
