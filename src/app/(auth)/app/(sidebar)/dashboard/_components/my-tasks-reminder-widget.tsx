'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FolderGit2,
} from 'lucide-react';
import { getStaffTaskSummary } from '@/actions';
import { StaffTaskPriority } from '@/types';
import { cn } from '@/utils';

const PRIORITY_LABEL: Partial<Record<StaffTaskPriority, { label: string; className: string }>> = {
  urgent: {
    label: 'Khẩn cấp',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  high: {
    label: 'Ưu tiên cao',
    className: 'bg-orange-50 text-orange-700 border-orange-200',
  },
};

const formatDueDeadline = (dueAt: string): { timeLabel: string; countdownLabel: string } => {
  const dueDate = new Date(dueAt);
  if (Number.isNaN(dueDate.getTime())) {
    return { timeLabel: '--:--', countdownLabel: '' };
  }

  const timeLabel = dueDate.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });

  const diffMinutes = Math.round((dueDate.getTime() - Date.now()) / 60000);
  const absMinutes = Math.abs(diffMinutes);

  let durationText = '';
  if (absMinutes < 60) {
    durationText = `${absMinutes}p`;
  } else if (absMinutes < 1440) {
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    durationText = mins > 0 ? `${hours}g ${mins}p` : `${hours} giờ`;
  } else {
    const days = Math.floor(absMinutes / 1440);
    durationText = `${days} ngày`;
  }

  const countdownLabel = diffMinutes < 0 ? `Trễ ${durationText}` : `Còn ${durationText}`;
  return { timeLabel, countdownLabel };
};

export function MyTasksReminderWidget() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['staff-tasks-summary', 'mine'],
    queryFn: () => getStaffTaskSummary({ scope: 'mine' }),
    refetchInterval: 60000,
  });

  const openCount = summary?.openCount ?? 0;
  const dueSoonCount = summary?.dueSoonCount ?? 0;
  const overdueCount = summary?.overdueCount ?? 0;
  const completedTodayCount = summary?.completedTodayCount ?? 0;
  const urgentTasks = summary?.urgentReminderTasks ?? [];

  const kpiItems = useMemo(
    () => [
      {
        label: 'Cần làm',
        value: openCount,
        valueClass: 'text-primary',
        dotClass: 'bg-primary',
        active: openCount > 0,
      },
      {
        label: 'Sắp hạn',
        value: dueSoonCount,
        valueClass: dueSoonCount > 0 ? 'text-amber-600' : 'text-slate-500',
        dotClass: 'bg-amber-500',
        active: dueSoonCount > 0,
      },
      {
        label: 'Quá hạn',
        value: overdueCount,
        valueClass: overdueCount > 0 ? 'text-rose-600' : 'text-slate-500',
        dotClass: 'bg-rose-500',
        active: overdueCount > 0,
      },
      {
        label: 'Xong nay',
        value: completedTodayCount,
        valueClass: completedTodayCount > 0 ? 'text-emerald-600' : 'text-slate-500',
        dotClass: 'bg-emerald-500',
        active: completedTodayCount > 0,
      },
    ],
    [openCount, dueSoonCount, overdueCount, completedTodayCount]
  );

  return (
    <div className="rounded-block border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-xs flex flex-col gap-2.5">
      {/* Header 1 dòng gọn gàng, không rớt dòng nút bấm */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-primary/10 text-primary">
            <ClipboardCheck size={16} />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 truncate">
              Công việc & Nhắc việc
            </h3>
          </div>
        </div>

        <Link
          href="/app/tasks"
          className="inline-flex items-center gap-1 rounded-control bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors shrink-0"
        >
          <span>Bảng việc</span>
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Dải KPI 4 cột mật độ cao (chống Card-in-Card Nesting) */}
      <Link
        href="/app/tasks"
        className="grid grid-cols-4 divide-x divide-slate-200/80 rounded-block border border-slate-200/80 bg-slate-50/60 hover:border-primary/30 transition-colors overflow-hidden"
      >
        {kpiItems.map((item) => (
          <div key={item.label} className="px-2 py-2 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 whitespace-nowrap">
              {item.active && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', item.dotClass)} />}
              <span>{item.label}</span>
            </div>
            <div className={cn('mt-0.5 text-base sm:text-lg font-bold tabular-nums leading-tight', item.valueClass)}>
              {isLoading ? '—' : item.value}
            </div>
          </div>
        ))}
      </Link>

      {/* Danh sách việc cần ưu tiên: đầy đủ mã, tiêu đề, dự án, mức ưu tiên và đếm ngược hạn chót */}
      {urgentTasks.length > 0 && (
        <div className="pt-0.5 flex flex-col">
          <div className="flex items-center justify-between gap-2 pb-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
              <AlertTriangle size={12} className="text-amber-500 shrink-0" />
              <span>Ưu tiên xử lý sớm</span>
            </div>
            <span className="text-xs font-medium text-slate-400 tabular-nums">
              {urgentTasks.length} việc
            </span>
          </div>

          <div className="divide-y divide-slate-100 rounded-block border border-slate-200/70 bg-white overflow-hidden">
            {urgentTasks.slice(0, 3).map((task) => {
              const priorityMeta = PRIORITY_LABEL[task.priority];
              const { timeLabel, countdownLabel } = formatDueDeadline(task.dueAt);

              return (
                <Link
                  key={task.id}
                  href="/app/tasks"
                  className="flex flex-col gap-1 px-2.5 py-2 hover:bg-slate-50/90 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[11px] font-bold text-primary shrink-0">
                        {task.code}
                      </span>
                      {priorityMeta && (
                        <span
                          className={cn(
                            'px-1.5 py-0.2 rounded text-xs font-semibold border shrink-0',
                            priorityMeta.className
                          )}
                        >
                          {priorityMeta.label}
                        </span>
                      )}
                      {task.projectName && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 truncate">
                          <FolderGit2 size={10} className="shrink-0 text-slate-400" />
                          <span className="truncate">{task.projectName}</span>
                        </span>
                      )}
                    </div>

                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-control text-xs font-semibold border shrink-0 tabular-nums',
                        task.isOverdue
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      )}
                    >
                      <Clock size={10} />
                      {countdownLabel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-800 truncate">
                      {task.title}
                    </span>
                    <span className="text-xs text-slate-400 tabular-nums shrink-0">
                      {timeLabel}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {!isLoading && openCount === 0 && (
        <div className="flex items-center gap-1.5 rounded-block border border-emerald-200/70 bg-emerald-50/60 px-3 py-2 text-xs font-medium text-emerald-700">
          <CheckCircle2 size={14} className="shrink-0" />
          <span>Bạn đã hoàn thành toàn bộ công việc được giao.</span>
        </div>
      )}
    </div>
  );
}

export default MyTasksReminderWidget;
