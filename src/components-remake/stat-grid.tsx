import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Chênh so với kỳ trước (nếu có); chỉ hiện từ 768px */
  diff?: number;
}

// Số cột từ 768px theo số thẻ, để hàng luôn kín chiều ngang (tối đa 4 cột)
const COLS: Record<number, string> = {
  1: 'md:grid-cols-[repeat(1,minmax(0,1fr))]',
  2: 'md:grid-cols-[repeat(2,minmax(0,1fr))]',
  3: 'md:grid-cols-[repeat(3,minmax(0,1fr))]',
};

/** Thẻ thống kê của các trang danh sách: 2 cột trên điện thoại (thẻ lẻ cuối chiếm cả hàng), từ 768px chia đều theo số thẻ */
export function StatGrid({ items, diffSuffix = 'so với hôm qua' }: { items: StatItem[]; diffSuffix?: string }) {
  return (
    <dl className={cn('grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2 md:gap-3', COLS[items.length] ?? 'md:grid-cols-[repeat(4,minmax(0,1fr))]')}>
      {items.map(({ label, value, icon: Icon, diff }, i) => (
        <div
          key={label}
          className={cn(
            'flex min-w-0 items-center gap-3 rounded-block border border-slate-200/80 bg-white p-3 md:p-4',
            items.length % 2 === 1 && i === items.length - 1 && 'col-span-2 md:col-span-1',
          )}
        >
          <span className="flex size-9 flex-none items-center justify-center rounded-control bg-primary/5 text-primary md:size-10">
            <Icon size={18} />
          </span>
          <div className="min-w-0">
            <dt className="truncate text-xs text-slate-500">{label}</dt>
            <dd className="flex items-baseline gap-1.5">
              <span className="font-heading text-xl font-semibold tabular-nums text-slate-900 md:text-2xl">{value}</span>
              {!!diff && (
                <span className="hidden text-xs tabular-nums text-slate-500 md:inline">
                  {diff > 0 ? `+${diff}` : diff} {diffSuffix}
                </span>
              )}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
