'use client';

import { useCallback, useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { CalendarDays, CheckCircle2, Clock, Plus, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteLeaveRequest, getLeaveRequests, getWorkShifts } from '@/actions';
import { Skeleton } from '@/components';
import {
  Button,
  ConfirmDelete,
  FilterDrawer,
  SearchField,
  StatGrid,
  Tabs,
  requestTabs,
  type FilterGroup,
  type RequestTab,
} from '@/components-remake';
import { useCan, useDebounce } from '@/hooks';
import { useAuthStore } from '@/stores';
import { LeaveRequestStatus, type LeaveRequest } from '@/types';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { LeaveDrawer } from './detail-drawer';
import LeaveFormDrawer from './form-drawer';
import { LEAVE_TYPES, STATUSES, fmtRange, personName } from './format';
import { LeaveList } from './list';

const PAGE = 20;

const TYPE_GROUP: FilterGroup = { key: 'leaveType', label: 'Loại nghỉ', options: LEAVE_TYPES };
const STATUS_GROUP: FilterGroup = {
  key: 'status',
  label: 'Trạng thái',
  options: Object.entries(STATUSES).map(([value, s]) => ({ value, label: s.label })),
};

interface WorkShift {
  id: number | string;
  name: string;
}

export default function LeaveTable() {
  const { can, isWide } = useCan();
  const meId = useAuthStore((s) => s.user?.id);
  const readWide = isWide('leave_request:read');
  const canReview = can('leave_request:review');

  const tabs = useMemo(() => requestTabs({ readWide, canReview, canCreate: can('leave_request:create') }), [readWide, canReview, can]);
  const [tab, setTab] = useState<RequestTab>(tabs[0]?.value ?? 'mine');
  const showUser = tab !== 'mine';

  // Giữ chữ đang gõ trong state cục bộ, trễ 300ms mới gọi API (tránh mất dấu tiếng Việt)
  const [search, setSearch] = useState('');
  const keyword = useDebounce(search.trim(), 300);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const status = tab === 'review' ? LeaveRequestStatus.PENDING : filters.status;

  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<LeaveRequest | null>(null);

  const list = useInfiniteQuery({
    queryKey: ['leave-requests', tab, keyword, status, filters.leaveType],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getLeaveRequests({
        offset: pageParam,
        limit: PAGE,
        search: keyword || undefined,
        status: status || undefined,
        leaveType: filters.leaveType || undefined,
        userId: tab === 'mine' ? String(meId) : undefined,
      }),
    getNextPageParam: (last) => (last?.meta?.next ? (last.meta.offset ?? 0) + (last.meta.limit ?? PAGE) : undefined),
  });
  const rows = useMemo(() => list.data?.pages.flatMap((p) => p?.items ?? []) ?? [], [list.data]);
  const total = list.data?.pages[0]?.meta?.total ?? rows.length;
  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? null, [rows, selectedId]);

  const shifts = useQuery({
    queryKey: ['work-shifts', 'leave-list'],
    queryFn: () => getWorkShifts({ limit: 100 }),
    enabled: can('work_shift:read'),
  });
  const shiftName = useCallback(
    (id: string | null) => {
      const items = (Array.isArray(shifts.data) ? shifts.data : (shifts.data?.items ?? [])) as WorkShift[];
      return items.find((s) => String(s.id) === String(id))?.name ?? 'Theo ca';
    },
    [shifts.data],
  );

  // Thống kê chỉ cho người có quyền duyệt
  const statsQuery = useQuery({ queryKey: ['leave-requests-stats'], queryFn: () => getLeaveRequests({ limit: 1000 }), enabled: canReview });
  const stats = useMemo(() => {
    const all = statsQuery.data?.items ?? [];
    const count = (s: LeaveRequestStatus) => all.filter((r) => r.status === s).length;
    return [
      { label: 'Tổng số đơn', value: all.length, icon: CalendarDays },
      { label: 'Chờ duyệt', value: count(LeaveRequestStatus.PENDING), icon: Clock },
      { label: 'Đã duyệt', value: count(LeaveRequestStatus.APPROVED), icon: CheckCircle2 },
      { label: 'Từ chối', value: count(LeaveRequestStatus.REJECTED), icon: XCircle },
    ];
  }, [statsQuery.data]);

  const { mutate: remove, isPending } = useMutation({
    mutationFn: (id: string | number) => deleteLeaveRequest(String(id)),
    onSuccess: () => {
      ['leave-requests', 'leave-requests-stats'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
      toast.success('Đã xóa đơn nghỉ phép');
      setDeleting(null);
      setSelectedId(null);
    },
    onError: (e) => showErrorToast(e, 'Không thể xóa đơn nghỉ phép'),
  });

  const filtered = !!keyword || Object.values(filters).some(Boolean);
  const groups = tab === 'review' ? [TYPE_GROUP] : [STATUS_GROUP, TYPE_GROUP];

  let body;
  if (list.isLoading) {
    body = (
      <div className="flex flex-col gap-2" aria-busy="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-block" />
        ))}
      </div>
    );
  } else if (list.isError) {
    body = (
      <div className="flex flex-col items-center gap-3 rounded-block border border-slate-200/80 bg-white py-12 text-center">
        <p className="text-sm text-slate-600">Không tải được danh sách đơn nghỉ phép.</p>
        <Button variant="outline" onClick={() => list.refetch()}>
          Thử lại
        </Button>
      </div>
    );
  } else if (rows.length === 0) {
    body = (
      <div className="flex flex-col items-center gap-3 rounded-block border border-slate-200/80 bg-white py-12 text-center">
        <p className="text-sm text-slate-600">
          {filtered ? 'Không có đơn khớp bộ lọc.' : tab === 'review' ? 'Không có đơn nào cần duyệt.' : 'Chưa có đơn nghỉ phép.'}
        </p>
        {!filtered && tab !== 'review' && can('leave_request:create') && (
          <Button icon={<Plus size={18} />} onClick={() => setAdding(true)}>
            Tạo đơn nghỉ phép
          </Button>
        )}
      </div>
    );
  } else {
    body = (
      <>
        <LeaveList rows={rows} showUser={showUser} shiftName={shiftName} onOpen={(r) => setSelectedId(r.id)} />
        {list.hasNextPage && (
          <div className="flex flex-col items-center gap-1 pt-1">
            <Button variant="outline" loading={list.isFetchingNextPage} onClick={() => list.fetchNextPage()}>
              {`Xem thêm (${total - rows.length})`}
            </Button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {canReview && !statsQuery.isError && <StatGrid items={stats} />}

      <div className="flex flex-col gap-2">
        <Tabs tabs={tabs} value={tab} onChange={setTab} label="Nhóm đơn" className="px-0" />
        <div className="flex items-center gap-2">
          <SearchField value={search} onChange={setSearch} label="Tìm đơn nghỉ phép" placeholder="Tìm theo lý do, nhân sự..." />
          <div className="ml-auto flex flex-none items-center gap-2">
            <FilterDrawer groups={groups} value={filters} onChange={setFilters} />
            {can('leave_request:create') && (
              <Button icon={<Plus size={18} />} iconOnly="mobile" onClick={() => setAdding(true)}>
                Tạo đơn nghỉ phép
              </Button>
            )}
          </div>
        </div>
      </div>

      {body}

      <LeaveDrawer request={selected} showUser={showUser} shiftName={shiftName} onClose={() => setSelectedId(null)} onDelete={setDeleting} />
      <LeaveFormDrawer isOpen={adding} onClose={() => setAdding(false)} />
      <ConfirmDelete
        isOpen={!!deleting}
        title="Xác nhận xóa đơn nghỉ phép"
        pending={isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove(deleting.id)}
      >
        Xóa đơn nghỉ phép{' '}
        <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">
          {deleting && `${personName(deleting.user)} (${fmtRange(deleting)})`}
        </strong>
        ?
      </ConfirmDelete>
    </div>
  );
}
