import { FolderKanban } from 'lucide-react';
import { PROJECT_STATUS_MAP } from '@/config';
import type { Project } from '@/types';
import { Badge, toneOf } from '../../_components/badge';
import type { Column } from '../../_components/data-list';

const badge = (p: Project) => {
  const s = PROJECT_STATUS_MAP[p.status];
  return <Badge tone={toneOf(s?.variant)}>{s?.label ?? p.status}</Badge>;
};
const due = (p: Project) => (p.expectedDate ? new Date(`${p.expectedDate}T00:00:00`).toLocaleDateString('vi-VN') : '–');
const Icon = () => (
  <span className="flex size-10 flex-none items-center justify-center rounded-rm bg-rm-primary-soft text-rm-primary">
    <FolderKanban size={18} aria-hidden="true" />
  </span>
);

// Cột bảng (từ 768px) và thẻ (dưới 768px) của danh sách dự án.
export const projectColumns = (onEdit?: (p: Project) => void): Column<Project>[] => [
  {
    key: 'name',
    header: 'Dự án',
    cell: (p) => (
      <span className="flex items-center gap-3">
        <Icon />
        <span className="min-w-0">
          <span className="block truncate font-medium">{p.name}</span>
          <span className="block truncate text-xs text-rm-muted">{p.code}</span>
        </span>
      </span>
    ),
  },
  { key: 'customer', header: 'Khách hàng', cell: (p) => p.customer?.name || '–' },
  { key: 'status', header: 'Trạng thái', fit: true, cell: badge },
  { key: 'due', header: 'Dự kiến xong', fit: true, wideOnly: true, cell: due },
  { key: 'address', header: 'Địa chỉ công trình', wideOnly: true, cell: (p) => p.address || '–' },
  ...(onEdit
    ? [
        {
          key: 'edit',
          header: 'Sửa',
          fit: true,
          cell: (p: Project) => (
            <button
              type="button"
              aria-label={`Sửa dự án ${p.name}`}
              onClick={() => onEdit(p)}
              className="relative z-10 h-8 rounded-rm border border-rm-edge px-3 text-xs hover:bg-rm-bg"
            >
              Sửa
            </button>
          ),
        },
      ]
    : []),
];

export function ProjectCard({ p }: { p: Project }) {
  return (
    <span className="flex items-center gap-3">
      <Icon />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{p.name}</span>
        <span className="mt-1 flex items-center gap-2">
          {badge(p)}
          <span className="min-w-0 truncate text-xs text-rm-muted">{p.code}</span>
        </span>
        <span className="mt-1 block truncate text-xs text-rm-muted">
          {[p.customer?.name, p.address].filter(Boolean).join(' · ') || 'Chưa có khách hàng'}
        </span>
      </span>
    </span>
  );
}
