'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Building2, KeyRound, LogOut, Newspaper, ShieldCheck, Smartphone, Users } from 'lucide-react';
import { Sidebar, SidebarMenuButton, type SidebarItemProps } from '@/components';
import { Button } from '@/components-remake';
import { useAuthStore, useMeStore } from '@/stores';

const ITEMS: SidebarItemProps[] = [
  { id: '/platform', label: 'Doanh nghiệp', icon: <Building2 size={18} />, href: '/platform' },
  { id: '/platform/users', label: 'Người dùng', icon: <Users size={18} />, href: '/platform/users' },
  { id: '/platform/permissions', label: 'Danh mục quyền', icon: <KeyRound size={18} />, href: '/platform/permissions' },
  { id: '/platform/app-versions', label: 'Phiên bản ứng dụng', icon: <Smartphone size={18} />, href: '/platform/app-versions' },
  { id: '/platform/news', label: 'Tin tức', icon: <Newspaper size={18} />, href: '/platform/news' },
];
const SECTIONS = [{ items: ITEMS }];

// Mục đang mở: khớp tiền tố dài nhất (/platform chỉ khớp chính nó và trang doanh nghiệp)
const activeOf = (path: string) => {
  if (path === '/platform' || path.startsWith('/platform/organizations')) return '/platform';
  return ITEMS.find((i) => i.id !== '/platform' && path.startsWith(i.id))?.id;
};

// Khu riêng của quản trị nền tảng. Người không phải quản trị nền tảng bị đưa về /app.
export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const me = useMeStore((s) => s.me);
  const status = useMeStore((s) => s.status);
  const fullName = useAuthStore((s) => s.user?.fullName);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    useMeStore.getState().load();
  }, []);

  const denied = status === 'ready' && !me?.isPlatformAdmin;
  useEffect(() => {
    if (denied) router.replace('/app/dashboard');
  }, [denied, router]);

  const logout = async () => {
    await useAuthStore.getState().signout();
    useMeStore.getState().clear();
    window.location.replace('/signin');
  };

  if (status !== 'ready' || denied) {
    return (
      <div className="flex h-dvh items-center justify-center bg-white" aria-busy="true">
        {status === 'error' ? (
          <p className="text-sm text-slate-500">Không tải được dữ liệu. Tải lại trang để thử lại.</p>
        ) : (
          <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
        )}
      </div>
    );
  }

  const brand = {
    name: 'XTTECH',
    subtitle: 'Quản trị nền tảng',
    logo: <ShieldCheck size={28} className="text-primary" aria-hidden="true" />,
    onClick: () => router.push('/platform'),
  };
  const footer = (
    <div className="flex flex-col gap-2 p-1">
      <p className="truncate px-2 text-sm text-slate-600">{fullName || me?.user.username}</p>
      <Button variant="outline" icon={<LogOut size={16} />} onClick={logout}>
        Đăng xuất
      </Button>
    </div>
  );
  const select = (item: SidebarItemProps) => {
    if (item.href) router.push(item.href);
    setMobileOpen(false);
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-white">
      <Sidebar
        variant="light"
        className="hidden h-full shrink-0 rounded-none border-y-0 border-l-0 border-r border-slate-200 bg-white shadow-none md:flex"
        activeId={activeOf(path)}
        footer={footer}
        brand={brand}
        sections={SECTIONS}
        onItemSelect={select}
      />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <Sidebar
            variant="light"
            className="relative z-10 h-full w-72 rounded-none border-y-0 border-l-0 border-r border-slate-200 bg-white shadow-2xl"
            activeId={activeOf(path)}
            footer={footer}
            brand={brand}
            sections={SECTIONS}
            onItemSelect={select}
          />
        </div>
      )}

      <div className="flex h-full min-w-0 flex-1 flex-col bg-slate-50">
        <div className="flex h-12 flex-none items-center border-b border-slate-200 bg-white px-2 md:hidden">
          <SidebarMenuButton onClick={() => setMobileOpen(true)} />
        </div>
        <div className="flex-1 overflow-y-auto font-body [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading">{children}</div>
      </div>
    </div>
  );
}
