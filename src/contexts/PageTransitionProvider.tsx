'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { PageLoader } from '@/components/page-loader';
import { getRouteMetadata, RouteMeta } from '@/utils/route-metadata';

interface PageTransitionContextType {
  isTransitioning: boolean;
  startTransition: (targetPath: string) => void;
  navigateTo: (href: string) => void;
  dismissTransition: () => void;
}

const PageTransitionContext = createContext<PageTransitionContextType | undefined>(undefined);

export const PageTransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [targetMeta, setTargetMeta] = useState<RouteMeta>({
    title: 'Đang tải dữ liệu',
    subtitle: 'Vui lòng chờ trong giây lát...',
    iconName: 'Loader2',
  });

  const progressRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const fromPathRef = useRef<string | null>(null);
  const isFinishingRef = useRef<boolean>(false);

  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const finishIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const completionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = useCallback(() => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (finishIntervalRef.current) {
      clearInterval(finishIntervalRef.current);
      finishIntervalRef.current = null;
    }
    if (completionTimerRef.current) {
      clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }
  }, []);

  // Chuẩn hóa đường dẫn để so sánh chính xác (bỏ trailing slash)
  const normalizePath = (p: string, s: string = '') => {
    const cleanP = p.replace(/\/$/, '') || '/';
    const cleanS = s ? (s.startsWith('?') ? s : `?${s}`) : '';
    return cleanP + cleanS;
  };

  // Kiểm tra xem màn hình hiện tại có phải Mobile (< 768px) không
  const isMobileScreen = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  }, []);

  // Kiểm tra xem URL đích có trùng hoàn toàn với trang hiện tại không
  const isSameRoute = useCallback((targetUrlString: string) => {
    if (typeof window === 'undefined') return false;
    try {
      const url = new URL(targetUrlString, window.location.href);
      const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
      const targetPath = url.pathname.replace(/\/$/, '') || '/';
      const currentSearch = window.location.search || '';
      const targetSearch = url.search || '';
      return currentPath === targetPath && currentSearch === targetSearch;
    } catch {
      return false;
    }
  }, []);

  const startTransition = useCallback(
    (targetPath: string) => {
      // 1. Guard Clause: Chỉ kích hoạt màn hình loading trên thiết bị Mobile (< 768px)
      if (!isMobileScreen()) {
        return;
      }

      // 2. Guard Clause: Nếu là cùng một trang (pathname + search), bỏ qua ngay lập tức!
      if (isSameRoute(targetPath)) {
        return;
      }

      clearAllTimers();
      isFinishingRef.current = false;
      startTimeRef.current = Date.now();
      // Lưu lại URL hiện tại trước khi Next.js bắt đầu điều hướng
      fromPathRef.current = normalizePath(window.location.pathname, window.location.search);

      const meta = getRouteMetadata(targetPath);
      setTargetMeta(meta);
      setIsTransitioning(true);
      setProgress(15);
      progressRef.current = 15;

      // 3. Chạy tiến trình mô phỏng tăng dần từ 15% -> ~90%
      progressIntervalRef.current = setInterval(() => {
        if (isFinishingRef.current) return;
        setProgress((prev) => {
          if (prev >= 90) return 90;
          const diff = 90 - prev;
          const step = Math.max(1, Math.round(diff * 0.12));
          const nextVal = Math.min(90, prev + step);
          progressRef.current = nextVal;
          return nextVal;
        });
      }, 120);

      // 4. Safety timeout: Tự động tắt sau 8 giây nếu mạng quá chậm hoặc lỗi điều hướng
      safetyTimerRef.current = setTimeout(() => {
        setIsTransitioning(false);
        clearAllTimers();
        setProgress(0);
        progressRef.current = 0;
        fromPathRef.current = null;
        isFinishingRef.current = false;
      }, 8000);
    },
    [isMobileScreen, isSameRoute, clearAllTimers]
  );

  const dismissTransition = useCallback(() => {
    clearAllTimers();
    setIsTransitioning(false);
    setProgress(0);
    progressRef.current = 0;
    fromPathRef.current = null;
    isFinishingRef.current = false;
  }, [clearAllTimers]);

  const navigateTo = useCallback(
    (href: string) => {
      if (isSameRoute(href)) {
        return;
      }
      if (isMobileScreen()) {
        startTransition(href);
      }
      router.push(href);
    },
    [router, startTransition, isSameRoute, isMobileScreen]
  );

  // Khi pathname hoặc searchParams thay đổi -> Trang mới đã nạp xong
  useEffect(() => {
    // 1. Chỉ xử lý khi đang transition và chưa bước vào giai đoạn hoàn tất
    if (!isTransitioning || isFinishingRef.current || !fromPathRef.current) return;

    // 2. Kiểm tra nếu URL hiện tại VẪN LÀ URL CŨ (chưa chuyển trang xong) -> Tiếp tục chờ!
    const currentUrl = normalizePath(pathname, searchParams?.toString() || '');
    if (currentUrl === fromPathRef.current) {
      return;
    }

    // 3. Trang mới đã thực sự nạp xong! Dừng mô phỏng chờ và chạy hoàn tất 100%
    isFinishingRef.current = true;
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
    // Đảm bảo thời gian hiển thị tối thiểu 1000ms (1s) để triệt tiêu hiện tượng nháy khung hình
    const remainingTime = Math.max(0, 1000 - elapsed);

    const startProgress = progressRef.current;
    const animationStartTime = Date.now();

    if (remainingTime > 50) {
      finishIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const timePassed = now - animationStartTime;
        const factor = Math.min(1, timePassed / remainingTime);
        const nextP = Math.round(startProgress + (100 - startProgress) * factor);

        setProgress(nextP);
        progressRef.current = nextP;

        if (factor >= 1) {
          if (finishIntervalRef.current) {
            clearInterval(finishIntervalRef.current);
            finishIntervalRef.current = null;
          }

          // Dừng 200ms để người dùng nhìn thấy trạng thái 100% hoàn thành rồi mờ dần
          completionTimerRef.current = setTimeout(() => {
            setIsTransitioning(false);
            clearAllTimers();
            setTimeout(() => {
              setProgress(0);
              progressRef.current = 0;
              fromPathRef.current = null;
              isFinishingRef.current = false;
            }, 300);
          }, 200);
        }
      }, 30);
    } else {
      setProgress(100);
      progressRef.current = 100;
      completionTimerRef.current = setTimeout(() => {
        setIsTransitioning(false);
        clearAllTimers();
        setTimeout(() => {
          setProgress(0);
          progressRef.current = 0;
          fromPathRef.current = null;
          isFinishingRef.current = false;
        }, 300);
      }, 200);
    }

    return () => {
      if (finishIntervalRef.current) clearInterval(finishIntervalRef.current);
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    };
  }, [pathname, searchParams, isTransitioning, clearAllTimers]);

  // Bắt sự kiện click vào các thẻ <a> hoặc <Link> nội bộ trong toàn bộ ứng dụng (0ms delay)
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest('a');
      if (!anchor || !anchor.href) return;

      // Bỏ qua nếu mở tab mới, tải file hoặc link ngoài
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      try {
        const url = new URL(anchor.href, window.location.href);

        // Bỏ qua link bên ngoài domain
        if (url.origin !== window.location.origin) return;

        // Bỏ qua nếu click lại đúng trang hiện tại (cùng pathname và query)
        if (isSameRoute(url.href)) {
          return;
        }

        // Bỏ qua link hash cùng trang (#id)
        if (url.pathname === window.location.pathname && url.hash) {
          return;
        }

        // Kích hoạt ngay lập tức màn hình loading cho các trang thuộc /app (chỉ trên mobile)
        if (url.pathname.startsWith('/app') && isMobileScreen()) {
          startTransition(url.pathname + url.search);
        }
      } catch {
        // Ignored invalid URL parsing
      }
    };

    // Sử dụng capture phase để bắt được sự kiện sớm nhất
    window.addEventListener('click', handleGlobalClick, true);

    // Bổ sung lắng nghe history.pushState và replaceState cho các lệnh điều hướng programmatic (0ms tức thì)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (data: any, unused: string, url?: string | URL | null) {
      if (url) {
        try {
          const parsed = new URL(url.toString(), window.location.href);
          if (parsed.pathname.startsWith('/app') && !isSameRoute(parsed.href) && isMobileScreen()) {
            setTimeout(() => {
              startTransition(parsed.pathname + parsed.search);
            }, 0);
          }
        } catch {}
      }
      return originalPushState.apply(this, [data, unused, url]);
    };

    window.history.replaceState = function (data: any, unused: string, url?: string | URL | null) {
      if (url) {
        try {
          const parsed = new URL(url.toString(), window.location.href);
          if (parsed.pathname.startsWith('/app') && !isSameRoute(parsed.href) && isMobileScreen()) {
            setTimeout(() => {
              startTransition(parsed.pathname + parsed.search);
            }, 0);
          }
        } catch {}
      }
      return originalReplaceState.apply(this, [data, unused, url]);
    };

    return () => {
      window.removeEventListener('click', handleGlobalClick, true);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      clearAllTimers();
    };
  }, [startTransition, isSameRoute, isMobileScreen, clearAllTimers]);

  return (
    <PageTransitionContext.Provider
      value={{
        isTransitioning,
        startTransition,
        navigateTo,
        dismissTransition,
      }}
    >
      {/* 1. Màn hình Loading Shell nạp sẵn trong RAM thiết bị (0ms delay) */}
      <PageLoader
        isVisible={isTransitioning}
        title={targetMeta.title}
        subtitle={targetMeta.subtitle}
        iconName={targetMeta.iconName}
        progress={progress}
        onBack={dismissTransition}
      />

      {/* 2. Giao diện ứng dụng chính */}
      {children}
    </PageTransitionContext.Provider>
  );
};

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error('usePageTransition must be used within a PageTransitionProvider');
  }
  return context;
}
