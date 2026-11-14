'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Layers } from 'lucide-react';
import { cn } from '@/utils/cn';
import { XTTECH_PILLAR_CARDS } from '../hero.constants';
import { PILLAR_FILTERS, type PillarCategory } from './hero-story-pillars.constants';

export function PillarsSection() {
  const [selectedCategory, setSelectedCategory] = useState<PillarCategory>('all');
  const [activeIdleIdx, setActiveIdleIdx] = useState(0);
  const [isHoveringGrid, setIsHoveringGrid] = useState(false);

  const filteredPillars = XTTECH_PILLAR_CARDS.filter(
    (card) => selectedCategory === 'all' || card.category === selectedCategory,
  );

  // Hiệu ứng spotlight tự động chạy tuần tự qua từng khối khi người dùng chưa hover
  useEffect(() => {
    if (isHoveringGrid || filteredPillars.length === 0) return;

    const timer = setInterval(() => {
      setActiveIdleIdx((prev) => (prev + 1) % filteredPillars.length);
    }, 2400);

    return () => clearInterval(timer);
  }, [isHoveringGrid, filteredPillars.length]);

  return (
    <section className="py-6 lg:py-8 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Layers className="h-3.5 w-3.5" />
            <span>Giá trị cốt lõi</span>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-primary sm:text-3xl lg:text-4xl">
            Vì sao doanh nghiệp chọn XTTech?
          </h2>
          <p className="mt-2 text-sm text-gray-600 sm:text-base leading-relaxed">
            Chúng tôi không chỉ cung cấp công cụ, chúng tôi chuyển giao cả phương pháp quản trị hiện đại đã được kiểm chứng cho ngành nhôm kính.
          </p>

          {/* Bộ lọc giải pháp */}
          <div className="mt-4 flex items-center justify-center">
            <div className="inline-flex items-center p-1 rounded-full bg-slate-100 border border-slate-200/80 shadow-2xs">
              {PILLAR_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedCategory(filter.value)}
                  className={cn(
                    'px-4.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer',
                    selectedCategory === filter.value
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900',
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lưới 8 Thẻ giải pháp (Lưới 4x2 với Badge số lượn sóng) */}
        <div
          onMouseEnter={() => setIsHoveringGrid(true)}
          onMouseLeave={() => setIsHoveringGrid(false)}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4.5 sm:gap-5"
        >
          {filteredPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            const isIdleActive =
              !isHoveringGrid &&
              filteredPillars.length > 0 &&
              idx === activeIdleIdx % filteredPillars.length;

            return (
              <div
                key={`${selectedCategory}-${pillar.title}`}
                style={{ animationDelay: `${idx * 55}ms` }}
                className={cn(
                  'animate-pillar-card-in group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-4.5 sm:p-5 transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10',
                  isIdleActive
                    ? '-translate-y-1 border-primary/45 shadow-lg shadow-primary/10'
                    : 'border-slate-200/80 shadow-sm',
                )}
              >
                {/* Thanh primary quét ngang viền trên khi hover hoặc khi đang spotlight */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none absolute inset-x-0 top-0 h-1 origin-left bg-primary transition-transform duration-500 ease-out group-hover:scale-x-100',
                    isIdleActive ? 'scale-x-100' : 'scale-x-0',
                  )}
                />

                {/* Quầng sáng nền góc trên trái khi hover hoặc khi đang spotlight */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none absolute -top-10 -left-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100',
                    isIdleActive ? 'opacity-100' : 'opacity-0',
                  )}
                />

                {/* Badge số thứ tự bo góc lượn sóng ở góc trên bên phải */}
                <div className="absolute top-0 right-0 z-10">
                  <div className="rounded-bl-2xl bg-primary px-4 py-1 text-sm font-black tracking-wider text-white shadow-xs transition-all duration-300">
                    {pillar.number}
                  </div>
                </div>

                <div className="relative z-10 flex flex-1 flex-col space-y-4">
                  {/* Icon ở góc trên bên trái */}
                  <div
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-primary group-hover:text-white group-hover:shadow-md',
                      isIdleActive
                        ? 'scale-105 bg-primary text-white shadow-sm'
                        : 'bg-primary/10 text-primary',
                    )}
                  >
                    <Icon className="h-5.5 w-5.5 transition-transform duration-300" />
                  </div>

                  {/* Tiêu đề in hoa đậm chất kỹ thuật */}
                  <h3
                    className={cn(
                      'text-base font-black tracking-tight uppercase transition-colors duration-300 group-hover:text-primary',
                      isIdleActive ? 'text-primary' : 'text-slate-900',
                    )}
                  >
                    {pillar.title}
                  </h3>

                  {/* Danh sách gạch đầu dòng */}
                  <ul className="space-y-2.5 pt-1 flex-1">
                    {pillar.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-[13px] leading-relaxed text-slate-600 transition-colors duration-200 group-hover:text-slate-700">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary fill-primary/15 transition-transform duration-200 group-hover:scale-110" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
