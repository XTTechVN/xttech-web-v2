'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, CheckCircle2, FileCheck2, Phone, User, Wrench } from 'lucide-react';
import { Badge, Button, Modal } from '@/components';
import {
  TASK_CATEGORY_MAP,
  TASK_DEADLINE_STATE_MAP,
  TASK_PRIORITY_MAP,
  TASK_SOURCE_TYPE_MAP,
  TASK_STATUS_MAP,
} from '@/config';
import type { StaffTask } from '@/types';
import { formatDateTimeVi, formatLateDuration } from '../../_constants/task.constants';

interface TaskDetailModalProps {
  task: StaffTask | null;
  onClose: () => void;
  onCompleteTask: (task: StaffTask) => void;
  onOpenWarrantyReport: (task: StaffTask) => void;
}

export function TaskDetailModal({
  task,
  onClose,
  onCompleteTask,
  onOpenWarrantyReport,
}: TaskDetailModalProps) {
  if (!task) return null;

  const statusBadge = TASK_STATUS_MAP[task.status] || TASK_STATUS_MAP.pending;
  const priorityBadge = TASK_PRIORITY_MAP[task.priority] || TASK_PRIORITY_MAP.medium;
  const deadlineBadge =
    TASK_DEADLINE_STATE_MAP[task.deadlineState] || TASK_DEADLINE_STATE_MAP.on_track;
  const isOpenTask = task.status === 'pending' || task.status === 'in_progress';

  return (
    <Modal
      isOpen={Boolean(task)}
      onClose={onClose}
      size="lg"
      title={`Chi tiết công việc ${task.code}`}
    >
      <div className="space-y-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          <Badge variant={deadlineBadge.variant}>{deadlineBadge.label}</Badge>
          <Badge variant={priorityBadge.variant}>Ưu tiên: {priorityBadge.label}</Badge>
          {task.isCompletedLate && task.lateMinutes > 0 && (
            <span className="font-mono font-bold text-amber-700">
              ({formatLateDuration(task.lateMinutes)})
            </span>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
          {task.description && (
            <p className="mt-1.5 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-slate-700">
              {task.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <User size={15} className="mt-0.5 text-primary shrink-0" />
            <div>
              <div className="text-slate-400">Nhân sự thực hiện</div>
              <div className="font-semibold text-slate-800">{task.assigneeName || '—'}</div>
              {task.departmentName && (
                <div className="text-[11px] text-slate-500">{task.departmentName}</div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <User size={15} className="mt-0.5 text-slate-400 shrink-0" />
            <div>
              <div className="text-slate-400">Người giao việc / Nguồn</div>
              <div className="font-semibold text-slate-800">
                {task.assignedByName || 'Hệ thống tự động'}
              </div>
              <div className="text-[11px] text-slate-500">
                {TASK_CATEGORY_MAP[task.category]} · {TASK_SOURCE_TYPE_MAP[task.sourceType]}
              </div>
            </div>
          </div>
        </div>

        {(task.projectId || task.warrantyVisitId) && (
          <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
            {task.projectId && (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <Building2 size={14} className="text-primary" />
                  <span>
                    {task.projectCode} · {task.projectName}
                  </span>
                </div>
                <Link
                  href={`/app/projects/${task.projectId}`}
                  className="font-semibold text-primary hover:underline"
                >
                  Mở dự án →
                </Link>
              </div>
            )}
            {task.warrantyVisitCode && (
              <div className="flex flex-wrap items-center gap-3 text-slate-700">
                <span className="inline-flex items-center gap-1 font-mono font-bold text-primary">
                  <Wrench size={13} /> Phiếu BH: {task.warrantyVisitCode}
                </span>
                {task.requesterPhone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone size={12} /> Khách: {task.requesterName || '—'} ({task.requesterPhone})
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-2.5 rounded-xl bg-slate-50 p-3 sm:grid-cols-3">
          <div>
            <div className="text-[11px] text-slate-400">Ngày giao</div>
            <div className="mt-0.5 font-mono font-semibold tabular-nums text-slate-800">
              {formatDateTimeVi(task.createdAt)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Hạn hoàn thành</div>
            <div className="mt-0.5 font-mono font-semibold tabular-nums text-primary">
              {formatDateTimeVi(task.dueAt)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Hoàn thành lúc</div>
            <div className="mt-0.5 font-mono font-semibold tabular-nums text-emerald-700">
              {formatDateTimeVi(task.completedAt)}
            </div>
          </div>
        </div>

        {task.managerNote && (
          <div className="rounded-lg border border-slate-200 p-2.5">
            <div className="font-semibold text-slate-700">Ghi chú chỉ đạo của Quản lý:</div>
            <p className="mt-0.5 text-slate-600">{task.managerNote}</p>
          </div>
        )}

        {task.completionNote && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5">
            <div className="font-semibold text-emerald-800">Báo cáo kết quả của Nhân sự:</div>
            <p className="mt-0.5 text-emerald-900">{task.completionNote}</p>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:flex-wrap sm:justify-end">
          <Button variant="outline" size="sm" className="w-full justify-center sm:w-auto" onClick={onClose}>
            Đóng
          </Button>
          {task.warrantyVisitId && task.projectId && isOpenTask && (
            <Button
              size="sm"
              variant="outline"
              className="w-full justify-center sm:w-auto"
              leftIcon={<FileCheck2 size={14} />}
              onClick={() => {
                onClose();
                onOpenWarrantyReport(task);
              }}
            >
              Lập biên bản Bảo hành
            </Button>
          )}
          {isOpenTask && (
            <Button
              size="sm"
              variant="primary"
              className="w-full justify-center sm:w-auto"
              leftIcon={<CheckCircle2 size={14} />}
              onClick={() => {
                onClose();
                onCompleteTask(task);
              }}
            >
              Xác nhận hoàn thành
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

