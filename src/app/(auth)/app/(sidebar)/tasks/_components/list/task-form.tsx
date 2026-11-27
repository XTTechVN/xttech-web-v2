'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { createStaffTasks, getDepartments, getEmployees, getProjects, updateStaffTask } from '@/actions';
import { Input, Textarea } from '@/components';
import { TASK_CATEGORY_OPTIONS, TASK_PRIORITY_OPTIONS } from '@/config';
import { Chip, DateTimeField, SearchField, Select } from '@/components-remake';
import { useCan } from '@/hooks';
import type { Department, StaffTask, StaffTaskCategory, StaffTaskPriority } from '@/types';
import { cn, includesSearchText, showErrorToast } from '@/utils';
import { DUE_PRESETS, fmtDateTime, initials, presetValue, refreshTasks, toInputValue } from './format';

export const TASK_FORM_ID = 'task-form';

interface Props {
  /** Có = sửa; không có = giao việc mới */
  initial?: StaffTask;
  onDone: () => void;
  onPendingChange: (pending: boolean) => void;
}

const STALE = 5 * 60 * 1000;

// Giao việc hoặc sửa việc. Giao mới chọn được nhiều người (mỗi người một việc); sửa chỉ một người.
export function TaskForm({ initial, onDone, onPendingChange }: Props) {
  const { can } = useCan();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState<string>(initial?.category ?? 'general');
  const [priority, setPriority] = useState<string>(initial?.priority ?? 'medium');
  const [dueAt, setDueAt] = useState(() => (initial?.dueAt ? toInputValue(new Date(initial.dueAt)) : presetValue('today_1730')));
  const [projectId, setProjectId] = useState(initial?.projectId ? String(initial.projectId) : '');
  const [managerNote, setManagerNote] = useState(initial?.managerNote ?? '');
  const [assigneeIds, setAssigneeIds] = useState<string[]>(initial?.assigneeId ? [initial.assigneeId] : []);
  const [deptId, setDeptId] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const touch = (k: string) => setErrors((e) => (e[k] ? { ...e, [k]: '' } : e));

  const employees = useQuery({
    queryKey: ['employees', 'task-assignees'],
    queryFn: () => getEmployees({ limit: 200 }),
    enabled: can('user:read'),
    staleTime: STALE,
  });
  const departments = useQuery({
    queryKey: ['departments', 'task-filter'],
    queryFn: () => getDepartments({ limit: 100 }),
    enabled: can('department:read'),
    staleTime: STALE,
  });
  const projects = useQuery({
    queryKey: ['projects', 'task-selector'],
    queryFn: () => getProjects({ limit: 100 }),
    enabled: can('project:read'),
    staleTime: STALE,
  });

  const deptList = useMemo<Department[]>(
    () => (Array.isArray(departments.data) ? departments.data : (departments.data?.items ?? [])),
    [departments.data],
  );
  const people = useMemo(() => {
    const kw = staffSearch.trim();
    return (employees.data?.items ?? []).filter(
      (e) =>
        (!deptId || e.positions?.some((p) => p.departmentId === Number(deptId))) &&
        (!kw || includesSearchText(e.fullName, kw) || includesSearchText(e.email, kw)),
    );
  }, [employees.data, deptId, staffSearch]);

  const pick = (id: string) => {
    touch('assignee');
    setAssigneeIds((cur) => (initial ? [id] : cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };
  const allPicked = people.length > 0 && people.every((p) => assigneeIds.includes(p.id));
  const toggleAll = () => {
    const ids = people.map((p) => p.id);
    setAssigneeIds((cur) => (allPicked ? cur.filter((x) => !ids.includes(x)) : [...new Set([...cur, ...ids])]));
  };

  const save = useMutation({
    mutationFn: async () => {
      const base = {
        title: title.trim(),
        description: description.trim() || null,
        category: category as StaffTaskCategory,
        priority: priority as StaffTaskPriority,
        dueAt: new Date(dueAt).toISOString(),
        projectId: projectId ? Number(projectId) : null,
        managerNote: managerNote.trim() || null,
      };
      if (initial) {
        await updateStaffTask(initial.id, { ...base, assigneeId: assigneeIds[0] });
        return 1;
      }
      return (await createStaffTasks({ ...base, assigneeIds })).createdCount;
    },
    onSuccess: (count) => {
      refreshTasks();
      toast.success(initial ? 'Đã cập nhật công việc' : `Đã giao việc cho ${count} nhân sự`);
      onDone();
    },
    onError: (e) => showErrorToast(e, 'Không thể lưu công việc'),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (title.trim().length < 3) next.title = 'Vui lòng nhập tiêu đề (ít nhất 3 ký tự)';
    if (!dueAt) next.dueAt = 'Vui lòng chọn hạn hoàn thành';
    if (!assigneeIds.length) next.assignee = 'Vui lòng chọn nhân sự nhận việc';
    setErrors(next);
    if (Object.keys(next).length) return;
    onPendingChange(true);
    save.mutate(undefined, { onSettled: () => onPendingChange(false) });
  };

  return (
    <form id={TASK_FORM_ID} onSubmit={submit} className="flex flex-col gap-4">
      <Input
        label="Tiêu đề *"
        placeholder="Ví dụ: Kiểm tra bản lề, nghiệm thu cửa tầng 2"
        fullWidth
        value={title}
        error={errors.title}
        onChange={(e) => {
          setTitle(e.target.value);
          touch('title');
        }}
      />
      <Select label="Phân loại" value={category} options={TASK_CATEGORY_OPTIONS} onChange={setCategory} />
      <Select
        label="Dự án"
        value={projectId}
        options={(projects.data?.items ?? []).map((p) => ({ value: String(p.id), label: `${p.code} · ${p.name}` }))}
        onChange={setProjectId}
        placeholder="Không gắn dự án"
        clearLabel="Không gắn dự án"
        loading={projects.isLoading}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-slate-500">Mức ưu tiên</span>
        <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-2">
          {TASK_PRIORITY_OPTIONS.map((o) => (
            <Chip key={o.value} selected={priority === o.value} onClick={() => setPriority(o.value)} className="px-1">
              {o.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <DateTimeField
          label="Hạn hoàn thành *"
          mode="datetime"
          value={dueAt}
          error={errors.dueAt}
          onChange={(v) => {
            setDueAt(v);
            touch('dueAt');
          }}
        />
        <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
          {DUE_PRESETS.map((p) => (
            <Chip
              key={p.key}
              selected={dueAt === presetValue(p.key)}
              onClick={() => {
                setDueAt(presetValue(p.key));
                touch('dueAt');
              }}
            >
              {p.label}
            </Chip>
          ))}
        </div>
      </div>

      <Textarea
        label="Mô tả"
        placeholder="Nội dung cần làm, yêu cầu nghiệm thu"
        rows={3}
        fullWidth
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        label="Ghi chú chỉ đạo"
        placeholder="Ví dụ: Chụp ảnh báo cáo sau khi xử lý"
        fullWidth
        value={managerNote}
        onChange={(e) => setManagerNote(e.target.value)}
      />

      <fieldset className="flex min-w-0 flex-col gap-2">
        <legend className="mb-1 flex w-full items-center justify-between gap-2 text-xs font-medium text-slate-500">
          <span>Nhân sự nhận việc * ({assigneeIds.length})</span>
          {!initial && people.length > 0 && (
            <button type="button" onClick={toggleAll} className="min-h-11 cursor-pointer px-1 text-sm font-medium text-primary md:min-h-9">
              {allPicked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          )}
        </legend>
        <div className="flex flex-col gap-2">
          <SearchField value={staffSearch} onChange={setStaffSearch} label="Tìm nhân sự" placeholder="Tìm tên hoặc email" />
          <Select
            label="Phòng ban"
            value={deptId}
            options={deptList.map((d) => ({ value: String(d.id), label: d.name }))}
            onChange={setDeptId}
            placeholder="Tất cả phòng ban"
            clearLabel="Tất cả phòng ban"
          />
        </div>
        <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-block border border-slate-200/80 bg-white">
          {employees.isLoading && <li className="px-3 py-6 text-center text-sm text-slate-500">Đang tải nhân sự...</li>}
          {people.map((p) => {
            const on = assigneeIds.includes(p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => pick(p.id)}
                  className={cn(
                    'flex min-h-14 w-full cursor-pointer items-center gap-3 px-3 py-2 text-left active:bg-slate-50',
                    on && 'bg-primary/5',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-9 flex-none items-center justify-center rounded-control text-xs font-semibold',
                      on ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    {initials(p.fullName)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-900">{p.fullName}</span>
                    <span className="block truncate text-xs text-slate-500">{p.email}</span>
                  </span>
                  {on && <Check size={18} className="flex-none text-primary" />}
                </button>
              </li>
            );
          })}
          {!employees.isLoading && people.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-slate-500">Không tìm thấy nhân sự phù hợp</li>
          )}
        </ul>
        {errors.assignee && <p className="text-xs text-red-600">{errors.assignee}</p>}
        {initial && <p className="text-xs text-slate-500">Hạn hiện tại: {fmtDateTime(initial.dueAt)}</p>}
      </fieldset>
    </form>
  );
}
