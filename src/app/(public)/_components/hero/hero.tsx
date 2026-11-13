'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileSpreadsheet, Sparkles } from 'lucide-react';
import { HERO_HIGHLIGHTS, STATS } from './hero.constants';
import { HeroAdviseCadSection } from './hero-advise-cad-section';
import { HeroConsultationSection } from './hero-consultation-section';
import { HeroDashboardMockup } from './hero-dashboard-mockup';
import { HeroFeaturedArticlesSection } from './hero-featured-articles-section';
import { HeroStoryPillarsSection } from './hero-story-pillars';
import { HeroDemoModalLazy } from './modals';

export const Hero = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="relative overflow-hidden bg-white font-sans text-gray-900 selection:bg-primary/10 selection:text-primary">
      {/* ===================== HERO TOP SECTION ===================== */}
      <section
        id="about"
        className="relative scroll-mt-20 overflow-hidden bg-linear-to-br from-hero-bg-from via-primary to-hero-bg-to pt-10 pb-14 text-white lg:pt-14 lg:pb-20"
      >
        {/* Họa tiết lưới kỹ thuật & quầng sáng chủ đạo */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-hero-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-96 w-96 rounded-full bg-teal-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
            {/* CỘT TRÁI: NỘI DUNG GIỚI THIỆU & 2 NÚT HÀNH ĐỘNG */}
            <div className="lg:col-span-6 space-y-5">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-hero-accent/30 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-hero-accent backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-hero-accent" />
                <span>XTTECH </span>
              </div>

              {/* Tiêu đề chính (lấy cảm hứng từ bố cục ảnh 3, tông màu XTTech) */}
              <div className="space-y-2">
                <h1 className="text-2xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-[40px] lg:leading-[1.18]">
                  Phần mềm quản lý <span className="text-hero-accent">sản xuất nhôm kính & thi công</span> công trình
                </h1>
                <p className="text-sm font-semibold tracking-wide text-hero-accent sm:text-base">
                  XTTech – Giải pháp số hóa toàn diện cho Xưởng Nhôm Kính & Nhà Thầu
                </p>
              </div>

              {/* Danh sách 4 lợi điểm cốt lõi có dấu tích */}
              <ul className="space-y-3 text-sm leading-relaxed text-teal-50/95">
                {HERO_HIGHLIGHTS.map((item) => (
                  <li key={item.bold} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-hero-accent" />
                    <span>
                      <strong className="font-bold text-white">{item.bold}</strong> {item.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* 2 Nút hành động: Mở Modal Form Đăng ký & Xem bảng giá */}
              <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setIsDemoModalOpen(true)}
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-hero-accent px-6 py-3.5 text-sm font-bold text-hero-ink shadow-lg shadow-black/20 transition-all hover:bg-hero-accent-hover hover:shadow-xl cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Đăng ký trải nghiệm Demo</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-xs transition-all hover:border-hero-accent hover:bg-white/15 hover:text-hero-accent"
                >
                  <span>Xem bảng giá dịch vụ</span>
                </Link>
              </div>
            </div>

            {/* CỘT PHẢI: MOCKUP DASHBOARD MÁY TÍNH (ẢNH 4) & MOBILE (ẢNH 5) */}
            <div className="lg:col-span-6">
              <HeroDashboardMockup />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-12 grid grid-cols-2 gap-4 rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur-md sm:p-6 lg:mt-14 lg:grid-cols-4 lg:gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <span className="text-2xl font-black tracking-tight text-hero-accent sm:text-3xl lg:text-4xl">{stat.value}</span>
                <span className="mt-1.5 text-xs font-medium text-teal-50/90 sm:text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HeroAdviseCadSection />
      <HeroStoryPillarsSection />
      <HeroFeaturedArticlesSection />
      <HeroConsultationSection />

      {/* Modal Form Đăng ký trải nghiệm Demo */}
      <HeroDemoModalLazy isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </div>
  );
};

export default Hero;
