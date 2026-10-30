'use client';

import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { Users, Info, Loader2, Coffee, Zap, Clock, Phone } from 'lucide-react';
import { Modal, Avatar } from '@/components';
import { getDepartmentRoster } from '@/actions';
import { getFileUrl, cn } from '@/utils';

interface DayRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string | null;
  departmentId?: number;
  departmentName?: string;
}

export const DayRosterModal: React.FC<DayRosterModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  departmentId,
  departmentName,
}) => {
  const { data: roster, isLoading } = useQuery({
    queryKey: ['department-roster', selectedDate, departmentId],
    queryFn: () =>
      getDepartmentRoster({
        targetDate: selectedDate!,
        departmentId,
      }),
    enabled: Boolean(selectedDate && isOpen),
  });

  const members = roster?.members;
  // Chỉ lấy những người ĐI LÀM (ca cố định hoặc làm linh hoạt part-time)
  const workingMembers = useMemo(() => {
    if (!members) return [];
    return members.filter(
      (m) => m.status === 'working' || m.status === 'flexible' || m.status === 'partial_leave'
    );
  }, [members]);

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return '';
    return dayjs(selectedDate).format('DD/MM/YYYY');
  }, [selectedDate]);

  const isFutureDate = useMemo(() => {
    if (!selectedDate) return false;
    return dayjs(selectedDate).isAfter(dayjs(), 'day');
  }, [selectedDate]);

  const isPastDate = useMemo(() => {
    if (!selectedDate) return false;
    return dayjs(selectedDate).isBefore(dayjs(), 'day');
  }, [selectedDate]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-[#045863] border border-teal-100">
            <Users size={18} />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 tracking-tight">
              Lịch làm việc ngày {formattedSelectedDate}
            </h4>
            <p className="text-xs font-normal text-slate-500">
              {roster?.departmentName || departmentName || 'Phòng ban'} •{' '}
              {isPastDate && roster?.summary.actualPresentCount != null ? (
                <>
                  <span className="font-semibold text-emerald-700">
                    {roster.summary.actualPresentCount}/{roster.summary.workingCount} có mặt
                  </span>
                  {roster.summary.actualAbsentCount ? (
                    <span className="font-semibold text-rose-600">
                      {' '}• {roster.summary.actualAbsentCount} vắng mặt
                    </span>
                  ) : null}
                </>
              ) : (
                `${workingMembers.length} người đi làm`
              )}
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-3 py-1">
        {/* Thông báo lưu ý cho ngày trong tương lai */}
        {isFutureDate && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/80 p-2.5 text-amber-900 shadow-xs">
            <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="flex flex-col text-xs leading-relaxed">
              <span className="font-semibold text-slate-900">Lịch làm việc dự kiến</span>
              <span className="text-slate-800/90 text-[11px] mt-0.5">
                Dữ liệu được tính toán dựa trên ca làm việc và đơn nghỉ phép đã duyệt tính đến thời điểm hiện tại. Lịch có thể thay đổi nếu nhân sự phát sinh đơn xin nghỉ hoặc điều chỉnh ca trước ngày này.
              </span>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
            <Loader2 size={24} className="animate-spin text-[#045863]" />
            <span className="text-xs font-medium">Đang nạp danh sách nhân sự...</span>
          </div>
        ) : workingMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500 gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Coffee size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-700">Ngày nghỉ</p>
            <p className="text-xs text-slate-400 max-w-[240px]">
              Ngày này không có nhân sự nào có lịch làm việc tại phòng ban.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-0.5">
            {workingMembers.map((member) => {
              const isFlexible = member.status === 'flexible';

              return (
                <div
                  key={member.userId}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-2.5 transition hover:border-slate-200 hover:shadow-xs"
                >
                  {/* Avatar + Tên + Ca */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <Avatar
                        src={member.avatar ? getFileUrl(member.avatar) : undefined}
                        alt={member.fullName}
                        name={member.fullName}
                        size="md"
                      />
                      <span
                        className={cn(
                          'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white',
                          isPastDate
                            ? member.actualStatus === 'absent'
                              ? 'bg-rose-500 ring-rose-100'
                              : member.actualStatus === 'late'
                              ? 'bg-amber-500 ring-amber-100'
                              : 'bg-emerald-500 ring-emerald-100'
                            : isFlexible
                            ? 'bg-purple-500 ring-purple-100'
                            : 'bg-emerald-500 ring-emerald-100'
                        )}
                      />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-900 line-clamp-1">
                          {member.fullName}
                        </span>
                        {member.positionName && (
                          <span className="text-[11px] text-slate-400 line-clamp-1">
                            • {member.positionName}
                          </span>
                        )}
                      </div>

                      {/* Ca làm việc & Dữ liệu quẹt thẻ thực tế */}
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {isFlexible ? (
                            <>
                              <Zap size={12} className="text-purple-500 shrink-0" />
                              <span className="text-purple-700 font-medium line-clamp-1">
                                {member.shiftName || 'Linh hoạt (Part-time)'}
                              </span>
                            </>
                          ) : (
                            <>
                              <Clock size={12} className="text-emerald-600 shrink-0" />
                              <span className="text-slate-600 font-medium line-clamp-1">
                                {member.shiftName || 'Ca làm việc'}{' '}
                                {member.startTime && member.endTime && (
                                  <span className="text-slate-400">
                                    ({member.startTime.slice(0, 5)} - {member.endTime.slice(0, 5)})
                                  </span>
                                )}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Dữ liệu chấm công thực tế cho ngày quá khứ */}
                        {isPastDate && member.actualStatus && (
                          <div className="flex items-center gap-1 text-[11px]">
                            {member.actualStatus === 'absent' ? (
                              <span className="text-rose-600 font-semibold">Chưa có dữ liệu chấm công (Vắng)</span>
                            ) : (
                              <span className="text-emerald-700 font-medium">
                                Quẹt thẻ: {member.actualCheckIn?.slice(0, 5) || '--:--'} - {member.actualCheckOut?.slice(0, 5) || '--:--'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badge + Gọi điện */}
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {isPastDate && member.actualStatus ? (
                      <span
                        className={cn(
                          'inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold',
                          member.actualStatus === 'present' && 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
                          member.actualStatus === 'late' && 'bg-amber-50 text-amber-700 border-amber-200/70',
                          member.actualStatus === 'absent' && 'bg-rose-50 text-rose-700 border-rose-200/70',
                          member.actualStatus === 'forgot_checkout' && 'bg-blue-50 text-blue-700 border-blue-200/70'
                        )}
                      >
                        {member.actualStatus === 'present' && 'Có mặt'}
                        {member.actualStatus === 'late' && 'Đi muộn'}
                        {member.actualStatus === 'absent' && 'Vắng mặt'}
                        {member.actualStatus === 'forgot_checkout' && 'Quên checkout'}
                      </span>
                    ) : (
                      <span
                        className={cn(
                          'inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold',
                          isFlexible
                            ? 'bg-purple-50 text-purple-700 border-purple-200/70'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200/70'
                        )}
                      >
                        {isFlexible ? 'Ca linh hoạt' : 'Làm theo ca'}
                      </span>
                    )}

                    {member.phoneNumber && (
                      <a
                        href={`tel:${member.phoneNumber}`}
                        aria-label={`Gọi cho ${member.fullName}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-[#045863] transition"
                      >
                        <Phone size={13} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DayRosterModal;
