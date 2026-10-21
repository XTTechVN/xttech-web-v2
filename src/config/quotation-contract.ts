import type { BadgeProps } from '@/components';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

// Backend trả mã tiếng Anh, frontend chịu trách nhiệm hiển thị tiếng Việt
export const QUOTATION_STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  draft: { label: 'Bản nháp', variant: 'default' },
  sent: { label: 'Đã gửi khách', variant: 'primary' },
  accepted: { label: 'Khách đồng ý', variant: 'success' },
  rejected: { label: 'Khách từ chối', variant: 'danger' },
};

export const CONTRACT_STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  draft: { label: 'Chưa ký', variant: 'default' },
  sent: { label: 'Đã gửi khách', variant: 'primary' },
  signed: { label: 'Đã ký', variant: 'success' },
  active: { label: 'Đã ký', variant: 'success' },
  completed: { label: 'Hoàn thành', variant: 'success' },
  cancelled: { label: 'Đã hủy', variant: 'danger' },
};

export const CONTRACT_KIND_MAP: Record<string, string> = {
  main: 'Hợp đồng chính',
  appendix: 'Phụ lục (cũ)',
};

export const PAYMENT_METHOD_MAP: Record<string, string> = {
  bank_transfer: 'Chuyển khoản',
  cash: 'Tiền mặt',
  card: 'Thẻ / POS',
  e_wallet: 'Ví điện tử',
  other: 'Khác',
};

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng' },
  { value: 'cash', label: 'Tiền mặt' },
  { value: 'card', label: 'Thẻ tín dụng / POS' },
];

export const TRANSACTION_TYPE_MAP: Record<string, string> = {
  collection: 'Thu tiền',
  refund: 'Hoàn tiền',
  reversal: 'Đảo bút toán',
};

export const SCOPE_TYPE_OPTIONS = [
  { value: 'all', label: 'Cả công trình' },
  { value: 'by_floor', label: 'Chỉ một số tầng' },
];

export const ACCESSORY_MODE_OPTIONS = [
  { value: 'combined', label: 'Tính gộp vào giá mỗi bộ cửa' },
  { value: 'separated', label: 'Liệt kê riêng phụ kiện' },
];

export const LABOR_CALC_UNIT_OPTIONS = [
  { value: 'vnd_per_m2', label: 'Diện tích cửa (m²)' },
  { value: 'vnd_per_kg', label: 'Trọng lượng nhôm (kg)' },
];

export const PRICING_MODE_OPTIONS = [
  { value: 'markup', label: 'Cộng thêm % lãi vào chi phí' },
  { value: 'margin', label: 'Đặt % lãi mong muốn trên giá bán' },
];

// Hợp đồng đã có hiệu lực pháp lý (đã ký)
export const SIGNED_CONTRACT_STATUSES = ['signed', 'active', 'completed'];

export const PAYMENT_MILESTONE_STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'Chưa thu', variant: 'default' },
  partial: { label: 'Thu một phần', variant: 'warning' },
  completed: { label: 'Đã thu đủ', variant: 'success' },
  overdue: { label: 'Quá hạn', variant: 'danger' },
};

// Nội dung soạn thảo của hợp đồng (Cơ chế, Điều khoản, Chính sách gộp chung) lưu ở khóa này trong contractTerms
export const CONTRACT_TERMS_PLACEHOLDER =
  'Cơ chế thực hiện, điều khoản giao hàng - nghiệm thu - bảo hành, chính sách hỗ trợ sau bán hàng...';
