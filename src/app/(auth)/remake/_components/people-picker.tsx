'use client';

import { useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import { INPUT } from './form';
import { Sheet } from './sheet';
import type { PickOption } from './use-share-options';

interface Props {
  id: string;
  label: string;
  options: PickOption[];
  value: string[];
  onChange: (v: string[]) => void;
  searchLabel: string;
}

// Chọn nhiều (phòng ban / nhân sự): nút tóm tắt, bấm mở ngăn kéo có ô tìm và danh sách tích chọn.
export function PeoplePicker({ id, label, options, value, onChange, searchLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const shown = options.filter((o) => `${o.label} ${o.sub ?? ''}`.toLowerCase().includes(q.trim().toLowerCase()));
  const names = options.filter((o) => value.includes(o.value)).map((o) => o.label);
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <>
      <button
        type="button"
        id={id}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={cn(INPUT, 'flex items-center justify-between gap-2 text-left')}
      >
        <span className={cn('min-w-0 flex-1 truncate', names.length === 0 && 'text-rm-muted')}>
          {names.length === 0 ? 'Chưa chọn' : names.length <= 2 ? names.join(', ') : `${names.slice(0, 2).join(', ')} +${names.length - 2}`}
        </span>
        <ChevronDown size={18} className="flex-none text-rm-muted" aria-hidden="true" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={`${label} (${value.length})`}>
        <div className="flex flex-col gap-2 p-rm-gutter pt-0">
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" aria-hidden="true" />
            <input
              type="search"
              aria-label={searchLabel}
              placeholder={searchLabel}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={`${INPUT} pl-10`}
            />
          </div>
          {shown.length === 0 && <p className="py-4 text-center text-sm text-rm-muted">Không có kết quả</p>}
          <ul className="divide-y divide-rm-line">
            {shown.map((o) => {
              const on = value.includes(o.value);
              return (
                <li key={o.value}>
                  <label className="flex min-h-rm-tap cursor-pointer items-center gap-3 py-2 text-sm">
                    <input type="checkbox" checked={on} onChange={() => toggle(o.value)} className="size-5 flex-none accent-rm-primary" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{o.label}</span>
                      {o.sub && <span className="block truncate text-xs text-rm-muted">{o.sub}</span>}
                    </span>
                    {on && <Check size={16} className="flex-none text-rm-primary" aria-hidden="true" />}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      </Sheet>
    </>
  );
}
