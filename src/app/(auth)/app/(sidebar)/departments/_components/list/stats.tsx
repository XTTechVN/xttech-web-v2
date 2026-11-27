import { useMemo, useState } from 'react';
import { Building2, CalendarPlus } from 'lucide-react';
import type { Department } from '@/types';

const NEW_DAYS = 30;

// Hai số tính từ danh sách đã tải (API chưa trả số nhân sự mỗi phòng nên không có thẻ đó)
export function DepartmentStats({ rows }: { rows: Department[] }) {
  const [now] = useState(() => Date.now());
  const items = useMemo(() => {
    const since = now - NEW_DAYS * 86_400_000;
    return [
      { label: 'Phòng ban', value: rows.length, icon: Building2 },
      { label: `Mới ${NEW_DAYS} ngày`, value: rows.filter((r) => new Date(r.createdAt).getTime() >= since).length, icon: CalendarPlus },
    ];
  }, [rows, now]);

  return (
    <dl className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2 md:gap-3">
      {items.map(({ label, value, icon: Icon }) => (
        <div key={label} className="flex min-w-0 items-center gap-3 rounded-block border border-slate-200/80 bg-white p-3 md:p-4">
          <span className="flex size-9 flex-none items-center justify-center rounded-control bg-primary/5 text-primary md:size-10">
            <Icon size={18} />
          </span>
          <div className="min-w-0">
            <dt className="truncate text-xs text-slate-500">{label}</dt>
            <dd className="font-heading text-xl font-semibold tabular-nums text-slate-900 md:text-2xl">{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
