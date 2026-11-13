'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastItem {
  id: number;
  name: string;
  timeAgo: string;
}

const TOAST_USERS: ToastItem[] = [
  { id: 1, name: 'Anh Nguyễn Hoàng Nam', timeAgo: 'vừa xong' },
  { id: 2, name: 'Anh Trần Đình Trọng', timeAgo: '1 phút trước' },
  { id: 3, name: 'Chị Lê Thị Thu Mai', timeAgo: '2 phút trước' },
  { id: 4, name: 'Anh Hoàng Minh Đức', timeAgo: 'vừa xong' },
  { id: 5, name: 'Anh Phạm Quốc Bảo', timeAgo: '3 phút trước' },
  { id: 6, name: 'Anh Đặng Hữu Thắng', timeAgo: 'vừa xong' },
  { id: 7, name: 'Chị Vũ Bích Phương', timeAgo: '1 phút trước' },
  { id: 8, name: 'Anh Bùi Tuấn Kiệt', timeAgo: 'vừa xong' },
  { id: 9, name: 'Anh Đỗ Văn Hùng', timeAgo: '2 phút trước' },
  { id: 10, name: 'Anh Phan Thanh Liêm', timeAgo: 'vừa xong' },
];

const INTERVAL_MS = 3000;
const FADE_MS = 200;

export function HeroLiveSocialProof() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isDismissed || isHovered) return;

    const timer = setInterval(() => {
      setIsFading(true);
      fadeTimer.current = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % TOAST_USERS.length);
        setIsFading(false);
      }, FADE_MS);
    }, INTERVAL_MS);

    return () => {
      clearInterval(timer);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, [isDismissed, isHovered]);

  if (isDismissed) return null;

  const current = TOAST_USERS[currentIndex];

  return (
    <aside
      aria-label="Thông báo đăng ký"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 left-4 sm:bottom-7 sm:left-6 z-50 select-none pointer-events-auto transition-transform duration-300 hover:scale-[1.02]"
    >
      {/* Toast pill gọn gàng, trong suốt tinh tế (Glassmorphism) */}
      <div className="flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/80 px-3.5 py-2 shadow-lg backdrop-blur-md ring-1 ring-black/5 transition-all">
        {/* Icon tick xanh xác thực */}
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
        </div>

        {/* Nội dung Toast: chỉ gồm Tên + đã đăng ký sử dụng phần mềm */}
        <div
          className={`flex items-center gap-1.5 text-xs text-slate-700 transition-all duration-200 ease-out ${
            isFading
              ? 'opacity-0 -translate-y-1 scale-95'
              : 'opacity-100 translate-y-0 scale-100'
          }`}
        >
          <strong className="font-bold text-slate-900 whitespace-nowrap">
            {current.name}
          </strong>
          <span className="whitespace-nowrap">đã đăng ký sử dụng phần mềm</span>
          <span className="hidden sm:inline text-[11px] text-slate-400">
            • {current.timeAgo}
          </span>
        </div>

        {/* Nút đóng */}
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          aria-label="Đóng"
          className="ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </aside>
  );
}

export default HeroLiveSocialProof;
