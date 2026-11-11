'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  FileCheck2,
  Phone,
  RotateCcw,
  Trash2,
  Wrench,
} from 'lucide-react';
import {
  TASK_DEADLINE_STATE_MAP,
  TASK_PRIORITY_MAP,
} from '@/config';
import { cn } from '@/utils';
import type { StaffTask } from '@/types';
import { formatDateTimeVi, formatLateDuration, formatRemainingTime } from '../_constants/task.constants';

interface TaskMobileCardProps {
  task: StaffTask;
  canManageTasks: boolean;
  currentUserId?: string;
  isChecked: boolean;
  onToggleSelect: (id: number) => void;
  onCompleteTask: (task: StaffTask) => void;
  onOpenWarrantyReport: (task: StaffTask) => void;
  onViewDetail: (task: StaffTask) => void;
  onEditTask: (task: StaffTask) => void;
  onReopenTask: (task: StaffTask) => void;
  onDeleteTask: (task: StaffTask) => void;
}

export function TaskMobileCard({
  task,
  canManageTasks,
  currentUserId,
  isChecked,
  onToggleSelect,
  onCompleteTask,
  onOpenWarrantyReport,
  onViewDetail,
  onEditTask,
  onReopenTask,
  onDeleteTask,
}: TaskMobileCardProps) {
  const isOpenTask = task.status === 'pending' || task.status === 'in_progress';
  const canAct = canManageTasks || task.assigneeId === currentUserId;
  const canSelect = isOpenTask && canAct;

  const priorityLabel = TASK_PRIORITY_MAP[task.priority]?.label || 'Trung bình';
  const deadlineInfo =
    TASK_DEADLINE_STATE_MAP[task.deadlineState] || TASK_DEADLINE_STATE_MAP.on_track;

  const statusTextColor =
    task.deadlineState === 'overdue'
      ? 'text-red-600'
      : task.deadlineState === 'due_soon' || task.deadlineState === 'completed_late'
        ? 'text-amber-600'
        : task.status === 'completed'
          ? 'text-emerald-600'
          : 'text-slate-500';

  return (
    <div
      onClick={() => {
        if (canSelect) onToggleSelect(task.id);
      }}
      className={cn(
        'rounded-xl border bg-white px-3 py-2.5 transition',
        canSelect && 'cursor-pointer',
        isChecked
          ? 'border-primary bg-primary/3 ring-1 ring-primary'
          : 'border-slate-200',
      )}
    >
      <div className="flex items-start gap-2.5">
        {canSelect && (
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => onToggleSelect(task.id)}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-[#045863] cursor-pointer"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-slate-400">
              <span className="font-mono font-medium text-slate-600">{task.code}</span>
              {(task.priority === 'urgent' || task.priority === 'high') && (
                <span className="font-semibold text-red-600">· {priorityLabel}</span>
              )}
              {task.warrantyVisitCode && (
                <span className="inline-flex items-center gap-0.5 font-mono text-primary">
                  <Wrench size={10} /> {task.warrantyVisitCode}
                </span>
              )}
            </div>
            <span className={cn('shrink-0 text-[11px] font-semibold', statusTextColor)}>
              {deadlineInfo.label}
            </span>
          </div>

          <div
            className={cn(
              'mt-0.5 text-sm font-semibold leading-snug text-slate-900',
              task.status === 'completed' && 'text-slate-500 line-through',
            )}
          >
            {task.title}
          </div>

          {(task.projectId || task.requesterPhone) && (
            <div
              className="mt-1 flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500"
              onClick={(e) => e.stopPropagation()}
            >
              {task.projectId && (
                <Link
                  href={`/app/projects/${task.projectId}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Building2 size={11} />
                  <span className="truncate">{task.projectCode} · {task.projectName}</span>
                </Link>
              )}
              {task.requesterPhone && (
                <a
                  href={`tel:${task.requesterPhone}`}
                  className="inline-flex items-center gap-1 font-mono text-slate-600 hover:text-primary"
                >
                  <Phone size={10} />
                  <span>{task.requesterPhone}</span>
                </a>
              )}
            </div>
          )}

          <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
            <div className="min-w-0 flex-1 text-[11px] text-slate-500">
              <div className="flex items-center gap-1 font-mono tabular-nums text-slate-700">
                <Clock size={11} className="text-slate-400 shrink-0" />
                <span>{formatDateTimeVi(task.dueAt)}</span>
                {isOpenTask && (
                  <span className={cn('font-sans font-medium', statusTextColor)}>
                    · {formatRemainingTime(task.dueAt)}
                  </span>
                )}
                {task.isCompletedLate && task.lateMinutes > 0 && (
                  <span className="text-amber-600">· {formatLateDuration(task.lateMinutes)}</span>
                )}
              </div>
              {task.assigneeName && (
                <div className="mt-0.5 truncate text-[11px] text-slate-400">
                  Phụ trách: <span className="font-medium text-slate-600">{task.assigneeName}</span>
                </div>
              )}
            </div>

            <div
              className="flex shrink-0 items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {task.warrantyVisitId && task.projectId && isOpenTask && canAct && (
                <button
                  type="button"
                  onClick={() => onOpenWarrantyReport(task)}
                  className="inline-flex h-7 items-center gap-1 rounded-lg border border-slate-200 px-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <FileCheck2 size={12} />
                  <span>BH</span>
                </button>
              )}
              {isOpenTask && canAct && (
                <button
                  type="button"
                  onClick={() => onCompleteTask(task)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer"
                  title="Hoàn thành"
                >
                  <CheckCircle2 size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => onViewDetail(task)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                title="Xem chi tiết"
              >
                <Eye size={14} />
              </button>
              {canManageTasks && isOpenTask && (
                <button
                  type="button"
                  onClick={() => onEditTask(task)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                  title="Chỉnh sửa"
                >
                  <Edit3 size={14} />
                </button>
              )}
              {(task.status === 'completed' || task.status === 'cancelled') && canAct && (
                <button
                  type="button"
                  onClick={() => onReopenTask(task)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-amber-600 cursor-pointer"
                  title="Mở lại"
                >
                  <RotateCcw size={14} />
                </button>
              )}
              {canManageTasks && (
                <button
                  type="button"
                  onClick={() => onDeleteTask(task)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                  title="Xóa"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
