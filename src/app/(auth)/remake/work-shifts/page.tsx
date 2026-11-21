'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { getDepartments, getWorkShifts } from '@/actions';
import { useCan } from '@/hooks';
import type { Department, WorkShift } from '@/types';
import { BTN_PRIMARY, INPUT } from '../_components/form';
import { PageHeader } from '../_components/page-header';
import { EmptyState, ErrorState, ListSkeleton } from '../_components/state-views';
import { cn } from '@/utils/cn';
import { RosterCalendar } from './_components/roster-calendar';
import { DeptSection, type Dept } from './_components/dept-section';
import { WorkShiftSheet } from './_components/work-shift-sheet';

type Open = null | { shift?: WorkShift; departmentId?: number };

// Ca làm việc chia theo phòng ban; phòng ban chưa có ca được cảnh báo và tạo ca ngay trong khối đó.
export default function RemakeWorkShiftsPage() {
  const { can, isReady } = useCan();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'month'>('list');
  const [open, setOpen] = useState<Open>(null);
  const q = useDeferredValue(search.trim().toLowerCase());
  const canRead = isReady && can('work_shift:read');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['work-shifts', 'all'],
    queryFn: () => getWorkShifts({ limit: 500 }),
    enabled: canRead,
  });
  // Không có quyền xem phòng ban thì chỉ dựng khối từ ca đã có
  const depts = useQuery({
    queryKey: ['departments', 'all'],
    queryFn: () => getDepartments({ limit: 200 }),
    enabled: canRead && can('department:read'),
  });
  const canCreate = can('work_shift:create');

  const sections = useMemo(() => {
    const shifts: WorkShift[] = (data?.items ?? []).filter((w: WorkShift) => !q || w.name.toLowerCase().includes(q));
    const byDept = new Map<number | null, WorkShift[]>();
    shifts.forEach((w) => byDept.set(w.departmentId ?? null, [...(byDept.get(w.departmentId ?? null) ?? []), w]));
    const list: Dept[] = (depts.data?.items ?? []).map((d: Department) => ({ id: d.id, name: d.name, color: d.mainColor }));
    (data?.items ?? []).forEach((w: WorkShift) => {
      if (w.departmentId && w.department && !list.some((d) => d.id === w.departmentId)) list.push({ id: w.departmentId, name: w.department.name });
    });
    const rows = list.filter((d) => !q || byDept.has(d.id)).map((d) => ({ dept: d, shifts: byDept.get(d.id) ?? [] }));
    if (byDept.has(null)) rows.push({ dept: { id: null, name: 'Chưa gán phòng ban' }, shifts: byDept.get(null) ?? [] });
    // Thiếu ca lên đầu để dễ thấy, còn lại theo tên
    return rows.sort((a, b) => Number(b.shifts.length === 0) - Number(a.shifts.length === 0) || a.dept.name.localeCompare(b.dept.name, 'vi'));
  }, [data, depts.data, q]);
  const missingCount = sections.filter((s) => s.shifts.length === 0).length;

  if (!isReady) return <ListSkeleton />;
  if (!can('work_shift:read')) return <EmptyState title="Bạn chưa có quyền xem ca làm việc" description="Liên hệ quản trị viên để được cấp quyền." />;

  return (
    <>
      <PageHeader title="Ca làm việc" description="Giờ vào, giờ ra theo ca, chia theo phòng ban." />

      <div role="tablist" className="mb-3 flex gap-2">
        {(
          [
            ['list', 'Theo phòng ban'],
            ['month', 'Lịch tháng'],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className={cn(
              'h-9 rounded-rm border px-3 text-xs font-medium active:scale-95',
              view === v ? 'border-rm-primary bg-rm-primary-soft text-rm-primary' : 'border-rm-line text-rm-muted',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {view === 'month' && <RosterCalendar />}
      {view === 'list' && (
        <>
          <div className="sticky top-0 z-10 -mx-rm-gutter mb-3 flex items-center gap-2 bg-rm-bg px-rm-gutter pb-2">
            <div className="relative min-w-0 flex-1">
              <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" aria-hidden="true" />
              <input
                type="search"
                aria-label="Tìm ca làm việc"
                placeholder="Tên ca"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${INPUT} pl-10`}
              />
            </div>
            {canCreate && (
              <button
                type="button"
                onClick={() => setOpen({})}
                aria-label="Thêm ca"
                className={`${BTN_PRIMARY} w-rm-tap flex-none px-0 md:w-auto md:px-4`}
              >
                <Plus size={18} aria-hidden="true" />
                <span className="hidden md:inline">Thêm ca</span>
              </button>
            )}
          </div>

          {isLoading && <ListSkeleton />}
          {isError && (
            <ErrorState
              title="Không tải được ca làm việc"
              description="Kiểm tra kết nối rồi thử lại."
              actionLabel="Thử lại"
              onAction={() => refetch()}
            />
          )}
          {data && sections.length === 0 && (
            <EmptyState title={q ? 'Không tìm thấy' : 'Chưa có ca làm việc'} description={q ? 'Thử từ khoá khác.' : 'Thêm ca đầu tiên.'} />
          )}
          {data && sections.length > 0 && (
            <p className={cn('mb-3 text-sm', missingCount ? 'text-rm-warning' : 'text-rm-muted')}>
              {sections.length} phòng ban{missingCount > 0 && ` · ${missingCount} phòng ban thiếu ca làm việc`}
            </p>
          )}
          {sections.map(({ dept, shifts }) => (
            <DeptSection
              key={dept.id ?? 'none'}
              dept={dept}
              shifts={shifts}
              onAdd={canCreate && dept.id ? () => setOpen({ departmentId: dept.id! }) : undefined}
              onOpen={(shift) => setOpen({ shift })}
            />
          ))}
        </>
      )}
      <WorkShiftSheet
        key={open?.shift?.id ?? `new-${open?.departmentId ?? 'none'}-${open ? 1 : 0}`}
        target={open ? (open.shift ?? 'new') : null}
        defaultDepartmentId={open?.departmentId}
        onClose={() => setOpen(null)}
      />
    </>
  );
}
