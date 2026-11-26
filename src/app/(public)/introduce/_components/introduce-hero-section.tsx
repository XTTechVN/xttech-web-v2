'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { RegisterInlineForm } from '@/components';
import { ECOSYSTEM_MODULES, SLOGAN_LINES } from '../_constants/introduce.constants';

export function IntroduceHeroSection() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);

  let charGlobalIdx = 0;

  const handleOpenRegister = () => {
    setFormResetKey((prev) => prev + 1);
    setIsRegisterMode(true);
  };

  const handleCloseRegister = () => {
    setIsRegisterMode(false);
    setFormResetKey((prev) => prev + 1);
  };

  return (
    <section className="relative flex min-h-[540px] lg:min-h-[580px] items-center justify-center overflow-hidden bg-white py-14 sm:py-18 lg:py-20 xl:py-24">
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isRegisterMode ? 'opacity-100' : 'opacity-0'
        } bg-linear-to-br from-[#072b28] via-[#094843] to-[#0d1e2e]`}
      >
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-300/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-80 w-80 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div
            className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-12 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isRegisterMode
                ? 'opacity-100 pointer-events-auto relative z-20'
                : 'opacity-0 pointer-events-none absolute inset-0 z-0'
            }`}
          >
            <div
              className={`lg:col-span-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isRegisterMode
                  ? 'opacity-100 translate-x-0 pointer-events-auto relative z-20'
                  : 'opacity-0 translate-x-12 lg:-translate-x-12 pointer-events-none absolute top-0 left-0 w-full z-0'
              }`}
            >
              <RegisterInlineForm
                key={`intro-inline-${formResetKey}`}
                isOpen={isRegisterMode}
                onBack={handleCloseRegister}
              />
            </div>

            <div
              className={`hidden space-y-6 lg:col-span-6 lg:block transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isRegisterMode
                  ? 'opacity-100 translate-x-0 pointer-events-auto relative z-20'
                  : 'opacity-0 translate-x-12 pointer-events-none absolute top-0 right-0 w-full z-0'
              }`}
            >
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1 text-xs font-bold text-emerald-300 backdrop-blur-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  HỆ SINH THÁI GIẢI PHÁP XTTECH
                </span>
                <h2 className="text-3xl font-black tracking-tight text-white uppercase xl:text-4xl xl:leading-[1.18]">
                  Phần mềm quản trị sản xuất cho{' '}
                  <span className="text-emerald-400">Xưởng Nhôm Kính &amp; Nhà Thầu</span>
                </h2>
                <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
                  <strong className="text-white">XTTECH</strong> đồng bộ toàn bộ quy trình từ khảo sát ô chờ, thiết kế
                  cửa CAD 2D/3D, bóc tách vật tư và xuất thẻ cắt A4 đến quản lý kho, chấm công tại công trình và báo
                  cáo lãi/lỗ trên một hệ thống duy nhất.
                </p>
              </div>

              <ul className="space-y-3.5 border-t border-white/15 pt-5 text-sm leading-relaxed text-slate-200">
                {ECOSYSTEM_MODULES.map((mod) => (
                  <li key={mod.code} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    <span>
                      <strong className="font-bold text-white">
                        {mod.code} — {mod.name}:
                      </strong>{' '}
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
                  onClick={handleCloseRegister}
                  className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3.5 text-sm font-bold text-white backdrop-blur-xs transition-all hover:bg-white/20 hover:border-white/50"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <span>Quay lại giới thiệu</span>
                </button>
              </div>
            </div>
          </div>

          <div
            className={`mx-auto max-w-5xl text-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isRegisterMode
                ? 'opacity-0 translate-x-12 pointer-events-none absolute top-1/2 left-0 right-0 -translate-y-1/2 w-full z-0'
                : 'opacity-100 translate-x-0 pointer-events-auto relative z-10'
            }`}
          >
            <div className="xttech-logo-enter inline-flex items-center justify-center gap-3 sm:gap-5 lg:gap-6">
              <img
                src="/image-xttech/logo-xttech.svg"
                alt="XTTECH Logo"
                className="object-contain"
                style={{
                  width: 'clamp(36px, 5.8vw, 84px)',
                  height: 'clamp(36px, 5.8vw, 84px)',
                }}
              />
              <span
                className="font-sans font-semibold tracking-tight text-primary"
                style={{
                  fontSize: 'clamp(28px, 4.8vw, 68px)',
                  lineHeight: 1.1,
                }}
              >
                XTTECH
              </span>
            </div>

            <h1
              aria-label="KIẾN TẠO GIÁ TRỊ CHUYỂN HÓA TƯƠNG LAI"
              className="mt-4 sm:mt-6 font-sans font-semibold tracking-[-0.02em] uppercase"
              style={{
                fontSize: 'clamp(30px, 4.8vw, 68px)',
                lineHeight: 1.22,
              }}
            >
              {SLOGAN_LINES.map((line, lineIdx) => (
                <span
                  key={lineIdx}
                  aria-hidden="true"
                  className="flex flex-wrap items-center justify-center gap-x-[0.24em] sm:gap-x-[0.26em]"
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
                            style={{ '--d': `${(0.28 + idx * 0.055).toFixed(3)}s` } as React.CSSProperties}
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

            <div className="xttech-hero-reveal mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5">
              <button
                type="button"
                onClick={handleOpenRegister}
                className="group inline-flex w-full sm:w-auto max-w-xs sm:max-w-none cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary via-teal-600 to-emerald-500 px-5 py-3 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:brightness-105 hover:shadow-xl hover:shadow-primary/30"
              >
                <FileSpreadsheet className="h-4 w-4 shrink-0" />
                <span>Đăng ký sử dụng miễn phí</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <Link
                href="/pricing"
                className="inline-flex w-full sm:w-auto max-w-xs sm:max-w-none items-center justify-center rounded-xl border border-slate-300 bg-white/90 px-5 py-3 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs backdrop-blur-xs transition-colors hover:border-primary/50 hover:bg-slate-50 hover:text-primary"
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
