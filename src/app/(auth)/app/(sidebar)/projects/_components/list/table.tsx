'use client';

import { useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { Ban, CheckCircle2, Clock, FolderOpen, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteProject, getProjectStats, getProjects } from '@/actions';
import { Skeleton } from '@/components';
import { Button, ConfirmDelete, FilterDrawer, SearchField, StatGrid, type FilterGroup } from '@/components-remake';
import { useCan, useDebounce } from '@/hooks';
import { useAuthStore } from '@/stores';
import type { Project, ProjectStatus } from '@/types';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { ProjectDrawer } from './detail-drawer';
import ProjectFormDrawer from './form-drawer';
import { STATUSES } from './format';
import { ProjectList } from './list';

const PAGE = 20;
const STATUS_GROUP: FilterGroup = { key: 'status', label: 'Trạng thái', options: STATUSES };

export default function ProjectTable() {
  const { can, isWide } = useCan();
  const meId = useAuthStore((s) => s.user?.id);
  // Phạm vi "của tôi": chỉ thấy dự án mình phụ trách
  const userId = isWide('project:read') ? undefined : meId;

  // Giữ chữ đang gõ trong state cục bộ, trễ 300ms mới gọi API (tránh mất dấu tiếng Việt)
  const [search, setSearch] = useState('');
  const keyword = useDebounce(search.trim(), 300);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const list = useInfiniteQuery({
    queryKey: ['projects', keyword, filters.status, userId],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getProjects({ offset: pageParam, limit: PAGE, search: keyword || undefined, status: (filters.status as ProjectStatus) || undefined, userId }),
    getNextPageParam: (last) => (last?.meta?.next ? (last.meta.offset ?? 0) + (last.meta.limit ?? PAGE) : undefined),
  });
  const rows = useMemo(() => list.data?.pages.flatMap((p) => p?.items ?? []) ?? [], [list.data]);
  const total = list.data?.pages[0]?.meta?.total ?? rows.length;
  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? null, [rows, selectedId]);

  const statsQuery = useQuery({ queryKey: ['projects', 'stats-summary', userId], queryFn: () => getProjectStats({ userId }), staleTime: 30_000 });
  const stats = useMemo(
    () => [
      { label: 'Tổng số dự án', value: statsQuery.data?.total ?? 0, icon: FolderOpen },
      { label: 'Đang thực hiện', value: statsQuery.data?.inProgress ?? 0, icon: Clock },
      { label: 'Hoàn thành', value: statsQuery.data?.completed ?? 0, icon: CheckCircle2 },
      { label: 'Đã hủy', value: statsQuery.data?.cancelled ?? 0, icon: Ban },
    ],
    [statsQuery.data],
  );

  const { mutate: remove, isPending } = useMutation({
    mutationFn: (id: number) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Đã xóa dự án');
      setDeleting(null);
      setSelectedId(null);
    },
    onError: (e) => showErrorToast(e, 'Không thể xóa dự án'),
  });

  const filtered = !!keyword || !!filters.status;

  let body;
  if (list.isLoading) {
    body = (
      <div className="flex flex-col gap-2" aria-busy="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-block" />
        ))}
      </div>
    );
  } else if (list.isError) {
    body = (
      <div className="flex flex-col items-center gap-3 rounded-block border border-slate-200/80 bg-white py-12 text-center">
        <p className="text-sm text-slate-600">Không tải được danh sách dự án.</p>
        <Button variant="outline" onClick={() => list.refetch()}>
          Thử lại
        </Button>
      </div>
    );
  } else if (rows.length === 0) {
    body = (
      <div className="flex flex-col items-center gap-3 rounded-block border border-slate-200/80 bg-white py-12 text-center">
        <p className="text-sm text-slate-600">{filtered ? 'Không có dự án khớp bộ lọc.' : 'Chưa có dự án.'}</p>
        {!filtered && can('project:create') && (
          <Button icon={<Plus size={18} />} onClick={() => setAdding(true)}>
            Thêm dự án
          </Button>
        )}
      </div>
    );
  } else {
    body = (
      <>
        <ProjectList rows={rows} onOpen={(r) => setSelectedId(r.id)} />
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
        <SearchField value={search} onChange={setSearch} label="Tìm dự án" placeholder="Tìm theo tên, mã dự án, địa chỉ..." />
        <div className="ml-auto flex flex-none items-center gap-2">
          <FilterDrawer groups={[STATUS_GROUP]} value={filters} onChange={setFilters} />
          {can('project:create') && (
            <Button icon={<Plus size={18} />} iconOnly="mobile" onClick={() => setAdding(true)}>
              Thêm dự án
            </Button>
          )}
        </div>
      </div>

      {body}

      <ProjectDrawer
        project={selected}
        canEdit={can('project:update')}
        canDelete={can('project:delete')}
        onClose={() => setSelectedId(null)}
        onDelete={setDeleting}
      />
      <ProjectFormDrawer isOpen={adding} onClose={() => setAdding(false)} />
      <ConfirmDelete
        isOpen={!!deleting}
        title="Xác nhận xóa dự án"
        pending={isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove(deleting.id)}
      >
        Xóa dự án <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{deleting?.name}</strong>?
      </ConfirmDelete>
    </div>
  );
}
