'use client';

import React from 'react';
import { Bell, MessageSquareCheck, MessagesSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getSuggestions } from '@/actions/suggestion';
import { Suggestion } from '@/types';
import { Skeleton } from '@/components';

export default function StatCards({ containerWidth }: { containerWidth?: number }) {
  // Fetch suggestions to calculate accurate statistics
  const { data: suggestionsData, isLoading } = useQuery({
    queryKey: ['admin-suggestions-all-stats'],
    queryFn: () => getSuggestions({ limit: 1000 }),
  });

  const isLarge = containerWidth ? containerWidth >= 1200 : false;
  const isMedium = containerWidth ? containerWidth >= 640 && containerWidth < 1200 : false;

  const gridClass = containerWidth
    ? isLarge
      ? 'grid grid-cols-[1fr_1fr_1fr_1.8fr]'
      : isMedium
        ? 'grid grid-cols-2'
        : 'grid grid-cols-1'
    : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.8fr]';

  const legendGridClass = containerWidth
    ? containerWidth >= 1350
      ? 'grid grid-cols-2 gap-x-4 gap-y-3'
      : 'grid grid-cols-1 gap-y-2.5'
    : 'grid grid-cols-1 2xl:grid-cols-2 gap-x-4 gap-y-3';

  if (isLoading) {
    return (
      <div className={`${gridClass} gap-6 mb-8 w-full select-none`}>
        <Skeleton className="w-full h-51.75 rounded-xl" />
        <Skeleton className="w-full h-51.75 rounded-xl" />
        <Skeleton className="w-full h-51.75 rounded-xl" />
        <Skeleton className="w-full h-51.75 rounded-xl" />
      </div>
    );
  }

  const proposals = suggestionsData?.items || [];
  const totalFeedback = proposals.length;

  // Trạng thái xử lý
  const approvedSolutions = proposals.filter((p: Suggestion) => p.status === 'approve').length;
  const rejectedSolutions = proposals.filter((p: Suggestion) => p.status === 'reject').length;
  const processedRecent = approvedSolutions + rejectedSolutions;
  const unprocessedRecent = proposals.filter((p: Suggestion) => p.status === 'pending').length;

  // Hàm bổ trợ phân loại chủ đề linh hoạt từ type hoặc content
  const getProposalCategory = (p: Suggestion) => {
    const cat = (p.type || '').toLowerCase().trim();
    if (cat === 'process') return 'process';
    if (cat === 'technology') return 'technology';
    if (cat === 'environment') return 'environment';
    if (cat === 'cost') return 'cost';
    if (cat === 'quality') return 'quality';
    if (cat === 'safety') return 'safety';
    if (cat === 'workplace') return 'workplace';
    if (cat === 'welfare') return 'welfare';
    if (cat === 'training') return 'training';
    if (cat === 'customer') return 'customer';
    if (cat === 'complaint') return 'complaint';
    return 'other';
  };

  // Phân loại chủ đề
  const processCount = proposals.filter((p: Suggestion) => getProposalCategory(p) === 'process').length;
  const techCount = proposals.filter((p: Suggestion) => getProposalCategory(p) === 'technology').length;
  const envCount = proposals.filter((p: Suggestion) => getProposalCategory(p) === 'workplace').length;

  const total = proposals.length;
  const displayTotal = total ?? 0;

  const processPercent = total > 0 ? Math.round((processCount / total) * 100) : 0;
  const techPercent = total > 0 ? Math.round((techCount / total) * 100) : 0;
  const envPercent = total > 0 ? Math.round((envCount / total) * 100) : 0;
  const otherPercent = total > 0 ? 100 - processPercent - techPercent - envPercent : 0;

  const radius = 48;
  const circumference = 2 * Math.PI * radius; // ~301.59

  const segments = [
    { percent: processPercent, color: '#0CBFDF', offset: 0 },
    { percent: techPercent, color: '#FACC15', offset: processPercent },
    { percent: otherPercent, color: '#7C7C7C', offset: processPercent + techPercent },
    { percent: envPercent, color: '#F87171', offset: processPercent + techPercent + otherPercent },
  ];

  return (
    <div className={`${gridClass} gap-6 mb-8 select-none w-full`}>
      {/* Card 1: Tổng ý kiến */}
      <div className="relative overflow-hidden gap-4 bg-white border border-[#00d8ff]/30 rounded-xl p-5 w-full h-auto shadow-sm flex flex-col group hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between w-full">
          <div className="w-10 h-10 bg-[#0cbfdf]/10 rounded-lg flex items-center justify-center shrink-0">
            <MessagesSquare className="w-5 h-5 text-[#0cbfdf]" />
          </div>
          <div className="px-2 py-1 bg-[#34d399]/10 rounded font-bold text-[12px] leading-tight text-[#34d399]">{`+${((totalFeedback / 50) * 100).toFixed(0)}%`}</div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-medium text-[14px] leading-5 text-slate-500">Tổng ý kiến tháng này</span>
          <span className="font-bold text-[30px] leading-9 text-black">{totalFeedback}</span>
        </div>

        <div className="relative w-full h-1 bg-black/10 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-[#0cbfdf] rounded-full"
            style={{ width: `${Math.min(100, Math.round((totalFeedback / 50) * 100))}%` }}
          />
        </div>
      </div>

      {/* Card 2: Đã phê duyệt */}
      <div className="relative overflow-hidden gap-4 bg-white border border-[#00d8ff]/30 rounded-xl p-5 w-full h-auto shadow-sm flex flex-col group hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between w-full">
          <div className="w-10 h-10 bg-[#fbbf24]/10 rounded-lg flex items-center justify-center shrink-0">
            <MessageSquareCheck className="w-5 h-5 text-[#FBBF24]" />
          </div>
          <div className="px-2 py-1 bg-[#34d399]/10 rounded font-bold text-[12px] leading-tight text-[#34d399]">{`+${Math.round((approvedSolutions / Math.max(1, totalFeedback)) * 100)}%`}</div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-medium text-[14px] leading-5 text-slate-500">Giải pháp đã phê duyệt</span>
          <span className="font-bold text-[30px] leading-9 text-black">{approvedSolutions}</span>
        </div>

        <div className="relative w-full h-1 bg-black/10 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-[#fbbf24] rounded-full"
            style={{
              width: `${Math.min(100, Math.round((approvedSolutions / Math.max(1, totalFeedback)) * 100))}%`,
            }}
          />
        </div>
      </div>

      {/* Card 3: Thông tin cần xử lý */}
      <div className="relative overflow-hidden w-full h-auto bg-white/70 backdrop-blur-[6px] border border-[#00d8ff]/60 rounded-xl p-5 flex flex-col gap-4 group hover:shadow-md transition-all duration-300 shadow-sm">
        {/* Header: Icon & Badge */}
        <div className="flex items-center justify-between w-full">
          <div className="w-10 h-10 bg-[#B2FFD2] rounded-lg flex items-center justify-center shrink-0 border border-[#005E14]/10">
            <Bell className="w-5 h-5 text-[#005E14]" />
          </div>
          <div className="px-2 py-1 bg-[#34d399]/10 rounded font-bold text-[12px] leading-tight text-[#34d399]">+5%</div>
        </div>

        {/* Title & Stats */}
        <div className="flex flex-col">
          <span className="font-medium text-[14px] leading-5 text-[#475569]">Thông tin cần xử lý</span>

          {/* Numbers */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="font-bold text-[30px] leading-9 text-[#00621F]">{String(processedRecent).padStart(2, '0')}</span>
              <span className="text-[12px] text-[#005E14] font-normal leading-4 mt-0.5">Đã xử lý</span>
            </div>
            <div className="h-11 w-0.5 bg-[#23393D] self-center shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-[36px] leading-10 text-[#FBBF24]">{String(unprocessedRecent).padStart(2, '0')}</span>
              <span className="text-[12px] text-[#FBBF24]/70 font-normal leading-4 mt-0.5">Chưa xử lý</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-[#475569] font-normal select-none">Cần xử lý ngay lập tức</div>
      </div>

      {/* Card 4: Phân loại chủ đề */}
      <div className="relative overflow-hidden w-full h-auto bg-white/80 backdrop-blur-[6px] border border-[#00d8ff]/60 rounded-xl p-5 flex flex-col justify-between group hover:shadow-md transition-all duration-300 shadow-sm">
        <div className="flex flex-row items-center gap-6 h-full w-full">
          {/* Left: Doughnut Chart */}
          <div className="relative flex items-center justify-center shrink-0 w-35 h-35 md:w-37.5 md:h-37.5 xl:w-41 xl:h-41">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              {segments.map((segment, index) => {
                const strokeDasharray = `${(segment.percent / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((segment.offset / 100) * circumference);
                return (
                  <circle
                    key={index}
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke={segment.color}
                    strokeWidth="12"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500 ease-out"
                  />
                );
              })}
            </svg>

            {/* Center Text */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-bold text-[30px] leading-none text-black">{displayTotal}</span>
              <span className="font-bold text-[10px] tracking-widest text-[#64748B] mt-1 uppercase">ĐỀ XUẤT</span>
            </div>
          </div>

          {/* Right: Legend */}
          <div className="flex flex-col flex-1 justify-center">
            <h4 className="font-bold text-[14px] leading-5 text-black mb-4">Phân loại chủ đề</h4>
            <div className={legendGridClass}>
              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0CBFDF] shrink-0 mt-1" />
                <span className="font-medium text-[10px] md:text-[12px] text-slate-800 wrap-break-word">Quy trình ({processPercent}%)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15] shrink-0 mt-1" />
                <span className="font-medium text-[10px] md:text-[12px] text-slate-800 wrap-break-word">Công nghệ ({techPercent}%)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F87171] shrink-0 mt-1" />
                <span className="font-medium text-[10px] md:text-[12px] text-slate-800 wrap-break-word">Môi trường ({envPercent}%)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7C7C7C] shrink-0 mt-1" />
                <span className="font-medium text-[10px] md:text-[12px] text-slate-800 wrap-break-word">Khác ({otherPercent}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
