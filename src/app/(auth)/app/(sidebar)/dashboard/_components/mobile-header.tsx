'use client';

import React from 'react';
import { useAuthStore } from '@/stores';
import { getFileUrl } from '@/utils';
import { Sparkles, Calendar } from 'lucide-react';
import Image from 'next/image';

interface MobileHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onRefresh, isRefreshing }) => {
  const user = useAuthStore((state) => state.user);

  // Lời chào theo giờ trong ngày
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  // Định dạng ngày hiện tại tiếng Việt
  const todayStr = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const displayName = user?.fullName || user?.username || 'Bạn';
  const roleName = user?.positions?.[0]?.name || user?.roles?.[0]?.name || 'Nhân sự';
  const avatarUrl = user?.avatar ? getFileUrl(user.avatar) : null;

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/20 bg-primary/10 flex items-center justify-center shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <span className="text-primary font-bold text-lg uppercase">
                {displayName.charAt(0)}
              </span>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <span>{getGreeting()}</span>
              <Sparkles size={13} className="text-amber-500" />
            </div>
            <h1 className="text-base font-bold text-gray-900 leading-tight line-clamp-1">
              {displayName}
            </h1>
            <span className="text-[11px] text-primary font-medium mt-0.5 line-clamp-1">
              {roleName}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Làm mới dữ liệu"
          className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition active:scale-95 shrink-0"
        >
          <div className={`w-4 h-4 rounded-full border-2 border-primary border-t-transparent ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-gray-50 text-[11px] text-gray-500 font-medium">
        <Calendar size={13} className="text-primary shrink-0" />
        <span className="capitalize">{todayStr}</span>
      </div>
    </div>
  );
};

export default MobileHeader;
