'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { ArrowUpRight, Radio, Shield, Activity, Zap, Lock, MapPin, Database, CheckCircle2, Users, Layers } from 'lucide-react';
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

  // Phân cảnh 2 (0.25 -> 0.55) - Concept 1: Datacenter & Vault
  const c2Opacity = useTransform(smoothProgress, [0.23, 0.29, 0.49, 0.55], [0, 1, 1, 0]);
  const c2Y = useTransform(smoothProgress, [0.23, 0.29, 0.49, 0.55], [40, 0, 0, -40]);

  // Phân cảnh 3 (0.55 -> 0.80) - Concept 2: Earth Globe GPS
  const c3Opacity = useTransform(smoothProgress, [0.53, 0.59, 0.74, 0.80], [0, 1, 1, 0]);
  const c3Y = useTransform(smoothProgress, [0.53, 0.59, 0.74, 0.80], [40, 0, 0, -40]);

  // Phân cảnh 4 (0.80 -> 1.00) - Concept 3: Matrix Staff Network
  const c4Opacity = useTransform(smoothProgress, [0.78, 0.84, 0.96, 1.0], [0, 1, 1, 1]);
  const c4Y = useTransform(smoothProgress, [0.78, 0.84], [40, 0]);

  // Xác định chapter hiện tại
  const activeChapter =
    currentProgress < 0.25 ? 1 : currentProgress < 0.55 ? 2 : currentProgress < 0.80 ? 3 : 4;

  return (
    <div
      ref={containerRef}
      id="cinematic-experience"
      className="relative h-[480vh] w-full bg-[#020714]"
    >
      {/* Khung nhìn ghim chặt toàn màn hình (Sticky Pinned Viewport) */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Lớp nền Three.js 3D WebGL Canvas (Tâm 3D nằm gọn ở nửa phải màn hình) */}
        <div className="absolute inset-0 z-0">
          <CinematicScrollyCanvas scrollProgress={currentProgress} />
        </div>

        {/* =========================================================================
            HỆ SINH THÁI NỀN KHÔNG GIAN MẠNG (CYBERSPACE MATRIX OVERLAY)
        ========================================================================= */}
        {/* 1. Luồng Cực Quang Số Cyber Aurora (Gradient Mesh mờ ảo sâu thẳm) */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-[650px] w-[650px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-[550px] w-[550px] rounded-full bg-indigo-600/15 blur-[150px]" />
        <div className="pointer-events-none absolute top-1/2 left-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/8 blur-[130px]" />

        {/* 2. Lưới Điểm Vi Mạch Điện Tử (Digital Circuit Dot Grid) */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:36px_36px]" />

        {/* 3. Tia Quét Laser Radar Không Gian Mạng (Cathode Scanline Beam) */}
        <div className="pointer-events-none absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent animate-scanline z-10 shadow-[0_0_12px_rgba(6,182,212,0.4)]" />

        {/* 4. Dải Tọa Độ & Mã Nhị Phân Biên Trái (Telemetry Border Stream) */}
        <div className="pointer-events-none absolute left-3 top-1/3 -translate-y-1/2 z-10 hidden xl:flex flex-col gap-2 font-mono text-[9px] text-cyan-500/25 tracking-widest select-none">
          <span>01001101</span>
          <span>LAT:16.05</span>
          <span>LON:108.2</span>
          <span>PING:1ms</span>
          <span>NET:SECURE</span>
          <span>SYS:ONLINE</span>
          <span>01010100</span>
        </div>

        {/* =========================================================================
            BỘ ĐIỀU HƯỚNG CHỈ MỤC BÊN PHẢI (SIDE CHAPTER INDICATOR - SAFFRON STYLE)
        ========================================================================= */}
        <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-6">
          {[
            { num: '01', title: 'TỐI ƯU VẬT TƯ' },
            { num: '02', title: 'BẢO TOÀN DÒNG TIỀN' },
            { num: '03', title: 'QUẢN TRỊ TOÀN QUỐC' },
            { num: '04', title: 'HIỆU SUẤT ĐỘI NGŨ' },
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
            <span>[ LĂN CHUỘT ĐỂ KHÁM PHÁ DỰ ÁN ]</span>
          </div>
        </div>

        {/* =========================================================================
            BỐ CỤC ASYMMETRIC SPLIT-SCREEN: TOÀN BỘ TEXT NẰM Ở NỬA TRÁI (LEFT 40%)
            HOÀN TOÀN KHÔNG CHỒNG ĐÈ LÊN MÔ HÌNH 3D Ở NỬA PHẢI
        ========================================================================= */}

        {/* PHÂN CẢNH 1: CÔNG NGHỆ BÓC TÁCH & TỐI ƯU HÓA BIÊN LỢI NHUẬN */}
        <motion.div
          style={{ opacity: c1Opacity, y: c1Y }}
          className="pointer-events-none absolute inset-y-0 left-6 sm:left-12 lg:left-20 z-10 flex flex-col justify-center max-w-lg"
        >
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/40 px-3.5 py-1 font-mono text-xs text-cyan-300">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              <span>01 // GIẢI PHÁP CÔNG NGHỆ LÕI TIÊN PHONG</span>
            </div>

            <h2 className="mt-4 font-black text-3xl sm:text-5xl uppercase tracking-tight text-white leading-tight">
              Đột Phá Năng Suất <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-200 to-indigo-400 bg-clip-text text-transparent">
                Tối Ưu Chi Phí Vật Tư
              </span>
            </h2>

            <p className="mt-3 text-sm text-slate-300 font-light leading-relaxed">
              Giải quyết triệt để nỗi đau lớn nhất của ngành nhôm kính: Thuật toán tự động hóa bóc tách bản vẽ kỹ thuật CAD, trừ độ hở và xếp cây cắt nhôm chính xác, giảm thiểu phôi thừa từ 18% xuống dưới 1.5%, trực tiếp gia tăng biên lợi nhuận ròng cho doanh nghiệp.
            </p>

            <div className="mt-5 space-y-2 font-mono text-xs text-slate-300">
              <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                <span><strong>Tối Ưu Phôi Nhôm 98.5%:</strong> Tiết kiệm hàng trăm triệu đồng chi phí nguyên vật liệu mỗi tháng cho từng xưởng.</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                <span><strong>Tăng Tốc Báo Giá Gấp 10 Lần:</strong> Tự động xuất 2 bảng Excel chiết tính giá vốn và giá bán trong 30 giây.</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span><strong>Chuẩn Hóa Quy Trình:</strong> Loại bỏ hoàn toàn sai số thủ công, đồng bộ hóa dây chuyền sản xuất đồng loạt.</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            POP-UP THÔNG TIN KỸ THUẬT HỆ NHÔM SLIM COVER (HIỆN RA KHI LẮP RÁP XONG)
        ========================================================================= */}
        <AnimatePresence>
          {currentProgress >= 0.04 && currentProgress <= 0.23 && (
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="pointer-events-auto absolute right-6 sm:right-10 lg:right-16 bottom-14 z-30 w-80 sm:w-96 rounded-2xl border border-amber-500/40 bg-slate-950/85 p-5 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_30px_rgba(217,119,6,0.15)]"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] text-amber-300 font-semibold uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                  Hệ Cửa Kiến Trúc Cao Cấp
                </div>
                <span className="font-mono text-[10px] text-cyan-400 tracking-wider">XT-SLIM 2026</span>
              </div>

              <h3 className="font-black text-base sm:text-lg text-white tracking-wide uppercase leading-snug">
                PROFILE MẶT CẮT NHÔM SLIM COVER
              </h3>
              <p className="text-xs text-slate-300 font-light mt-1 mb-3">
                Hệ cửa lùa 3 ray treo siêu hẹp • 3 cánh kính cường lực lồng tầng giật cấp
              </p>

              <div className="space-y-1.5 border-t border-white/10 pt-2.5 mb-3.5 text-xs font-mono">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Bản nhôm nhìn thấy:</span>
                  <span className="font-bold text-amber-300">16 mm (Siêu mỏng)</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Xử lý bề mặt:</span>
                  <span className="font-bold text-slate-100">Champagne Metallic</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Hệ ray & Kính:</span>
                  <span className="font-bold text-cyan-300">3 Ray treo • Kính 8-10mm</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Thuật toán bóc tách:</span>
                  <span className="font-bold text-emerald-400">Sai số CAD &lt; 0.1mm</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
                <span className="font-mono text-[10px] text-slate-400">BẢO HÀNH 10 NĂM</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-mono text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Xem chi tiết <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PHÂN CẢNH 2: NỀN TẢNG ĐIỀU HÀNH & BẢO TOÀN DÒNG TIỀN DOANH NGHIỆP */}
        <motion.div
          style={{ opacity: c2Opacity, y: c2Y }}
          className="pointer-events-none absolute inset-y-0 left-6 sm:left-12 lg:left-20 z-10 flex flex-col justify-center max-w-lg"
        >
          <div className="rounded-3xl border border-amber-500/20 bg-slate-950/60 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/40 px-3.5 py-1 font-mono text-xs text-amber-300">
              <Shield className="h-3.5 w-3.5 text-amber-400" />
              <span>02 // QUẢN TRỊ TÀI CHÍNH & KIỂM SOÁT THẤT THOÁT</span>
            </div>

            <h2 className="mt-4 font-black text-3xl sm:text-5xl uppercase tracking-tight text-white leading-tight">
              Bảo Vệ Dòng Tiền <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
                Tự Động Hóa Vận Hành
              </span>
            </h2>

            <p className="mt-3 text-sm text-slate-300 font-light leading-relaxed">
              Đóng vai trò như chiếc két sắt kỹ thuật số của tổ chức: Giám sát minh bạch mọi dòng tiền thu - chi, công nợ dự án và lịch sử xuất nhập vật tư theo thời gian thực. Ngăn chặn triệt để thất thoát tài chính và bảo vệ tài sản dữ liệu cốt lõi.
            </p>

            <div className="mt-5 space-y-2 font-mono text-xs text-slate-300">
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/10 bg-amber-950/20 p-2.5">
                <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Chống Thất Thoát Tuyệt Đối:</strong> Phê duyệt thanh toán đa tầng, kiểm soát chặt chẽ từng đồng chi phí và dòng tiền hợp đồng.</span>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-purple-500/10 bg-purple-950/20 p-2.5">
                <Database className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Báo Cáo Quản Trị Tức Thì:</strong> Bức tranh tài chính và tiến độ thực tế, giúp ban lãnh đạo ra quyết định kinh doanh chuẩn xác.</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* PHÂN CẢNH 3: KHẢ NĂNG MỞ RỘNG QUY MÔ & PHỦ SÓNG TOÀN QUỐC */}
        <motion.div
          style={{ opacity: c3Opacity, y: c3Y }}
          className="pointer-events-none absolute inset-y-0 left-6 sm:left-12 lg:left-20 z-10 flex flex-col justify-center max-w-lg"
        >
          <div className="rounded-3xl border border-emerald-500/20 bg-slate-950/60 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-1 font-mono text-xs text-emerald-300">
              <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
              <span>03 // MỞ RỘNG THỊ TRƯỜNG & QUY MÔ DỰ ÁN</span>
            </div>

            <h2 className="mt-4 font-black text-3xl sm:text-5xl uppercase tracking-tight text-white leading-tight">
              Quản Trị Toàn Quốc <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-400 bg-clip-text text-transparent">
                Mở Rộng Không Giới Hạn
              </span>
            </h2>

            <p className="mt-3 text-sm text-slate-300 font-light leading-relaxed">
              Xóa nhòa khoảng cách địa lý: Cho phép một tổng công ty làm chủ hàng trăm công trình trải dài từ Bắc chí Nam trên cùng một màn hình chỉ huy. Định vị chính xác từng trạm thi công, sẵn sàng mở rộng quy mô thần tốc mà không cần phình to bộ máy quản lý.
            </p>

            <div className="mt-5 space-y-2 font-mono text-xs text-slate-300">
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/10 bg-emerald-950/20 p-2.5">
                <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Nhân Bản Quy Mô Thần Tốc:</strong> Dễ dàng mở rộng cho hàng chục nhà máy, đại lý và công trình vệ tinh trên toàn quốc.</span>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-cyan-500/10 bg-cyan-950/20 p-2.5">
                <Activity className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Định Vị Hiện Trường Tự Động:</strong> Chấm công và kiểm soát ca trực theo bán kính công trình thông minh, xóa bỏ 100% gian lận ngày công.</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* PHÂN CẢNH 4: TỐI ƯU HIỆU SUẤT ĐỘI NGŨ & BỨT PHÁ TĂNG TRƯỞNG */}
        <motion.div
          style={{ opacity: c4Opacity, y: c4Y }}
          className="pointer-events-none absolute inset-y-0 left-6 sm:left-12 lg:left-20 z-10 flex flex-col justify-center max-w-lg"
        >
          <div className="rounded-3xl border border-cyan-500/30 bg-slate-950/60 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_60px_rgba(6,182,212,0.2)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/40 px-3.5 py-1 font-mono text-xs text-cyan-300">
              <Users className="h-3.5 w-3.5 text-cyan-400" />
              <span>04 // TỐI ƯU NGUỒN LỰC & NĂNG SUẤT LAO ĐỘNG</span>
            </div>

            <h2 className="mt-4 font-black text-3xl sm:text-5xl uppercase tracking-tight text-white leading-tight">
              Kết Nối Đội Ngũ <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Tăng Tốc Bàn Giao Dự Án
              </span>
            </h2>

            <p className="mt-3 text-sm text-slate-300 font-light leading-relaxed">
              Chuyển đổi tổ chức thành một cỗ máy vận hành tinh gọn: Kết nối liền mạch từ kỹ sư văn phòng đến ban chỉ huy hiện trường. Nâng cao 40% hiệu suất làm việc thực tế, đảm bảo tiến độ bàn giao dự án và tối đa hóa chỉ số sinh lời trên vốn đầu tư (ROI).
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
              <div className="rounded-xl border border-white/5 bg-white/5 p-2.5">
                <span className="text-cyan-400 font-bold block">ĐIỀU PHỐI TINH GỌN</span>
                <span className="text-slate-400 text-[11px]">Tự động phân bổ nguồn lực & công việc</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-2.5">
                <span className="text-emerald-400 font-bold block">HIỆU SUẤT TỐI ĐA</span>
                <span className="text-slate-400 text-[11px]">Báo cáo tiến độ & năng suất tức thời</span>
              </div>
            </div>

            {/* Nút hành động trực tiếp */}
            <div className="pointer-events-auto mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/app/dashboard"
                className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-cyan-500 px-5 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_24px_rgba(6,182,212,0.5)] transition-all hover:bg-cyan-400"
              >
                <span>Tìm Hiểu Cơ Hội Đầu Tư</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/app/attendances"
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 font-sans text-xs font-semibold text-white backdrop-blur-md transition-all hover:border-cyan-400/50 hover:bg-white/10"
              >
                <Activity className="h-4 w-4 text-cyan-400" />
                <span>Xem Năng Lực Dự Án</span>
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
