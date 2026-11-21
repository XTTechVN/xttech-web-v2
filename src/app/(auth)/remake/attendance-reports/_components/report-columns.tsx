import type { AttendanceReportItem } from '@/types';
import { Badge } from '../../_components/badge';
import type { Column } from '../../_components/data-list';

const name = (u: AttendanceReportItem) => u.fullName || u.username || 'Không rõ';

export const reportColumns: Column<AttendanceReportItem>[] = [
  { key: 'name', header: 'Nhân viên', cell: (u) => <span className="font-medium">{name(u)}</span> },
  { key: 'dept', header: 'Phòng ban', wideOnly: true, cell: (u) => u.departmentName ?? '–' },
  { key: 'days', header: 'Ngày công', fit: true, align: 'right', cell: (u) => u.workDays ?? u.totalAttendances },
  { key: 'hours', header: 'Giờ làm', fit: true, align: 'right', cell: (u) => u.totalHours },
  {
    key: 'late',
    header: 'Đi muộn',
    fit: true,
    align: 'right',
    cell: (u) => (u.lateDays > 0 ? <Badge tone="warning">{u.lateDays} ngày</Badge> : '–'),
  },
  {
    key: 'early',
    header: 'Về sớm',
    fit: true,
    align: 'right',
    wideOnly: true,
    cell: (u) => (u.earlyLeaveDays > 0 ? <Badge tone="warning">{u.earlyLeaveDays} ngày</Badge> : '–'),
  },
  {
    key: 'ot',
    header: 'Tăng ca',
    fit: true,
    align: 'right',
    cell: (u) => (u.overtimeDays > 0 ? <Badge tone="success">{u.overtimeHours} giờ</Badge> : '–'),
  },
];

export function ReportCard({ u }: { u: AttendanceReportItem }) {
  return (
    <>
      <span className="flex items-center gap-2">
        <span className="min-w-0 truncate text-sm font-medium">{name(u)}</span>
        {u.departmentName && <Badge tone="primary">{u.departmentName}</Badge>}
      </span>
      <span className="block truncate text-xs text-rm-muted">
        {u.workDays ?? u.totalAttendances} ngày công · {u.totalHours} giờ
      </span>
      {(u.lateDays > 0 || u.earlyLeaveDays > 0 || u.overtimeDays > 0) && (
        <span className="flex flex-wrap gap-1">
          {u.lateDays > 0 && <Badge tone="warning">Muộn {u.lateDays} ngày</Badge>}
          {u.earlyLeaveDays > 0 && <Badge tone="warning">Về sớm {u.earlyLeaveDays} ngày</Badge>}
          {u.overtimeDays > 0 && <Badge tone="success">Tăng ca {u.overtimeHours} giờ</Badge>}
        </span>
      )}
    </>
  );
}
