'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Be_Vietnam_Pro } from 'next/font/google';
import { ArrowLeft, ArrowRight, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { HeroRegisterInlineForm } from '@/app/(public)/_components';
import { ECOSYSTEM_MODULES } from './introduce.constants';

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['600'],
  subsets: ['vietnamese', 'latin'],
  display: 'swap',
});

interface SloganWord {
  text: string;
  accent?: boolean;
}

const SLOGAN_LINES: SloganWord[][] = [
  [
    { text: 'Kiến' },
    { text: 'tạo' },
    { text: 'giá', accent: true },
    { text: 'trị,', accent: true },
  ],
  [
    { text: 'chuyển' },
    { text: 'hóa' },
    { text: 'tương', accent: true },
    { text: 'lai', accent: true },
  ],
];

export function IntroduceHeroSection() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  let charGlobalIdx = 0;

  return (
    <section className="relative flex min-h-[calc(100vh-76px)] items-center justify-center overflow-hidden bg-white py-16 sm:py-24">
      {/* Nền Dark Teal Gradient mượt mà khi trượt sang chế độ form đăng ký */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isRegisterMode ? 'opacity-100' : 'opacity-0'
        } bg-linear-to-br from-[#072b28] via-[#094843] to-[#0d1e2e]`}
      >
        {/* Lưới kỹ thuật tinh tế */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        {/* Quầng sáng phát quang công nghệ (Glow orbs) */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-300/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-80 w-80 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <style>{`
        @keyframes xttechLetterRun {
          0% {
            opacity: 0;
            transform: translate3d(0, 14px, 0) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes xttechLogoEnter {
          0% {
            opacity: 0;
            transform: translate3d(0, 18px, 0) scale(0.92);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes xttechHeroReveal {
          0% {
            opacity: 0;
            transform: translate3d(0, 14px, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .xttech-logo-enter {
          will-change: transform, opacity;
          animation: xttechLogoEnter 0.65s cubic-bezier(.16, 1, .3, 1) 0.05s both;
        }

        .xttech-hero-char {
          display: inline-block;
          will-change: transform, opacity;
          animation: xttechLetterRun 0.48s cubic-bezier(.16, 1, .3, 1) var(--d) both;
        }

        .xttech-hero-reveal {
          will-change: transform, opacity;
          animation: xttechHeroReveal 0.6s cubic-bezier(.16, 1, .3, 1) 1.15s both;
        }

        @media (prefers-reduced-motion: reduce) {
          .xttech-logo-enter,
          .xttech-hero-char,
          .xttech-hero-reveal {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* CHẾ ĐỘ ĐĂNG KÝ: Form trượt từ trái sang phải (cột trái) + Giới thiệu nhanh (cột phải) */}
          <div
            className={`grid grid-cols-1 items-center gap-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:grid-cols-12 lg:gap-10 ${
              isRegisterMode
                ? 'pointer-events-auto relative z-20'
                : 'pointer-events-none absolute inset-x-0 top-0 z-0 opacity-0'
            }`}
          >
            {/* Cột trái: Form đăng ký trượt từ trái sang */}
            <div
              className={`lg:col-span-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isRegisterMode ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'
              }`}
            >
              <HeroRegisterInlineForm
                isOpen={isRegisterMode}
                onBack={() => setIsRegisterMode(false)}
              />
            </div>

            {/* Cột phải: Nội dung tóm tắt hệ sinh thái */}
            <div
              className={`hidden space-y-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:col-span-6 lg:block ${
                isRegisterMode ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
              }`}
            >
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1 text-xs font-bold text-emerald-300 backdrop-blur-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  HỆ SINH THÁI GIẢI PHÁP XTTECH
                </span>
                <h2 className="text-3xl font-black tracking-tight text-white uppercase xl:text-4xl xl:leading-[1.18]">
                  Phần mềm quản trị sản xuất cho{' '}
                  <span className="text-emerald-400">Xưởng Nhôm Kính & Nhà Thầu</span>
                </h2>
                <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
                  <strong className="text-white">XTTECH</strong> đồng bộ toàn bộ quy trình từ khảo sát ô chờ, thiết kế cửa CAD 2D/3D, bóc tách vật tư và xuất thẻ cắt A4 đến quản lý kho, chấm công tại công trình và báo cáo lãi/lỗ trên một hệ thống duy nhất.
                </p>
              </div>

              <ul className="space-y-3.5 border-t border-white/15 pt-5 text-sm leading-relaxed text-slate-200">
                {ECOSYSTEM_MODULES.map((mod) => (
                  <li key={mod.code} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    <span>
                      <strong className="font-bold text-white">{mod.code} — {mod.name}:</strong>{' '}
                      {mod.desc}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Link
                  href="/pricing"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40"
                >
                  <span>Xem bảng giá chi tiết</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3.5 text-sm font-bold text-white backdrop-blur-xs transition-all hover:bg-white/20 hover:border-white/50"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <span>Quay lại giới thiệu</span>
                </button>
              </div>
            </div>
          </div>

          {/* NỘI DUNG HERO BAN ĐẦU: Trượt sang phải khi mở form */}
          <div
            className={`mx-auto max-w-5xl text-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isRegisterMode
                ? 'pointer-events-none absolute top-0 left-1/2 z-0 w-full -translate-x-1/2 translate-x-12 opacity-0'
                : 'pointer-events-auto relative z-10 translate-x-0 opacity-100'
            }`}
          >
            {/* Logo XTTECH lớn (~2/3 cỡ chữ slogan), chạy ngay khi vừa vào trang */}
            <div className="xttech-logo-enter inline-flex items-center justify-center gap-3 sm:gap-4">
              <img
                src="/image-xttech/logo-xttech.svg"
                alt="XTTECH Logo"
                className="object-contain"
                style={{
                  width: 'clamp(28px, 4vw, 54px)',
                  height: 'clamp(28px, 4vw, 54px)',
                }}
              />
              <span
                className={`${beVietnamPro.className} font-semibold tracking-tight text-primary`}
                style={{
                  fontSize: 'clamp(24px, 3.6vw, 50px)',
                  lineHeight: 1.1,
                }}
              >
                XTTECH
              </span>
            </div>

            {/* Slogan chạy mượt từng chữ cái, giữ nguyên dấu và từ tiếng Việt */}
            <h1
              aria-label="Kiến tạo giá trị, chuyển hóa tương lai"
              className={`${beVietnamPro.className} mt-5 font-semibold tracking-[-0.02em]`}
              style={{
                fontSize: 'clamp(34px, 5.4vw, 76px)',
                lineHeight: 1.22,
              }}
            >
              {SLOGAN_LINES.map((line, lineIdx) => (
                <span
                  key={lineIdx}
                  aria-hidden="true"
                  className="flex flex-wrap items-center justify-center gap-x-[0.26em]"
                >
                  {line.map((word, wordIdx) => (
                    <span
                      key={`${lineIdx}-${wordIdx}`}
                      className="inline-flex whitespace-nowrap"
                      style={{ color: word.accent ? '#0b6b63' : '#0f1b2d' }}
                    >
                      {Array.from(word.text).map((char, cIdx) => {
                        const idx = charGlobalIdx++;

                        return (
                          <span
                            key={`${idx}-${cIdx}`}
                            aria-hidden="true"
                            className="xttech-hero-char"
                            style={
                              {
                                '--d': `${(0.22 + idx * 0.028).toFixed(3)}s`,
                              } as React.CSSProperties
                            }
                          >
                            {char}
                          </span>
                        );
                      })}
                    </span>
                  ))}
                </span>
              ))}
            </h1>

            {/* 2 nút CTA */}
            <div className="xttech-hero-reveal mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary via-teal-600 to-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:brightness-105 hover:shadow-xl hover:shadow-primary/30"
              >
                <FileSpreadsheet className="h-4 w-4 shrink-0" />
                <span>Đăng ký sử dụng miễn phí</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/90 px-6 py-3.5 text-sm font-bold text-slate-800 shadow-2xs backdrop-blur-xs transition-colors hover:border-primary/50 hover:bg-slate-50 hover:text-primary"
              >
                Xem bảng giá dịch vụ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
