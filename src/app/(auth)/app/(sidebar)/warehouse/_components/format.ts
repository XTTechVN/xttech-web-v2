import type { TagTone } from '@/components-remake';
import queryClient from '@/utils/query';

export const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '–');

export const fmtDateTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '–';

export const num = (n?: number | null) => (n ?? 0).toLocaleString('vi-VN');

export const money = (n?: number | null) => `${num(n)} đ`;

// Mọi dữ liệu kho dùng chung khóa `warehouse`: ghi xong chỉ cần gọi một lần
export const refreshWarehouse = () => queryClient.invalidateQueries({ queryKey: ['warehouse'] });

export const RECEIPT_STATUS: Record<string, { label: string; tone: TagTone }> = {
  draft: { label: 'Chờ duyệt', tone: 'amber' },
  approved: { label: 'Đã duyệt', tone: 'green' },
  cancelled: { label: 'Đã hủy', tone: 'slate' },
};

export const OFFCUT_STATUS: Record<string, { label: string; tone: TagTone }> = {
  available: { label: 'Sẵn sàng', tone: 'green' },
  reserved: { label: 'Đã giữ chỗ', tone: 'amber' },
  consumed: { label: 'Đã dùng hết', tone: 'slate' },
};
