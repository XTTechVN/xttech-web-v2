'use client';

import { ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { DateTimeField, IconAction } from '@/components-remake';

export interface Period {
  mode: 'month' | 'range';
  /** YYYY-MM */
  month: string;
  from: string;
  to: string;
}

export const currentMonth = () => new Date().toISOString().slice(0, 7);

const pad = (n: number) => String(n).padStart(2, '0');

/** Khoảng ngày [từ, đến] (YYYY-MM-DD) mà bộ chọn đang biểu diễn; rỗng nghĩa là không giới hạn */
export function periodRange(p: Period): { from: string; to: string } {
  if (p.mode === 'range') return { from: p.from, to: p.to };
  const [y, m] = p.month.split('-').map(Number);
  if (!y || !m) return { from: '', to: '' };
  return { from: `${y}-${pad(m)}-01`, to: `${y}-${pad(m)}-${pad(new Date(y, m, 0).getDate())}` };
}

const shift = (month: string, delta: number) => {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

// Hàng chọn kỳ xem dưới thanh công cụ: theo tháng (có nút tháng trước/sau) hoặc khoảng từ ngày – đến ngày
export function PeriodBar({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const isMonth = value.mode === 'month';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-label={isMonth ? 'Đang xem theo tháng. Bấm để chọn từ ngày đến ngày' : 'Đang xem từ ngày đến ngày. Bấm để chọn theo tháng'}
        title={isMonth ? 'Theo tháng · bấm để đổi sang từ – đến ngày' : 'Từ – đến ngày · bấm để đổi sang theo tháng'}
        onClick={() => onChange({ ...value, mode: isMonth ? 'range' : 'month' })}
        className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-control border border-slate-200 bg-white text-slate-600 transition active:scale-95 md:size-10 md:hover:bg-slate-50"
      >
        <ArrowLeftRight size={16} />
      </button>
      {isMonth ? (
        <div className="flex min-w-0 flex-1 items-center gap-1 md:flex-none">
          <IconAction label="Tháng trước" onClick={() => onChange({ ...value, month: shift(value.month, -1) })}>
            <ChevronLeft size={18} />
          </IconAction>
          <DateTimeField
            label="Tháng xem"
            hideLabel
            mode="month"
            value={value.month}
            onChange={(month) => month && onChange({ ...value, month })}
            className="min-w-0 flex-1 md:w-40 md:flex-none"
          />
          <IconAction label="Tháng sau" onClick={() => onChange({ ...value, month: shift(value.month, 1) })}>
            <ChevronRight size={18} />
          </IconAction>
        </div>
      ) : (
        <>
          <span className="min-w-0 flex-1 text-sm text-slate-600 md:hidden">Từ ngày – đến ngày</span>
          <div className="grid w-full grid-cols-[repeat(2,minmax(0,1fr))] gap-2 md:flex md:w-auto md:items-center">
            <DateTimeField
              label="Từ ngày"
              hideLabel
              value={value.from}
              max={value.to || undefined}
              onChange={(from) => onChange({ ...value, from })}
              className="min-w-0 md:w-40"
            />
            <span className="hidden text-slate-400 md:inline">–</span>
            <DateTimeField
              label="Đến ngày"
              hideLabel
              value={value.to}
              min={value.from || undefined}
              onChange={(to) => onChange({ ...value, to })}
              className="min-w-0 md:w-40"
            />
          </div>
        </>
      )}
    </div>
  );
}
