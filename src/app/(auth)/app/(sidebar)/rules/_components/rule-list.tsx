'use client';

import { DataTable, Tag, type Column, type TagTone } from '@/components-remake';
import type { DocumentItem } from '@/types';
import { DOCUMENT_STATUS_MAP, DOCUMENT_TYPE_MAP } from '@/types';
import { formatRuleDate } from './rule-badges';

const STATUS_TONE: Record<string, TagTone> = {
  draft: 'slate',
  pending: 'amber',
  approved: 'green',
  published: 'teal',
  archived: 'red',
  expired: 'red',
  superseded: 'slate',
};

export const TypeTag = ({ type }: { type: string }) => <Tag tone="violet">{DOCUMENT_TYPE_MAP[type]?.label || type}</Tag>;
export const StatusTag = ({ status }: { status: string }) => <Tag tone={STATUS_TONE[status] ?? 'slate'}>{DOCUMENT_STATUS_MAP[status]?.label || status}</Tag>;
const NewTag = ({ d }: { d: DocumentItem }) => (d.isRead === false ? <Tag tone="blue">Mới</Tag> : null);

const COLUMNS: Column<DocumentItem>[] = [
  {
    key: 'title',
    header: 'Văn bản',
    className: 'max-w-0',
    render: (d) => (
      <div className="flex items-center gap-2">
        <span className={`min-w-0 truncate text-sm text-slate-900 ${d.isRead === false ? 'font-semibold' : 'font-medium'}`} title={d.title}>
          {d.title}
        </span>
        <NewTag d={d} />
      </div>
    ),
  },
  { key: 'code', header: 'Mã', className: 'w-40 whitespace-nowrap', render: (d) => <Tag tone="blue">{d.code || '–'}</Tag> },
  { key: 'type', header: 'Loại', className: 'w-36', render: (d) => <TypeTag type={d.documentType} /> },
  { key: 'status', header: 'Trạng thái', className: 'w-40', render: (d) => <StatusTag status={d.status} /> },
  { key: 'by', header: 'Người soạn', className: 'w-44 max-w-44 truncate', wide: true, render: (d) => d.createdBy?.fullName ?? '–' },
  { key: 'at', header: 'Hiệu lực từ', className: 'w-32 whitespace-nowrap', wide: true, render: (d) => formatRuleDate(d.effectiveDate) },
];

interface Props {
  rows: DocumentItem[];
  onOpen: (d: DocumentItem) => void;
}

export function RuleList({ rows, onOpen }: Props) {
  return (
    <DataTable
      caption="Danh sách văn bản ban hành. Bấm vào một dòng để xem chi tiết."
      rows={rows}
      rowKey={(d) => d.id}
      columns={COLUMNS}
      onOpen={onOpen}
      card={(d) => (
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <p className={`min-w-0 truncate text-sm text-slate-900 ${d.isRead === false ? 'font-semibold' : 'font-medium'}`}>{d.title}</p>
            <NewTag d={d} />
          </div>
          <p className="flex flex-wrap items-center gap-1.5">
            <Tag tone="blue">{d.code || '–'}</Tag>
            <TypeTag type={d.documentType} />
            <StatusTag status={d.status} />
          </p>
          {d.createdBy?.fullName && <p className="truncate text-xs text-slate-500">{d.createdBy.fullName}</p>}
        </div>
      )}
    />
  );
}
