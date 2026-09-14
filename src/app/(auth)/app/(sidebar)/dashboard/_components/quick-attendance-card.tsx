'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useQueryClient } from '@tanstack/react-query';
import type { MyAttendanceToday } from '@/types';
import { AutoTimekeepingModal } from '@/components';
import { Clock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';


interface QuickAttendanceCardProps {
  attendance?: MyAttendanceToday;
}

export const QuickAttendanceCard: React.FC<QuickAttendanceCardProps> = ({ attendance }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpenModal, setIsOpenModal] = useState(false);

  const isCheckedIn = Boolean(attendance?.checkIn);
  const isCheckedOut = Boolean(attendance?.checkOut);

  const shiftTitle = attendance?.workShiftName || 'Ca làm việc hành chính';
  const shiftTime =
    attendance?.workShiftStart && attendance?.workShiftEnd
      ? `${attendance.workShiftStart.slice(0, 5)} - ${attendance.workShiftEnd.slice(0, 5)}`
      : '08:00 - 17:30';

  const handlePunchClick = () => {
    if (isCheckedIn && isCheckedOut) {
      router.push('/app/attendances/payroll');
    } else {
      setIsOpenModal(true);
    }
  };

  const handleTimekeepingSuccess = () => {
    setIsOpenModal(false);
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    queryClient.invalidateQueries({ queryKey: ['attendances'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-live-locations'] });
  };


  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/95 via-primary to-primary/85 text-white p-4.5 shadow-md">
      {/* Nền hiệu ứng trang trí */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="absolute top-0 right-10 w-20 h-20 rounded-full bg-white/5 blur-lg pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-3.5">
        {/* Tiêu đề & Ca làm việc */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white/15 backdrop-blur-xs text-white">
              <Clock size={16} />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white/90">{shiftTitle}</span>
              <span className="text-[11px] text-white/70">{shiftTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-medium backdrop-blur-xs">
            <ShieldCheck size={13} className="text-emerald-300" />
            <span>Chính thức</span>
          </div>
        </div>

        {/* Thông tin Check-in / Check-out 2 cột */}
        <div className="grid grid-cols-2 gap-2 bg-black/15 rounded-xl p-2.5 border border-white/10 backdrop-blur-xs">
          {/* Cột Check-in */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-white/70 uppercase tracking-wider font-medium">Giờ vào</span>
            {isCheckedIn ? (
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-sm">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>{attendance?.checkIn?.slice(0, 5) || '--:--'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-300 font-medium text-xs">
                <AlertCircle size={13} className="shrink-0" />
                <span>Chưa vào ca</span>
              </div>
            )}
            {attendance?.isLate && (
              <span className="text-[10px] text-amber-200">Muộn {attendance.lateMinutes}p</span>
            )}
          </div>

          {/* Cột Check-out */}
          <div className="flex flex-col gap-0.5 pl-2 border-l border-white/15">
            <span className="text-[10px] text-white/70 uppercase tracking-wider font-medium">Giờ ra</span>
            {isCheckedOut ? (
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-sm">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>{attendance?.checkOut?.slice(0, 5) || '--:--'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-white/60 font-medium text-xs">
                <span>--:--</span>
              </div>
            )}
          </div>
        </div>

        {/* Nút hành động chấm công */}
        <button
          type="button"
          onClick={handlePunchClick}
          className="w-full py-2.5 px-4 rounded-xl bg-white text-primary font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-white/95 active:scale-[0.98] transition cursor-pointer"
        >
          {!isCheckedIn ? (
            <>
              <span>Chấm công vào ca ngay</span>
              <ArrowRight size={14} />
            </>
          ) : !isCheckedOut ? (
            <>
              <span>Chấm công tan ca</span>
              <ArrowRight size={14} />
            </>
          ) : (
            <>
              <span>Xem chi tiết ngày công hôm nay</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>

      {/* Modal Chấm công tự động (Khuôn mặt + Vị trí GPS) */}
      <AutoTimekeepingModal
        open={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onSuccess={handleTimekeepingSuccess}
        hasCheckedIn={isCheckedIn}
      />
    </div>
  );
};

export default QuickAttendanceCard;

