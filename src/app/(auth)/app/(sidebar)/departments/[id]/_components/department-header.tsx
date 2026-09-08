'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Briefcase, CalendarClock, Users } from 'lucide-react';
import { Badge } from '@/components';
import type { Department } from '@/types';

interface DepartmentHeaderProps {
  department?: Department | null;
  positionsCount?: number;
  shiftsCount?: number;
  membersCount?: number;
  isLoading?: boolean;
}

export const DepartmentHeader: React.FC<DepartmentHeaderProps> = ({
  department,
  positionsCount = 0,
  shiftsCount = 0,
  membersCount = 0,
  isLoading = false,
}) => {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 p-3.5 md:p-3 lg:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-3 lg:gap-4">
      <div className="flex items-center gap-2.5 md:gap-3 lg:gap-3.5 min-w-0">
       
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
            <h1 className="text-base md:text-base lg:text-xl font-bold text-slate-900 truncate">
              {isLoading ? 'Đang tải thông tin...' : department?.name || 'Chi tiết phòng ban'}
            </h1>
            {department?.code && (
              <Badge variant="primary" size="sm" className="font-semibold text-[10px] md:text-[11px] lg:text-xs">
                {department.code}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3 flex-wrap pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
        <div className="flex items-center gap-1.5 md:gap-1.5 lg:gap-2 px-2.5 md:px-2.5 lg:px-3 py-1 md:py-1 lg:py-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] md:text-[11px] lg:text-xs">
          <Briefcase className="w-3 h-3 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 text-primary shrink-0" />
          <span className="text-slate-600">Vị trí:</span>
          <span className="font-bold text-slate-900">{positionsCount}</span>
        </div>

        <div className="flex items-center gap-1.5 md:gap-1.5 lg:gap-2 px-2.5 md:px-2.5 lg:px-3 py-1 md:py-1 lg:py-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] md:text-[11px] lg:text-xs">
          <CalendarClock className="w-3 h-3 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 text-primary shrink-0" />
          <span className="text-slate-600">Ca làm việc:</span>
          <span className="font-bold text-slate-900">{shiftsCount}</span>
        </div>

        <div className="flex items-center gap-1.5 md:gap-1.5 lg:gap-2 px-2.5 md:px-2.5 lg:px-3 py-1 md:py-1 lg:py-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] md:text-[11px] lg:text-xs">
          <Users className="w-3 h-3 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 text-primary shrink-0" />
          <span className="text-slate-600">Nhân sự:</span>
          <span className="font-bold text-slate-900">{membersCount}</span>
        </div>
      </div>
    </div>
  );
};

export default DepartmentHeader;
