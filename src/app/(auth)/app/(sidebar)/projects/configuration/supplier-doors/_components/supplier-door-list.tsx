'use client';

import { Store } from 'lucide-react';
import { DataTable, Tag, type Column } from '@/components-remake';
import type { SupplierDoor } from '@/types';
import { getFileUrl } from '@/utils';
import { getSupplierDoorTypeLabel } from '../_constants/supplier-doors.constants';

export const costPerSqm = (v: number) => `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(v || 0)} đ/m²`;
const status = (d: SupplierDoor) => (d.isActive ? <Tag tone="green">Đang sử dụng</Tag> : <Tag>Tạm ngưng</Tag>);

export const primaryImage = (d: SupplierDoor) => {
  const url = d.images?.find((i) => i.isPrimary)?.imageUrl ?? d.images?.[0]?.imageUrl ?? d.imagePath;
  return url ? getFileUrl(url) : null;
};

export function SupplierDoorThumb({ door }: { door: SupplierDoor }) {
  const src = primaryImage(door);
  return (
    <span className="flex size-12 flex-none items-center justify-center overflow-hidden rounded-control border border-slate-200 bg-slate-50 text-slate-400">
      {src ? <img src={src} alt="" loading="lazy" className="size-full object-cover" /> : <Store size={20} />}
    </span>
  );
}

const COLUMNS: Column<SupplierDoor>[] = [
  {
    key: 'door',
    header: 'Mẫu cửa',
    className: 'max-w-0',
    render: (d) => (
      <div className="flex items-center gap-3">
        <SupplierDoorThumb door={d} />
        <div className="min-w-0">
          <span className="block truncate text-sm font-semibold text-slate-900" title={d.name}>
            {d.name}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5">
            <Tag tone="blue">{d.code}</Tag>
            <Tag tone="violet">{getSupplierDoorTypeLabel(d.doorType)}</Tag>
          </span>
        </div>
      </div>
    ),
  },
  { key: 'supplier', header: 'Nhà cung cấp', className: 'max-w-0 truncate', render: (d) => d.supplier?.name || '–' },
  { key: 'price', header: 'Đơn giá tham khảo', className: 'w-44 whitespace-nowrap text-right tabular-nums', render: (d) => costPerSqm(d.referenceCostPerSqm) },
  { key: 'spec', header: 'Quy cách', className: 'max-w-0 truncate', wide: true, render: (d) => d.specification || '–' },
  { key: 'status', header: 'Trạng thái', className: 'w-36', render: status },
];

interface Props {
  rows: SupplierDoor[];
  onOpen: (d: SupplierDoor) => void;
}

export function SupplierDoorList({ rows, onOpen }: Props) {
  return (
    <DataTable
      caption="Danh sách mẫu cửa nhập từ nhà cung cấp. Bấm vào một dòng để xem chi tiết."
      rows={rows}
      rowKey={(d) => d.id}
      columns={COLUMNS}
      onOpen={onOpen}
      card={(d) => (
        <div className="flex items-start gap-3">
          <SupplierDoorThumb door={d} />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{d.name}</p>
              <span className="flex-none">{status(d)}</span>
            </div>
            <p className="flex flex-wrap items-center gap-1.5">
              <Tag tone="blue">{d.code}</Tag>
              <Tag tone="violet">{getSupplierDoorTypeLabel(d.doorType)}</Tag>
            </p>
            <p className="truncate text-xs text-slate-500">
              {d.supplier?.name || 'Chưa rõ NCC'} · {costPerSqm(d.referenceCostPerSqm)}
            </p>
          </div>
        </div>
      )}
    />
  );
}
