'use client';

import { WAREHOUSE_ITEM_TYPE_MAP } from '@/config';
import { Tag } from '@/components-remake';
import type { WarehouseItem } from '@/types';
import { toDisplayUnit } from '../../_utils/unit-mapping';
import { DataTable, type Column } from '@/components-remake';
import { money, num } from '../format';

export const isLow = (i: WarehouseItem) => i.isLowStock || i.availableStock <= i.minStockLevel;

const status = (i: WarehouseItem) => (isLow(i) ? <Tag tone="red">Sắp hết hàng</Tag> : <Tag tone="green">Đủ tồn kho</Tag>);

const COLUMNS: Column<WarehouseItem>[] = [
  {
    key: 'name',
    header: 'Mặt hàng',
    className: 'max-w-0',
    render: (i) => (
      <>
        <span className="block truncate text-sm font-semibold text-slate-900" title={i.itemName}>
          {i.itemName}
        </span>
        <span className="mt-1 flex items-center gap-1.5">
          <Tag tone="blue">{i.itemCode}</Tag>
          {i.brandName && <Tag tone="violet">{i.brandName}</Tag>}
          {i.colorName && <Tag tone="amber">{i.colorName}</Tag>}
        </span>
      </>
    ),
  },
  { key: 'type', header: 'Phân loại', className: 'w-36', render: (i) => <Tag>{WAREHOUSE_ITEM_TYPE_MAP[i.itemType] ?? i.itemType}</Tag> },
  {
    key: 'stock',
    header: 'Tồn thực tế',
    className: 'w-28 text-right tabular-nums',
    render: (i) => `${num(i.currentStock)} ${toDisplayUnit(i.unit)}`,
  },
  { key: 'reserved', header: 'Giữ chỗ', className: 'w-24 text-right tabular-nums', wide: true, render: (i) => num(i.reservedQty) },
  {
    key: 'avail',
    header: 'Khả dụng',
    className: 'w-24 text-right font-semibold tabular-nums text-slate-900',
    render: (i) => num(i.availableStock),
  },
  { key: 'min', header: 'Định mức', className: 'w-24 text-right tabular-nums', wide: true, render: (i) => num(i.minStockLevel) },
  { key: 'cost', header: 'Giá vốn', className: 'w-32 text-right tabular-nums', wide: true, render: (i) => money(i.costPrice) },
  { key: 'loc', header: 'Vị trí', className: 'w-32 max-w-32 truncate', wide: true, render: (i) => i.location || '–' },
  { key: 'status', header: 'Trạng thái', className: 'w-36', render: status },
];

interface Props {
  rows: WarehouseItem[];
  onOpen: (i: WarehouseItem) => void;
}

export function StockList({ rows, onOpen }: Props) {
  return (
    <DataTable
      caption="Danh sách mặt hàng trong kho. Bấm vào một dòng để xem chi tiết."
      rows={rows}
      rowKey={(i) => i.id}
      columns={COLUMNS}
      onOpen={onOpen}
      card={(i) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{i.itemName}</p>
            <span className="flex-none">{status(i)}</span>
          </div>
          <p className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
            <Tag tone="blue">{i.itemCode}</Tag>
            {i.brandName && <Tag tone="violet">{i.brandName}</Tag>}
            {i.colorName && <Tag tone="amber">{i.colorName}</Tag>}
          </p>
          <p className="text-xs text-slate-500">
            Khả dụng <strong className="font-semibold text-slate-900">{num(i.availableStock)}</strong> {toDisplayUnit(i.unit)} · Tồn{' '}
            {num(i.currentStock)}
            {i.reservedQty > 0 && ` · Giữ chỗ ${num(i.reservedQty)}`}
          </p>
        </div>
      )}
    />
  );
}
