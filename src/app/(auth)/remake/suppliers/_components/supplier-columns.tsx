import { Handshake } from 'lucide-react';
import type { CustomerProvider } from '@/types';
import { Badge } from '../../_components/badge';
import type { Column } from '../../_components/data-list';

const day = (p: CustomerProvider) => new Date(p.createdAt).toLocaleDateString('vi-VN');
const Icon = () => (
  <span className="flex size-10 flex-none items-center justify-center rounded-rm bg-rm-primary-soft text-rm-primary">
    <Handshake size={18} aria-hidden="true" />
  </span>
);

// Cột bảng (từ 768px) và thẻ (dưới 768px) của danh sách nhà cung cấp khách hàng.
export const supplierColumns: Column<CustomerProvider>[] = [
  {
    key: 'name',
    header: 'Nhà cung cấp',
    cell: (p) => (
      <span className="flex items-center gap-3">
        <Icon />
        <span className="min-w-0 truncate font-medium">{p.name}</span>
      </span>
    ),
  },
  { key: 'code', header: 'Mã', fit: true, cell: (p) => (p.code ? <Badge>{p.code}</Badge> : '–') },
  { key: 'date', header: 'Ngày tạo', fit: true, cell: day },
];

export function SupplierCard({ p }: { p: CustomerProvider }) {
  return (
    <span className="flex items-center gap-3">
      <Icon />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{p.name}</span>
        <span className="mt-1 flex items-center gap-2">
          {p.code && <Badge>{p.code}</Badge>}
          <span className="min-w-0 truncate text-xs text-rm-muted">Tạo ngày {day(p)}</span>
        </span>
      </span>
    </span>
  );
}
