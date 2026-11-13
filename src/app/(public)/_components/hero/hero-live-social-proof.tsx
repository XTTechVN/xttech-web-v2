'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock, Sparkles, X } from 'lucide-react';

export interface SocialProofItem {
  id: number;
  name: string;
  role?: string;
  company: string;
  city: string;
  action: string;
  timeAgo: string;
  avatarBg: string;
  initials: string;
}

interface HeroLiveSocialProofProps {
  /** Danh sách hoạt động THẬT lấy từ API/database. */
  items?: SocialProofItem[];
  /** Số liệu thật (vd: số xưởng đang dùng). Không truyền thì ẩn dòng này. */
  liveCount?: number;
  liveCountLabel?: string;
  intervalMs?: number;
}

// Chỉ dùng khi chạy dev để xem giao diện. Production sẽ không hiển thị gì nếu không có items thật.
const DEV_MOCK_ITEMS: SocialProofItem[] = [
  {
    id: 1,
    name: 'Anh Nguyễn Hoàng Nam',
    company: 'Xưởng Nhôm Kính Nam Phát',
    city: 'Đà Nẵng',
    action: 'Vừa đăng ký dùng thử phần mềm 30 ngày',
    timeAgo: '1p trước',
    avatarBg: 'from-amber-500 via-orange-500 to-amber-600',
    initials: 'HN',
  },
  {
    id: 2,
    name: 'Anh Trần Đình Trọng',
    company: 'Xingfa Window Miền Bắc',
    city: 'Hà Nội',
    action: 'Vừa xuất bản vẽ bóc tách & thẻ cắt A4',
    timeAgo: '2p trước',
    avatarBg: 'from-teal-500 via-emerald-500 to-teal-700',
    initials: 'TT',
  },
  {
    id: 3,
    name: 'Chị Lê Thị Thu Mai',
    company: 'Nhôm Kính Tân Tiến',
    city: 'Bình Dương',
    action: 'Vừa tạo lệnh sản xuất 42 bộ cửa',
    timeAgo: '4p trước',
    avatarBg: 'from-blue-500 via-indigo-500 to-blue-700',
    initials: 'TM',
  },
];

const FADE_DURATION = 250;

export function HeroLiveSocialProof({
  items,
  liveCount,
  liveCountLabel = 'xưởng đang dùng',
  intervalMs = 3200,
}: HeroLiveSocialProofProps) {
  const data =
    items && items.length > 0
      ? items
      : process.env.NODE_ENV !== 'production'
        ? DEV_MOCK_ITEMS
        : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isDismissed || isHovered || data.length < 2) return;

    const timer = setInterval(() => {
      setIsFading(true);
      fadeTimer.current = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % data.length);
        setIsFading(false);
      }, FADE_DURATION);
    }, intervalMs);

    return () => {
      clearInterval(timer);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, [isDismissed, isHovered, data.length, intervalMs]);

  if (isDismissed || data.length === 0) return null;

  const current = data[currentIndex % data.length];
  const stepNumber = String(currentIndex + 1).padStart(2, '0');
  const total = String(data.length).padStart(2, '0');

  return (
    <aside
      aria-label="Hoạt động gần đây"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-7 left-3 sm:bottom-8 sm:left-5 z-50 max-w-[270px] sm:max-w-[300px] w-[calc(100vw-24px)] select-none pointer-events-auto"
    >
      <style>{`
        @keyframes socialProofProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>

      {/* Nền transparent hoàn toàn: không blur, không shadow */}
      <div className="relative overflow-hidden rounded-xl border border-white/30 bg-transparent p-2 sm:p-2.5 transition-colors duration-300 hover:border-primary/40">
        {/* Header */}
        <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-slate-300/30">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>

            {typeof liveCount === 'number' ? (
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-800 [text-shadow:0_1px_2px_rgb(255_255_255/0.7)]">
                <span className="font-black tabular-nums text-primary">
                  {liveCount.toLocaleString('vi-VN')}
                </span>
                <span className="text-[10px] font-medium text-slate-600">
                  {liveCountLabel}
                </span>
              </div>
            ) : (
              <span className="text-[10px] font-bold text-slate-800 [text-shadow:0_1px_2px_rgb(255_255_255/0.7)]">
                Hoạt động gần đây
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[9px] font-extrabold text-primary px-1.5 rounded-full border border-primary/30">
              {stepNumber}/{total}
            </span>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              aria-label="Đóng thông báo"
              title="Đóng thông báo"
              className="flex h-4 w-4 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200/40 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          className={`flex items-start gap-2 transition-all duration-250 ease-out motion-reduce:transition-none ${
            isFading
              ? 'opacity-0 -translate-y-1 scale-[0.98]'
              : 'opacity-100 translate-y-0 scale-100'
          }`}
        >
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr ${current.avatarBg} text-white font-black text-[11px] ring-1 ring-white/70`}
          >
            {current.initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 truncate [text-shadow:0_1px_2px_rgb(255_255_255/0.7)]">
                {current.name}
              </h4>
              <span className="shrink-0 flex items-center gap-0.5 text-[9px] font-medium text-slate-500">
                <Clock className="h-2 w-2" />
                {current.timeAgo}
              </span>
            </div>

            <p className="text-[10px] text-slate-600 font-medium truncate leading-tight [text-shadow:0_1px_2px_rgb(255_255_255/0.7)]">
              {current.company} •{' '}
              <span className="font-semibold text-slate-700">{current.city}</span>
            </p>

            <div className="mt-1 rounded-md border border-primary/25 px-1.5 py-0.5 flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5 text-primary shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-bold text-primary truncate leading-tight">
                {current.action}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-1.5 h-0.5 w-full bg-slate-300/30 rounded-full overflow-hidden">
          <div
            key={`progress-${current.id}-${currentIndex}`}
            className="h-full bg-gradient-to-r from-primary via-emerald-500 to-teal-400 rounded-full"
            style={{
              animation: isHovered
                ? 'none'
                : `socialProofProgress ${intervalMs}ms linear forwards`,
            }}
          />
        </div>
      </div>
    </aside>
  );
}

export default HeroLiveSocialProof;