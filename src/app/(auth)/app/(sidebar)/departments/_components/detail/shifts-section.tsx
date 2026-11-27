'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { deleteWorkShift, getWorkShifts } from '@/actions';
import { DrawerSection, IconAction, SectionAdd, Tag } from '@/components-remake';
import { DAY_LABEL_MAP, SHIFT_TYPE_BADGE_MAP } from '@/config';
import { useCan } from '@/hooks';
import type { WorkShift } from '@/types';
import { showErrorToast, showSuccessToast } from '@/utils';
import queryClient from '@/utils/query';
import { ConfirmModal } from './confirm-modal';
import { SectionEmpty, SectionError, SectionSkeleton } from './section-states';
import { ShiftDrawer } from './shift-drawer';

const days = (raw?: string | null) =>
  (raw ?? '')
    .split(',')
    .map((d) => DAY_LABEL_MAP[d.trim()])
    .filter(Boolean)
    .join(' ');

export function ShiftsSection({ departmentId, departmentName }: { departmentId: number; departmentName: string }) {
  const { can } = useCan();
  const [open, setOpen] = useState<WorkShift | 'new' | null>(null);
  const [deleting, setDeleting] = useState<WorkShift | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['work_shifts', departmentId],
    queryFn: () => getWorkShifts({ departmentId, limit: 100 }),
  });
  const items: WorkShift[] = data?.items ?? [];

  const remove = useMutation({
    mutationFn: (id: number) => deleteWorkShift(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_shifts'] });
      showSuccessToast('Đã xóa ca làm việc');
      setDeleting(null);
    },
    onError: (e) => showErrorToast(e, 'Không xóa được ca làm việc'),
  });

  return (
    <DrawerSection title={isLoading ? 'Ca làm việc' : `${items.length} ca làm việc`} action={can('work_shift:create') && <SectionAdd label="Thêm ca" onClick={() => setOpen('new')} />}>
      {isLoading ? (
        <SectionSkeleton />
      ) : isError ? (
        <SectionError onRetry={refetch} />
      ) : items.length === 0 ? (
        <SectionEmpty>Phòng ban chưa có ca làm việc nào.</SectionEmpty>
      ) : (
        <ul className="-my-1 flex flex-col">
          {items.map((s) => {
            const type = SHIFT_TYPE_BADGE_MAP[s.shiftType ?? ''];
            return (
              <li key={s.id} className="flex min-h-14 items-center gap-1 py-1">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900" title={s.name}>
                    {s.name}
                  </p>
                  <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                    {type && <Tag tone="slate">{type.label}</Tag>}
                    {s.status === 'inactive' && <Tag tone="amber">Tạm dừng</Tag>}
                    <span className="min-w-0 truncate text-xs text-slate-500 tabular-nums">
                      {(s.startTime || '--:--').slice(0, 5)} – {(s.endTime || '--:--').slice(0, 5)}
                      {days(s.workDays) && ` · ${days(s.workDays)}`}
                    </span>
                  </div>
                </div>
                {can('work_shift:update') && (
                  <IconAction label={`Sửa ${s.name}`} onClick={() => setOpen(s)}>
                    <Pencil size={15} />
                  </IconAction>
                )}
                {can('work_shift:delete') && (
                  <IconAction label={`Xóa ${s.name}`} danger onClick={() => setDeleting(s)}>
                    <Trash2 size={15} />
                  </IconAction>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ShiftDrawer shift={open} departmentId={departmentId} departmentName={departmentName} onClose={() => setOpen(null)} />
      <ConfirmModal
        isOpen={!!deleting}
        title="Xác nhận xóa ca làm việc"
        message={
          <>
            Xóa ca <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{deleting?.name}</strong>?
          </>
        }
        confirmText="Xác nhận xóa"
        isPending={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </DrawerSection>
  );
}
