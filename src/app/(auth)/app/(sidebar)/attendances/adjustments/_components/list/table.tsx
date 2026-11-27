'use client';

import { useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock, FileEdit, Plus, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteAdjustmentRequest, getAdjustmentRequests } from '@/actions';
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
import { getRequestTypeLabel, type AdjustmentStatus, type AttendanceAdjustmentRequest, type RequestType } from '@/types';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import AddAdjustmentDrawer from './add-drawer';
import { AdjustmentDrawer } from './detail-drawer';
import { STATUSES, TYPES, fmtDate, personName } from './format';
import { AdjustmentList } from './list';

const PAGE = 20;

const TYPE_GROUP: FilterGroup = { key: 'requestType', label: 'Loại khiếu nại', options: TYPES };
const STATUS_GROUP: FilterGroup = {
  key: 'status',
  label: 'Trạng thái',
  options: Object.entries(STATUSES).map(([value, s]) => ({ value, label: s.label })),
};

export default function AdjustmentTable() {
  const { can, isWide } = useCan();
  const meId = useAuthStore((s) => s.user?.id);
  const readWide = isWide('attendance_request:read');
  // Duyệt cần quyền sửa ở phạm vi rộng
  const canReview = isWide('attendance_request:update');

  const tabs = useMemo(() => requestTabs({ readWide, canReview, canCreate: can('attendance_request:create') }), [readWide, canReview, can]);
  const [tab, setTab] = useState<RequestTab>(tabs[0]?.value ?? 'mine');
  const showUser = tab !== 'mine';

  // Giữ chữ đang gõ trong state cục bộ, trễ 300ms mới gọi API (tránh mất dấu tiếng Việt)
  const [search, setSearch] = useState('');
  const keyword = useDebounce(search.trim(), 300);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const status = tab === 'review' ? 'pending' : filters.status;

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<AttendanceAdjustmentRequest | null>(null);

  const list = useInfiniteQuery({
    queryKey: ['adjustments', tab, keyword, status, filters.requestType],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getAdjustmentRequests({
        offset: pageParam,
        limit: PAGE,
        search: keyword || undefined,
        status: (status as AdjustmentStatus) || undefined,
        requestType: (filters.requestType as RequestType) || undefined,
        userId: tab === 'mine' ? meId : undefined,
      }),
    getNextPageParam: (last) => (last?.meta?.next ? (last.meta.offset ?? 0) + (last.meta.limit ?? PAGE) : undefined),
  });
  const rows = useMemo(() => list.data?.pages.flatMap((p) => p?.items ?? []) ?? [], [list.data]);
  const total = list.data?.pages[0]?.meta?.total ?? rows.length;
  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? null, [rows, selectedId]);

  // Thống kê chỉ cho người xem được đơn của người khác
  const statsQuery = useQuery({ queryKey: ['adjustments-stats'], queryFn: () => getAdjustmentRequests({ limit: 1000 }), enabled: readWide });
  const stats = useMemo(() => {
    const all = statsQuery.data?.items ?? [];
    const count = (s: string) => all.filter((r) => r.status === s).length;
    return [
      { label: 'Tổng khiếu nại', value: all.length, icon: FileEdit },
      { label: 'Chờ duyệt', value: count('pending'), icon: Clock },
      { label: 'Đã duyệt', value: count('approved'), icon: CheckCircle2 },
      { label: 'Từ chối', value: count('rejected'), icon: XCircle },
    ];
  }, [statsQuery.data]);

  const { mutate: remove, isPending } = useMutation({
    mutationFn: (id: number) => deleteAdjustmentRequest(id),
    onSuccess: () => {
      ['adjustments', 'adjustments-stats'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
      toast.success('Đã xóa khiếu nại');
      setDeleting(null);
      setSelectedId(null);
    },
    onError: (e) => showErrorToast(e, 'Không thể xóa khiếu nại'),
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
        <p className="text-sm text-slate-600">Không tải được danh sách khiếu nại.</p>
        <Button variant="outline" onClick={() => list.refetch()}>
          Thử lại
        </Button>
      </div>
    );
  } else if (rows.length === 0) {
    body = (
      <div className="flex flex-col items-center gap-3 rounded-block border border-slate-200/80 bg-white py-12 text-center">
        <p className="text-sm text-slate-600">
          {filtered ? 'Không có khiếu nại khớp bộ lọc.' : tab === 'review' ? 'Không có khiếu nại nào cần duyệt.' : 'Chưa có khiếu nại.'}
        </p>
        {!filtered && tab !== 'review' && can('attendance_request:create') && (
          <Button icon={<Plus size={18} />} onClick={() => setAdding(true)}>
            Tạo khiếu nại
          </Button>
        )}
      </div>
    );
  } else {
    body = (
      <>
        <AdjustmentList rows={rows} showUser={showUser} onOpen={(r) => setSelectedId(r.id)} />
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
      {readWide && !statsQuery.isError && <StatGrid items={stats} />}

      <div className="flex flex-col gap-2">
        <Tabs tabs={tabs} value={tab} onChange={setTab} label="Nhóm khiếu nại" className="px-0" />
        <div className="flex items-center gap-2">
          <SearchField value={search} onChange={setSearch} label="Tìm khiếu nại" placeholder="Tìm theo lý do, nhân sự..." />
          <div className="ml-auto flex flex-none items-center gap-2">
            <FilterDrawer groups={groups} value={filters} onChange={setFilters} />
            {can('attendance_request:create') && (
              <Button icon={<Plus size={18} />} iconOnly="mobile" onClick={() => setAdding(true)}>
                Tạo khiếu nại
              </Button>
            )}
          </div>
        </div>
      </div>

      {body}

      <AdjustmentDrawer
        request={selected}
        showUser={showUser}
        canManage={(r) => readWide || r.userId === meId}
        canReview={(r) => canReview && r.userId !== meId}
        onClose={() => setSelectedId(null)}
        onDelete={setDeleting}
      />
      <AddAdjustmentDrawer open={adding} onClose={() => setAdding(false)} />
      <ConfirmDelete
        isOpen={!!deleting}
        title="Xác nhận xóa khiếu nại"
        pending={isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove(deleting.id)}
      >
        Xóa khiếu nại{' '}
        <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">
          {deleting && `${personName(deleting.user)} · ${getRequestTypeLabel(deleting.requestType)} · ${fmtDate(deleting.workDate)}`}
        </strong>
        ?
      </ConfirmDelete>
    </div>
  );
}
