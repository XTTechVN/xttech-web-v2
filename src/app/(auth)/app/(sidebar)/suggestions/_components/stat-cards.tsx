'use client';

import React from 'react';
import { MessageSquare, ClipboardList, CheckCircle2, Smile, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getSuggestions } from '@/actions/suggestion';
import { Suggestion } from '@/types';
import { Skeleton } from '@/components';
import toast from 'react-hot-toast';

// Thẻ thống kê dùng chung cho suggestions
const StatCart = ({
  title,
  value,
  icon,
  trend,
  trendDirection = 'up',
  onClick,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number;
  trendDirection?: 'up' | 'down';
  onClick?: () => void;
}) => {
  const isUp = trendDirection === 'up';

  return (
    <div
      className="bg-white rounded-xl md:rounded-2xl shadow-xs p-3 md:p-4 flex flex-col gap-2 md:gap-4 hover:shadow-sm transition w-full cursor-pointer border border-gray-100"
      onClick={onClick}
    >
      <div className="flex items-center relative">
        <div className={`p-2 md:p-3 rounded-lg md:rounded-xl bg-primary/5 text-primary [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5`}>
          {icon}
        </div>
        {trend !== undefined && (
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
};

export default function StatCards({ containerWidth }: { containerWidth?: number }) {
  // Fetch suggestions to calculate accurate statistics
  const {
    data: suggestionsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-suggestions-all-stats'],
    queryFn: () => getSuggestions({ limit: 1000 }),
    refetchOnWindowFocus: false,
  });

  React.useEffect(() => {
    if (isError && error) {
      toast.error('Không thể tải dữ liệu thống kê.');
    }
  }, [isError, error]);

  const isLarge = containerWidth ? containerWidth >= 900 : false;
  const isMedium = containerWidth ? containerWidth >= 400 && containerWidth < 900 : false;

  const gridClass = containerWidth
    ? isLarge
      ? 'grid grid-cols-4'
      : isMedium
        ? 'grid grid-cols-2'
        : 'grid grid-cols-1'
    : 'grid grid-cols-2 md:grid-cols-4';

  if (isLoading) {
    return (
      <div className={`${gridClass} gap-4 md:gap-6 w-full select-none`}>
        <Skeleton className="w-full h-32 md:h-40 rounded-2xl md:rounded-3xl" />
        <Skeleton className="w-full h-32 md:h-40 rounded-2xl md:rounded-3xl" />
        <Skeleton className="w-full h-32 md:h-40 rounded-2xl md:rounded-3xl" />
        <Skeleton className="w-full h-32 md:h-40 rounded-2xl md:rounded-3xl" />
      </div>
    );
  }

  const proposals = suggestionsData?.items || [];
  const totalFeedback = proposals.length;

  // Tính số lượng đang xử lý (pending)
  const pendingCount = proposals.filter((p: Suggestion) => p.status === 'pending').length;

  // Tính số lượng đã hoàn thành (approve) và reject
  const completedCount = proposals.filter((p: Suggestion) => p.status === 'approve' || p.status === 'reject').length;
  const resolvePercent = totalFeedback > 0 ? Math.round((completedCount / totalFeedback) * 100) : 0;

  const suggestionStats = [
    {
      title: 'Tổng số đề xuất',
      value: totalFeedback,
      icon: <MessageSquare />,
      trend: 12,
      trendDirection: 'up' as const,
    },
    {
      title: 'Đang xử lý',
      value: pendingCount,
      icon: <ClipboardList />,
    },
    {
      title: 'Đã hoàn thành',
      value: completedCount,
      icon: <CheckCircle2 />,
      trend: resolvePercent,
      trendDirection: 'up' as const,
    },
    {
      title: 'Độ hài lòng TB',
      value: 4.8,
      icon: <Smile />,
    },
  ];

  return (
    <div className={`${gridClass} gap-4 select-none w-full`}>
      {suggestionStats.map((stat, index) => (
        <StatCart key={index} title={stat.title} value={stat.value} icon={stat.icon} trend={stat.trend} trendDirection={stat.trendDirection} />
      ))}
    </div>
  );
}
