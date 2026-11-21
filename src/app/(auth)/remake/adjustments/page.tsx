'use client';

import { useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { getAdjustmentRequests } from '@/actions';
import { useCan } from '@/hooks';
import type { AttendanceAdjustmentRequest } from '@/types';
import { cn } from '@/utils';
import { DataList } from '../_components/data-list';
import { PageHeader } from '../_components/page-header';
import { Select } from '../_components/select';
import { EmptyState, ErrorState, ListSkeleton } from '../_components/state-views';
import { AdjustmentCard, adjustmentColumns } from './_components/adjustment-columns';
import { AdjustmentSheet, STATUS } from './_components/adjustment-sheet';

const PAGE = 20;
type Tab = 'review' | 'all' | 'mine';
const TAB_LABEL: Record<Tab, string> = { review: 'Cần duyệt', all: 'Tất cả', mine: 'Của tôi' };

// Khiếu nại công theo quyền: đọc phạm vi dept/org → tab "Tất cả"; có quyền duyệt → thêm "Cần duyệt" (mở trước);
// có quyền tạo (hoặc chỉ đọc phạm vi own) → "Của tôi". Chỉ có một tab thì không hiện thanh chuyển tab.
export default function RemakeAdjustmentsPage() {
  const { can, scopeOf, me, isReady } = useCan();
  const wide = can('attendance_request:read') && scopeOf('attendance_request:read') !== 'own';
  const canReview = wide && can('attendance_request:update');
  const tabs: Tab[] = wide
    ? [...(canReview ? (['review'] as const) : []), 'all', ...(can('attendance_request:create') ? (['mine'] as const) : [])]
    : ['mine'];
  const [picked, setTab] = useState<Tab | null>(null);
  const tab = picked && tabs.includes(picked) ? picked : tabs[0];
  const [status, setStatus] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState<AttendanceAdjustmentRequest | 'new' | null>(null);

  const userId = tab === 'mine' && wide ? me?.user.id : undefined;
  const enabled = isReady && can('attendance_request:read') && (tab !== 'mine' || !wide || !!userId);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adjustments', tab, status, userId, limit],
    queryFn: () => getAdjustmentRequests({ userId, limit, status: ((tab === 'review' ? 'pending' : status) || undefined) as never }),
    placeholderData: (prev) => prev,
    enabled,
  });
  const items = data?.items ?? [];
  const counts = useQueries({
    queries: ['', 'pending', 'approved', 'rejected'].map((st) => ({
      queryKey: ['adjustments', 'count', tab, userId, st],
      queryFn: async () => (await getAdjustmentRequests({ userId, limit: 1, status: (st || undefined) as never })).meta?.total ?? 0,
      enabled,
    })),
  });
  const pending = useQuery({
    queryKey: ['adjustments', 'count', 'review', undefined, 'pending'],
    queryFn: async () => (await getAdjustmentRequests({ limit: 1, status: 'pending' as never })).meta?.total ?? 0,
    enabled: isReady && canReview,
  });

  if (!isReady) return <ListSkeleton />;
  if (!can('attendance_request:read'))
    return <EmptyState title="Bạn chưa có quyền xem khiếu nại công" description="Liên hệ quản trị viên để được cấp quyền." />;

  const change = (t: Tab) => {
    setTab(t);
    setStatus('');
    setLimit(PAGE);
  };
  const showName = tab !== 'mine' && wide;

  return (
    <>
      <PageHeader
        title="Khiếu nại công"
        description="Đề nghị sửa giờ vào, giờ ra."
        actionLabel={can('attendance_request:create') ? 'Gửi khiếu nại' : undefined}
        onAction={() => setOpen('new')}
      />

      {tabs.length > 1 && (
        <div
          role="tablist"
          aria-label="Nhóm khiếu nại"
          className="sticky top-0 z-10 -mx-rm-gutter mb-3 flex gap-1 overflow-x-auto border-b border-rm-line bg-rm-bg px-rm-gutter"
        >
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={t === tab}
              onClick={() => change(t)}
              className={cn(
                'h-rm-tap flex-none border-b-2 px-3 text-sm font-medium md:h-rm-control',
                t === tab ? 'border-rm-primary text-rm-primary' : 'border-transparent text-rm-muted',
              )}
            >
              {TAB_LABEL[t]}
              {t === 'review' && pending.data ? ` (${pending.data})` : ''}
            </button>
          ))}
        </div>
      )}

      {tab !== 'review' && (
        <>
          <ul className="mb-3 grid grid-cols-[repeat(4,minmax(0,1fr))] gap-2">
            {['Tổng', 'Chờ duyệt', 'Đã duyệt', 'Từ chối'].map((l, i) => (
              <li key={l} className="min-w-0 rounded-rm-xl border border-rm-edge bg-rm-surface p-2 text-center">
                <p className="truncate text-xs text-rm-muted">{l}</p>
                <p className="font-heading text-lg font-semibold">{counts[i].data ?? '–'}</p>
              </li>
            ))}
          </ul>
          <div className="mb-3">
            <Select
              id="ad-filter"
              label="Trạng thái"
              value={status}
              onChange={(v) => {
                setStatus(v);
                setLimit(PAGE);
              }}
              options={[{ value: '', label: 'Tất cả' }, ...Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label }))]}
            />
          </div>
        </>
      )}

      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState title="Không tải được khiếu nại" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />
      )}
      {data && items.length === 0 && (
        <EmptyState
          title={tab === 'review' ? 'Không có khiếu nại chờ duyệt' : status ? 'Không có khiếu nại phù hợp' : 'Chưa có khiếu nại'}
          description={
            tab === 'review'
              ? 'Mọi khiếu nại đã được xử lý.'
              : status
                ? 'Thử chọn trạng thái khác.'
                : can('attendance_request:create')
                  ? 'Gửi khiếu nại đầu tiên.'
                  : 'Chưa có khiếu nại nào trong phạm vi của bạn.'
          }
        />
      )}
      {items.length > 0 && (
        <DataList
          label="Danh sách khiếu nại công"
          rows={items}
          rowKey={(r) => r.id}
          columns={adjustmentColumns(showName)}
          card={(r) => <AdjustmentCard r={r} showName={showName} />}
          onOpen={setOpen}
        />
      )}
      {data?.meta?.next && (
        <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="mt-3 h-rm-tap w-full text-sm font-medium text-rm-primary">
          Xem thêm
        </button>
      )}

      <AdjustmentSheet key={open === 'new' ? 'new' : (open?.id ?? 'none')} target={open} onClose={() => setOpen(null)} />
    </>
  );
}
