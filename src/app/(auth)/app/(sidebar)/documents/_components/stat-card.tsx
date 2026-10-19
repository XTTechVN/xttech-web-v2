'use client';

import React from 'react';
import { TrendingDown, TrendingUp, FileText, Folder, Users, HardDrive } from 'lucide-react';
import { cn } from '@/utils';

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number;
  trendDirection?: 'up' | 'down';
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendDirection = 'up',
  onClick,
  className,
}) => {
  const isUp = trendDirection === 'up';

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl md:rounded-2xl shadow-xs p-4 flex flex-col justify-between gap-4 hover:shadow-sm transition-all duration-200 border border-gray-100 w-full cursor-pointer select-none',
        className
      )}
    >
      <div className="flex items-center justify-between relative">
        <div className="p-3 rounded-xl bg-primary/5 text-primary flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 shrink-0">
          {icon}
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              'px-2 py-0.5 rounded-full text-[11px] md:text-xs font-semibold flex items-center gap-1 shrink-0',
              isUp ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            )}
          >
            {isUp ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-gray-500 text-xs font-medium truncate" title={title}>
          {title}
        </span>
        <span className="text-xl md:text-2xl font-bold text-primary tracking-tight">
          {value}
        </span>
      </div>
    </div>
  );
};

// Data mockup 4 thẻ liên quan đến Tài liệu của tôi
export const MOCK_DOCUMENT_STATS = [
  {
    title: 'Tổng số tài liệu',
    value: 128,
    icon: <FileText />,
    trend: 10,
    trendDirection: 'up' as const,
  },
  {
    title: 'Tổng số thư mục',
    value: 16,
    icon: <Folder />,
    trend: 15,
    trendDirection: 'up' as const,
  },
  {
    title: 'Đang chia sẻ',
    value: 7,
    icon: <Users />,
    trend: 2,
    trendDirection: 'up' as const,
  },
  {
    title: 'Dung lượng đã dùng',
    value: '2.4 GB',
    icon: <HardDrive />,
    trend: 0,
    trendDirection: 'up' as const,
  },
];

// Alias để tương thích
export const MOCK_STAT_CARDS = MOCK_DOCUMENT_STATS;

export default StatCard;
