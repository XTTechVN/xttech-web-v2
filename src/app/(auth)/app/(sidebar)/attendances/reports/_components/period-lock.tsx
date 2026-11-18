'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Lock, LockOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge, Button } from '@/components';
import { closeAttendancePeriod, getAttendancePeriodLocks, reopenAttendancePeriod } from '@/actions';
import { useCan } from '@/hooks/use-can';
import { getErrorMessage } from '@/utils';

// Trạng thái chốt công của tháng đang xem (theo "Từ ngày"); người có quyền chốt hoặc mở lại.
export const PeriodLock = ({ fromDate }: { fromDate: string }) => {
  const month = fromDate.slice(0, 7);
  const year = Number(month.slice(0, 4));
  const label = `${month.slice(5, 7)}/${year}`;
  const { can } = useCan();
  const qc = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const locks = useQuery({
    queryKey: ['attendance-period-locks', year],
    queryFn: () => getAttendancePeriodLocks(year),
    enabled: year > 2000,
  });
  const locked = locks.data?.some((l) => l.month.startsWith(month)) ?? false;
  const toggle = useMutation({
    mutationFn: async () => {
      if (locked) await reopenAttendancePeriod(month);
      else await closeAttendancePeriod(month);
    },
    onSuccess: () => {
      toast.success(locked ? `Đã mở lại kỳ công ${label}` : `Đã chốt công ${label}`);
      setConfirming(false);
      qc.invalidateQueries({ queryKey: ['attendance-period-locks', year] });
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Không đổi được trạng thái kỳ công')),
  });

  if (!month || locks.isError) return null;
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <span className="text-sm text-slate-600">Kỳ công {label}</span>
      {locks.isLoading ? (
        <span className="h-5 w-16 animate-pulse rounded bg-slate-100" />
      ) : (
        <Badge size="sm" variant={locked ? 'warning' : 'default'}>
          {locked ? 'Đã chốt' : 'Chưa chốt'}
        </Badge>
      )}
      {can('attendance_report:close_period') &&
        locks.data &&
        (confirming ? (
          <span className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-11 md:h-9"
              variant={locked ? 'outline' : 'danger'}
              loading={toggle.isPending}
              onClick={() => toggle.mutate()}
            >
              {locked ? 'Xác nhận mở lại' : 'Xác nhận chốt'}
            </Button>
            <Button size="sm" className="h-11 md:h-9" variant="ghost" onClick={() => setConfirming(false)} disabled={toggle.isPending}>
              Thôi
            </Button>
          </span>
        ) : (
          <Button
            size="sm"
            className="h-11 md:h-9"
            variant="outline"
            leftIcon={locked ? <LockOpen size={14} /> : <Lock size={14} />}
            onClick={() => setConfirming(true)}
          >
            {locked ? 'Mở lại' : 'Chốt công'}
          </Button>
        ))}
    </div>
  );
};
