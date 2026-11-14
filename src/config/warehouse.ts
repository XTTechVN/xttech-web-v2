import { ManualReason, ReceiptType, SupplierType } from '@/types';

export const SUPPLIER_TYPE_MAP: Record<string, string> = {
  aluminum: 'Nhà cung cấp nhôm thanh',
  accessory: 'Nhà cung cấp phụ kiện kim khí',
  glass: 'Nhà máy tôi kính an toàn',
  consumable: 'Vật tư phụ (Keo, gioăng, ốc vít)',
  door_set: 'Nhà cung cấp cửa nguyên bộ',
};

export const SUPPLIER_TYPE_OPTIONS: { value: SupplierType; label: string }[] = [
  { value: 'aluminum', label: SUPPLIER_TYPE_MAP.aluminum },
  { value: 'accessory', label: SUPPLIER_TYPE_MAP.accessory },
  { value: 'glass', label: SUPPLIER_TYPE_MAP.glass },
  { value: 'consumable', label: SUPPLIER_TYPE_MAP.consumable },
  { value: 'door_set', label: SUPPLIER_TYPE_MAP.door_set },
];

export const WAREHOUSE_ITEM_TYPE_MAP: Record<string, string> = {
  profile: 'Nhôm thanh Profile',
  accessory: 'Phụ kiện kim khí',
  consumable: 'Vật tư phụ & Keo',
};

export const RECEIPT_REASON_MAP: Record<string, string> = {
  purchase: 'Mua hàng mới từ NCC',
  production_issue: 'Xuất sản xuất theo Lệnh',
  rework_issue: 'Xuất bù sự cố / cắt hỏng',
  offcut_return: 'Thu hồi nhôm thừa sau sản xuất',
  adjustment: 'Điều chỉnh kiểm kê kho',
  scrap: 'Thanh lý phế liệu',
};

export const IMPORT_REASON_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'purchase', label: 'Mua hàng mới từ NCC' },
  { value: 'offcut_return', label: 'Thu hồi nhôm thừa sau sản xuất' },
  { value: 'adjustment', label: 'Điều chỉnh kiểm kê (Nhập thừa / Cân đối)' },
];

export const EXPORT_REASON_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'production_issue', label: 'Xuất sản xuất theo Lệnh' },
  { value: 'rework_issue', label: 'Xuất bù sự cố / cắt hỏng' },
  { value: 'adjustment', label: 'Điều chỉnh kiểm kê (Xuất thiếu / Hao hụt)' },
  { value: 'scrap', label: 'Thanh lý phế liệu' },
];

export const getReceiptReasonOptions = (type: ReceiptType): Array<{ value: string; label: string }> => {
  return type === 'import' ? IMPORT_REASON_OPTIONS : EXPORT_REASON_OPTIONS;
};

export const RECEIPT_STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: 'Chờ duyệt (Đang giữ chỗ)', bg: 'bg-amber-50', text: 'text-amber-700' },
  approved: { label: 'Đã duyệt xuất/nhập', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  cancelled: { label: 'Đã hủy', bg: 'bg-slate-100', text: 'text-slate-600' },
};

export const GLASS_ORDER_STATUS_MAP: Record<
  string,
  { label: string; badgeClass: string; bg: string; text: string }
> = {
  draft: {
    label: 'Chờ duyệt',
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
    label: 'Đã nhận về xưởng',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
  assembled: {
    label: 'Đã vào khung',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
    bg: 'bg-primary/10',
    text: 'text-primary',
  },
  cancelled: {
    label: 'Đã hủy',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
  },
  scrapped: {
    label: 'Hủy / Bể vỡ',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
  },
};

export const GLASS_GRIND_LABEL_MAP: Record<string, string> = {
  grind_edge: 'Mài xiết cạnh',
  grind_flat: 'Mài bóng phẳng',
  grind_bevel: 'Mài vát cạnh',
  no_grind: 'Không mài',
};

export const GLASS_GRIND_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'grind_edge', label: 'Mài xiết cạnh' },
  { value: 'grind_flat', label: 'Mài bóng phẳng' },
  { value: 'grind_bevel', label: 'Mài vát cạnh' },
  { value: 'no_grind', label: 'Không mài' },
];

export const GLASS_MANUAL_REASON_MAP: Record<ManualReason, string> = {
  spare: 'Kính dự phòng',
  replacement: 'Kính thay thế (vỡ/lỗi)',
  extra: 'Phát sinh ngoài thiết kế',
  other: 'Khác',
};

export const GLASS_MANUAL_REASON_OPTIONS: Array<{ value: ManualReason; label: string }> = [
  { value: 'spare', label: 'Kính dự phòng' },
  { value: 'replacement', label: 'Kính thay thế (vỡ/lỗi)' },
  { value: 'extra', label: 'Phát sinh ngoài thiết kế' },
  { value: 'other', label: 'Khác' },
];

export const FRAME_SHAPE_LABEL_MAP: Record<string, string> = {
  rect: 'Chữ nhật',
  arch_half: 'Vòm bán nguyệt',
  arch_segment: 'Vòm cung tròn',
  arch_semicircle: 'Vòm bán nguyệt có chân',
  arch_semicircle_open: 'Vòm bán nguyệt mở đáy',
  arch_segment_leg: 'Vòm cung có chân',
  arch_segment_leg_open: 'Vòm cung mở đáy',
  arch_pointed: 'Vòm nhọn Gothic',
  arch_pointed_leg: 'Vòm nhọn có chân',
  round_top: 'Tròn đầu',
  round_top_open: 'Tròn đầu mở đáy',
  round_top_2: 'Bo 2 góc trên',
  round_top_2_open: 'Bo 2 góc trên mở đáy',
  round_top_right: 'Bo 1 góc trên',
  round_top_rw: 'Bo góc lệch',
  round_4_corner: 'Bo 4 góc',
  quad_circle: 'Vòm 1/4',
  circle: 'Hình tròn',
  ellipse: 'Hình elip',
};
