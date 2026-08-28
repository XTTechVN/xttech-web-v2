'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { UserRole, HEADER_HEIGHT } from '@/config';
import { cn } from '@/utils';
import { AppBreadcrumb } from './app-breadcrumb';
import { HeaderProfile } from './header-profile';
import { HeaderSearch } from './header-search';

export interface AppHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  onMenuClick?: () => void;
  userRole?: UserRole;
  setActive: (id: string) => void;
}

export const AppHeader = React.forwardRef<HTMLDivElement, AppHeaderProps>(({ onMenuClick, userRole, setActive, className, ...props }, ref) => {
  return (
    <header ref={ref} className={cn('flex flex-col w-full bg-white border-b border-slate-200 shrink-0', className)} {...props}>
      {/* Top Header Bar */}
      <div style={{ height: HEADER_HEIGHT }} className="flex items-center justify-between px-4 md:px-6  border-b border-slate-100">
        {/* Left side: Mobile menu & Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            type="button"
            aria-label="Mở menu"
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
          >
            <Menu size={24} />
          </button>

          <HeaderSearch setActive={setActive} userRole={userRole} />
        </div>

        {/* Right side: Notifications & User profile */}
        <div className="flex items-center gap-2">
          {/* <InstallPwaButton className="inline-flex" /> */}
          <HeaderProfile userRole={userRole} />
        </div>
      </div>

      {/* Breadcrumb Bar */}
      <AppBreadcrumb />
    </header>
  );
});

AppHeader.displayName = 'AppHeader';
export default AppHeader;
