'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWarehouseReceipts } from '@/actions';
import type { WarehouseReceipt } from '@/types';
import { DataList } from '../../_components/data-list';
import { Select } from '../../_components/select';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';
import { RECEIPT_STATUS } from './labels';
import { ReceiptCard, receiptColumns } from './warehouse-columns';

const PAGE = 20;
const FILTERS = [{ value: '', label: 'Tất cả' }, ...Object.entries(RECEIPT_STATUS).map(([value, s]) => ({ value, label: s.label }))];

export const vnDay = (s: string) => new Date(s).toLocaleDateString('vi-VN');

// Phiếu nhập / xuất kho, lọc theo trạng thái. Bấm dòng để xem chi tiết và duyệt.
export function ReceiptsTab({ onOpen }: { onOpen: (r: WarehouseReceipt) => void }) {
  const [status, setStatus] = useState('draft');
  const [limit, setLimit] = useState(PAGE);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['wh-receipts', status, limit],
    queryFn: () => getWarehouseReceipts({ limit, offset: 0, status: status || undefined }),
    placeholderData: (prev) => prev,
  });
  const items = data?.items ?? [];

  return (
    <>
      <div className="sticky top-0 z-10 -mx-rm-gutter mb-3 bg-rm-bg px-rm-gutter pb-2">
        <Select id="wr-filter" label="Trạng thái" value={status} onChange={setStatus} options={FILTERS} />
      </div>

      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState title="Không tải được phiếu kho" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />
      )}
      {data && items.length === 0 && (
        <EmptyState
          title={status ? 'Không có phiếu nào' : 'Chưa có phiếu kho'}
          description={status ? 'Thử chọn trạng thái khác.' : 'Phiếu nhập, xuất sẽ hiện ở đây.'}
        />
      )}
      {items.length > 0 && (
        <DataList
          label="Danh sách phiếu kho"
          rows={items}
          rowKey={(r) => r.id}
          columns={receiptColumns}
          card={(r) => <ReceiptCard r={r} />}
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
