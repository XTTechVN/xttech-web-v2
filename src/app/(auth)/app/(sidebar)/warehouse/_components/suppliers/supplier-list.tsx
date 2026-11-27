'use client';

import { Phone } from 'lucide-react';
import { DataTable, Tag, type Column } from '@/components-remake';
import { SUPPLIER_TYPE_MAP } from '@/config';
import type { WarehouseSupplier } from '@/types';

const status = (s: WarehouseSupplier) => (s.isActive ? <Tag tone="green">Hoạt động</Tag> : <Tag>Ngừng hợp tác</Tag>);

const COLUMNS: Column<WarehouseSupplier>[] = [
  {
    key: 'name',
    header: 'Nhà cung cấp',
    className: 'max-w-0',
    render: (s) => (
      <>
        <span className="block truncate text-sm font-semibold text-slate-900" title={s.name}>
          {s.name}
        </span>
        <span className="mt-1 block">
          <Tag tone="blue">{s.code}</Tag>
        </span>
      </>
    ),
  },
  {
    key: 'type',
    header: 'Phân loại',
    className: 'w-56',
    render: (s) => <Tag tone="violet">{SUPPLIER_TYPE_MAP[s.supplierType] ?? s.supplierType}</Tag>,
  },
  { key: 'phone', header: 'Điện thoại', className: 'w-36 whitespace-nowrap tabular-nums', render: (s) => s.phone },
  { key: 'contact', header: 'Người liên hệ', className: 'w-40 max-w-40 truncate', wide: true, render: (s) => s.contactName || '–' },
  { key: 'tax', header: 'Mã số thuế', className: 'w-32 tabular-nums', wide: true, render: (s) => s.taxCode || '–' },
  { key: 'status', header: 'Trạng thái', className: 'w-36', render: status },
];

interface Props {
  rows: WarehouseSupplier[];
  onOpen: (s: WarehouseSupplier) => void;
}

export function SupplierList({ rows, onOpen }: Props) {
  return (
    <DataTable
      caption="Danh sách nhà cung cấp kho. Bấm vào một dòng để xem chi tiết."
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
          <p className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
            <Tag tone="blue">{s.code}</Tag>
            <Tag tone="violet">{SUPPLIER_TYPE_MAP[s.supplierType] ?? s.supplierType}</Tag>
          </p>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <Phone size={12} className="flex-none" />
            <span className="truncate">{s.phone}</span>
            {s.contactName && <span className="truncate">· {s.contactName}</span>}
          </p>
        </div>
      )}
    />
  );
}
