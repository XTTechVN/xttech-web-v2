import { Building2, CalendarPlus, Plus, TriangleAlert } from 'lucide-react';
import type { WorkShift } from '@/types';
import { BTN_LINE } from '../../_components/form';
import { DataList } from '../../_components/data-list';
import { ShiftCard, shiftColumns } from './shift-columns';

export interface Dept {
  id: number | null;
  name: string;
  color?: string;
}

interface Props {
  dept: Dept;
  shifts: WorkShift[];
  /** Có quyền tạo ca: hiện nút thêm ca cho phòng ban này */
  onAdd?: () => void;
  onOpen: (w: WorkShift) => void;
}

// Một phòng ban: tiêu đề + danh sách ca; chưa có ca thì cảnh báo thiếu và gợi ý tạo.
export function DeptSection({ dept, shifts, onAdd, onOpen }: Props) {
  const missing = shifts.length === 0;
  const id = `dept-${dept.id ?? 'none'}`;
  return (
    <section aria-labelledby={id} className="mb-5">
      <div className="mb-2 flex min-h-rm-tap items-center gap-2">
        <span
          className="flex size-8 flex-none items-center justify-center rounded-rm bg-rm-primary-soft text-rm-primary"
          style={dept.color ? { color: dept.color } : undefined}
        >
          <Building2 size={16} aria-hidden="true" />
        </span>
        <h2 id={id} className="min-w-0 flex-1 truncate font-heading text-base font-semibold">
          {dept.name}
          {!missing && <span className="ml-2 text-sm font-normal text-rm-muted">{shifts.length} ca</span>}
        </h2>
        {onAdd && !missing && (
          <button type="button" onClick={onAdd} aria-label={`Thêm ca cho ${dept.name}`} className={`${BTN_LINE} w-rm-tap px-0 md:w-auto md:px-3`}>
            <Plus size={18} aria-hidden="true" />
            <span className="hidden md:inline">Thêm ca</span>
          </button>
        )}
      </div>
      {missing ? (
        <div
          role="status"
          className="flex flex-col items-start gap-3 rounded-rm-xl border border-dashed border-rm-warning bg-rm-warning-soft p-rm-gutter md:flex-row md:items-center"
        >
          <TriangleAlert size={22} className="flex-none text-rm-warning" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Thiếu ca làm việc</p>
            <p className="text-sm text-rm-muted">
              {onAdd ? 'Cần bổ sung ca làm việc cho phòng ban này.' : 'Phòng ban này chưa có ca, cần người có quyền thêm ca.'}
            </p>
          </div>
          {onAdd && (
            <button type="button" onClick={onAdd} className={`${BTN_LINE} flex-none px-4`}>
              <CalendarPlus size={18} aria-hidden="true" />
              Tạo ca cho {dept.name}
            </button>
          )}
        </div>
      ) : (
        <DataList
          label={`Ca làm việc của ${dept.name}`}
          rows={shifts}
          rowKey={(w) => w.id}
          columns={shiftColumns}
          card={(w) => <ShiftCard w={w} />}
          onOpen={onOpen}
        />
      )}
    </section>
  );
}
