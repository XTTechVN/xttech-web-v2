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
