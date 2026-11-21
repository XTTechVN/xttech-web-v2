import { getAttendanceStatusInfo, type Attendance } from '@/types';
import { Badge } from '../../_components/badge';
import type { Column } from '../../_components/data-list';
import { hm, TONE } from './attendance-sheet';

const badge = (a: Attendance) => {
  const s = getAttendanceStatusInfo(a.status);
  return <Badge tone={TONE[s.variant]}>{s.label}</Badge>;
};
const name = (a: Attendance) => a.user?.fullName || 'Không rõ nhân viên';
const time = (v: string | null | undefined) => hm(v) || '--:--';

export const attendanceColumns: Column<Attendance>[] = [
  { key: 'name', header: 'Nhân viên', cell: (a) => <span className="font-medium">{name(a)}</span> },
  { key: 'in', header: 'Giờ vào', fit: true, cell: (a) => time(a.checkIn) },
  { key: 'out', header: 'Giờ ra', fit: true, cell: (a) => time(a.checkOut) },
  { key: 'hours', header: 'Số giờ', fit: true, align: 'right', cell: (a) => (a.totalHours ? `${a.totalHours} giờ` : '–') },
  { key: 'status', header: 'Trạng thái', fit: true, cell: badge },
];

export function AttendanceCard({ a }: { a: Attendance }) {
  return (
    <>
      <span className="block truncate text-sm font-medium">{name(a)}</span>
      <span className="flex items-center gap-2">
        {badge(a)}
        <span className="min-w-0 truncate text-xs text-rm-muted">
          {time(a.checkIn)} → {time(a.checkOut)}
          {a.totalHours ? ` · ${a.totalHours} giờ` : ''}
        </span>
      </span>
    </>
  );
}
