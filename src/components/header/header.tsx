'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import { HEADER_HEIGHT } from '@/config';
import { Search, Bell, Mail } from 'lucide-react';

export interface HeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  notificationBadge?: React.ReactNode;
  messageBadge?: React.ReactNode;
  onNotificationClick?: () => void;
  onMessageClick?: () => void;
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  (
    {
      className,
      title,
      searchValue,
      onSearchChange,
      searchPlaceholder = 'Tìm kiếm nhanh chóng...',
      notificationBadge,
      messageBadge,
      onNotificationClick,
      onMessageClick,
      ...props
    },
    ref,
  ) => {
    return (
      <header
        ref={ref}
        style={{ height: HEADER_HEIGHT }}
        className={cn(
          'flex items-center justify-between border-b border-slate-200 bg-white px-4 shrink-0 select-none',
          className,
        )}
        {...props}
      >
        {/* Vùng trái: Tiêu đề */}
        <div className="flex items-center">
          {typeof title === 'string' ? (
            <h1 className="text-md md:text-lg font-bold text-primary tracking-tight">{title}</h1>
          ) : (
            title
          )}
        </div>

        {/* Vùng phải: Các công cụ global & nút hành động */}
        <div className="flex items-center gap-6">
          {/* Thanh tìm kiếm */}
          {/* {onSearchChange && (
            <div className="relative w-64 hidden sm:block">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 pl-10 pr-4 w-full rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all duration-200"
              />
            </div>
          )} */}

          {/* Cụm Notification & Message */}
          <div className="flex items-center gap-2">
            {/* Tin nhắn */}
            <button
              onClick={onMessageClick}
              className="relative p-2 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <Mail size={18} />
              {messageBadge !== undefined && messageBadge !== null && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-danger text-white text-[9px] font-bold rounded-full border border-white">
                  {messageBadge}
                </span>
              )}
            </button>

            {/* Thông báo */}
            <button
              onClick={onNotificationClick}
              className="relative p-2 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <Bell size={18} />
              {notificationBadge !== undefined && notificationBadge !== null && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-danger text-white text-[9px] font-bold rounded-full border border-white">
                  {notificationBadge}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    );
  },
);

Header.displayName = 'Header';

export default Header;
export { Header };
