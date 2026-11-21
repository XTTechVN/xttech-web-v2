import { getRequestTypeLabel, type AttendanceAdjustmentRequest } from '@/types';
import { Badge } from '../../_components/badge';
import type { Column } from '../../_components/data-list';
import { hm, STATUS, vnDate } from './adjustment-sheet';

const badge = (r: AttendanceAdjustmentRequest) => {
  const s = STATUS[r.status] ?? { label: r.status, tone: 'neutral' as const };
  return <Badge tone={s.tone}>{s.label}</Badge>;
};
const asked = (r: AttendanceAdjustmentRequest) => `${hm(r.requestedCheckIn) || '--:--'} → ${hm(r.requestedCheckOut) || '--:--'}`;

export const adjustmentColumns = (showName: boolean): Column<AttendanceAdjustmentRequest>[] => [
  ...(showName
    ? [
        {
          key: 'name',
          header: 'Nhân viên',
          cell: (r: AttendanceAdjustmentRequest) => <span className="font-medium">{r.user?.fullName || 'Không rõ nhân viên'}</span>,
        },
      ]
    : []),
  { key: 'type', header: 'Loại', fit: true, cell: (r) => getRequestTypeLabel(r.requestType) },
  { key: 'date', header: 'Ngày công', fit: true, cell: (r) => vnDate(r.workDate) },
  { key: 'asked', header: 'Đề nghị', fit: true, cell: asked },
  { key: 'status', header: 'Trạng thái', fit: true, cell: badge },
];

export function AdjustmentCard({ r, showName }: { r: AttendanceAdjustmentRequest; showName: boolean }) {
  return (
    <>
      <span className="block truncate text-sm font-medium">
        {showName ? r.user?.fullName || 'Không rõ nhân viên' : getRequestTypeLabel(r.requestType)}
      </span>
      <span className="flex items-center gap-2">
        {badge(r)}
        <span className="min-w-0 truncate text-xs text-rm-muted">
          {showName && `${getRequestTypeLabel(r.requestType)} · `}
          {vnDate(r.workDate)}
        </span>
      </span>
      <span className="block truncate text-xs text-rm-muted">Đề nghị: {asked(r)}</span>
    </>
  );
}
