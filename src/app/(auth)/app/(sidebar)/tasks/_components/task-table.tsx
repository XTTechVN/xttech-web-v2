'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  Edit3,
  Eye,
  FileCheck2,
  Phone,
  RotateCcw,
  Trash2,
  Wrench,
} from 'lucide-react';
import { Button, Skeleton, TablePagination } from '@/components';
import {
  TASK_CATEGORY_MAP,
  TASK_DEADLINE_STATE_MAP,
  TASK_PRIORITY_MAP,
  TASK_SOURCE_TYPE_MAP,
} from '@/config';
import { cn } from '@/utils';
import type { StaffTask } from '@/types';
import { formatDateTimeVi, formatLateDuration, formatRemainingTime } from '../_constants/task.constants';
import { TaskMobileCard } from './task-mobile-card';

interface TaskTableProps {
  items: StaffTask[];
  isLoading: boolean;
  canManageTasks: boolean;
  currentUserId?: string;
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onCompleteTask: (task: StaffTask) => void;
  onOpenWarrantyReport: (task: StaffTask) => void;
  onViewDetail: (task: StaffTask) => void;
  onEditTask: (task: StaffTask) => void;
  onReopenTask: (task: StaffTask) => void;
  onDeleteTask: (task: StaffTask) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function TaskTable({
  items,
  isLoading,
  canManageTasks,
  currentUserId,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onCompleteTask,
  onOpenWarrantyReport,
  onViewDetail,
  onEditTask,
  onReopenTask,
  onDeleteTask,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: TaskTableProps) {
  if (isLoading) return <Skeleton className="h-72 w-full rounded-xl" />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-4 py-14 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <ClipboardList size={20} />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-800">Chưa có công việc nào</h3>
        <p className="mt-1 max-w-md text-xs text-slate-500">
          Không tìm thấy công việc khớp với bộ lọc hiện tại, hoặc chưa có công việc nào được giao.
        </p>
      </div>
    );
  }

  const selectableTasks = items.filter((t) => t.status === 'pending' || t.status === 'in_progress');
  const allSelectableChecked =
    selectableTasks.length > 0 && selectableTasks.every((t) => selectedIds.includes(t.id));

  return (
    <div className="space-y-3">
      <div className="space-y-2 md:hidden">
        {selectableTasks.length > 1 && (
          <div className="flex items-center justify-between px-1 py-0.5 text-xs">
            <label className="flex items-center gap-2 font-medium text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={allSelectableChecked}
                onChange={(e) => onToggleSelectAll(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-[#045863] cursor-pointer"
              />
              <span>Chọn tất cả ({selectableTasks.length})</span>
            </label>
            {selectedIds.length > 0 && (
              <span className="font-mono font-semibold text-primary">Đã chọn {selectedIds.length}</span>
            )}
          </div>
        )}
        {items.map((task) => (
          <TaskMobileCard
            key={task.id}
            task={task}
            canManageTasks={canManageTasks}
            currentUserId={currentUserId}
            isChecked={selectedIds.includes(task.id)}
            onToggleSelect={onToggleSelect}
            onCompleteTask={onCompleteTask}
            onOpenWarrantyReport={onOpenWarrantyReport}
            onViewDetail={onViewDetail}
            onEditTask={onEditTask}
            onReopenTask={onReopenTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
        <table className="w-full min-w-[920px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-semibold text-slate-500">
              <th className="w-10 px-3 py-2.5 text-center">
                <input
                  type="checkbox"
                  checked={allSelectableChecked}
                  disabled={selectableTasks.length === 0}
                  onChange={(e) => onToggleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-[#045863] cursor-pointer"
                  title="Chọn tất cả việc chưa hoàn thành"
                />
              </th>
              <th className="px-3 py-2.5">Công việc</th>
              <th className="px-3 py-2.5">Phân loại</th>
              <th className="px-3 py-2.5">Người thực hiện</th>
              <th className="px-3 py-2.5 text-right">Hạn hoàn thành</th>
              <th className="px-3 py-2.5 text-center">Trạng thái</th>
              <th className="px-3 py-2.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((task) => {
              const isOpenTask = task.status === 'pending' || task.status === 'in_progress';
              const isChecked = selectedIds.includes(task.id);
              const canAct = canManageTasks || task.assigneeId === currentUserId;
              const canSelect = isOpenTask && canAct;
              const priorityLabel = TASK_PRIORITY_MAP[task.priority]?.label || 'Trung bình';
              const deadlineInfo = TASK_DEADLINE_STATE_MAP[task.deadlineState] || TASK_DEADLINE_STATE_MAP.on_track;
              const statusDot =
                task.deadlineState === 'overdue'
                  ? 'bg-red-500'
                  : task.deadlineState === 'due_soon' || task.deadlineState === 'completed_late'
                    ? 'bg-amber-500'
                    : task.status === 'completed'
                      ? 'bg-emerald-500'
                      : 'bg-primary';
              const statusColor =
                task.deadlineState === 'overdue'
                  ? 'text-red-600'
                  : task.deadlineState === 'due_soon' || task.deadlineState === 'completed_late'
                    ? 'text-amber-600'
                    : task.status === 'completed'
                      ? 'text-emerald-600'
                      : 'text-slate-700';

              return (
                <tr
                  key={task.id}
                  onClick={() => { if (canSelect) onToggleSelect(task.id); }}
                  className={cn(
                    'transition hover:bg-slate-50/70',
                    canSelect && 'cursor-pointer',
                    isChecked && 'bg-primary/[0.03]',
                  )}
                >
                  <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    {canSelect && (
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleSelect(task.id)}
                        className="h-4 w-4 rounded border-slate-300 accent-[#045863] cursor-pointer"
                      />
                    )}
                  </td>
                  <td className="max-w-sm px-3 py-3">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="font-mono font-medium text-slate-600">{task.code}</span>
                      {(task.priority === 'urgent' || task.priority === 'high') && (
                        <span className="font-semibold text-red-600">· Ưu tiên {priorityLabel}</span>
                      )}
                      {task.warrantyVisitCode && (
                        <span className="inline-flex items-center gap-1 font-mono text-primary">
                          <Wrench size={10} /> {task.warrantyVisitCode}
                        </span>
                      )}
                    </div>
                    <div className={cn('mt-0.5 text-xs font-semibold text-slate-900', task.status === 'completed' && 'text-slate-500 line-through')}>
                      {task.title}
                    </div>
                    {task.projectId && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500" onClick={(e) => e.stopPropagation()}>
                        <Building2 size={11} className="text-slate-400 shrink-0" />
                        <Link href={`/app/projects/${task.projectId}`} className="hover:text-primary hover:underline">
                          {task.projectCode} · {task.projectName}
                        </Link>
                      </div>
                    )}
                    {task.requesterPhone && (
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                        <Phone size={11} />
                        <span>{task.requesterName || 'Khách'} ({task.requesterPhone})</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-slate-700">{TASK_CATEGORY_MAP[task.category] || task.category}</div>
                    <div className="text-[11px] text-slate-400">{TASK_SOURCE_TYPE_MAP[task.sourceType] || task.sourceType}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-slate-800">{task.assigneeName || '—'}</div>
                    {task.departmentName && <div className="text-[11px] text-slate-400">{task.departmentName}</div>}
                  </td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums">
                    <div className="font-medium text-slate-800">{formatDateTimeVi(task.dueAt)}</div>
                    {isOpenTask && <div className={cn('mt-0.5 font-sans text-[11px]', statusColor)}>{formatRemainingTime(task.dueAt)}</div>}
                    {task.completedAt && <div className="mt-0.5 text-[10px] text-slate-400">Xong: {formatDateTimeVi(task.completedAt)}</div>}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', statusColor)}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', statusDot)} />
                      <span>{deadlineInfo.label}</span>
                    </span>
                    {task.isCompletedLate && task.lateMinutes > 0 && (
                      <div className="mt-0.5 font-mono text-[10px] text-amber-600">{formatLateDuration(task.lateMinutes)}</div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {isOpenTask && canAct && (
                        <Button size="sm" variant="primary" leftIcon={<CheckCircle2 size={12} />} onClick={() => onCompleteTask(task)}>Hoàn thành</Button>
                      )}
                      {task.warrantyVisitId && task.projectId && isOpenTask && canAct && (
                        <Button size="sm" variant="outline" leftIcon={<FileCheck2 size={12} />} onClick={() => onOpenWarrantyReport(task)}>Biên bản BH</Button>
                      )}
                      <button type="button" onClick={() => onViewDetail(task)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer" title="Xem chi tiết"><Eye size={14} /></button>
                      {canManageTasks && isOpenTask && (
                        <button type="button" onClick={() => onEditTask(task)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer" title="Chỉnh sửa"><Edit3 size={14} /></button>
                      )}
                      {(task.status === 'completed' || task.status === 'cancelled') && canAct && (
                        <button type="button" onClick={() => onReopenTask(task)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600 cursor-pointer" title="Mở lại"><RotateCcw size={14} /></button>
                      )}
                      {canManageTasks && (
                        <button type="button" onClick={() => onDeleteTask(task)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 cursor-pointer" title="Xóa"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <TablePagination currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
    </div>
  );
}
