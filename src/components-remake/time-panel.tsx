'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import { pad } from './date-time-utils';

const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 60 }, (_, i) => pad(i));

function Column({ label, items, selected, onPick }: { label: string; items: string[]; selected: string; onPick: (v: string) => void }) {
  const ref = useRef<HTMLUListElement>(null);

  // Mở ra là cuộn sẵn tới mục đang chọn (chỉ cuộn trong cột, không kéo cả trang)
  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (el && ref.current) ref.current.scrollTop = el.offsetTop - ref.current.clientHeight / 2 + el.offsetHeight / 2;
  }, []);

  return (
    <div className="min-w-0 flex-1">
      <p className="pb-1 text-center text-xs text-slate-500">{label}</p>
      <ul ref={ref} role="listbox" aria-label={label} className="relative h-52 overflow-y-auto rounded-control border border-slate-200">
        {items.map((v) => (
          <li key={v} role="option" aria-selected={v === selected}>
            <button
              type="button"
              onClick={() => onPick(v)}
              className={cn(
                'flex h-11 w-full cursor-pointer items-center justify-center text-sm tabular-nums active:bg-slate-100 md:h-9 md:hover:bg-slate-100',
                v === selected && 'bg-primary font-medium text-white active:bg-primary md:hover:bg-primary',
              )}
            >
              {v}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Hai cột cuộn: giờ và phút; chọn là áp dụng ngay
export function TimePanel({ value, onChange }: { value: string; onChange: (hhmm: string) => void }) {
  const [h = '', m = ''] = value.split(':');
  return (
    <div className="flex gap-2">
      <Column label="Giờ" items={HOURS} selected={h} onPick={(v) => onChange(`${v}:${m || '00'}`)} />
      <Column label="Phút" items={MINUTES} selected={m} onPick={(v) => onChange(`${h || '00'}:${v}`)} />
    </div>
  );
}
