'use client';

import { useSidebar } from '@/contexts/SidebarProvider';
import { Bell, Menu } from 'lucide-react';

import { HEADER_HEIGHT } from '@/config/ui';

import useAuthStore from '@/stores/useAuthStore';
import useUserStore from '@/stores/useUserStore';

export default function AppHeader() {
  const { toggle } = useSidebar();
  const { user } = useUserStore();
  const { signout } = useAuthStore();

  const handleSignout = () => {
    signout();
    window.location.href = '/signin';
  };

  return (
    <div className="flex items-center justify-between px-4 py-2" style={{ height: HEADER_HEIGHT }}>
      {/* Menu button & App name */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="w-8 h-8 bg-primary rounded-full cursor-pointer flex items-center justify-center"
        >
          <Menu />
        </button>
        <span className="text-lg font-semibold">Camera Vision</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <span className="text-sm">Xin chào, {user?.fullName}</span>

        <button
          onClick={toggle}
          className="bg-primary rounded-full cursor-pointer flex items-center justify-center p-2 text-sm"
        >
          <Bell size={16} />
        </button>

        <button
          onClick={handleSignout}
          className="bg-primary rounded-full cursor-pointer flex items-center justify-center p-2 text-sm"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
