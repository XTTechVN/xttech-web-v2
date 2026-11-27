'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '../button';
import Modal from '../modal';
import Select from '../select';
import type { ITableFilterProps } from './types';

/** Gom mọi bộ lọc vào một nút "Bộ lọc"; mở hộp thoại (toàn màn hình trên điện thoại) chứa các ô chọn. */
export function TableFilterPanel({ filters }: { filters: ITableFilterProps[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const activeCount = filters.filter((f) => f.value).length;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-control border bg-white px-3 text-sm font-semibold shadow-xs transition cursor-pointer select-none',
          activeCount > 0 ? 'border-primary text-primary' : 'border-gray-300 text-gray-600',
        )}
      >
        <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
        <span>Bộ lọc</span>
        {activeCount > 0 && (
          <span className="flex min-w-5 items-center justify-center rounded-control bg-primary px-1.5 text-xs font-semibold text-white">{activeCount}</span>
        )}
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Bộ lọc"
        size="sm"
        footer={
          <div className="flex w-full items-center justify-between gap-2">
            <Button variant="outline" size="sm" disabled={activeCount === 0} onClick={() => filters.forEach((f) => f.onChange?.(undefined))}>
              Đặt lại
            </Button>
            <Button size="sm" onClick={() => setIsOpen(false)}>Áp dụng</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          {filters.map((f) => (
            <Select
              key={f.label}
              fullWidth
              label={f.label}
              value={f.value ?? ''}
              options={(f.options ?? []).map((o) => ({ value: o.value ?? '', label: o.label }))}
              onChange={(e) => f.onChange?.(e.target.value || undefined)}
            />
          ))}
        </div>
      </Modal>
    </>
  );
}
