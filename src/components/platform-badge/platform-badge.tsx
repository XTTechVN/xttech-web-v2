import React from 'react';
import { DevicePlatform } from '@/types';
import { Laptop } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface PlatformBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  platform?: DevicePlatform | string | null;
  variant?: 'minimal' | 'badge';
  showIconOnly?: boolean;
}

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({
  platform,
  variant = 'minimal',
  showIconOnly = false,
  className,
  ...props
}) => {
  const normPlatform = (platform || 'web').toLowerCase();

  // 1. Dạng tối giản Status Bar (Khuyến nghị: Không viền, không cộm, hòa nhập tự nhiên bên cạnh Pin)
  if (variant === 'minimal') {
    if (normPlatform === 'ios') {
      return (
        <span
          title="Điểm danh từ thiết bị iOS (iPhone/iPad)"
          className={cn(
            'inline-flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-help select-none shrink-0',
            className
          )}
          {...props}
        >
          <svg className="w-3 h-3 fill-current" viewBox="0 0 170 170">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.71-11.65-14.01-6.19-9.56-10.9-20.73-14.13-33.52-3.23-12.78-4.85-24.89-4.85-36.32 0-16.14 3.99-29.35 11.97-39.63 7.98-10.27 18.24-15.54 30.77-15.8 4.9.11 10.42 1.45 16.56 4.02 6.14 2.57 10.23 3.9 12.28 3.99 1.54 0 5.69-1.39 12.45-4.17 6.76-2.78 12.59-4.04 17.5-3.77 13.91.73 24.82 5.86 32.72 15.38-12.21 7.39-18.17 17.65-17.88 30.79.29 10.33 4.22 18.97 11.79 25.92 7.57 6.95 16.63 10.99 27.18 12.12-2.31 7.15-5.32 14.54-9.03 22.18zM119.22 33.15c0-7.22 2.65-13.88 7.95-19.98 5.3-6.1 11.73-10.15 19.28-12.17.43 1.96.65 3.92.65 5.87 0 7.22-2.72 13.98-8.16 20.28-5.44 6.3-11.99 10.19-19.65 11.67-.07-1.89-.07-3.78-.07-5.67z" />
          </svg>
        </span>
      );
    }

    if (normPlatform === 'android') {
      return (
        <span
          title="Điểm danh từ thiết bị Android"
          className={cn(
            'inline-flex items-center text-slate-400 hover:text-emerald-600 transition-colors cursor-help select-none shrink-0',
            className
          )}
          {...props}
        >
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4126 13.8533 8.0818 12 8.0818c-1.8533 0-3.5902.3308-5.1368.8679L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
          </svg>
        </span>
      );
    }

    return (
      <span
        title="Điểm danh từ trình duyệt Web App"
        className={cn(
          'inline-flex items-center text-slate-400 hover:text-blue-600 transition-colors cursor-help select-none shrink-0',
          className
        )}
        {...props}
      >
        <Laptop size={12} className="stroke-[2.2]" />
      </span>
    );
  }

  // 2. Dạng Badge Box có nhãn (dùng khi cần hiển thị đầy đủ tên nền tảng)
  if (normPlatform === 'ios') {
    return (
      <span
        title="Điểm danh từ thiết bị iOS (iPhone/iPad)"
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 shrink-0 select-none',
          className
        )}
        {...props}
      >
        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 170 170">
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.71-11.65-14.01-6.19-9.56-10.9-20.73-14.13-33.52-3.23-12.78-4.85-24.89-4.85-36.32 0-16.14 3.99-29.35 11.97-39.63 7.98-10.27 18.24-15.54 30.77-15.8 4.9.11 10.42 1.45 16.56 4.02 6.14 2.57 10.23 3.9 12.28 3.99 1.54 0 5.69-1.39 12.45-4.17 6.76-2.78 12.59-4.04 17.5-3.77 13.91.73 24.82 5.86 32.72 15.38-12.21 7.39-18.17 17.65-17.88 30.79.29 10.33 4.22 18.97 11.79 25.92 7.57 6.95 16.63 10.99 27.18 12.12-2.31 7.15-5.32 14.54-9.03 22.18zM119.22 33.15c0-7.22 2.65-13.88 7.95-19.98 5.3-6.1 11.73-10.15 19.28-12.17.43 1.96.65 3.92.65 5.87 0 7.22-2.72 13.98-8.16 20.28-5.44 6.3-11.99 10.19-19.65 11.67-.07-1.89-.07-3.78-.07-5.67z" />
        </svg>
        {!showIconOnly && <span>iOS</span>}
      </span>
    );
  }

  if (normPlatform === 'android') {
    return (
      <span
        title="Điểm danh từ thiết bị Android"
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 select-none',
          className
        )}
        {...props}
      >
        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
          <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4126 13.8533 8.0818 12 8.0818c-1.8533 0-3.5902.3308-5.1368.8679L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
        </svg>
        {!showIconOnly && <span>Android</span>}
      </span>
    );
  }

  return (
    <span
      title="Điểm danh từ Web App (Trình duyệt máy tính/di động)"
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0 select-none',
        className
      )}
      {...props}
    >
      <Laptop size={11} className="text-blue-600" />
      {!showIconOnly && <span>Web</span>}
    </span>
  );
};
