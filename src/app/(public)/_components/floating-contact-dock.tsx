'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, MessageCircle, PhoneCall } from 'lucide-react';

export interface FloatingContactDockProps {
  className?: string;
}

export function FloatingContactDock({ className = '' }: FloatingContactDockProps) {
  const [dockOpen, setDockOpen] = useState<boolean>(true);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <aside
      aria-label="Thanh liên hệ nhanh XTTech"
      className={`fixed right-3 sm:right-5 bottom-6 z-50 flex flex-col items-center gap-2.5 select-none ${className}`}
    >
      {/* Nhóm các nút liên kết mạng xã hội & hotline (cố định trên màn hình, không bị trôi khi cuộn chuột) */}
      <div
        className={`flex flex-col items-center gap-2.5 transition-all duration-300 ease-in-out ${
          dockOpen
            ? 'pointer-events-auto max-h-96 scale-100 opacity-100'
            : 'pointer-events-none max-h-0 scale-75 overflow-hidden opacity-0'
        }`}
      >
        {/* 1. Nút Zalo: 0776 710 766 */}
        <a
          href="https://zalo.me/0776710766"
          target="_blank"
          rel="noopener noreferrer"
          title="Zalo: 0776 710 766"
          className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-lg shadow-blue-500/35 transition-transform duration-300 hover:scale-110 active:scale-95"
        >
          <MessageCircle className="h-5 w-5 fill-current" />
          <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-lg bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            Tư vấn Zalo
          </span>
        </a>

        {/* 2. Nút Facebook Fanpage */}
        <a
          href="https://www.facebook.com/xttech.vn"
          target="_blank"
          rel="noopener noreferrer"
          title="Fanpage XTTech"
          className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-lg shadow-blue-600/35 transition-transform duration-300 hover:scale-110 active:scale-95"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-lg bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            Facebook Fanpage
          </span>
        </a>

        {/* 3. Nút Gmail */}
        <a
          href="mailto:xttechvn@gmail.com"
          title="Gửi Email tới xttechvn@gmail.com"
          className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-[#EA4335] text-white shadow-lg shadow-red-500/35 transition-transform duration-300 hover:scale-110 active:scale-95"
        >
          <Mail className="h-5 w-5" />
          <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-lg bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            xttechvn@gmail.com
          </span>
        </a>

        {/* 4. Nút Gọi Hotline nhanh */}
        <a
          href="tel:0776710766"
          title="Gọi Hotline: 0776 710 766"
          className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/35 transition-transform duration-300 hover:scale-110 active:scale-95"
        >
          <PhoneCall className="h-5 w-5" />
          <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            Hotline: 0776 710 766
          </span>
        </a>
      </div>

      {/* 5. Nút Thu gọn / Mở rộng các nút liên hệ */}
      <button
        type="button"
        onClick={() => setDockOpen((prev) => !prev)}
        title={dockOpen ? 'Ẩn các nút liên hệ' : 'Hiện các nút liên hệ'}
        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
          dockOpen
            ? 'bg-[#1e293b] text-white hover:bg-slate-900'
            : 'bg-primary text-white ring-4 ring-primary/20 hover:bg-primary/90'
        }`}
      >
        {dockOpen ? (
          <ChevronDown className="h-5 w-5 transition-transform duration-200" />
        ) : (
          <ChevronUp className="h-5 w-5 transition-transform duration-200" />
        )}
      </button>

      {/* 6. Nút Cuộn lên đầu trang */}
      <button
        type="button"
        onClick={scrollToTop}
        title="Cuộn lên đầu trang"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition-all hover:bg-slate-50 hover:text-primary active:scale-90 cursor-pointer"
      >
        <ChevronUp className="h-4 w-4" />
      </button>
    </aside>
  );
}

