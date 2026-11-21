import { getAttendanceStatusInfo, type Attendance } from '@/types';
import { Badge } from '../../_components/badge';
import type { Column } from '../../_components/data-list';
import { hm, TONE } from '../../attendances/_components/attendance-sheet';

export const dayLabel = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
const badge = (a: Attendance) => {
  const s = getAttendanceStatusInfo(a.status);
  return <Badge tone={TONE[s.variant]}>{s.label}</Badge>;
};
const time = (v: string | null | undefined) => hm(v) || '--:--';

// showName: xem nhiều người thì thêm cột nhân viên
export const historyColumns = (showName: boolean): Column<Attendance>[] => [
  { key: 'day', header: 'Ngày', fit: true, cell: (a) => <span className="font-medium">{dayLabel(a.workDate)}</span> },
  ...(showName ? [{ key: 'name', header: 'Nhân viên', cell: (a: Attendance) => a.user?.fullName || 'Không rõ nhân viên' }] : []),
  { key: 'in', header: 'Giờ vào', fit: true, cell: (a) => time(a.checkIn) },
  { key: 'out', header: 'Giờ ra', fit: true, cell: (a) => time(a.checkOut) },
  { key: 'hours', header: 'Số giờ', fit: true, align: 'right', cell: (a) => (a.totalHours ? `${a.totalHours} giờ` : '–') },
  { key: 'status', header: 'Trạng thái', fit: true, cell: badge },
];

export function HistoryCard({ a, showName }: { a: Attendance; showName: boolean }) {
  return (
    <>
      <span className="block truncate text-sm font-medium">{dayLabel(a.workDate)}</span>
      <span className="flex items-center gap-2">
        {badge(a)}
        <span className="min-w-0 truncate text-xs text-rm-muted">
          {time(a.checkIn)} → {time(a.checkOut)}
          {a.totalHours ? ` · ${a.totalHours} giờ` : ''}
        </span>
      </span>
      {showName && <span className="block truncate text-xs text-rm-muted">{a.user?.fullName || 'Không rõ nhân viên'}</span>}
    </>
  );
}
