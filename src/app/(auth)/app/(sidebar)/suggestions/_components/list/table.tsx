'use client';

import { useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock, Lightbulb, Plus, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteSuggestion, getSuggestions } from '@/actions';
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
import type { Suggestion } from '@/types';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { SuggestionDrawer } from './detail-drawer';
import SuggestionFormDrawer from './form-drawer';
import { STATUSES, TYPES } from './format';
import { SuggestionList } from './list';

const PAGE = 20;

const TYPE_GROUP: FilterGroup = { key: 'type', label: 'Loại đề xuất', options: TYPES };
const STATUS_GROUP: FilterGroup = {
  key: 'status',
  label: 'Trạng thái',
  options: Object.entries(STATUSES).map(([value, s]) => ({ value, label: s.label })),
};

type Status = 'pending' | 'approve' | 'reject';

export default function SuggestionTable() {
  const { can, isWide } = useCan();
  const meId = useAuthStore((s) => s.user?.id);
  const readWide = isWide('suggestion:read');
  const canReview = can('suggestion:review');

  const tabs = useMemo(() => requestTabs({ readWide, canReview, canCreate: can('suggestion:create') }), [readWide, canReview, can]);
  const [tab, setTab] = useState<RequestTab>(tabs[0]?.value ?? 'mine');
  const showUser = tab !== 'mine';

  // Giữ chữ đang gõ trong state cục bộ, trễ 300ms mới gọi API (tránh mất dấu tiếng Việt)
  const [search, setSearch] = useState('');
  const keyword = useDebounce(search.trim(), 300);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const status = (tab === 'review' ? 'pending' : filters.status) as Status | undefined;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Suggestion | null>(null);

  const list = useInfiniteQuery({
    queryKey: ['suggestions', tab, keyword, status, filters.type],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getSuggestions({
        offset: pageParam,
        limit: PAGE,
        search: keyword || undefined,
        status: status || undefined,
        type: filters.type || undefined,
        userId: tab === 'mine' || !readWide ? meId : undefined,
      }),
    getNextPageParam: (last) => (last?.meta?.next ? (last.meta.offset ?? 0) + (last.meta.limit ?? PAGE) : undefined),
  });
  const rows = useMemo(() => list.data?.pages.flatMap((p) => p?.items ?? []) ?? [], [list.data]);
  const total = list.data?.pages[0]?.meta?.total ?? rows.length;
  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? null, [rows, selectedId]);

  // Thống kê chỉ cho người có quyền duyệt
  const statsQuery = useQuery({ queryKey: ['suggestions-stats'], queryFn: () => getSuggestions({ limit: 1000 }), enabled: canReview });
  const stats = useMemo(() => {
    const all = statsQuery.data?.items ?? [];
    const count = (s: Status) => all.filter((r) => r.status === s).length;
    return [
      { label: 'Tổng đề xuất', value: all.length, icon: Lightbulb },
      { label: 'Chờ duyệt', value: count('pending'), icon: Clock },
      { label: 'Đã xử lý', value: count('approve'), icon: CheckCircle2 },
      { label: 'Từ chối', value: count('reject'), icon: XCircle },
    ];
  }, [statsQuery.data]);

  const { mutate: remove, isPending } = useMutation({
    mutationFn: (id: string) => deleteSuggestion(id),
    onSuccess: () => {
      ['suggestions', 'suggestions-stats'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
      toast.success('Đã xóa đề xuất');
      setDeleting(null);
      setSelectedId(null);
    },
    onError: (e) => showErrorToast(e, 'Không thể xóa đề xuất'),
  });

  const filtered = !!keyword || Object.values(filters).some(Boolean);
  const groups = tab === 'review' ? [TYPE_GROUP] : [STATUS_GROUP, TYPE_GROUP];
  const owner = (s: Suggestion) => s.userId === meId;

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
        <p className="text-sm text-slate-600">Không tải được danh sách đề xuất.</p>
        <Button variant="outline" onClick={() => list.refetch()}>
          Thử lại
        </Button>
      </div>
    );
  } else if (rows.length === 0) {
    body = (
      <div className="flex flex-col items-center gap-3 rounded-block border border-slate-200/80 bg-white py-12 text-center">
        <p className="text-sm text-slate-600">
          {filtered ? 'Không có đề xuất khớp bộ lọc.' : tab === 'review' ? 'Không có đề xuất nào cần duyệt.' : 'Chưa có đề xuất.'}
        </p>
        {!filtered && tab !== 'review' && can('suggestion:create') && (
          <Button icon={<Plus size={18} />} onClick={() => setAdding(true)}>
            Gửi đề xuất
          </Button>
        )}
      </div>
    );
  } else {
    body = (
      <>
        <SuggestionList rows={rows} showUser={showUser} onOpen={(r) => setSelectedId(r.id)} />
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
        <Tabs tabs={tabs} value={tab} onChange={setTab} label="Nhóm đề xuất" className="px-0" />
        <div className="flex items-center gap-2">
          <SearchField value={search} onChange={setSearch} label="Tìm đề xuất" placeholder="Tìm theo chủ đề, nội dung..." />
          <div className="ml-auto flex flex-none items-center gap-2">
            <FilterDrawer groups={groups} value={filters} onChange={setFilters} />
            {can('suggestion:create') && (
              <Button icon={<Plus size={18} />} iconOnly="mobile" onClick={() => setAdding(true)}>
                Gửi đề xuất
              </Button>
            )}
          </div>
        </div>
      </div>

      {body}

      <SuggestionDrawer
        suggestion={selected}
        showUser={showUser}
        canEdit={(s) => canReview || owner(s)}
        canDelete={(s) => can('suggestion:delete') && (readWide || owner(s))}
        canReview={(s) => canReview && !owner(s)}
        onClose={() => setSelectedId(null)}
        onDelete={setDeleting}
      />
      <SuggestionFormDrawer isOpen={adding} onClose={() => setAdding(false)} />
      <ConfirmDelete
        isOpen={!!deleting}
        title="Xác nhận xóa đề xuất"
        pending={isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove(deleting.id)}
      >
        Xóa đề xuất <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{deleting?.title}</strong>?
      </ConfirmDelete>
    </div>
  );
}
