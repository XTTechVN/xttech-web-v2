import type { AcceptanceItemResult, PublicSigningSubject } from '@/types';

/** Nhãn chứng từ trên trang khách ký công khai. */
export const SIGN_SUBJECT_LABEL: Record<PublicSigningSubject, string> = {
  contract: 'hợp đồng',
  acceptance: 'biên bản nghiệm thu',
  quotation: 'báo giá',
};

export const SIGN_ITEMS_HEADING: Record<PublicSigningSubject, string> = {
  contract: 'Hạng mục cửa',
  acceptance: 'Các bộ cửa nghiệm thu',
  quotation: 'Hạng mục cửa',
};

export const SIGN_ITEM_RESULT_LABEL: Record<AcceptanceItemResult, string> = {
  passed: 'Đạt',
  failed: 'Không đạt',
};

/** Trạng thái chứng từ coi như đã ký xong. */
export const SIGN_SIGNED_STATUSES: readonly string[] = ['signed', 'active', 'completed', 'accepted'];

/** Trạng thái link ký không còn hiệu lực. */
export const SIGN_UNAVAILABLE_STATUSES: readonly string[] = [
  'revoked',
  'expired',
  'cancelled',
  'rejected',
  'superseded',
  'not_chosen',
];

/** Nhãn trạng thái chứng từ hiển thị cho khách. */
export const SIGN_STATUS_LABEL: Record<string, string> = {
  draft: 'Bản nháp',
  sent: 'Chờ khách ký',
  awaiting_customer: 'Chờ khách ký',
  signed: 'Đã ký',
  active: 'Đã ký',
  completed: 'Đã hoàn tất',
  accepted: 'Đã chấp thuận',
  revoked: 'Đã thu hồi',
  expired: 'Đã hết hạn',
  cancelled: 'Đã hủy',
  rejected: 'Đã từ chối',
  superseded: 'Đã được thay thế',
  not_chosen: 'Không được chọn',
};

/** Key khớp backend: `combined` | `separated`. Giữ `separate` làm alias an toàn. */
export const SIGN_ACCESSORY_MODE_LABEL: Record<string, string> = {
  combined: 'Phụ kiện đã gộp trong giá bộ cửa',
  separated: 'Phụ kiện tính riêng',
  separate: 'Phụ kiện tính riêng',
};

/** Đơn vị bổ sung ngoài ACCESSORY_UNIT_MAP / MATERIAL_UNIT_MAP. */
export const SIGN_EXTRA_UNIT_LABEL: Record<string, string> = {
  m: 'Mét',
  mm: 'mm',
  cai: 'Cái',
  piece: 'Cái',
  pieces: 'Cái',
  pc: 'Cái',
  sets: 'Bộ',
  pairs: 'Đôi / Cặp',
  each: 'Cái',
  litre: 'Lít',
  liter: 'Lít',
  l: 'Lít',
};

/** Nhóm phụ kiện (category) → tiếng Việt khi backend trả mã tiếng Anh. */
export const SIGN_ACCESSORY_CATEGORY_LABEL: Record<string, string> = {
  handle: 'Tay nắm',
  lock: 'Khóa',
  hinge: 'Bản lề',
  roller: 'Bánh xe lùa',
  // Dữ liệu cũ lưu không dấu
  vit: 'Vít',
  khac: 'Khác',
  vau: 'Vấu',
  ron: 'Ron',
  gasket: 'Roan / Gioăng',
  glue: 'Keo',
  silicone: 'Keo',
  screw: 'Vít',
  rail: 'Ray',
  track: 'Ray',
  stopper: 'Chặn cánh',
  closer: 'Tay co',
  bolt: 'Chốt',
  seal: 'Roan / Gioăng',
  brush: 'Chổi chèn',
  bracket: 'Pass / Ke góc',
  corner: 'Ke góc',
  other: 'Phụ kiện khác',
  accessory: 'Phụ kiện',
  hardware: 'Phụ kiện kim khí',
  consumable: 'Vật tư tiêu hao',
};

export const SIGN_ACCESSORY_CATEGORY_FALLBACK = 'Phụ kiện khác';
