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

// Thứ tự đầy đủ các trạng thái chuẩn của bộ cửa (khớp progress_rules ở backend)
export const FULL_STATUS_ORDER: ProgressStepCode[] = [
  'draft',
  'awaiting_measure',
  'surveyed',
  'producing',
  'factory_done',
  'delivering',
  'delivered',
  'installing',
  'installed',
  'accepted',
];

export const DISPLAY_STEPS_ORDER: ProgressStepCode[] = [
  'producing',
  'factory_done',
  'delivering',
  'delivered',
  'installing',
  'installed',
  'accepted',
  'surveyed',
  'awaiting_measure',
  'draft',
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
  delivering: {
    label: 'Đang vận chuyển đến công trình',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  delivered: {
    label: 'Đã vận chuyển - Chờ lắp đặt',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  installing: {
    label: 'Đang lắp đặt',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
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
  awaiting_measure: {
    label: 'Chờ đo thực tế',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  draft: {
    label: 'Đang thiết kế',
    badgeClass: 'bg-slate-50 text-slate-500 border-slate-200',
  },
};

export const PROGRESS_STEP_LABEL: Record<ProgressStepCode, string> = {
  draft: 'Đang thiết kế',
  awaiting_measure: 'Chờ đo thực tế',
  surveyed: 'Chờ sản xuất',
  producing: 'Đang sản xuất',
  factory_done: 'Sản xuất xong',
  delivering: 'Đang vận chuyển',
  delivered: 'Đã giao công trình',
  installing: 'Đang lắp đặt',
  installed: 'Lắp đặt xong',
  accepted: 'Đã nghiệm thu',
};

export const PROGRESS_ACTION_LABEL: Record<ProgressStepCode, string> = {
  draft: 'Đang thiết kế',
  awaiting_measure: 'Chờ đo',
  surveyed: 'Đã đo',
  producing: 'Bắt đầu sản xuất',
  factory_done: 'Báo sản xuất xong',
  delivering: 'Xuất xưởng vận chuyển',
  delivered: 'Báo đã giao',
  installing: 'Bắt đầu lắp đặt',
  installed: 'Báo đã lắp xong',
  accepted: 'Nghiệm thu',
};

export const PROGRESS_COLUMN_LABEL: Record<ProgressStepCode, string> = {
  draft: 'Thiết kế',
  awaiting_measure: 'Chờ đo',
  surveyed: 'Đo đạc',
  producing: 'Sản xuất',
  factory_done: 'Xong xưởng',
  delivering: 'Vận chuyển',
  delivered: 'Giao hàng',
  installing: 'Đang lắp',
  installed: 'Lắp đặt',
  accepted: 'Nghiệm thu',
};

const isProgressStep = (status: string): status is ProgressStepCode =>
  PROGRESS_STEP_ORDER.includes(status as ProgressStepCode);

export const getStepIndex = (status: string): number =>
  isProgressStep(status) ? PROGRESS_STEP_ORDER.indexOf(status) : -1;

// Mốc kế tiếp thao tác được từ giao diện tiến độ hằng ngày.
// Bỏ qua mốc tùy chọn (đang vận chuyển / đang lắp đặt). 'installed' -> nghiệm thu phải lập biên bản
// 2 bên ký (tab Nghiệm thu), 'surveyed' -> sản xuất do lệnh sản xuất tạo, nên không có mốc kế tiếp ở đây.
const NEXT_STEP_BY_STATUS: Partial<Record<ProgressStepCode, ProgressStepCode>> = {
  producing: 'factory_done',
  factory_done: 'delivered',
  delivering: 'delivered',
  delivered: 'installed',
  installing: 'installed',
};

export const getNextStep = (status: string): ProgressStepCode | null =>
  NEXT_STEP_BY_STATUS[status as ProgressStepCode] ?? null;

export const formatProductionDate = (value?: string | null): string =>
  value ? new Date(value).toLocaleDateString('vi-VN') : '—';

