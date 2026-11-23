'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useQueryClient } from '@tanstack/react-query';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { useCan } from '@/hooks';
import type { MyAttendanceToday } from '@/types';
import { PhotoThumb } from './photo-thumb';

const TimekeepingModal = dynamic(() => import('@/components/auto-timekeeping-modal/auto-timekeeping-modal'), { ssr: false });

const hhmm = (s?: string | null) => s?.match(/\d{2}:\d{2}/)?.[0] ?? '–';

// Ô ngang: ảnh nhỏ bên trái, tiêu đề + giờ bên phải; chưa có thì skeleton.
function TimeCell({ label, value, image }: { label: string; value?: string | null; image?: string | null }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-rm-xl bg-white/15 p-2">
      <PhotoThumb src={image} alt={`Ảnh ${label.toLowerCase()}`} empty={!!value} />
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-white/80 [overflow-wrap:anywhere]">{label}</dt>
        <dd className="mt-0.5">
          {value ? (
            <span className="font-heading text-lg font-semibold leading-6 tabular-nums">{hhmm(value)}</span>
          ) : (
            <span role="status" aria-label="Chưa có" className="block h-5 w-12 animate-pulse rounded-rm-sm bg-white/30" />
          )}
        </dd>
      </div>
    </div>
  );
}

// Chấm công của chính mình: vào ca / tan ca bằng khuôn mặt + GPS (mở modal dùng chung).
export function CheckInCard({ me }: { me: MyAttendanceToday }) {
  const qc = useQueryClient();
  const { can } = useCan();
  const [open, setOpen] = useState(false);
  const working = !!me.checkIn && !me.checkOut;
  const shift = [me.workShiftName, me.workShiftStart && me.workShiftEnd && `${hhmm(me.workShiftStart)}–${hhmm(me.workShiftEnd)}`]
    .filter(Boolean)
    .join(' · ');

  // Vào ca cần attendance:checkin, tan ca cần attendance:checkout; thiếu quyền thì không hiện nút
  const canPunch = can(working ? 'attendance:checkout' : 'attendance:checkin');
  const title = working ? 'Đang trong ca' : me.checkOut ? 'Đã tan ca' : 'Hôm nay chưa chấm công';

  return (
    <section
      aria-label="Chấm công của tôi"
      className="relative flex flex-col gap-3 overflow-hidden rounded-rm-xl bg-linear-to-br from-rm-primary to-rm-primary-bright p-rm-gutter text-white"
    >
      <Clock aria-hidden="true" className="pointer-events-none absolute -right-4 -top-6 size-32 text-white/10" strokeWidth={1.5} />
      <div className="relative flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="min-w-0 font-heading text-lg font-semibold leading-6 [overflow-wrap:anywhere]">{title}</h2>
        {me.isLate && (
          <span className="flex-none rounded-rm-sm bg-white/20 px-2 py-0.5 text-xs font-medium">Trễ {me.lateMinutes ?? 0} phút</span>
        )}
      </div>

      <dl className="relative grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
        <TimeCell label="Chấm công vào" value={me.checkIn} image={me.imgCheckinPath} />
        <TimeCell label="Chấm công ra" value={me.checkOut} image={me.imgCheckoutPath} />
      </dl>

      <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="min-w-0 text-sm text-white/80 [overflow-wrap:anywhere]">{shift || 'Chấm công bằng khuôn mặt và vị trí.'}</p>
        {canPunch && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-11 flex-none items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-rm-primary transition-transform active:scale-95 md:h-rm-control"
          >
            {working ? <LogOut size={18} aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}
            {working ? 'Chấm công tan ca' : me.checkOut ? 'Chấm công ca tiếp theo' : 'Chấm công vào ca'}
          </button>
        )}
      </div>
      {open && (
        <TimekeepingModal
          open
          hasCheckedIn={working}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            ['dashboard', 'attendances', 'live-locations'].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
          }}
        />
      )}
    </section>
  );
}
