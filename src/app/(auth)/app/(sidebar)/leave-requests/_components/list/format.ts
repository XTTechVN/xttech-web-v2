import { DurationType, LeaveRequestStatus, LeaveType, type LeaveRequest, type User } from '@/types';
import type { TagTone } from '@/components-remake';

export const LEAVE_TYPES = [
  { value: LeaveType.ANNUAL, label: 'Nghỉ phép năm' },
  { value: LeaveType.UNPAID, label: 'Nghỉ không lương' },
  { value: LeaveType.SICK, label: 'Nghỉ ốm đau' },
  { value: LeaveType.MATERNITY, label: 'Nghỉ thai sản' },
  { value: LeaveType.WEDDING, label: 'Nghỉ kết hôn' },
  { value: LeaveType.BEREAVEMENT, label: 'Nghỉ tang chế' },
  { value: LeaveType.OTHER, label: 'Nghỉ khác' },
];

export const DURATIONS = [
  { value: DurationType.FULL_DAY, label: 'Cả ngày' },
  { value: DurationType.MORNING, label: 'Nửa ngày sáng' },
  { value: DurationType.AFTERNOON, label: 'Nửa ngày chiều' },
  { value: DurationType.CUSTOM_SHIFT, label: 'Theo ca cụ thể' },
];

export const STATUSES: Record<string, { label: string; tone: TagTone }> = {
  [LeaveRequestStatus.PENDING]: { label: 'Chờ duyệt', tone: 'amber' },
  [LeaveRequestStatus.APPROVED]: { label: 'Đã duyệt', tone: 'green' },
  [LeaveRequestStatus.REJECTED]: { label: 'Từ chối', tone: 'red' },
  [LeaveRequestStatus.CANCELLED]: { label: 'Đã hủy', tone: 'slate' },
};

export const statusOf = (s: string) => STATUSES[s] ?? { label: s, tone: 'slate' as TagTone };
export const labelOf = (list: { value: string; label: string }[], v: string) => list.find((o) => o.value === v)?.label ?? v;

// YYYY-MM-DD (hoặc ISO) → DD/MM/YYYY, không qua Date để khỏi lệch múi giờ
export const fmtDate = (d?: string | null) => (d ? d.slice(0, 10).split('-').reverse().join('/') : '–');
export const fmtRange = (r: Pick<LeaveRequest, 'startDate' | 'endDate'>) =>
  r.startDate === r.endDate ? fmtDate(r.startDate) : `${fmtDate(r.startDate)} → ${fmtDate(r.endDate)}`;

export const personName = (u?: Pick<User, 'fullName' | 'username'> | null) => u?.fullName || u?.username || 'Chưa cập nhật';

/** "2 ngày" hoặc tên ca khi nghỉ theo ca */
export const daysText = (r: LeaveRequest, shiftName: (id: string | null) => string) =>
  r.durationType === DurationType.CUSTOM_SHIFT ? shiftName(r.workShiftId) : r.totalDays != null ? `${r.totalDays} ngày` : '–';

export const isPending = (r: LeaveRequest) => r.status === LeaveRequestStatus.PENDING;
