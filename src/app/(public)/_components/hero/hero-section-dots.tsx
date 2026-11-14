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

  useEffect(() => {
    const elements = SECTION_DOTS.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (elements.length === 0) return;

    const handleScroll = () => {
      const viewportCenter = window.scrollY + window.innerHeight * 0.42;

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

  return (
    <nav
      aria-label="Điều hướng các khối nội dung"
      className="fixed top-1/2 right-4 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex xl:right-6"
    >
      {SECTION_DOTS.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleScrollTo(item.id)}
            aria-label={item.label}
            aria-current={isActive ? 'true' : undefined}
            className="group relative flex h-5 w-5 cursor-pointer items-center justify-center focus:outline-none"
          >
            {/* Tooltip tên khối khi rê chuột */}
            <span className="pointer-events-none absolute right-7 rounded-lg bg-slate-900/90 px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-white opacity-0 shadow-md transition-all duration-200 group-hover:-translate-x-0.5 group-hover:opacity-100">
              {item.label}
            </span>

            {/* Chấm tròn không nền bọc: thêm viền sáng mảnh bên ngoài để rõ trên cả nền tối và nền trắng */}
            <span
              className={cn(
                'block rounded-full transition-all duration-300',
                isActive
                  ? 'h-4 w-4 scale-110 border-[3.5px] border-primary bg-white shadow-[0_0_0_2px_rgba(255,255,255,0.85)]'
                  : 'h-3 w-3 bg-primary shadow-[0_0_0_1.5px_rgba(255,255,255,0.75)] group-hover:scale-115 group-hover:shadow-[0_0_0_2px_rgba(255,255,255,0.95)]',
              )}
            />
          </button>
        );
      })}
    </nav>
  );
};
