'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Target, Compass } from 'lucide-react';
import { INTRODUCE_EASE_OUT } from './introduce.constants';

export function IntroduceMissionVisionSection() {
  return (
    <section className="overflow-hidden bg-white py-16 sm:py-24 lg:py-28">
      <style>{`
        @keyframes compassIdleMission {
          0%, 100% {
            transform: scale(1.02) translateY(0px) rotate(0deg);
          }
          50% {
            transform: scale(1.055) translateY(-6px) rotate(0.35deg);
          }
        }

        @keyframes compassIdleVision {
          0%, 100% {
            transform: scale(1.02) translateY(0px) rotate(0deg);
          }
          50% {
            transform: scale(1.055) translateY(5px) rotate(-0.35deg);
          }
        }

        @keyframes ambientGlowFlow {
          0%, 100% {
            opacity: 0.18;
            transform: translate3d(-15%, -15%, 0) scale(0.95);
          }
          50% {
            opacity: 0.38;
            transform: translate3d(15%, 15%, 0) scale(1.1);
          }
        }

        .animate-compass-mission {
          will-change: transform;
          animation: compassIdleMission 7s ease-in-out infinite;
        }

        .animate-compass-vision {
          will-change: transform;
          animation: compassIdleVision 8s ease-in-out infinite 0.6s;
        }

        .animate-ambient-glow {
          will-change: transform, opacity;
          animation: ambientGlowFlow 6.5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-compass-mission,
          .animate-compass-vision,
          .animate-ambient-glow {
            animation: none !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ===================== PHẦN 1: SỨ MỆNH (Chữ bên Trái - Ảnh bên Phải) ===================== */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Cột trái: Nội dung Sứ mệnh - Trượt từ bên trái sang */}
          <motion.div
            initial={{ opacity: 0, x: -70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: INTRODUCE_EASE_OUT }}
            className="space-y-6 lg:col-span-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
              <Compass className="h-3.5 w-3.5" />
              <span>Sứ mệnh XTTECH</span>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl lg:text-[42px] lg:leading-[1.18]">Sứ mệnh</h2>

                <Link
                  href="/pricing"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-primary hover:text-primary hover:shadow-sm sm:px-5 sm:py-2"
                >
                  <span className="sm:hidden">Khám phá</span>
                  <span className="hidden sm:inline">Khám phá giải pháp</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <p className="mt-3 text-base leading-relaxed text-slate-700 sm:text-lg">
                XTTECH đưa công nghệ trở thành công cụ vận hành{' '}
                <strong className="font-semibold text-slate-900">dễ tiếp cận, hiệu quả và bền vững</strong> cho mọi doanh nghiệp vừa và nhỏ tại Việt
                Nam.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-sm font-semibold tracking-wide text-slate-900 uppercase">Chúng tôi giúp doanh nghiệp:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-slate-800">Quản trị nội bộ thông minh:</strong> Tiết kiệm thời gian và chi phí vận hành.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-slate-800">Áp dụng AI xây dựng thương hiệu số:</strong> Thông qua hệ thống app/web mang dấu
                    ấn riêng.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-slate-800">Kết nối cộng đồng doanh nghiệp cùng ngành:</strong> Chia sẻ nguồn lực và cơ hội
                    phát triển.
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Cột phải: Hình ảnh Sứ mệnh (our-mission.png) - Trượt từ bên phải sang */}
          <motion.div
            initial={{ opacity: 0, x: 70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.1, ease: INTRODUCE_EASE_OUT }}
            className="lg:col-span-6"
          >
            <div className="group relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-md transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
              {/* Quầng sáng ambient động nhẹ nhàng */}
              <div
                aria-hidden="true"
                className="animate-ambient-glow pointer-events-none absolute -inset-1/4 rounded-full bg-linear-to-tr from-primary/20 via-emerald-400/15 to-transparent blur-2xl"
              />

              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src="/assets/introduce/our-mission.png"
                  alt="Sứ mệnh XTTECH"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="animate-compass-mission object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ===================== ĐƯỜNG PHÂN CÁCH ===================== */}
        <div className="my-16 border-t border-slate-200/80 sm:my-24" />

        {/* ===================== PHẦN 2: TẦM NHÌN (Ảnh bên Trái - Chữ bên Phải) ===================== */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Cột trái: Hình ảnh Tầm nhìn (vision.jpg) - Trượt từ bên trái sang */}
          <motion.div
            initial={{ opacity: 0, x: -70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: INTRODUCE_EASE_OUT }}
            className="order-2 lg:order-1 lg:col-span-6"
          >
            <div className="group relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-md transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
              {/* Quầng sáng ambient động nhẹ nhàng */}
              <div
                aria-hidden="true"
                className="animate-ambient-glow pointer-events-none absolute -inset-1/4 rounded-full bg-linear-to-bl from-teal-400/20 via-primary/15 to-transparent blur-2xl"
              />

              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src="/assets/introduce/vision.jpg"
                  alt="Tầm nhìn XTTECH"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="animate-compass-vision object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />
              </div>
            </div>
          </motion.div>

          {/* Cột phải: Nội dung Tầm nhìn - Trượt từ bên phải sang */}
          <motion.div
            initial={{ opacity: 0, x: 70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.1, ease: INTRODUCE_EASE_OUT }}
            className="order-1 space-y-6 lg:order-2 lg:col-span-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
              <Target className="h-3.5 w-3.5" />
              <span>Tầm nhìn XTTECH</span>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl lg:text-[42px] lg:leading-[1.18]">Tầm nhìn</h2>

                <Link
                  href="/pricing"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-primary hover:text-primary hover:shadow-sm sm:px-5 sm:py-2"
                >
                  <span className="sm:hidden">Khám phá</span>
                  <span className="hidden sm:inline">Khám phá giải pháp</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <p className="mt-3 text-base leading-relaxed text-slate-700 sm:text-lg">
                Trở thành <strong className="font-semibold text-slate-900">đơn vị dẫn đầu</strong> trong lĩnh vực chuyển đổi số cho ngành nhôm cao cấp
                và xây dựng tại Việt Nam.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-sm font-semibold tracking-wide text-slate-900 uppercase">Định hướng phát triển trọng tâm:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-slate-800">Đối tác công nghệ tin cậy:</strong> Đồng hành cùng các doanh nghiệp SME đang trên
                    hành trình hiện đại hóa mô hình vận hành.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-slate-800">Tiên phong chuẩn hóa ngành:</strong> Tích hợp toàn diện thiết kế CAD 2D/3D, bóc
                    tách vật tư và quản lý thi công trên một nền tảng.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-slate-800">Kiến tạo giá trị dài hạn:</strong> Giúp xưởng và nhà thầu nâng cao năng lực cạnh
                    tranh và tối ưu hóa lợi nhuận.
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
