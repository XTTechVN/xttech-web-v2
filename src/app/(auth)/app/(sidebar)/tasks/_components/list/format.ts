import type { TagTone } from '@/components-remake';
import { TASK_CATEGORY_MAP, TASK_DEADLINE_STATE_MAP, TASK_PRIORITY_MAP, TASK_SOURCE_TYPE_MAP, TASK_STATUS_MAP } from '@/config';
import type { StaffTask, StaffTaskDeadlineState, StaffTaskPriority } from '@/types';
import queryClient from '@/utils/query';

const DEADLINE_TONE: Record<StaffTaskDeadlineState, TagTone> = {
  overdue: 'red',
  due_soon: 'amber',
  on_track: 'blue',
  completed_on_time: 'green',
  completed_late: 'amber',
  cancelled: 'slate',
};

const PRIORITY_TONE: Record<StaffTaskPriority, TagTone> = { low: 'slate', medium: 'blue', high: 'amber', urgent: 'red' };

export const isOpenTask = (t: StaffTask) => t.status === 'pending' || t.status === 'in_progress';

export const deadlineOf = (t: StaffTask) => {
  const state = TASK_DEADLINE_STATE_MAP[t.deadlineState] ? t.deadlineState : 'on_track';
  return { label: TASK_DEADLINE_STATE_MAP[state].label, tone: DEADLINE_TONE[state] };
};

export const priorityOf = (t: StaffTask) => ({ label: TASK_PRIORITY_MAP[t.priority]?.label ?? '', tone: PRIORITY_TONE[t.priority] ?? 'slate' });

/** Chỉ nhắc mức ưu tiên khi cao hoặc khẩn; mức thường không cần nhãn */
export const isUrgent = (t: StaffTask) => t.priority === 'high' || t.priority === 'urgent';

export const statusLabel = (t: StaffTask) => TASK_STATUS_MAP[t.status]?.label ?? t.status;
export const categoryLabel = (t: StaffTask) => TASK_CATEGORY_MAP[t.category] || t.category;
export const sourceLabel = (t: StaffTask) => TASK_SOURCE_TYPE_MAP[t.sourceType] || t.sourceType;

const pad = (n: number) => String(n).padStart(2, '0');

/** Giá trị cho DateTimeField (YYYY-MM-DDTHH:MM, giờ máy) */
export const toInputValue = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

export type DuePreset = 'today_1730' | 'today_2359' | 'tomorrow_1730' | 'tomorrow_2359';

export const DUE_PRESETS: { key: DuePreset; label: string }[] = [
  { key: 'today_1730', label: '17:30 hôm nay' },
  { key: 'today_2359', label: '23:59 hôm nay' },
  { key: 'tomorrow_1730', label: '17:30 ngày mai' },
  { key: 'tomorrow_2359', label: '23:59 ngày mai' },
];

export function presetValue(key: DuePreset): string {
  const d = new Date();
  if (key.startsWith('tomorrow')) d.setDate(d.getDate() + 1);
  if (key.endsWith('1730')) d.setHours(17, 30, 0, 0);
  else d.setHours(23, 59, 0, 0);
  return toInputValue(d);
}

export function fmtDateTime(iso?: string | null): string {
  if (!iso) return '–';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '–';
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

const span = (minutes: number) => {
  if (minutes < 60) return `${minutes} phút`;
  const h = Math.floor(minutes / 60);
  if (h < 24) return `${h} giờ`;
  return `${Math.floor(h / 24)} ngày`;
};

export const lateText = (minutes: number) => (minutes > 0 ? `Trễ ${span(minutes)}` : '');

/** "Còn 3 giờ" / "Quá hạn 2 ngày" cho việc đang mở */
export function remaining(dueAt: string): string {
  const diff = Math.round((new Date(dueAt).getTime() - Date.now()) / 60000);
  if (Number.isNaN(diff)) return '';
  return diff < 0 ? `Quá hạn ${span(-diff)}` : `Còn ${span(diff)}`;
}

export const initials = (name?: string | null) => {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'NV';
  return (parts.length === 1 ? parts[0].slice(0, 2) : `${parts[0][0]}${parts[parts.length - 1][0]}`).toUpperCase();
};

/** Làm mới danh sách, thống kê và các màn bảo hành liên quan sau mỗi thay đổi */
export const refreshTasks = () =>
  ['staff-tasks', 'staff-tasks-summary', 'global_warranty_queue', 'global_warranty_badge', 'project_warranty'].forEach((k) =>
    queryClient.invalidateQueries({ queryKey: [k] }),
  );
