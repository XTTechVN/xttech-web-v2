'use client';

import { useQueries } from '@tanstack/react-query';
import { getWarehouseItems, getWarehouseOffcuts, getWarehouseReceipts } from '@/actions';
import { useCan } from '@/hooks';

// Bốn số nhanh của kho; mỗi số chỉ hiện khi có quyền xem dữ liệu đó.
export function KpiRow() {
  const { can } = useCan();
  const defs = [
    {
      label: 'Mặt hàng',
      show: can('warehouse_item:read'),
      key: 'items',
      load: async () => (await getWarehouseItems({ limit: 1, offset: 0 })).meta.total,
    },
    {
      label: 'Sắp hết',
      show: can('warehouse_item:read'),
      key: 'low',
      load: async () => (await getWarehouseItems({ limit: 200, offset: 0 })).items.filter((i) => i.isLowStock).length,
    },
    {
      label: 'Phiếu chờ duyệt',
      show: can('warehouse_receipt:read'),
      key: 'draft',
      load: async () => (await getWarehouseReceipts({ limit: 1, offset: 0, status: 'draft' })).meta.total,
    },
    {
      label: 'Nhôm thừa dùng được',
      show: can('offcut:read'),
      key: 'offcut',
      load: async () => (await getWarehouseOffcuts({ limit: 1, offset: 0, status: 'available' })).meta.total,
    },
  ].filter((d) => d.show);
  const res = useQueries({ queries: defs.map((d) => ({ queryKey: ['wh-kpi', d.key], queryFn: d.load })) });
  if (defs.length === 0) return null;

  return (
    <div className="mb-3 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2 md:grid-cols-[repeat(4,minmax(0,1fr))]">
      {defs.map((d, i) => (
        <div key={d.key} className="rounded-rm-xl border border-rm-edge bg-rm-surface px-3 py-2">
          <p className={`text-lg font-semibold ${d.key === 'low' && (res[i].data ?? 0) > 0 ? 'text-rm-danger' : ''}`}>
            {res[i].data?.toLocaleString('vi-VN') ?? '–'}
          </p>
          <p className="truncate text-xs text-rm-muted">{d.label}</p>
        </div>
      ))}
    </div>
  );
}
