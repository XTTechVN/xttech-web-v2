'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { UserRole } from '@/config';
import { AppBreadcrumb } from './_components/app-breadcrumb';
import { HeaderProfile } from './_components/header-profile';
import { HeaderSearch } from './_components/header-search';

interface AppHeaderProps {
  onMenuClick?: () => void;
  userRole?: UserRole;
}

export default function AppHeader({ onMenuClick, userRole }: AppHeaderProps) {
  return (
    <div className="flex flex-col w-full bg-white border-b border-slate-200 shrink-0">
      {/* Top Header Bar */}
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left side: Mobile menu & Search */}
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          
          <HeaderSearch userRole={userRole} />
        </div>

        {/* Right side: Notifications & User profile */}
        <HeaderProfile userRole={userRole} />
      </div>

      {/* Breadcrumb Bar */}
      <AppBreadcrumb />
    </div>
  );
}
