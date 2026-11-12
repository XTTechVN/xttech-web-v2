import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components';
import { HERO_ACCENT_GLOW } from './hero.constants';

export const HeroPlatformBanner = () => {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#03363D] px-6 py-12 text-white shadow-2xl sm:px-10 lg:px-14 lg:py-16">
          <div
            className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-25 blur-3xl"
            style={{ background: HERO_ACCENT_GLOW }}
          />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Mockup Dashboard CAD */}
            <div className="w-full lg:col-span-6">
              <div className="relative mx-auto w-full max-w-xl rounded-2xl border border-white/20 bg-gradient-to-b from-gray-900/95 via-gray-900 to-gray-950 p-3 shadow-2xl backdrop-blur-md sm:rounded-3xl sm:p-5">
                {/* Window Bar */}
                <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2.5 sm:mb-4 sm:pb-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500 sm:h-3 sm:w-3" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500 sm:h-3 sm:w-3" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 sm:h-3 sm:w-3" />
                    <span className="ml-1.5 text-xs font-bold text-gray-200 sm:ml-2 sm:text-sm">XTTech CAD Studio v2.4</span>
                  </div>
                  <span className="truncate text-[10px] text-white/60 sm:text-xs">Dự án: Biệt thự Louis Riverside</span>
                </div>

                {/* Window Content */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12 sm:gap-3">
                  {/* Sidebar */}
                  <div className="col-span-1 flex flex-wrap gap-1 rounded-xl bg-white/5 p-2.5 text-[11px] text-white/70 sm:col-span-4 sm:flex-col sm:space-y-2 sm:p-3 sm:text-xs">
                    <div className="w-full text-[10px] font-bold tracking-wider text-white uppercase sm:text-xs">DANH MỤC</div>
                    <div className="rounded-lg bg-primary px-2.5 py-1.5 font-medium text-white shadow-sm">Vị trí tầng 1</div>
                    <div className="px-2.5 py-1 text-white/70">Tầng 2 (4 cửa)</div>
                    <div className="px-2.5 py-1 text-white/70">Tầng 3 (6 cửa)</div>
                    <div className="mt-2 w-full text-[10px] font-bold tracking-wider text-white uppercase sm:mt-3 sm:text-xs">VẬT TƯ KHO</div>
                    <div className="px-2.5 py-1 text-white/70">Xingfa Nhập</div>
                    <div className="px-2.5 py-1 text-white/70">Phụ kiện Kinlong</div>
                  </div>

                  {/* Main Workspace */}
                  <div className="col-span-1 flex flex-col justify-between rounded-xl bg-white/10 p-2.5 sm:col-span-8 sm:p-3.5">
                    <div>
                      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-1 border-b border-white/10 pb-2 text-xs">
                        <span className="font-bold text-white">Báo giá: DA-2026-00091</span>
                        <span className="text-[11px] font-bold text-hero-accent sm:text-xs">Tự tính mBOM & Thẻ A4</span>
                      </div>

                      {/* 3 Cửa preview */}
                      <div className="grid grid-cols-3 gap-2 py-1 sm:gap-2.5 sm:py-2">
                        <div className="rounded-lg border border-primary/40 bg-white/5 p-2 text-center transition-transform hover:scale-105 sm:p-2.5">
                          <div className="mx-auto mb-1.5 h-14 w-9 rounded border-2 border-amber-500/70 bg-amber-500/10 shadow-inner sm:h-16 sm:w-10" />
                          <span className="block text-[10px] font-medium text-white/90 sm:text-[11px]">Cửa C1 (2.4x2m)</span>
                        </div>
                        <div className="rounded-lg border border-primary/40 bg-white/5 p-2 text-center transition-transform hover:scale-105 sm:p-2.5">
                          <div className="mx-auto mb-1.5 h-14 w-11 rounded border-2 border-blue-500/70 bg-blue-500/10 shadow-inner sm:h-16 sm:w-12" />
                          <span className="block text-[10px] font-medium text-white/90 sm:text-[11px]">Cửa Sổ S2</span>
                        </div>
                        <div className="rounded-lg border border-primary/40 bg-white/5 p-2 text-center transition-transform hover:scale-105 sm:p-2.5">
                          <div className="mx-auto mb-1.5 h-14 w-10 rounded border-2 border-emerald-500/70 bg-emerald-500/10 shadow-inner sm:h-16 sm:w-11" />
                          <span className="block text-[10px] font-medium text-white/90 sm:text-[11px]">Vách Kính V1</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer bar */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-1 rounded-lg border border-white/5 bg-black/50 p-2 text-[11px] text-white/80 sm:p-2.5 sm:text-xs">
                      <span className="text-white/80">
                        Vốn: <b className="text-white">184.500.000đ</b>
                      </span>
                      <span className="font-bold text-hero-accent">Lãi gộp: 32.4%</span>
                    </div>
                  </div>
                </div>

                {/* Floating Badge Mobile App - Responsive */}
                <div className="mt-3 rounded-2xl border border-white/30 bg-primary/95 p-3.5 text-white shadow-2xl backdrop-blur-md sm:absolute sm:-right-5 sm:-bottom-5 sm:mt-0 sm:max-w-[220px]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-hero-accent sm:text-sm">
                    <Sparkles className="h-4 w-4 shrink-0 text-hero-accent" />
                    <span>Đồng bộ Mobile App</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-snug text-white/90">
                    Thợ xưởng nhận ngay Thẻ cắt A4 và quét mã QR bàn giao tại chân công trình.
                  </p>
                </div>
              </div>
            </div>

            {/* Nội dung bên phải */}
            <div className="space-y-6 lg:col-span-6">
              <div
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase backdrop-blur-sm"
                style={{ color: 'var(--hero-accent-raw)' }}
              >
                XTTECH PLATFORM
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-tight">
                Sẵn sàng thay đổi <br />
                cách thiết kế và tư vấn bán hàng?
              </h2>
              <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                Không chỉ là phần mềm thiết kế, XTTech giúp doanh nghiệp đồng bộ quy trình từ tư vấn, thiết kế, báo giá, sản xuất đến thi công trên
                cùng một hệ thống.
              </p>
              <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                XTTech giúp hạn chế sai sót, nâng cao năng suất làm việc, giúp tạo hình ảnh chuyên nghiệp hơn trong mắt khách hàng.
              </p>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Link href="/signin">
                  <Button
                    size="lg"
                    className="w-full rounded-full font-extrabold text-primary shadow-xl transition-all duration-300 hover:scale-105 sm:w-auto"
                    style={{ backgroundColor: 'var(--hero-accent-raw)' }}
                  >
                    ĐĂNG KÝ DÙNG THỬ
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full rounded-full border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 sm:w-auto"
                  >
                    Xem các gói bảng giá
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

