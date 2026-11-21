'use client';

import { Route, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { StaffLiveLocation } from '@/types';
import { INPUT } from '../../_components/form';

export interface RouteView {
  staff: StaffLiveLocation;
  date: string;
  shiftOnly: boolean;
}

interface Props {
  view: RouteView;
  onChange: (v: RouteView) => void;
  onClose: () => void;
  status: 'loading' | 'error' | 'empty' | 'ready';
  points: number;
  km?: number;
}

// Lộ trình của một người: chọn ngày, cả ngày hoặc chỉ ca đang mở. Thay chỗ danh sách nhân sự khi đang xem.
export function RoutePanel({ view, onChange, onClose, status, points, km }: Props) {
  const text =
    status === 'loading'
      ? 'Đang tải…'
      : status === 'error'
        ? 'Không tải được lộ trình'
        : status === 'empty'
          ? 'Chưa có lộ trình trong ngày này'
          : `${points} điểm${km ? ` · ${km.toFixed(1)} km` : ''}`;
  return (
    <section aria-label="Lộ trình" className="flex flex-col gap-2 rounded-rm-xl border border-rm-edge bg-rm-surface p-3 shadow-sm xl:shadow-none">
      <div className="flex items-center gap-2">
        <Route size={18} className="flex-none text-rm-primary" aria-hidden="true" />
        <p className="min-w-0 flex-1 truncate text-sm font-medium">Lộ trình · {view.staff.userName}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng lộ trình"
          className="-mr-2 flex size-11 flex-none items-center justify-center rounded-rm active:bg-rm-bg"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={view.date}
          max={new Date().toLocaleDateString('sv-SE')}
          onChange={(e) => e.target.value && onChange({ ...view, date: e.target.value })}
          aria-label="Ngày xem lộ trình"
          className={`${INPUT} min-w-0 flex-1`}
        />
        {view.staff.attendanceId && (
          <div role="tablist" aria-label="Phạm vi lộ trình" className="flex flex-none gap-1 rounded-rm bg-rm-line p-0.5">
            {[
              { v: true, label: 'Ca này' },
              { v: false, label: 'Cả ngày' },
            ].map((o) => (
              <button
                key={o.label}
                type="button"
                role="tab"
                aria-selected={view.shiftOnly === o.v}
                onClick={() => onChange({ ...view, shiftOnly: o.v })}
                className={cn('h-9 rounded-rm-sm px-3 text-xs font-medium', view.shiftOnly === o.v ? 'bg-rm-surface text-rm-text' : 'text-rm-muted')}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className={cn('text-xs', status === 'error' ? 'text-rm-danger' : 'text-rm-muted')} role="status">
        {text}
      </p>
    </section>
  );
}
