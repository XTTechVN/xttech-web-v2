'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, MessageCircle, PhoneCall } from 'lucide-react';

export const HeroFloatingDock = () => {
  const [dockOpen, setDockOpen] = useState<boolean>(true);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed right-3 bottom-6 z-50 flex flex-col items-center gap-2.5 sm:right-6">
      {/* Nhóm các nút liên kết mạng xã hội (có thể thu gọn/ẩn đi hoặc mở ra) */}
      <div
        className={`flex flex-col items-center gap-2.5 transition-all duration-300 ease-in-out ${
          dockOpen ? 'pointer-events-auto max-h-[420px] scale-100 opacity-100' : 'pointer-events-none max-h-0 scale-75 overflow-hidden opacity-0'
        }`}
      >
        {/* 1. Nút Zalo: 0776710766 */}
        <a
          href="https://zalo.me/0776710766"
          target="_blank"
          rel="noopener noreferrer"
          title="Zalo: 0776 710 766"
          className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-lg shadow-blue-500/30 transition-transform duration-300 hover:scale-110"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="pointer-events-none absolute right-13 whitespace-nowrap rounded-lg bg-blue-600 px-2.5 py-1 text-xs text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            Nhắn tin Zalo
          </span>
        </a>

        {/* 2. Nút Facebook */}
        <a
          href="https://www.facebook.com/xttech.vn"
          target="_blank"
          rel="noopener noreferrer"
          title="Fanpage"
          className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-lg shadow-blue-600/30 transition-transform duration-300 hover:scale-110"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span className="pointer-events-none absolute right-13 whitespace-nowrap rounded-lg bg-blue-700 px-2.5 py-1 text-xs text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            Fanpage
          </span>
        </a>

        {/* 4. Nút Gmail */}
        <a
          href="mailto:xttechvn@gmail.com"
          title="Gửi Email tới xttech"
          className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-[#EA4335] text-white shadow-lg shadow-red-500/30 transition-transform duration-300 hover:scale-110"
        >
          <Mail className="h-5 w-5" />
          <span className="pointer-events-none absolute right-13 whitespace-nowrap rounded-lg bg-[#EA4335] px-2.5 py-1 text-xs text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            xttechvn@gmail.com
          </span>
        </a>

        {/* 5. Nút Gọi Hotline nhanh */}
        <a
          href="tel:0776710766"
          title="Gọi Hotline: 0776 710 766"
          className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform duration-300 hover:scale-110"
        >
          <PhoneCall className="h-5 w-5" />
          <span className="pointer-events-none absolute right-13 whitespace-nowrap rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            Hotline: 0776 710 766
          </span>
        </a>
      </div>

      {/* Nút ẨN / HIỆN CÁC NÚT (TOGGLE DOCK BUTTON) */}
      <button
        type="button"
        onClick={() => setDockOpen((prev) => !prev)}
        title={dockOpen ? 'Ẩn các nút liên hệ' : 'Hiện các nút liên hệ'}
        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
          dockOpen ? 'bg-gray-800 text-white hover:bg-gray-900' : 'bg-primary text-white ring-4 ring-primary/20 hover:bg-primary/90'
        }`}
      >
        {dockOpen ? (
          <ChevronDown className="h-5 w-5 transition-transform duration-200" />
        ) : (
          <ChevronUp className="h-5 w-5 transition-transform duration-200" />
        )}
      </button>

      {/* Nút Cuộn lên đầu trang (Top) */}
      <button
        type="button"
        onClick={scrollToTop}
        title="Cuộn lên đầu trang"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition-all hover:bg-gray-100 hover:text-primary active:scale-90"
      >
        <ChevronUp className="h-4 w-4" />
      </button>
    </div>
  );
};
