'use client';

import { useDeferredValue, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { getWarehouseItems } from '@/actions';
import type { WarehouseItem } from '@/types';
import { DataList } from '../../_components/data-list';
import { INPUT } from '../../_components/form';
import { Select } from '../../_components/select';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';
import { ITEM_TYPES } from './labels';
import { StockCard, stockColumns } from './warehouse-columns';

const PAGE = 30;
const FILTERS = [{ value: '', label: 'Tất cả' }, ...ITEM_TYPES, { value: 'low', label: 'Sắp hết' }];

// Tồn kho: lọc loại / sắp hết ở máy chủ, tìm theo tên hoặc mã ở trang đã tải.
export function StockTab({ onOpen }: { onOpen: (i: WarehouseItem) => void }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const q = useDeferredValue(search.trim().toLowerCase());
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['wh-items', filter, limit],
    queryFn: () => getWarehouseItems({ limit, offset: 0, item_type: filter && filter !== 'low' ? filter : undefined }),
    placeholderData: (prev) => prev,
  });
  // API lỗi 500 khi lọc is_low_stock ở máy chủ nên "Sắp hết" lọc ở trang đã tải
  const items = (data?.items ?? []).filter(
    (i) => (filter !== 'low' || i.isLowStock) && (!q || `${i.itemName} ${i.itemCode}`.toLowerCase().includes(q)),
  );
  const filtered = !!(q || filter);

  return (
    <>
      <div className="sticky top-0 z-10 -mx-rm-gutter mb-3 flex gap-2 bg-rm-bg px-rm-gutter pb-2">
        <div className="relative min-w-0 flex-1">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" aria-hidden="true" />
          <input
            type="search"
            aria-label="Tìm vật tư"
            placeholder="Tên hoặc mã vật tư"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${INPUT} pl-10`}
          />
        </div>
        <div className="w-36 flex-none">
          <Select id="wi-filter" label="Lọc" value={filter} onChange={setFilter} options={FILTERS} />
        </div>
      </div>

      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState title="Không tải được tồn kho" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />
      )}
      {data && items.length === 0 && (
        <EmptyState
          title={filtered ? 'Không tìm thấy' : 'Kho chưa có vật tư'}
          description={filtered ? 'Thử bỏ bớt bộ lọc.' : 'Thêm vật tư đầu tiên.'}
        />
      )}
      {items.length > 0 && (
        <DataList
          label="Danh sách vật tư"
          rows={items}
          rowKey={(i) => i.id}
          columns={stockColumns}
          card={(i) => <StockCard i={i} />}
          onOpen={onOpen}
        />
      )}
      {data?.meta?.next && (
        <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="mt-3 h-rm-tap w-full text-sm font-medium text-rm-primary">
          Xem thêm
        </button>
      )}
    </>
  );
}
