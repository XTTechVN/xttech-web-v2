import { getAttendanceStatusVariant, type Attendance } from '@/types';
import type { TagTone } from '@/components-remake';

// workDate dạng YYYY-MM-DD → DD/MM/YYYY (không qua Date để khỏi lệch múi giờ)
export const fmtDate = (d?: string | null) => (d ? d.slice(0, 10).split('-').reverse().join('/') : '–');

export const hhmm = (v?: string | null) => {
  if (!v) return '--:--';
  return v.includes('T') ? v.substring(11, 16) : v.substring(0, 5);
};

const TONE: Record<string, TagTone> = { success: 'green', warning: 'amber', danger: 'red', info: 'blue', primary: 'blue' };

export const statusTone = (status: string | null | undefined): TagTone => TONE[getAttendanceStatusVariant(status)] ?? 'slate';

export const personName = (a: Attendance) => a.user?.fullName || a.user?.username || 'Chưa cập nhật';
