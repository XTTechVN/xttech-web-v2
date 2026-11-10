'use client';

import React, { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Check, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { createStaffTasks, updateStaffTask } from '@/actions';
import { Button, Input, Modal, Select, Textarea } from '@/components';
import { TASK_CATEGORY_OPTIONS, TASK_PRIORITY_OPTIONS } from '@/config';
import { cn, includesSearchText, showErrorToast } from '@/utils';
import type { Department, Employee, Project, StaffTask, StaffTaskCategory, StaffTaskPriority } from '@/types';
import { buildLocalDateTimeInputValue, DUE_PRESET_OPTIONS, getPresetDueDateTime } from '../../_constants/task.constants';

interface TaskFormModalProps {
  isOpen: boolean;
  task: StaffTask | null;
  employees: Employee[];
  departments: Department[];
  projects: Project[];
  onClose: () => void;
  onSuccess: () => void;
}

const PRIORITY_DOT_CLASS: Record<StaffTaskPriority, string> = {
  low: 'bg-slate-400',
  medium: 'bg-sky-500',
  high: 'bg-amber-500',
  urgent: 'bg-rose-500',
};

function getInitials(name?: string | null): string {
  if (!name) return 'NV';
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function TaskFormModal({ isOpen, task, employees, departments, projects, onClose, onSuccess }: TaskFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      className="md:max-w-3xl"
      bodyClassName="p-0"
      title={task ? `Chỉnh sửa công việc ${task.code}` : 'Giao công việc mới'}
    >
      {isOpen && (
        <TaskFormBody
          key={task ? `edit-${task.id}` : 'create-new'}
          task={task}
          employees={employees}
          departments={departments}
          projects={projects}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}

function TaskFormBody({ task, employees, departments, projects, onClose, onSuccess }: Omit<TaskFormModalProps, 'isOpen'>) {
  const isEdit = Boolean(task);
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [category, setCategory] = useState<StaffTaskCategory>(task?.category || 'general');
  const [priority, setPriority] = useState<StaffTaskPriority>(task?.priority || 'medium');
  const [dueAt, setDueAt] = useState<string>(() =>
    task?.dueAt ? buildLocalDateTimeInputValue(new Date(task.dueAt)) : getPresetDueDateTime('today_1730'),
  );
  const [projectId, setProjectId] = useState<string>(task?.projectId ? String(task.projectId) : '');
  const [managerNote, setManagerNote] = useState(task?.managerNote || '');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [staffSearch, setStaffSearch] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>(task?.assigneeId ? [task.assigneeId] : []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (selectedDeptId && !emp.positions?.some((pos) => pos.departmentId === Number(selectedDeptId))) return false;
      if (staffSearch.trim()) {
        return includesSearchText(emp.fullName, staffSearch) || includesSearchText(emp.email, staffSearch);
      }
      return true;
    });
  }, [employees, selectedDeptId, staffSearch]);

  const toggleAssignee = (id: string) => {
    if (isEdit) {
      setAssigneeIds([id]);
      return;
    }
    setAssigneeIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleAllFiltered = () => {
    if (isEdit) return;
    const filteredIds = filteredEmployees.map((e) => e.id);
    const allSelected = filteredIds.length > 0 && filteredIds.every((id) => assigneeIds.includes(id));
    setAssigneeIds((prev) => (allSelected ? prev.filter((id) => !filteredIds.includes(id)) : Array.from(new Set([...prev, ...filteredIds]))));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const basePayload = {
        title: title.trim(),
        description: description.trim() || null,
        category,
        priority,
        dueAt: new Date(dueAt).toISOString(),
        projectId: projectId ? Number(projectId) : null,
        managerNote: managerNote.trim() || null,
      };
      if (task) return updateStaffTask(task.id, { ...basePayload, assigneeId: assigneeIds[0] });
      return createStaffTasks({ ...basePayload, assigneeIds });
    },
    onSuccess: (res) => {
      const count = 'createdCount' in res ? res.createdCount : 1;
      toast.success(task ? 'Đã cập nhật công việc' : `Đã giao công việc cho ${count} nhân sự`);
      onSuccess();
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Không thể lưu công việc'),
  });

  const canSubmit = title.trim().length >= 3 && assigneeIds.length > 0 && Boolean(dueAt);
  const allFilteredSelected = filteredEmployees.length > 0 && filteredEmployees.every((e) => assigneeIds.includes(e.id));

  return (
    <div className="flex flex-col text-xs">
      <div className="grid grid-cols-1 gap-5 p-4 sm:p-5 md:grid-cols-12">
        <div className="space-y-3.5 md:col-span-7">
          <Input label="Tiêu đề công việc *" placeholder="VD: Kiểm tra bản lề & nghiệm thu cửa tầng 2..." value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select label="Phân loại công việc" value={category} onChange={(e) => setCategory(e.target.value as StaffTaskCategory)} options={TASK_CATEGORY_OPTIONS} fullWidth />
            <Select
              label="Dự án / Công trình"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Không gắn dự án"
              options={[{ value: '', label: 'Không gắn dự án' }, ...projects.map((p) => ({ value: String(p.id), label: `${p.code} · ${p.name}` }))]}
              fullWidth
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Mức độ ưu tiên</label>
            <div className="grid grid-cols-4 gap-1.5">
              {TASK_PRIORITY_OPTIONS.map((opt) => {
                const pVal = opt.value as StaffTaskPriority;
                const active = priority === pVal;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(pVal)}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-colors cursor-pointer',
                      active ? 'border-primary bg-primary/8 font-semibold text-primary' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', PRIORITY_DOT_CLASS[pVal])} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Thời hạn hoàn thành *</label>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {DUE_PRESET_OPTIONS.map((preset) => {
                const presetVal = getPresetDueDateTime(preset.key);
                const isMatch = dueAt === presetVal;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => setDueAt(presetVal)}
                    className={cn(
                      'rounded-lg border py-1.5 text-center text-[11px] font-medium tabular-nums transition-colors cursor-pointer',
                      isMatch ? 'border-primary bg-primary font-semibold text-white' : 'border-slate-200 bg-slate-50/80 text-slate-600 hover:border-primary/40 hover:text-primary',
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <Input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} fullWidth />
          </div>

          <Textarea label="Mô tả chi tiết công việc" placeholder="Hướng dẫn nội dung cần thực hiện, yêu cầu nghiệm thu..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} fullWidth />
          <Input label="Ghi chú chỉ đạo của Quản lý" placeholder="VD: Chụp ảnh báo cáo ngay sau khi xử lý xong..." value={managerNote} onChange={(e) => setManagerNote(e.target.value)} fullWidth />
        </div>

        <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 md:col-span-5">
          <div className="flex items-center justify-between gap-2 pb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-800">Nhân sự nhận việc *</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">{assigneeIds.length}</span>
            </div>
            {!isEdit && filteredEmployees.length > 0 && (
              <button type="button" onClick={toggleAllFiltered} className="text-[11px] font-medium text-primary hover:underline cursor-pointer">
                {allFilteredSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
            )}
          </div>


          <div className="space-y-2 pb-2.5">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Tìm tên hoặc email nhân sự..." value={staffSearch} onChange={(e) => setStaffSearch(e.target.value)} className="bg-white pl-8" fullWidth />
            </div>
            <Select
              placeholder="Tất cả phòng ban"
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              options={[{ value: '', label: 'Tất cả phòng ban' }, ...departments.map((d) => ({ value: String(d.id), label: d.name }))]}
              fullWidth
            />
          </div>

          <div className="max-h-56 min-h-50 flex-1 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 bg-white md:max-h-85">
            {filteredEmployees.map((emp) => {
              const checked = assigneeIds.includes(emp.id);
              const firstDeptId = emp.positions?.[0]?.departmentId;
              const deptName = firstDeptId ? departments.find((d) => d.id === firstDeptId)?.name : undefined;
              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => toggleAssignee(emp.id)}
                  className={cn('flex w-full items-center justify-between gap-2.5 px-3 py-2 text-left transition-colors cursor-pointer', checked ? 'bg-primary/6' : 'hover:bg-slate-50')}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold', checked ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600')}>
                      {getInitials(emp.fullName)}
                    </div>
                    <div className="min-w-0">
                      <div className={cn('truncate font-medium', checked ? 'font-semibold text-primary' : 'text-slate-800')}>{emp.fullName}</div>
                      <div className="truncate text-[11px] text-slate-400">{deptName ? `${deptName} · ${emp.email}` : emp.email}</div>
                    </div>
                  </div>
                  <div className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors', checked ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white')}>
                    {checked && <Check size={11} strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
            {filteredEmployees.length === 0 && <div className="py-8 text-center text-slate-400">Không tìm thấy nhân sự phù hợp</div>}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:px-5">
        <span className="text-[11px] text-slate-500">
          {assigneeIds.length > 0 ? `Sẵn sàng giao việc cho ${assigneeIds.length} nhân sự đã chọn` : 'Vui lòng nhập tiêu đề và chọn ít nhất 1 nhân sự'}
        </span>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 justify-center sm:flex-initial" onClick={onClose}>Hủy</Button>
          <Button size="sm" className="flex-1 justify-center sm:flex-initial" disabled={!canSubmit} loading={mutation.isPending} onClick={() => mutation.mutate()}>
            {isEdit ? 'Lưu thay đổi' : 'Giao việc ngay'}
          </Button>
        </div>
      </div>
    </div>
  );
}
