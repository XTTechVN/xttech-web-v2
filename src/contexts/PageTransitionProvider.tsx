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
  const [targetMeta, setTargetMeta] = useState<RouteMeta>({
    title: 'Đang tải dữ liệu',
    subtitle: 'Vui lòng chờ trong giây lát...',
    iconName: 'Loader2',
  });

  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearSafetyTimer = () => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  };

  const startTransition = useCallback((targetPath: string) => {
    const meta = getRouteMetadata(targetPath);
    setTargetMeta(meta);
    setIsTransitioning(true);

    clearSafetyTimer();
    // Safety timeout: Tự động tắt sau 7 giây nếu mạng quá chậm hoặc lỗi điều hướng
    safetyTimerRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 7000);
  }, []);

  const dismissTransition = useCallback(() => {
    clearSafetyTimer();
    setIsTransitioning(false);
  }, []);

  const navigateTo = useCallback(
    (href: string) => {
      startTransition(href);
      router.push(href);
    },
    [router, startTransition]
  );

  // Khi pathname hoặc searchParams thay đổi -> Trang mới đã nạp xong -> Fade out loader
  useEffect(() => {
    if (isTransitioning) {
      // Đợi 120ms để UI trang mới kịp paint lên màn hình, tránh giật khung hình
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        clearSafetyTimer();
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

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
        const currentSearch = window.location.search;
        if (url.pathname === window.location.pathname && url.search === currentSearch) {
          return;
        }

        // Bỏ qua link hash cùng trang (#id)
        if (url.pathname === window.location.pathname && url.hash) {
          return;
        }

        // Kích hoạt ngay lập tức màn hình loading cho các trang thuộc /app
        if (url.pathname.startsWith('/app')) {
          startTransition(url.pathname);
        }
      } catch {
        // Ignored invalid URL parsing
      }
    };

    // Sử dụng capture phase để bắt được sự kiện sớm nhất (trước cả Next.js Link)
    window.addEventListener('click', handleGlobalClick, true);

    // Bổ sung lắng nghe history.pushState cho các lệnh điều hướng programmatic
    const originalPushState = window.history.pushState;
    window.history.pushState = function (data: any, unused: string, url?: string | URL | null) {
      if (url) {
        try {
          const parsed = new URL(url.toString(), window.location.href);
          if (parsed.pathname.startsWith('/app') && parsed.pathname !== window.location.pathname) {
            // Sử dụng setTimeout để đưa lệnh setState ra khỏi luồng useInsertionEffect của React 19
            setTimeout(() => {
              startTransition(parsed.pathname);
            }, 0);
          }
        } catch {}
      }
      return originalPushState.apply(this, [data, unused, url]);
    };

    return () => {
      window.removeEventListener('click', handleGlobalClick, true);
      window.history.pushState = originalPushState;
      clearSafetyTimer();
    };
  }, [startTransition]);

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
