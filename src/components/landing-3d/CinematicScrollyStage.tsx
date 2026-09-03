'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import Link from 'next/link';
import { ArrowUpRight, Radio, Shield, Cpu, Activity, Zap, Lock, MapPin, Database, CheckCircle2 } from 'lucide-react';
import { CinematicScrollyCanvas } from './CinematicScrollyCanvas';

export function CinematicScrollyStage() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Theo dõi tiến trình cuộn qua container dài 480vh
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Tạo lực quán tính mượt mà (Inertia Smooth Glide) giống Lenis Scroll
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 65,
    damping: 26,
    restDelta: 0.001,
  });

  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    return smoothProgress.on('change', (val) => {
      setCurrentProgress(val);
    });
  }, [smoothProgress]);

  // Độ mờ và độ trượt của từng phân cảnh
  // Phân cảnh 1 (0.00 -> 0.25)
  const c1Opacity = useTransform(smoothProgress, [0, 0.05, 0.18, 0.25], [1, 1, 1, 0]);
  const c1Y = useTransform(smoothProgress, [0, 0.25], [0, -40]);

  // Phân cảnh 2 (0.25 -> 0.55) - Concept 1: Server Vault
  const c2Opacity = useTransform(smoothProgress, [0.23, 0.29, 0.49, 0.55], [0, 1, 1, 0]);
  const c2Y = useTransform(smoothProgress, [0.23, 0.29, 0.49, 0.55], [40, 0, 0, -40]);

  // Phân cảnh 3 (0.55 -> 0.80) - Concept 2: Command Bunker
  const c3Opacity = useTransform(smoothProgress, [0.53, 0.59, 0.74, 0.80], [0, 1, 1, 0]);
  const c3Y = useTransform(smoothProgress, [0.53, 0.59, 0.74, 0.80], [40, 0, 0, -40]);

  // Phân cảnh 4 (0.80 -> 1.00) - Concept 3: Reactor Core
  const c4Opacity = useTransform(smoothProgress, [0.78, 0.84, 0.96, 1.0], [0, 1, 1, 1]);
  const c4Y = useTransform(smoothProgress, [0.78, 0.84], [40, 0]);

  // Xác định chapter hiện tại
  const activeChapter =
    currentProgress < 0.25 ? 1 : currentProgress < 0.55 ? 2 : currentProgress < 0.80 ? 3 : 4;

  return (
    <div
      ref={containerRef}
      id="cinematic-experience"
      className="relative h-[480vh] w-full bg-[#020617]"
    >
      {/* Khung nhìn ghim chặt toàn màn hình (Sticky Pinned Viewport) */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Lớp nền Three.js 3D WebGL Canvas */}
        <div className="absolute inset-0 z-0">
          <CinematicScrollyCanvas scrollProgress={currentProgress} />
        </div>

        {/* Lớp phủ điện tử công nghệ */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px]" />

        {/* =========================================================================
            BỘ ĐIỀU HƯỚNG CHỈ MỤC BÊN PHẢI (SIDE CHAPTER INDICATOR)
        ========================================================================= */}
        <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-6">
          {[
            { num: '01', title: 'GEARS OF ENTERPRISE' },
            { num: '02', title: 'DATA CORE VAULT' },
            { num: '03', title: 'COMMAND BUNKER GPS' },
            { num: '04', title: 'REACTOR CORE ENGINE' },
          ].map((item, idx) => {
            const isActive = activeChapter === idx + 1;
            return (
              <div key={item.num} className="flex items-center gap-3 justify-end">
                <span
                  className={`font-mono text-[10px] tracking-widest uppercase transition-colors duration-300 ${
                    isActive ? 'text-cyan-400 font-bold' : 'text-slate-600'
                  }`}
                >
                  {item.title}
                </span>
                <div
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-cyan-400 shadow-[0_0_14px_#06b6d4] scale-125'
                      : 'border border-slate-800 bg-transparent'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            THANH ĐO TIẾN TRÌNH DƯỚI CÙNG (BOTTOM TELEMETRY BAR)
        ========================================================================= */}
        <div className="pointer-events-none absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between border-t border-white/10 pt-4 font-mono text-xs text-slate-400 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 animate-ping rounded-full bg-cyan-400" />
            <span className="text-cyan-300 font-semibold">XTTECH 3D WEBGL ENGINE: ONLINE</span>
          </div>
          <div className="hidden sm:block">
            <span>TIẾN TRÌNH KHÔNG GIAN: {Math.round(currentProgress * 100)}%</span>
          </div>
          <div>
            <span>[ LĂN CHUỘT ĐỂ KHÁM PHÁ 3 CONCEPT ]</span>
          </div>
        </div>

        {/* =========================================================================
            NỘI DUNG 3 CONCEPT TRÌNH DIỄN KÍNH MỜ (GLASSMORPHISM HUD OVERLAYS)
        ========================================================================= */}

        {/* PHÂN CẢNH 1: BÁNH RĂNG LOGO XTTECH */}
        <motion.div
          style={{ opacity: c1Opacity, y: c1Y }}
          className="pointer-events-none absolute inset-y-0 left-6 md:left-16 z-10 flex flex-col justify-center max-w-xl"
        >
          <div className="rounded-3xl border border-cyan-500/30 bg-slate-950/75 p-6 md:p-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/50 px-3.5 py-1 font-mono text-xs text-cyan-300">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              <span>01 // NỀN TẢNG ĐỒNG BỘ DOANH NGHIỆP</span>
            </div>
            <h1 className="mt-4 font-black text-3xl sm:text-5xl uppercase tracking-tight text-white leading-tight">
              Cỗ Máy Bánh Răng <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-200 to-indigo-400 bg-clip-text text-transparent">
                Vận Hành Số
              </span>
            </h1>
            <p className="mt-3 text-sm text-slate-300 font-light leading-relaxed">
              Biểu trưng bánh răng XTTech cơ khí đùn khối 3D. Mỗi nhịp xoay đồng bộ toàn bộ dòng chảy tài nguyên: từ nhân sự hiện trường, định mức nhôm kính đến báo cáo tài chính doanh nghiệp.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 font-mono text-xs text-slate-300">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Đồng Bộ Đa Chiều</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Chuẩn Hóa Quy Trình</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* PHÂN CẢNH 2: CONCEPT 1 - HẦM TRUNG TÂM DỮ LIỆU & CỬA HẦM BẢO MẬT */}
        <motion.div
          style={{ opacity: c2Opacity, y: c2Y }}
          className="pointer-events-none absolute inset-y-0 left-6 md:left-16 z-10 flex flex-col justify-center max-w-xl"
        >
          <div className="rounded-3xl border border-amber-500/30 bg-slate-950/75 p-6 md:p-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/50 px-3.5 py-1 font-mono text-xs text-amber-300">
              <Shield className="h-3.5 w-3.5 text-amber-400" />
              <span>CONCEPT 01 // HẦM TRUNG TÂM DỮ LIỆU</span>
            </div>
            <h2 className="mt-4 font-black text-3xl sm:text-5xl uppercase tracking-tight text-white leading-tight">
              Cửa Hầm Bảo Mật <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-red-400 bg-clip-text text-transparent">
                Cấp Ngân Hàng
              </span>
            </h2>
            <p className="mt-3 text-sm text-slate-300 font-light leading-relaxed">
              Camera trượt sâu vào đường hầm tủ Rack máy chủ với dải LED nhấp nháy hai bên. Cánh cửa Air-lock Vault cơ học 8 chốt xoay mở, bảo vệ tuyệt đối dữ liệu lương thưởng, nhân sự và tài liệu nội bộ.
            </p>
            <div className="mt-5 space-y-2.5 font-mono text-xs">
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-950/20 p-2.5 text-slate-300">
                <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>JWT Blacklist Tức Thì:</strong> Thu hồi phiên làm việc qua Redis khi nhân viên nghỉ việc hoặc đổi mật khẩu.</span>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-purple-500/20 bg-purple-950/20 p-2.5 text-slate-300">
                <Database className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Audit Trail Bất Biến:</strong> Ghi nhận vết lịch sử mọi thao tác sửa, xóa, duyệt đơn chống gian lận dữ liệu.</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* PHÂN CẢNH 3: CONCEPT 2 - PHÒNG CHỈ HUY TÁC CHIẾN GPS RADAR */}
        <motion.div
          style={{ opacity: c3Opacity, y: c3Y }}
          className="pointer-events-none absolute inset-y-0 right-6 md:right-16 z-10 flex flex-col justify-center max-w-xl text-left"
        >
          <div className="rounded-3xl border border-emerald-500/30 bg-slate-950/75 p-6 md:p-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/50 px-3.5 py-1 font-mono text-xs text-emerald-300">
              <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
              <span>CONCEPT 02 // PHÒNG CHỈ HUY TÁC CHIẾN</span>
            </div>
            <h2 className="mt-4 font-black text-3xl sm:text-5xl uppercase tracking-tight text-white leading-tight">
              Chỉ Huy Toàn Cảnh <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-400 bg-clip-text text-transparent">
                Hiện Trường GPS
              </span>
            </h2>
            <p className="mt-3 text-sm text-slate-300 font-light leading-relaxed">
              Boong-ke chỉ huy ngầm bừng sáng với Quả cầu Trái Đất 3D Hologram, tia quét sóng radar 360° và các chùm tia laser định vị trực tiếp các trạm công trình trên toàn quốc.
            </p>
            <div className="mt-5 space-y-2.5 font-mono text-xs">
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2.5 text-slate-300">
                <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Redis GEO Engine:</strong> Đo cự ly Haversine sai số &lt; 5m, tự động kiểm tra bán kính Geofence công trình.</span>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-2.5 text-slate-300">
                <Activity className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>WebSocket Full-Duplex:</strong> Đồng bộ tọa độ 1s/lần, nhận diện Di chuyển / Dừng đỗ và mức pin thiết bị.</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* PHÂN CẢNH 4: CONCEPT 3 - LÕI LÒ PHẢN ỨNG SỐ (THE ENGINE) */}
        <motion.div
          style={{ opacity: c4Opacity, y: c4Y }}
          className="pointer-events-none absolute inset-y-0 inset-x-6 md:inset-x-24 z-10 flex flex-col justify-center items-center text-center"
        >
          <div className="max-w-2xl rounded-3xl border border-cyan-500/40 bg-slate-950/80 p-8 md:p-10 backdrop-blur-2xl shadow-[0_0_80px_rgba(6,182,212,0.25)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/50 px-3.5 py-1 font-mono text-xs text-cyan-300">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              <span>CONCEPT 03 // LÕI LÒ PHẢN ỨNG NĂNG LƯỢNG SỐ</span>
            </div>
            <h2 className="mt-4 font-black text-3xl sm:text-6xl uppercase tracking-tight text-white leading-tight">
              Trái Tim Năng Lượng <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Tự Động Hóa Số
              </span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-300 font-light leading-relaxed">
              Khối cầu năng lượng Plasma 3D đập theo nhịp thở với hàng nghìn hạt dữ liệu từ các mắt xích bánh răng chảy dồn về tâm, tiếp sức mạnh tính toán tức thời cho toàn hệ sinh thái.
            </p>

            {/* Chi tiết thông số động cơ */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs text-left">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="text-cyan-400 font-bold block">FASTAPI ASYNC</span>
                <span className="text-slate-400 text-[11px]">100k req/s xử lý luồng song song</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="text-purple-400 font-bold block">CACHE PHÂN TẦNG</span>
                <span className="text-slate-400 text-[11px]">Query DB tối ưu &lt; 5ms</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="text-emerald-400 font-bold block">BOM NHÔM KÍNH</span>
                <span className="text-slate-400 text-[11px]">Loại trừ phôi dư và tính lãi tức thì</span>
              </div>
            </div>

            {/* Nút hành động trực tiếp */}
            <div className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/app/dashboard"
                className="group inline-flex items-center gap-2 rounded-full bg-cyan-400 px-8 py-4 font-mono text-xs font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all duration-300 hover:scale-105 hover:bg-cyan-300"
              >
                <span>VÀO BẢNG ĐIỀU HÀNH</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <Link
                href="/app/attendances/live-map"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-900/80 px-8 py-4 font-mono text-xs font-bold text-slate-200 backdrop-blur-xl transition-all hover:border-white/40 hover:bg-slate-800"
              >
                <Activity className="h-4 w-4 text-emerald-400" />
                <span>MỞ BẢN ĐỒ LIVE MAP GPS</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
