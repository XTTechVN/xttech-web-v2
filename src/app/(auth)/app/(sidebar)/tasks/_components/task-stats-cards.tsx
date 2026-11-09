'use client';

import React from 'react';
import { cn } from '@/utils';
import type { StaffTaskSummary } from '@/types';
import type { QuickDeadlineFilter } from '../_constants/task.constants';

interface TaskStatsCardsProps {
  summary?: StaffTaskSummary;
  isLoading: boolean;
  activeQuickFilter: QuickDeadlineFilter;
  onSelectQuickFilter: (filter: QuickDeadlineFilter) => void;
}

export function TaskStatsCards({
  summary,
  isLoading,
  activeQuickFilter,
  onSelectQuickFilter,
}: TaskStatsCardsProps) {
  const openCount = summary?.openCount ?? 0;
  const dueSoonCount = summary?.dueSoonCount ?? 0;
  const overdueCount = summary?.overdueCount ?? 0;
  const completedOnTimeCount = summary?.completedOnTimeCount ?? 0;
  const completedLateCount = summary?.completedLateCount ?? 0;
  const totalCompleted = completedOnTimeCount + completedLateCount;

  const cards: {
    id: QuickDeadlineFilter;
    label: string;
    value: number;
    subtext: string;
    dotColor: string;
    valueColor: string;
  }[] = [
    {
      id: 'open',
      label: 'Cần thực hiện',
      value: openCount,
      subtext: 'Chưa hoàn thành',
      dotColor: 'bg-primary',
      valueColor: 'text-slate-900',
    },
    {
      id: 'due_soon',
      label: 'Sắp hết hạn (24h)',
      value: dueSoonCount,
      subtext: 'Ưu tiên trong ngày',
      dotColor: 'bg-amber-500',
      valueColor: dueSoonCount > 0 ? 'text-amber-600' : 'text-slate-900',
    },
    {
      id: 'overdue',
      label: 'Quá hạn',
      value: overdueCount,
      subtext: 'Cần xử lý ngay',
      dotColor: 'bg-red-500',
      valueColor: overdueCount > 0 ? 'text-red-600' : 'text-slate-900',
    },
    {
      id: 'completed_on_time',
      label: 'Đã hoàn thành',
      value: totalCompleted,
      subtext: `Đúng hạn: ${completedOnTimeCount} · Muộn: ${completedLateCount}`,
      dotColor: 'bg-emerald-500',
      valueColor: 'text-slate-900',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {cards.map((card) => {
        const isActive =
          activeQuickFilter === card.id ||
          (card.id === 'completed_on_time' && activeQuickFilter === 'completed_late');
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectQuickFilter(isActive ? 'all' : card.id)}
            className={cn(
              'rounded-xl border px-3.5 py-3 text-left transition cursor-pointer',
              isActive
                ? 'border-primary bg-primary/[0.03] ring-1 ring-primary'
                : 'border-slate-200 bg-white hover:border-slate-300',
            )}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className={cn('h-2 w-2 rounded-full', card.dotColor)} />
              <span className="truncate">{card.label}</span>
            </div>
            <div className={cn('mt-1 font-mono text-xl font-bold tabular-nums sm:text-2xl', card.valueColor)}>
              {isLoading ? '—' : card.value}
            </div>
            <div className="mt-0.5 truncate text-[11px] font-mono text-slate-400">{card.subtext}</div>
          </button>
        );
      })}
    </div>
  );
}
