'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { DayPanel, MonthPanel, TimePanel } from './date-panels';
import { BTN_PRIMARY, INPUT } from './form';
import { Sheet } from './sheet';

type Mode = 'date' | 'month' | 'time';

interface DatePickerProps {
  id: string;
  label: string;
  value: string; // date: YYYY-MM-DD · month: YYYY-MM · time: HH:mm (giống ô gốc)
  onChange: (value: string) => void;
  mode?: Mode;
  disabled?: boolean;
}

const shown = (mode: Mode, v: string) => (mode === 'time' ? v : v.split('-').reverse().join('/'));
const EMPTY = { date: 'Chọn ngày', month: 'Chọn tháng', time: 'Chọn giờ' } as const;

// Chọn ngày / tháng / giờ: từ 768px mở bảng thả xuống ngay dưới ô, điện thoại mở ngăn kéo từ đáy.
export function DatePicker({ id, label, value, onChange, mode = 'date', disabled }: DatePickerProps) {
  const [open, setOpen] = useState<'menu' | 'drawer' | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const Icon = mode === 'time' ? Clock : CalendarDays;

  useEffect(() => {
    if (open !== 'menu') return;
    const close = (e: Event) => {
      if (e.type === 'keydown' ? (e as KeyboardEvent).key === 'Escape' : !root.current?.contains(e.target as Node)) {
        setOpen(null);
        if (e.type === 'keydown') {
          e.stopPropagation(); // chỉ đóng bảng, không đóng sheet bên ngoài
          root.current?.querySelector('button')?.focus();
        }
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close, true);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close, true);
    };
  }, [open]);

  const pick = (v: string) => {
    onChange(v);
    if (mode !== 'time') setOpen(null); // giờ cần chọn hai cột nên chốt bằng nút Xong
  };
  const body = (
    <>
      {mode === 'date' && <DayPanel value={value} onPick={pick} />}
      {mode === 'month' && <MonthPanel value={value} onPick={pick} />}
      {mode === 'time' && (
        <>
          <TimePanel value={value} onPick={pick} />
          <button type="button" onClick={() => setOpen(null)} className={cn(BTN_PRIMARY, 'mt-3 w-full')}>
            Xong
          </button>
        </>
      )}
    </>
  );

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        id={id}
        aria-label={`${label}: ${value ? shown(mode, value) : EMPTY[mode]}`}
        aria-haspopup="dialog"
        aria-expanded={open === 'menu'}
        disabled={disabled}
        onClick={() => setOpen(window.matchMedia('(min-width: 768px)').matches ? 'menu' : 'drawer')}
        className={cn(INPUT, 'flex items-center justify-between gap-2 text-left disabled:opacity-60')}
      >
        <span className={cn('min-w-0 flex-1 truncate', !value && 'text-rm-muted')}>{value ? shown(mode, value) : EMPTY[mode]}</span>
        <Icon size={18} className="flex-none text-rm-muted" aria-hidden="true" />
      </button>

      {open === 'menu' && (
        <div
          role="dialog"
          aria-label={label}
          className={cn(
            'absolute left-0 top-full z-20 mt-1 rounded-rm border border-rm-line bg-rm-surface p-2 shadow-rm-pop',
            mode === 'time' ? 'w-56' : 'w-72',
          )}
        >
          {body}
        </div>
      )}

      <Sheet open={open === 'drawer'} onClose={() => setOpen(null)} title={label}>
        <div className="px-rm-gutter py-3">{body}</div>
      </Sheet>
    </div>
  );
}
