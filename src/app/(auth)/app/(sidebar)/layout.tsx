'use client';

// React
import React from 'react';

// Next.js
import { usePathname } from 'next/navigation';

// Third-party
import toast from 'react-hot-toast';

// Components
import { Sidebar, SidebarItemProps, SidebarMenuButton, UserMenu, XTLogo } from '@/components';

// Hooks & Actions
import { useLocationTracker, useMyTodayAttendance } from '@/hooks';
import { usePageTransition } from '@/contexts';

// Config
import { getSidebarSections, getActiveItemId, isRouteAllowed, acceptedSections, DEV_TOOLS } from '@/config';
import { useCan } from '@/hooks';
import { AccessDenied } from '@/components/access-denied';
import dynamic from 'next/dynamic';

// Chỉ dev (NEXT_PUBLIC_DEV_TOOLS=true): cột phải để chọn tài khoản mock và bật/tắt quyền; bản production không nạp
const DevPermissionPanel = DEV_TOOLS ? dynamic(() => import('@/components/dev').then((m) => m.DevPermissionPanel), { ssr: false }) : null;

// Giữ chỗ trong lúc chờ /me, tránh trang con gọi API trước khi biết quyền
const PageSkeleton = () => (
  <div className="flex flex-col gap-3 p-4" aria-busy="true">
    <div className="h-8 w-1/3 animate-pulse rounded-control bg-gray-200" />
    <div className="h-40 w-full animate-pulse rounded-control bg-gray-100" />
  </div>
);
import { useAuthStore } from '@/stores';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Chỉ tự động thu thập GPS và gửi ping định kỳ khi nhân viên ĐÃ CHECK-IN và CHƯA CHECK-OUT (đang trong ca làm)
  const { isWorkingShift, isSuccess: isShiftStatusResolved } = useMyTodayAttendance();
  useLocationTracker({ enabled: isWorkingShift, isStatusResolved: isShiftStatusResolved, intervalMs: 60000 });

  const path = usePathname();

  const { navigateTo } = usePageTransition();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const activeMenu = path.startsWith('/app/profile') ? 'profile' : getActiveItemId(path);

  const { access, isReady, isPending } = useCan();

  // Menu theo quyền từ /me; chưa tải xong thì chưa hiện mục nào (ẩn trước, hiện sau)
  const filteredSections = React.useMemo(() => (isReady ? getSidebarSections(access) : []), [access, isReady]);
  const denied = isReady && !isRouteAllowed(path, access);

  const sidebarConfig = {
    brand: {
      name: 'XTTECH',
      subtitle: 'v' + process.env.NEXT_PUBLIC_APP_VERSION,
      logo: <XTLogo className="w-8 h-8 drop-shadow-[0_2px_5px_rgba(4,88,99,0.35)]" />,
      onClick: () => navigateTo('/app/dashboard'),
    },
    sections: filteredSections,
    onItemSelect: (item: SidebarItemProps) => {
      // Chặn người dùng truy cập một số tính năng trên sidebar
      const isAccepted = acceptedSections.includes(item.id);
      if (!isAccepted) {
        toast.loading('Tính năng đang được phát triển', { id: 'loading' });
        setTimeout(() => {
          toast.dismiss('loading');
        }, 1000);
        return;
      }

      if (item.href) {
        navigateTo(item.href);
      }
    },
    onItemSelectMobile: (item: SidebarItemProps) => {
      // Chặn người dùng truy cập một số tính năng trên sidebar
      const isAccepted = acceptedSections.includes(item.id);
      if (!isAccepted) {
        toast.loading('Tính năng đang được phát triển', { id: 'loading' });
        setTimeout(() => {
          toast.dismiss('loading');
        }, 1000);
        return;
      }

      if (item.href) {
        navigateTo(item.href);
      }
      setIsMobileOpen(false);
    },
  };

  return (
    <div className="flex h-screen w-screen bg-white relative overflow-hidden">
      {/* 1. Sidebar hiển thị trên Desktop */}
      <Sidebar
        variant="light"
        className="hidden md:flex h-full rounded-none border-y-0 border-l-0 border-r border-slate-200 shadow-none bg-white shrink-0"
        activeId={activeMenu}
        footer={<UserMenu />}
        brand={sidebarConfig.brand}
        sections={sidebarConfig.sections}
        onItemSelect={sidebarConfig.onItemSelect}
      />

      {/* 2. Sidebar Drawer trên Mobile */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300" onClick={() => setIsMobileOpen(false)} />
          <Sidebar
            variant="light"
            className="relative h-full w-72 rounded-none border-y-0 border-l-0 border-r border-slate-200 shadow-2xl bg-white z-10 animate-in slide-in-from-left duration-300"
            activeId={activeMenu}
            footer={
              <UserMenu
                onNavigate={() => {
                  setIsMobileOpen(false);
                }}
              />
            }
            brand={sidebarConfig.brand}
            sections={sidebarConfig.sections}
            onItemSelect={sidebarConfig.onItemSelectMobile}
          />
        </div>
      )}

      {/* 3. Vùng nội dung chính */}
      <div className="flex-1 h-full bg-slate-50 flex flex-col min-w-0">
        <div className="flex h-12 flex-none items-center border-b border-slate-200 bg-white px-2 md:hidden">
          <SidebarMenuButton onClick={() => setIsMobileOpen(true)} />
        </div>
        <div className="flex-1 overflow-y-auto font-body [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading [&_h4]:font-heading">
          {isPending ? <PageSkeleton /> : denied ? <AccessDenied /> : children}
        </div>
      </div>
      {DevPermissionPanel && <DevPermissionPanel />}
    </div>
  );
}
