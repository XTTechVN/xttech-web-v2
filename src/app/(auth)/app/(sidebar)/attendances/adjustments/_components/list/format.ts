import type { TagTone } from '@/components-remake';
import type { AttendanceAdjustmentRequest, UserResponse } from '@/types';

export const STATUSES: Record<string, { label: string; tone: TagTone }> = {
  pending: { label: 'Chờ duyệt', tone: 'amber' },
  approved: { label: 'Đã duyệt', tone: 'green' },
  rejected: { label: 'Từ chối', tone: 'red' },
};

export const statusOf = (s: string) => STATUSES[s] ?? { label: s, tone: 'slate' as TagTone };

export const TYPES = [
  { value: 'forgot_attendance', label: 'Quên chấm công' },
  { value: 'check_in', label: 'Bổ sung check-in' },
  { value: 'check_out', label: 'Bổ sung check-out' },
  { value: 'overtime', label: 'Tăng ca' },
];

// workDate dạng YYYY-MM-DD → DD/MM/YYYY (không qua Date để khỏi lệch múi giờ)
export const fmtDate = (d?: string | null) => (d ? d.slice(0, 10).split('-').reverse().join('/') : '–');

export const hhmm = (v?: string | null) => (v ? (v.includes('T') ? v.substring(11, 16) : v.substring(0, 5)) : '');

export const personName = (u?: Pick<UserResponse, 'fullName'> | null) => u?.fullName || 'Chưa cập nhật';

// Loại khiếu nại quyết định đề nghị sửa giờ vào, giờ ra hay cả hai
export const touchesIn = (t: string) => t !== 'check_out';
export const touchesOut = (t: string) => t !== 'check_in';

/** "07:30 → 08:00" cho từng mốc có đề nghị; rỗng thì "–" */
export function changeText(r: AttendanceAdjustmentRequest) {
  const part = (label: string, from?: string | null, to?: string | null) =>
    to ? `${label} ${hhmm(from) ? `${hhmm(from)} → ` : ''}${hhmm(to)}` : null;
  return [part('Vào', r.oldCheckIn, r.requestedCheckIn), part('Ra', r.oldCheckOut, r.requestedCheckOut)].filter(Boolean).join(' · ') || '–';
}
