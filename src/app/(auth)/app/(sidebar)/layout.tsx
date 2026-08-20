'use client';

// React
import React from 'react';

// Next.js
import { usePathname, useRouter } from 'next/navigation';

// Third-party
import toast from 'react-hot-toast';

// Components
import { AppHeader, Sidebar, SidebarItemProps } from '@/components';

// Config
import { getSidebarSectionsForRole, UserRole, acceptedSections } from '@/config';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const pathSegments = path.split('/');
  const lastPath = pathSegments[pathSegments.length - 1];

  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState(lastPath);

  // Định nghĩa role hiện tại của user (mock, sau này có thể lấy từ auth context/store)
  const [userRole, setUserRole] = React.useState<UserRole>('admin');

  // Đồng bộ role từ cookie lúc component mount
  React.useEffect(() => {
    const xtAuthCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('xt-auth='))
      ?.split('=')[1];

    if (xtAuthCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(xtAuthCookie));
        const firstRole = parsed.roles?.[0];
        const roleCode = typeof firstRole === 'string' ? firstRole : firstRole?.code;
        if (roleCode) {
          setUserRole(roleCode as UserRole);
        }
      } catch {}
    }
  }, []);

  // Lấy danh sách sections đã được lọc theo role của user
  const filteredSections = React.useMemo(() => {
    return getSidebarSectionsForRole(userRole);
  }, [userRole]);

  const sidebarConfig = {
    brand: {
      name: 'XTTECH',
      subtitle: 'ERP SYSTEM',
      logo:<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 34" fill="none" className="w-8 h-8 text-primary">
            <path
              d="M11.8898 28.675L11.3631 24.4609C11.0778 24.3512 10.8089 24.2195 10.5565 24.0658C10.3041 23.9122 10.0571 23.7476 9.81571 23.572L5.89788 25.2181L2.27637 18.9628L5.66742 16.3948C5.64548 16.2412 5.6345 16.093 5.6345 15.9504C5.6345 15.8077 5.6345 15.6595 5.6345 15.5059C5.6345 15.3523 5.6345 15.2041 5.6345 15.0614C5.6345 14.9188 5.64548 14.7706 5.66742 14.617L2.27637 12.049L5.89788 5.79364L9.81571 7.43979C10.0571 7.2642 10.3096 7.09958 10.5729 6.94594C10.8363 6.7923 11.0997 6.66061 11.3631 6.55087L11.8898 2.33674H19.1329L19.6597 6.55087C19.945 6.66061 20.2139 6.7923 20.4663 6.94594C20.7187 7.09958 20.9656 7.2642 21.207 7.43979L25.1249 5.79364L28.7464 12.049L25.3553 14.617C25.3773 14.7706 25.3882 14.9188 25.3882 15.0614C25.3882 15.2041 25.3882 15.3523 25.3882 15.5059C25.3882 15.6595 25.3882 15.8077 25.3882 15.9504C25.3882 16.093 25.3663 16.2412 25.3224 16.3948L28.7134 18.9628L25.0919 25.2181L21.207 23.572C20.9656 23.7476 20.7132 23.9122 20.4498 24.0658C20.1864 24.2195 19.923 24.3512 19.6597 24.4609L19.1329 28.675H11.8898ZM14.1945 26.0412H16.7954L17.2563 22.5514C17.9367 22.3758 18.5677 22.1179 19.1493 21.7777C19.731 21.4375 20.2632 21.026 20.7461 20.5431L24.0055 21.8929L25.2895 19.6542L22.4581 17.5142C22.5678 17.2069 22.6447 16.8832 22.6886 16.543C22.7325 16.2028 22.7544 15.8571 22.7544 15.5059C22.7544 15.1547 22.7325 14.809 22.6886 14.4688C22.6447 14.1286 22.5678 13.8049 22.4581 13.4976L25.2895 11.3576L24.0055 9.11885L20.7461 10.5016C20.2632 9.9968 19.731 9.57429 19.1493 9.23409C18.5677 8.89388 17.9367 8.63598 17.2563 8.4604L16.8283 4.97057H14.2274L13.7665 8.4604C13.086 8.63598 12.455 8.89388 11.8734 9.23409C11.2918 9.57429 10.7595 9.98582 10.2766 10.4687L7.01726 9.11885L5.73327 11.3576L8.56464 13.4647C8.4549 13.7939 8.37808 14.1231 8.33418 14.4524C8.29028 14.7816 8.26833 15.1328 8.26833 15.5059C8.26833 15.8571 8.29028 16.1973 8.33418 16.5265C8.37808 16.8557 8.4549 17.185 8.56464 17.5142L5.73327 19.6542L7.01726 21.8929L10.2766 20.5102C10.7595 21.015 11.2918 21.4375 11.8734 21.7777C12.455 22.1179 13.086 22.3758 13.7665 22.5514L14.1945 26.0412ZM15.5772 20.1151C16.8502 20.1151 17.9367 19.6652 18.8366 18.7653C19.7365 17.8654 20.1864 16.7789 20.1864 15.5059C20.1864 14.2329 19.7365 13.1464 18.8366 12.2465C17.9367 11.3466 16.8502 10.8967 15.5772 10.8967C14.2822 10.8967 13.1903 11.3466 12.3014 12.2465C11.4125 13.1464 10.968 14.2329 10.968 15.5059C10.968 16.7789 11.4125 17.8654 12.3014 18.7653C13.1903 19.6652 14.2822 20.1151 15.5772 20.1151Z"
              fill="currentColor"
            />
          </svg>,
      onClick: () => router.push('/app/dashboard'),
    },
    sections: filteredSections,
    cta: {
      title: 'Cần hỗ trợ?',
      description: 'Liên hệ với chúng tôi để góp ý nếu chương trình có lỗi hoặc để cải thiện chương trình',
      buttonText: 'Liên hệ ngay',
      onButtonClick: () => {
        const phoneNumber = '0862163122';
        const userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';
        // Mở Zalo Native App trên iOS/Android
        if (/iPhone|iPod|iPad|Android/i.test(userAgent)) {
          window.location.href = `zalo://chat?phone=${phoneNumber}`;
        } else {
          // Mở Zalo Web / Zalo PC chuyển hướng trên Desktop
          window.open(`https://zalo.me/${phoneNumber}`, '_blank', 'noopener,noreferrer');
        }
      },
    },
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

      setActiveMenu(item.id);
      if (item.href) {
        router.push(item.href);
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

      setActiveMenu(item.id);
      if (item.href) {
        router.push(item.href);
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
        cta={sidebarConfig.cta}
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
            brand={sidebarConfig.brand}
            sections={sidebarConfig.sections}
            onItemSelect={sidebarConfig.onItemSelectMobile}
          />
        </div>
      )}

      {/* 3. Vùng nội dung chính */}
      <div className="flex-1 h-full bg-slate-50 flex flex-col min-w-0">
        <AppHeader onMenuClick={() => setIsMobileOpen(true)} userRole={userRole} />
        <div className="flex-1 p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
