import type { WorkShift } from '@/types';
import { Badge } from '../../_components/badge';
import type { Column } from '../../_components/data-list';
import { hm, SHIFT_TYPES } from './work-shift-sheet';

const kind = (w: WorkShift) =>
  w.status === 'inactive' ? (
    <Badge>Tạm ngưng</Badge>
  ) : w.shiftType ? (
    <Badge tone="primary">{SHIFT_TYPES.find((t) => t.value === w.shiftType)?.label ?? w.shiftType}</Badge>
  ) : null;

export const shiftColumns: Column<WorkShift>[] = [
  { key: 'name', header: 'Ca', cell: (w) => <span className="font-medium">{w.name}</span> },
  { key: 'time', header: 'Giờ làm', fit: true, cell: (w) => `${hm(w.startTime)} – ${hm(w.endTime)}` },
  { key: 'kind', header: 'Loại / Trạng thái', fit: true, cell: (w) => kind(w) ?? '–' },
];

export function ShiftCard({ w }: { w: WorkShift }) {
  return (
    <>
      <span className="block truncate text-sm font-medium">{w.name}</span>
      <span className="flex items-center gap-2">
        {kind(w)}
        <span className="min-w-0 truncate text-xs text-rm-muted">
          {hm(w.startTime)} – {hm(w.endTime)}
        </span>
      </span>
    </>
  );
}
