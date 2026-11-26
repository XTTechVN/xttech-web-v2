'use client';

import { DataTable, Tag, type Column } from '@/components-remake';
import type { TrashItem } from '@/types';

export const kindLabel = (i: TrashItem) => (i.itemType === 'folder' ? 'Thư mục' : 'Tài liệu');
export const deletedDay = (i: TrashItem) => new Date(i.deletedAt).toLocaleDateString('vi-VN');
export const LeftTag = ({ i }: { i: TrashItem }) => <Tag tone={i.daysLeft <= 3 ? 'red' : 'slate'}>{`Còn ${i.daysLeft} ngày`}</Tag>;

const COLUMNS: Column<TrashItem>[] = [
  {
    key: 'title',
    header: 'Mục đã xóa',
    className: 'max-w-0',
    render: (i) => (
      <span className="block truncate text-sm font-semibold text-slate-900" title={i.title}>
        {i.title}
      </span>
    ),
  },
  { key: 'code', header: 'Mã', className: 'w-40 whitespace-nowrap', render: (i) => <Tag tone="blue">{i.code || '–'}</Tag> },
  { key: 'kind', header: 'Loại', className: 'w-28', wide: true, render: (i) => <Tag tone="violet">{kindLabel(i)}</Tag> },
  { key: 'by', header: 'Người xóa', className: 'w-44 max-w-44 truncate', wide: true, render: (i) => i.deletedByName },
  { key: 'at', header: 'Ngày xóa', className: 'w-28 whitespace-nowrap', render: deletedDay },
  { key: 'left', header: 'Thời hạn', className: 'w-32', render: (i) => <LeftTag i={i} /> },
];

interface Props {
  rows: TrashItem[];
  onOpen: (i: TrashItem) => void;
}

export function TrashList({ rows, onOpen }: Props) {
  return (
    <DataTable
      caption="Danh sách mục đã xóa. Bấm vào một dòng để xem chi tiết."
      rows={rows}
      rowKey={(i) => `${i.itemType}-${i.id}`}
      columns={COLUMNS}
      onOpen={onOpen}
      card={(i) => (
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="truncate text-sm font-semibold text-slate-900">{i.title}</p>
          <p className="flex flex-wrap items-center gap-1.5">
            <Tag tone="blue">{i.code || '–'}</Tag>
            <LeftTag i={i} />
          </p>
          <p className="truncate text-xs text-slate-500">
            {i.deletedByName} · {deletedDay(i)}
          </p>
        </div>
      )}
    />
  );
}
