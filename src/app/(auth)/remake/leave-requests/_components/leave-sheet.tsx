'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Paperclip } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createLeaveRequest, deleteLeaveRequest, reviewLeaveRequest, updateLeaveRequest } from '@/actions';
import { useCan } from '@/hooks';
import { getFileUrl } from '@/utils';
import type { LeaveRequest } from '@/types';
import type { Tone } from '../../_components/badge';
import { BTN_DANGER, BTN_LINE, BTN_PRIMARY, Field, INPUT, messageOf } from '../../_components/form';
import { Select } from '../../_components/select';
import { Sheet } from '../../_components/sheet';

export const LEAVE_TYPES = [
  { value: 'annual', label: 'Phép năm' },
  { value: 'unpaid', label: 'Không lương' },
  { value: 'sick', label: 'Ốm đau' },
  { value: 'maternity', label: 'Thai sản' },
  { value: 'wedding', label: 'Cưới hỏi' },
  { value: 'bereavement', label: 'Tang lễ' },
  { value: 'other', label: 'Khác' },
];
const DURATIONS = [
  { value: 'full_day', label: 'Cả ngày' },
  { value: 'morning', label: 'Buổi sáng' },
  { value: 'afternoon', label: 'Buổi chiều' },
];
export const STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'Chờ duyệt', tone: 'warning' },
  approved: { label: 'Đã duyệt', tone: 'success' },
  rejected: { label: 'Từ chối', tone: 'danger' },
  cancelled: { label: 'Đã hủy', tone: 'neutral' },
};

// 2026-11-18 → 18/11/2026
export const vnDate = (d: string) => d.split('-').reverse().join('/');
const today = () => new Date().toLocaleDateString('sv');

interface Props {
  target: LeaveRequest | 'new' | null;
  onClose: () => void;
}

// Tạo / sửa / hủy đơn nghỉ và duyệt đơn (quyền thật lấy từ `_can` do API trả về).
export function LeaveSheet({ target, onClose }: Props) {
  const { can } = useCan();
  const qc = useQueryClient();
  const r = target && target !== 'new' ? target : null;
  const [leaveType, setLeaveType] = useState(r?.leaveType ?? 'annual');
  const [durationType, setDurationType] = useState(r?.durationType ?? 'full_day');
  const [startDate, setStartDate] = useState(r?.startDate ?? today());
  const [endDate, setEndDate] = useState(r?.endDate ?? today());
  const [reason, setReason] = useState(r?.reason ?? '');
  const [reviewNote, setReviewNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const editable = r ? !!r._can?.update : can('leave_request:create');
  const s = r ? (STATUS[r.status] ?? STATUS.pending) : null;

  const done = (msg: string) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ['leave-requests'] });
    onClose();
  };
  const fail = (e: unknown) => toast.error(messageOf(e));
  const save = useMutation({
    mutationFn: () => {
      const body = { leaveType, durationType, startDate, endDate, reason: reason.trim() };
      return r ? updateLeaveRequest(String(r.id), body, file) : createLeaveRequest(body, file);
    },
    onSuccess: () => done(r ? 'Đã lưu đơn nghỉ' : 'Đã gửi đơn nghỉ'),
    onError: fail,
  });
  const review = useMutation({
    mutationFn: (status: 'approved' | 'rejected') => reviewLeaveRequest(String(r!.id), { status, reviewNote: reviewNote.trim() || undefined }),
    onSuccess: (_, status) => done(status === 'approved' ? 'Đã duyệt đơn' : 'Đã từ chối đơn'),
    onError: fail,
  });
  const remove = useMutation({ mutationFn: () => deleteLeaveRequest(String(r!.id)), onSuccess: () => done('Đã hủy đơn nghỉ'), onError: fail });

  return (
    <Sheet open={!!target} onClose={onClose} title={r ? (r.user?.fullName ?? 'Đơn nghỉ') : 'Tạo đơn nghỉ'}>
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
            {!editable && r.status !== 'pending' && ' · Đơn đã xử lý, không sửa được'}
          </p>
        )}
        <Field label="Loại nghỉ" id="lv-type">
          <Select id="lv-type" label="Loại nghỉ" value={leaveType} onChange={setLeaveType} options={LEAVE_TYPES} disabled={!editable} />
        </Field>
        <Field label="Thời lượng" id="lv-duration">
          <Select id="lv-duration" label="Thời lượng" value={durationType} onChange={setDurationType} options={DURATIONS} disabled={!editable} />
        </Field>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <Field label="Từ ngày" id="lv-from">
            <input
              id="lv-from"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              disabled={!editable}
              className={INPUT}
            />
          </Field>
          <Field label="Đến ngày" id="lv-to">
            <input
              id="lv-to"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              disabled={!editable}
              className={INPUT}
            />
          </Field>
        </div>
        <Field label="Lý do" id="lv-reason">
          <input id="lv-reason" value={reason} onChange={(e) => setReason(e.target.value)} required disabled={!editable} className={INPUT} />
        </Field>
        {r?.attachmentPath && (
          <a
            href={getFileUrl(r.attachmentPath)}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-rm-tap items-center gap-2 text-sm text-rm-primary"
          >
            <Paperclip size={16} className="flex-none" aria-hidden="true" />
            <span className="min-w-0 truncate">Xem tệp đính kèm</span>
          </a>
        )}
        {editable && (
          <div>
            <label htmlFor="lv-file" className="flex min-h-rm-tap cursor-pointer items-center gap-2 text-sm text-rm-primary">
              <Paperclip size={16} className="flex-none" aria-hidden="true" />
              <span className="min-w-0 truncate">{file ? file.name : r?.attachmentPath ? 'Thay tệp đính kèm' : 'Đính kèm giấy tờ (nếu có)'}</span>
            </label>
            <input id="lv-file" type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
        )}
        {editable && (
          <button type="submit" disabled={save.isPending || !reason.trim() || endDate < startDate} className={BTN_PRIMARY}>
            {save.isPending ? 'Đang lưu…' : r ? 'Lưu' : 'Gửi đơn'}
          </button>
        )}
      </form>

      {r?._can?.review && r.status === 'pending' && (
        <div className="flex flex-col gap-3 border-t border-rm-line p-rm-gutter">
          <Field label="Ghi chú duyệt" id="lv-note">
            <input id="lv-note" value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} className={INPUT} />
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

      {r?._can?.delete && (
        <div className="border-t border-rm-line p-rm-gutter">
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => window.confirm('Hủy đơn nghỉ này? Không thể hoàn tác.') && remove.mutate()}
            className={`${BTN_DANGER} w-full`}
          >
            Hủy đơn nghỉ
          </button>
        </div>
      )}
    </Sheet>
  );
}
