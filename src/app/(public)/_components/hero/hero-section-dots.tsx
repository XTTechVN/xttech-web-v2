'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';

export interface SectionDotItem {
  id: string;
  label: string;
}

const SECTION_DOTS: SectionDotItem[] = [
  { id: 'about', label: 'Tổng quan XTTech' },
  { id: 'advise-cad', label: 'Bản vẽ 2D & 3D' },
  { id: 'brands', label: 'Hãng nhôm & Phụ kiện' },
  { id: 'story-pillars', label: 'Giải pháp cốt lõi' },
  { id: 'featured-articles', label: 'Tin tức nổi bật' },
  { id: 'consultation', label: 'Đăng ký tư vấn' },
];

export const HeroSectionDots = () => {
  const [activeId, setActiveId] = useState<string>('about');
  const [isOnDarkSurface, setIsOnDarkSurface] = useState<boolean>(true);

  useEffect(() => {
    const elements = SECTION_DOTS.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (elements.length === 0) return;

    const handleScroll = () => {
      const viewportCenter = window.scrollY + window.innerHeight * 0.42;
      const navCenterY = window.scrollY + window.innerHeight * 0.5;

      const aboutEl = document.getElementById('about');
      const contactEl = document.getElementById('contact');
      const overAbout = aboutEl
        ? navCenterY >= aboutEl.offsetTop && navCenterY <= aboutEl.offsetTop + aboutEl.offsetHeight
        : false;
      const overContact = contactEl ? navCenterY >= contactEl.offsetTop : false;
      setIsOnDarkSurface(overAbout || overContact);

      if (window.scrollY < 120) {
        setActiveId('about');
        return;
      }

      let currentId = elements[0].id;
      for (const el of elements) {
        if (el.offsetTop <= viewportCenter) {
          currentId = el.id;
        }
      }
      setActiveId(currentId);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (id: string) => {
    if (id === 'about') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isOnDarkBanner = isOnDarkSurface;

  return (
    <nav
      aria-label="Điều hướng các khối nội dung"
      className={cn(
        'group/nav fixed top-1/2 right-4 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 rounded-2xl transition-all duration-300 lg:flex xl:right-6',
        isOnDarkBanner
          ? 'hover:bg-slate-950/80 hover:px-3.5 hover:py-3 hover:shadow-xl hover:ring-1 hover:ring-white/15 hover:backdrop-blur-md'
          : 'hover:bg-white/92 hover:px-3.5 hover:py-3 hover:shadow-lg hover:ring-1 hover:ring-slate-200/80 hover:backdrop-blur-md',
      )}
    >
      {SECTION_DOTS.map((item, idx) => {
        const isActive = activeId === item.id;
        const num = String(idx + 1).padStart(2, '0');

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleScrollTo(item.id)}
            aria-label={item.label}
            aria-current={isActive ? 'true' : undefined}
            className="group flex cursor-pointer items-center gap-2.5 py-0.5 focus:outline-none"
          >
            {/* Tên khối hiện khi đang active hoặc khi hover vào thanh điều hướng */}
            <span
              className={cn(
                'text-xs font-semibold whitespace-nowrap transition-all duration-300',
                isActive
                  ? isOnDarkBanner
                    ? 'translate-x-0 text-white opacity-100'
                    : 'translate-x-0 text-slate-900 opacity-100'
                  : isOnDarkBanner
                    ? 'translate-x-1 text-white/80 opacity-0 group-hover/nav:translate-x-0 group-hover/nav:opacity-100 group-hover:text-white'
                    : 'translate-x-1 text-slate-600 opacity-0 group-hover/nav:translate-x-0 group-hover/nav:opacity-100 group-hover:text-slate-900',
              )}
            >
              {item.label}
            </span>

            {/* Đường gạch ngang */}
            <span
              className={cn(
                'block rounded-full transition-all duration-300',
                isActive
                  ? isOnDarkBanner
                    ? 'h-[2px] w-7 bg-white'
                    : 'h-[2px] w-7 bg-primary'
                  : isOnDarkBanner
                    ? 'h-[1.5px] w-4 bg-white/40 group-hover:w-6 group-hover:bg-white/80'
                    : 'h-[1.5px] w-4 bg-slate-300 group-hover:w-6 group-hover:bg-primary/70',
              )}
            />

            {/* Số thứ tự 01..06 */}
            <span
              className={cn(
                'w-5 text-right font-mono text-[11px] font-bold tracking-tight transition-colors duration-300',
                isActive
                  ? isOnDarkBanner
                    ? 'text-white'
                    : 'text-primary'
                  : isOnDarkBanner
                    ? 'text-white/55 group-hover:text-white'
                    : 'text-slate-400 group-hover:text-primary',
              )}
            >
              {num}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
