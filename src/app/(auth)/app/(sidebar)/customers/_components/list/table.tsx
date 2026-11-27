'use client';

import { useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { Award, FileSpreadsheet, Plus, Sprout, UserCheck, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteCustomer, getCustomers, getUsers } from '@/actions';
import { Skeleton } from '@/components';
import { Button, ConfirmDelete, FilterDrawer, SearchField, StatGrid, type FilterGroup } from '@/components-remake';
import { useCan, useDebounce } from '@/hooks';
import { useAuthStore } from '@/stores';
import type { Customer } from '@/types';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { CustomerDrawer } from './detail-drawer';
import ExportDrawer from './export-drawer';
import CustomerFormDrawer from './form-drawer';
import { TYPES } from './format';
import { CustomerList } from './list';

const PAGE = 20;
const TYPE_GROUP: FilterGroup = { key: 'type', label: 'Phân loại', options: TYPES };

export default function CustomerTable() {
  const { can, isWide } = useCan();
  const meId = useAuthStore((s) => s.user?.id);
  const wide = isWide('customer:read');

  // Giữ chữ đang gõ trong state cục bộ, trễ 300ms mới gọi API (tránh mất dấu tiếng Việt)
  const [search, setSearch] = useState('');
  const keyword = useDebounce(search.trim(), 300);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState<Customer | null>(null);

  // Người chỉ có phạm vi "của tôi" luôn bị khóa vào khách của mình
  const staffId = wide ? filters.staff || undefined : meId;

  const staff = useQuery({
    queryKey: ['users', 'customer-staff'],
    queryFn: () => getUsers({ limit: 1000, permission: 'customer:update' }),
    enabled: wide && can('user:read'),
    staleTime: 5 * 60 * 1000,
  });

  const list = useInfiniteQuery({
    queryKey: ['customers', keyword, filters.type, staffId],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getCustomers({ offset: pageParam, limit: PAGE, search: keyword || undefined, type: filters.type || undefined, staffId }),
    getNextPageParam: (last) => (last?.meta?.next ? (last.meta.offset ?? 0) + (last.meta.limit ?? PAGE) : undefined),
  });
  const rows = useMemo(() => list.data?.pages.flatMap((p) => p?.items ?? []) ?? [], [list.data]);
  const total = list.data?.pages[0]?.meta?.total ?? rows.length;
  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? null, [rows, selectedId]);

  const statsQuery = useQuery({
    queryKey: ['customers', 'stats', staffId],
    queryFn: () => getCustomers({ limit: 9999, staffId }),
  });
  const stats = useMemo(() => {
    const all = statsQuery.data?.items ?? [];
    const count = (t: string) => all.filter((c) => c.type === t).length;
    return [
      { label: 'Tổng khách hàng', value: all.length, icon: Users },
      { label: 'Đang hoạt động', value: count('active'), icon: UserCheck },
      { label: 'Tiềm năng', value: count('potential'), icon: Sprout },
      { label: 'VIP', value: count('vip'), icon: Award },
    ];
  }, [statsQuery.data]);

  const { mutate: remove, isPending } = useMutation({
    mutationFn: (id: number) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Đã xóa khách hàng');
      setDeleting(null);
      setSelectedId(null);
    },
    onError: (e) => showErrorToast(e, 'Không thể xóa khách hàng'),
  });

  const groups: FilterGroup[] = wide
    ? [
        TYPE_GROUP,
        {
          key: 'staff',
          label: 'Nhân viên phụ trách',
          options: (staff.data?.items ?? []).map((u) => ({ value: u.id, label: u.fullName || u.username || u.email })),
        },
      ]
    : [TYPE_GROUP];
  const filtered = !!keyword || Object.values(filters).some(Boolean);

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
        <p className="text-sm text-slate-600">Không tải được danh sách khách hàng.</p>
        <Button variant="outline" onClick={() => list.refetch()}>
          Thử lại
        </Button>
      </div>
    );
  } else if (rows.length === 0) {
    body = (
      <div className="flex flex-col items-center gap-3 rounded-block border border-slate-200/80 bg-white py-12 text-center">
        <p className="text-sm text-slate-600">{filtered ? 'Không có khách hàng khớp bộ lọc.' : 'Chưa có khách hàng.'}</p>
        {!filtered && can('customer:create') && (
          <Button icon={<Plus size={18} />} onClick={() => setAdding(true)}>
            Thêm khách hàng
          </Button>
        )}
      </div>
    );
  } else {
    body = (
      <>
        <CustomerList rows={rows} showStaff={wide} onOpen={(r) => setSelectedId(r.id)} />
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
      {!statsQuery.isError && <StatGrid items={stats} />}

      <div className="flex items-center gap-2">
        <SearchField value={search} onChange={setSearch} label="Tìm khách hàng" placeholder="Tìm theo tên, SĐT, mã, email..." />
        <div className="ml-auto flex flex-none items-center gap-2">
          <FilterDrawer groups={groups} value={filters} onChange={setFilters} />
          {can('customer:export') && (
            <Button variant="outline" icon={<FileSpreadsheet size={18} />} iconOnly="mobile" onClick={() => setExporting(true)}>
              Xuất Excel
            </Button>
          )}
          {can('customer:create') && (
            <Button icon={<Plus size={18} />} iconOnly="mobile" onClick={() => setAdding(true)}>
              Thêm khách hàng
            </Button>
          )}
        </div>
      </div>

      {body}

      <CustomerDrawer
        customer={selected}
        canEdit={!!selected?._can?.update}
        canDelete={!!selected?._can?.delete}
        onClose={() => setSelectedId(null)}
        onDelete={setDeleting}
      />
      <CustomerFormDrawer isOpen={adding} onClose={() => setAdding(false)} />
      <ExportDrawer isOpen={exporting} onClose={() => setExporting(false)} />
      <ConfirmDelete
        isOpen={!!deleting}
        title="Xác nhận xóa khách hàng"
        pending={isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove(deleting.id)}
      >
        Xóa khách hàng <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{deleting?.name}</strong>?
      </ConfirmDelete>
    </div>
  );
}
