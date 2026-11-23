'use client';

import { useDeferredValue, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Download, Lock, LockOpen, Search } from 'lucide-react';
import {
  closeAttendancePeriod,
  exportAttendanceReport,
  getDepartments,
  getAttendancePeriodLocks,
  getAttendanceReport,
  reopenAttendancePeriod,
} from '@/actions';
import { useCan } from '@/hooks';
import { Badge } from '../../_components/badge';
import { BTN_LINE, INPUT, messageOf } from '../../_components/form';
import { DatePicker } from '../../_components/date-picker';
import { Select } from '../../_components/select';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';
import { DataList } from '../../_components/data-list';
import { PersonSheet } from './person-sheet';
import { ReportCard, reportColumns } from './report-columns';

const thisMonth = () => new Date().toLocaleDateString('sv').slice(0, 7);
const range = (m: string) => {
  const [y, mm] = m.split('-').map(Number);
  return { fromDate: `${m}-01`, toDate: `${m}-${String(new Date(y, mm, 0).getDate()).padStart(2, '0')}` };
};
const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="min-w-0 rounded-rm-xl border border-rm-edge bg-rm-surface p-3">
    <p className="truncate text-xs text-rm-muted">{label}</p>
    <p className="truncate font-heading text-lg font-semibold">{value}</p>
  </div>
);

// Tab "Thống kê": báo cáo chấm công theo tháng (API /reports/attendance): tổng hợp, từng nhân viên, xuất Excel, chốt công.
export function ReportView() {
  const { can, isReady } = useCan();
  const qc = useQueryClient();
  const [month, setMonth] = useState(thisMonth);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [person, setPerson] = useState<{ userId: string; name: string } | null>(null);
  const q = useDeferredValue(search.trim());
  const { data: depts } = useQuery({ queryKey: ['departments', 'report'], queryFn: () => getDepartments({ limit: 100 }) });
  const params = { ...range(month || thisMonth()), search: q || undefined, departmentId: dept ? Number(dept) : undefined };
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['attendance-report', params],
    queryFn: () => getAttendanceReport(params),
    placeholderData: (prev) => prev,
    enabled: isReady && can('attendance_report:read'),
  });
  const year = Number((month || thisMonth()).slice(0, 4));
  const { data: locks } = useQuery({ queryKey: ['attendance-locks', year], queryFn: () => getAttendancePeriodLocks(year) });
  const locked = !!locks?.some((l) => l.month.slice(0, 7) === month);

  const lock = useMutation({
    mutationFn: async () => void (await (locked ? reopenAttendancePeriod(month) : closeAttendancePeriod(month))),
    onSuccess: () => {
      toast.success(locked ? 'Đã mở lại kỳ công' : 'Đã chốt công');
      qc.invalidateQueries({ queryKey: ['attendance-locks'] });
    },
    onError: (e) => toast.error(messageOf(e)),
  });
  const exportFile = useMutation({ mutationFn: () => exportAttendanceReport(params), onError: (e) => toast.error(messageOf(e)) });

  const items = data?.items ?? [];
  const s = data?.summary;
  const canLock = can('attendance_report:close_period');

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
          <button
            type="button"
            aria-label="Xuất Excel"
            disabled={exportFile.isPending}
            onClick={() => exportFile.mutate()}
            className={`${BTN_LINE} px-0 w-rm-tap md:w-auto md:px-4`}
          >
            <Download size={16} aria-hidden="true" />
            <span className="hidden md:inline">Xuất Excel</span>
          </button>
          {canLock && (
            <button
              type="button"
              aria-label={locked ? 'Mở lại kỳ công' : 'Chốt công'}
              disabled={lock.isPending}
              onClick={() => {
                if (!locked || window.confirm(`Mở lại kỳ công ${month}? Công tháng này sẽ sửa được.`)) lock.mutate();
              }}
              className={`${BTN_LINE} px-0 w-rm-tap md:w-auto md:px-4`}
            >
              {locked ? <LockOpen size={16} aria-hidden="true" /> : <Lock size={16} aria-hidden="true" />}
              <span className="hidden md:inline">{locked ? 'Mở lại kỳ công' : 'Chốt công'}</span>
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <DatePicker id="rp-month" label="Tháng" mode="month" value={month} onChange={setMonth} />
          </div>
          <div className="min-w-0 flex-1">
            <Select
              id="rp-dept"
              label="Phòng ban"
              value={dept}
              onChange={setDept}
              options={[
                { value: '', label: 'Mọi phòng ban' },
                ...(depts?.items ?? []).map((d: { id: number; name: string }) => ({ value: String(d.id), label: d.name })),
              ]}
            />
          </div>
        </div>
      </div>

      {locked && (
        <p className="mb-3">
          <Badge tone="warning">
            Tháng {month.slice(5)}/{month.slice(0, 4)} đã chốt công
          </Badge>
        </p>
      )}

      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState title="Không tải được báo cáo" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />
      )}
      {data && items.length === 0 && <EmptyState title="Không có dữ liệu" description="Tháng này chưa có công nào." />}
      {data && items.length > 0 && s && (
        <>
          <div className="mb-3 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2 md:grid-cols-[repeat(3,minmax(0,1fr))] lg:grid-cols-[repeat(6,minmax(0,1fr))]">
            <Stat label="Nhân viên" value={s.totalEmployees} />
            <Stat label="Ngày công" value={s.totalWorkDays} />
            <Stat label="Tổng giờ làm" value={`${s.totalHours ?? 0}h`} />
            <Stat label="Đi muộn (lượt)" value={s.totalLateDays} />
            <Stat label="Về sớm (lượt)" value={s.totalEarlyLeaveDays ?? 0} />
            <Stat label="Tăng ca (giờ)" value={s.totalOvertimeHours ?? 0} />
          </div>
          <DataList
            label="Báo cáo chấm công theo nhân viên"
            rows={items}
            rowKey={(u) => u.userId}
            columns={reportColumns}
            card={(u) => <ReportCard u={u} />}
            onOpen={(u) => setPerson({ userId: u.userId, name: u.fullName || u.username || 'Không rõ' })}
          />
        </>
      )}
      <PersonSheet key={person?.userId ?? 'none'} target={person} fromDate={params.fromDate} toDate={params.toDate} onClose={() => setPerson(null)} />
    </>
  );
}
