import type { Attendance } from '@/types';

// Tổng hợp một người trong tháng: số ngày có công, tổng giờ, số lần trễ, số lần thiếu giờ ra.
export function HistorySummary({ items }: { items: Attendance[] }) {
  const days = new Set(items.filter((a) => a.checkIn).map((a) => a.workDate)).size;
  const hours = items.reduce((t, a) => t + (a.totalHours ?? 0), 0);
  const stats = [
    ['Ngày công', days],
    ['Giờ làm', Math.round(hours * 10) / 10],
    ['Đi trễ', items.filter((a) => a.isLate).length],
    ['Thiếu giờ ra', items.filter((a) => a.status === 'missing_checkout').length],
  ];
  return (
    <dl className="mb-3 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 md:grid-cols-[repeat(4,minmax(0,1fr))]">
      {stats.map(([label, value]) => (
        <div key={label} className="rounded-rm-xl border border-rm-edge bg-rm-surface p-3">
          <dd className="font-heading text-2xl font-semibold">{value}</dd>
          <dt className="text-xs text-rm-muted">{label}</dt>
        </div>
      ))}
    </dl>
  );
}
