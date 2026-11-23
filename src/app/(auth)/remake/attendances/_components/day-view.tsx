'use client';

import { useDeferredValue, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { getAttendances } from '@/actions';
import { useCan } from '@/hooks';
import type { Attendance } from '@/types';
import { DataList } from '../../_components/data-list';
import { BTN_LINE, INPUT } from '../../_components/form';
import { DatePicker } from '../../_components/date-picker';
import { Select } from '../../_components/select';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';
import { AttendanceCard, attendanceColumns } from './attendance-columns';
import { STATUS_OPTIONS } from './attendance-sheet';

const PAGE = 20;
const today = () => new Date().toLocaleDateString('sv');

// Tab "Theo ngày": chấm công của nhân viên trong phạm vi (dept/org), tìm theo tên, lọc trạng thái.
export function DayView({ onOpen, onAdjust }: { onOpen: (a: Attendance) => void; onAdjust: (type: string, date: string) => void }) {
  const { can, isReady } = useCan();
  const [search, setSearch] = useState('');
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const q = useDeferredValue(search.trim());
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['attendances', q, date, status, limit],
    queryFn: () => getAttendances({ limit, search: q || undefined, workDate: date || undefined, status: (status || undefined) as never }),
    placeholderData: (prev) => prev,
    enabled: isReady && can('attendance:read'),
  });
  const items = data?.items ?? [];
  const filtered = !!(q || status);

  if (!isReady) return <ListSkeleton />;

  return (
    <>
      <div className="sticky top-0 z-10 -mx-rm-gutter mb-3 flex flex-col gap-2 bg-rm-bg px-rm-gutter pb-2">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
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
          {can('attendance_request:create') && (
            <button type="button" onClick={() => onAdjust('overtime', date)} className={`${BTN_LINE} flex-none`}>
              Tăng ca
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <DatePicker id="at-day" label="Ngày" value={date} onChange={setDate} />
          </div>
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
          onOpen={onOpen}
        />
      )}
      {data?.meta?.next && (
        <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="mt-3 h-rm-tap w-full text-sm font-medium text-rm-primary">
          Xem thêm
        </button>
      )}
    </>
  );
}
