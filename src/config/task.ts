import type {
  StaffTaskCategory,
  StaffTaskDeadlineState,
  StaffTaskPriority,
  StaffTaskSourceType,
  StaffTaskStatus,
} from '@/types';
import type { BadgeProps } from '@/components';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

export const TASK_STATUS_MAP: Record<
  StaffTaskStatus,
  { label: string; variant: BadgeVariant }
> = {
  pending: { label: 'Chờ thực hiện', variant: 'default' },
  in_progress: { label: 'Đang thực hiện', variant: 'info' },
  completed: { label: 'Đã hoàn thành', variant: 'success' },
  cancelled: { label: 'Đã hủy', variant: 'default' },
};

export const TASK_STATUS_OPTIONS: { value: StaffTaskStatus; label: string }[] = [
  { value: 'pending', label: 'Chờ thực hiện' },
  { value: 'in_progress', label: 'Đang thực hiện' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export const TASK_DEADLINE_STATE_MAP: Record<
  StaffTaskDeadlineState,
  { label: string; variant: BadgeVariant }
> = {
  overdue: { label: 'Quá hạn', variant: 'danger' },
  due_soon: { label: 'Sắp hết hạn', variant: 'warning' },
  on_track: { label: 'Trong hạn', variant: 'primary' },
  completed_on_time: { label: 'Hoàn thành đúng hạn', variant: 'success' },
  completed_late: { label: 'Hoàn thành muộn', variant: 'warning' },
  cancelled: { label: 'Đã hủy', variant: 'default' },
};

export const TASK_DEADLINE_STATE_OPTIONS: { value: StaffTaskDeadlineState; label: string }[] = [
  { value: 'overdue', label: 'Quá hạn' },
  { value: 'due_soon', label: 'Sắp hết hạn (24h)' },
  { value: 'on_track', label: 'Trong hạn' },
  { value: 'completed_on_time', label: 'Hoàn thành đúng hạn' },
  { value: 'completed_late', label: 'Hoàn thành muộn' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export const TASK_PRIORITY_MAP: Record<
  StaffTaskPriority,
  { label: string; variant: BadgeVariant }
> = {
  low: { label: 'Thấp', variant: 'default' },
  medium: { label: 'Trung bình', variant: 'info' },
  high: { label: 'Cao', variant: 'warning' },
  urgent: { label: 'Khẩn cấp', variant: 'danger' },
};

export const TASK_PRIORITY_OPTIONS: { value: StaffTaskPriority; label: string }[] = [
  { value: 'low', label: 'Thấp' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'high', label: 'Cao' },
  { value: 'urgent', label: 'Khẩn cấp' },
];

export const TASK_CATEGORY_MAP: Record<StaffTaskCategory, string> = {
  general: 'Công việc đột xuất',
  warranty: 'Bảo hành / Bảo trì cửa',
  project_site: 'Công trình / Lắp đặt',
  warehouse_production: 'Kho & Sản xuất',
  administrative: 'Hành chính / Nội bộ',
};

export const TASK_CATEGORY_OPTIONS: { value: StaffTaskCategory; label: string }[] = [
  { value: 'general', label: 'Công việc đột xuất' },
  { value: 'warranty', label: 'Bảo hành / Bảo trì cửa' },
  { value: 'project_site', label: 'Công trình / Lắp đặt' },
  { value: 'warehouse_production', label: 'Kho & Sản xuất' },
  { value: 'administrative', label: 'Hành chính / Nội bộ' },
];

export const TASK_SOURCE_TYPE_MAP: Record<StaffTaskSourceType, string> = {
  manual: 'Giao trực tiếp',
  warranty: 'Từ lịch Bảo hành',
};

export const TASK_SOURCE_TYPE_OPTIONS: { value: StaffTaskSourceType; label: string }[] = [
  { value: 'manual', label: 'Giao trực tiếp' },
  { value: 'warranty', label: 'Từ lịch Bảo hành' },
];

