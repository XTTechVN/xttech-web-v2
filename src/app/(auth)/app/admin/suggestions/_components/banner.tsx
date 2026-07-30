'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Banner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#006377] to-[#00B8DD] h-auto py-6 flex items-center px-10 text-white shadow-xl shadow-[#006377]/15 select-none">
      <div className="absolute top-0 right-0 h-full w-[60%] opacity-20 pointer-events-none">
        <svg className="h-full w-full" viewBox="0 0 800 161" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
          {Array.from({ length: 45 }).map((_, idx) => {
            const xOffset = idx * 23 - 100;
            return (
              <line key={idx} x1={xOffset} y1="0" x2={xOffset + 161 / Math.tan((61.74 * Math.PI) / 180)} y2="161" stroke="white" strokeWidth="1.5" />
            );
          })}
        </svg>
      </div>

      <div className="relative z-10 flex flex-col gap-1.5 max-w-3xl">
        <div className="flex items-center gap-2 text-white/90">
          <ShieldCheck className="w-4 h-4 text-white shrink-0" />
          <span className="font-bold text-xs leading-4 tracking-widest uppercase align-middle">Hệ thống quản lý nội bộ</span>
        </div>

        <h1 className="font-black text-[30px] leading-10 tracking-[-0.9px] align-middle drop-shadow-sm">QUẢN LÝ ĐỀ XUẤT & SÁNG KIẾN NHÂN SỰ</h1>
        <p className="font-normal text-[16px] leading-7 tracking-normal">Nơi tiếp nhận, phân tích và hiện thực hóa các giải pháp sáng tạo XT TECH.</p>
      </div>
    </div>
  );
}
