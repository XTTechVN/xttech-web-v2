'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { Modal, RegisterInlineForm } from '@/components';
import useAuthStore from '@/stores/useAuthStore';
import { HERO_HIGHLIGHTS } from './hero.constants';
import { HeroAdviseCadSection } from './hero-advise-cad-section';
import { HeroBrandsSection } from './hero-brands-section';
import { HeroConsultationSection } from './hero-consultation-section';
import { HeroDashboardMockup } from './hero-dashboard-mockup';
import { HeroFeaturedArticlesSection } from './hero-featured-articles-section';
import { HeroStoryPillarsSection } from './hero-story-pillars';

const AUTO_REGISTER_DELAY_MS = 8000;
const HERO_AUTO_MODAL_STORAGE_KEY = 'xttech_hero_auto_register_shown';
const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';

function subscribeDesktopMedia(onChange: () => void): () => void {
  const mql = window.matchMedia(DESKTOP_MEDIA_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

const getDesktopSnapshot = (): boolean => window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
const getServerDesktopSnapshot = (): boolean => false;

export const Hero = () => {
  const isDesktop = useSyncExternalStore(
    subscribeDesktopMedia,
    getDesktopSnapshot,
    getServerDesktopSnapshot,
  );
  const [manualRegisterMode, setManualRegisterMode] = useState<boolean | null>(null);
  const [inlineResetKey, setInlineResetKey] = useState(0);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isRegisterMode = manualRegisterMode ?? isDesktop;
  const isRegisterModeRef = useRef(isRegisterMode);

  useEffect(() => {
    isRegisterModeRef.current = isRegisterMode;
  }, [isRegisterMode]);

  useEffect(() => {
    if (isAuthenticated) return;
    try {
      if (window.sessionStorage.getItem(HERO_AUTO_MODAL_STORAGE_KEY) === '1') {
        return;
      }
    } catch {
      return;
    }

    const timer = window.setTimeout(() => {
      if (isRegisterModeRef.current) return;
      try {
        window.sessionStorage.setItem(HERO_AUTO_MODAL_STORAGE_KEY, '1');
      } catch {
        // Bỏ qua nếu trình duyệt chặn sessionStorage
      }
      setIsAutoModalOpen(true);
    }, AUTO_REGISTER_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [isAuthenticated]);

  const handleCloseInline = () => {
    setManualRegisterMode(false);
    setInlineResetKey((prev) => prev + 1);
  };

  const handleOpenInline = () => {
    setInlineResetKey((prev) => prev + 1);
    setManualRegisterMode(true);
  };

  return (
    <div className="relative overflow-hidden bg-white font-sans text-gray-900 selection:bg-primary/10 selection:text-primary">
      <section
        id="about"
        className="relative scroll-mt-20 overflow-hidden bg-linear-to-br from-hero-bg-from via-primary to-hero-bg-to pt-10 pb-12 text-white lg:pt-14 lg:pb-16"
      >
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
            <div className="lg:col-span-6 relative">
              <div
                className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isRegisterMode
                    ? 'opacity-100 translate-x-0 pointer-events-auto relative z-20'
                    : 'opacity-0 translate-x-12 lg:-translate-x-12 pointer-events-none absolute top-0 left-0 w-full z-0'
                }`}
              >
                <RegisterInlineForm
                  key={`hero-inline-${inlineResetKey}`}
                  isOpen={isRegisterMode}
                  onBack={handleCloseInline}
                />
              </div>

              <div
                className={`space-y-5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isRegisterMode
                    ? 'opacity-0 -translate-x-12 pointer-events-none absolute top-0 left-0 w-full z-0 lg:translate-x-[calc(100%+2.5rem)] lg:opacity-100 lg:pointer-events-auto lg:z-20'
                    : 'relative z-10 translate-x-0 opacity-100 pointer-events-auto'
                }`}
              >
                <div className="space-y-2">
                  <h1 className="text-2xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-[40px] lg:leading-[1.18]">
                    Nền tảng quản trị{' '}
                    <span className="text-hero-accent">
                      xưởng nhôm kính &amp; <span className="whitespace-nowrap">xây dựng công trình</span>
                    </span>
                  </h1>
                  <p className="text-sm font-semibold tracking-wide text-hero-accent sm:text-base">
                    XTTech – Giải pháp số hóa toàn diện cho Xưởng Nhôm Kính &amp; Nhà Thầu
                  </p>
                </div>

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

                <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
                  {isRegisterMode ? (
                    <button
                      type="button"
                      onClick={handleCloseInline}
                      className="group inline-flex items-center justify-center gap-2 rounded-lg bg-white/15 hover:bg-white/25 border border-white/30 px-5 py-3.5 text-sm font-bold text-white shadow-lg transition-all cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                      <span>Quay lại trang chính</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleOpenInline}
                        className="group inline-flex items-center justify-center gap-2 rounded-lg bg-hero-accent px-6 py-3.5 text-sm font-bold text-hero-ink shadow-lg shadow-black/20 transition-all hover:bg-hero-accent-hover hover:shadow-xl cursor-pointer"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>Đăng ký sử dụng miễn phí</span>
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

            <div
              className={`hidden lg:block lg:col-span-6 transition-all duration-500 ease-in-out ${
                isRegisterMode ? 'opacity-0 translate-x-12 scale-95 pointer-events-none' : 'opacity-100 translate-x-0 scale-100 pointer-events-auto'
              }`}
            >
              <HeroDashboardMockup />
            </div>
          </div>
        </div>
      </section>

      <div id="advise-cad" className="scroll-mt-16">
        <HeroAdviseCadSection />
      </div>
      <div id="brands" className="scroll-mt-16">
        <HeroBrandsSection />
      </div>
      <div id="story-pillars" className="scroll-mt-16">
        <HeroStoryPillarsSection />
      </div>
      <div id="featured-articles" className="scroll-mt-16">
        <HeroFeaturedArticlesSection />
      </div>
      <HeroConsultationSection />

      <Modal
        isOpen={isAutoModalOpen}
        onClose={() => setIsAutoModalOpen(false)}
        size="md"
        title="Đăng ký sử dụng XTTECH XMS Fab"
        className="max-w-lg border border-primary/20"
        bodyClassName="p-5 sm:p-6"
      >
        <RegisterInlineForm
          key={`hero-auto-${isAutoModalOpen}`}
          variant="modal"
          onBack={() => setIsAutoModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Hero;
