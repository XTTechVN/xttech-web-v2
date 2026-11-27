'use client';

import { useMemo, useState } from 'react';
import { keepPreviousData, useInfiniteQuery, useMutation, useQueries, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { BarChart3, Clock, MessageSquareWarning, Plus, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteAttendance, getAdjustmentRequests, getAttendances, getDepartments } from '@/actions';
import { Skeleton } from '@/components';
import { RoutePlaybackModal } from '@/components/map-modal';
import { Button, FilterDrawer, SearchField, Select, StatGrid, type FilterGroup } from '@/components-remake';
import { useCan, useDebounce } from '@/hooks';
import type { Attendance, AttendanceStatus, Department } from '@/types';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import AddAdjustmentDrawer from '../../adjustments/_components/list/add-drawer';
import { DeleteAttendanceModal } from './delete-modal';
import { AttendanceDrawer } from './detail-drawer';
import AttendanceFormDrawer from './form-modal';
import { DepartmentSections } from './department-sections';
import { personName } from './format';
import { currentMonth, PeriodBar, periodRange, type Period } from './period-bar';
import { AttendanceList } from './list';

const PAGE = 30;

const STATUS_GROUP: FilterGroup = {
  key: 'status',
  label: 'Trạng thái',
  options: [
    { value: 'present', label: 'Đúng giờ' },
    { value: 'late', label: 'Đi muộn' },
    { value: 'early_leave', label: 'Về sớm' },
    { value: 'late_and_early_leave', label: 'Đi muộn & Về sớm' },
    { value: 'overtime', label: 'Tăng ca' },
    { value: 'absent', label: 'Nghỉ không phép' },
  ],
};

const isoDay = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};
const isAbsent = (r: Attendance) => r.status?.toLowerCase() === 'absent';
const isLateOrEarly = (r: Attendance) =>
  !!r.isLate || !!r.isEarlyLeave || ['late', 'early_leave', 'late_and_early_leave'].includes(r.status?.toLowerCase() ?? '');

const Table = () => {
  const router = useRouter();
  const { can, scopeOf } = useCan();
  // Phạm vi đọc rộng (dept/org) = chế độ quản lý: hiện tên người và lọc phòng ban; own = "của tôi"
  const readScope = scopeOf('attendance:read');
  const wide = readScope === 'dept' || readScope === 'org';

  // Giữ chữ đang gõ trong state cục bộ, trễ 300ms mới gọi API (tránh mất dấu tiếng Việt và gọi dồn dập)
  const [search, setSearch] = useState('');
  const keyword = useDebounce(search.trim(), 300);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [period, setPeriod] = useState<Period>(() => ({ mode: 'month', month: currentMonth(), from: '', to: '' }));
  const range = useMemo(() => periodRange(period), [period]);
  const isDefaultPeriod = period.mode === 'month' && period.month === currentMonth();
  const [groupBy, setGroupBy] = useState('');
  const [limits, setLimits] = useState<Record<number, number>>({});

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Attendance | null>(null);
  const [complaint, setComplaint] = useState<Attendance | null>(null);
  const [route, setRoute] = useState<Attendance | null>(null);

  const departments = useQuery({
    queryKey: ['departments', 'all'],
    queryFn: () => getDepartments({ limit: 100 }),
    enabled: wide && can('department:read'),
  });
  const groups = useMemo<FilterGroup[]>(() => {
    const dept = {
      key: 'dept',
      label: 'Phòng ban',
      options: ((departments.data?.items ?? []) as Department[]).map((d) => ({ value: String(d.id), label: d.name })),
    };
    return [...(dept.options.length ? [dept] : []), STATUS_GROUP];
  }, [departments.data]);

  const deptList = useMemo(() => (departments.data?.items ?? []) as Department[], [departments.data]);
  // Chỉ gom nhóm khi có quyền xem phòng ban (cần tên để làm tiêu đề khối)
  const grouped = wide && groupBy === 'dept' && deptList.length > 0;
  const sectionDepts = useMemo(() => (filters.dept ? deptList.filter((d) => String(d.id) === filters.dept) : deptList), [deptList, filters.dept]);
  const sectionQueries = useQueries({
    queries: sectionDepts.map((d) => {
      const limit = limits[d.id] ?? PAGE;
      return {
        queryKey: ['attendances', 'dept', d.id, keyword, filters.status, range, limit],
        queryFn: () =>
          getAttendances({
            offset: 0,
            limit,
            search: keyword || undefined,
            startDate: range.from || undefined,
            endDate: range.to || undefined,
            departmentId: d.id,
            status: (filters.status as AttendanceStatus) || undefined,
          }),
        enabled: grouped,
        placeholderData: keepPreviousData,
      };
    }),
  });
  const sections = useMemo(
    () =>
      sectionDepts
        .map((d, i) => ({ id: d.id, name: d.name, items: sectionQueries[i]?.data?.items ?? [], total: sectionQueries[i]?.data?.meta?.total ?? 0 }))
        .filter((s) => s.total > 0),
    [sectionDepts, sectionQueries],
  );
  const sectionsLoading = grouped && sectionQueries.some((q) => q.isLoading);
  const sectionsError = grouped && sectionQueries.some((q) => q.isError);

  const list = useInfiniteQuery({
    queryKey: ['attendances', keyword, filters, range],
    enabled: !grouped,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getAttendances({
        offset: pageParam,
        limit: PAGE,
        search: keyword || undefined,
        startDate: range.from || undefined,
        endDate: range.to || undefined,
        departmentId: filters.dept ? Number(filters.dept) : undefined,
        status: (filters.status as AttendanceStatus) || undefined,
      }),
    getNextPageParam: (last) => (last?.meta?.next ? (last.meta.offset ?? 0) + (last.meta.limit ?? PAGE) : undefined),
  });
  const rows = useMemo(() => list.data?.pages.flatMap((p) => p?.items ?? []) ?? [], [list.data]);
  const total = list.data?.pages[0]?.meta?.total ?? rows.length;
  const selected = useMemo(
    () => (grouped ? sections.flatMap((s) => s.items) : rows).find((r) => r.id === selectedId) ?? null,
    [grouped, sections, rows, selectedId],
  );

  // Thống kê hôm nay so với hôm qua
  const today = isoDay();
  const yesterday = isoDay(-1);
  const statsQuery = useQuery({
    queryKey: ['attendances-stats', today, yesterday],
    queryFn: () => getAttendances({ startDate: yesterday, endDate: today, limit: 1000 }),
  });
  const pending = useQuery({ queryKey: ['adjustment-requests'], queryFn: () => getAdjustmentRequests() });
  const stats = useMemo(() => {
    const all = statsQuery.data?.items ?? [];
    const on = (day: string, f: (r: Attendance) => boolean) => all.filter((r) => r.workDate === day && f(r)).length;
    const present = on(today, (r) => !!r.status && !isAbsent(r));
    const absent = on(today, isAbsent);
    const late = on(today, isLateOrEarly);
    return [
      { label: 'Có mặt', value: present, icon: UserCheck },
      { label: 'Vắng mặt', value: absent, icon: UserX, diff: absent - on(yesterday, isAbsent) },
      { label: 'Muộn / về sớm', value: late, icon: Clock, diff: late - on(yesterday, isLateOrEarly) },
      {
        label: 'Khiếu nại chờ',
        value: (pending.data?.items ?? []).filter((i) => i.status === 'pending').length,
        icon: MessageSquareWarning,
      },
    ];
  }, [statsQuery.data, pending.data, today, yesterday]);

  const { mutate: remove, isPending } = useMutation({
    mutationFn: (id: number) => deleteAttendance(id),
    onSuccess: () => {
      ['attendances', 'attendances-stats'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
      toast.success('Đã xóa chấm công thành công');
      setDeleting(null);
    },
    onError: (e) => showErrorToast(e, 'Có lỗi xảy ra khi xóa bản ghi chấm công'),
  });

  const filtered = !!keyword || Object.values(filters).some(Boolean) || period.mode === 'month' || !!(range.from || range.to);

  let body;
  if (grouped ? sectionsLoading : list.isLoading) {
    body = (
      <div className="flex flex-col gap-2" aria-busy="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-block" />
        ))}
      </div>
    );
  } else if (grouped ? sectionsError : list.isError) {
    body = (
      <div className="flex flex-col items-center gap-3 rounded-block border border-slate-200/80 bg-white py-12 text-center">
        <p className="text-sm text-slate-600">Không tải được danh sách chấm công.</p>
        <Button variant="outline" onClick={() => (grouped ? sectionQueries.forEach((q) => q.refetch()) : list.refetch())}>
          Thử lại
        </Button>
      </div>
    );
  } else if (grouped ? sections.length === 0 : rows.length === 0) {
    body = (
      <p className="rounded-block border border-slate-200/80 bg-white py-12 text-center text-sm text-slate-500">
        {filtered ? 'Không có bản ghi khớp với tìm kiếm và bộ lọc.' : 'Chưa có bản ghi chấm công nào.'}
      </p>
    );
  } else if (grouped) {
    body = (
      <DepartmentSections
        sections={sections}
        onOpen={(a) => setSelectedId(a.id)}
        onMore={(id) => setLimits((l) => ({ ...l, [id]: (l[id] ?? PAGE) + PAGE }))}
      />
    );
  } else {
    body = (
      <>
        <AttendanceList rows={rows} showUser={wide} onOpen={(a) => setSelectedId(a.id)} />
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-slate-500">
            Đang hiện {rows.length} / {total} bản ghi
          </p>
          {list.hasNextPage && (
            <Button variant="outline" loading={list.isFetchingNextPage} onClick={() => list.fetchNextPage()}>
              Xem thêm
            </Button>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      {!list.isError && <StatGrid items={stats} />}

      <div className="flex items-center gap-2">
        <SearchField value={search} onChange={setSearch} label="Tìm chấm công" placeholder={wide ? 'Tìm theo tên, email...' : 'Tìm chấm công...'} />
        <div className="ml-auto flex flex-none items-center gap-2">
          <FilterDrawer
            groups={groups}
            value={filters}
            onChange={setFilters}
            extra={{
              count: (groupBy ? 1 : 0) + (isDefaultPeriod ? 0 : 1),
              onReset: () => {
                setGroupBy('');
                setPeriod({ mode: 'month', month: currentMonth(), from: '', to: '' });
              },
              node: (
                <>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-slate-500">Kỳ xem</span>
                    <PeriodBar value={period} onChange={setPeriod} />
                  </div>
                  {wide && deptList.length > 0 && (
                    <Select
                      side
                      label="Hiển thị"
                      value={groupBy}
                      options={[{ value: 'dept', label: 'Tách theo phòng ban' }]}
                      onChange={setGroupBy}
                      placeholder="Một danh sách chung"
                      clearLabel="Một danh sách chung"
                    />
                  )}
                </>
              ),
            }}
          />
          {can('attendance_report:read') && (
            <Button variant="outline" icon={<BarChart3 size={18} />} iconOnly="mobile" onClick={() => router.push('/app/attendances/reports')}>
              Báo cáo
            </Button>
          )}
          {can('attendance:create') && (
            <Button icon={<Plus size={18} />} iconOnly="mobile" onClick={() => setAdding(true)}>
              Thêm chấm công
            </Button>
          )}
        </div>
      </div>

      {body}

      <AttendanceDrawer
        attendance={selected}
        showUser={wide}
        onClose={() => setSelectedId(null)}
        onDelete={(a) => setDeleting(a)}
        onComplain={(a) => setComplaint(a)}
        onRoute={(a) => setRoute(a)}
      />
      <AttendanceFormDrawer isOpen={adding} onClose={() => setAdding(false)} />
      <DeleteAttendanceModal
        attendance={deleting}
        isPending={isPending}
        onClose={() => setDeleting(null)}
        onConfirm={(id) => remove(id, { onSuccess: () => setSelectedId((cur) => (cur === id ? null : cur)) })}
      />
      <AddAdjustmentDrawer
        open={!!complaint}
        data={complaint}
        onClose={() => setComplaint(null)}
      />
      {route && (
        <RoutePlaybackModal
          isOpen
          onClose={() => setRoute(null)}
          userId={route.userId}
          userName={personName(route)}
          attendanceId={route.id}
          initialDate={route.workDate}
        />
      )}
    </div>
  );
};

export default Table;
