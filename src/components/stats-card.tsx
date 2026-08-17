'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number;
  trendDirection?: 'up' | 'down';
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  trendDirection = 'up',
  onClick,
}: StatsCardProps) {
  const isUp = trendDirection === 'up';

  return (
    <div
      className="bg-white rounded-xl md:rounded-2xl shadow-xs p-3 md:p-4 flex flex-col gap-2 md:gap-4 hover:shadow-sm transition w-full cursor-pointer border border-gray-100"
      onClick={onClick}
    >
      <div className="flex items-center relative">
        <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-primary/5 text-primary [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5">
          {icon}
        </div>
        {trend !== undefined && trend !== 0 && (
          <div
            className={`px-2 py-0.5 absolute right-0 top-0 rounded-full text-[10px] md:text-xs font-semibold flex items-center gap-0.5 md:gap-1 ${isUp ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
          >
            {isUp ? <TrendingUp className="w-3 h-3 md:w-4 md:h-4" /> : <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 md:gap-3">
        <span className="text-gray-500 text-[10px] md:text-xs font-medium truncate whitespace-nowrap overflow-hidden">{title}</span>
        <span className="text-lg md:text-2xl font-bold text-primary">{value}</span>
      </div>
    </div>
  );
}
