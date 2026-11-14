'use client';

import React, { useEffect, useState } from 'react';
import { Box, CheckCircle2, Grid2x2, Layers, Plus, Wrench } from 'lucide-react';
import { cn } from '@/utils/cn';

const ALUMINUM_BRANDS = [
  'ALVERO',
  'Euroview',
  'FV',
  'KAA',
  'Kenwin 555',
  'Kenwin Anode',
  'Kogen',
  'LUXANODE',
  'Maxpro',
  'Nam Sung',
  'Ngọc Diệp',
  'OWIN',
  'PMA',
  'Rolan',
  'SEAALUK-I',
  'Tiến Đạt',
  'Topal',
  'Vasco',
  'Xingfa',
  'Yangly',
  'Yongxing',
] as const;

const ACCESSORY_BRANDS = [
  '3H',
  'ALVERO',
  'BOGO',
  'Cmech',
  'Cologe',
  'Draho',
  'Generic',
  'GOVRO',
  'HMA',
  'Kaisenberg',
  'Kinlong',
  'LP',
  'SHARK',
] as const;

const BRAND_CAPABILITIES = [
  {
    icon: Box,
    text: 'Hỗ trợ đầy đủ các hãng nhôm phổ thông trên thị trường.',
  },
  {
    icon: Wrench,
    text: 'Hỗ trợ đồng bộ các hãng phụ kiện cửa, khóa, bản lề thông dụng.',
  },
  {
    icon: Grid2x2,
    text: 'Khai báo kính linh hoạt theo từng độ dày và chủng loại.',
  },
  {
    icon: CheckCircle2,
    text: 'Thiết kế và bóc tách chuẩn xác theo từng hệ nhôm thực tế.',
  },
] as const;

export const HeroBrandsSection = () => {
  const [activeCapIdx, setActiveCapIdx] = useState(0);
  const [isHoveringLeft, setIsHoveringLeft] = useState(false);

  const [activeAluminumIdx, setActiveAluminumIdx] = useState(0);
  const [activeAccessoryIdx, setActiveAccessoryIdx] = useState(0);
  const [isHoveringRight, setIsHoveringRight] = useState(false);

  useEffect(() => {
    if (isHoveringLeft) return;
    const timer = setInterval(() => {
      setActiveCapIdx((prev) => (prev + 1) % BRAND_CAPABILITIES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [isHoveringLeft]);

  useEffect(() => {
    if (isHoveringRight) return;
    const timer = setInterval(() => {
      setActiveAluminumIdx((prev) => (prev + 1) % ALUMINUM_BRANDS.length);
      setActiveAccessoryIdx((prev) => (prev + 1) % ACCESSORY_BRANDS.length);
    }, 950);
    return () => clearInterval(timer);
  }, [isHoveringRight]);

  return (
    <section className="border-t border-slate-100 bg-slate-50/70 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Cột trái: Giới thiệu khả năng khai báo hãng nhôm & phụ kiện */}
          <div
            onMouseEnter={() => setIsHoveringLeft(true)}
            onMouseLeave={() => setIsHoveringLeft(false)}
            className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8 lg:col-span-5"
          >
            <div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Layers className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase sm:text-2xl">
                  HÃNG NHÔM ĐA DẠNG – <span className="text-primary">LINH HOẠT THEO THỊ TRƯỜNG</span>
                </h2>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Tại <strong className="font-bold text-slate-800">XTTech</strong>, việc khai báo mới một hãng nhôm sẽ nhanh hơn các ứng dụng tương tự. Riêng các hãng nhôm có cùng biên dạng rãnh C hay rãnh K, chức năng sao chép hãng sẽ đảm nhiệm gần như toàn bộ thao tác — người dùng chỉ cần điều chỉnh lại mô tả và tỷ trọng.
              </p>
            </div>

            <ul className="mt-6 space-y-2 border-t border-slate-100 pt-5">
              {BRAND_CAPABILITIES.map((item, idx) => {
                const Icon = item.icon;
                const isIdleActive = !isHoveringLeft && idx === activeCapIdx;

                return (
                  <li
                    key={item.text}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-all duration-300 hover:translate-x-1 hover:bg-primary/5',
                      isIdleActive ? 'translate-x-1 bg-primary/5 text-primary' : 'text-slate-700',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-white',
                        isIdleActive ? 'scale-105 bg-primary text-white shadow-xs' : 'bg-primary/10 text-primary',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className={cn('leading-snug transition-colors', isIdleActive && 'font-semibold')}>
                      {item.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Cột phải: Danh sách hãng nhôm & hãng phụ kiện */}
          <div
            onMouseEnter={() => setIsHoveringRight(true)}
            onMouseLeave={() => setIsHoveringRight(false)}
            className="flex flex-col justify-between gap-7 rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8 lg:col-span-7"
          >
            {/* Nhóm 1: Hãng nhôm thông dụng */}
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Box className="h-4 w-4" />
                  </span>
                  <h3 className="text-base font-bold text-primary sm:text-lg">
                    Hãng nhôm thông dụng
                  </h3>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  {ALUMINUM_BRANDS.length} thương hiệu
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {ALUMINUM_BRANDS.map((brand, idx) => {
                  const isIdleActive = !isHoveringRight && idx === activeAluminumIdx;
                  return (
                    <span
                      key={brand}
                      className={cn(
                        'inline-flex cursor-default items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary hover:text-white sm:text-[13px]',
                        isIdleActive
                          ? '-translate-y-0.5 scale-105 border-primary bg-primary text-white shadow-sm'
                          : 'border-slate-200/90 bg-slate-50/80 text-slate-700',
                      )}
                    >
                      {brand}
                    </span>
                  );
                })}
                <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-primary/50 bg-primary/5 px-3.5 py-1.5 text-xs font-bold text-primary sm:text-[13px]">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Hãng tùy chỉnh</span>
                </span>
              </div>
            </div>

            {/* Nhóm 2: Hãng phụ kiện phổ biến */}
            <div className="border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Wrench className="h-4 w-4" />
                  </span>
                  <h3 className="text-base font-bold text-primary sm:text-lg">
                    Hãng phụ kiện phổ biến
                  </h3>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  {ACCESSORY_BRANDS.length} thương hiệu
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {ACCESSORY_BRANDS.map((brand, idx) => {
                  const isIdleActive = !isHoveringRight && idx === activeAccessoryIdx;
                  return (
                    <span
                      key={brand}
                      className={cn(
                        'inline-flex cursor-default items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary hover:text-white sm:text-[13px]',
                        isIdleActive
                          ? '-translate-y-0.5 scale-105 border-primary bg-primary text-white shadow-sm'
                          : 'border-slate-200/90 bg-slate-50/80 text-slate-700',
                      )}
                    >
                      {brand}
                    </span>
                  );
                })}
                <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-primary/50 bg-primary/5 px-3.5 py-1.5 text-xs font-bold text-primary sm:text-[13px]">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Phụ kiện tùy chỉnh</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
