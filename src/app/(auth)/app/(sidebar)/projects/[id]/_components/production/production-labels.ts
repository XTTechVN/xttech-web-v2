import type { ProductionOrder, ProgressStepCode } from '@/types';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export const ORDER_STATUS_LABEL: Record<ProductionOrder['status'], string> = {
  pending: 'Chờ xưởng',
  in_progress: 'Đang gia công',
  completed: 'Hoàn tất KCS',
  cancelled: 'Đã hủy',
};

export const ORDER_STATUS_VARIANT: Record<ProductionOrder['status'], BadgeVariant> = {
  pending: 'default',
  in_progress: 'primary',
  completed: 'success',
  cancelled: 'danger',
};

export const PROGRESS_STEP_ORDER: ProgressStepCode[] = [
  'surveyed',
  'producing',
  'factory_done',
  'delivered',
  'installed',
  'accepted',
];

export const PROGRESS_STEP_LABEL: Record<ProgressStepCode, string> = {
  surveyed: 'Đã đo',
  producing: 'Đang sản xuất',
  factory_done: 'Xong xưởng',
  delivered: 'Đã vận chuyển',
  installed: 'Đã lắp đặt',
  accepted: 'Đã nghiệm thu',
};

// Nhãn hành động khi chuyển cửa sang mốc đích
export const PROGRESS_ACTION_LABEL: Record<ProgressStepCode, string> = {
  surveyed: 'Đã đo',
  producing: 'Bắt đầu sản xuất',
  factory_done: 'Xong xưởng',
  delivered: 'Đã vận chuyển',
  installed: 'Đã lắp đặt',
  accepted: 'Nghiệm thu',
};

// Tiêu đề cột bảng tiến độ hằng ngày
export const PROGRESS_COLUMN_LABEL: Record<ProgressStepCode, string> = {
  surveyed: 'Đo đạc',
  producing: 'Sản xuất',
  factory_done: 'Xong xưởng',
  delivered: 'Vận chuyển',
  installed: 'Lắp đặt',
  accepted: 'Nghiệm thu',
};

const isProgressStep = (status: string): status is ProgressStepCode =>
  PROGRESS_STEP_ORDER.includes(status as ProgressStepCode);

export const getStepIndex = (status: string): number =>
  isProgressStep(status) ? PROGRESS_STEP_ORDER.indexOf(status) : -1;

// Mốc kế tiếp có thể tích hằng ngày: chỉ từ "đang sản xuất" đến "đã lắp đặt"
export const getNextStep = (status: string): ProgressStepCode | null => {
  const index = getStepIndex(status);
  const isTickable = index >= PROGRESS_STEP_ORDER.indexOf('producing') && index < PROGRESS_STEP_ORDER.length - 1;
  return isTickable ? PROGRESS_STEP_ORDER[index + 1] : null;
};
