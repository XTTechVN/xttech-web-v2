'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Shield, Cpu } from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export function InteractiveLogo3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isInteractingRef = useRef(false);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const rotRef = useRef({ x: 0.35, y: -0.45, vx: 0.002, vy: 0.007 });
  const [themeColor, setThemeColor] = useState<'cyan' | 'gold'>('cyan');

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

    // =========================================================================
    // DỰNG MÔ HÌNH 3D BÁNH RĂNG CÔNG NGHỆ XTTECH (EXTRUDED 3D GEAR EMBLEM)
    // =========================================================================
    const teethCount = 8; // 8 răng cơ khí chuẩn biểu trưng XTTech
    const rOuter = 82;   // Bán kính đỉnh răng
    const rInner = 64;   // Bán kính đáy răng
    const rHole = 42;    // Bán kính khoét rỗng vành trong
    const rHub = 22;     // Bán kính trục tâm
    const depth = 16;    // Độ dày 3D (Z-depth)

    // Tạo các điểm 2D trên mặt phẳng của bánh răng
    const gearContour2D: { x: number; y: number }[] = [];
    const step = (Math.PI * 2) / teethCount;

    for (let i = 0; i < teethCount; i++) {
      const a0 = i * step;
      const a1 = a0 + step * 0.28;
      const a2 = a0 + step * 0.42;
      const a3 = a0 + step * 0.72;
      const a4 = a0 + step * 0.86;

      // Đáy răng trước
      gearContour2D.push({ x: Math.cos(a0) * rInner, y: Math.sin(a0) * rInner });
      // Sườn dốc lên đỉnh
      gearContour2D.push({ x: Math.cos(a1) * rOuter, y: Math.sin(a1) * rOuter });
      // Đỉnh răng bằng
      gearContour2D.push({ x: Math.cos(a2) * rOuter, y: Math.sin(a2) * rOuter });
      // Sườn dốc xuống đáy
      gearContour2D.push({ x: Math.cos(a3) * rInner, y: Math.sin(a3) * rInner });
      // Đáy răng sau
      gearContour2D.push({ x: Math.cos(a4) * rInner, y: Math.sin(a4) * rInner });
    }

    // Đùn 3D: Mặt trước (z = +depth) và Mặt sau (z = -depth)
    const frontContour3D: Point3D[] = gearContour2D.map((p) => ({ x: p.x, y: p.y, z: depth }));
    const backContour3D: Point3D[] = gearContour2D.map((p) => ({ x: p.x, y: p.y, z: -depth }));

    // Tương tác chuột
    const onPointerDown = (e: MouseEvent) => {
      isInteractingRef.current = true;
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: MouseEvent) => {
      if (!isInteractingRef.current) return;
      const dx = e.clientX - mousePosRef.current.x;
      const dy = e.clientY - mousePosRef.current.y;
      rotRef.current.y += dx * 0.008;
      rotRef.current.x += dy * 0.008;
      rotRef.current.vx = dy * 0.0006;
      rotRef.current.vy = dx * 0.0006;
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isInteractingRef.current = false;
    };

    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);

    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick++;

      if (!isInteractingRef.current) {
        rotRef.current.x += rotRef.current.vx || 0.002;
        rotRef.current.y += rotRef.current.vy || 0.005;
      }

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const fov = 480;
      const scale = canvas.width / 480;

      const cosX = Math.cos(rotRef.current.x);
      const sinX = Math.sin(rotRef.current.x);
      const cosY = Math.cos(rotRef.current.y);
      const sinY = Math.sin(rotRef.current.y);

      // Chiếu 3D -> 2D kèm tính độ sâu Z
      const project = (p: Point3D) => {
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.x * sinY + p.z * cosY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        const depthZ = z2 + 320;
        const f = (fov / Math.max(depthZ, 40)) * scale;

        return { x: cx + x1 * f, y: cy + y2 * f, z: depthZ };
      };

      const frontProj = frontContour3D.map(project);
      const backProj = backContour3D.map(project);

      const isGold = themeColor === 'gold';
      const mainColor = isGold ? '#f59e0b' : '#38bdf8';
      const glowColor = isGold ? '#d97706' : '#0284c7';
      const sideFill = isGold ? 'rgba(180, 83, 9, 0.5)' : 'rgba(3, 105, 161, 0.45)';

      // 1. Vẽ các mặt cạnh 3D (Extrusion Side Polygons)
      const numPts = frontProj.length;
      for (let i = 0; i < numPts; i++) {
        const next = (i + 1) % numPts;
        const f1 = frontProj[i];
        const f2 = frontProj[next];
        const b1 = backProj[i];
        const b2 = backProj[next];

        // Tính pháp tuyến mặt để đổ bóng ánh kim (Backface culling / lighting)
        const cross = (f2.x - f1.x) * (b1.y - f1.y) - (f2.y - f1.y) * (b1.x - f1.x);
        if (cross < 0) {
          ctx.beginPath();
          ctx.moveTo(f1.x, f1.y);
          ctx.lineTo(f2.x, f2.y);
          ctx.lineTo(b2.x, b2.y);
          ctx.lineTo(b1.x, b1.y);
          ctx.closePath();
          ctx.fillStyle = sideFill;
          ctx.strokeStyle = mainColor;
          ctx.lineWidth = 1 * scale;
          ctx.fill();
          ctx.stroke();
        }
      }

      // 2. Vẽ Vành Mặt Trước Bánh Răng (Front Face Gear Rim)
      ctx.beginPath();
      frontProj.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();

      // Đổ bóng gradient phản xạ kim loại
      const grad = ctx.createLinearGradient(cx - 100, cy - 100, cx + 100, cy + 100);
      grad.addColorStop(0, isGold ? '#fbbf24' : '#7dd3fc');
      grad.addColorStop(0.5, isGold ? '#b45309' : '#0369a1');
      grad.addColorStop(1, isGold ? '#78350f' : '#082f49');

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8 * scale;
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 3. Khoét rỗng vành trong (Hollow Inner Ring)
      const holePoints: Point3D[] = [];
      const holeSegs = 24;
      for (let h = 0; h < holeSegs; h++) {
        const ha = (h * Math.PI * 2) / holeSegs;
        holePoints.push({ x: Math.cos(ha) * rHole, y: Math.sin(ha) * rHole, z: depth + 0.5 });
      }
      const holeProj = holePoints.map(project);

      ctx.beginPath();
      holeProj.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = '#030610';
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 2 * scale;
      ctx.fill();
      ctx.stroke();

      // 4. Các nan hoa trợ lực 4 hướng (4 Structural Spokes)
      const spokeAngles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];
      spokeAngles.forEach((sa) => {
        const p1 = project({ x: Math.cos(sa) * rHub, y: Math.sin(sa) * rHub, z: depth });
        const p2 = project({ x: Math.cos(sa) * rHole, y: Math.sin(sa) * rHole, z: depth });
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 3.5 * scale;
        ctx.stroke();
      });

      // 5. Trục tâm phát sáng (Central Hub with XT Monogram)
      const hubPoints: Point3D[] = [];
      for (let u = 0; u < 20; u++) {
        const ua = (u * Math.PI * 2) / 20;
        hubPoints.push({ x: Math.cos(ua) * rHub, y: Math.sin(ua) * rHub, z: depth + 2 });
      }
      const hubProj = hubPoints.map(project);

      ctx.beginPath();
      hubProj.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = isGold ? '#f59e0b' : '#0284c7';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 * scale;
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Khắc chữ XT lên trục tâm
      const centerProj = project({ x: 0, y: 0, z: depth + 3 });
      ctx.font = `900 ${Math.round(14 * scale)}px sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('XT', centerProj.x, centerProj.y);

      // 6. Vòng quỹ đạo ánh sáng công nghệ (Floating Holographic Rings)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tick * 0.006);
      ctx.beginPath();
      ctx.ellipse(0, 0, 140 * scale, 50 * scale, tick * 0.003, 0, Math.PI * 2);
      ctx.strokeStyle = isGold ? 'rgba(245, 158, 11, 0.3)' : 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      cancelAnimationFrame(animId);
    };
  }, [themeColor]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative h-[380px] w-full max-w-[440px] md:h-[460px]">
        <canvas
          ref={canvasRef}
          className="h-full w-full cursor-grab active:cursor-grabbing"
          title="Kéo chuột để xoay bánh răng 3D XTTech"
        />

        {/* HUD Chỉ Số Góc */}
        <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-cyan-500/30 bg-slate-950/70 px-3 py-1 font-mono text-xs text-cyan-300 backdrop-blur-md">
          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-cyan-400" />
          XTTECH 3D COG EMBLEM
        </div>

        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-amber-500/30 bg-slate-950/70 px-3 py-1 font-mono text-xs text-amber-300 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          INTERACTIVE 360°
        </div>
      </div>

      {/* Tùy chọn chất liệu mạ */}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setThemeColor('cyan')}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-xs transition-colors ${
            themeColor === 'cyan'
              ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
              : 'border-white/10 text-slate-400 hover:border-white/20'
          }`}
        >
          <Cpu className="h-3.5 w-3.5" />
          Titanium Cyan
        </button>

        <button
          type="button"
          onClick={() => setThemeColor('gold')}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-xs transition-colors ${
            themeColor === 'gold'
              ? 'border-amber-400 bg-amber-500/20 text-amber-200'
              : 'border-white/10 text-slate-400 hover:border-white/20'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          Royal Gold
        </button>
      </div>
    </div>
  );
}
