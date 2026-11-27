'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';

interface TabsProps<T extends string> {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}

/** Tab gạch chân, cuộn ngang khi hẹp; tab đang chọn tự cuộn vào giữa. Chỉ một tab thì không hiện */
export function Tabs<T extends string>({ tabs, value, onChange, label, className }: TabsProps<T>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [value]);

  if (tabs.length < 2) return null;
  return (
    <div
      ref={ref}
      role="tablist"
      aria-label={label}
      className={cn(
        'flex flex-none gap-5 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-slate-200 px-4',
        className,
      )}
    >
      {tabs.map((t) => {
        const on = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.value)}
            className={cn(
              '-mb-px min-h-11 flex-none cursor-pointer whitespace-nowrap border-b-2 text-sm transition active:scale-95 md:min-h-10',
              on ? 'border-primary font-medium text-primary' : 'border-transparent text-slate-500 md:hover:text-slate-900',
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export type RequestTab = 'review' | 'all' | 'mine';

const REQUEST_TAB_LABEL: Record<RequestTab, string> = { review: 'Cần duyệt', all: 'Tất cả', mine: 'Của tôi' };

/**
 * Tab của trang đơn (nghỉ phép, khiếu nại, đề xuất), bật độc lập theo quyền:
 * Cần duyệt (đọc rộng + quyền duyệt) → Tất cả (đọc rộng) → Của tôi (được tạo hoặc chỉ đọc phạm vi own)
 */
export function requestTabs({ readWide, canReview, canCreate }: { readWide: boolean; canReview: boolean; canCreate: boolean }) {
  const tabs: RequestTab[] = [];
  if (readWide && canReview) tabs.push('review');
  if (readWide) tabs.push('all');
  if (canCreate || !readWide) tabs.push('mine');
  return tabs.map((value) => ({ value, label: REQUEST_TAB_LABEL[value] }));
}
