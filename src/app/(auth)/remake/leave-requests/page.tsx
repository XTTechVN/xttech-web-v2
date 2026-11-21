'use client';

import { useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { getEmployees, getLeaveRequests } from '@/actions';
import { useCan } from '@/hooks';
import type { LeaveRequest } from '@/types';
import { cn } from '@/utils';
import { PageHeader } from '../_components/page-header';
import { Select } from '../_components/select';
import { EmptyState, ErrorState, ListSkeleton } from '../_components/state-views';
import { DataList } from '../_components/data-list';
import { LeaveCard, leaveColumns } from './_components/leave-columns';
import { LeaveSheet, STATUS } from './_components/leave-sheet';

const PAGE = 20;
type Tab = 'review' | 'all' | 'mine';
const TAB_LABEL: Record<Tab, string> = { review: 'Cần duyệt', all: 'Tất cả', mine: 'Của tôi' };

// Đơn nghỉ phép theo quyền: phạm vi own → chỉ đơn của mình; dept/org → thêm "Tất cả" + lọc nhân viên; có quyền duyệt → tab "Cần duyệt" mở trước.
export default function RemakeLeaveRequestsPage() {
  const { can, scopeOf, me, isReady } = useCan();
  const wide = can('leave_request:read') && scopeOf('leave_request:read') !== 'own';
  const canReview = can('leave_request:review');
  const tabs: Tab[] = wide ? [...(canReview ? (['review'] as const) : []), 'all', 'mine'] : [];
  const [picked, setTab] = useState<Tab | null>(null);
  const tab: Tab = wide ? (picked && tabs.includes(picked) ? picked : tabs[0]) : 'mine';
  const [status, setStatus] = useState('');
  const [person, setPerson] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState<LeaveRequest | 'new' | null>(null);

  const userId = tab === 'mine' ? (wide ? me?.user.id : undefined) : person || undefined;
  const scopeParams = { userId };
  const list = useQuery({
    queryKey: ['leave-requests', tab, status, userId, limit],
    queryFn: () => getLeaveRequests({ ...scopeParams, limit, status: (tab === 'review' ? 'pending' : status) || undefined }),
    enabled: isReady && can('leave_request:read'),
    placeholderData: (prev) => prev,
  });
  const counts = useQueries({
    queries: ['pending', 'approved', 'rejected'].map((st) => ({
      queryKey: ['leave-requests', 'count', tab, userId, st],
      queryFn: async () => (await getLeaveRequests({ ...scopeParams, limit: 1, status: st })).meta.total,
      enabled: isReady && can('leave_request:read'),
    })),
  });
  const people = useQuery({ queryKey: ['employees', '', 100], queryFn: () => getEmployees({ limit: 100, offset: 0 }), enabled: wide });

  if (!isReady) return <ListSkeleton />;
  if (!can('leave_request:read')) return <EmptyState title="Bạn chưa có quyền xem đơn nghỉ" description="Liên hệ quản trị viên để được cấp quyền." />;

  const items = list.data?.items ?? [];
  const change = (t: Tab) => {
    setTab(t);
    setStatus('');
    setLimit(PAGE);
  };
  const showName = tab !== 'mine';

  return (
    <>
      <PageHeader
        title={wide ? 'Nghỉ phép' : 'Đơn nghỉ của tôi'}
        description={wide ? 'Đơn xin nghỉ và kết quả duyệt.' : 'Đơn xin nghỉ của bạn và kết quả duyệt.'}
        actionLabel={can('leave_request:create') ? 'Tạo đơn nghỉ' : undefined}
        onAction={() => setOpen('new')}
      />

      {wide && (
        <div
          role="tablist"
          aria-label="Nhóm đơn nghỉ"
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
              {t === 'review' && counts[0].data ? ` (${counts[0].data})` : ''}
            </button>
          ))}
        </div>
      )}

      {tab !== 'review' && (
        <ul className="mb-3 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2">
          {['Chờ duyệt', 'Đã duyệt', 'Từ chối'].map((l, i) => (
            <li key={l} className="min-w-0 rounded-rm-xl border border-rm-edge bg-rm-surface p-2 text-center">
              <p className="truncate text-xs text-rm-muted">{l}</p>
              <p className="font-heading text-lg font-semibold">{counts[i].data ?? '–'}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mb-3 flex flex-col gap-2">
        {tab !== 'review' && (
          <Select
            id="lv-filter"
            label="Trạng thái"
            value={status}
            onChange={(v) => {
              setStatus(v);
              setLimit(PAGE);
            }}
            options={[{ value: '', label: 'Mọi trạng thái' }, ...Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label }))]}
          />
        )}
        {wide && tab !== 'mine' && (
          <Select
            id="lv-person"
            label="Nhân viên"
            value={person}
            onChange={(v) => {
              setPerson(v);
              setLimit(PAGE);
            }}
            options={[
              { value: '', label: 'Tất cả nhân viên' },
              ...(people.data?.items ?? []).map((u) => ({ value: u.id, label: u.fullName || u.username })),
            ]}
          />
        )}
      </div>

      {list.isLoading && <ListSkeleton />}
      {list.isError && (
        <ErrorState
          title="Không tải được đơn nghỉ"
          description="Kiểm tra kết nối rồi thử lại."
          actionLabel="Thử lại"
          onAction={() => list.refetch()}
        />
      )}
      {list.data && items.length === 0 && (
        <EmptyState
          title={tab === 'review' ? 'Không có đơn chờ duyệt' : status || person ? 'Không có đơn phù hợp' : 'Chưa có đơn nghỉ'}
          description={
            tab === 'review'
              ? 'Mọi đơn đã được xử lý.'
              : status || person
                ? 'Thử đổi bộ lọc.'
                : can('leave_request:create')
                  ? 'Bấm "Tạo đơn nghỉ" để gửi đơn đầu tiên.'
                  : 'Chưa có đơn nào trong phạm vi của bạn.'
          }
        />
      )}
      {items.length > 0 && (
        <DataList
          label="Danh sách đơn nghỉ"
          rows={items}
          rowKey={(r) => r.id}
          columns={leaveColumns(showName)}
          card={(r) => <LeaveCard r={r} showName={showName} />}
          onOpen={setOpen}
        />
      )}
      {list.data?.meta?.next && (
        <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="mt-3 h-rm-tap w-full text-sm font-medium text-rm-primary">
          Xem thêm ({items.length}/{list.data.meta.total})
        </button>
      )}

      <LeaveSheet key={open === 'new' ? 'new' : (open?.id ?? 'none')} target={open} onClose={() => setOpen(null)} />
    </>
  );
}
