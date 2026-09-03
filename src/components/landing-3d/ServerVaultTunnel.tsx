'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Lock, ShieldCheck, Database, KeyRound, Server } from 'lucide-react';

export function ServerVaultTunnel({ scrollProgress = 0 }: { scrollProgress?: number }) {
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

    let frame = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) / 600;

      // 1. Vẽ đường hầm 3D (3D Server Tunnel Wireframe)
      const rings = 8;
      const tunnelDepthOffset = (frame * 0.8 + scrollProgress * 600) % 100;

      for (let r = 0; r < rings; r++) {
        const z = (r * 70 + tunnelDepthOffset) * scale;
        const radius = Math.max(30 * scale, (380 * scale) - z * 0.4);
        const alpha = Math.max(0.05, 0.4 - (r / rings) * 0.35);

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
        ctx.lineWidth = 1.2 * scale;
        ctx.stroke();

        // Vẽ các tủ Rack 2 bên thành hầm
        const rackWidth = radius * 0.25;
        const rackHeight = radius * 0.4;
        ctx.strokeStyle = `rgba(168, 85, 247, ${alpha * 0.8})`;
        ctx.strokeRect(cx - radius * 0.95, cy - rackHeight / 2, rackWidth, rackHeight);
        ctx.strokeRect(cx + radius * 0.95 - rackWidth, cy - rackHeight / 2, rackWidth, rackHeight);

        // Đèn LED tín hiệu nhấp nháy trên Rack
        if (Math.sin(frame * 0.1 + r) > 0) {
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(cx - radius * 0.95 + 8 * scale, cy, 2.5 * scale, 0, Math.PI * 2);
          ctx.arc(cx + radius * 0.95 - 8 * scale, cy, 2.5 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Vẽ Cửa Hầm Bảo Mật Cơ Học (Circular Vault Blast Door)
      const doorOpen = Math.min(1, Math.max(0, (scrollProgress - 0.2) * 2.5));
      const doorAngle = frame * 0.005 + doorOpen * 1.5;
      const doorRadius = 140 * scale;

      ctx.save();
      ctx.translate(cx, cy);

      // Vành răng ngoài của cửa hầm
      ctx.beginPath();
      ctx.arc(0, 0, doorRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
      ctx.lineWidth = 4 * scale;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Chốt khóa cơ học 8 hướng (Interlocking Locking Pins)
      const pinCount = 8;
      for (let p = 0; p < pinCount; p++) {
        const pinAngle = (p * Math.PI * 2) / pinCount + doorAngle;
        const pinExtend = (1 - doorOpen * 0.6) * (20 * scale);
        ctx.save();
        ctx.rotate(pinAngle);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-6 * scale, doorRadius - 8 * scale + pinExtend, 12 * scale, 18 * scale);
        ctx.restore();
      }

      // Lõi khóa trung tâm
      ctx.beginPath();
      ctx.arc(0, 0, 45 * scale, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2 * scale;
      ctx.fill();
      ctx.stroke();

      // Tia laser quét bảo mật (Security Scan Beam)
      const scanY = Math.sin(frame * 0.06) * (doorRadius * 0.8);
      ctx.beginPath();
      ctx.moveTo(-doorRadius * 0.8, scanY);
      ctx.lineTo(doorRadius * 0.8, scanY);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.lineWidth = 2 * scale;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [scrollProgress]);

  const securityPillars = [
    {
      title: 'THU HỒI TOKEN & BLACKLIST',
      sub: 'Redis Blacklist tức thì khi logout hoặc vô hiệu hóa tài khoản.',
      icon: KeyRound,
      color: 'text-amber-400',
    },
    {
      title: 'PHÂN QUYỀN RBAC ĐA CẤP',
      sub: 'Chặn quyền theo vai trò (Super Admin, HR, Manager, Staff) tới từng API.',
      icon: ShieldCheck,
      color: 'text-cyan-400',
    },
    {
      title: 'AUDIT TRAIL BẤT BIẾN',
      sub: 'Ghi lại mọi thay đổi dữ liệu, chống giả mạo hay xóa lịch sử chấm công.',
      icon: Database,
      color: 'text-emerald-400',
    },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative h-[380px] w-full max-w-[580px] md:h-[460px]">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
        {securityPillars.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 backdrop-blur-xl transition-all hover:border-amber-500/40"
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-6 w-6 ${item.color}`} />
                <h4 className="font-mono font-bold text-sm text-white">{item.title}</h4>
              </div>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">{item.sub}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
