import type { TagTone } from '@/components-remake';
import { SuggestionType, type Suggestion } from '@/types';

export const TYPES: { value: string; label: string; tone: TagTone }[] = [
  { value: SuggestionType.PROCESS, label: 'Quy trình làm việc', tone: 'blue' },
  { value: SuggestionType.PRODUCT, label: 'Sản phẩm, dịch vụ', tone: 'green' },
  { value: SuggestionType.TECHNOLOGY, label: 'Kỹ thuật, CNTT', tone: 'amber' },
  { value: SuggestionType.COST, label: 'Tiết kiệm chi phí', tone: 'teal' },
  { value: SuggestionType.QUALITY, label: 'Chất lượng', tone: 'violet' },
  { value: SuggestionType.SAFETY, label: 'An toàn lao động', tone: 'red' },
  { value: SuggestionType.WORKPLACE, label: 'Môi trường làm việc', tone: 'orange' },
  { value: SuggestionType.WELFARE, label: 'Chế độ, phúc lợi', tone: 'pink' },
  { value: SuggestionType.TRAINING, label: 'Đào tạo, phát triển', tone: 'slate' },
  { value: SuggestionType.CUSTOMER, label: 'Chăm sóc khách hàng', tone: 'blue' },
  { value: SuggestionType.COMPLAINT, label: 'Phản ánh, khiếu nại', tone: 'red' },
  { value: SuggestionType.OTHER, label: 'Khác', tone: 'slate' },
];

export const typeOf = (t?: string | null) => TYPES.find((o) => o.value === (t || 'other').toLowerCase()) ?? TYPES[TYPES.length - 1];

export const STATUSES: Record<string, { label: string; tone: TagTone }> = {
  pending: { label: 'Chờ duyệt', tone: 'amber' },
  approve: { label: 'Đã xử lý', tone: 'green' },
  reject: { label: 'Từ chối', tone: 'red' },
};

export const statusOf = (s: string) => STATUSES[s] ?? { label: 'Không rõ', tone: 'slate' as TagTone };

export const fmtDate = (d?: string | null) => (d ? d.slice(0, 10).split('-').reverse().join('/') : '–');

/** Người gửi: đề xuất ẩn danh luôn hiện "Ẩn danh" */
export const senderName = (s: Suggestion) => (s.anonymous ? 'Ẩn danh' : s.user?.fullName || s.user?.username || 'Chưa cập nhật');

export const isImage = (path: string) => /\.(jpe?g|png|webp|gif)$/i.test(path);
