'use client';

import { Tag } from '@/components-remake';
import type { WarehouseOffcut } from '@/types';
import { DataTable, type Column } from '@/components-remake';
import { OFFCUT_STATUS, fmtDate, num } from '../format';

const status = (o: WarehouseOffcut) => {
  const s = OFFCUT_STATUS[o.status];
  return <Tag tone={s?.tone}>{s?.label ?? o.status}</Tag>;
};
const title = (o: WarehouseOffcut) => o.profileBarCode || `Thanh profile #${o.profileBarId}`;
const color = (o: WarehouseOffcut) => o.colorName || o.colorCode || `Màu #${o.colorId}`;

const Dot = ({ hex }: { hex?: string | null }) => (
  <span aria-hidden className="size-3 flex-none rounded-full border border-slate-300" style={{ backgroundColor: hex || '#cbd5e1' }} />
);

const COLUMNS: Column<WarehouseOffcut>[] = [
  {
    key: 'bar',
    header: 'Thanh nhôm',
    className: 'max-w-0',
    render: (o) => (
      <>
        <span className="block truncate text-sm font-semibold text-slate-900">{title(o)}</span>
        {o.profileBarName && <span className="block truncate text-xs text-slate-500">{o.profileBarName}</span>}
      </>
    ),
  },
  {
    key: 'color',
    header: 'Màu sắc',
    className: 'w-40',
    render: (o) => (
      <span className="flex items-center gap-2">
        <Dot hex={o.colorHex} />
        <span className="truncate">{color(o)}</span>
      </span>
    ),
  },
  { key: 'len', header: 'Chiều dài', className: 'w-32 text-right font-semibold tabular-nums text-slate-900', render: (o) => `${num(o.lengthMm)} mm` },
  { key: 'loc', header: 'Vị trí', className: 'w-36 max-w-36 truncate', render: (o) => o.location || '–' },
  { key: 'status', header: 'Trạng thái', className: 'w-36', render: status },
  { key: 'date', header: 'Ngày thu hồi', className: 'w-32 tabular-nums', wide: true, render: (o) => fmtDate(o.createdAt) },
  { key: 'plan', header: 'Giữ chỗ', className: 'w-32', wide: true, render: (o) => (o.reservedByPlanId ? `Kế hoạch #${o.reservedByPlanId}` : '–') },
  { key: 'note', header: 'Ghi chú', className: 'w-48 max-w-48 truncate', wide: true, render: (o) => o.note || '–' },
];

export function OffcutList({ rows }: { rows: WarehouseOffcut[] }) {
  return (
    <DataTable
      caption="Danh sách nhôm thừa tái sử dụng."
      rows={rows}
      rowKey={(o) => o.id}
      columns={COLUMNS}
      card={(o) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{title(o)}</p>
            <span className="flex-none">{status(o)}</span>
          </div>
          <p className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
            <Dot hex={o.colorHex} />
            <span className="truncate">{color(o)}</span>
            <strong className="flex-none font-semibold tabular-nums text-slate-900">{num(o.lengthMm)} mm</strong>
          </p>
          <p className="truncate text-xs text-slate-500">
            {[o.location, `Thu hồi ${fmtDate(o.createdAt)}`, o.reservedByPlanId ? `Kế hoạch #${o.reservedByPlanId}` : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      )}
    />
  );
}
