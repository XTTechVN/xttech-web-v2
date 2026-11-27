'use client';

import { DataTable, Tag, type Column } from '@/components-remake';
import { ACCESSORY_COLOR_MAP, formatAccessoryUnit, type Accessory } from '@/types';
import { formatCurrency } from '@/utils';
import { BASE_MINIO_URL } from '@/config';
import { SystemTag } from '../../_components/shared-catalog';

export const accessoryImage = (a: Accessory) =>
  a.imagePath ? (a.imagePath.startsWith('http') ? a.imagePath : `${BASE_MINIO_URL}/${a.imagePath.replace(/^\//, '')}`) : null;
export const colorLabel = (a: Accessory) => (a.color ? ACCESSORY_COLOR_MAP[a.color.toLowerCase()] || a.color : '–');
const status = (a: Accessory) => (a.isActive !== false ? <Tag tone="green">Hoạt động</Tag> : <Tag>Tạm ngưng</Tag>);

export function AccessoryThumb({ accessory: a, size = 'size-10' }: { accessory: Accessory; size?: string }) {
  const src = accessoryImage(a);
  return (
    <span className={`flex ${size} flex-none items-center justify-center overflow-hidden rounded-control border border-slate-200 bg-slate-50`}>
      {src && <img src={src} alt="" loading="lazy" className="size-full object-contain" />}
    </span>
  );
}

const COLUMNS: Column<Accessory>[] = [
  {
    key: 'name',
    header: 'Phụ kiện',
    className: 'max-w-0',
    render: (a) => (
      <div className="flex items-center gap-3">
        <AccessoryThumb accessory={a} />
        <div className="min-w-0">
          <span className="block truncate text-sm font-semibold text-slate-900" title={a.name}>
            {a.name}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5">
            {a.code && <Tag tone="blue">{a.code}</Tag>}
            {a.isSystem && <SystemTag />}
            {a.category?.name && <Tag tone="violet">{a.category.name}</Tag>}
          </span>
        </div>
      </div>
    ),
  },
  { key: 'spec', header: 'Quy cách', className: 'max-w-0 truncate', wide: true, render: (a) => a.specification || '–' },
  { key: 'unit', header: 'ĐVT', className: 'w-24 whitespace-nowrap', render: (a) => formatAccessoryUnit(a.unit) || '–' },
  { key: 'color', header: 'Màu', className: 'w-32 whitespace-nowrap', wide: true, render: colorLabel },
  { key: 'price', header: 'Giá nhập', className: 'w-36 whitespace-nowrap text-right tabular-nums', render: (a) => formatCurrency(a.costPrice || 0) },
  { key: 'status', header: 'Trạng thái', className: 'w-32', render: status },
];

interface Props {
  rows: Accessory[];
  onOpen: (a: Accessory) => void;
}

export function AccessoryList({ rows, onOpen }: Props) {
  return (
    <DataTable
      caption="Danh sách phụ kiện, roan và keo của hãng đang chọn. Bấm vào một dòng để xem chi tiết."
      rows={rows}
      rowKey={(a) => a.id}
      columns={COLUMNS}
      onOpen={onOpen}
      card={(a) => (
        <div className="flex items-start gap-3">
          <AccessoryThumb accessory={a} />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{a.name}</p>
              <span className="flex-none">{status(a)}</span>
            </div>
            <p className="flex flex-wrap items-center gap-1.5">
              {a.code && <Tag tone="blue">{a.code}</Tag>}
              {a.isSystem && <SystemTag />}
              {a.category?.name && <Tag tone="violet">{a.category.name}</Tag>}
            </p>
            <p className="text-xs text-slate-500">
              {formatAccessoryUnit(a.unit) || '–'} · {formatCurrency(a.costPrice || 0)}
            </p>
          </div>
        </div>
      )}
    />
  );
}
