'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { HeroRegisterInlineForm } from '@/app/(public)/_components/hero/hero-register-inline-form';
import { ECOSYSTEM_MODULES } from '@/app/(public)/_components/introduce/_components/introduce.constants';
import { INTRODUCE_EASE_OUT } from '@/app/(public)/_components/introduce/_components/use-spotlight-cycle';

const LINE_1 = 'Kiến tạo giá trị,';
const LINE_2 = 'chuyển hóa tương lai';
const FULL_SLOGAN = `${LINE_1}\n${LINE_2}`;

const DASH_COLORS = ['#045863', '#0284c7', '#0d9488', '#3b82f6'];

interface FanParticle {
  t: number; // 0..1 tiến trình bay ra từ tâm quạt
  angle: number;
  spread: number;
  speed: number;
  length: number;
  thickness: number;
  color: string;
  alpha: number;
  wobblePhase: number;
}

interface DustDot {
  x: number;
  y: number;
  size: number;
  alpha: number;
}

function HeroParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    const mouse = { x: -9999, y: -9999, active: false };

    // Tạo hình quạt mở rộng lên trên giống Google Antigravity (-142° đến -38°)
    const particles: FanParticle[] = Array.from({ length: 165 }, (_, i) => {
      const minAngle = -Math.PI * 0.82;
      const maxAngle = -Math.PI * 0.18;
      const angle = minAngle + Math.random() * (maxAngle - minAngle);
      return {
        t: Math.random(),
        angle,
        spread: (Math.random() - 0.5) * 0.08,
        speed: 0.0007 + Math.random() * 0.0009,
        length: 3.5 + Math.random() * 4,
        thickness: 1.5 + Math.random() * 0.6,
        color: DASH_COLORS[i % DASH_COLORS.length],
        alpha: 0.45 + Math.random() * 0.45,
        wobblePhase: Math.random() * Math.PI * 2,
      };
    });

    const dust: DustDot[] = Array.from({ length: 160 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 0.8 + Math.random() * 0.9,
      alpha: 0.08 + Math.random() * 0.14,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // 1. Hạt bụi siêu mảnh rải đều nền trắng
      for (const d of dust) {
        ctx.fillStyle = `rgba(15, 23, 42, ${d.alpha})`;
        ctx.fillRect(d.x * width, d.y * height, d.size, d.size);
      }

      // 2. Vạch hạt hình quạt tỏa lên phía sau tiêu đề
      const originX = width * 0.5;
      const originY = height * 0.82;
      const maxDist = Math.max(width * 0.52, height * 0.88);

      for (const p of particles) {
        if (!prefersReducedMotion) {
          p.t += p.speed;
          if (p.t > 1) p.t = 0.08;
        }

        const r = (0.12 + p.t * 0.88) * maxDist;
        const wobble = prefersReducedMotion ? 0 : Math.sin(time * 0.0015 + p.wobblePhase) * 0.025;
        const theta = p.angle + p.spread + wobble;

        let px = originX + Math.cos(theta) * r;
        let py = originY + Math.sin(theta) * r;

        if (mouse.active && !prefersReducedMotion) {
          const dx = px - mouse.x;
          const dy = py - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < 120) {
            const push = ((120 - dist) / 120) * 14;
            px += (dx / dist) * push;
            py += (dy / dist) * push;
          }
        }

        // Mờ dần ở gốc và mép ngoài
        const fade = Math.sin(p.t * Math.PI);
        const finalAlpha = p.alpha * Math.max(0, Math.min(1, fade * 1.35));
        if (finalAlpha <= 0.02) continue;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(theta);
        ctx.globalAlpha = finalAlpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.roundRect(-p.length / 2, -p.thickness / 2, p.length, p.thickness, p.thickness / 2);
        ctx.fill();
        ctx.restore();
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.active = false;
    };

    resize();
    animationFrameId = requestAnimationFrame(draw);
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

export function IntroduceHeroSection() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [typedCount, setTypedCount] = useState(prefersReducedMotion ? FULL_SLOGAN.length : 0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setTypedCount(FULL_SLOGAN.length);
      return;
    }

    setTypedCount(0);
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const startDelay = setTimeout(() => {
      intervalId = setInterval(() => {
        setTypedCount((prev) => {
          if (prev >= FULL_SLOGAN.length) {
            if (intervalId) clearInterval(intervalId);
            return prev;
          }
          return prev + 1;
        });
      }, 28);
    }, 220);

    return () => {
      clearTimeout(startDelay);
      if (intervalId) clearInterval(intervalId);
    };
  }, [prefersReducedMotion]);

  const isTypingDone = typedCount >= FULL_SLOGAN.length;
  const typedText = FULL_SLOGAN.slice(0, typedCount);
  const [typedLine1 = '', typedLine2 = ''] = typedText.split('\n');
  const showLine2Cursor = typedText.includes('\n') && !isTypingDone;

  return (
    <section className="relative flex min-h-[78vh] items-center justify-center overflow-hidden bg-white py-16 sm:min-h-[84vh] sm:py-24">
      <HeroParticleField />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* CHẾ ĐỘ ĐĂNG KÝ: Form trượt từ trái sang phải (cột trái) + Giới thiệu nhanh (cột phải) */}
          <div
            className={`grid grid-cols-1 items-center gap-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:grid-cols-12 lg:gap-10 ${
              isRegisterMode
                ? 'pointer-events-auto relative z-20'
                : 'pointer-events-none absolute inset-x-0 top-0 z-0 opacity-0'
            }`}
          >
            {/* Cột trái: Form đăng ký trượt từ trái sang */}
            <div
              className={`lg:col-span-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isRegisterMode ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'
              }`}
            >
              <HeroRegisterInlineForm
                isOpen={isRegisterMode}
                onBack={() => setIsRegisterMode(false)}
              />
            </div>

            {/* Cột phải: Nội dung tóm tắt hệ sinh thái */}
            <div
              className={`hidden space-y-5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:col-span-6 lg:block ${
                isRegisterMode ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
              }`}
            >
              <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase xl:text-4xl xl:leading-[1.18]">
                  Phần mềm quản trị sản xuất cho{' '}
                  <span className="text-primary">Xưởng Nhôm Kính & Nhà Thầu</span>
                </h2>
                <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                  <strong className="text-slate-900">XTTECH</strong> đồng bộ toàn bộ quy trình từ khảo sát ô chờ, thiết kế cửa CAD 2D/3D, bóc tách vật tư và xuất thẻ cắt A4 đến quản lý kho, chấm công tại công trình và báo cáo lãi/lỗ trên một hệ thống duy nhất.
                </p>
              </div>

              <ul className="space-y-3 border-t border-slate-200 pt-4 text-sm leading-relaxed text-slate-700">
                {ECOSYSTEM_MODULES.map((mod) => (
                  <li key={mod.code} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>
                      <strong className="font-bold text-slate-900">{mod.code} — {mod.name}:</strong>{' '}
                      {mod.desc}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/pricing"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                >
                  <span>Xem bảng giá chi tiết</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition-all hover:border-primary/40 hover:text-primary"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <span>Quay lại giới thiệu</span>
                </button>
              </div>
            </div>
          </div>

          {/* NỘI DUNG HERO BAN ĐẦU: Trượt sang phải khi mở form */}
          <div
            className={`mx-auto max-w-4xl text-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isRegisterMode
                ? 'pointer-events-none absolute top-0 left-1/2 z-0 w-full -translate-x-1/2 translate-x-12 opacity-0'
                : 'pointer-events-auto relative z-10 translate-x-0 opacity-100'
            }`}
          >
            {/* Logo XTTECH tối giản */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: INTRODUCE_EASE_OUT }}
              className="inline-flex items-center justify-center gap-2"
            >
              <img
                src="/image-xttech/logo-xttech.svg"
                alt="XTTECH Logo"
                className="h-6 w-6 object-contain sm:h-7 sm:w-7"
              />
              <span className="text-base font-medium tracking-tight text-slate-800 sm:text-lg">
                XTTECH
              </span>
            </motion.div>

            {/* Slogan nét mảnh gõ từng chữ ghép thành câu hoàn chỉnh */}
            <h1 className="relative mt-5 text-4xl font-normal tracking-[-0.03em] text-slate-900 sm:text-6xl sm:leading-[1.08] lg:text-[64px]">
              {/* Giữ khung chiều cao cố định tránh giật layout khi đang gõ */}
              <span aria-hidden="true" className="invisible block select-none">
                <span className="block">{LINE_1}</span>
                <span className="block">{LINE_2}</span>
              </span>

              <span className="absolute inset-0 block">
                <span className="block">
                  {typedLine1}
                  {!typedText.includes('\n') && !isTypingDone && (
                    <span className="ml-0.5 inline-block h-[0.85em] w-[2px] animate-pulse bg-primary align-middle" />
                  )}
                </span>
                <span className="block">
                  {typedLine2}
                  {showLine2Cursor && (
                    <span className="ml-0.5 inline-block h-[0.85em] w-[2px] animate-pulse bg-primary align-middle" />
                  )}
                </span>
              </span>
            </h1>

            {/* 2 nút CTA giống ảnh 2 */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6, ease: INTRODUCE_EASE_OUT }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
            >
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary via-teal-600 to-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:brightness-105 hover:shadow-xl hover:shadow-primary/30"
              >
                <FileSpreadsheet className="h-4 w-4 shrink-0" />
                <span>Đăng ký sử dụng miễn phí</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/90 px-6 py-3.5 text-sm font-bold text-slate-800 shadow-2xs backdrop-blur-xs transition-colors hover:border-primary/50 hover:bg-slate-50 hover:text-primary"
              >
                Xem bảng giá dịch vụ
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
