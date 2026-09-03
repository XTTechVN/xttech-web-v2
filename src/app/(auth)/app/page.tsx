'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, } from 'motion/react';
import { ArrowUpRight, Layers, Cpu, BarChart3, Briefcase, Radio, Zap, Users, Compass, Lock, TrendingUp, RotateCcw, } from 'lucide-react'; import { CinematicScrollyStage, InteractiveLogo3D } from '@/components/landing-3d';
import { XTLogo } from '@/components';

// ==========================================
// 1. CON TRỎ CHUỘT TƯƠNG TÁC SIÊU TỐC (ZERO DELAY)
// ==========================================
function CyberCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    let mouseX = -100;
    let mouseY = -100;
    let cursorX = -100;
    let cursorY = -100;
    let isHovered = false;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

      const target = e.target as HTMLElement;
      if (target?.closest('button, a, input, [data-cursor-hover]')) {
        if (!isHovered) {
          isHovered = true;
          cursor.classList.add('cursor-active');
        }
      } else {
        if (isHovered) {
          isHovered = false;
          cursor.classList.remove('cursor-active');
        }
      }
    };

    const updateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.35;
      cursorY += (mouseY - cursorY) * 0.35;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      animId = requestAnimationFrame(updateCursor);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    animId = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-50 h-7 w-7 rounded-full border border-cyan-400/80 transition-[width,height,background-color,box-shadow] duration-150 ease-out hidden md:block will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-50 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#06b6d4] hidden md:block will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />
      <style jsx global>{`
        .cursor-active {
          width: 54px !important;
          height: 54px !important;
          background-color: rgba(6, 182, 212, 0.15) !important;
          backdrop-filter: blur(2px);
          box-shadow: 0 0 25px rgba(6, 182, 212, 0.5) !important;
        }
      `}</style>
    </>
  );
}

// ==========================================
// 2. KHÔNG GIAN SAO 3D NỀN (TỐI ƯU 120 FPS)
// ==========================================
function Fullscreen3DBackground({ scrollYProgress }: { scrollYProgress: any }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const nodeCount = 70;
    const nodes = Array.from({ length: nodeCount }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 260 + Math.random() * 90;
      return {
        x3d: radius * Math.sin(phi) * Math.cos(theta),
        y3d: radius * Math.sin(phi) * Math.sin(theta),
        z3d: radius * Math.cos(phi),
        baseRadius: Math.random() * 2 + 1,
        color: Math.random() > 0.4 ? '#06b6d4' : '#8b5cf6',
      };
    });

    let rotX = 0;
    let rotY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const cx = width / 2;
      const cy = height / 2;
      targetRotY = ((e.clientX - cx) / cx) * 0.35;
      targetRotX = ((e.clientY - cy) / cy) * 0.35;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const maxDistSq = 130 * 130;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      rotX += (targetRotX - rotX) * 0.12 + 0.0008;
      rotY += (targetRotY - rotY) * 0.12 + 0.0015;

      const fov = 480;
      const centerX = width / 2;
      const centerY = height / 2;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const projected: Array<{ x: number; y: number; z: number; r: number; color: string }> = [];

      for (let i = 0; i < nodeCount; i++) {
        const n = nodes[i];
        const x1 = n.x3d * cosY - n.z3d * sinY;
        const z1 = n.z3d * cosY + n.x3d * sinY;

        const y2 = n.y3d * cosX - z1 * sinX;
        const z2 = z1 * cosX + n.y3d * sinX;

        const depth = z2 + 500;
        if (depth > 0) {
          const scale = fov / depth;
          projected.push({
            x: centerX + x1 * scale,
            y: centerY + y2 * scale,
            z: depth,
            r: n.baseRadius * scale,
            color: n.color,
          });
        }
      }

      const pLen = projected.length;
      ctx.lineWidth = 0.8;
      for (let i = 0; i < pLen; i++) {
        const p1 = projected[i];
        for (let j = i + 1; j < pLen; j++) {
          const p2 = projected[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const alpha = (1 - distSq / maxDistSq) * 0.28;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < pLen; i++) {
        const p = projected[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.r), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  const canvasOpacity = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [0.8, 0.5, 0.6, 0.4]);
  const canvasScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <motion.canvas
      ref={canvasRef}
      style={{ opacity: canvasOpacity, scale: canvasScale }}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full will-change-transform"
    />
  );
}

// ==========================================
// 3. THẺ KÍNH NGHIÊNG 3D PHẢN HỒI TỨC THÌ
// ==========================================
function GlassTiltCard({
  children,
  className = '',
  glowColor = '#06b6d4',
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -16;
    const rotateY = ((x / rect.width) - 0.5) * 16;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-[2rem] border border-white/10 bg-slate-950/50 p-8 backdrop-blur-2xl transition-transform duration-100 ease-out hover:border-white/25 will-change-transform ${className}`}
      style={{
        boxShadow: `0 10px 30px -10px ${glowColor}25`,
        transformStyle: 'preserve-3d',
      }}
    >
      <div style={{ transform: 'translateZ(25px)' }}>{children}</div>
    </div>
  );
}

// ==========================================
// 4. MÔ HÌNH 3D THÁP KÍNH KIẾN TRÚC ERP (TIẾNG VIỆT HOÀN TOÀN)
// ==========================================
const ERP_TOWER_FLOORS = [
  {
    floor: '05',
    title: 'BÁO CÁO BI & ĐIỀU HÀNH',
    sub: 'Excel 2 bảng động • Phân tích doanh thu',
    color: '#38bdf8',
    icon: '📊',
    yBase: -100,
  },
  {
    floor: '04',
    title: 'BÁO GIÁ & DÒNG TIỀN',
    sub: 'Báo giá đa cấp • Quản trị lợi nhuận realtime',
    color: '#10b981',
    icon: '💰',
    yBase: -50,
  },
  {
    floor: '03',
    title: 'LÕI ĐIỀU HÀNH TRUNG TÂM',
    sub: 'Đồng bộ API tốc độ cao • Dữ liệu đám mây',
    color: '#06b6d4',
    icon: '⚡',
    yBase: 0,
  },
  {
    floor: '02',
    title: 'SẢN XUẤT NHÔM KÍNH (BOM)',
    sub: 'Định mức cắt phôi • Quản lý tồn kho vật tư',
    color: '#a855f7',
    icon: '🏭',
    yBase: 50,
  },
  {
    floor: '01',
    title: 'NHÂN SỰ & CHẤM CÔNG GPS',
    sub: 'Định vị GPS chuẩn • Khóa ca • Duyệt giải trình',
    color: '#f59e0b',
    icon: '📍',
    yBase: 100,
  },
];

function Clean3DErpMonolith() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });
  const rotXRef = useRef(0.28);
  const rotYRef = useRef(-0.55);
  const [isExploded, setIsExploded] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(2);
  const explodeProgress = useRef(1.0);

  const resetView = () => {
    rotXRef.current = 0.28;
    rotYRef.current = -0.55;
    setIsExploded(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMousePos.current.x;
      const dy = e.clientY - prevMousePos.current.y;
      rotYRef.current += dx * 0.009;
      rotXRef.current += dy * 0.009;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        prevMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMousePos.current.x;
      const dy = e.touches[0].clientY - prevMousePos.current.y;
      rotYRef.current += dx * 0.009;
      rotXRef.current += dy * 0.009;
      prevMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dpr = window.devicePixelRatio || 1;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const fov = 540;

      if (!isDraggingRef.current) {
        rotYRef.current += 0.0025;
      }

      const targetExp = isExploded ? 1.7 : 1.0;
      explodeProgress.current += (targetExp - explodeProgress.current) * 0.12;

      const rotX = rotXRef.current;
      const rotY = rotYRef.current;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const project3D = (x: number, y: number, z: number) => {
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        const depth = z2 + 580;
        const scale = (fov / Math.max(10, depth)) * dpr;
        return { x: cx + x1 * scale, y: cy + y2 * scale, z: depth, scale };
      };

      // 1. Mặt sàn 3D
      const groundSize = 140;
      const groundCorners = [
        project3D(-groundSize, 145 * explodeProgress.current, -groundSize),
        project3D(groundSize, 145 * explodeProgress.current, -groundSize),
        project3D(groundSize, 145 * explodeProgress.current, groundSize),
        project3D(-groundSize, 145 * explodeProgress.current, groundSize),
      ];

      ctx.fillStyle = 'rgba(6, 182, 212, 0.04)';
      ctx.beginPath();
      ctx.moveTo(groundCorners[0].x, groundCorners[0].y);
      groundCorners.forEach((c) => ctx.lineTo(c.x, c.y));
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();

      // 2. Vẽ 5 Khối Kính Kiến Trúc
      const prismWidth = 85;
      const prismDepth = 85;
      const floorHeight = 16;

      ERP_TOWER_FLOORS.forEach((floor, idx) => {
        const isSelected = selectedFloor === idx;
        const yCenter = floor.yBase * explodeProgress.current;
        const yTop = yCenter - floorHeight / 2;
        const yBtm = yCenter + floorHeight / 2;

        const w = isSelected ? prismWidth * 1.08 : prismWidth;
        const d = isSelected ? prismDepth * 1.08 : prismDepth;

        const topFace = [
          project3D(-w, yTop, -d),
          project3D(w, yTop, -d),
          project3D(w, yTop, d),
          project3D(-w, yTop, d),
        ];

        const btmFace = [
          project3D(-w, yBtm, -d),
          project3D(w, yBtm, -d),
          project3D(w, yBtm, d),
          project3D(-w, yBtm, d),
        ];

        // Mặt kính trên
        ctx.fillStyle = isSelected ? `${floor.color}40` : 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.moveTo(topFace[0].x, topFace[0].y);
        topFace.forEach((pt) => ctx.lineTo(pt.x, pt.y));
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#ffffff' : floor.color;
        ctx.lineWidth = (isSelected ? 2 : 1.2) * dpr;
        ctx.stroke();

        // Viền đứng
        for (let v = 0; v < 4; v++) {
          ctx.beginPath();
          ctx.moveTo(topFace[v].x, topFace[v].y);
          ctx.lineTo(btmFace[v].x, btmFace[v].y);
          ctx.strokeStyle = floor.color;
          ctx.lineWidth = 1 * dpr;
          ctx.stroke();
        }

        // Mặt kính dưới
        ctx.beginPath();
        ctx.moveTo(btmFace[0].x, btmFace[0].y);
        btmFace.forEach((pt) => ctx.lineTo(pt.x, pt.y));
        ctx.closePath();
        ctx.stroke();

        // Điểm phát quang trung tâm
        const centerTop = project3D(0, yTop, 0);
        ctx.beginPath();
        ctx.arc(centerTop.x, centerTop.y, (isSelected ? 5 : 3) * dpr, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Nhãn phân hệ tiếng Việt
        const labelPos = project3D(w + 25, yCenter, 0);
        ctx.font = `bold ${Math.floor(10.5 * dpr)}px monospace`;
        ctx.fillStyle = isSelected ? '#ffffff' : floor.color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`[ ${floor.floor} ] ${floor.icon} ${floor.title}`, labelPos.x, labelPos.y - 6 * dpr);

        ctx.font = `${Math.floor(8.5 * dpr)}px monospace`;
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(floor.sub, labelPos.x, labelPos.y + 8 * dpr);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      cancelAnimationFrame(animId);
    };
  }, [isExploded, selectedFloor]);

  return (
    <div className="relative h-[560px] w-full overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-slate-900/90 via-black to-slate-950">
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
      />

      {/* Nút điều khiển HUD */}
      <div className="absolute top-6 left-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setIsExploded(!isExploded)}
          className={`flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-xs font-semibold backdrop-blur-xl transition-all duration-200 ${
            isExploded
              ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
              : 'border-white/10 bg-slate-950/70 text-slate-400 hover:border-white/30 hover:text-white'
          }`}
        >
          <Layers className="h-3.5 w-3.5 text-cyan-400" />
          <span>{isExploded ? 'GỘP TẦNG KIẾN TRÚC' : 'BÓC TÁCH TẦNG 3D'}</span>
        </button>

        <button
          onClick={resetView}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/70 px-3.5 py-1.5 font-mono text-xs font-semibold text-slate-400 backdrop-blur-xl hover:border-white/30 hover:text-white transition-all"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>ĐẶT LẠI GÓC NHÌN</span>
        </button>
      </div>

      {/* Thanh chọn 5 tầng kiến trúc */}
      <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {ERP_TOWER_FLOORS.map((floor, idx) => (
            <button
              key={floor.floor}
              onClick={() => setSelectedFloor(idx)}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs backdrop-blur-xl transition-all duration-200 ${
                selectedFloor === idx
                  ? 'border-cyan-400 bg-cyan-400/20 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'border-white/10 bg-slate-950/70 text-slate-400 hover:border-white/20'
              }`}
            >
              <span>{floor.icon}</span>
              <span className="font-bold">TẦNG {floor.floor}</span>
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-slate-400">
          <span>[ GIỮ CHUỘT ĐỂ XOAY 360° ]</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. DANH SÁCH 5 TRỤ CỘT KIẾN TRÚC
// ==========================================
const PILLARS = [
  {
    num: '01',
    category: 'QUẢN TRỊ NHÂN SỰ & CHẤM CÔNG GPS',
    title: 'Quản trị Nhân sự & Chấm công Thông minh',
    desc: 'Hệ thống định vị GPS chống giả mạo vị trí, tự động nhận diện ca hành chính / linh hoạt, giới hạn 1 lần chấm công/ca chuẩn xác và xử lý đơn giải trình công tức thì.',
    icon: Users,
    tags: ['Xác thực GPS', 'Khóa ca chuẩn', 'Nhận diện AI'],
    glow: '#06b6d4',
  },
  {
    num: '02',
    category: 'ĐIỀU PHỐI SẢN XUẤT NHÔM KÍNH',
    title: 'Điều phối Dự án & Sản xuất Nhôm Kính',
    desc: 'Bóc tách khối lượng định mức hệ nhôm kính tự động, quản lý vòng đời sản xuất từ khảo sát hiện trường, cắt phôi, lắp ráp đến bàn giao công trình.',
    icon: Layers,
    tags: ['Định mức BOM', 'Tiến độ Gantt', 'Cắt phôi tự động'],
    glow: '#8b5cf6',
  },
  {
    num: '03',
    category: 'BÁO GIÁ ĐA CẤP & TÀI CHÍNH',
    title: 'Tự động Hoá Báo giá & Quản trị Dòng tiền',
    desc: 'Thiết lập báo giá đa cấp linh hoạt theo từng biên độ lợi nhuận, chiết khấu và vật tư phụ kiện. Kiểm soát công nợ, doanh thu và chi phí theo thời gian thực.',
    icon: BarChart3,
    tags: ['Giá linh hoạt', 'Biên lợi nhuận', 'Báo giá đa cấp'],
    glow: '#10b981',
  },
  {
    num: '04',
    category: 'QUẢN TRỊ QUAN HỆ KHÁCH HÀNG CRM',
    title: 'Quản lý Khách hàng & Nhật ký Tương tác',
    desc: 'Lưu vết đa kênh (Gọi điện, Zalo, Gặp mặt, Email), phân loại khách hàng tiềm năng thông minh và tự động lên lịch chăm sóc định kỳ cho đội ngũ kinh doanh.',
    icon: Briefcase,
    tags: ['Đánh giá tiềm năng', 'Nhắc lịch tự động', 'Lịch sử tương tác'],
    glow: '#f59e0b',
  },
  {
    num: '05',
    category: 'BÁO CÁO ĐIỀU HÀNH & XUẤT EXCEL 2 BẢNG',
    title: 'Báo cáo Điều hành & Trí tuệ Doanh nghiệp (BI)',
    desc: 'Xuất báo cáo chi tiết chuẩn Excel gồm 2 bảng nghiệp vụ (Bảng công việc & Bảng thanh toán lương có công thức tính động), biểu đồ trực quan hỗ trợ ra quyết định.',
    icon: Cpu,
    tags: ['Động cơ 2 bảng', 'Công thức động', 'Biểu đồ trực quan'],
    glow: '#38bdf8',
  },
];

const FEATURES_GRID = [
  {
    icon: Users,
    title: 'Chấm Công GPS & Phân Ca Tự Động',
    desc: 'Chặn trùng ca, kiểm soát vị trí thời gian thực, duyệt đơn giải trình tự động.',
    tag: 'NHÂN SỰ',
    glow: '#06b6d4',
  },
  {
    icon: Layers,
    title: 'Bóc Tách & Định Mức Nhôm Kính',
    desc: 'Tính toán tối ưu phôi nhôm, kính cường lực, phụ kiện giảm thiểu hao hụt.',
    tag: 'SẢN XUẤT',
    glow: '#a855f7',
  },
  {
    icon: TrendingUp,
    title: 'Báo Giá Thông Minh Đa Tầng',
    desc: 'Tự động tính giá vốn, chiết khấu, VAT và xuất file PDF/Excel gửi khách hàng.',
    tag: 'TÀI CHÍNH',
    glow: '#10b981',
  },
  {
    icon: Briefcase,
    title: 'Quản Trị Khách Hàng & CRM',
    desc: 'Theo dõi tiến độ phễu bán hàng, lịch sử chăm sóc và phân loại tiềm năng.',
    tag: 'KHÁCH HÀNG',
    glow: '#f59e0b',
  },
  {
    icon: BarChart3,
    title: 'Xuất Báo Cáo Excel 2 Bảng',
    desc: 'Tự động tổng hợp bảng công và thanh toán lương có công thức tính động.',
    tag: 'BÁO CÁO BI',
    glow: '#ec4899',
  },
  {
    icon: Lock,
    title: 'Bảo Mật & Phân Quyền RBAC',
    desc: 'Kiểm soát truy cập dữ liệu đa cấp theo đúng quyền hạn từng phòng ban.',
    tag: 'BẢO MẬT',
    glow: '#38bdf8',
  },
];

export default function LuxuryLandingPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const showcaseRef = useRef<HTMLDivElement | null>(null);
  const pillarsRef = useRef<HTMLDivElement | null>(null);
  const [activePillar, setActivePillar] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Hiệu ứng cuộn Hero Section
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(heroScroll, [0, 0.75], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 0.75], [1, 0.88]);
  const heroY = useTransform(heroScroll, [0, 0.75], [0, -100]);
  const heroBlur = useTransform(heroScroll, [0, 0.75], ['blur(0px)', 'blur(12px)']);

  // Hiệu ứng cuộn Showcase 3D
  const { scrollYProgress: showcaseScroll } = useScroll({
    target: showcaseRef,
    offset: ['start end', 'end start'],
  });
  const showcaseScale = useTransform(showcaseScroll, [0, 0.5, 1], [0.85, 1, 0.9]);
  const showcaseRotateX = useTransform(showcaseScroll, [0, 0.5], [15, 0]);
  const showcaseOpacity = useTransform(showcaseScroll, [0, 0.25, 0.8, 1], [0, 1, 1, 0.3]);

  // Tọa độ động theo cuộn trang
  const dynamicCoord = useTransform(
    scrollYProgress,
    [0, 1],
    ['21.0285° B, 105.8542° Đ', '21.0390° B, 105.8650° Đ']
  );
  const [coordText, setCoordText] = useState('21.0285° B, 105.8542° Đ');
  useEffect(() => {
    return dynamicCoord.on('change', (v) => setCoordText(v));
  }, [dynamicCoord]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full bg-[#030610] text-slate-100 font-sans selection:bg-cyan-500/40 selection:text-cyan-200"
    >
      <CyberCursor />
      <Fullscreen3DBackground scrollYProgress={smoothProgress} />

      {/* Ánh sáng nền tinh tế */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-600/10 blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] rounded-full bg-purple-700/10 blur-[180px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Thanh tiến trình cuộn trang */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 h-[3px] origin-left bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400 shadow-[0_0_15px_#06b6d4]"
        style={{ scaleX: smoothProgress }}
      />

      {/* ==========================================
          THANH ĐIỀU HƯỚNG TRÊN CÙNG
      ========================================== */}
      <header className="fixed top-6 left-0 right-0 z-40 px-6 md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-slate-950/70 px-6 py-3.5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950">
                <XTLogo className="h-5 w-5" variant="glossy" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-extrabold tracking-widest text-white uppercase">
                XTTech<span className="text-cyan-400">®</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">
                Hệ Thống ERP 2.4
              </span>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-xs font-mono tracking-wider text-slate-300 md:flex">
            <a href="#hero" className="transition-colors hover:text-cyan-400">[ 01 ] TỔNG QUAN</a>
            <a href="#cinematic-experience" className="transition-colors hover:text-cyan-400">[ 02 ] HÀNH TRÌNH 3D</a>
            <a href="#showcase-3d" className="transition-colors hover:text-cyan-400">[ 03 ] THÁP KIẾN TRÚC</a>
            <a href="#pillars" className="transition-colors hover:text-cyan-400">[ 04 ] 5 TRỤ CỘT</a>
            <a href="#features-grid" className="transition-colors hover:text-cyan-400">[ 05 ] NĂNG LỰC</a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 font-mono text-[11px] text-emerald-400 lg:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>HỆ THỐNG: TRỰC TUYẾN</span>
            </div>

            <Link
              href="/app/dashboard"
              className="group relative inline-flex items-center gap-2 rounded-full border border-cyan-400/50 bg-cyan-400/10 px-5 py-2 text-xs font-mono font-bold tracking-wider text-cyan-300 backdrop-blur-md transition-all duration-300 hover:border-cyan-300 hover:bg-cyan-400/25 hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]"
            >
              <span>VÀO HỆ THỐNG</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ==========================================
          1. HERO SECTION (PHẦN MỞ ĐẦU)
      ========================================== */}
      <section
        ref={heroRef}
        id="hero"
        className="relative z-10 flex min-h-screen flex-col justify-between px-6 pt-36 pb-12 md:px-16"
      >
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY, filter: heroBlur }}
          className="flex h-full flex-col justify-between flex-1"
        >
          {/* Tagline định vị */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <span className="text-cyan-400 font-bold">[ PHIÊN BẢN 2026 ]</span>
              <span>HỆ THỐNG QUẢN TRỊ DOANH NGHIỆP THẾ HỆ MỚI</span>
            </div>
            <div className="hidden sm:block text-right">
              <span>TỌA ĐỘ HỆ THỐNG: {coordText}</span>
            </div>
          </div>

          {/* Tiêu đề chính khổ lớn kết hợp Logo 3D xoay 360 độ tương tác */}
          <div className="my-auto py-8">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4 lg:col-span-7"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/40 px-4 py-1 font-mono text-xs text-cyan-300 backdrop-blur-xl">
                  <Radio className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
                  <span>TƯƠNG LAI CỦA VẬN HÀNH DOANH NGHIỆP SỐ</span>
                </div>

                <h1 className="text-4xl font-black uppercase tracking-tight text-white sm:text-6xl lg:text-8xl leading-[0.95]">
                  XTTECH <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-teal-200 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(6,182,212,0.45)]">
                    DOANH NGHIỆP
                  </span>
                </h1>

                <p className="max-w-xl text-sm text-slate-300 sm:text-base font-light leading-relaxed pt-2">
                  Nền tảng quản trị hợp nhất dành cho doanh nghiệp sản xuất, kỹ thuật và xây dựng. Kết nối toàn diện từ Nhân sự GPS, Sản xuất Nhôm Kính đến Báo giá & Báo cáo Tài chính theo thời gian thực.
                </p>

                {/* Hàng nút hành động */}
                <div className="pt-6 flex flex-wrap items-center gap-4">
                  <Link
                    href="/app/dashboard"
                    className="group relative inline-flex items-center gap-3 rounded-full bg-cyan-400 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all duration-300 hover:scale-105 hover:bg-cyan-300 hover:shadow-[0_0_50px_rgba(6,182,212,0.8)]"
                  >
                    <span>Truy cập Bảng Điều Khiển</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>

                  <a
                    href="#cinematic-experience"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-mono text-slate-200 backdrop-blur-xl transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white"
                  >
                    <Compass className="h-4 w-4 text-cyan-400" />
                    <span>KHÁM PHÁ HÀNH TRÌNH 3D</span>
                  </a>
                </div>
              </motion.div>

              {/* Cột phải: Logo 3D Tương tác xoay 360 độ */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="flex items-center justify-center lg:col-span-5"
              >
                <InteractiveLogo3D />
              </motion.div>
            </div>
          </div>

          {/* Thanh chân trang Hero */}
          <div className="flex flex-col gap-4 border-t border-white/10 pt-6 font-mono text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-6">
              <span className="animate-bounce">↓ [ CUỘN ĐỂ KHÁM PHÁ ]</span>
              <span>• ĐỘ TRỄ BẰNG 0</span>
              <span>• ĐIỆN TOÁN ĐÁM MÂY</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>SẴN SÀNG TƯƠNG TÁC 3D</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ==========================================
          DẢI BĂNG CHỮ CHẠY VÔ TẬN (TIẾNG VIỆT)
      ========================================== */}
      <div className="relative z-10 border-y border-white/10 bg-slate-950/80 py-4 backdrop-blur-xl overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-8 font-mono text-xs font-bold tracking-widest text-slate-300 uppercase px-4">
              <span>★ ĐỘNG CƠ ERP THỜI GIAN THỰC</span>
              <span className="text-cyan-400">/</span>
              <span>XÁC THỰC CHẤM CÔNG GPS</span>
              <span className="text-purple-400">/</span>
              <span>TỐI ƯU SẢN XUẤT NHÔM KÍNH</span>
              <span className="text-emerald-400">/</span>
              <span>BÁO CÁO TÀI CHÍNH 2 BẢNG EXCEL</span>
              <span className="text-cyan-400">/</span>
            </div>
          ))}
        </div>
      </div>

      {/* ==========================================
          HÀNH TRÌNH 3D SCROLLYTELLING GHIM TOÀN MÀN HÌNH (KIỂU GRIFLAN / SAFFRON)
      ========================================== */}
      <CinematicScrollyStage />

      {/* ==========================================
          2. MÔ HÌNH 3D KIẾN TRÚC PHA LÊ
      ========================================== */}
      <section
        ref={showcaseRef}
        id="showcase-3d"
        className="relative z-10 py-32 px-6 md:px-16 border-t border-white/10"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div
            style={{
              scale: showcaseScale,
              rotateX: showcaseRotateX,
              opacity: showcaseOpacity,
              transformPerspective: 1000,
            }}
            className="space-y-10"
          >
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <span className="font-mono text-xs font-bold tracking-widest text-cyan-400 uppercase">
                  [ 03 / KHỐI KIẾN TRÚC 3D PHA LÊ ]
                </span>
                <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-6xl uppercase">
                  Kiến Trúc Tầng{' '}
                  <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                    3D Pha Lê
                  </span>
                </h2>
              </div>
              <p className="max-w-md text-sm text-slate-400 font-light leading-relaxed">
                Mô hình tháp kính 3D thể hiện 5 tầng phân hệ lõi của hệ thống ERP XTTech với cơ chế bóc tách tầng mượt mà.
              </p>
            </div>

            {/* Khung kính 3D */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-cyan-500/30 bg-slate-950/80 p-2 backdrop-blur-2xl shadow-[0_0_80px_rgba(6,182,212,0.25)]">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-3 font-mono text-xs text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                  <span>MÔ_HÌNH_3D: HOẠT ĐỘNG</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">
                    [ BẤM NÚT BÓC TÁCH ĐỂ TÁCH RỜI 5 TẦNG KIẾN TRÚC ]
                  </span>
                  <div className="flex h-7 items-center rounded-lg border border-white/10 bg-white/5 px-3 font-mono text-xs text-cyan-300">
                    60 FPS
                  </div>
                </div>
              </div>

              {/* Component Tháp Kính 3D */}
              <Clean3DErpMonolith />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          3. 5 TRỤ CỘT KIẾN TRÚC PHÂN HỆ
      ========================================== */}
      <section
        ref={pillarsRef}
        id="pillars"
        className="relative z-10 py-32 px-6 md:px-16"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <span className="font-mono text-xs font-bold tracking-widest text-cyan-400 uppercase">
              [ 03 / CÁC TRỤ CỘT & PHÂN HỆ ]
            </span>
            <h2 className="mt-2 text-4xl font-extrabold uppercase tracking-tight text-white sm:text-6xl">
              Kiến Trúc Quản Trị{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Toàn Diện
              </span>
            </h2>
          </motion.div>

          <div className="grid gap-12 lg:grid-cols-12">
            {/* Cột trái: Nút chọn Tab */}
            <div className="space-y-4 lg:col-span-5">
              {PILLARS.map((pillar, idx) => {
                const isSelected = activePillar === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActivePillar(idx)}
                    className={`group relative flex w-full items-start gap-4 rounded-3xl border p-6 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-cyan-500/60 bg-gradient-to-r from-cyan-950/50 to-slate-900/60 shadow-[0_0_30px_rgba(6,182,212,0.25)]'
                        : 'border-white/5 bg-slate-950/30 hover:border-white/15 hover:bg-slate-900/40'
                    }`}
                  >
                    <span className="font-mono text-sm font-bold text-cyan-400 pt-0.5">
                      {pillar.num}
                    </span>
                    <div className="flex-1">
                      <div className="font-mono text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                        {pillar.category}
                      </div>
                      <div className="mt-1 text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {pillar.title}
                      </div>
                    </div>
                    <ArrowUpRight
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isSelected ? 'text-cyan-400 rotate-45' : 'text-slate-600 group-hover:text-slate-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Cột phải: Thẻ chi tiết phân hệ */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePillar}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="relative flex min-h-[460px] flex-col justify-between overflow-hidden rounded-[2.5rem] border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-slate-900/80 p-8 sm:p-12 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)]"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-6">
                      <span className="font-mono text-sm text-cyan-400 font-bold">
                        KIẾN TRÚC PHÂN HỆ #{PILLARS[activePillar].num}
                      </span>
                      <div className="flex gap-2">
                        {PILLARS[activePillar].tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <h3 className="mt-8 text-2xl sm:text-3xl font-extrabold text-white">
                      {PILLARS[activePillar].title}
                    </h3>
                    <p className="mt-4 text-base text-slate-300 leading-relaxed font-light">
                      {PILLARS[activePillar].desc}
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">API TỐC ĐỘ CAO 2.0</div>
                        <div className="text-[10px] font-mono text-slate-400">CƠ SỞ DỮ LIỆU BẤT ĐỒNG BỘ</div>
                      </div>
                    </div>

                    <Link
                      href="/app/dashboard"
                      className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-5 py-2.5 font-mono text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all"
                    >
                      <span>VÀO PHÂN HỆ</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          4. NĂNG LỰC CỐT LÕI (THẺ NGHIÊNG 3D)
      ========================================== */}
      <section id="features-grid" className="relative z-10 py-32 px-6 md:px-16">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <span className="font-mono text-xs font-bold tracking-widest text-cyan-400 uppercase">
              [ 04 / NĂNG LỰC CỐT LÕI ]
            </span>
            <h2 className="mt-2 text-4xl font-extrabold uppercase tracking-tight text-white sm:text-6xl">
              Tính Năng Đột Phá
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES_GRID.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx}>
                  <GlassTiltCard glowColor={feat.glow} className="h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10"
                          style={{ backgroundColor: `${feat.glow}15`, color: feat.glow }}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] font-semibold text-slate-300 uppercase">
                          {feat.tag}
                        </span>
                      </div>

                      <h4 className="text-xl font-bold text-white mb-2">{feat.title}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed font-light">{feat.desc}</p>
                    </div>

                    <div className="mt-6 flex items-center gap-1.5 font-mono text-xs font-semibold text-cyan-400">
                      <span>KHÁM PHÁ PHÂN HỆ</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </GlassTiltCard>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==========================================
          5. HIỆU NĂNG VẬN HÀNH
      ========================================== */}
      <section id="metrics" className="relative z-10 py-32 px-6 md:px-16 border-t border-white/10 bg-slate-950/60">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { val: '99.99%', title: 'ĐỘ KHẢ DỤNG UPTIME', desc: 'Đảm bảo hoạt động liên tục 24/7 trên cụm máy chủ đám mây.' },
              { val: '0.05s', title: 'TỐC ĐỘ XỬ LÝ', desc: 'Tốc độ truy xuất và tính toán định mức nhôm kính siêu tốc.' },
              { val: '100%', title: 'CHÍNH XÁC GPS', desc: 'Xác thực toạ độ chống gian lận vị trí và khoá ca chuẩn xác.' },
              { val: '2 BẢNG', title: 'XUẤT EXCEL TỰ ĐỘNG', desc: 'Sinh báo cáo bảng công việc & thanh toán lương tự động.' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/30 p-8 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:bg-slate-900/60"
              >
                <div>
                  <div className="font-mono text-xs text-cyan-400 font-bold">{stat.title}</div>
                  <div className="mt-3 text-4xl sm:text-5xl font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                    {stat.val}
                  </div>
                </div>
                <p className="mt-6 text-xs text-slate-400 leading-relaxed font-light">
                  {stat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          6. KHỐI KÊU GỌI HÀNH ĐỘNG CUỐI TRANG
      ========================================== */}
      <section className="relative z-10 py-36 px-6 md:px-16 text-center">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[3rem] border border-cyan-500/40 bg-gradient-to-b from-cyan-950/40 via-slate-950/90 to-purple-950/40 p-12 md:p-20 backdrop-blur-3xl shadow-[0_0_100px_rgba(6,182,212,0.25)]"
          >
            <span className="font-mono text-xs font-bold tracking-widest text-cyan-400 uppercase">
              [ SẴN SÀNG TĂNG TRƯỞNG DOANH NGHIỆP ]
            </span>

            <h2 className="mt-4 text-4xl font-black uppercase tracking-tight text-white sm:text-6xl lg:text-7xl">
              Bắt Đầu Trải Nghiệm <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                XTTech ERP
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-base text-slate-300 font-light leading-relaxed">
              Mở cánh cửa đến tương lai quản trị kỹ thuật số với hiệu suất tối ưu và độ chính xác tuyệt đối.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/app/dashboard"
                className="group inline-flex items-center gap-3 rounded-full bg-cyan-400 px-9 py-4 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all duration-300 hover:scale-105 hover:bg-cyan-300 hover:shadow-[0_0_60px_rgba(6,182,212,0.9)]"
              >
                <span>VÀO BẢNG ĐIỀU KHIỂN</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          CHÂN TRANG (FOOTER)
      ========================================== */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950 py-12 px-6 md:px-16 font-mono text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white">HỆ ĐIỀU HÀNH DOANH NGHIỆP XTTECH</span>
            <span>• © 2026 BẢN QUYỀN THUỘC VỀ XTTECH.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#hero" className="transition-colors hover:text-cyan-400">LÊN ĐẦU TRANG ↑</a>
            <a href="#pillars" className="transition-colors hover:text-cyan-400">TRỤ CỘT</a>
            <Link href="/app/dashboard" className="transition-colors hover:text-cyan-400">BẢNG ĐIỀU KHIỂN</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
