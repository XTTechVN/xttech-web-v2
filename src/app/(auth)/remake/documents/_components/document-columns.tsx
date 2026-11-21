import { DOCUMENT_STATUS_MAP, DOCUMENT_TYPE_MAP, type DocumentItem } from '@/types';
import { Badge } from '../../_components/badge';
import type { Column } from '../../_components/data-list';

const type = (d: DocumentItem) => DOCUMENT_TYPE_MAP[d.documentType]?.label ?? d.documentType;
const status = (d: DocumentItem) => DOCUMENT_STATUS_MAP[d.status]?.label ?? d.status;
const meta = (d: DocumentItem) => [d.category?.name, d.createdBy?.fullName].filter(Boolean).join(' · ') || '–';

export const documentColumns: Column<DocumentItem>[] = [
  {
    key: 'title',
    header: 'Tài liệu',
    cell: (d) => (
      <span className="flex items-center gap-2">
        <span className={d.isRead === false ? 'min-w-0 truncate font-semibold' : 'min-w-0 truncate font-medium'}>{d.title}</span>
        {d.isRead === false && <Badge tone="primary">Mới</Badge>}
      </span>
    ),
  },
  { key: 'code', header: 'Mã', fit: true, cell: (d) => d.code },
  { key: 'type', header: 'Loại', fit: true, cell: type },
  { key: 'status', header: 'Trạng thái', fit: true, wideOnly: true, cell: status },
  { key: 'cat', header: 'Danh mục', wideOnly: true, cell: (d) => d.category?.name ?? '–' },
  { key: 'by', header: 'Người tạo', wideOnly: true, cell: (d) => d.createdBy?.fullName ?? '–' },
];

export function DocumentCard({ d }: { d: DocumentItem }) {
  return (
    <>
      <span className="flex items-center gap-2">
        <span className={`min-w-0 truncate text-sm ${d.isRead === false ? 'font-semibold' : 'font-medium'}`}>{d.title}</span>
        {d.isRead === false && <Badge tone="primary">Mới</Badge>}
      </span>
      <span className="block truncate text-xs text-rm-muted">
        {d.code} · {type(d)} · {status(d)}
      </span>
      <span className="block truncate text-xs text-rm-muted">{meta(d)}</span>
    </>
  );
}
