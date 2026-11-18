'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader, Sidebar, SidebarItemProps, XTLogo } from '@/components';
import { getSidebarSections } from '@/config';

// Layout mockup: dùng đúng Sidebar + AppHeader của hệ thống nhưng không cần đăng nhập/API chấm công.
export default function UiTestLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState('employees-root');
  const sections = React.useMemo(() => getSidebarSections({ canAny: () => true, isPlatformAdmin: true }), []);

  const brand = {
    name: 'XTTECH',
    subtitle: 'ui-test',
    logo: <XTLogo className="w-8 h-8 drop-shadow-[0_2px_5px_rgba(4,88,99,0.35)]" />,
  };

  const handleSelect = (item: SidebarItemProps) => {
    setActiveMenu(item.id);
    if (item.href) router.push(item.href);
    setIsMobileOpen(false);
  };

  return (
    <div className="flex h-screen w-screen bg-white relative overflow-hidden">
      <Sidebar
        variant="light"
        className="hidden md:flex h-full rounded-none border-y-0 border-l-0 border-r border-slate-200 shadow-none bg-white shrink-0"
        activeId={activeMenu}
        brand={brand}
        sections={sections}
        onItemSelect={handleSelect}
      />

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsMobileOpen(false)} />
          <Sidebar
            variant="light"
            className="relative h-full w-72 rounded-none border-y-0 border-l-0 border-r border-slate-200 shadow-2xl bg-white z-10"
            activeId={activeMenu}
            brand={brand}
            sections={sections}
            onItemSelect={handleSelect}
          />
        </div>
      )}

      <div className="flex-1 h-full bg-[#a6c1b733] flex flex-col min-w-0">
        <AppHeader setActive={setActiveMenu} onMenuClick={() => setIsMobileOpen(true)} />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
