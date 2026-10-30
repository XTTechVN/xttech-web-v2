import { ManualReason, GlassOrderStatus } from '@/types/warehouse';

export const MANUAL_REASON_MAP: Record<ManualReason, string> = {
  spare: 'Kính dự phòng',
  replacement: 'Kính thay thế (vỡ/lỗi)',
  extra: 'Phát sinh ngoài thiết kế',
  other: 'Khác',
};

export const MANUAL_REASON_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'spare', label: 'Kính dự phòng' },
  { value: 'replacement', label: 'Kính thay thế (vỡ/lỗi)' },
  { value: 'extra', label: 'Phát sinh ngoài thiết kế' },
  { value: 'other', label: 'Khác' },
];

export const GRIND_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'grind_edge', label: 'Mài xiết cạnh' },
  { value: 'grind_flat', label: 'Mài bóng phẳng' },
  { value: 'grind_bevel', label: 'Mài vát cạnh' },
  { value: 'no_grind', label: 'Không mài' },
];

export const GRIND_LABEL_MAP: Record<string, string> = {
  grind_edge: 'Mài xiết cạnh',
  grind_flat: 'Mài bóng phẳng',
  grind_bevel: 'Mài vát cạnh',
  no_grind: 'Không mài',
};

export const GLASS_ORDER_STATUS_MAP: Record<
  GlassOrderStatus,
  { label: string; badgeClass: string; bg: string; text: string }
> = {
  draft: {
    label: 'Bản nháp',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
  },
  ordered: {
    label: 'Đã gửi nhà máy',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  delivered: {
    label: 'Đã về xưởng',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
  assembled: {
    label: 'Đã vào khung',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
  },
};
