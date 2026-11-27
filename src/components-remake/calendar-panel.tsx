'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { pad, todayIso } from './date-time-utils';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const NAV = 'flex size-11 cursor-pointer items-center justify-center rounded-full text-slate-600 active:bg-slate-100 md:size-9 md:hover:bg-slate-100';
const CELL =
  'flex h-11 cursor-pointer items-center justify-center rounded-control text-sm tabular-nums active:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 md:h-9 md:hover:bg-slate-100';

interface Props {
  /** YYYY-MM-DD hoặc rỗng */
  value: string;
  min?: string;
  max?: string;
  onPick: (iso: string) => void;
}

// Lịch tháng bắt đầu từ thứ Hai; bấm ngày để chọn
export function CalendarPanel({ value, min, max, onPick }: Props) {
  const seed = value || todayIso();
  const [view, setView] = useState({ y: Number(seed.slice(0, 4)), m: Number(seed.slice(5, 7)) - 1 });
  const today = todayIso();

  const move = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };
  const first = new Date(view.y, view.m, 1);
  const lead = (first.getDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(view.y, view.m, 1 - lead + i);
    return { iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, day: d.getDate(), other: d.getMonth() !== view.m };
  });
  const off = (iso: string) => (!!min && iso < min) || (!!max && iso > max);

  return (
    <div>
      <div className="flex items-center justify-between">
        <button type="button" aria-label="Tháng trước" className={NAV} onClick={() => move(-1)}>
          <ChevronLeft size={18} />
        </button>
        <p className="text-sm font-medium text-slate-900" aria-live="polite">
          Tháng {view.m + 1}, {view.y}
        </p>
        <button type="button" aria-label="Tháng sau" className={NAV} onClick={() => move(1)}>
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="mt-1 grid grid-cols-7 text-center text-xs text-slate-500">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1">
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((c) => (
          <button
            key={c.iso}
            type="button"
            disabled={off(c.iso)}
            aria-pressed={c.iso === value}
            aria-label={c.iso.split('-').reverse().join('/')}
            onClick={() => onPick(c.iso)}
            className={cn(
              CELL,
              c.other && 'text-slate-400',
              c.iso === today && 'font-semibold text-primary',
              c.iso === value && 'bg-primary font-medium text-white active:bg-primary md:hover:bg-primary',
            )}
          >
            {c.day}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-between border-t border-slate-100 pt-2">
        <button
          type="button"
          disabled={off(today)}
          onClick={() => onPick(today)}
          className="min-h-11 cursor-pointer px-2 text-sm font-medium text-primary disabled:opacity-40 md:min-h-9"
        >
          Hôm nay
        </button>
      </div>
    </div>
  );
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i);

// Lưới 12 tháng của một năm, dùng cho ô chọn tháng
export function MonthPanel({ value, onPick }: { value: string; onPick: (ym: string) => void }) {
  const seed = value || todayIso();
  const [year, setYear] = useState(Number(seed.slice(0, 4)));
  const now = todayIso().slice(0, 7);
  return (
    <div>
      <div className="flex items-center justify-between">
        <button type="button" aria-label="Năm trước" className={NAV} onClick={() => setYear((y) => y - 1)}>
          <ChevronLeft size={18} />
        </button>
        <p className="text-sm font-medium text-slate-900">Năm {year}</p>
        <button type="button" aria-label="Năm sau" className={NAV} onClick={() => setYear((y) => y + 1)}>
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1">
        {MONTHS.map((m) => {
          const ym = `${year}-${pad(m + 1)}`;
          return (
            <button
              key={ym}
              type="button"
              aria-pressed={ym === value}
              onClick={() => onPick(ym)}
              className={cn(
                CELL,
                'h-11',
                ym === now && 'font-semibold text-primary',
                ym === value && 'bg-primary font-medium text-white active:bg-primary md:hover:bg-primary',
              )}
            >
              Tháng {m + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
