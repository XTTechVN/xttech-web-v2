'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, FileSpreadsheet, Monitor, Smartphone, Sparkles } from 'lucide-react';
import { HERO_HIGHLIGHTS } from './hero.constants';
import { HeroAdviseCadSection } from './hero-advise-cad-section';
import { HeroConsultationSection } from './hero-consultation-section';
import { HeroDashboardMockup } from './hero-dashboard-mockup';
import { HeroFeaturedArticlesSection } from './hero-featured-articles-section';
import { HeroStoryPillarsSection } from './hero-story-pillars';
import { HeroRegisterInlineForm, markRegisterInteracted } from './hero-register-inline-form';

export const Hero = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  return (
    <div className="relative overflow-hidden bg-white font-sans text-gray-900 selection:bg-primary/10 selection:text-primary">
      {/* ===================== HERO TOP SECTION ===================== */}
      <section
        id="about"
        className="relative scroll-mt-20 overflow-hidden bg-linear-to-br from-hero-bg-from via-primary to-hero-bg-to pt-10 pb-12 text-white lg:pt-14 lg:pb-16"
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
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10 lg:min-h-[540px]">
            {/* CỘT TRÁI TRÊN DESKTOP: Chứa Form Đăng ký & Khối Giới thiệu trượt ngang */}
            <div className="lg:col-span-6 relative">
              {/* FORM ĐĂNG KÝ: Xuất hiện bên trái với hiệu ứng slide & fade khi nhấn 'Đăng ký ngay' */}
              <div
                className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isRegisterMode
                    ? 'opacity-100 translate-x-0 pointer-events-auto relative z-20 block'
                    : 'opacity-0 -translate-x-12 pointer-events-none hidden lg:block lg:absolute lg:top-0 lg:left-0 lg:w-full lg:z-0'
                }`}
              >
                <HeroRegisterInlineForm
                  onBack={() => {
                    markRegisterInteracted();
                    setIsRegisterMode(false);
                  }}
                />
              </div>

              {/* KHỐI NỘI DUNG GIỚI THIỆU: Luôn xuất phát từ top-0 và trượt ngang sang phải, không bị tụt xuống */}
              <div
                className={`space-y-5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isRegisterMode
                    ? 'hidden lg:block lg:absolute lg:top-0 lg:left-0 lg:w-full lg:translate-x-[calc(100%+2.5rem)] lg:opacity-100 lg:z-20'
                    : 'block relative z-10 lg:translate-x-0 opacity-100'
                }`}
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-hero-accent/30 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-hero-accent backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-hero-accent" />
                  <span>XTTECH </span>
                </div>

                {/* Tiêu đề chính */}
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

                {/* Các nút hành động */}
                <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
                  {isRegisterMode ? (
                    <button
                      type="button"
                      onClick={() => {
                        markRegisterInteracted();
                        setIsRegisterMode(false);
                      }}
                      className="group inline-flex items-center justify-center gap-2 rounded-lg bg-white/15 hover:bg-white/25 border border-white/30 px-5 py-3.5 text-sm font-bold text-white shadow-lg transition-all cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                      <span>Quay lại trang chính</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          markRegisterInteracted();
                          setIsRegisterMode(true);
                        }}
                        className="group inline-flex items-center justify-center gap-2 rounded-lg bg-hero-accent px-6 py-3.5 text-sm font-bold text-hero-ink shadow-lg shadow-black/20 transition-all hover:bg-hero-accent-hover hover:shadow-xl cursor-pointer"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>Đăng ký ngay</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>

                      <Link
                        href="/pricing"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-xs transition-all hover:border-white hover:bg-white hover:text-primary hover:shadow-lg"
                      >
                        <span>Xem bảng giá dịch vụ</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* CỘT PHẢI TRÊN DESKTOP: MOCKUP DASHBOARD (Ẩn hoàn toàn trên mobile, chỉ hiển thị từ màn hình lớn lg) */}
            <div
              className={`hidden lg:block lg:col-span-6 transition-all duration-500 ease-in-out ${
                isRegisterMode
                  ? 'opacity-0 translate-x-12 scale-95 pointer-events-none'
                  : 'opacity-100 translate-x-0 scale-100 pointer-events-auto'
              }`}
            >
              <HeroDashboardMockup />
            </div>
          </div>
        </div>
      </section>

      <HeroAdviseCadSection />
      <HeroStoryPillarsSection />
      <HeroFeaturedArticlesSection />
      <HeroConsultationSection />
    </div>
  );
};

export default Hero;
