'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Factory, BarChart3, CheckCircle2 } from 'lucide-react';

interface GearDef {
  x: number;
  y: number;
  radius: number;
  teeth: number;
  speedMultiplier: number;
  color: string;
  name: string;
  sub: string;
  icon: typeof Users;
}

export function ClockworkGears({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeGear, setActiveGear] = useState<number>(1);
  const angleRef = useRef<number>(0);

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

    const drawGear = (
      x: number,
      y: number,
      radius: number,
      teeth: number,
      angle: number,
      color: string,
      scale: number,
      isActive: boolean
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      const toothDepth = 12 * scale;
      const toothAngle = (Math.PI * 2) / teeth;

      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const a1 = i * toothAngle;
        const a2 = a1 + toothAngle * 0.35;
        const a3 = a1 + toothAngle * 0.5;
        const a4 = a1 + toothAngle * 0.85;

        const rIn = radius * scale;
        const rOut = (radius + toothDepth) * scale;

        if (i === 0) {
          ctx.moveTo(Math.cos(a1) * rIn, Math.sin(a1) * rIn);
        } else {
          ctx.lineTo(Math.cos(a1) * rIn, Math.sin(a1) * rIn);
        }
        ctx.lineTo(Math.cos(a2) * rOut, Math.sin(a2) * rOut);
        ctx.lineTo(Math.cos(a3) * rOut, Math.sin(a3) * rOut);
        ctx.lineTo(Math.cos(a4) * rIn, Math.sin(a4) * rIn);
      }
      ctx.closePath();

      // Tô màu viền và bóng phát sáng
      ctx.strokeStyle = color;
      ctx.lineWidth = isActive ? 3 * scale : 1.8 * scale;
      ctx.fillStyle = isActive ? 'rgba(6, 182, 212, 0.12)' : 'rgba(15, 23, 42, 0.6)';
      if (isActive) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
      }
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Vòng tròn khoét rỗng bên trong
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.55 * scale, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5 * scale;
      ctx.stroke();

      // Nan hoa bánh răng (Spokes)
      const spokeCount = 6;
      for (let s = 0; s < spokeCount; s++) {
        const spokeA = (s * Math.PI * 2) / spokeCount;
        ctx.beginPath();
        ctx.moveTo(Math.cos(spokeA) * (radius * 0.2) * scale, Math.sin(spokeA) * (radius * 0.2) * scale);
        ctx.lineTo(Math.cos(spokeA) * (radius * 0.55) * scale, Math.sin(spokeA) * (radius * 0.55) * scale);
        ctx.stroke();
      }

      // Trục tâm (Hub)
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.2 * scale, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width;
      const h = canvas.height;
      const scale = Math.min(w, h) / 520;

      // Cập nhật góc quay dựa theo cuộn chuột + tự xoay nhẹ
      angleRef.current += 0.008 + scrollProgress * 0.04;
      const baseAngle = angleRef.current;

      const cx = w / 2;
      const cy = h / 2;

      // 3 Bánh răng ăn khớp chuẩn kích thước
      // Bánh răng 1 (Trái - HRM)
      const g1Radius = 80;
      const g1Teeth = 16;
      const g1X = cx - 110 * scale;
      const g1Y = cy - 40 * scale;
      const g1Angle = baseAngle;

      // Bánh răng 2 (Trung tâm - Sản xuất Nhôm Kính BOM)
      const g2Radius = 100;
      const g2Teeth = 20;
      const g2X = cx + 50 * scale;
      const g2Y = cy + 20 * scale;
      // Quay ngược chiều tỉ lệ răng
      const g2Angle = -baseAngle * (g1Teeth / g2Teeth);

      // Bánh răng 3 (Phía trên phải - Tài chính & Báo giá)
      const g3Radius = 65;
      const g3Teeth = 13;
      const g3X = cx + 80 * scale;
      const g3Y = cy - 120 * scale;
      // Quay cùng chiều bánh 1
      const g3Angle = baseAngle * (g1Teeth / g3Teeth);

      // Vẽ mạch điện kết nối giữa các tâm (Bus Line)
      ctx.beginPath();
      ctx.moveTo(g1X, g1Y);
      ctx.lineTo(g2X, g2Y);
      ctx.lineTo(g3X, g3Y);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.lineWidth = 2 * scale;
      ctx.setLineDash([6 * scale, 6 * scale]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Vẽ các bánh răng
      drawGear(g1X, g1Y, g1Radius, g1Teeth, g1Angle, '#38bdf8', scale, activeGear === 0);
      drawGear(g2X, g2Y, g2Radius, g2Teeth, g2Angle, '#f59e0b', scale, activeGear === 1);
      drawGear(g3X, g3Y, g3Radius, g3Teeth, g3Angle, '#10b981', scale, activeGear === 2);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [scrollProgress, activeGear]);

  const gearItems = [
    {
      title: 'NHÂN SỰ & CHẤM CÔNG GPS',
      desc: 'Theo dõi lộ trình, ca làm, khóa ca tự động & giải trình tức thời.',
      color: 'border-cyan-500/50 text-cyan-300 bg-cyan-950/30',
      icon: Users,
    },
    {
      title: 'ĐỊNH MỨC SẢN XUẤT NHÔM KÍNH',
      desc: 'BOM tự động, tối ưu cắt phôi dư thừa, kiểm soát xuất nhập vật tư.',
      color: 'border-amber-500/50 text-amber-300 bg-amber-950/30',
      icon: Factory,
    },
    {
      title: 'BÁO GIÁ & DÒNG TIỀN DỰ ÁN',
      desc: 'Chiết tính lợi nhuận realtime, quản lý công nợ và báo cáo đa chiều.',
      color: 'border-emerald-500/50 text-emerald-300 bg-emerald-950/30',
      icon: BarChart3,
    },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative h-[380px] w-full max-w-[580px] md:h-[460px]">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>

      {/* 3 Mắt xích đồng bộ */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
        {gearItems.map((item, idx) => {
          const Icon = item.icon;
          const isSelected = activeGear === idx;
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => setActiveGear(idx)}
              className={`flex flex-col text-left rounded-2xl border p-5 transition-all duration-200 ${
                isSelected
                  ? `${item.color} shadow-lg shadow-cyan-900/20 scale-[1.02]`
                  : 'border-white/10 bg-slate-950/40 text-slate-400 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className="h-6 w-6" />
                <span className="font-mono text-xs opacity-60">MẮT XÍCH #{idx + 1}</span>
              </div>
              <h4 className="mt-3 font-mono font-bold text-sm text-white">{item.title}</h4>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
