import type { ProjectStatus } from '@/types';
import type { BadgeProps } from '@/components';

export const PROJECT_STATUS_MAP: Record<
  ProjectStatus,
  { label: string; variant: NonNullable<BadgeProps['variant']> }
> = {
  draft: { label: 'Dự thảo', variant: 'default' },
  surveying: { label: 'Đang khảo sát', variant: 'info' },
  designing: { label: 'Thiết kế bóc tách', variant: 'info' },
  quotation: { label: 'Lập báo giá', variant: 'warning' },
  contract: { label: 'Đã ký hợp đồng', variant: 'primary' },
  producing: { label: 'Đang sản xuất', variant: 'primary' },
  installing: { label: 'Đang lắp đặt', variant: 'warning' },
  completed: { label: 'Hoàn thành', variant: 'success' },
  cancelled: { label: 'Đã hủy', variant: 'danger' },
};

export const PROJECT_STATUS_OPTIONS: { label: string; value: ProjectStatus }[] = [
  { label: 'Đang khảo sát', value: 'surveying' },
  { label: 'Thiết kế bóc tách', value: 'designing' },
  { label: 'Lập báo giá', value: 'quotation' },
  { label: 'Đã ký hợp đồng', value: 'contract' },
  { label: 'Đang sản xuất', value: 'producing' },
  { label: 'Đang lắp đặt', value: 'installing' },
  { label: 'Hoàn thành', value: 'completed' },
  { label: 'Đã hủy', value: 'cancelled' },
  { label: 'Dự thảo', value: 'draft' },
];

export const DOOR_STATUS_MAP: Record<
  string,
  { label: string; variant: NonNullable<BadgeProps['variant']> }
> = {
  draft: { label: 'Bản vẽ sơ bộ', variant: 'default' },
  surveyed: { label: 'Đã đo ô chờ', variant: 'info' },
  designed: { label: 'Đã bóc tách', variant: 'info' },
  approved: { label: 'Đã duyệt mẫu', variant: 'primary' },
  producing: { label: 'Đang gia công', variant: 'warning' },
  factory_done: { label: 'KCS xuất xưởng', variant: 'primary' },
  delivered: { label: 'Đã giao công trình', variant: 'info' },
  installed: { label: 'Đã lắp đặt xong', variant: 'warning' },
  completed: { label: 'Hoàn thành', variant: 'success' },
  accepted: { label: 'Đã nghiệm thu', variant: 'success' },
  cancelled: { label: 'Đã hủy', variant: 'danger' },
};

