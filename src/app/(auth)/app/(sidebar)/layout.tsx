'use client';

// React
import React from 'react';

// Next.js
import { usePathname, useRouter } from 'next/navigation';

// Third-party
import toast from 'react-hot-toast';

// Components
import { Sidebar, SidebarItemProps as SidebarItemType } from '@/components';

// Config
import { getSidebarSectionsForRole, UserRole, acceptedSections, BASE_MINIO_URL } from '@/config';

// Stores
import { useAuthStore } from '@/stores';

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
        const normalized = roleCode === 'super' ? 'admin' : roleCode;
        if (normalized) {
          setUserRole(normalized as UserRole);
        }
      } catch (e) {}
    }
  }, []);

  // Lấy danh sách sections đã được lọc theo role của user
  const filteredSections = React.useMemo(() => {
    return getSidebarSectionsForRole(userRole);
  }, [userRole]);


  const user = useAuthStore((state) => state.user);

  const sidebarConfig = {
    user: {
      name: user?.fullName || 'Nhân viên',
      role: user?.roles?.[0]?.name ||
        (userRole === 'admin'
          ? 'Quản trị viên'
          : userRole === 'hr'
            ? 'Nhân sự (HR)'
            : userRole === 'sale'
              ? 'Kinh doanh (Sale)'
              : 'Kỹ thuật viên (Technician)'),
      avatar: user?.avatar
        ? (user.avatar.startsWith('http') ? user.avatar : `${BASE_MINIO_URL}${user.avatar}`)
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    },
    sections: filteredSections,
    cta: {
      title: 'Cần hỗ trợ?',
      description: 'Liên hệ với chúng tôi để được tư vấn thêm về các dịch vụ của chúng tôi.',
      buttonText: 'Liên hệ ngay',
    },
    onItemSelect: (item: SidebarItemType) => {
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
    onItemSelectMobile: (item: SidebarItemType) => {
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
        user={sidebarConfig.user}
        sections={sidebarConfig.sections}
        onItemSelect={sidebarConfig.onItemSelect}
        onUserClick={() => router.push('/app/profile')}
      />

      {/* 2. Sidebar Drawer trên Mobile */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300" onClick={() => setIsMobileOpen(false)} />
          <Sidebar
            variant="light"
            className="relative h-full w-72 rounded-none border-y-0 border-l-0 border-r border-slate-200 shadow-2xl bg-white z-10 animate-in slide-in-from-left duration-300"
            activeId={activeMenu}
            user={sidebarConfig.user}
            sections={sidebarConfig.sections}
            onItemSelect={sidebarConfig.onItemSelectMobile}
            onUserClick={() => {
              router.push('/app/profile');
              setIsMobileOpen(false);
            }}
          />
        </div>
      )}

      {/* 3. Vùng nội dung chính */}
      <div className="flex-1 h-full bg-slate-50 flex flex-col min-w-0">
        <div className="flex-1 p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
