'use client';

import { useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, ClipboardList, Clock, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteStaffTask, getDepartments, getEmployees, getProjectWarranty, getStaffTaskSummary, getStaffTasks } from '@/actions';
import { CompleteVisitModal, Skeleton } from '@/components';
import { TASK_CATEGORY_OPTIONS, TASK_DEADLINE_STATE_OPTIONS, TASK_PRIORITY_OPTIONS, TASK_SOURCE_TYPE_OPTIONS, TASK_STATUS_OPTIONS } from '@/config';
import { Button, ConfirmDelete, FilterDrawer, SearchField, StatGrid, Tabs, type FilterGroup } from '@/components-remake';
import { useCan, useDebounce } from '@/hooks';
import { useAuthStore } from '@/stores';
import type {
  Department,
  StaffTask,
  StaffTaskCategory,
  StaffTaskDeadlineState,
  StaffTaskPriority,
  StaffTaskScope,
  StaffTaskSourceType,
  StaffTaskStatus,
  WarrantyVisit,
} from '@/types';
import { showErrorToast } from '@/utils';
import { TaskDrawer } from './detail-drawer';
import TaskFormDrawer from './form-drawer';
import { refreshTasks } from './format';
import { TaskList } from './list';

const PAGE = 20;
const STALE = 5 * 60 * 1000;

const BASE_GROUPS: FilterGroup[] = [
  { key: 'status', label: 'Trạng thái', options: TASK_STATUS_OPTIONS },
  { key: 'deadline', label: 'Tình trạng hạn', options: TASK_DEADLINE_STATE_OPTIONS },
  { key: 'priority', label: 'Mức ưu tiên', options: TASK_PRIORITY_OPTIONS },
  { key: 'category', label: 'Phân loại', options: TASK_CATEGORY_OPTIONS },
  { key: 'sourceType', label: 'Nguồn việc', options: TASK_SOURCE_TYPE_OPTIONS },
];

const TAB_LABEL: Record<StaffTaskScope, string> = { all: 'Quản lý chung', mine: 'Việc của tôi' };

export default function TaskTable() {
  const { can, isWide } = useCan();
  const meId = useAuthStore((s) => s.user?.id);
  const canManage = isWide('staff_task:update');
  const canUpdate = can('staff_task:update');

  const tabs = useMemo(
    () => (canManage ? (['all', 'mine'] as const) : (['mine'] as const)).map((value) => ({ value, label: TAB_LABEL[value] })),
    [canManage],
  );
  const [scope, setScope] = useState<StaffTaskScope>(canManage ? 'all' : 'mine');
  const showUser = canManage && scope === 'all';

  // Giữ chữ đang gõ trong state cục bộ, trễ 300ms mới gọi API (tránh mất dấu tiếng Việt)
  const [search, setSearch] = useState('');
  const keyword = useDebounce(search.trim(), 300);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<StaffTask | null>(null);
  const [warranty, setWarranty] = useState<{ projectId: number; visit: WarrantyVisit } | null>(null);

  // Lọc theo phòng ban / nhân sự chỉ có ở chế độ quản lý
  const employees = useQuery({
    queryKey: ['employees', 'task-assignees'],
    queryFn: () => getEmployees({ limit: 200 }),
    enabled: showUser && can('user:read'),
    staleTime: STALE,
  });
  const departments = useQuery({
    queryKey: ['departments', 'task-filter'],
    queryFn: () => getDepartments({ limit: 100 }),
    enabled: showUser && can('department:read'),
    staleTime: STALE,
  });
  const deptList = useMemo<Department[]>(
    () => (Array.isArray(departments.data) ? departments.data : (departments.data?.items ?? [])),
    [departments.data],
  );

  const groups = useMemo<FilterGroup[]>(
    () =>
      showUser
        ? [
            ...BASE_GROUPS,
            ...(can('department:read')
              ? [{ key: 'department', label: 'Phòng ban', options: deptList.map((d) => ({ value: String(d.id), label: d.name })) }]
              : []),
            ...(can('user:read')
              ? [{ key: 'assignee', label: 'Nhân sự', options: (employees.data?.items ?? []).map((e) => ({ value: e.id, label: e.fullName })) }]
              : []),
          ]
        : BASE_GROUPS,
    [showUser, can, deptList, employees.data],
  );

  const assigneeId = showUser ? filters.assignee || undefined : undefined;
  const departmentId = showUser && filters.department ? Number(filters.department) : undefined;

  const list = useInfiniteQuery({
    queryKey: ['staff-tasks', scope, keyword, filters],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getStaffTasks({
        scope,
        offset: pageParam,
        limit: PAGE,
        search: keyword || undefined,
        status: (filters.status as StaffTaskStatus) || undefined,
        deadlineState: (filters.deadline as StaffTaskDeadlineState) || undefined,
        priority: (filters.priority as StaffTaskPriority) || undefined,
        category: (filters.category as StaffTaskCategory) || undefined,
        sourceType: (filters.sourceType as StaffTaskSourceType) || undefined,
        assigneeId,
        departmentId,
      }),
    getNextPageParam: (last) => (last?.meta?.next ? (last.meta.offset ?? 0) + (last.meta.limit ?? PAGE) : undefined),
  });
  const rows = useMemo(() => list.data?.pages.flatMap((p) => p?.items ?? []) ?? [], [list.data]);
  const total = list.data?.pages[0]?.meta?.total ?? rows.length;
  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? null, [rows, selectedId]);

  const summary = useQuery({
    queryKey: ['staff-tasks-summary', scope, assigneeId, departmentId],
    queryFn: () => getStaffTaskSummary({ scope, assigneeId, departmentId }),
  });
  const stats = useMemo(() => {
    const s = summary.data;
    return [
      { label: 'Cần thực hiện', value: s?.openCount ?? 0, icon: ClipboardList },
      { label: 'Sắp hết hạn', value: s?.dueSoonCount ?? 0, icon: Clock },
      { label: 'Quá hạn', value: s?.overdueCount ?? 0, icon: AlertTriangle },
      { label: 'Đã hoàn thành', value: (s?.completedOnTimeCount ?? 0) + (s?.completedLateCount ?? 0), icon: CheckCircle2 },
    ];
  }, [summary.data]);

  const { mutate: remove, isPending } = useMutation({
    mutationFn: (id: number) => deleteStaffTask(id),
    onSuccess: () => {
      refreshTasks();
      toast.success('Đã xóa công việc');
      setDeleting(null);
      setSelectedId(null);
    },
    onError: (e) => showErrorToast(e, 'Không xóa được công việc'),
  });

  const openWarranty = async (t: StaffTask) => {
    if (!t.projectId || !t.warrantyVisitId) return;
    try {
      const visit = (await getProjectWarranty(t.projectId)).visits.find((v) => v.id === t.warrantyVisitId);
      if (!visit) return void toast.error('Không tìm thấy phiếu bảo hành tương ứng');
      setSelectedId(null);
      setWarranty({ projectId: t.projectId, visit });
    } catch (e) {
      showErrorToast(e, 'Không tải được thông tin phiếu bảo hành');
    }
  };

  const filtered = !!keyword || Object.values(filters).some(Boolean);
  // Giao việc cho người khác cần quyền tạo phạm vi phòng ban/toàn doanh nghiệp (API từ chối nếu chỉ có phạm vi "của mình")
  const canCreate = isWide('staff_task:create');
  const canAct = (t: StaffTask) => canUpdate && (canManage || t.assigneeId === meId);

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
        <p className="text-sm text-slate-600">Không tải được danh sách công việc.</p>
        <Button variant="outline" onClick={() => list.refetch()}>
          Thử lại
        </Button>
      </div>
    );
  } else if (rows.length === 0) {
    body = (
      <div className="flex flex-col items-center gap-3 rounded-block border border-slate-200/80 bg-white py-12 text-center">
        <p className="text-sm text-slate-600">{filtered ? 'Không có công việc khớp bộ lọc.' : 'Chưa có công việc.'}</p>
        {!filtered && canCreate && (
          <Button icon={<Plus size={18} />} onClick={() => setAdding(true)}>
            Giao việc
          </Button>
        )}
      </div>
    );
  } else {
    body = (
      <>
        <TaskList rows={rows} showUser={showUser} onOpen={(t) => setSelectedId(t.id)} />
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
      {!summary.isError && <StatGrid items={stats} />}

      <div className="flex flex-col gap-2">
        {tabs.length > 1 && (
          <Tabs
            tabs={tabs}
            value={scope}
            onChange={(v) => {
              setScope(v);
              setFilters({});
            }}
            label="Nhóm công việc"
            className="px-0"
          />
        )}
        <div className="flex items-center gap-2">
          <SearchField value={search} onChange={setSearch} label="Tìm công việc" placeholder="Tìm mã, tiêu đề, nhân sự..." />
          <div className="ml-auto flex flex-none items-center gap-2">
            <FilterDrawer groups={groups} value={filters} onChange={setFilters} />
            {canCreate && (
              <Button icon={<Plus size={18} />} iconOnly="mobile" onClick={() => setAdding(true)}>
                Giao việc
              </Button>
            )}
          </div>
        </div>
      </div>

      {body}

      <TaskDrawer
        task={selected}
        canEdit={canManage}
        canDelete={canManage && can('staff_task:delete')}
        canAct={canAct}
        onClose={() => setSelectedId(null)}
        onDelete={setDeleting}
        onWarranty={openWarranty}
      />
      <TaskFormDrawer isOpen={adding} onClose={() => setAdding(false)} />
      <ConfirmDelete
        isOpen={!!deleting}
        title="Xác nhận xóa công việc"
        pending={isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove(deleting.id)}
      >
        Xóa công việc{' '}
        <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{deleting ? `${deleting.code} · ${deleting.title}` : ''}</strong>?
      </ConfirmDelete>
      {warranty && (
        <CompleteVisitModal
          projectId={warranty.projectId}
          visit={warranty.visit}
          onClose={() => {
            setWarranty(null);
            refreshTasks();
          }}
        />
      )}
    </div>
  );
}
