'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { getAttendances } from '@/actions';
import { useAuthStore } from '@/stores';
import { getAttendanceStatusInfo, Attendance } from '@/types';
import {
  CalendarCheck2,
  Clock,
  ArrowRight,
  RotateCw,
  CalendarX,
  AlertTriangle,
} from 'lucide-react';

export const PersonalAttendanceHistory: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const {
    data: attendancesRes,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['personal-recent-attendances', user?.id],
    queryFn: () =>
      getAttendances({
        userId: user?.id,
        limit: 5,
        sortBy: 'workDate',
        sortOrder: 'desc',
      }),
    enabled: Boolean(user?.id),
    refetchInterval: 60000,
  });

  const attendances: Attendance[] = attendancesRes?.items || [];

  const getStatusBadgeClass = (variant: string) => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'danger':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/80';
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <CalendarCheck2 size={18} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-gray-900">Chấm công gần đây</h3>
            <span className="text-[11px] text-gray-500 font-medium">
              Lịch sử vào ca / ra ca của bạn
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isRefetching}
          title="Làm mới lịch sử"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <RotateCw size={15} className={isRefetching ? 'animate-spin text-primary' : ''} />
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-2 py-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-gray-50 animate-pulse border border-gray-100"
            />
          ))}
        </div>
      ) : attendances.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400 gap-1.5 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          <CalendarX size={24} className="text-gray-300" />
          <span className="text-xs font-medium text-gray-600">Chưa có lịch sử chấm công</span>
          <span className="text-[10px] text-gray-400">
            Dữ liệu sẽ xuất hiện sau khi bạn check-in ca làm
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {attendances.map((item) => {
            const statusInfo = getAttendanceStatusInfo(item.status);
            const formattedDate = dayjs(item.workDate).locale('vi').format('dd, DD/MM');
            const inTime = item.checkIn ? item.checkIn.slice(0, 5) : '--:--';
            const outTime = item.checkOut ? item.checkOut.slice(0, 5) : '--:--';

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/70 hover:bg-gray-100/70 border border-gray-100/80 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200/60 shadow-2xs flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] text-gray-400 font-semibold uppercase leading-none">
                      {dayjs(item.workDate).format('MM')}
                    </span>
                    <span className="text-sm font-bold text-gray-800 leading-tight">
                      {dayjs(item.workDate).format('DD')}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-800 capitalize">
                        {formattedDate}
                      </span>
                      {item.isLate && (
                        <span className="text-[10px] text-amber-600 font-medium flex items-center gap-0.5">
                          <AlertTriangle size={10} /> +{item.lateMinutes || 0}p
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium mt-0.5">
                      <span className="flex items-center gap-0.5 text-emerald-600 font-semibold">
                        <Clock size={11} /> {inTime}
                      </span>
                      <span>-</span>
                      <span className="flex items-center gap-0.5 text-gray-600">
                        {outTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getStatusBadgeClass(
                      statusInfo.variant
                    )}`}
                  >
                    {statusInfo.label}
                  </span>
                  {typeof item.totalHours === 'number' && item.totalHours > 0 && (
                    <span className="text-[10px] text-gray-400 font-medium">
                      {item.totalHours.toFixed(1)}h công
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Link */}
      <Link
        href="/app/attendances"
        className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition py-2 bg-primary/5 hover:bg-primary/10 rounded-xl mt-0.5 active:scale-98 cursor-pointer"
      >
        <span>Xem toàn bộ lịch sử chấm công</span>
        <ArrowRight size={13} />
      </Link>
    </div>
  );
};

export default PersonalAttendanceHistory;
