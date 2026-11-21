'use client';

import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getAdjustmentRequests, getAttendances, getLeaveRequests, getProjects, getSuggestions } from '@/actions';
import { cn } from '@/utils/cn';

const DAY_NAMES = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// 14 ngày liên tiếp: thứ 2 tuần trước đến chủ nhật tuần này (giờ địa phương)
function fortnight() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7) - 7);
  return Array.from({ length: 14 }, (_, i) => ymd(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)));
}

// Đếm số bản ghi rơi vào từng ngày (0..13)
const bucket = (days: string[], dates: (string | null | undefined)[]) => days.map((d) => dates.filter((x) => x?.slice(0, 10) === d).length);

interface Series {
  key: string;
  label: string;
  color: string;
  show: boolean;
  load: (days: string[]) => Promise<number[]>;
}

// Biểu đồ đường 7 ngày: mỗi chỉ số một màu, chuyển tuần này / tuần trước.
export function WeekTrend({ can }: { can: (code: string) => boolean }) {
  const [week, setWeek] = useState(1);
  const [hidden, setHidden] = useState<string[]>([]);
  const days = fortnight();
  const range = { startDate: days[0], endDate: days[13] };

  const defs: Series[] = [
    {
      key: 'present',
      label: 'Có mặt',
      color: 'var(--color-rm-chart-1)',
      show: can('attendance:read'),
      load: async (d) =>
        bucket(
          d,
          (await getAttendances({ ...range, limit: 500 })).items.map((a) => a.workDate),
        ),
    },
    {
      key: 'leave',
      label: 'Nghỉ phép',
      color: 'var(--color-rm-chart-2)',
      show: can('leave_request:read'),
      load: async (d) => {
        const { items } = await getLeaveRequests({ fromDate: range.startDate, toDate: range.endDate, limit: 200 });
        const live = items.filter((l) => l.status !== 'rejected' && l.status !== 'cancelled');
        return d.map((day) => live.filter((l) => l.startDate.slice(0, 10) <= day && day <= l.endDate.slice(0, 10)).length);
      },
    },
    {
      key: 'adjust',
      label: 'Giải trình',
      color: 'var(--color-rm-chart-3)',
      show: can('attendance_request:read'),
      load: async (d) =>
        bucket(
          d,
          (await getAdjustmentRequests({ ...range, limit: 200 })).items.map((a) => a.workDate),
        ),
    },
    {
      key: 'project',
      label: 'Dự án mới',
      color: 'var(--color-rm-chart-4)',
      show: can('project:read'),
      load: async (d) =>
        bucket(
          d,
          (await getProjects({ limit: 200 })).items.map((p) => p.createdAt),
        ),
    },
    {
      key: 'suggest',
      label: 'Sáng kiến',
      color: 'var(--color-rm-chart-5)',
      show: can('suggestion:read'),
      load: async (d) =>
        bucket(
          d,
          (await getSuggestions({ limit: 200, offset: 0 })).items.map((s) => s.createdAt),
        ),
    },
  ];
  const all = defs.filter((s) => s.show);

  const results = useQueries({ queries: all.map((s) => ({ queryKey: ['dashboard-trend', s.key, days[0]], queryFn: () => s.load(days) })) });
  if (all.length === 0) return null;

  const offset = week === 0 ? 0 : 7;
  const view = all.map((s, i) => ({ ...s, values: (results[i].data ?? []).slice(offset, offset + 7), ready: !!results[i].data }));
  const on = view.filter((s) => !hidden.includes(s.key) && s.ready);
  const peak = Math.max(0, ...on.flatMap((s) => s.values));
  const max = Math.max(4, Math.ceil(peak / 2) * 2);
  const x = (i: number) => ((i + 0.5) / 7) * 100;
  const pt = (v: number, i: number) => `${x(i)},${100 - (v / max) * 100}`;

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <div className="mb-3 flex min-h-9 items-center gap-2 md:mb-2">
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">Số liệu trong tuần</h2>
        <div role="tablist" aria-label="Chọn tuần" className="flex flex-none gap-1 rounded-rm bg-rm-line p-0.5">
          {['Tuần trước', 'Tuần này'].map((label, i) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={week === i}
              onClick={() => setWeek(i)}
              className={cn('h-8 rounded-rm-sm px-3 text-xs font-medium', week === i ? 'bg-rm-surface text-rm-text' : 'text-rm-muted')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 rounded-rm-xl border border-rm-edge bg-rm-surface p-rm-gutter">
        <ul className="flex flex-wrap gap-2">
          {view.map((s) => {
            const off = hidden.includes(s.key);
            return (
              <li key={s.key}>
                <button
                  type="button"
                  aria-pressed={!off}
                  onClick={() => setHidden((h) => (off ? h.filter((k) => k !== s.key) : [...h, s.key]))}
                  className={cn(
                    'flex h-8 items-center gap-1.5 rounded-rm border border-rm-line px-2 text-xs',
                    off ? 'text-rm-muted' : 'text-rm-text',
                  )}
                >
                  <span
                    className="size-2 flex-none rounded-rm-sm"
                    style={{ background: off ? 'transparent' : s.color, boxShadow: `inset 0 0 0 1px ${s.color}` }}
                  />
                  {s.label} · {s.values.reduce((a, b) => a + b, 0)}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex h-44 gap-2">
          <span className="flex flex-none flex-col justify-between text-xs text-rm-muted">
            <span>{max}</span>
            <span>{max / 2}</span>
            <span>0</span>
          </span>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full min-w-0 flex-1 overflow-visible"
            role="img"
            aria-label="Biểu đồ đường số liệu 7 ngày"
          >
            {[0, 50, 100].map((y) => (
              <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="var(--color-rm-line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            ))}
            {on.map((s) => (
              <g key={s.key} stroke={s.color} fill="none" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke">
                <polyline points={s.values.map(pt).join(' ')} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                {s.values.map((v, i) => (
                  <path key={i} d={`M${x(i)} ${100 - (v / max) * 100}h0`} strokeWidth="7" vectorEffect="non-scaling-stroke" />
                ))}
              </g>
            ))}
          </svg>
        </div>
        <ol className="grid grid-cols-[repeat(7,minmax(0,1fr))] pl-6 text-center text-xs text-rm-muted">
          {DAY_NAMES.map((n, i) => (
            <li key={n}>
              {n}
              <span className="sr-only"> {days[offset + i]}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
