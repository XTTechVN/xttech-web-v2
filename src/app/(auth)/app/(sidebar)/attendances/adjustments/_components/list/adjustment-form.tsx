'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createAdjustmentRequest, getUsers, updateAdjustmentRequest } from '@/actions';
import { Textarea } from '@/components';
import { DateTimeField, Select } from '@/components-remake';
import { useCan } from '@/hooks';
import { useAuthStore } from '@/stores';
import type { Attendance, AttendanceAdjustmentRequest, RequestType } from '@/types';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { fmtDate, hhmm, personName, touchesIn, touchesOut } from './format';

export const ADJUSTMENT_FORM_ID = 'adjustment-form';

const FROM_ATTENDANCE = [
  { value: 'check_in', label: 'Bổ sung check-in' },
  { value: 'check_out', label: 'Bổ sung check-out' },
];

interface Props {
  /** Có = sửa khiếu nại */
  initial?: AttendanceAdjustmentRequest;
  /** Có = tạo khiếu nại cho một bản ghi chấm công cụ thể (từ bảng chấm công) */
  attendance?: Attendance | null;
  onDone: () => void;
  onPendingChange: (pending: boolean) => void;
}

// Tạo hoặc sửa khiếu nại chấm công (≤ 6 ô nên làm trong drawer đang mở, không mở thêm lớp)
export function AdjustmentForm({ initial, attendance, onDone, onPendingChange }: Props) {
  const { isWide } = useCan();
  const me = useAuthStore((s) => s.user);
  // create phạm vi dept/org được khiếu nại hộ người khác; own chỉ cho chính mình
  const pickUser = !initial && !attendance && isWide('attendance_request:create');

  const [userId, setUserId] = useState(initial?.userId ?? attendance?.userId ?? (pickUser ? '' : (me?.id ?? '')));
  const [type, setType] = useState<RequestType>(initial?.requestType ?? (attendance ? 'check_in' : 'forgot_attendance'));
  const [workDate, setWorkDate] = useState(initial?.workDate ?? attendance?.workDate?.slice(0, 10) ?? '');
  const [reqIn, setReqIn] = useState(hhmm(initial?.requestedCheckIn));
  const [reqOut, setReqOut] = useState(hhmm(initial?.requestedCheckOut));
  const [reason, setReason] = useState(initial?.reason ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const users = useQuery({ queryKey: ['users', 'adjustment-form'], queryFn: () => getUsers({ limit: 100 }), enabled: pickUser });
  const userOptions = (users.data?.items ?? []).map((u) => ({ value: String(u.id), label: personName(u) }));

  const needIn = touchesIn(type);
  const needOut = touchesOut(type);
  const fixedDate = !!attendance;

  const touch = (k: string) => setErrors((e) => (e[k] ? { ...e, [k]: '' } : e));

  const save = useMutation({
    mutationFn: async () => {
      const times = { requestedCheckIn: needIn ? reqIn || undefined : undefined, requestedCheckOut: needOut ? reqOut || undefined : undefined };
      if (initial) {
        await updateAdjustmentRequest(initial.id, { requestType: type, workDate, reason: reason.trim(), ...times });
        return;
      }
      await createAdjustmentRequest({
        userId,
        requestType: type,
        workDate,
        attendanceId: attendance ? Number(attendance.id) : undefined,
        oldCheckIn: attendance && type === 'check_in' ? hhmm(attendance.checkIn) || undefined : undefined,
        oldCheckOut: attendance && type === 'check_out' ? hhmm(attendance.checkOut) || undefined : undefined,
        reason: reason.trim(),
        status: 'pending',
        ...times,
      });
    },
    onSuccess: () => {
      ['adjustment-requests', 'adjustments', 'attendances'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
      toast.success(initial ? 'Cập nhật khiếu nại thành công' : 'Gửi khiếu nại thành công');
      onDone();
    },
    onError: (e) => showErrorToast(e, initial ? 'Không thể cập nhật khiếu nại' : 'Không thể tạo khiếu nại'),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!userId) next.userId = 'Vui lòng chọn nhân sự';
    if (!workDate) next.workDate = 'Vui lòng chọn ngày làm việc';
    if (needIn && !reqIn) next.reqIn = 'Vui lòng nhập giờ vào đề nghị';
    if (needOut && !reqOut) next.reqOut = 'Vui lòng nhập giờ ra đề nghị';
    if (!reason.trim()) next.reason = 'Vui lòng nhập lý do';
    setErrors(next);
    if (Object.keys(next).length) return;
    onPendingChange(true);
    save.mutate(undefined, { onSettled: () => onPendingChange(false) });
  };

  const old = attendance && (type === 'check_in' ? hhmm(attendance.checkIn) : hhmm(attendance.checkOut));

  return (
    <form id={ADJUSTMENT_FORM_ID} onSubmit={submit} className="flex flex-col gap-4">
      {pickUser && (
        <div>
          <Select
            label="Nhân sự *"
            placeholder="Chọn nhân sự"
            value={userId}
            options={userOptions}
            loading={users.isLoading}
            onChange={(v) => {
              setUserId(v);
              touch('userId');
            }}
          />
          {errors.userId && <span className="mt-1.5 block text-xs text-red-500">{errors.userId}</span>}
        </div>
      )}
      {attendance && <p className="text-sm text-slate-600">Chấm công ngày {fmtDate(attendance.workDate)}</p>}
      {attendance && <Select label="Loại khiếu nại" value={type} options={FROM_ATTENDANCE} onChange={(v) => setType(v as RequestType)} />}
      {!fixedDate && (
        <DateTimeField
          label="Ngày làm việc *"
          value={workDate}
          onChange={(v) => {
            setWorkDate(v);
            touch('workDate');
          }}
          error={errors.workDate}
        />
      )}
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
        {needIn && (
          <div className={needOut ? undefined : 'col-span-2'}>
            <DateTimeField
              label="Giờ vào đề nghị *"
              mode="time"
              value={reqIn}
              onChange={(v) => {
                setReqIn(v);
                touch('reqIn');
              }}
              error={errors.reqIn}
            />
          </div>
        )}
        {needOut && (
          <div className={needIn ? undefined : 'col-span-2'}>
            <DateTimeField
              label="Giờ ra đề nghị *"
              mode="time"
              value={reqOut}
              onChange={(v) => {
                setReqOut(v);
                touch('reqOut');
              }}
              error={errors.reqOut}
            />
          </div>
        )}
      </div>
      {old && <p className="-mt-2 text-xs text-slate-500">Hiện tại: {old}</p>}
      <Textarea
        label="Lý do *"
        placeholder="Nhập lý do khiếu nại"
        rows={3}
        fullWidth
        value={reason}
        onChange={(e) => {
          setReason(e.target.value);
          touch('reason');
        }}
      />
      {errors.reason && <span className="-mt-3 block text-xs text-red-500">{errors.reason}</span>}
    </form>
  );
}
