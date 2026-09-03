'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Zap, ArrowUpRight, Activity, Cpu, Layers } from 'lucide-react';

export function ReactorCore() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const particleCount = 60;
    const particles = Array.from({ length: particleCount }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: 120 + Math.random() * 140,
      speed: 1 + Math.random() * 2,
      size: 1.5 + Math.random() * 2,
      color: Math.random() > 0.4 ? '#06b6d4' : '#f59e0b',
    }));

    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick++;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) / 500;

      // 1. Quả cầu năng lượng hạt nhân trung tâm (Central Plasma Core)
      const pulse = Math.sin(tick * 0.05) * 8 * scale;
      const coreR = (45 * scale) + pulse;

      const grad = ctx.createRadialGradient(cx, cy, 5 * scale, cx, cy, coreR * 1.6);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#38bdf8');
      grad.addColorStop(0.7, '#0284c7');
      grad.addColorStop(1, 'rgba(2, 132, 199, 0)');

      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // 2. Vòng bảo vệ từ trường (Magnetic Shield Rings)
      for (let ring = 0; ring < 3; ring++) {
        const ringAngle = tick * (0.02 * (ring % 2 === 0 ? 1 : -1));
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ringAngle);
        ctx.beginPath();
        ctx.ellipse(0, 0, (85 + ring * 25) * scale, (35 + ring * 10) * scale, 0, 0, Math.PI * 2);
        ctx.strokeStyle = ring === 0 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(6, 182, 212, 0.3)';
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();
        ctx.restore();
      }

      // 3. Luồng hạt dữ liệu hội tụ về tâm (Data Streams Inflow)
      particles.forEach((p) => {
        p.dist -= p.speed * scale;
        if (p.dist < 20 * scale) {
          p.dist = (180 + Math.random() * 80) * scale;
          p.angle = Math.random() * Math.PI * 2;
        }

        const px = cx + Math.cos(p.angle) * p.dist;
        const py = cy + Math.sin(p.angle) * p.dist;

        ctx.beginPath();
        ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center text-center">
      <div className="relative h-[340px] w-full max-w-[500px]">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-4 py-1.5 font-mono text-xs text-cyan-300 backdrop-blur-md">
        <Activity className="h-4 w-4 animate-pulse text-cyan-400" />
        FASTAPI ASYNC • REDIS MEMORY • POSTGRESQL 2.0
      </div>

      <h3 className="mt-4 font-mono font-black text-2xl tracking-wider text-white md:text-3xl">
        KHỞI ĐỘNG CỖ MÁY DOANH NGHIỆP CỦA BẠN
      </h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400 leading-relaxed">
        Tất cả dữ liệu nhân sự, sản xuất nhôm kính và dòng tiền được tự động hóa đồng bộ trên một nền tảng duy nhất.
      </p>

      {/* CTA Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/app/attendances"
          className="group relative flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 font-mono font-bold text-sm text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <span>VÀO BẢNG ĐIỀU HÀNH</span>
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>

        <Link
          href="/app/attendances/live-map"
          className="flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-900/60 px-8 py-3.5 font-mono font-bold text-sm text-slate-200 backdrop-blur-xl transition-all hover:border-white/30 hover:bg-slate-800/80"
        >
          <Zap className="h-4 w-4 text-amber-400" />
          <span>XEM LIVE GPS MAP</span>
        </Link>
      </div>
    </div>
  );
}
