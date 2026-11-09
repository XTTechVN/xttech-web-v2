'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components';
import { STATS } from './hero.constants';
import { HeroAdviseCadSection } from './hero-advise-cad-section';
import { HeroFloatingDock } from './hero-floating-dock';
import { HeroPlatformBanner } from './hero-platform-banner';
import { HeroStoryPillarsSection } from './hero-story-pillars-section';

export const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-white font-sans text-gray-900 selection:bg-primary/10 selection:text-primary">
      <HeroFloatingDock />

      {/* ===================== HERO TOP SECTION ===================== */}
      <section id="about" className="relative scroll-mt-20 overflow-hidden pt-8 pb-14 lg:pt-14 lg:pb-20">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-white to-white" />
        <div className="pointer-events-none absolute top-12 left-1/2 -z-10 h-72 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm sm:text-sm">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <span>Về chúng tôi — Hệ sinh thái XTTech</span>
            </div>

            {/* Tiêu đề chính */}
            <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900 sm:text-6xl lg:leading-[1.15]">
              Tiên phong số hóa <br />
              <span className="text-primary">ngành nhôm & xây dựng</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
              XTTech kết nối liền mạch từ khảo sát ô chờ, bóc tách kỹ thuật, dự toán báo giá đến quản lý phân xưởng và nghiệm thu công trình.
            </p>

            {/* Nút hành động */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <Link href="/signin" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-8 text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl sm:w-auto"
                >
                  <span>Khám phá giải pháp</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full border-gray-300 bg-white px-8 text-gray-800 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary sm:w-auto"
                >
                  Xem bảng giá dịch vụ
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-12 grid grid-cols-2 gap-4 rounded-3xl border border-primary/10 bg-white/80 p-6 shadow-xl shadow-primary/5 backdrop-blur-sm sm:p-8 lg:grid-cols-4 lg:gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <span className="text-3xl font-black tracking-tight text-primary sm:text-4xl lg:text-5xl">{stat.value}</span>
                <span className="mt-2 text-xs font-medium text-gray-600 sm:text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HeroAdviseCadSection />
      <HeroPlatformBanner />
      <HeroStoryPillarsSection />
    </div>
  );
};

export default Hero;

