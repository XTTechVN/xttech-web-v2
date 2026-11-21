'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWarehouseOffcuts } from '@/actions';
import { DataList } from '../../_components/data-list';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';
import { OffcutCard, offcutColumns } from './warehouse-columns';

const PAGE = 30;

// Nhôm thừa còn dùng lại được (chỉ xem).
export function OffcutsTab() {
  const [limit, setLimit] = useState(PAGE);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['wh-offcuts', limit],
    queryFn: () => getWarehouseOffcuts({ limit, offset: 0, status: 'available' }),
    placeholderData: (prev) => prev,
  });
  const items = data?.items ?? [];

  return (
    <>
      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState title="Không tải được nhôm thừa" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />
      )}
      {data && items.length === 0 && <EmptyState title="Chưa có nhôm thừa" description="Nhôm thừa tái sử dụng sẽ hiện ở đây." />}
      {items.length > 0 && (
        <DataList label="Danh sách nhôm thừa" rows={items} rowKey={(o) => o.id} columns={offcutColumns} card={(o) => <OffcutCard o={o} />} />
      )}
      {data?.meta?.next && (
        <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="mt-3 h-rm-tap w-full text-sm font-medium text-rm-primary">
          Xem thêm
        </button>
      )}
    </>
  );
}
