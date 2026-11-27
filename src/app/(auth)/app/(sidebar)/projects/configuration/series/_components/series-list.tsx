'use client';

import { DataTable, Tag, type Column } from '@/components-remake';
import type { DoorSeries } from '@/types';
import { SystemTag } from '../../_components/shared-catalog';
import { jointLabel } from './format';

const status = (s: DoorSeries) => (s.isActive !== false ? <Tag tone="green">Hoạt động</Tag> : <Tag>Tạm ngưng</Tag>);
const thickness = (s: DoorSeries) => (s.aluminumThickness ? `${s.aluminumThickness} mm` : '–');

const COLUMNS: Column<DoorSeries>[] = [
  {
    key: 'name',
    header: 'Hệ nhôm',
    className: 'max-w-0',
    render: (s) => (
      <>
        <span className="block truncate text-sm font-semibold text-slate-900" title={s.name}>
          {s.name}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5">
          <Tag tone="blue">{s.code}</Tag>
          {s.isSystem && <SystemTag />}
        </span>
      </>
    ),
  },
  { key: 'thickness', header: 'Độ dày', className: 'w-28 whitespace-nowrap tabular-nums', render: thickness },
  {
    key: 'joint',
    header: 'Liên kết góc',
    className: 'w-40',
    render: (s) => (s.cornerJointType ? <Tag tone="violet">{jointLabel(s.cornerJointType)}</Tag> : '–'),
  },
  { key: 'description', header: 'Mô tả', className: 'max-w-0 truncate', wide: true, render: (s) => s.description || '–' },
  { key: 'status', header: 'Trạng thái', className: 'w-32', render: status },
];

interface Props {
  rows: DoorSeries[];
  onOpen: (s: DoorSeries) => void;
}

export function SeriesList({ rows, onOpen }: Props) {
  return (
    <DataTable
      caption="Danh sách hệ nhôm của hãng đang chọn. Bấm vào một dòng để xem chi tiết."
      rows={rows}
      rowKey={(s) => s.id}
      columns={COLUMNS}
      onOpen={onOpen}
      card={(s) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{s.name}</p>
            <span className="flex-none">{status(s)}</span>
          </div>
          <p className="flex flex-wrap items-center gap-1.5">
            <Tag tone="blue">{s.code}</Tag>
            {s.isSystem && <SystemTag />}
            {s.cornerJointType && <Tag tone="violet">{jointLabel(s.cornerJointType)}</Tag>}
          </p>
          <p className="text-xs text-slate-500">Độ dày {thickness(s)}</p>
        </div>
      )}
    />
  );
}
