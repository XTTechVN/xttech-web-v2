export type WorkShiftBadgeVariant = 'primary' | 'warning' | 'info' | 'success' | 'default';

export const DAYS_OF_WEEK_OPTIONS = [
  { value: '2', label: 'T2' },
  { value: '3', label: 'T3' },
  { value: '4', label: 'T4' },
  { value: '5', label: 'T5' },
  { value: '6', label: 'T6' },
  { value: '7', label: 'T7' },
  { value: '8', label: 'CN' },
] as const;

export const DAY_LABEL_MAP: Record<string, string> = {
  '2': 'T2',
  '3': 'T3',
  '4': 'T4',
  '5': 'T5',
  '6': 'T6',
  '7': 'T7',
  '8': 'CN',
};

export const SHIFT_TYPE_OPTIONS = [
  { value: 'morning', label: 'Ca sáng' },
  { value: 'afternoon', label: 'Ca chiều' },
  { value: 'full_day', label: 'Cả ngày (Hành chính)' },
  { value: 'night', label: 'Ca đêm' },
];

export const SHIFT_TYPE_BADGE_MAP: Record<
  string,
  { label: string; variant: WorkShiftBadgeVariant }
> = {
  morning: { label: 'Ca sáng', variant: 'warning' },
  afternoon: { label: 'Ca chiều', variant: 'info' },
  full_day: { label: 'Hành chính', variant: 'primary' },
  night: { label: 'Ca đêm', variant: 'default' },
};

export const WORK_SHIFT_STATUS_MAP: Record<
  string,
  { label: string; variant: WorkShiftBadgeVariant }
> = {
  active: { label: 'Hoạt động', variant: 'success' },
  inactive: { label: 'Tạm dừng', variant: 'default' },
};
