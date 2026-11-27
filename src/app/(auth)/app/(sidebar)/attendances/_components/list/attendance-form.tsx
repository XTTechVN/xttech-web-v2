'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createAttendance, getUsers, updateAttendance } from '@/actions';
import { Input, Textarea } from '@/components';
import { DateTimeField, Select } from '@/components-remake';
import { useCan } from '@/hooks';
import type { Attendance, AttendanceStatus } from '@/types';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { hhmm } from './format';

export const ATTENDANCE_FORM_ID = 'attendance-form';

const STATUS_OPTIONS = [
  { value: 'normal', label: 'Đúng giờ' },
  { value: 'late', label: 'Đi muộn' },
  { value: 'early_leave', label: 'Về sớm' },
  { value: 'half_day', label: 'Nghỉ nửa ngày' },
  { value: 'leave', label: 'Nghỉ có phép' },
  { value: 'absent', label: 'Nghỉ không phép' },
];

const time = (v?: string | null) => (v ? hhmm(v) : '');

interface Props {
  /** Có = sửa; không có = thêm mới */
  initial?: Attendance;
  onDone: () => void;
  onPendingChange: (pending: boolean) => void;
}

// Thêm hoặc sửa một bản ghi chấm công (khoảng 7 ô nên làm trong drawer đang mở, không mở thêm lớp)
export function AttendanceForm({ initial, onDone, onPendingChange }: Props) {
  const { scopeOf, me } = useCan();
  // create phạm vi dept/org mới được chọn người khác; own chỉ tạo cho chính mình
  const createScope = scopeOf('attendance:create');
  const pickUser = !initial && (createScope === 'dept' || createScope === 'org');

  const [userId, setUserId] = useState(initial?.userId ?? (pickUser ? '' : (me?.user.id ?? '')));
  const [workDate, setWorkDate] = useState(initial?.workDate ?? '');
  const [checkIn, setCheckIn] = useState(time(initial?.checkIn));
  const [checkOut, setCheckOut] = useState(time(initial?.checkOut));
  const [status, setStatus] = useState(initial?.status ?? 'normal');
  const [hours, setHours] = useState(String(initial?.totalHours ?? 0));
  const [note, setNote] = useState(initial?.note ?? '');
  const [errors, setErrors] = useState<{ userId?: string; workDate?: string }>({});

  const users = useQuery({ queryKey: ['users', 'attendance-form'], queryFn: () => getUsers({ limit: 100 }), enabled: pickUser });
  const userOptions = (users.data?.items ?? []).map((u) => ({ value: u.id, label: u.fullName || u.username }));

  const save = useMutation({
    mutationFn: () => {
      const common = { workDate, checkIn: checkIn || null, checkOut: checkOut || null, status: status as AttendanceStatus, note };
      return initial
        ? updateAttendance(initial.id, { ...initial, ...common, totalHours: Number(hours) || 0 })
        : createAttendance({ userId, ...common });
    },
    onSuccess: () => {
      ['attendances', 'attendances-stats'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
      toast.success(initial ? 'Cập nhật chấm công thành công' : 'Thêm chấm công thành công');
      onDone();
    },
    onError: (e) => showErrorToast(e, initial ? 'Cập nhật chấm công thất bại' : 'Không thể tạo chấm công'),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = { userId: userId ? undefined : 'Vui lòng chọn nhân sự', workDate: workDate ? undefined : 'Vui lòng chọn ngày làm việc' };
    setErrors(next);
    if (next.userId || next.workDate) return;
    onPendingChange(true);
    save.mutate(undefined, { onSettled: () => onPendingChange(false) });
  };

  return (
    <form id={ATTENDANCE_FORM_ID} onSubmit={submit} className="flex flex-col gap-4">
      {pickUser && (
        <div>
          <Select label="Nhân sự *" placeholder="Chọn nhân sự" value={userId} options={userOptions} loading={users.isLoading} onChange={setUserId} />
          {errors.userId && <span className="mt-1.5 block text-xs text-red-500">{errors.userId}</span>}
        </div>
      )}
      <DateTimeField label="Ngày làm việc *" value={workDate} onChange={setWorkDate} error={errors.workDate} />
      <div className="grid grid-cols-2 gap-3">
        <DateTimeField label="Giờ vào" mode="time" value={checkIn} onChange={setCheckIn} />
        <DateTimeField label="Giờ ra" mode="time" value={checkOut} onChange={setCheckOut} />
      </div>
      <Select label="Trạng thái" value={status} options={STATUS_OPTIONS} onChange={setStatus} />
      {initial && <Input label="Tổng giờ" type="number" step="any" min="0" fullWidth value={hours} onChange={(e) => setHours(e.target.value)} />}
      <Textarea label="Ghi chú" placeholder="Nhập ghi chú" rows={3} fullWidth value={note} onChange={(e) => setNote(e.target.value)} />
    </form>
  );
}
