'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Modal } from '@/components';
import { Header } from './header';
import { Footer } from './footer';
import { FloatingContactDock } from './floating-contact-dock';
import { HeroLiveSocialProof } from './hero';
import { HeroSectionDots } from './hero/hero-section-dots';
import {
  HeroRegisterInlineForm,
} from './hero/hero-register-inline-form';

interface PublicLayoutShellProps {
  children: React.ReactNode;
}

const isPortalRoute = (pathname: string | null): boolean => {
  if (!pathname) return false;
  return (
    pathname === '/' ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/news') ||
    pathname.startsWith('/privacy-policy') ||
    pathname.startsWith('/terms-of-service') ||
    pathname.startsWith('/refund-policy')
  );
};

// Thứ tự vị trí ngang của các trang tương ứng với thứ tự tab trên Header
const getRouteOrderIndex = (pathname: string | null): number => {
  if (!pathname || pathname === '/') return 0;
  if (pathname.startsWith('/pricing')) return 1;
  if (pathname.startsWith('/news')) return 2;
  if (pathname.startsWith('/privacy-policy')) return 3;
  if (pathname.startsWith('/terms-of-service')) return 4;
  if (pathname.startsWith('/refund-policy')) return 5;
  return 0;
};

export const PublicLayoutShell = ({ children }: PublicLayoutShellProps) => {
  const pathname = usePathname();
  const mainRef = useRef<HTMLDivElement | null>(null);
  const prevPathRef = useRef<string | null>(pathname);
  const prevIndexRef = useRef<number>(getRouteOrderIndex(pathname));
  const [isAutoRegisterModalOpen, setIsAutoRegisterModalOpen] = useState(false);

  const isPortal = isPortalRoute(pathname);

  // Mở sẵn Modal đăng ký mỗi lần vào/tải lại trang, chỉ đóng khi người dùng tự bấm tắt
  useEffect(() => {
    if (!isPortal) return;
    setIsAutoRegisterModalOpen(true);
  }, [isPortal]);

  const handleCloseAutoModal = () => {
    setIsAutoRegisterModalOpen(false);
  };

  // Chạy đồng bộ trước khi trình duyệt vẽ (pre-paint) bằng Web Animations API GPU
  // Không dùng key={pathname} và không hạ opacity về 0 để triệt tiêu 100% hiện tượng nháy trắng
  useLayoutEffect(() => {
    if (prevPathRef.current === pathname) return;

    const currentIndex = getRouteOrderIndex(pathname);
    const direction = currentIndex >= prevIndexRef.current ? 1 : -1;

    prevPathRef.current = pathname;
    prevIndexRef.current = currentIndex;

    if (typeof window !== 'undefined' && !window.location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    const el = mainRef.current;
    if (!el || typeof el.animate !== 'function') return;

    const animation = el.animate(
      [
        {
          transform: `translate3d(${direction * 28}px, 0, 0)`,
          opacity: 0.92,
        },
        {
          transform: 'translate3d(0, 0, 0)',
          opacity: 1,
        },
      ],
      {
        duration: 380,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    );

    return () => animation.cancel();
  }, [pathname]);

  if (!isPortal) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white font-sans text-gray-900 selection:bg-primary/15 selection:text-primary">
      <Header />
      <div ref={mainRef} className="flex-1 will-change-transform">
        {children}
      </div>
      {!pathname?.startsWith('/news') && <Footer />}
      <FloatingContactDock />
      {pathname === '/' && <HeroLiveSocialProof />}
      {pathname === '/' && <HeroSectionDots />}

      <Modal
        isOpen={isAutoRegisterModalOpen}
        onClose={handleCloseAutoModal}
        size="md"
        title="Đăng ký trải nghiệm XTTECH XMS Fab"
        className="max-w-lg border border-primary/20"
        bodyClassName="p-5 sm:p-6"
      >
        <HeroRegisterInlineForm
          variant="modal"
          onBack={handleCloseAutoModal}
        />
      </Modal>
    </div>
  );
};
