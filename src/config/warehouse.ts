export const SUPPLIER_TYPE_MAP: Record<string, string> = {
  aluminum: 'Nhà cung cấp nhôm thanh',
  accessory: 'Nhà cung cấp phụ kiện kim khí',
  glass: 'Nhà máy tôi kính an toàn',
  consumable: 'Vật tư phụ (Keo, gioăng, ốc vít)',
};

export const WAREHOUSE_ITEM_TYPE_MAP: Record<string, string> = {
  profile: 'Nhôm thanh Profile',
  accessory: 'Phụ kiện kim khí',
  consumable: 'Vật tư phụ & Keo',
};

export const RECEIPT_REASON_MAP: Record<string, string> = {
  purchase: 'Mua hàng mới từ NCC',
  production_issue: 'Xuất sản xuất theo Lệnh',
  rework_issue: 'Xuất bù sự cố / cắt hỏng',
  offcut_return: 'Nhập kho thu hồi đề-xê',
  adjustment: 'Điều chỉnh kiểm kê kho',
  scrap: 'Thanh lý phế liệu',
};

export const RECEIPT_STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: 'Chờ duyệt (Đang giữ chỗ)', bg: 'bg-amber-50', text: 'text-amber-700' },
  approved: { label: 'Đã duyệt xuất/nhập', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  cancelled: { label: 'Đã hủy', bg: 'bg-slate-100', text: 'text-slate-600' },
};

export const GLASS_ORDER_STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: 'Chờ duyệt', bg: 'bg-slate-100', text: 'text-slate-700' },
  ordered: { label: 'Đã gửi nhà máy tôi', bg: 'bg-blue-50', text: 'text-blue-700' },
  delivered: { label: 'Đã nhận về xưởng', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  assembled: { label: 'Đã vào khung hoàn thiện', bg: 'bg-indigo-50', text: 'text-indigo-700' },
};
