'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getAttendances, getEmployees } from '@/actions';
import { useCan } from '@/hooks';
import type { Attendance } from '@/types';
import { DataList } from '../_components/data-list';
import { PageHeader } from '../_components/page-header';
import { Select } from '../_components/select';
import { EmptyState, ErrorState, ListSkeleton } from '../_components/state-views';
import { AdjustmentSheet } from '../adjustments/_components/adjustment-sheet';
import { AttendanceSheet } from '../attendances/_components/attendance-sheet';
import { HistorySummary } from './_components/history-summary';
import { HistoryCard, historyColumns } from './_components/history-columns';

const PAGE = 31;
const thisMonth = () => new Date().toLocaleDateString('sv').slice(0, 7);
const shift = (m: string, d: number) => {
  const [y, mo] = m.split('-').map(Number);
  return new Date(y, mo - 1 + d, 1).toLocaleDateString('sv').slice(0, 7);
};
const lastDay = (m: string) => {
  const [y, mo] = m.split('-').map(Number);
  return `${m}-${String(new Date(y, mo, 0).getDate()).padStart(2, '0')}`;
};

// Lịch sử chấm công theo tháng. Phạm vi own: chỉ của mình. Phạm vi phòng ban / toàn tổ chức: chọn từng người hoặc xem tất cả.
export default function RemakeAttendanceHistoryPage() {
  const { can, scopeOf, isReady } = useCan();
  const [month, setMonth] = useState(thisMonth);
  const [person, setPerson] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState<Attendance | null>(null);
  const [adj, setAdj] = useState<string | null>(null);
  const wide = can('attendance:read') && scopeOf('attendance:read') !== 'own';

  const people = useQuery({ queryKey: ['employees', '', 100], queryFn: () => getEmployees({ limit: 100, offset: 0 }), enabled: wide });
  const q = useQuery({
    queryKey: ['attendances', 'history', month, person, limit],
    queryFn: () =>
      getAttendances({
        startDate: `${month}-01`,
        endDate: lastDay(month),
        userId: person || undefined,
        sortBy: 'work_date',
        sortOrder: 'desc',
        limit,
      }),
    enabled: can('attendance:read'),
    placeholderData: (prev) => prev,
  });

  if (!isReady) return <ListSkeleton />;
  if (!can('attendance:read')) return <EmptyState title="Bạn chưa có quyền xem chấm công" description="Liên hệ quản trị viên để được cấp quyền." />;

  const items = q.data?.items ?? [];
  const single = !wide || !!person;
  const change = (m: string) => {
    setMonth(m);
    setLimit(PAGE);
  };

  return (
    <>
      <PageHeader
        title="Lịch sử chấm công"
        description={wide ? 'Xem lại giờ vào, giờ ra của nhân viên theo tháng.' : 'Xem lại giờ vào, giờ ra của bạn theo tháng.'}
      />

      <div className="sticky top-0 z-10 -mx-rm-gutter mb-3 flex flex-col gap-2 bg-rm-bg px-rm-gutter pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Tháng trước"
            onClick={() => change(shift(month, -1))}
            className="flex size-rm-tap flex-none items-center justify-center rounded-rm border border-rm-line bg-rm-surface active:bg-rm-bg md:size-rm-control"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <p className="min-w-0 flex-1 text-center text-sm font-medium" aria-live="polite">
            Tháng {month.slice(5)}/{month.slice(0, 4)}
          </p>
          <button
            type="button"
            aria-label="Tháng sau"
            disabled={month >= thisMonth()}
            onClick={() => change(shift(month, 1))}
            className="flex size-rm-tap flex-none items-center justify-center rounded-rm border border-rm-line bg-rm-surface active:bg-rm-bg disabled:opacity-40 md:size-rm-control"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
        {wide && (
          <Select
            id="ah-person"
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

      {q.isLoading && <ListSkeleton />}
      {q.isError && (
        <ErrorState title="Không tải được lịch sử" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => q.refetch()} />
      )}
      {q.data && single && <HistorySummary items={items} />}
      {q.data && items.length === 0 && <EmptyState title="Chưa có chấm công" description="Tháng này chưa có bản ghi nào." />}
      {items.length > 0 && (
        <DataList
          label="Lịch sử chấm công"
          rows={items}
          rowKey={(a) => a.id}
          columns={historyColumns(!single)}
          card={(a) => <HistoryCard a={a} showName={!single} />}
          onOpen={setOpen}
        />
      )}
      {q.data?.meta?.next && (
        <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="mt-3 h-rm-tap w-full text-sm font-medium text-rm-primary">
          Xem thêm ({items.length}/{q.data.meta.total})
        </button>
      )}

      <AdjustmentSheet
        key={`adj-${adj ?? 'none'}`}
        target={adj ? 'new' : null}
        defaultType="forgot_attendance"
        defaultDate={adj ?? undefined}
        onClose={() => setAdj(null)}
      />
      <AttendanceSheet
        key={`att-${open?.id ?? 'none'}`}
        target={open}
        date={open?.workDate ?? ''}
        onClose={() => setOpen(null)}
        onComplain={(d) => {
          setOpen(null);
          setAdj(d);
        }}
      />
    </>
  );
}
