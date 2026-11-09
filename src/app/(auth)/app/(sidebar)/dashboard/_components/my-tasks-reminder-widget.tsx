'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardCheck, Clock } from 'lucide-react';
import { getStaffTaskSummary } from '@/actions';
import { Badge } from '@/components';

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
  const urgentTasks = summary?.urgentReminderTasks || [];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardCheck size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Công việc & Nhắc việc của tôi
            </h3>
            <p className="text-[11px] text-gray-500">
              Theo dõi hạn hoàn thành công việc & lịch bảo hành được giao
            </p>
          </div>
        </div>

        <Link
          href="/app/tasks"
          className="inline-flex items-center gap-1 rounded-lg bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
        >
          <span>Mở bảng công việc</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Link
          href="/app/tasks"
          className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 hover:border-primary/30"
        >
          <div className="text-[11px] text-slate-500">Cần thực hiện</div>
          <div className="mt-0.5 font-mono text-lg font-bold tabular-nums text-primary">
            {isLoading ? '...' : openCount}
          </div>
        </Link>

        <Link
          href="/app/tasks"
          className="rounded-xl border border-amber-100 bg-amber-50/50 p-2.5 hover:border-amber-300"
        >
          <div className="text-[11px] text-amber-700">Sắp hết hạn (24h)</div>
          <div className="mt-0.5 font-mono text-lg font-bold tabular-nums text-amber-600">
            {isLoading ? '...' : dueSoonCount}
          </div>
        </Link>

        <Link
          href="/app/tasks"
          className="rounded-xl border border-red-100 bg-red-50/50 p-2.5 hover:border-red-300"
        >
          <div className="text-[11px] text-red-700">Quá hạn</div>
          <div className="mt-0.5 font-mono text-lg font-bold tabular-nums text-red-600">
            {isLoading ? '...' : overdueCount}
          </div>
        </Link>

        <Link
          href="/app/tasks"
          className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-2.5 hover:border-emerald-300"
        >
          <div className="text-[11px] text-emerald-700">Xong hôm nay</div>
          <div className="mt-0.5 font-mono text-lg font-bold tabular-nums text-emerald-600">
            {isLoading ? '...' : completedTodayCount}
          </div>
        </Link>
      </div>

      {urgentTasks.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <AlertTriangle size={12} className="text-amber-500" />
            <span>Việc cần ưu tiên hoàn thành sớm:</span>
          </div>
          {urgentTasks.slice(0, 3).map((task) => (
            <Link
              key={task.id}
              href="/app/tasks"
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-1.5 text-xs hover:bg-slate-100"
            >
              <div className="min-w-0 flex-1 truncate">
                <span className="font-mono font-bold text-primary">{task.code}</span> ·{' '}
                <span className="font-medium text-slate-800">{task.title}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Badge variant={task.isOverdue ? 'danger' : 'warning'} size="sm">
                  {task.isOverdue ? 'Quá hạn' : 'Sắp đến hạn'}
                </Badge>
                <span className="hidden font-mono text-[11px] tabular-nums text-slate-500 sm:inline">
                  <Clock size={10} className="mr-0.5 inline" />
                  {new Date(task.dueAt).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && openCount === 0 && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-600">
          <CheckCircle2 size={14} />
          <span>Tuyệt vời! Bạn đã hoàn thành toàn bộ công việc được giao.</span>
        </div>
      )}
    </div>
  );
}

export default MyTasksReminderWidget;

