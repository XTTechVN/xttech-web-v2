'use client';

import { Check } from 'lucide-react';
import type { Brand } from '@/types';
import { cn } from '@/utils/cn';
import { BrandLogo } from '../configuration/brand/_components/brand-logo';

interface Props {
  brands: Brand[];
  value: number | null;
  onChange: (id: number) => void;
}

// Chọn hãng ngay trong bộ lọc: ô logo lớn, tên nhỏ bên dưới
export function BrandTiles({ brands, value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-500" id="brand-tiles-label">
        Hãng
      </span>
      <ul role="radiogroup" aria-labelledby="brand-tiles-label" className="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-2">
        {brands.map((b) => {
          const on = b.id === value;
          return (
            <li key={b.id} className="min-w-0">
              <button
                type="button"
                role="radio"
                aria-checked={on}
                title={b.name}
                onClick={() => onChange(b.id)}
                className="flex w-full min-w-0 cursor-pointer flex-col items-center gap-1 rounded-control p-1 transition active:scale-95"
              >
                <span className="relative w-full">
                  <BrandLogo brand={b} className={cn('aspect-square w-full', on ? 'border-primary ring-2 ring-primary/30' : 'md:hover:border-slate-400')} />
                  {on && (
                    <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-white">
                      <Check size={10} />
                    </span>
                  )}
                </span>
                <span className={cn('w-full truncate text-center text-xs', on ? 'font-medium text-primary' : 'text-slate-600')}>{b.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
