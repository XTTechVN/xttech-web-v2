'use client';

import { DataTable, Tag, type Column } from '@/components-remake';
import type { Glass, GlassCategory } from '@/types';
import { formatCurrency } from '@/utils';
import { glassTypeOf } from './format';
import { SystemTag } from '../../_components/shared-catalog';

const status = (g: Glass) => (g.isActive !== false ? <Tag tone="green">Hoạt động</Tag> : <Tag>Tạm khóa</Tag>);
const thickness = (g: Glass) => (g.thicknessMm ? `${g.thicknessMm} mm` : '–');

interface Props {
  rows: Glass[];
  categories: GlassCategory[];
  onOpen: (g: Glass) => void;
}

export function GlassList({ rows, categories, onOpen }: Props) {
  const catName = (g: Glass) => categories.find((c) => c.id === g.categoryId)?.name;

  const columns: Column<Glass>[] = [
    {
      key: 'name',
      header: 'Quy cách',
      className: 'max-w-0',
      render: (g) => (
        <>
          <span className="block truncate text-sm font-semibold text-slate-900" title={g.name}>
            {g.name}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5">
            <Tag tone="blue">{g.code || '–'}</Tag>
            {g.isSystem && <SystemTag />}
            {g.isDefault && <Tag tone="amber">Mặc định</Tag>}
          </span>
        </>
      ),
    },
    { key: 'type', header: 'Chủng loại', className: 'w-40', render: (g) => <Tag tone={glassTypeOf(g).tone}>{glassTypeOf(g).label}</Tag> },
    { key: 'thickness', header: 'Độ dày', className: 'w-24 whitespace-nowrap tabular-nums', render: thickness },
    {
      key: 'price',
      header: 'Đơn giá (m²)',
      className: 'w-36 whitespace-nowrap text-right tabular-nums',
      render: (g) => formatCurrency(g.unitPrice || 0),
    },
    { key: 'group', header: 'Nhóm', className: 'max-w-0 truncate', wide: true, render: (g) => catName(g) || '–' },
    { key: 'status', header: 'Trạng thái', className: 'w-32', wide: true, render: status },
  ];

  return (
    <DataTable
      caption="Danh sách quy cách kính, tấm, lưới. Bấm vào một dòng để xem chi tiết."
      rows={rows}
      rowKey={(g) => g.id}
      columns={columns}
      onOpen={onOpen}
      card={(g) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{g.name}</p>
            <span className="flex-none">{status(g)}</span>
          </div>
          <p className="flex flex-wrap items-center gap-1.5">
            <Tag tone="blue">{g.code || '–'}</Tag>
            {g.isSystem && <SystemTag />}
            <Tag tone={glassTypeOf(g).tone}>{glassTypeOf(g).label}</Tag>
            {g.isDefault && <Tag tone="amber">Mặc định</Tag>}
          </p>
          <p className="text-xs text-slate-500">
            {thickness(g)} · {formatCurrency(g.unitPrice || 0)}/m²
          </p>
        </div>
      )}
    />
  );
}
