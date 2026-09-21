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
  progress?: number;
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

export const PageLoader: React.FC<PageLoaderProps> = ({ isVisible, title = 'Đang tải dữ liệu', subtitle = 'Vui lòng chờ trong giây lát...', iconName = 'Loader2', progress, onBack, onHome, }) => {
  const router = useRouter();

  // Tự động mô phỏng tiến trình nếu prop progress không được truyền vào từ bên ngoài (e.g. Next.js loading.tsx)
  const [internalProgress, setInternalProgress] = React.useState(0);

  React.useEffect(() => {
    if (!isVisible || progress !== undefined) return;

    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        const current = prev === 0 ? 10 : prev;
        if (current >= 92) return 92;
        const diff = 92 - current;
        return current + Math.max(1, Math.floor(diff * 0.12));
      });
    }, 150);

    return () => {
      clearInterval(interval);
      setInternalProgress(0);
    };
  }, [isVisible, progress]);

  const currentProgress = !isVisible
    ? 0
    : progress !== undefined
      ? Math.min(100, Math.max(0, Math.round(progress)))
      : internalProgress;

  // Chiều cao mặt nước dâng lên tỉ lệ thuận với tiến trình, tối đa đạt 50% màn hình
  const waveHeightPercent = Math.min(50, Math.round(10 + (currentProgress / 100) * 40));

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
        'fixed inset-0 z-[9999] md:hidden flex flex-col bg-white select-none',
        isVisible
          ? 'opacity-100 pointer-events-auto visible'
          : 'opacity-0 pointer-events-none invisible transition-opacity duration-200 ease-out'
      )}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* 1. Header (Nút Back - Tiêu đề - Nút Home) */}
      <header className="relative z-20 flex items-center justify-between px-4 py-3.5 sm:px-6">
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

      {/* 2. Phần trung tâm (Icon nhỏ - Tiêu đề - Phụ đề - Thanh Progress Bar thanh mảnh) tại vị trí 1/3 màn hình */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-start px-6 pt-[10vh] sm:pt-[12vh]">
        {/* Icon Frame nhỏ gọn chuẩn mobile */}
        <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-teal-50/90 border border-teal-100/80 shadow-xs ring-4 ring-teal-50/50">
          <IconComponent
            size={24}
            className="text-[#045863] animate-pulse"
            strokeWidth={2.2}
          />
        </div>

        {/* Tên tính năng */}
        <h2 className="text-base font-bold text-slate-900 tracking-tight text-center sm:text-lg">
          {title}
        </h2>

        {/* Phụ đề mô tả */}
        <p className="mt-1 text-xs sm:text-sm font-normal text-slate-500 text-center line-clamp-1 max-w-[260px]">
          {subtitle}
        </p>

        {/* Thanh Progress Bar 0 - 100% (tối giản, không chữ và %, độ dày h-2.5 rõ nét) */}
        <div className="mt-4 h-2.5 w-48 sm:w-56 overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/70 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#045863] via-[#088395] to-[#0A97B0] transition-all duration-200 ease-out"
            style={{ width: `${currentProgress}%` }}
          />
        </div>
      </main>

      {/* 3. Đồ họa Sóng nước dâng theo tiến trình (tối đa 50% màn hình) chuẩn màu chủ đạo XTTech (#045863) */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 w-full overflow-hidden flex flex-col justify-end transition-all duration-300 ease-out z-0"
        style={{ height: `${waveHeightPercent}%` }}
      >
        {/* 1 Đỉnh sóng duy nhất cuộn trào mạnh mẽ chuẩn màu chủ đạo XTTech */}
        <div className="relative w-full h-20 sm:h-28 overflow-hidden shrink-0">
          <div className="absolute inset-0 w-[200%] h-full flex animate-[wave-flow_2.8s_linear_infinite]">
            <svg
              className="w-1/2 h-full shrink-0 block"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              {/* Mảng thân sóng đổ màu phẳng đồng nhất chuẩn màu chủ đạo XTTech */}
              <path
                fill="#5A949C"
                stroke="none"
                d=" "
              />
              {/* Chỉ kẻ viền ở mép cong đỉnh sóng, tuyệt đối không kẻ cạnh dọc */}
              <path
                fill="none"
                stroke="#045863"
                strokeWidth="2.5"
                strokeOpacity="0.9"
                d="M-2,60 C150,5 300,105 480,95 C620,85 750,10 900,20 C1050,30 1120,95 1202,60"
              />
            </svg>
            <svg
              className="w-1/2 h-full shrink-0 block"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              {/* Mảng thân sóng đổ màu phẳng đồng nhất chuẩn màu chủ đạo XTTech */}
              <path
                fill="#5A949C"
                stroke="none"
                d="M0,60 C150,5 300,105 480,95 C620,85 750,10 900,20 C1050,30 1120,95 1200,60 L1200,160 L0,160 Z"
              />
              {/* Chỉ kẻ viền ở mép cong đỉnh sóng, tuyệt đối không kẻ cạnh dọc */}
              <path
                fill="none"
                stroke="#045863"
                strokeWidth="2.5"
                strokeOpacity="0.9"
                d="M-2,60 C150,5 300,105 480,95 C620,85 750,10 900,20 C1050,30 1120,95 1202,60"
              />
            </svg>
          </div>
        </div>

        {/* Thân nước dâng lên cùng mã màu #5A949C đồng nhất 100% với ngọn sóng, gối đè -mt-3 triệt tiêu hoàn toàn mọi ranh giới */}
        <div className="w-full flex-1 -mt-3 bg-[#5A949C]" />
      </div>

      <style jsx>{`
        @keyframes wave-flow {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
      `}</style>
    </div>
  );
};
