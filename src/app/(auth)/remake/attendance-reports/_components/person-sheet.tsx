'use client';

import { useQuery } from '@tanstack/react-query';
import { getAttendances } from '@/actions';
import { getAttendanceStatusInfo } from '@/types';
import { Badge } from '../../_components/badge';
import { Sheet } from '../../_components/sheet';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';
import { hm, TONE } from '../../attendances/_components/attendance-sheet';

interface Target {
  userId: string;
  name: string;
}

// Chi tiết công của một người trong kỳ đang xem.
export function PersonSheet({ target, fromDate, toDate, onClose }: { target: Target | null; fromDate: string; toDate: string; onClose: () => void }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['attendance-person', target?.userId, fromDate, toDate],
    queryFn: () => getAttendances({ userId: target!.userId, startDate: fromDate, endDate: toDate, limit: 100, sortBy: 'workDate', sortOrder: 'asc' }),
    enabled: !!target,
  });
  const items = data?.items ?? [];
  return (
    <Sheet open={!!target} onClose={onClose} title={target?.name ?? ''}>
      <div className="p-rm-gutter">
        {isLoading && <ListSkeleton rows={4} />}
        {isError && <ErrorState title="Không tải được chi tiết" description="Thử lại sau." />}
        {data && items.length === 0 && <EmptyState title="Không có công" description="Kỳ này người này chưa chấm công." />}
        {items.length > 0 && (
          <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge">
            {items.map((a) => {
              const s = getAttendanceStatusInfo(a.status);
              return (
                <li key={a.id} className="flex min-h-rm-row items-center gap-3 px-rm-gutter py-2">
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium">{a.workDate.split('-').reverse().slice(0, 2).join('/')}</span>
                      <Badge tone={TONE[s.variant]}>{s.label}</Badge>
                    </span>
                    <span className="block truncate text-xs text-rm-muted">
                      {hm(a.checkIn) || '--:--'} → {hm(a.checkOut) || '--:--'}
                      {a.totalHours ? ` · ${a.totalHours} giờ` : ''}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Sheet>
  );
}
