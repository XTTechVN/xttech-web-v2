'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createAttendance, deleteAttendance, getEmployees, updateAttendance } from '@/actions';
import { useCan } from '@/hooks';
import { ATTENDANCE_STATUS_LABELS, type Attendance, type AttendanceStatus } from '@/types';
import type { Tone } from '../../_components/badge';
import { BTN_DANGER, BTN_LINE, BTN_PRIMARY, Field, INPUT, messageOf } from '../../_components/form';
import { Select } from '../../_components/select';
import { Sheet } from '../../_components/sheet';

// "07:58:00" hoặc "2026-11-18T07:58:00" → "07:58"
export const hm = (t?: string | null) => (t ? t.slice(-8, -3) : '');

export const TONE: Record<string, Tone> = {
  default: 'neutral',
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'primary',
};

export const STATUS_OPTIONS = ['normal', 'late', 'early_leave', 'late_and_early_leave', 'absent', 'overtime', 'missing_checkout'].map((value) => ({
  value,
  label: ATTENDANCE_STATUS_LABELS[value],
}));

interface Props {
  target: Attendance | 'new' | null;
  date: string;
  onClose: () => void;
  onComplain?: (date: string) => void;
}

// Thêm / sửa / xoá một dòng chấm công. Khi sửa, nhân viên và ngày giữ nguyên.
export function AttendanceSheet({ target, date, onClose, onComplain }: Props) {
  const { can } = useCan();
  const qc = useQueryClient();
  const a = target && target !== 'new' ? target : null;
  const [userId, setUserId] = useState(a?.userId ?? '');
  const [workDate, setWorkDate] = useState(a?.workDate ?? date);
  const [checkIn, setCheckIn] = useState(hm(a?.checkIn));
  const [checkOut, setCheckOut] = useState(hm(a?.checkOut));
  const [status, setStatus] = useState(a?.status ?? 'normal');
  const [note, setNote] = useState(a?.note ?? '');
  const editable = a ? can('attendance:update') : can('attendance:create');

  const { data: users } = useQuery({
    queryKey: ['employees', '', 100],
    queryFn: () => getEmployees({ limit: 100, offset: 0 }),
    enabled: target === 'new',
  });

  const done = (msg: string) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ['attendances'] });
    onClose();
  };
  const fail = (e: unknown) => toast.error(messageOf(e));
  const save = useMutation({
    mutationFn: () => {
      const time = (t: string) => (t ? `${t}:00` : undefined);
      const body = { checkIn: time(checkIn), checkOut: time(checkOut), status, note: note.trim() || undefined };
      if (a) return updateAttendance(a.id, body as never);
      return createAttendance({ ...body, userId, workDate, status: status as AttendanceStatus } as never);
    },
    onSuccess: () => done(a ? 'Đã lưu chấm công' : 'Đã thêm chấm công'),
    onError: fail,
  });
  const remove = useMutation({ mutationFn: () => deleteAttendance(a!.id), onSuccess: () => done('Đã xoá chấm công'), onError: fail });

  return (
    <Sheet open={!!target} onClose={onClose} title={a ? (a.user?.fullName ?? 'Chấm công') : 'Thêm chấm công'}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        {!a && (
          <Field label="Nhân viên" id="at-user">
            <Select
              id="at-user"
              label="Nhân viên"
              value={userId}
              onChange={setUserId}
              options={(users?.items ?? []).map((u) => ({ value: u.id, label: u.fullName }))}
            />
          </Field>
        )}
        <Field label="Ngày" id="at-date">
          <input
            id="at-date"
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            required
            disabled={!!a || !editable}
            className={INPUT}
          />
        </Field>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <Field label="Giờ vào" id="at-in">
            <input id="at-in" type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} disabled={!editable} className={INPUT} />
          </Field>
          <Field label="Giờ ra" id="at-out">
            <input id="at-out" type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} disabled={!editable} className={INPUT} />
          </Field>
        </div>
        <Field label="Trạng thái" id="at-status">
          <Select id="at-status" label="Trạng thái" value={status} onChange={setStatus} options={STATUS_OPTIONS} disabled={!editable} />
        </Field>
        <Field label="Ghi chú" id="at-note">
          <input id="at-note" value={note} onChange={(e) => setNote(e.target.value)} disabled={!editable} className={INPUT} />
        </Field>
        {editable && (
          <button type="submit" disabled={save.isPending || (!a && !userId)} className={BTN_PRIMARY}>
            {save.isPending ? 'Đang lưu…' : 'Lưu'}
          </button>
        )}
      </form>

      {a && onComplain && can('attendance_request:create') && (
        <div className="border-t border-rm-line p-rm-gutter">
          <button type="button" onClick={() => onComplain(a.workDate)} className={`${BTN_LINE} w-full`}>
            Khiếu nại công ngày này
          </button>
        </div>
      )}
      {a && can('attendance:delete') && (
        <div className="border-t border-rm-line p-rm-gutter">
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => window.confirm('Xoá dòng chấm công này? Không thể hoàn tác.') && remove.mutate()}
            className={`${BTN_DANGER} w-full`}
          >
            Xoá chấm công
          </button>
        </div>
      )}
    </Sheet>
  );
}
