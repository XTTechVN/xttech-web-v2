'use client';

import React, { useEffect, useState } from 'react';
import Image, { type StaticImageData } from 'next/image';
import { Box, CheckCircle2, Grid2x2, Layers, Wrench } from 'lucide-react';
import { cn } from '@/utils/cn';

import img3h from '@/assets/accessories/3h.jpg';
import imgAlutrend from '@/assets/accessories/alutrend.jpg';
import imgAlvero from '@/assets/accessories/alvero.jpg';
import imgBv1a2 from '@/assets/accessories/bv1a2.jpg';
import imgCandy from '@/assets/accessories/candy.jpg';
import imgCologe from '@/assets/accessories/cologe.jpg';
import imgCologext from '@/assets/accessories/cologext.jpg';
import imgDraho from '@/assets/accessories/draho.jpg';
import imgEuroview from '@/assets/accessories/euroview.jpg';
import imgFv from '@/assets/accessories/fv.png';
import imgGeneric from '@/assets/accessories/generic.jpg';
import imgGovro from '@/assets/accessories/govro.jpg';
import imgHma from '@/assets/accessories/hma.jpg';
import imgKewin from '@/assets/accessories/kewin.jpg';
import imgKewwinAnote from '@/assets/accessories/kewwin-anote.jpg';
import imgKinlong from '@/assets/accessories/kinlong.jpg';
import imgKka from '@/assets/accessories/kka.jpg';
import imgKogen from '@/assets/accessories/kogen.jpg';
import imgLux65 from '@/assets/accessories/lux65.png';
import imgLuxanote from '@/assets/accessories/luxanote.jpg';
import imgMaxpro from '@/assets/accessories/maxpro.jpg';
import imgNamsung from '@/assets/accessories/namsung.jpg';
import imgNgocdiep from '@/assets/accessories/ngocdiep.jpg';
import imgOren from '@/assets/accessories/oren.jpg';
import imgOwin from '@/assets/accessories/owin.jpg';
import imgPma from '@/assets/accessories/pma.jpg';
import imgPmd from '@/assets/accessories/pmd.jpg';
import imgRolan from '@/assets/accessories/rolan.jpg';
import imgSealluk from '@/assets/accessories/sealluk.jpg';
import imgSoco from '@/assets/accessories/soco.jpg';
import imgTiendat from '@/assets/accessories/tiendat.jpg';
import imgTotowindow from '@/assets/accessories/totowindow.jpg';
import imgTruongthanh from '@/assets/accessories/truongthanh.jpg';
import imgVasco from '@/assets/accessories/vasco.jpg';

interface BrandLogoItem {
  id: string;
  name: string;
  src: StaticImageData;
}

const ALUMINUM_BRANDS: BrandLogoItem[] = [
  { id: 'alutrend', name: 'Alutrend', src: imgAlutrend },
  { id: 'alvero', name: 'ALVERO', src: imgAlvero },
  { id: 'bv1a2', name: 'BV1A2', src: imgBv1a2 },
  { id: 'candy', name: 'Candy', src: imgCandy },
  { id: 'euroview', name: 'Euroview', src: imgEuroview },
  { id: 'fv', name: 'FV', src: imgFv },
  { id: 'kka', name: 'KAA', src: imgKka },
  { id: 'kewin', name: 'Kenwin', src: imgKewin },
  { id: 'kewwin-anote', name: 'Kenwin Anode', src: imgKewwinAnote },
  { id: 'kogen', name: 'Kogen', src: imgKogen },
  { id: 'lux65', name: 'LUX 65', src: imgLux65 },
  { id: 'luxanote', name: 'LUXANODE', src: imgLuxanote },
  { id: 'maxpro', name: 'Maxpro', src: imgMaxpro },
  { id: 'namsung', name: 'Nam Sung', src: imgNamsung },
  { id: 'ngocdiep', name: 'Ngọc Diệp', src: imgNgocdiep },
  { id: 'oren', name: 'Oren', src: imgOren },
  { id: 'owin', name: 'OWIN', src: imgOwin },
  { id: 'pma', name: 'PMA', src: imgPma },
  { id: 'pmd', name: 'PMD', src: imgPmd },
  { id: 'rolan', name: 'Rolan', src: imgRolan },
  { id: 'sealluk', name: 'SEAALUK-I', src: imgSealluk },
  { id: 'soco', name: 'SOCO', src: imgSoco },
  { id: 'tiendat', name: 'Tiến Đạt', src: imgTiendat },
  { id: 'totowindow', name: 'TotoWindow', src: imgTotowindow },
  { id: 'truongthanh', name: 'Trường Thành', src: imgTruongthanh },
  { id: 'vasco', name: 'Vasco', src: imgVasco },
];

const ACCESSORY_BRANDS: BrandLogoItem[] = [
  { id: '3h', name: '3H', src: img3h },
  { id: 'alvero-acc', name: 'ALVERO', src: imgAlvero },
  { id: 'cologe', name: 'Cologe', src: imgCologe },
  { id: 'cologext', name: 'Cologe XT', src: imgCologext },
  { id: 'draho', name: 'Draho', src: imgDraho },
  { id: 'generic', name: 'Generic', src: imgGeneric },
  { id: 'govro', name: 'GOVRO', src: imgGovro },
  { id: 'hma', name: 'HMA', src: imgHma },
  { id: 'kinlong', name: 'Kinlong', src: imgKinlong },
];

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
            className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8 lg:col-span-5"
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

          {/* Cột phải: Danh sách ô vuông logo hãng nhôm & hãng phụ kiện */}
          <div
            onMouseEnter={() => setIsHoveringRight(true)}
            onMouseLeave={() => setIsHoveringRight(false)}
            className="flex flex-col gap-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8 lg:col-span-7"
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

              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                {ALUMINUM_BRANDS.map((brand, idx) => {
                  const isIdleActive = !isHoveringRight && idx === activeAluminumIdx;
                  return (
                    <div
                      key={brand.id}
                      title={brand.name}
                      className={cn(
                        'relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border bg-white p-1 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-primary hover:shadow-md sm:h-13 sm:w-13',
                        isIdleActive
                          ? '-translate-y-0.5 scale-105 border-primary shadow-md ring-2 ring-primary/20'
                          : 'border-slate-200/90',
                      )}
                    >
                      <Image
                        src={brand.src}
                        alt={brand.name}
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nhóm 2: Hãng phụ kiện phổ biến */}
            <div className="border-t border-slate-100 pt-5">
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

              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                {ACCESSORY_BRANDS.map((brand, idx) => {
                  const isIdleActive = !isHoveringRight && idx === activeAccessoryIdx;
                  return (
                    <div
                      key={brand.id}
                      title={brand.name}
                      className={cn(
                        'relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border bg-white p-1 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-primary hover:shadow-md sm:h-13 sm:w-13',
                        isIdleActive
                          ? '-translate-y-0.5 scale-105 border-primary shadow-md ring-2 ring-primary/20'
                          : 'border-slate-200/90',
                      )}
                    >
                      <Image
                        src={brand.src}
                        alt={brand.name}
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
