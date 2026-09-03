'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Radio, Navigation, Gauge, BatteryCharging, MapPin } from 'lucide-react';

interface StaffPin {
  lat: number;
  lng: number;
  name: string;
  status: 'moving' | 'stationary';
  speed: string;
}

export function CommandBunkerGlobe({ scrollProgress = 0 }: { scrollProgress?: number }) {
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

    const staffPins: StaffPin[] = [
      { lat: 21.0285, lng: 105.8542, name: 'Hà Nội Core', status: 'moving', speed: '35 km/h' },
      { lat: 16.0544, lng: 108.2022, name: 'Đà Nẵng Site', status: 'stationary', speed: '0 km/h' },
      { lat: 10.8231, lng: 106.6297, name: 'TP.HCM Hub', status: 'moving', speed: '42 km/h' },
    ];

    let rotY = 0;
    let radarAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      rotY += 0.005 + scrollProgress * 0.01;
      radarAngle += 0.03;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const globeRadius = Math.min(w, h) * 0.38;

      // 1. Vẽ Quả cầu Hologram 3D dạng lưới (Wireframe Globe)
      const latLines = 10;
      const lngLines = 16;

      ctx.save();
      ctx.translate(cx, cy);

      // Vòng tròn biên ngoài quả cầu phát sáng
      ctx.beginPath();
      ctx.arc(0, 0, globeRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Vĩ tuyến (Latitude rings)
      for (let i = 1; i < latLines; i++) {
        const phi = (i / latLines) * Math.PI - Math.PI / 2;
        const r = globeRadius * Math.cos(phi);
        const y = globeRadius * Math.sin(phi);

        ctx.beginPath();
        ctx.ellipse(0, y, r, r * 0.3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.stroke();
      }

      // Kinh tuyến xoay (Longitude meridians)
      for (let j = 0; j < lngLines; j++) {
        const theta = (j / lngLines) * Math.PI * 2 + rotY;
        const xRadius = globeRadius * Math.cos(theta);

        ctx.beginPath();
        ctx.ellipse(0, 0, Math.abs(xRadius), globeRadius, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
        ctx.stroke();
      }

      // 2. Tia quét Radar hình quạt (Radar Sweep)
      const sweepLength = globeRadius * 1.15;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, sweepLength, radarAngle, radarAngle + 0.45);
      ctx.closePath();
      const radarGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, sweepLength);
      radarGrad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
      radarGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = radarGrad;
      ctx.fill();

      // 3. Tọa độ các điểm nhân sự GPS (Staff Markers)
      staffPins.forEach((pin, idx) => {
        const pinAngle = (pin.lng * Math.PI) / 180 + rotY;
        const px = globeRadius * 0.75 * Math.sin(pinAngle);
        const py = -globeRadius * 0.45 * Math.sin((pin.lat * Math.PI) / 180);

        // Điểm chấm
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = pin.status === 'moving' ? '#10b981' : '#f59e0b';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Vòng sóng lan tỏa
        const pulseR = (Date.now() * 0.015 + idx * 10) % 20;
        ctx.beginPath();
        ctx.arc(px, py, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(16, 185, 129, ${Math.max(0, 1 - pulseR / 20)})`;
        ctx.stroke();

        // Nhãn nhân viên
        ctx.font = '10px monospace';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(pin.name, px + 8, py - 4);
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [scrollProgress]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative h-[380px] w-full max-w-[580px] md:h-[460px]">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>

      {/* Thông số giám sát thực địa */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-cyan-300">
            <span className="font-mono text-xs">ĐỊNH VỊ CHÍNH XÁC</span>
            <Radio className="h-4 w-4 animate-pulse text-cyan-400" />
          </div>
          <div className="mt-2 font-mono font-bold text-lg text-white">REDIS GEO &lt; 5m</div>
          <p className="mt-1 text-xs text-slate-400">
            Tính khoảng cách cung tròn Haversine và tìm kiếm bán kính siêu tốc.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-emerald-300">
            <span className="font-mono text-xs">TRUYỀN TIN TỨC THỜI</span>
            <Navigation className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono font-bold text-lg text-white">WEBSOCKET FULL-DUPLEX</div>
          <p className="mt-1 text-xs text-slate-400">
            Bắn tọa độ về bản đồ chỉ huy 1-giây/lần, tự động phát hiện di chuyển/dừng đỗ.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-slate-950/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-amber-300">
            <span className="font-mono text-xs">LỊCH SỬ LỘ TRÌNH</span>
            <Gauge className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 font-mono font-bold text-lg text-white">POLYLINE PLAYBACK</div>
          <p className="mt-1 text-xs text-slate-400">
            Tua lại hành trình trong ngày, giám sát vận tốc và mức pin thiết bị.
          </p>
        </div>
      </div>
    </div>
  );
}
