'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useQueryClient } from '@tanstack/react-query';
import { Clock, LogIn, LogOut } from 'lucide-react';
import type { MyAttendanceToday } from '@/types';

const TimekeepingModal = dynamic(() => import('@/components/auto-timekeeping-modal/auto-timekeeping-modal'), { ssr: false });

const hhmm = (s?: string | null) => s?.slice(0, 5) ?? '–';

// Chấm công của chính mình: vào ca / tan ca bằng khuôn mặt + GPS (mở modal dùng chung).
export function CheckInCard({ me }: { me: MyAttendanceToday }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const working = !!me.checkIn && !me.checkOut;
  const shift = [me.workShiftName, me.workShiftStart && me.workShiftEnd && `${hhmm(me.workShiftStart)}–${hhmm(me.workShiftEnd)}`]
    .filter(Boolean)
    .join(' · ');

  const title = working ? 'Đang trong ca' : me.checkOut ? 'Đã tan ca' : 'Hôm nay chưa chấm công';
  const sub = me.checkIn ? `Vào ${hhmm(me.checkIn)} · Ra ${hhmm(me.checkOut)}` : shift || 'Chấm công bằng khuôn mặt và vị trí.';

  return (
    <section
      aria-label="Chấm công của tôi"
      className="relative flex flex-col items-start gap-4 overflow-hidden rounded-rm-xl bg-linear-to-br from-rm-primary to-rm-primary-bright p-rm-gutter text-white"
    >
      <Clock aria-hidden="true" className="pointer-events-none absolute -bottom-6 -right-4 size-32 text-white/15" strokeWidth={1.5} />
      <div className="relative min-w-0 max-w-[88%]">
        <h2 className="font-heading text-lg font-semibold leading-6 [overflow-wrap:anywhere]">{title}</h2>
        <p className="mt-1 text-sm text-white/80 [overflow-wrap:anywhere]">
          {sub}
          {me.checkIn && shift && ` · ${shift}`}
        </p>
        {me.isLate && (
          <span className="mt-2 inline-block rounded-rm-sm bg-white/20 px-2 py-0.5 text-xs font-medium">Trễ {me.lateMinutes ?? 0} phút</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-rm-primary transition-transform active:scale-95 md:h-rm-control"
      >
        {working ? <LogOut size={18} aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}
        {working ? 'Chấm công tan ca' : me.checkOut ? 'Chấm công ca tiếp theo' : 'Chấm công vào ca'}
      </button>
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
