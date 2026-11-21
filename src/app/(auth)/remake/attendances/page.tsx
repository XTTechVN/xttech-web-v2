'use client';

import { useDeferredValue, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { getAttendances } from '@/actions';
import { useCan } from '@/hooks';
import type { Attendance } from '@/types';
import { DataList } from '../_components/data-list';
import { BTN_LINE, INPUT } from '../_components/form';
import { PageHeader } from '../_components/page-header';
import { Select } from '../_components/select';
import { EmptyState, ErrorState, ListSkeleton } from '../_components/state-views';
import { AdjustmentSheet } from '../adjustments/_components/adjustment-sheet';
import { AttendanceCard, attendanceColumns } from './_components/attendance-columns';
import { AttendanceSheet, STATUS_OPTIONS } from './_components/attendance-sheet';

const PAGE = 20;
const today = () => new Date().toLocaleDateString('sv');

// Chấm công theo ngày (API /attendances): tìm theo tên, lọc trạng thái, thêm / sửa / xoá.
export default function RemakeAttendancesPage() {
  const { can, scopeOf, isReady } = useCan();
  const router = useRouter();
  const own = isReady && scopeOf('attendance:read') === 'own';
  useEffect(() => {
    if (own) router.replace('/remake/attendance-history'); // người chỉ có quyền xem của mình dùng trang Lịch sử
  }, [own, router]);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState<Attendance | 'new' | null>(null);
  const [adj, setAdj] = useState<{ type: string; date: string } | null>(null);
  const q = useDeferredValue(search.trim());
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['attendances', q, date, status, limit],
    queryFn: () => getAttendances({ limit, search: q || undefined, workDate: date || undefined, status: (status || undefined) as never }),
    placeholderData: (prev) => prev,
    enabled: isReady && !own,
  });
  const items = data?.items ?? [];
  const filtered = !!(q || status);

  if (!isReady || own) return <ListSkeleton />;

  return (
    <>
      <PageHeader
        title="Chấm công"
        description="Giờ vào, giờ ra của nhân viên theo ngày."
        actionLabel={can('attendance:create') ? 'Thêm chấm công' : undefined}
        onAction={() => setOpen('new')}
      />

      <div className="sticky top-0 z-10 -mx-rm-gutter mb-3 flex flex-col gap-2 bg-rm-bg px-rm-gutter pb-2">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" aria-hidden="true" />
          <input
            type="search"
            aria-label="Tìm nhân viên"
            placeholder="Tên nhân viên"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${INPUT} pl-10`}
          />
        </div>
        <div className="flex gap-2">
          {can('attendance_request:create') && (
            <button type="button" onClick={() => setAdj({ type: 'overtime', date })} className={`${BTN_LINE} flex-none`}>
              Tăng ca
            </button>
          )}
          <input type="date" aria-label="Ngày" value={date} onChange={(e) => setDate(e.target.value)} className={`${INPUT} min-w-0 flex-1`} />
          <div className="min-w-0 flex-1">
            <Select
              id="at-filter"
              label="Trạng thái"
              value={status}
              onChange={setStatus}
              options={[{ value: '', label: 'Tất cả' }, ...STATUS_OPTIONS]}
            />
          </div>
        </div>
      </div>

      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState title="Không tải được chấm công" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />
      )}
      {data && items.length === 0 && (
        <EmptyState
          title={filtered ? 'Không tìm thấy' : 'Chưa có chấm công'}
          description={filtered ? 'Thử bỏ bớt bộ lọc.' : 'Ngày này chưa có ai chấm công.'}
        />
      )}
      {items.length > 0 && (
        <DataList
          label="Danh sách chấm công"
          rows={items}
          rowKey={(a) => a.id}
          columns={attendanceColumns}
          card={(a) => <AttendanceCard a={a} />}
          onOpen={setOpen}
        />
      )}
      {data?.meta?.next && (
        <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="mt-3 h-rm-tap w-full text-sm font-medium text-rm-primary">
          Xem thêm
        </button>
      )}

      <AdjustmentSheet
        key={adj ? `adj-${adj.type}-${adj.date}` : 'adj-none'}
        target={adj ? 'new' : null}
        defaultType={adj?.type}
        defaultDate={adj?.date}
        onClose={() => setAdj(null)}
      />
      <AttendanceSheet
        key={open === 'new' ? 'att-new' : `att-${open?.id ?? 'none'}`}
        target={open}
        date={date}
        onClose={() => setOpen(null)}
        onComplain={(d) => {
          setOpen(null);
          setAdj({ type: 'forgot_attendance', date: d });
        }}
      />
    </>
  );
}
