'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createAdjustmentRequest, deleteAdjustmentRequest, updateAdjustmentRequest } from '@/actions';
import { useCan } from '@/hooks';
import type { AttendanceAdjustmentRequest, RequestType } from '@/types';
import type { Tone } from '../../_components/badge';
import { BTN_DANGER, BTN_LINE, BTN_PRIMARY, Field, INPUT, messageOf } from '../../_components/form';
import { Select } from '../../_components/select';
import { Sheet } from '../../_components/sheet';

export const hm = (t?: string | null) => (t ? t.slice(0, 5) : '');
export const vnDate = (d: string) => d.split('-').reverse().join('/');
const today = () => new Date().toLocaleDateString('sv');

const TYPES = [
  { value: 'forgot_attendance', label: 'Quên chấm công' },
  { value: 'check_in', label: 'Bổ sung giờ vào' },
  { value: 'check_out', label: 'Bổ sung giờ ra' },
  { value: 'overtime', label: 'Tăng ca' },
];
export const STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'Chờ duyệt', tone: 'warning' },
  approved: { label: 'Đã duyệt', tone: 'success' },
  rejected: { label: 'Từ chối', tone: 'danger' },
};

interface Props {
  target: AttendanceAdjustmentRequest | 'new' | null;
  onClose: () => void;
  defaultType?: string;
  defaultDate?: string;
}

// Gửi / sửa / xoá khiếu nại công; người có quyền sửa duyệt hoặc từ chối đơn của người khác.
export function AdjustmentSheet({ target, onClose, defaultType, defaultDate }: Props) {
  const { can, me } = useCan();
  const qc = useQueryClient();
  const r = target && target !== 'new' ? target : null;
  const [requestType, setRequestType] = useState<string>(r?.requestType ?? defaultType ?? 'forgot_attendance');
  const [workDate, setWorkDate] = useState(r?.workDate ?? defaultDate ?? today());
  const [checkIn, setCheckIn] = useState(hm(r?.requestedCheckIn));
  const [checkOut, setCheckOut] = useState(hm(r?.requestedCheckOut));
  const [reason, setReason] = useState(r?.reason ?? '');
  const [reviewNote, setReviewNote] = useState('');
  const pending = !r || r.status === 'pending';
  const editable = pending && (r ? can('attendance_request:update') : can('attendance_request:create'));
  const s = r ? (STATUS[r.status] ?? STATUS.pending) : null;
  const canReview = !!r && r.status === 'pending' && can('attendance_request:update') && r.userId !== me?.user.id;

  const done = (msg: string) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ['adjustments'] });
    onClose();
  };
  const fail = (e: unknown) => toast.error(messageOf(e));
  const time = (t: string) => (t ? `${t}:00` : undefined);
  const save = useMutation({
    mutationFn: () => {
      const body = {
        requestType: requestType as RequestType,
        workDate,
        requestedCheckIn: time(checkIn),
        requestedCheckOut: time(checkOut),
        reason: reason.trim(),
      };
      return r ? updateAdjustmentRequest(r.id, body).then(() => null) : createAdjustmentRequest({ ...body, userId: me!.user.id }).then(() => null);
    },
    onSuccess: () => done(r ? 'Đã lưu khiếu nại' : 'Đã gửi khiếu nại'),
    onError: fail,
  });
  const review = useMutation({
    mutationFn: (status: 'approved' | 'rejected') =>
      updateAdjustmentRequest(r!.id, {
        status,
        reviewNote: reviewNote.trim() || undefined,
        reviewedBy: me!.user.id,
        reviewedAt: new Date().toISOString(),
      }),
    onSuccess: (_, status) => done(status === 'approved' ? 'Đã duyệt khiếu nại' : 'Đã từ chối khiếu nại'),
    onError: fail,
  });
  const remove = useMutation({ mutationFn: () => deleteAdjustmentRequest(r!.id), onSuccess: () => done('Đã xoá khiếu nại'), onError: fail });

  return (
    <Sheet open={!!target} onClose={onClose} title={r ? (r.user?.fullName ?? 'Khiếu nại công') : 'Gửi khiếu nại'}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        {r && s && (
          <p className="text-sm text-rm-muted">
            Trạng thái: <span className="font-medium text-rm-text">{s.label}</span>
            {r.reviewNote && ` · ${r.reviewNote}`}
          </p>
        )}
        <Field label="Loại khiếu nại" id="ad-type">
          <Select id="ad-type" label="Loại khiếu nại" value={requestType} onChange={setRequestType} options={TYPES} disabled={!editable} />
        </Field>
        <Field label="Ngày công" id="ad-date">
          <input
            id="ad-date"
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            required
            disabled={!editable}
            className={INPUT}
          />
        </Field>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <Field label="Giờ vào đề nghị" id="ad-in">
            <input id="ad-in" type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} disabled={!editable} className={INPUT} />
          </Field>
          <Field label="Giờ ra đề nghị" id="ad-out">
            <input id="ad-out" type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} disabled={!editable} className={INPUT} />
          </Field>
        </div>
        <Field label="Lý do" id="ad-reason">
          <input id="ad-reason" value={reason} onChange={(e) => setReason(e.target.value)} required disabled={!editable} className={INPUT} />
        </Field>
        {editable && (
          <button
            type="submit"
            disabled={save.isPending || !reason.trim() || (requestType === 'forgot_attendance' ? !(checkIn && checkOut) : !(checkIn || checkOut))}
            className={BTN_PRIMARY}
          >
            {save.isPending ? 'Đang lưu…' : r ? 'Lưu' : 'Gửi khiếu nại'}
          </button>
        )}
      </form>

      {canReview && (
        <div className="flex flex-col gap-3 border-t border-rm-line p-rm-gutter">
          <Field label="Ghi chú duyệt" id="ad-note">
            <input id="ad-note" value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} className={INPUT} />
          </Field>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
            <button type="button" disabled={review.isPending} onClick={() => review.mutate('rejected')} className={BTN_LINE}>
              Từ chối
            </button>
            <button type="button" disabled={review.isPending} onClick={() => review.mutate('approved')} className={BTN_PRIMARY}>
              Duyệt
            </button>
          </div>
        </div>
      )}

      {r && pending && can('attendance_request:delete') && (
        <div className="border-t border-rm-line p-rm-gutter">
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => window.confirm('Xoá khiếu nại này? Không thể hoàn tác.') && remove.mutate()}
            className={`${BTN_DANGER} w-full`}
          >
            Xoá khiếu nại
          </button>
        </div>
      )}
    </Sheet>
  );
}
