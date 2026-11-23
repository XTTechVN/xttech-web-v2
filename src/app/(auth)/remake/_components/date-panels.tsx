'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

const pad = (n: number) => String(n).padStart(2, '0');
const WEEK = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const NAV =
  'flex size-rm-tap flex-none items-center justify-center rounded-rm text-rm-muted transition-[background-color,transform] duration-(--rm-dur-fast) active:scale-95 active:bg-rm-bg md:size-rm-control md:hover:bg-rm-bg';
const CELL =
  'flex h-rm-tap w-full items-center justify-center rounded-rm text-base transition-[background-color,transform] duration-(--rm-dur-fast) active:scale-95 md:h-10 md:text-sm';
const ON = 'bg-rm-primary font-medium text-rm-on-primary';
const IDLE = 'text-rm-text active:bg-rm-bg md:hover:bg-rm-bg';

export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function Header({ title, onPrev, onNext, onTitle }: { title: string; onPrev: () => void; onNext: () => void; onTitle?: () => void }) {
  return (
    <div className="mb-2 flex items-center">
      <button type="button" onClick={onPrev} aria-label="Trước" className={NAV}>
        <ChevronLeft size={20} aria-hidden="true" />
      </button>
      {onTitle ? (
        <button
          type="button"
          onClick={onTitle}
          className="h-rm-tap min-w-0 flex-1 truncate rounded-rm text-center text-sm font-medium text-rm-text active:bg-rm-bg md:h-rm-control md:hover:bg-rm-bg"
        >
          {title}
        </button>
      ) : (
        <span className="min-w-0 flex-1 truncate text-center text-sm font-medium text-rm-text">{title}</span>
      )}
      <button type="button" onClick={onNext} aria-label="Sau" className={NAV}>
        <ChevronRight size={20} aria-hidden="true" />
      </button>
    </div>
  );
}

// value dạng YYYY-MM
export function MonthPanel({ value, onPick }: { value: string; onPick: (ym: string) => void }) {
  const [year, setYear] = useState(() => Number(value.slice(0, 4)) || new Date().getFullYear());
  const now = dayKey(new Date()).slice(0, 7);
  return (
    <div>
      <Header title={String(year)} onPrev={() => setYear(year - 1)} onNext={() => setYear(year + 1)} />
      <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-1">
        {Array.from({ length: 12 }, (_, i) => {
          const ym = `${year}-${pad(i + 1)}`;
          return (
            <button
              key={ym}
              type="button"
              aria-pressed={ym === value}
              onClick={() => onPick(ym)}
              className={cn(CELL, ym === value ? ON : IDLE, ym !== value && ym === now && 'border border-rm-primary text-rm-primary')}
            >
              Tháng {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// value dạng YYYY-MM-DD, tuần bắt đầu từ thứ hai
export function DayPanel({ value, onPick }: { value: string; onPick: (d: string) => void }) {
  const start = value ? new Date(`${value}T00:00:00`) : new Date();
  const [view, setView] = useState({ y: start.getFullYear(), m: start.getMonth() });
  const [months, setMonths] = useState(false);
  const today = dayKey(new Date());

  const go = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  if (months) {
    return (
      <MonthPanel
        value={`${view.y}-${pad(view.m + 1)}`}
        onPick={(ym) => {
          setView({ y: Number(ym.slice(0, 4)), m: Number(ym.slice(5)) - 1 });
          setMonths(false);
        }}
      />
    );
  }

  const offset = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, i) => new Date(view.y, view.m, 1 - offset + i));
  return (
    <div>
      <Header title={`Tháng ${view.m + 1}, ${view.y}`} onPrev={() => go(-1)} onNext={() => go(1)} onTitle={() => setMonths(true)} />
      <div className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-y-1 text-center text-xs text-rm-muted">
        {WEEK.map((w) => (
          <span key={w} className="py-1">
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-y-1">
        {cells.map((d) => {
          const k = dayKey(d);
          const on = k === value;
          return (
            <button
              key={k}
              type="button"
              aria-pressed={on}
              aria-label={d.toLocaleDateString('vi-VN')}
              onClick={() => onPick(k)}
              className={cn(
                CELL,
                on ? ON : IDLE,
                !on && d.getMonth() !== view.m && 'text-rm-muted',
                !on && k === today && 'border border-rm-primary text-rm-primary',
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onPick(today)}
        className="mt-2 h-rm-tap w-full rounded-rm text-sm font-medium text-rm-primary active:bg-rm-bg md:h-rm-control md:hover:bg-rm-bg"
      >
        Hôm nay
      </button>
    </div>
  );
}

function Column({ label, items, selected, onSelect }: { label: string; items: string[]; selected: string; onSelect: (v: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (box.current && el) box.current.scrollTop = el.offsetTop - box.current.clientHeight / 2 + el.clientHeight / 2;
  }, []);
  return (
    <div ref={box} role="group" aria-label={label} className="relative h-56 min-w-0 flex-1 overflow-y-auto rounded-rm border border-rm-line p-1">
      {items.map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={v === selected}
          onClick={() => onSelect(v)}
          className={cn(CELL, 'mb-1 last:mb-0', v === selected ? ON : IDLE)}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 60 }, (_, i) => pad(i));

// value dạng HH:mm; chọn giờ mà chưa có phút thì phút = 00
export function TimePanel({ value, onPick }: { value: string; onPick: (t: string) => void }) {
  const [h, m] = value ? value.split(':') : ['', ''];
  return (
    <div className="flex gap-2">
      <Column label="Giờ" items={HOURS} selected={h} onSelect={(v) => onPick(`${v}:${m || '00'}`)} />
      <Column label="Phút" items={MINUTES} selected={m} onSelect={(v) => onPick(`${h || '00'}:${v}`)} />
    </div>
  );
}
