'use client';

import React from 'react';
import toast from 'react-hot-toast';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  Header,
  SidebarItemProps as SidebarItemType,
  SidebarSubItem as SidebarSubItemType,
  SidebarSectionProps as SidebarSectionType,
} from '@/components';
import { Menu, Layout, CalendarCheck, Clock, FileText, ShieldCheck, ListChecks, User } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const pathSegments = path.split('/');
  const lastPath = pathSegments[pathSegments.length - 1];

  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState(lastPath);

  const acceptedSections = ['dashboard', 'attendances', 'employees', 'suggestions', 'departments'];
  const sidebarConfig: {
    user: {
      name: string;
      role: string;
      avatar: string;
    };
    sections: SidebarSectionType[];
    cta: {
      title: string;
      description: string;
      buttonText: string;
    };
    onItemSelect: (item: SidebarItemType) => void;
    onItemSelectMobile: (item: SidebarItemType) => void;
  } = {
    user: {
      name: 'Nguyễn Văn Anh',
      role: 'Quản trị viên',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    },
    sections: [
      // Điều hành
      {
        title: 'Điều hành doanh nghiệp',
        items: [
          {
            id: 'dashboard',
            label: 'Tổng quan',
            icon: <Layout size={18} />,
            href: '/app/admin/dashboard',
          },
        ],
      },
      // Quản lý nhân sự
      {
        title: 'Quản lý nhân sự',
        items: [
          {
            id: 'employees-root',
            label: 'Nhân viên',
            icon: <User size={18} />,
            href: '/app/admin/employees',
            subItems: [
              {
                id: 'departments',
                label: 'Danh sách phòng ban',
                href: '/app/admin/departments',
              },
              {
                id: 'employees',
                label: 'Danh sách nhân viên',
                href: '/app/admin/employees',
              },
            ],
          },
          {
            id: 'attendances',
            label: 'Bảng chấm công',
            icon: <CalendarCheck size={18} />,
            href: '/app/admin/attendances',
          },
          {
            id: 'shifts',
            label: 'Ca làm việc',
            icon: <Clock size={18} />,
            href: '/app/admin/shifts',
          },
          {
            id: 'leave-request',
            label: 'Nghỉ phép & Đơn từ',
            icon: <FileText size={18} />,
            href: '/app/admin/leave-requests',
          },
          {
            id: 'attendances-policy',
            label: 'Chính sách chấm công',
            icon: <ShieldCheck size={18} />,
            href: '/app/admin/attendances-policy',
          },
          {
            id: 'attendances-summary',
            label: 'Bảng tổng hợp',
            icon: <ListChecks size={18} />,
            href: '/app/admin/attendances-summary',
          },
        ],
      },
      // Quản lý dự án
      {
        title: 'Quản lý dự án',
        items: [
          {
            id: 'projects',
            label: 'Danh sách dự án',
            icon: <CalendarCheck size={18} />,
            href: '/app/admin/projects',
          },
          {
            id: 'project-tasks',
            label: 'Công việc',
            icon: <Clock size={18} />,
            href: '/app/admin/project-tasks',
          },
        ],
      },
      // Góp ý đề xuất
      {
        title: 'Góp ý đề xuất',
        items: [
          {
            id: 'suggestions',
            label: 'Danh sách góp ý',
            icon: <CalendarCheck size={18} />,
            href: '/app/admin/suggestions',
          },
        ],
      },
    ],
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
          />
        </div>
      )}

      {/* 3. Vùng nội dung chính */}
      <div className="flex-1 h-full bg-slate-50 flex flex-col min-w-0">
        {/* <Header
          className="border-x-0 border-t-0 bg-white"
          title={
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="md:hidden p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer shadow-xs"
              >
                <Menu size={18} />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight">
                {sidebarConfig.sections
                  .flatMap((section) => section.items)
                  .flatMap((item) => [...(item.subItems || []), item])
                  .find((item) => item.id === activeMenu)?.label || 'XTTech quản lý doanh nghiệp'}
              </h1>
            </div>
          }
          notificationBadge={null}
          messageBadge={null}
        /> */}

        {/* Nội dung trang con */}
        <div className="flex-1 p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
