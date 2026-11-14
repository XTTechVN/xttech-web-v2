'use client';

import React, { useState } from 'react';
import { CheckCircle2, Layers } from 'lucide-react';
import { cn } from '@/utils/cn';
import { XTTECH_PILLAR_CARDS } from '../hero.constants';
import { PILLAR_FILTERS, type PillarCategory } from './hero-story-pillars.constants';

export function PillarsSection() {
  const [selectedCategory, setSelectedCategory] = useState<PillarCategory>('all');

  const filteredPillars = XTTECH_PILLAR_CARDS.filter(
    (card) => selectedCategory === 'all' || card.category === selectedCategory,
  );

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
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4.5 sm:gap-5">
          {filteredPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4.5 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                {/* Badge số thứ tự bo góc lượn sóng ở góc trên bên phải */}
                <div className="absolute top-0 right-0">
                  <div className="rounded-bl-2xl bg-primary px-4 py-1 text-sm font-black tracking-wider text-white shadow-xs transition-colors group-hover:bg-primary-dark">
                    {pillar.number}
                  </div>
                </div>

                <div className="space-y-4 flex-1 flex flex-col">
                  {/* Icon ở góc trên bên trái */}
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-5.5 w-5.5 transition-colors" />
                  </div>

                  {/* Tiêu đề in hoa đậm chất kỹ thuật */}
                  <h3 className="text-base font-black tracking-tight text-slate-900 uppercase">
                    {pillar.title}
                  </h3>

                  {/* Danh sách gạch đầu dòng */}
                  <ul className="space-y-2.5 pt-1 flex-1">
                    {pillar.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-[13px] leading-relaxed text-slate-600">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary fill-primary/15" />
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
