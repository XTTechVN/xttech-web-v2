'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Paperclip, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createLeaveRequest, getUsers, getWorkShifts, updateLeaveRequest } from '@/actions';
import { Textarea } from '@/components';
import { DateTimeField, Select } from '@/components-remake';
import { useCan } from '@/hooks';
import { useAuthStore } from '@/stores';
import { DurationType, type LeaveRequest } from '@/types';
import { getFileUrl, showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { DURATIONS, LEAVE_TYPES, personName } from './format';

export const LEAVE_FORM_ID = 'leave-form';

const MAX_FILE = 20 * 1024 * 1024;
const FILE_RE = /\.(jpe?g|png|webp|pdf|docx?|xlsx?)$/i;
const DAY = 86_400_000;

interface WorkShift {
  id: number | string;
  name: string;
  startTime?: string;
  endTime?: string;
}

interface Props {
  /** Có = sửa; không có = tạo mới */
  initial?: LeaveRequest;
  onDone: () => void;
  onPendingChange: (pending: boolean) => void;
}

// Tạo hoặc sửa đơn nghỉ phép (khoảng 7 ô nên làm trong drawer đang mở, không mở thêm lớp)
export function LeaveForm({ initial, onDone, onPendingChange }: Props) {
  const { isWide, can } = useCan();
  const me = useAuthStore((s) => s.user);
  // Phạm vi dept/org được làm đơn hộ người khác
  const pickUser = isWide('leave_request:update');

  const [userId, setUserId] = useState(initial?.userId ?? (me?.id ? String(me.id) : ''));
  const [leaveType, setLeaveType] = useState<string>(initial?.leaveType ?? LEAVE_TYPES[0].value);
  const [duration, setDuration] = useState<string>(initial?.durationType ?? DurationType.FULL_DAY);
  const [shiftId, setShiftId] = useState(initial?.workShiftId ? String(initial.workShiftId) : '');
  const [start, setStart] = useState(initial?.startDate ?? '');
  const [end, setEnd] = useState(initial?.endDate ?? '');
  const [reason, setReason] = useState(initial?.reason ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [keepFile, setKeepFile] = useState(!!initial?.attachmentPath);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fullDay = duration === DurationType.FULL_DAY;
  const byShift = duration === DurationType.CUSTOM_SHIFT;
  const lastDay = fullDay ? end : start;

  const users = useQuery({ queryKey: ['users', 'leave-form'], queryFn: () => getUsers({ limit: 100 }), enabled: pickUser });
  const userOptions = (users.data?.items ?? []).map((u) => ({ value: String(u.id), label: personName(u) }));

  // Ca làm việc theo phòng ban của người làm đơn
  const target = pickUser ? users.data?.items.find((u) => String(u.id) === userId) : me;
  const first: unknown = target?.positions?.[0];
  const departmentId = typeof first === 'object' && first ? Number((first as { departmentId?: number }).departmentId) || undefined : undefined;
  const shifts = useQuery({
    queryKey: ['work-shifts', 'leave-form', departmentId],
    queryFn: () => getWorkShifts({ limit: 100, departmentId }),
    enabled: byShift && !!departmentId && can('work_shift:read'),
  });
  const shiftOptions = useMemo(
    () =>
      ((Array.isArray(shifts.data) ? shifts.data : (shifts.data?.items ?? [])) as WorkShift[]).map((s) => ({
        value: String(s.id),
        label: `${s.name} (${s.startTime ?? ''} - ${s.endTime ?? ''})`,
      })),
    [shifts.data],
  );

  const days = byShift ? null : fullDay ? (start && end ? Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / DAY) + 1) : 0) : 0.5;

  const touch = (k: string) => setErrors((e) => (e[k] ? { ...e, [k]: '' } : e));

  const save = useMutation({
    mutationFn: () => {
      const data = {
        userId: pickUser ? userId : undefined,
        leaveType,
        durationType: duration,
        workShiftId: byShift ? shiftId : null,
        startDate: start,
        endDate: lastDay,
        totalDays: days,
        reason: reason.trim(),
      };
      return initial ? updateLeaveRequest(String(initial.id), data, file) : createLeaveRequest({ ...data, userId: userId || undefined }, file);
    },
    onSuccess: () => {
      ['leave-requests', 'leave-requests-stats'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
      toast.success(initial ? 'Cập nhật đơn nghỉ phép thành công' : 'Gửi đơn nghỉ phép thành công');
      onDone();
    },
    onError: (e) => showErrorToast(e, initial ? 'Không thể cập nhật đơn nghỉ phép' : 'Không thể tạo đơn nghỉ phép'),
  });

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!FILE_RE.test(f.name)) return void toast.error('Chỉ nhận ảnh hoặc tài liệu PDF, Word, Excel');
    if (f.size > MAX_FILE) return void toast.error('Tệp tối đa 20MB');
    setFile(f);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (pickUser && !userId) next.userId = 'Vui lòng chọn nhân sự';
    if (!start) next.start = 'Vui lòng chọn ngày bắt đầu';
    if (fullDay && !end) next.end = 'Vui lòng chọn ngày kết thúc';
    if (fullDay && start && end && end < start) next.end = 'Ngày kết thúc không được trước ngày bắt đầu';
    if (byShift && !shiftId) next.shift = 'Vui lòng chọn ca làm việc';
    if (!reason.trim()) next.reason = 'Vui lòng nhập lý do nghỉ';
    setErrors(next);
    if (Object.keys(next).length) return;
    onPendingChange(true);
    save.mutate(undefined, { onSettled: () => onPendingChange(false) });
  };

  const error = (key: string) => errors[key] && <span className="mt-1.5 block text-xs text-red-500">{errors[key]}</span>;
  const attachment = file?.name ?? (keepFile && initial?.attachmentPath ? initial.attachmentPath.split('/').pop() : null);

  return (
    <form id={LEAVE_FORM_ID} onSubmit={submit} className="flex flex-col gap-4">
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
          {error('userId')}
        </div>
      )}
      <Select label="Loại nghỉ" value={leaveType} options={LEAVE_TYPES} onChange={setLeaveType} />
      <Select label="Thời lượng" value={duration} options={DURATIONS} onChange={setDuration} />
      {byShift && (
        <div>
          <Select
            label="Ca làm việc *"
            placeholder={departmentId ? 'Chọn ca' : 'Nhân sự chưa thuộc phòng ban'}
            value={shiftId}
            options={shiftOptions}
            loading={shifts.isLoading}
            onChange={(v) => {
              setShiftId(v);
              touch('shift');
            }}
          />
          {error('shift')}
        </div>
      )}
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
        <div className={fullDay ? undefined : 'col-span-2'}>
          <DateTimeField
            label={fullDay ? 'Từ ngày *' : 'Ngày nghỉ *'}
            value={start}
            max={fullDay && end ? end : undefined}
            onChange={(v) => {
              setStart(v);
              touch('start');
            }}
            error={errors.start}
          />
        </div>
        {fullDay && (
          <DateTimeField
            label="Đến ngày *"
            value={end}
            min={start || undefined}
            onChange={(v) => {
              setEnd(v);
              touch('end');
            }}
            error={errors.end}
          />
        )}
      </div>
      {days !== null && days > 0 && <p className="-mt-2 text-xs text-slate-500">Tổng {days} ngày nghỉ</p>}
      <Textarea
        label="Lý do *"
        placeholder="Nhập lý do nghỉ"
        rows={3}
        fullWidth
        value={reason}
        onChange={(e) => {
          setReason(e.target.value);
          touch('reason');
        }}
      />
      {error('reason')}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-slate-500">Tệp đính kèm</span>
        {attachment ? (
          <div className="flex min-h-11 items-center gap-2 rounded-control bg-slate-100 px-3 text-sm">
            <Paperclip size={16} className="flex-none text-slate-500" />
            <span className="min-w-0 flex-1 truncate">{attachment}</span>
            <button
              type="button"
              aria-label="Bỏ tệp đính kèm"
              onClick={() => {
                setFile(null);
                setKeepFile(false);
              }}
              className="flex size-11 flex-none cursor-pointer items-center justify-center text-slate-500 md:size-9"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-control border border-dashed border-slate-300 px-3 text-sm text-slate-500 active:bg-slate-50 md:hover:bg-slate-50">
            <Paperclip size={16} />
            Chọn ảnh hoặc tài liệu (tối đa 20MB)
            <input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="sr-only" onChange={pickFile} />
          </label>
        )}
        {initial?.attachmentPath && keepFile && !file && (
          <a href={getFileUrl(initial.attachmentPath)} target="_blank" rel="noreferrer" className="text-xs text-primary">
            Xem tệp hiện có
          </a>
        )}
      </div>
    </form>
  );
}
