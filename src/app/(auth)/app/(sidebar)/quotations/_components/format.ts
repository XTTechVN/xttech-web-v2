import type { TagTone } from '@/components-remake';
import type { QuotationStatus } from '@/types';

// Thứ tự theo vòng duyệt: việc cần duyệt đứng đầu
export const STATUSES: { value: QuotationStatus | 'all'; label: string; tone: TagTone }[] = [
  { value: 'pending_approval', label: 'Chờ duyệt', tone: 'amber' },
  { value: 'approved', label: 'Đã duyệt, chưa gửi', tone: 'blue' },
  { value: 'sent', label: 'Chờ khách', tone: 'teal' },
  { value: 'accepted', label: 'Khách đồng ý', tone: 'green' },
  { value: 'rejected', label: 'Khách từ chối', tone: 'red' },
  { value: 'draft', label: 'Nháp', tone: 'slate' },
  { value: 'all', label: 'Tất cả', tone: 'slate' },
];

const OTHER: Record<string, string> = { superseded: 'Đã có phiên bản mới', not_chosen: 'Phương án không chọn' };

export const statusOf = (s: string): { label: string; tone: TagTone } =>
  STATUSES.find((o) => o.value === s) ?? { label: OTHER[s] ?? s, tone: 'slate' };

export const fmtDateTime = (iso?: string | null) => (iso ? new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '–');

export const marginClass = (m: number) => (m < 0 ? 'text-red-600' : 'text-green-700');
