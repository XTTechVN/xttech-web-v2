'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { Avatar } from '@/components';
import { useAuthStore } from '@/stores';
import { BASE_MINIO_URL, UserRole } from '@/config';

interface HeaderProfileProps {
  userRole?: UserRole;
}

export function HeaderProfile({ userRole }: HeaderProfileProps) {
  const { user } = useAuthStore();
  
  const roleName = user?.roles?.[0]?.name ||
        (userRole === 'admin'
          ? 'Quản trị viên'
          : userRole === 'hr'
            ? 'Nhân sự (HR)'
            : userRole === 'sale'
              ? 'Kinh doanh (Sale)'
              : 'Kỹ thuật viên (Technician)');

  return (
    <div className="flex items-center gap-4 md:gap-6">
      <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
        <Bell size={20} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
      </button>
      
      <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

      <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 pr-2 rounded-xl transition-colors">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-semibold text-slate-700">{user?.fullName || user?.username || 'Admin User'}</span>
          <span className="text-xs text-slate-500">{roleName}</span>
        </div>
        <Avatar 
          src={user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${BASE_MINIO_URL}${user.avatar}`) : undefined} 
          name={user?.fullName || user?.username || 'Admin'} 
          size="md" 
        />
      </div>
    </div>
  );
}
