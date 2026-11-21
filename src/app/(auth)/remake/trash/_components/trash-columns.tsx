import type { TrashItem } from '@/types';
import { Badge } from '../../_components/badge';
import type { Column } from '../../_components/data-list';

const left = (i: TrashItem) => <Badge tone={i.daysLeft <= 3 ? 'danger' : 'neutral'}>Còn {i.daysLeft} ngày</Badge>;
const day = (i: TrashItem) => new Date(i.deletedAt).toLocaleDateString('vi-VN');
const kind = (i: TrashItem) => (i.itemType === 'folder' ? 'Thư mục' : 'Tài liệu');

export const trashColumns: Column<TrashItem>[] = [
  { key: 'title', header: 'Mục đã xoá', cell: (i) => <span className="font-medium">{i.title}</span> },
  { key: 'code', header: 'Mã', fit: true, cell: (i) => i.code },
  { key: 'kind', header: 'Loại', fit: true, wideOnly: true, cell: kind },
  { key: 'by', header: 'Người xoá', wideOnly: true, cell: (i) => i.deletedByName },
  { key: 'at', header: 'Ngày xoá', fit: true, cell: day },
  { key: 'left', header: 'Thời hạn', fit: true, cell: left },
];

export function TrashCard({ i }: { i: TrashItem }) {
  return (
    <>
      <span className="block truncate text-sm font-medium">{i.title}</span>
      <span className="flex items-center gap-2">
        {left(i)}
        <span className="min-w-0 truncate text-xs text-rm-muted">{i.code}</span>
      </span>
      <span className="block truncate text-xs text-rm-muted">
        {i.deletedByName} · {day(i)}
      </span>
    </>
  );
}
