'use client';

import React, { useState } from 'react';
import { Bell, User, Lock, LogOut } from 'lucide-react';
import { Avatar, Dropdown } from '@/components';
import { useAuthStore } from '@/stores';
import { BASE_MINIO_URL, UserRole } from '@/config';
import { ProfileModal } from './profile-modal';
import { PasswordModal } from './password-modal';

export interface HeaderProfileProps {
  userRole?: UserRole;
}

export function HeaderProfile({ userRole }: HeaderProfileProps) {
  const { user } = useAuthStore();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = 'xt-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    window.location.href = '/signin';
  };

  const roleName =
    user?.roles?.[0]?.name ||
    (userRole === 'admin'
      ? 'Quản trị viên'
      : userRole === 'hr'
        ? 'Nhân sự (HR)'
        : userRole === 'sale'
          ? 'Kinh doanh (Sale)'
          : 'Kỹ thuật viên (Technician)');

  const avatarUrl = user?.avatar
    ? user.avatar.startsWith('http')
      ? user.avatar
      : `${BASE_MINIO_URL}${user.avatar}`
    : null;

  return (
    <div className="flex items-center gap-4 md:gap-6">
      <button
        type="button"
        aria-label="Thông báo"
        className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
      >
        <Bell size={20} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
      </button>
      
      <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

      <Dropdown 
        align="right"
        trigger={
          <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 pr-2 rounded-xl transition-colors">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-700">{user?.fullName || user?.username || 'Admin User'}</span>
              <span className="text-xs text-slate-500">{roleName}</span>
            </div>
            <Avatar 
              src={avatarUrl || undefined} 
              name={user?.fullName || user?.username || 'Admin'} 
              size="md"   
            />
          </div>
        }
        items={[
          { label: 'Thông tin cá nhân', icon: <User size={16} />, onClick: () => setIsProfileOpen(true) },
          { label: 'Đổi mật khẩu', icon: <Lock size={16} />, onClick: () => setIsPasswordOpen(true) },
          { label: 'Đăng xuất', icon: <LogOut size={16} />, danger: true, onClick: handleLogout },
        ]}
      />

      {/* Modals */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <PasswordModal isOpen={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} />
    </div>
  );
}
