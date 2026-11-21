import { Lightbulb } from 'lucide-react';
import type { Suggestion } from '@/types';
import { Badge, type Tone } from '../../_components/badge';
import type { Column } from '../../_components/data-list';
import { TYPES } from './suggestion-sheet';

export const STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'Chờ duyệt', tone: 'warning' },
  approve: { label: 'Đã duyệt', tone: 'success' },
  reject: { label: 'Từ chối', tone: 'danger' },
};
const typeLabel = (s: Suggestion) => TYPES.find((t) => t.value === s.type)?.label ?? 'Khác';
const sender = (s: Suggestion) => (s.anonymous ? 'Ẩn danh' : (s.user?.fullName ?? s.user?.username ?? '–'));
const day = (s: Suggestion) => new Date(s.createdAt).toLocaleDateString('vi-VN');
const badge = (s: Suggestion) => <Badge tone={STATUS[s.status]?.tone}>{STATUS[s.status]?.label ?? s.status}</Badge>;

const Icon = () => (
  <span className="flex size-10 flex-none items-center justify-center rounded-rm bg-rm-primary-soft text-rm-primary">
    <Lightbulb size={18} aria-hidden="true" />
  </span>
);

// Cột bảng (từ 768px) và thẻ (dưới 768px) của danh sách sáng kiến.
export const suggestionColumns: Column<Suggestion>[] = [
  {
    key: 'title',
    header: 'Sáng kiến',
    cell: (s) => (
      <span className="flex items-center gap-3">
        <Icon />
        <span className="min-w-0 truncate font-medium">{s.title}</span>
      </span>
    ),
  },
  { key: 'type', header: 'Loại', fit: true, wideOnly: true, cell: typeLabel },
  { key: 'sender', header: 'Người gửi', fit: true, cell: sender },
  { key: 'date', header: 'Ngày gửi', fit: true, cell: day },
  { key: 'status', header: 'Trạng thái', fit: true, cell: badge },
];

export function SuggestionCard({ s }: { s: Suggestion }) {
  return (
    <span className="flex items-center gap-3">
      <Icon />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{s.title}</span>
        <span className="mt-1 flex items-center gap-2">
          {badge(s)}
          <span className="min-w-0 truncate text-xs text-rm-muted">{typeLabel(s)}</span>
        </span>
        <span className="mt-1 block truncate text-xs text-rm-muted">
          {sender(s)} · {day(s)}
        </span>
      </span>
    </span>
  );
}
