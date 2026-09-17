'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Home,
  LayoutDashboard,
  Compass,
  CalendarCheck,
  CalendarOff,
  Users,
  Building2,
  Sliders,
  Clock,
  FolderKanban,
  MessageSquarePlus,
  Smartphone,
  UserCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/utils';

export interface PageLoaderProps {
  isVisible: boolean;
  title?: string;
  subtitle?: string;
  iconName?: string;
  onBack?: () => void;
  onHome?: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Compass,
  CalendarCheck,
  CalendarOff,
  Users,
  Building2,
  Sliders,
  Clock,
  FolderKanban,
  MessageSquarePlus,
  Smartphone,
  UserCircle,
  Loader2,
};

export const PageLoader: React.FC<PageLoaderProps> = ({ isVisible, title = 'Đang tải dữ liệu', subtitle = 'Vui lòng chờ trong giây lát...', iconName = 'Loader2', onBack, onHome, }) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      router.push('/app/dashboard');
    }
  };

  const IconComponent = (iconName && ICON_MAP[iconName]) ? ICON_MAP[iconName] : Loader2;

  return (
    <div
      aria-hidden={!isVisible}
      className={cn(
        'fixed inset-0 z-[9999] flex flex-col bg-white select-none transition-all duration-300 ease-out',
        isVisible
          ? 'opacity-100 pointer-events-auto visible'
          : 'opacity-0 pointer-events-none invisible'
      )}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* 1. Header (Nút Back - Tiêu đề - Nút Home) */}
      <header className="relative flex items-center justify-between px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Quay lại"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs transition active:scale-90 hover:bg-slate-50"
          >
            <ArrowLeft size={19} />
          </button>
          <h1 className="text-base font-bold text-slate-800 tracking-tight line-clamp-1">
            {title}
          </h1>
        </div>

        <button
          type="button"
          onClick={handleHome}
          aria-label="Về trang chủ"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs transition active:scale-90 hover:bg-slate-50"
        >
          <Home size={19} />
        </button>
      </header>

      {/* 2. Phần trung tâm (Icon - Tiêu đề - Phụ đề - Thanh Progress Bar) */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
        {/* Icon Frame mang màu chủ đạo XTTech (#045863) */}
        <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-50/90 border border-teal-100/80 shadow-xs ring-4 ring-teal-50/50">
          <IconComponent
            size={36}
            className="text-[#045863] animate-pulse"
            strokeWidth={2.2}
          />
        </div>

        {/* Tên tính năng */}
        <h2 className="text-lg font-bold text-slate-900 tracking-tight text-center sm:text-xl">
          {title}
        </h2>

        {/* Phụ đề mô tả */}
        <p className="mt-1 text-xs sm:text-sm font-normal text-slate-500 text-center line-clamp-1 max-w-[260px]">
          {subtitle}
        </p>

        {/* Thanh Progress Bar chủ đạo XTTech (#045863 -> #088395) */}
        <div className="mt-5 h-1.5 w-44 sm:w-52 overflow-hidden rounded-full bg-slate-100 shadow-inner">
          <div className="relative h-full w-full overflow-hidden">
            <div className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-[#045863] via-[#088395] to-[#0A97B0] animate-[shimmer_1.4s_infinite_ease-in-out] w-1/2" />
          </div>
        </div>
      </main>

      {/* 3. Đồ họa Sóng nền đáy (Wave SVG) chuẩn tone màu XTTech dịu mắt */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-0">
        <svg
          className="relative block w-full h-36 sm:h-44"
          viewBox="0 0 1200 320"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="xttech-wave-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#045863" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#045863" stopOpacity="0.18" />
            </linearGradient>
          </defs>
          <path
            fill="url(#xttech-wave-grad)"
            d="M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,213.3C672,224,768,192,864,165.3C960,139,1056,117,1152,122.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            left: -50%;
          }
          50% {
            left: 25%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
};
