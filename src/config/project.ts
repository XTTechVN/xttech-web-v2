import type {
  ProjectStatus,
  WarrantyIssueTag,
  WarrantyState,
  WarrantyVisitStatus,
} from '@/types';
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
  draft: { label: 'Đang thiết kế', variant: 'default' },
  awaiting_measure: { label: 'Chờ đo thực tế', variant: 'warning' },
  surveyed: { label: 'Chờ sản xuất', variant: 'info' },
  designed: { label: 'Đã bóc tách', variant: 'info' },
  approved: { label: 'Đã duyệt mẫu', variant: 'primary' },
  producing: { label: 'Đang sản xuất', variant: 'warning' },
  factory_done: { label: 'Đã sản xuất - chờ lắp đặt', variant: 'primary' },
  installed: { label: 'Đã lắp đặt', variant: 'warning' },
  completed: { label: 'Hoàn thành', variant: 'success' },
  accepted: { label: 'Đã nghiệm thu', variant: 'success' },
  cancelled: { label: 'Đã hủy', variant: 'danger' },
};

export const WARRANTY_STATE_MAP: Record<
  WarrantyState,
  { label: string; variant: NonNullable<BadgeProps['variant']> }
> = {
  not_started: { label: 'Chưa bắt đầu (chờ hoàn thành dự án)', variant: 'default' },
  active: { label: 'Đang trong hạn bảo hành', variant: 'success' },
  expired: { label: 'Đã hết hạn bảo hành', variant: 'danger' },
};

export const WARRANTY_VISIT_STATUS_MAP: Record<
  WarrantyVisitStatus,
  { label: string; variant: NonNullable<BadgeProps['variant']> }
> = {
  scheduled: { label: 'Đã tiếp nhận / Lên lịch', variant: 'info' },
  in_progress: { label: 'Đang kiểm tra & xử lý', variant: 'warning' },
  done: { label: 'Đã hoàn thành', variant: 'success' },
  cancelled: { label: 'Đã hủy', variant: 'danger' },
};

export const WARRANTY_ISSUE_TAG_MAP: Record<WarrantyIssueTag, string> = {
  lock_jam: 'Kẹt khóa / tay nắm',
  sash_sag: 'Xệ cánh / cọ khung',
  water_leak: 'Ngấm nước / hở khe',
  glass_crack: 'Nứt vỡ kính',
  seal_peel: 'Bong gioăng / keo',
  other: 'Vấn đề khác',
};

export const WARRANTY_ISSUE_TAG_OPTIONS: { value: WarrantyIssueTag; label: string }[] = [
  { value: 'lock_jam', label: 'Kẹt khóa / tay nắm' },
  { value: 'sash_sag', label: 'Xệ cánh / cọ khung' },
  { value: 'water_leak', label: 'Ngấm nước / hở khe' },
  { value: 'glass_crack', label: 'Nứt vỡ kính' },
  { value: 'seal_peel', label: 'Bong gioăng / keo' },
  { value: 'other', label: 'Vấn đề khác' },
];

const STAGE_SHORT_LABELS: Record<string, { label: string; shortLabel: string; order: number }> = {
  draft: { label: 'Đang thiết kế', shortLabel: 'Thiết kế', order: 1 },
  surveying: { label: 'Đang khảo sát', shortLabel: 'Khảo sát', order: 2 },
  awaiting_measure: { label: 'Chờ đo thực tế', shortLabel: 'Chờ đo', order: 2 },
  waiting_measurement: { label: 'Chờ đo thực tế', shortLabel: 'Chờ đo', order: 2 },
  designing: { label: 'Thiết kế bóc tách', shortLabel: 'Thiết kế', order: 3 },
  designed: { label: 'Đã bóc tách', shortLabel: 'Bóc tách', order: 3 },
  quotation: { label: 'Lập báo giá', shortLabel: 'Báo giá', order: 4 },
  approved: { label: 'Đã duyệt mẫu', shortLabel: 'Duyệt mẫu', order: 4 },
  contract: { label: 'Đã ký hợp đồng', shortLabel: 'Hợp đồng', order: 5 },
  surveyed: { label: 'Chờ sản xuất', shortLabel: 'Chờ SX', order: 5 },
  waiting_production: { label: 'Chờ sản xuất', shortLabel: 'Chờ SX', order: 6 },
  producing: { label: 'Đang sản xuất', shortLabel: 'Đang SX', order: 7 },
  produced: { label: 'Đã sản xuất', shortLabel: 'Đã SX', order: 8 },
  factory_done: { label: 'Đã sản xuất - chờ lắp đặt', shortLabel: 'Chờ lắp', order: 8 },
  produced_waiting_install: { label: 'Đã sản xuất - chờ lắp đặt', shortLabel: 'Chờ lắp', order: 8 },
  installing: { label: 'Đang lắp đặt', shortLabel: 'Lắp đặt', order: 9 },
  installed: { label: 'Đã lắp đặt', shortLabel: 'Đã lắp', order: 9 },
  handover: { label: 'Bàn giao', shortLabel: 'Bàn giao', order: 10 },
  completed: { label: 'Hoàn thành', shortLabel: 'Hoàn thành', order: 11 },
  accepted: { label: 'Đã nghiệm thu', shortLabel: 'Nghiệm thu', order: 12 },
  paused: { label: 'Tạm dừng', shortLabel: 'Tạm dừng', order: 98 },
  cancelled: { label: 'Đã hủy', shortLabel: 'Đã hủy', order: 99 },
};

export const getDoorStageLabel = (
  code: string
): { label: string; shortLabel: string; order: number } => {
  const lower = code.toLowerCase();
  const mapped = DOOR_STATUS_MAP[code]?.label ?? DOOR_STATUS_MAP[lower]?.label;
  const fallback = STAGE_SHORT_LABELS[lower];
  return {
    label: mapped ?? fallback?.label ?? code,
    shortLabel: fallback?.shortLabel ?? mapped ?? code,
    order: fallback?.order ?? 50,
  };
};

export const getProjectStageLabel = (
  status: string
): { label: string; shortLabel: string; order: number } => {
  const lower = status.toLowerCase() as ProjectStatus;
  const mapped = PROJECT_STATUS_MAP[status as ProjectStatus]?.label ?? PROJECT_STATUS_MAP[lower]?.label;
  const fallback = STAGE_SHORT_LABELS[lower];
  return {
    label: mapped ?? fallback?.label ?? status,
    shortLabel: fallback?.shortLabel ?? mapped ?? status,
    order: fallback?.order ?? 50,
  };
};

export const CORNER_JOINT_POSITION_MAP: Record<string, string> = {
  frame: 'Khung bao',
  sash: 'Cánh cửa',
  safety_frame: 'Khung bảo vệ',
};

export const CORNER_JOINT_TYPE_MAP: Record<
  string,
  { label: string; methodLabel: string; badgeClass: string }
> = {
  crimped: {
    label: 'Ke ép góc',
    methodLabel: 'Dập bấm góc',
    badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200/60',
  },
  permanent_screw: {
    label: 'Ke vĩnh cửu',
    methodLabel: 'Bắt vít lục giác',
    badgeClass: 'bg-purple-50 text-purple-700 border border-purple-200/60',
  },
  spring_clip: {
    label: 'Ke nhảy',
    methodLabel: 'Bấm chốt lò xo',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  },
  miter_45: {
    label: 'Ghép góc 45°',
    methodLabel: 'Ghép 45°',
    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200/60',
  },
  ke_ep_goc: {
    label: 'Ke ép góc',
    methodLabel: 'Dập bấm góc',
    badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200/60',
  },
  ke_vinh_cuu: {
    label: 'Ke vĩnh cửu',
    methodLabel: 'Bắt vít lục giác',
    badgeClass: 'bg-purple-50 text-purple-700 border border-purple-200/60',
  },
  ke_nhay: {
    label: 'Ke nhảy',
    methodLabel: 'Bấm chốt lò xo',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  },
  '45': {
    label: 'Ghép góc 45°',
    methodLabel: 'Ghép 45°',
    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200/60',
  },
};
