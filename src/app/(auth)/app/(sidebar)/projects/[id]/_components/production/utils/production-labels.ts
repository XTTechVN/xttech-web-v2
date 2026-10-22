import type { ProductionOrder, ProgressStepCode } from '@/types';
import type { BadgeVariant, StepSectionConfig } from '../types';

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

export const DOOR_TYPE_LABEL: Record<string, string> = {
  door: 'Cửa đi',
  window: 'Cửa sổ',
};

export const PROGRESS_STEP_ORDER: ProgressStepCode[] = [
  'surveyed',
  'producing',
  'factory_done',
  'delivered',
  'installed',
  'accepted',
];

export const DISPLAY_STEPS_ORDER: ProgressStepCode[] = [
  'producing',
  'factory_done',
  'delivered',
  'installed',
  'accepted',
  'surveyed',
];

export const STEP_SECTION_CONFIG: Record<string, StepSectionConfig> = {
  producing: {
    label: 'Đang sản xuất',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  factory_done: {
    label: 'Hoàn thành xưởng - Chờ vận chuyển',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  delivered: {
    label: 'Đã vận chuyển - Chờ lắp đặt',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  installed: {
    label: 'Đã lắp đặt - Chờ nghiệm thu',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  accepted: {
    label: 'Đã nghiệm thu ',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  surveyed: {
    label: 'Chờ sản xuất / Đã đo',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  draft: {
    label: 'Bản vẽ nháp',
    badgeClass: 'bg-slate-50 text-slate-500 border-slate-200',
  },
};

export const PROGRESS_STEP_LABEL: Record<ProgressStepCode, string> = {
  surveyed: 'Đã đo',
  producing: 'Đang sản xuất',
  factory_done: 'Xong xưởng',
  delivered: 'Đã vận chuyển',
  installed: 'Đã lắp đặt',
  accepted: 'Đã nghiệm thu',
};

export const PROGRESS_ACTION_LABEL: Record<ProgressStepCode, string> = {
  surveyed: 'Đã đo',
  producing: 'Bắt đầu sản xuất',
  factory_done: 'Xong xưởng',
  delivered: 'Đã vận chuyển',
  installed: 'Đã lắp đặt',
  accepted: 'Nghiệm thu',
};

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

export const getNextStep = (status: string): ProgressStepCode | null => {
  const index = getStepIndex(status);
  const isTickable =
    index >= PROGRESS_STEP_ORDER.indexOf('producing') && index < PROGRESS_STEP_ORDER.length - 1;
  return isTickable ? PROGRESS_STEP_ORDER[index + 1] : null;
};

export const formatProductionDate = (value?: string | null): string =>
  value ? new Date(value).toLocaleDateString('vi-VN') : '—';

