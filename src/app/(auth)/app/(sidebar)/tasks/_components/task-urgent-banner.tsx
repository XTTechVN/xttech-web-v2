'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { StaffTask } from '@/types';

interface TaskUrgentBannerProps {
  urgentTasks: StaffTask[];
  overdueCount: number;
  dueSoonCount: number;
  onQuickComplete: (task: StaffTask) => void;
  onSelectTask: (task: StaffTask) => void;
  onFilterOverdue: () => void;
}

export function TaskUrgentBanner({
  overdueCount,
  dueSoonCount,
  onFilterOverdue,
}: TaskUrgentBannerProps) {
  if (overdueCount === 0 && dueSoonCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-700">
      <div className="flex items-center gap-2">
        <AlertCircle size={15} className={overdueCount > 0 ? 'text-red-500 shrink-0' : 'text-amber-500 shrink-0'} />
        <span>
          Nhắc việc:{' '}
          {overdueCount > 0 && (
            <>
              có <b className="font-mono text-red-600">{overdueCount} việc quá hạn</b>
              {dueSoonCount > 0 ? ' và ' : ''}
            </>
          )}
          {dueSoonCount > 0 && (
            <>
              <b className="font-mono text-amber-600">{dueSoonCount} việc sắp hết hạn</b> trong 24h tới
            </>
          )}
          .
        </span>
      </div>
      {overdueCount > 0 && (
        <button
          type="button"
          onClick={onFilterOverdue}
          className="font-semibold text-primary hover:underline cursor-pointer"
        >
          Xem việc quá hạn →
        </button>
      )}
    </div>
  );
}
