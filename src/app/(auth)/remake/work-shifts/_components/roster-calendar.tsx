'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDepartmentRoster, getDepartments, getMonthRoster } from '@/actions';
import type { Department, DepartmentRosterItem, RosterMemberStatus } from '@/types';
import { cn } from '@/utils/cn';
import { Badge, type Tone } from '../../_components/badge';
import { Select } from '../../_components/select';
import { Sheet } from '../../_components/sheet';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';
import { hm } from './work-shift-sheet';

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const STATUS: Record<RosterMemberStatus, { label: string; tone: Tone }> = {
  working: { label: 'Đi làm', tone: 'success' },
  flexible: { label: 'Linh hoạt', tone: 'primary' },
  on_leave: { label: 'Nghỉ phép', tone: 'warning' },
  partial_leave: { label: 'Nghỉ một phần', tone: 'warning' },
  day_off: { label: 'Nghỉ', tone: 'neutral' },
};
const ymd = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

// Lịch ca theo tháng của phòng ban: mỗi ngày hiện số người đi làm / nghỉ; bấm ngày xem từng người.
export function RosterCalendar() {
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [dept, setDept] = useState('');
  const [day, setDay] = useState<string | null>(null);
  const month = `${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}`;
  const { data: depts } = useQuery({ queryKey: ['departments', 'roster'], queryFn: () => getDepartments({ limit: 100 }) });
  const departmentId = dept ? Number(dept) : undefined;
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['roster-month', month, departmentId],
    queryFn: () => getMonthRoster({ month, departmentId }),
  });
  const byDate = new Map((data?.days ?? []).map((d) => [d.date, d]));
  const lead = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7;
  const count = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const today = ymd(now.getFullYear(), now.getMonth(), now.getDate());
  const step = (n: number) => setCursor((c) => ({ y: new Date(c.y, c.m + n, 1).getFullYear(), m: new Date(c.y, c.m + n, 1).getMonth() }));

  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Tháng trước"
          className="flex size-rm-tap flex-none items-center justify-center rounded-rm border border-rm-line active:scale-95"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <p className="min-w-0 flex-1 text-center text-sm font-semibold">
          Tháng {cursor.m + 1}/{cursor.y}
        </p>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Tháng sau"
          className="flex size-rm-tap flex-none items-center justify-center rounded-rm border border-rm-line active:scale-95"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="mb-3">
        <Select
          id="ro-dept"
          label="Phòng ban"
          value={dept}
          onChange={setDept}
          options={[
            { value: '', label: 'Phòng ban của tôi' },
            ...(depts?.items ?? []).map((d: Department) => ({ value: String(d.id), label: d.name })),
          ]}
        />
      </div>

      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState title="Không tải được lịch ca" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />
      )}
      {data && (
        <div className="rounded-rm-xl border border-rm-edge bg-rm-surface p-2">
          <ol className="grid grid-cols-[repeat(7,minmax(0,1fr))] pb-1 text-center text-xs text-rm-muted">
            {DAYS.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ol>
          <ul className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-1">
            {Array.from({ length: lead }, (_, i) => (
              <li key={`b${i}`} aria-hidden="true" />
            ))}
            {Array.from({ length: count }, (_, i) => {
              const date = ymd(cursor.y, cursor.m, i + 1);
              const s = byDate.get(date);
              return (
                <li key={date}>
                  <button
                    type="button"
                    onClick={() => setDay(date)}
                    aria-label={`Ngày ${i + 1}: ${s?.workingCount ?? 0} đi làm, ${s?.onLeaveCount ?? 0} nghỉ phép`}
                    className={cn(
                      'flex h-14 w-full flex-col items-center justify-center rounded-rm border text-xs active:scale-95 md:h-16',
                      date === today ? 'border-rm-primary' : 'border-transparent bg-rm-bg',
                    )}
                  >
                    <span className="font-medium">{i + 1}</span>
                    <span className="text-rm-success">{s ? s.workingCount + s.flexibleCount : 0}</span>
                    {s && s.onLeaveCount > 0 && <span className="text-rm-warning">{s.onLeaveCount}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="px-1 pt-2 text-xs text-rm-muted">Số xanh: đi làm. Số cam: nghỉ phép.</p>
        </div>
      )}
      <DaySheet date={day} departmentId={departmentId} onClose={() => setDay(null)} />
    </>
  );
}

function DaySheet({ date, departmentId, onClose }: { date: string | null; departmentId?: number; onClose: () => void }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['roster-day', date, departmentId],
    queryFn: () => getDepartmentRoster({ targetDate: date!, departmentId }),
    enabled: !!date,
  });
  const members: DepartmentRosterItem[] = data?.members ?? [];
  return (
    <Sheet open={!!date} onClose={onClose} title={date ? `Ngày ${date.split('-').reverse().join('/')}` : ''}>
      <div className="p-rm-gutter">
        {isLoading && <ListSkeleton rows={3} />}
        {isError && <ErrorState title="Không tải được" description="Thử lại sau." />}
        {data && members.length === 0 && <EmptyState title="Không có ai" description="Phòng ban chưa có nhân sự." />}
        {members.length > 0 && (
          <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge">
            {members.map((m) => (
              <li key={m.userId} className="flex min-h-rm-row items-center gap-3 px-rm-gutter py-2">
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="min-w-0 truncate text-sm font-medium">{m.fullName}</span>
                    <Badge tone={STATUS[m.status].tone}>{STATUS[m.status].label}</Badge>
                  </span>
                  <span className="block truncate text-xs text-rm-muted">
                    {m.shiftName ? `${m.shiftName} · ${hm(m.startTime)}–${hm(m.endTime)}` : (m.positionName ?? '–')}
                    {m.actualCheckIn ? ` · vào ${hm(m.actualCheckIn)}` : ''}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Sheet>
  );
}
