'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useQueryClient } from '@tanstack/react-query';
import { useCan } from '@/hooks';
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
  const { can } = useCan();

  const isCheckedIn = Boolean(attendance?.checkIn);
  const isCheckedOut = Boolean(attendance?.checkOut);

  // Đang trong ca làm việc: Đã check-in nhưng CHƯA check-out
  const isCurrentlyWorking = isCheckedIn && !isCheckedOut;
  // Đã hoàn tất ít nhất 1 lượt chấm công trong ngày (cả vào và ra)
  const hasCompletedSession = isCheckedIn && isCheckedOut;
  // Tan ca cần attendance:checkout, vào ca (kể cả ca tiếp theo) cần attendance:checkin
  const canPunch = can(isCurrentlyWorking ? 'attendance:checkout' : 'attendance:checkin');

  // Xác định thời điểm trong ngày (từ 12:00 trở đi là ca chiều)
  const currentHour = new Date().getHours();
  const isAfternoon = currentHour >= 12;

  const shiftTitle = attendance?.workShiftName || 'Ca làm việc linh hoạt';
  const shiftTime =
    attendance?.workShiftStart && attendance?.workShiftEnd
      ? `${attendance.workShiftStart.slice(0, 5)} - ${attendance.workShiftEnd.slice(0, 5)}`
      : 'Thời gian làm việc linh hoạt';

  const handlePunchClick = () => {
    setIsOpenModal(true);
  };

  const handleCloseModal = React.useCallback(() => {
    setIsOpenModal(false);
  }, []);

  const handleTimekeepingSuccess = React.useCallback(() => {
    setIsOpenModal(false);
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    queryClient.invalidateQueries({ queryKey: ['attendances'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-live-locations'] });
  }, [queryClient]);

  return (
    <div className="relative overflow-hidden rounded-block bg-primary text-white p-4.5">
      {/* Nền hiệu ứng trang trí */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="absolute top-0 right-10 w-20 h-20 rounded-full bg-white/5 blur-lg pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-3.5">
        {/* Tiêu đề & Ca làm việc */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-control bg-white/15 backdrop-blur-xs text-white">
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
        <div className="grid grid-cols-2 gap-2 bg-black/15 rounded-block p-2.5 border border-white/10 backdrop-blur-xs">
          {/* Cột Check-in */}
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-white/70 font-medium">Giờ vào</span>
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
              <span className="text-xs text-amber-200">Muộn {attendance.lateMinutes}p</span>
            )}
          </div>

          {/* Cột Check-out */}
          <div className="flex flex-col gap-0.5 pl-2 border-l border-white/15">
            <span className="text-xs text-white/70 font-medium">Giờ ra</span>
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

        {/* Thông báo trạng thái phụ nếu đã hoàn tất ca trước */}
        {hasCompletedSession && (
          <div className="flex items-center justify-between text-[11px] text-white/80 px-0.5">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Đã xong ca trước
            </span>
            <button
              type="button"
              onClick={() => router.push('/app/attendances/payroll')}
              className="text-white/80 hover:text-white underline underline-offset-2 transition cursor-pointer"
            >
              Xem bảng công
            </button>
          </div>
        )}

        {/* Nút hành động chấm công */}
        {canPunch && (
          <button
            type="button"
            onClick={handlePunchClick}
            className="w-full py-2.5 px-4 rounded-block bg-white text-primary font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-white/95 active:scale-[0.98] transition cursor-pointer"
          >
            {isCurrentlyWorking ? (
              <>
                <span>Chấm công tan ca</span>
                <ArrowRight size={14} />
              </>
            ) : hasCompletedSession ? (
              <>
                <span>{isAfternoon ? 'Chấm công vào ca chiều' : 'Chấm công ca tiếp theo'}</span>
                <ArrowRight size={14} />
              </>
            ) : (
              <>
                <span>Chấm công vào ca ngay</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        )}
      </div>

      {/* Modal Chấm công tự động (Khuôn mặt + Vị trí GPS) */}
      <AutoTimekeepingModal
        open={isOpenModal}
        onClose={handleCloseModal}
        onSuccess={handleTimekeepingSuccess}
        hasCheckedIn={isCurrentlyWorking}
      />
    </div>
  );
};

export default QuickAttendanceCard;

