'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { INPUT } from './form';
import { Sheet } from './sheet';

export interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Một nút chọn: từ 768px mở menu thả xuống ngay dưới ô, điện thoại mở ngăn kéo từ đáy.
export function Select({ id, label, value, options, onChange, disabled }: SelectProps) {
  const [mode, setMode] = useState<'menu' | 'drawer' | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value)?.label ?? '';

  useEffect(() => {
    if (mode !== 'menu') return;
    const close = (e: Event) => {
      if (e.type === 'keydown' ? (e as KeyboardEvent).key === 'Escape' : !root.current?.contains(e.target as Node)) {
        setMode(null);
        if (e.type === 'keydown') {
          e.stopPropagation(); // chỉ đóng menu, không đóng sheet bên ngoài
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
  }, [mode]);

  const pick = (v: string) => {
    onChange(v);
    setMode(null);
  };
  const row = (o: Option, cls: string) => (
    <button
      type="button"
      role="option"
      aria-selected={o.value === value}
      onClick={() => pick(o.value)}
      className={cn(
        'flex w-full items-center gap-3 px-3 text-left active:bg-rm-bg',
        cls,
        o.value === value ? 'font-medium text-rm-primary' : 'text-rm-text',
      )}
    >
      <span className="min-w-0 flex-1 truncate">{o.label}</span>
      {o.value === value && <Check size={16} className="flex-none" aria-hidden="true" />}
    </button>
  );

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        id={id}
        aria-label={`${label}: ${current}`}
        aria-haspopup="listbox"
        aria-expanded={mode === 'menu'}
        disabled={disabled}
        onClick={() => setMode(window.matchMedia('(min-width: 768px)').matches ? 'menu' : 'drawer')}
        className={cn(INPUT, 'flex items-center justify-between gap-2 text-left disabled:opacity-60')}
      >
        <span className="min-w-0 flex-1 truncate">{current}</span>
        <ChevronDown
          size={18}
          className={cn('flex-none text-rm-muted transition-transform duration-(--rm-dur-fast)', mode === 'menu' && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {mode === 'menu' && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-rm border border-rm-line bg-rm-surface py-1 text-sm shadow-rm-pop"
        >
          {options.map((o) => (
            <div key={o.value} className="md:hover:bg-rm-bg">
              {row(o, 'min-h-rm-control')}
            </div>
          ))}
        </div>
      )}

      <Sheet open={mode === 'drawer'} onClose={() => setMode(null)} title={label}>
        <div role="listbox" aria-label={label} className="flex flex-col py-1">
          {options.map((o) => (
            <div key={o.value}>{row(o, 'min-h-rm-tap px-rm-gutter text-base')}</div>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
