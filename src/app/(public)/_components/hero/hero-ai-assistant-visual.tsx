'use client';

import React from 'react';
import {
  Camera,
  Check,
  CheckCircle2,
  Cpu,
  FileCheck2,
  Mic,
  Radio,
  Scan,
  Sparkles,
  Volume2,
  Wand2,
  Zap,
} from 'lucide-react';

export const HeroAiAssistantVisual = () => {
  return (
    <div className="relative mx-auto w-full max-w-5xl select-none pt-4 pb-8">
      {/* ================= BACKGROUND GLOWS ================= */}
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-80 w-80 sm:h-96 sm:w-96 rounded-full bg-teal-500/15 blur-3xl" />
      <div className="pointer-events-none absolute top-20 left-1/4 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-20 right-1/4 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />

      {/* ================= SÂN KHẤU CÔNG NGHỆ CHÍNH: ROBOT AI + 2 FLOATING WIDGETS ================= */}
      <div className="relative mx-auto flex flex-col items-center justify-center">
        {/* Lớp hiển thị 3 cột trên Desktop: Widget Trái - Robot Giữa - Widget Phải */}
        <div className="grid w-full grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-4">
          {/* ================= WIDGET TRÁI: VOICE NOTE HIỆN TRƯỜNG ================= */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="group relative w-full max-w-xs rounded-2xl border border-teal-200/90 bg-white/95 p-4 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-teal-400 hover:shadow-2xl animate-float-slow">
              {/* Badge góc trên */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500 text-white shadow-xs">
                    <Mic className="h-4 w-4 animate-pulse" />
                  </span>
                  <span className="text-xs font-bold text-slate-900">Voice Note hiện trường</span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-200/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Đang ghi âm
                </span>
              </div>

              {/* Sóng âm thanh nhảy động (CSS Soundwave Animation) */}
              <div className="flex items-center justify-center gap-1.5 py-4">
                <span className="h-3 w-1 rounded-full bg-teal-400 animate-pulse" />
                <span className="h-6 w-1 rounded-full bg-teal-500 animate-pulse delay-75" />
                <span className="h-8 w-1 rounded-full bg-primary animate-pulse delay-150" />
                <span className="h-5 w-1 rounded-full bg-teal-400 animate-pulse delay-100" />
                <span className="h-9 w-1 rounded-full bg-primary animate-pulse delay-200" />
                <span className="h-4 w-1 rounded-full bg-teal-500 animate-pulse delay-75" />
                <span className="h-7 w-1 rounded-full bg-teal-400 animate-pulse delay-150" />
                <span className="h-3 w-1 rounded-full bg-teal-300 animate-pulse" />
              </div>

              {/* Nội dung giọng nói nhận diện */}
              <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700 border border-slate-200/60">
                <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Văn bản trích xuất:</span>
                <p className="font-semibold text-slate-900 italic">
                  &ldquo;Đã lắp hoàn thiện 4 bộ cửa nhôm lùa tầng 3, diện tích 45m²&rdquo;
                </p>
              </div>

              {/* Tag trạng thái */}
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-medium text-emerald-600 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Tự động gán vào Dự án #4
                </span>
                <span className="text-[10px] text-slate-400">0.4s</span>
              </div>
            </div>
          </div>

          {/* ================= TRUNG TÂM: ROBOT KỸ SƯ CÔNG TRÌNH 3D (CODE 100% SVG) ================= */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            <div className="relative flex flex-col items-center">
              {/* Vòng hào quang đa tầng xoay quanh robot */}
              <div className="absolute -inset-4 rounded-full border border-teal-300/40 animate-spin-slow opacity-60" />
              <div className="absolute -inset-8 rounded-full border border-dashed border-teal-400/30 opacity-40" />

              {/* KHUNG ROBOT KỸ SƯ CÔNG NGHỆ BẰNG SVG */}
              <div className="relative z-10 flex h-44 w-44 sm:h-52 sm:w-52 items-center justify-center">
                <svg
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-full w-full drop-shadow-[0_15px_30px_rgba(4,88,99,0.35)]"
                >
                  <defs>
                    {/* Gradient mũ bảo hộ vàng ấm */}
                    <linearGradient id="helmetGrad" x1="50" y1="20" x2="150" y2="70" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#fcd34d" />
                      <stop offset="0.5" stopColor="#f59e0b" />
                      <stop offset="1" stopColor="#d97706" />
                    </linearGradient>

                    {/* Gradient thân robot xám kim loại bóng bẩy */}
                    <linearGradient id="bodyGrad" x1="60" y1="120" x2="140" y2="185" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ffffff" />
                      <stop offset="0.5" stopColor="#e2e8f0" />
                      <stop offset="1" stopColor="#cbd5e1" />
                    </linearGradient>

                    {/* Gradient đầu robot bóng bẩy */}
                    <linearGradient id="headGrad" x1="60" y1="50" x2="140" y2="120" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ffffff" />
                      <stop offset="0.7" stopColor="#f1f5f9" />
                      <stop offset="1" stopColor="#cbd5e1" />
                    </linearGradient>

                    {/* Kính mắt công nghệ LED */}
                    <linearGradient id="visorGrad" x1="60" y1="75" x2="140" y2="105" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#0f172a" />
                      <stop offset="1" stopColor="#020617" />
                    </linearGradient>

                    {/* Đèn mắt LED xanh ngọc */}
                    <linearGradient id="eyeGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop stopColor="#2dd4bf" />
                      <stop offset="1" stopColor="#06b6d4" />
                    </linearGradient>

                    {/* Đĩa đệm phát sáng Hologram */}
                    <linearGradient id="pedestalGrad" x1="20" y1="170" x2="180" y2="195" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#045863" />
                      <stop offset="0.5" stopColor="#0d9488" />
                      <stop offset="1" stopColor="#045863" />
                    </linearGradient>
                  </defs>

                  {/* THÂN ROBOT */}
                  <ellipse cx="100" cy="155" rx="36" ry="28" fill="url(#bodyGrad)" stroke="#94a3b8" strokeWidth="2.5" />
                  {/* Ngực có đèn LED Chip AI */}
                  <circle cx="100" cy="152" r="8" fill="#045863" stroke="#2dd4bf" strokeWidth="2" />
                  <circle cx="100" cy="152" r="4" fill="#2dd4bf" className="animate-pulse" />

                  {/* TAI NGHE HEADPHONE 2 BÊN */}
                  <rect x="50" y="76" width="8" height="22" rx="4" fill="#045863" stroke="#2dd4bf" strokeWidth="1.5" />
                  <circle cx="54" cy="87" r="2.5" fill="#2dd4bf" className="animate-ping" />
                  <rect x="142" y="76" width="8" height="22" rx="4" fill="#045863" stroke="#2dd4bf" strokeWidth="1.5" />
                  <circle cx="146" cy="87" r="2.5" fill="#2dd4bf" className="animate-ping" />

                  {/* ĐẦU ROBOT */}
                  <rect
                    x="56"
                    y="52"
                    width="88"
                    height="68"
                    rx="34"
                    fill="url(#headGrad)"
                    stroke="#94a3b8"
                    strokeWidth="2.5"
                  />

                  {/* KÍNH MẮT CÔNG NGHỆ ĐEN BÓNG (VISOR) */}
                  <rect x="68" y="72" width="64" height="32" rx="16" fill="url(#visorGrad)" stroke="#334155" strokeWidth="1.5" />

                  {/* ĐÔI MẮT LED XANH NGỌC BIỂU CẢM VUI TƯƠI */}
                  {/* Mắt trái hình vòng cung tươi cười */}
                  <path
                    d="M 80 88 Q 87 80 94 88"
                    stroke="url(#eyeGrad)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    filter="drop-shadow(0 0 4px #2dd4bf)"
                  />
                  {/* Mắt phải hình vòng cung tươi cười */}
                  <path
                    d="M 106 88 Q 113 80 120 88"
                    stroke="url(#eyeGrad)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    filter="drop-shadow(0 0 4px #2dd4bf)"
                  />

                  {/* MŨ BẢO HỘ CÔNG TRÌNH VÀNG ÓNG */}
                  {/* Chóp mũ */}
                  <path
                    d="M 64 56 C 64 30 136 30 136 56 Z"
                    fill="url(#helmetGrad)"
                    stroke="#b45309"
                    strokeWidth="2"
                  />
                  {/* Sống gân giữa mũ kỹ sư */}
                  <path d="M 100 28 L 100 54" stroke="#fef3c7" strokeWidth="3.5" strokeLinecap="round" />
                  {/* Vành mũ bảo hộ cong tròn */}
                  <ellipse cx="100" cy="56" rx="46" ry="6" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
                  {/* Huy hiệu nhỏ trên mũ */}
                  <circle cx="100" cy="44" r="4.5" fill="#ffffff" stroke="#b45309" strokeWidth="1" />
                  <path d="M 98 44 L 102 44 M 100 42 L 100 46" stroke="#045863" strokeWidth="1" />
                </svg>
              </div>

              {/* BỆ ĐĨA HOLOGRAM PHÁT SÁNG BÊN DƯỚI */}
              <div className="relative -mt-6 flex flex-col items-center">
                {/* Đĩa đệm phát quang */}
                <div className="h-6 w-44 sm:w-56 rounded-full bg-linear-to-r from-teal-500/20 via-teal-400/40 to-teal-500/20 blur-xs" />
                <div className="relative -mt-4.5 rounded-full border border-teal-300/80 bg-linear-to-r from-[#045863] via-[#0d9488] to-[#045863] px-5 py-1.5 shadow-lg shadow-teal-500/25">
                  <span className="flex items-center gap-1.5 text-xs font-black tracking-wide text-white">
                    <Sparkles className="h-3.5 w-3.5 text-[#d6ff3d]" />
                    <span>Tích hợp công nghệ XTTech AI</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= WIDGET PHẢI: AI VISION NHẬN DIỆN BẢN VẼ & TEM MÁC ================= */}
          <div className="lg:col-span-4 flex justify-center lg:justify-start">
            <div className="group relative w-full max-w-xs rounded-2xl border border-teal-200/90 bg-white/95 p-4 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-teal-400 hover:shadow-2xl animate-float-delayed">
              {/* Badge góc trên */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500 text-white shadow-xs">
                    <Camera className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-bold text-slate-900">AI Vision quét bản vẽ</span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-200/60">
                  <Scan className="h-3 w-3" />
                  Auto Scan
                </span>
              </div>

              {/* Khung quét mô phỏng Viewfinder AI */}
              <div className="relative my-3 overflow-hidden rounded-xl bg-slate-900 p-3 text-white border border-slate-700">
                {/* Tia laser quét ngang chuyển động mượt mà */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_10px_#2dd4bf] animate-scan-laser" />

                <div className="flex items-center justify-between text-[11px] font-mono text-teal-300">
                  <span>FRAME #24</span>
                  <span>99.4% MATCH</span>
                </div>

                <div className="mt-2 space-y-1 text-xs">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>Hệ nhôm Xingfa 55</span>
                    <span className="text-emerald-400 text-[10px]">ĐÃ NHẬN DIỆN</span>
                  </div>
                  <div className="text-[11px] text-slate-300">Cửa đi 4 cánh mở quay • 2400 × 2800 mm</div>
                </div>
              </div>

              {/* Tag trạng thái */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Bóc tách kích thước tự động
                </span>
                <span className="text-[10px] text-slate-400">100% khớp</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CÁC ĐƯỜNG DÂY DẪN CÔNG NGHỆ NỐI TỪ ĐĨA XUỐNG 3 THẺ ================= */}
        <div className="hidden lg:flex w-full max-w-3xl items-center justify-between h-8 -mt-2 px-16 pointer-events-none opacity-60">
          <svg className="w-full h-full" viewBox="0 0 600 32" fill="none">
            <path d="M 300 0 L 300 16 L 100 16 L 100 32" stroke="#0d9488" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M 300 0 L 300 32" stroke="#0d9488" strokeWidth="2" />
            <path d="M 300 0 L 300 16 L 500 16 L 500 32" stroke="#0d9488" strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>
        </div>

        {/* ================= 3 THẺ CARD TÍNH NĂNG CÔNG NGHỆ (ICON NỔI 3D CHUẨN ĐỒ HỌA GỐC) ================= */}
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-4xl w-full">
          {/* Card 1: Voice AI */}
          <div className="group relative rounded-2xl bg-gradient-to-b from-[#045863] to-[#02333a] p-6 pt-9 text-center text-white shadow-xl shadow-[#045863]/25 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-teal-400 border border-teal-500/30">
            {/* Icon tròn nổi đè lên mép trên */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-teal-500 to-teal-300 text-white shadow-lg shadow-teal-500/40 border-2 border-white transition-transform group-hover:scale-110">
              <Mic className="h-6 w-6 text-white" />
            </div>

            <h4 className="text-sm sm:text-base font-bold text-white">
              Voice AI, tạo ghi chú hiện trường bằng giọng nói
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-teal-100/80">
              Nói kích thước ô chờ, lỗi kính; AI tự nhận diện và lập tức gán vào hồ sơ dự án.
            </p>
          </div>

          {/* Card 2: AI Vision */}
          <div className="group relative rounded-2xl bg-gradient-to-b from-[#045863] to-[#02333a] p-6 pt-9 text-center text-white shadow-xl shadow-[#045863]/25 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-teal-400 border border-teal-500/30">
            {/* Icon tròn nổi đè lên mép trên */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-teal-500 to-teal-300 text-white shadow-lg shadow-teal-500/40 border-2 border-white transition-transform group-hover:scale-110">
              <Camera className="h-6 w-6 text-white" />
            </div>

            <h4 className="text-sm sm:text-base font-bold text-white">
              AI nhận diện dữ liệu ảnh & tem mác
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-teal-100/80">
              Chụp ảnh bản vẽ tay hoặc tem nhôm, phụ kiện; AI tự động trích xuất thông số kỹ thuật.
            </p>
          </div>

          {/* Card 3: AI Auto Ticket */}
          <div className="group relative rounded-2xl bg-gradient-to-b from-[#045863] to-[#02333a] p-6 pt-9 text-center text-white shadow-xl shadow-[#045863]/25 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-teal-400 border border-teal-500/30">
            {/* Icon tròn nổi đè lên mép trên */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-teal-500 to-teal-300 text-white shadow-lg shadow-teal-500/40 border-2 border-white transition-transform group-hover:scale-110">
              <FileCheck2 className="h-6 w-6 text-white" />
            </div>

            <h4 className="text-sm sm:text-base font-bold text-white">
              AI tạo phiếu thu/chi, phiếu xuất/nhập vật tư
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-teal-100/80">
              Tự động tạo phiếu xuất kho thanh nhôm, kính và phụ kiện theo lệnh sản xuất.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroAiAssistantVisual;

