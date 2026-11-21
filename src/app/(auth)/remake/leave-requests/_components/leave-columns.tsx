import { CalendarOff } from 'lucide-react';
import type { LeaveRequest } from '@/types';
import { Badge } from '../../_components/badge';
import type { Column } from '../../_components/data-list';
import { LEAVE_TYPES, STATUS, vnDate } from './leave-sheet';

const typeLabel = (v: string) => LEAVE_TYPES.find((o) => o.value === v)?.label ?? v;
const status = (r: LeaveRequest) => STATUS[r.status] ?? { label: r.status, tone: 'neutral' as const };
const range = (r: LeaveRequest) => (r.endDate !== r.startDate ? `${vnDate(r.startDate)} – ${vnDate(r.endDate)}` : vnDate(r.startDate));
const who = (r: LeaveRequest) => r.user?.fullName || 'Không rõ nhân viên';

// Cột bảng (từ 768px) và thẻ (dưới 768px) của danh sách đơn nghỉ; showName=false khi chỉ xem đơn của chính mình.
export function leaveColumns(showName: boolean): Column<LeaveRequest>[] {
  return [
    ...(showName
      ? [{ key: 'who', header: 'Nhân viên', cell: (r: LeaveRequest) => <span className="block truncate font-medium">{who(r)}</span> }]
      : []),
    {
      key: 'type',
      header: 'Loại nghỉ',
      fit: true,
      cell: (r) => (showName ? typeLabel(r.leaveType) : <span className="font-medium">{typeLabel(r.leaveType)}</span>),
    },
    { key: 'range', header: 'Thời gian', fit: true, cell: range },
    { key: 'days', header: 'Số ngày', fit: true, cell: (r) => r.totalDays ?? '?' },
    { key: 'reason', header: 'Lý do', wideOnly: true, cell: (r) => r.reason },
    { key: 'status', header: 'Trạng thái', fit: true, cell: (r) => <Badge tone={status(r).tone}>{status(r).label}</Badge> },
  ];
}

export function LeaveCard({ r, showName }: { r: LeaveRequest; showName: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <span className="flex size-10 flex-none items-center justify-center rounded-rm bg-rm-primary-soft text-rm-primary">
        <CalendarOff size={18} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="min-w-0 truncate text-sm font-medium">{showName ? who(r) : typeLabel(r.leaveType)}</span>
          <Badge tone={status(r).tone}>{status(r).label}</Badge>
        </span>
        <span className="mt-1 block truncate text-xs text-rm-muted">
          {showName && `${typeLabel(r.leaveType)} · `}
          {r.totalDays ?? '?'} ngày
        </span>
        <span className="mt-1 block truncate text-xs text-rm-muted">{range(r)}</span>
      </span>
    </span>
  );
}
