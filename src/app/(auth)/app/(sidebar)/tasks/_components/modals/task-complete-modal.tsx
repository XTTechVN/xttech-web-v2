'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { bulkCompleteStaffTasks, completeStaffTask } from '@/actions';
import { Button, Modal, Textarea } from '@/components';
import { showErrorToast } from '@/utils';
import type { StaffTask } from '@/types';
import { formatDateTimeVi } from '../../_constants/task.constants';

interface TaskCompleteModalProps {
  tasks: StaffTask[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TaskCompleteModal({
  tasks,
  isOpen,
  onClose,
  onSuccess,
}: TaskCompleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        tasks.length > 1
          ? `Xác nhận hoàn thành ${tasks.length} công việc`
          : `Hoàn thành công việc ${tasks[0]?.code || ''}`
      }
      className="max-w-md w-full"
    >
      {isOpen && tasks.length > 0 && (
        <TaskCompleteForm
          key={tasks.map((t) => t.id).join('-')}
          tasks={tasks}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}

function TaskCompleteForm({
  tasks,
  onClose,
  onSuccess,
}: {
  tasks: StaffTask[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [completionNote, setCompletionNote] = useState('');
  const [mountTime] = useState(() => Date.now());
  const lateTasks = tasks.filter((t) => new Date(t.dueAt).getTime() < mountTime);

  const mutation = useMutation({
    mutationFn: async () => {
      const note = completionNote.trim() || null;
      if (tasks.length === 1) {
        return completeStaffTask(tasks[0].id, { completionNote: note });
      }
      return bulkCompleteStaffTasks({
        taskIds: tasks.map((t) => t.id),
        completionNote: note,
      });
    },
    onSuccess: () => {
      toast.success(
        tasks.length === 1
          ? 'Đã xác nhận hoàn thành công việc'
          : `Đã hoàn thành ${tasks.length} công việc`,
      );
      onSuccess();
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Không thể xác nhận hoàn thành công việc'),
  });

  return (
    <div className="space-y-3.5 text-xs">
      <div className="max-h-36 space-y-1.5 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2.5">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start justify-between gap-2">
            <div className="font-medium text-slate-800">
              <span className="font-mono font-bold text-primary">{task.code}</span> · {task.title}
            </div>
            <span className="shrink-0 font-mono text-[11px] text-slate-500">
              Hạn: {formatDateTimeVi(task.dueAt)}
            </span>
          </div>
        ))}
      </div>

      {lateTasks.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <div className="font-bold">Lưu ý hoàn thành quá hạn</div>
            <p className="mt-0.5 text-[11px] leading-relaxed">
              Có <b>{lateTasks.length} công việc</b> đã qua thời hạn quy định. Hệ thống vẫn cho phép
              bạn xác nhận hoàn thành nhưng sẽ tự động ghi nhận trạng thái{' '}
              <b>Hoàn thành muộn</b> kèm số phút trễ thực tế.
            </p>
          </div>
        </div>
      )}

      <Textarea
        label="Báo cáo kết quả thực hiện / Ghi chú hoàn thành"
        placeholder="Nhập tóm tắt kết quả công việc đã xử lý..."
        value={completionNote}
        onChange={(e) => setCompletionNote(e.target.value)}
        rows={3}
        fullWidth
      />

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:justify-end">
        <Button variant="outline" size="sm" className="w-full justify-center sm:w-auto" onClick={onClose}>
          Đóng
        </Button>
        <Button
          size="sm"
          variant="primary"
          className="w-full justify-center sm:w-auto"
          leftIcon={<CheckCircle2 size={14} />}
          loading={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          Xác nhận hoàn thành
        </Button>
      </div>
    </div>
  );
}

