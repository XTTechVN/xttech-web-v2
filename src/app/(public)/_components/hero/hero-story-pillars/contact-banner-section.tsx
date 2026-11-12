'use client';

import React from 'react';
import type { HeroSectionDemoProps } from './hero-story-pillars.constants';
import { PhoneCall } from 'lucide-react';
import { Button } from '@/components';
import { CONTACT_INFO } from '@/config/contact';
import { HERO_ACCENT_GLOW } from '../hero.constants';

export function ContactBannerSection({ onOpenDemo }: HeroSectionDemoProps) {
  return (
    <section className="pb-16 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-white shadow-2xl sm:px-12 lg:px-16 lg:py-16">
          <div
            className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full opacity-25 blur-3xl"
            style={{ background: HERO_ACCENT_GLOW }}
          />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center justify-between gap-8 text-center lg:flex-row lg:text-left">
            <div className="max-w-2xl space-y-4">
              <div
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase backdrop-blur-sm"
                style={{ color: 'var(--hero-accent-raw)' }}
              >
                <PhoneCall className="h-3.5 w-3.5" />
                Sẵn sàng chuyển đổi số
              </div>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl lg:leading-tight">
                Bắt đầu hành trình <br className="hidden sm:inline" />
                nâng tầm doanh nghiệp ngay hôm nay
              </h2>
              <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                Đội ngũ chuyên gia của XTTech luôn sẵn sàng tư vấn giải pháp, khảo sát thực tế và demo trực tiếp các tính năng phù hợp nhất với quy mô của bạn.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Button
                size="lg"
                onClick={() => onOpenDemo()}
                className="w-full rounded-full font-bold text-primary shadow-lg transition-transform hover:scale-105 sm:w-auto cursor-pointer"
                style={{ backgroundColor: 'var(--hero-accent-raw)' }}
              >
                Đăng ký dùng thử ngay
              </Button>
              <a href={`tel:${CONTACT_INFO.phone}`}>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 sm:w-auto"
                >
                  Hotline: {CONTACT_INFO.phoneDisplay}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
