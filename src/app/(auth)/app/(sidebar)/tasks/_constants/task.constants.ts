import type { StaffTaskDeadlineState, StaffTaskScope } from '@/types';

export interface TaskScopeTabItem {
  id: StaffTaskScope;
  label: string;
  description: string;
}

export const TASK_SCOPE_TABS: TaskScopeTabItem[] = [
  {
    id: 'all',
    label: 'Quản lý giao việc nhân sự',
    description: 'Theo dõi tiến độ toàn công ty, giao việc và kiểm soát hạn định',
  },
  {
    id: 'mine',
    label: 'Việc của tôi',
    description: 'Danh sách công việc và lịch bảo hành được phân công cho bạn',
  },
];

export type QuickDeadlineFilter =
  | 'all'
  | 'open'
  | 'due_soon'
  | 'overdue'
  | 'completed_on_time'
  | 'completed_late';

export interface QuickDeadlineTabItem {
  id: QuickDeadlineFilter;
  label: string;
  deadlineState?: StaffTaskDeadlineState;
  openOnly?: boolean;
}

export const QUICK_DEADLINE_TABS: QuickDeadlineTabItem[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'open', label: 'Đang cần làm', openOnly: true },
  { id: 'overdue', label: 'Quá hạn', deadlineState: 'overdue' },
  { id: 'due_soon', label: 'Sắp hết hạn (24h)', deadlineState: 'due_soon' },
  { id: 'completed_on_time', label: 'Hoàn thành đúng hạn', deadlineState: 'completed_on_time' },
  { id: 'completed_late', label: 'Hoàn thành muộn', deadlineState: 'completed_late' },
];

export type DuePresetKey = 'today_1730' | 'today_2359' | 'tomorrow_1730' | 'tomorrow_2359';

export interface DuePresetOption {
  key: DuePresetKey;
  label: string;
}

export const DUE_PRESET_OPTIONS: DuePresetOption[] = [
  { key: 'today_1730', label: '17:30 Hôm nay' },
  { key: 'today_2359', label: '23:59 Hôm nay' },
  { key: 'tomorrow_1730', label: '17:30 Ngày mai' },
  { key: 'tomorrow_2359', label: '23:59 Ngày mai' },
];

export function buildLocalDateTimeInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function getPresetDueDateTime(preset: DuePresetKey): string {
  const now = new Date();
  const target = new Date(now);
  if (preset === 'today_1730') {
    target.setHours(17, 30, 0, 0);
  } else if (preset === 'today_2359') {
    target.setHours(23, 59, 0, 0);
  } else if (preset === 'tomorrow_1730') {
    target.setDate(target.getDate() + 1);
    target.setHours(17, 30, 0, 0);
  } else if (preset === 'tomorrow_2359') {
    target.setDate(target.getDate() + 1);
    target.setHours(23, 59, 0, 0);
  }
  return buildLocalDateTimeInputValue(target);
}

export function formatDateTimeVi(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatLateDuration(lateMinutes: number): string {
  if (!lateMinutes || lateMinutes <= 0) return '';
  if (lateMinutes < 60) return `Trễ ${lateMinutes} phút`;
  const hours = Math.floor(lateMinutes / 60);
  const mins = lateMinutes % 60;
  if (hours < 24) {
    return mins > 0 ? `Trễ ${hours}h ${mins}p` : `Trễ ${hours} giờ`;
  }
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `Trễ ${days} ngày ${remHours}h` : `Trễ ${days} ngày`;
}

export function formatRemainingTime(dueAtIso: string): string {
  const due = new Date(dueAtIso).getTime();
  if (Number.isNaN(due)) return '';
  const diffMinutes = Math.round((due - Date.now()) / 60000);
  if (diffMinutes < 0) {
    return `Quá hạn ${formatLateDuration(Math.abs(diffMinutes)).replace('Trễ ', '')}`;
  }
  if (diffMinutes < 60) return `Còn ${diffMinutes} phút`;
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `Còn ${hours} giờ`;
  const days = Math.floor(hours / 24);
  return `Còn ${days} ngày`;
}

