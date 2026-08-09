'use client';

import React from 'react';
import { MessageSquare, ClipboardList, CheckCircle2, Smile, TrendingUp, Clock, Star, StarHalf } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getSuggestions } from '@/actions/suggestion';
import { Suggestion } from '@/types';
import { Skeleton } from '@/components';
import toast from 'react-hot-toast';

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

  return (
    <div className={`${gridClass} gap-4 select-none w-full`}>
      {/* Card 1: Tổng số đề xuất */}
      <div className="bg-white border border-slate-200/60 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xs flex flex-col gap-2 hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 font-semibold text-[13px] md:text-[14px] leading-5">Tổng số đề xuất</span>
            <span className="text-[32px] md:text-[48px] font-bold text-primary leading-none">{Intl.NumberFormat('en-US').format(totalFeedback)}</span>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#e6f6f8] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-primary font-medium text-[11px] md:text-[12px] leading-tight">
          <TrendingUp className="w-3.5 h-3.5 shrink-0" />
          <span>+12% so với tháng trước</span>
        </div>
      </div>

      {/* Card 2: Đang xử lý */}
      <div className="bg-white border border-slate-200/60 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xs flex flex-col gap-2 hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 font-medium text-[13px] md:text-[14px] leading-5">Đang xử lý</span>
            <span className="text-[32px] md:text-[48px] font-bold text-[#5C647A] leading-none">
              {Intl.NumberFormat('en-US').format(pendingCount)}
            </span>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#f0f1fa] flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5 md:w-6 md:h-6 text-[#5c68ad]" />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px] md:text-[12px] leading-tight">
          <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span>Trung bình 24h xử lý</span>
        </div>
      </div>

      {/* Card 3: Đã hoàn thành */}
      <div className="bg-white border border-slate-200/60 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xs flex flex-col gap-2 hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 font-medium text-[13px] md:text-[14px] leading-5">Đã hoàn thành</span>
            <span className="text-[32px] md:text-[48px] font-bold text-[#005e70] leading-none">
              {Intl.NumberFormat('en-US').format(completedCount)}
            </span>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#e6f6f8] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#005e70]" />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[#005e70] font-medium text-[11px] md:text-[12px] leading-tight">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Tỷ lệ giải quyết {resolvePercent > 0 ? `${resolvePercent}%` : '0%'}</span>
        </div>
      </div>

      {/* Card 4: Độ hài lòng TB */}
      <div className="bg-white border border-slate-200/60 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xs flex flex-col gap-2 hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 font-medium text-[13px] md:text-[14px] leading-5">Độ hài lòng TB</span>
            <span className="text-[32px] md:text-[48px] font-bold text-[#d97706] leading-none">4.8</span>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#fef3c7] flex items-center justify-center shrink-0">
            <Smile className="w-5 h-5 md:w-6 md:h-6 text-[#d97706]" />
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
          <StarHalf className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
        </div>
      </div>
    </div>
  );
}
