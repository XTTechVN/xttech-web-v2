'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createWorkShift, deleteWorkShift, getDepartments, updateWorkShift } from '@/actions';
import { useCan } from '@/hooks';
import type { WorkShift } from '@/types';
import { BTN_DANGER, BTN_PRIMARY, Field, INPUT, messageOf } from '../../_components/form';
import { Select } from '../../_components/select';
import { Sheet } from '../../_components/sheet';

export const hm = (t?: string | null) => (t ? t.slice(0, 5) : '');

export const SHIFT_TYPES = [
  { value: 'full_day', label: 'Cả ngày' },
  { value: 'morning', label: 'Buổi sáng' },
  { value: 'afternoon', label: 'Buổi chiều' },
  { value: 'night', label: 'Ca đêm' },
];
const STATUSES = [
  { value: 'active', label: 'Đang dùng' },
  { value: 'inactive', label: 'Tạm ngưng' },
];

interface Props {
  target: WorkShift | 'new' | null;
  onClose: () => void;
  /** Phòng ban điền sẵn khi thêm ca từ một khối phòng ban */
  defaultDepartmentId?: number;
}

// Thêm / sửa / xoá ca làm việc. Ngày làm và vị trí chấm công giữ nguyên khi sửa.
export function WorkShiftSheet({ target, onClose, defaultDepartmentId }: Props) {
  const { can } = useCan();
  const qc = useQueryClient();
  const w = target && target !== 'new' ? target : null;
  const [name, setName] = useState(w?.name ?? '');
  const [start, setStart] = useState(hm(w?.startTime) || '08:00');
  const [end, setEnd] = useState(hm(w?.endTime) || '17:00');
  const [shiftType, setShiftType] = useState(w?.shiftType ?? 'full_day');
  const [departmentId, setDepartmentId] = useState(w?.departmentId ? String(w.departmentId) : defaultDepartmentId ? String(defaultDepartmentId) : '');
  const [status, setStatus] = useState(w?.status ?? 'active');
  const editable = w ? can('work_shift:update') : can('work_shift:create');

  const { data: depts } = useQuery({ queryKey: ['departments'], queryFn: () => getDepartments({ limit: 100 }) });

  const done = (msg: string) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ['work-shifts'] });
    onClose();
  };
  const fail = (e: unknown) => toast.error(messageOf(e));
  const save = useMutation({
    mutationFn: () => {
      const body = { name: name.trim(), startTime: `${start}:00`, endTime: `${end}:00`, shiftType, status, departmentId: Number(departmentId) };
      return w ? updateWorkShift(w.id, body) : createWorkShift({ ...body, workDays: '2,3,4,5,6' });
    },
    onSuccess: () => done(w ? 'Đã lưu ca làm việc' : 'Đã thêm ca làm việc'),
    onError: fail,
  });
  const remove = useMutation({ mutationFn: () => deleteWorkShift(w!.id), onSuccess: () => done('Đã xoá ca làm việc'), onError: fail });

  return (
    <Sheet open={!!target} onClose={onClose} title={w ? 'Ca làm việc' : 'Thêm ca làm việc'}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Tên ca" id="ws-name">
          <input
            id="ws-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
            disabled={!editable}
            className={INPUT}
          />
        </Field>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <Field label="Giờ vào" id="ws-start">
            <input
              id="ws-start"
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
              disabled={!editable}
              className={INPUT}
            />
          </Field>
          <Field label="Giờ ra" id="ws-end">
            <input id="ws-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} required disabled={!editable} className={INPUT} />
          </Field>
        </div>
        <Field label="Loại ca" id="ws-type">
          <Select id="ws-type" label="Loại ca" value={shiftType} onChange={setShiftType} options={SHIFT_TYPES} disabled={!editable} />
        </Field>
        <Field label="Phòng ban" id="ws-dept">
          <Select
            id="ws-dept"
            label="Phòng ban"
            value={departmentId}
            onChange={setDepartmentId}
            options={(depts?.items ?? []).map((d: { id: number; name: string }) => ({ value: String(d.id), label: d.name }))}
            disabled={!editable}
          />
        </Field>
        <Field label="Trạng thái" id="ws-status">
          <Select id="ws-status" label="Trạng thái" value={status} onChange={setStatus} options={STATUSES} disabled={!editable} />
        </Field>
        {editable && (
          <button type="submit" disabled={save.isPending || !name.trim() || !departmentId} className={BTN_PRIMARY}>
            {save.isPending ? 'Đang lưu…' : 'Lưu'}
          </button>
        )}
      </form>

      {w && can('work_shift:delete') && (
        <div className="border-t border-rm-line p-rm-gutter">
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => window.confirm(`Xoá ca "${w.name}"? Không thể hoàn tác.`) && remove.mutate()}
            className={`${BTN_DANGER} w-full`}
          >
            Xoá ca làm việc
          </button>
        </div>
      )}
    </Sheet>
  );
}
