'use client';

import React, { useState, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Coffee } from 'lucide-react';
import { getMonthRoster, getDepartments } from '@/actions';
import { Avatar, Select } from '@/components';
import { getFileUrl, cn } from '@/utils';
import type { Department, DayRosterSummaryItem } from '@/types';
import { usePermission } from '@/hooks';
import { DayRosterModal } from './modal';
import { useAuthStore } from '@/stores';
interface DepartmentCalendarProps {
  departmentId?: number;
  departmentName?: string;
  className?: string;
}

const WEEKDAYS = [
  { short: 'T2', full: 'Thứ 2' },
  { short: 'T3', full: 'Thứ 3' },
  { short: 'T4', full: 'Thứ 4' },
  { short: 'T5', full: 'Thứ 5' },
  { short: 'T6', full: 'Thứ 6' },
  { short: 'T7', full: 'Thứ 7' },
  { short: 'CN', full: 'Chủ Nhật' },
];

export const DepartmentCalendar: React.FC<DepartmentCalendarProps> = ({
  departmentId,
  departmentName,
  className,
}) => {
  const { isManager, isAdmin, isHR } = usePermission();
  const isHrOrAdmin = isManager || isAdmin || isHR;
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuthStore();
  const [selectedDeptId, setSelectedDeptId] = useState<number | undefined>(user?.positions[0].departmentId ?? undefined);
  const activeDeptId = selectedDeptId !== undefined ? selectedDeptId : departmentId;
  const currentMonthStr = currentMonth.format('YYYY-MM');

  // 1. Truy vấn tổng quan toàn bộ tháng (chạy 1 lần cho cả tháng)
  const { data: monthRoster } = useQuery({
    queryKey: ['department-roster-month', currentMonthStr, activeDeptId],
    queryFn: () =>
      getMonthRoster({
        month: currentMonthStr,
        departmentId: activeDeptId,
      }),
  });

  const monthDays = monthRoster?.days;
  const monthDaysMap = useMemo(() => {
    const map = new Map<string, DayRosterSummaryItem>();
    if (!monthDays) return map;
    for (const day of monthDays) {
      map.set(day.date, day);
    }
    return map;
  }, [monthDays]);


  const { data: departments } = useQuery({
      queryKey: ['departments'],
      queryFn: () => getDepartments({ limit: 100 }),
      enabled: isHrOrAdmin,
    });
    const departmentItems = departments?.items;
  const selectedDepartmentName = React.useMemo(() => {
    if (!selectedDeptId || !departmentItems) return undefined;
    const found = departmentItems.find((d: Department) => d.id === selectedDeptId);
    return found?.name;
  }, [selectedDeptId, departmentItems]);
  const departmentOptions = React.useMemo(() => {
      if (!departmentItems) return [];
      return [
        ...departmentItems.map((d: Department) => ({
          value: String(d.id),
          label: d.name,
        })),
      ];
    }, [departmentItems]);

  // Tạo lưới ngày trong tháng (bắt đầu từ Thứ 2)
  const calendarDays = useMemo(() => {
    const startOfMonth = currentMonth.startOf('month');
    const daysInMonth = currentMonth.daysInMonth();
    // Chuyển Chủ nhật từ 0 thành 6, Thứ 2 là 0
    const startDayIndex = (startOfMonth.day() + 6) % 7;

    const days: {
      date: Dayjs;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    // Ngày của tháng trước để bù cho đủ hàng
    const prevMonth = currentMonth.subtract(1, 'month');
    const daysInPrevMonth = prevMonth.daysInMonth();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = prevMonth.date(daysInPrevMonth - i);
      days.push({
        date: d,
        dateStr: d.format('YYYY-MM-DD'),
        isCurrentMonth: false,
        isToday: d.isSame(dayjs(), 'day'),
      });
    }

    // Các ngày của tháng hiện tại
    for (let i = 1; i <= daysInMonth; i++) {
      const d = currentMonth.date(i);
      days.push({
        date: d,
        dateStr: d.format('YYYY-MM-DD'),
        isCurrentMonth: true,
        isToday: d.isSame(dayjs(), 'day'),
      });
    }

    // Bù các ngày của tháng sau cho đủ bội số của 7
    const remainingDays = (7 - (days.length % 7)) % 7;
    const nextMonth = currentMonth.add(1, 'month');
    for (let i = 1; i <= remainingDays; i++) {
      const d = nextMonth.date(i);
      days.push({
        date: d,
        dateStr: d.format('YYYY-MM-DD'),
        isCurrentMonth: false,
        isToday: d.isSame(dayjs(), 'day'),
      });
    }

    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
  const handleNextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  return (
    <div className={cn('w-full flex flex-col gap-4 bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-5 shadow-xs', className)}>
      {/* 1. Header Lịch: Tháng/Năm & Nút điều hướng */}
      <div className="flex flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3 sm:pb-4">
        {/* Hàng 1 trên Mobile: [Tháng MM / YYYY] và [ < ] [ Hôm nay ] [ > ] phân bổ 2 bên cân xứng */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto">


          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/80 p-0.5 shrink-0">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Tháng trước"
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition shadow-xs"
            >
              <ChevronLeft size={16} />
            </button>
            <span
              className="px-1 py-1 text-xs font-semibold rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition whitespace-nowrap"
            >
              Tháng {currentMonth.format('MM / YYYY')}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Tháng sau"
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition shadow-xs"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Hàng 2 trên Mobile: Bộ chọn phòng ban kéo dãn vừa vặn */}
        {isHrOrAdmin && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className=" hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 shrink-0">
              <span className="">Phòng ban:</span>
            </div>
            <div className="flex-1 sm:w-56">
              <Select
               className=''
                value={selectedDeptId ? String(selectedDeptId) : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedDeptId(val ? Number(val) : undefined);
                }}
                options={departmentOptions}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Lưới Lịch Tháng (Calendar Grid) */}
      <div className="w-full overflow-hidden rounded-xl border border-slate-200/70 bg-white">
        {/* Hàng Tiêu Đề Các Thứ */}
        <div className="grid grid-cols-7 border-b border-slate-200/70 bg-slate-50/70 text-center">
          {WEEKDAYS.map((day, idx) => (
            <div
              key={day.short}
              className={cn(
                'py-2 sm:py-2.5 text-xs font-bold tracking-tight',
                idx === 6 ? 'text-rose-500' : 'text-slate-600'
              )}
            >
              <span className="sm:hidden">{day.short}</span>
              <span className="hidden sm:inline">{day.full}</span>
            </div>
          ))}
        </div>

        {/* Các Ô Ngày Trong Tháng */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {calendarDays.map((item) => {
            const daySummary = monthDaysMap.get(item.dateStr);
            const workingCount = daySummary?.workingCount ?? 0;
            const sampleMembers = daySummary?.sampleMembers ?? [];
            const isPastDay = item.date.isBefore(dayjs(), 'day');
            const actualPresentCount = daySummary?.actualPresentCount;
            const actualAbsentCount = daySummary?.actualAbsentCount ?? 0;

            return (
              <button
                key={item.dateStr}
                type="button"
                onClick={() => handleDayClick(item.dateStr)}
                className={cn(
                  'group relative flex flex-col items-center sm:items-start justify-between sm:justify-start aspect-square sm:aspect-auto sm:min-h-[110px] p-1.5 sm:p-3 text-left transition-all',
                  item.isCurrentMonth ? 'bg-white hover:bg-teal-50/40' : 'bg-slate-50/40 text-slate-400',
                  item.isToday && 'bg-teal-50/25 ring-1 ring-inset ring-teal-200/60'
                )}
              >
                {/* Header ngày: Số ngày + Badge Hôm nay */}
                <div className="flex items-center justify-center sm:justify-between w-full">
                  <span
                    className={cn(
                      'flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg text-xs sm:text-sm font-semibold transition',
                      item.isToday
                        ? 'bg-[#045863] text-white shadow-xs'
                        : item.isCurrentMonth
                        ? 'text-slate-800 group-hover:text-[#045863]'
                        : 'text-slate-400'
                    )}
                  >
                    {item.date.format('D')}
                  </span>

                  {item.isToday && (
                    <span className="hidden sm:inline-block text-[9px] font-bold text-[#045863] bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-100">
                      Hôm nay
                    </span>
                  )}
                </div>

                {/* Tóm tắt nhân sự đi làm trong ngày */}
                {item.isCurrentMonth && daySummary && (
                  <div className="mt-auto sm:mt-1.5 flex flex-col w-full items-center sm:items-start gap-1">
                    {workingCount > 0 ? (
                      <>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1">
                          {isPastDay && actualPresentCount != null ? (
                            <>
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1 rounded-md px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold border',
                                  actualAbsentCount > 0
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                )}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                                <span className="hidden sm:inline">
                                  {actualPresentCount}/{workingCount} có mặt
                                </span>
                                <span className="sm:hidden font-bold">
                                  {actualPresentCount}
                                </span>
                              </span>
                              {actualAbsentCount > 0 && (
                                <span className="hidden sm:inline-flex items-center rounded-md bg-rose-50 px-1 py-0.5 text-[9px] sm:text-[10px] font-medium text-rose-700 border border-rose-200/60">
                                  {actualAbsentCount} vắng
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-emerald-700 border border-emerald-200/60">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="hidden sm:inline">{workingCount} người đi làm</span>
                              <span className="sm:hidden font-bold">{workingCount}</span>
                            </span>
                          )}
                        </div>

                        {/* Avatars xếp chồng (stacked avatars) */}
                        <div className="hidden sm:flex items-center -space-x-1.5 overflow-hidden pt-0.5">
                          {sampleMembers.slice(0, 3).map((m) => (
                            <Avatar
                              key={m.userId}
                              src={m.avatar ? getFileUrl(m.avatar) : undefined}
                              name={m.fullName}
                              alt={m.fullName}
                              size="xs"
                              className="!h-5 !w-5 sm:!h-6 sm:!w-6 ring-2 ring-white shrink-0 shadow-xs"
                            />
                          ))}
                          {workingCount > 3 && (
                            <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-slate-100 text-[9px] sm:text-[10px] font-bold text-slate-600 ring-2 ring-white shrink-0 shadow-xs">
                              +{workingCount - 3}
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center pt-0.5">
                        <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-slate-100/90 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium text-slate-500">
                          <Coffee size={10} className="text-slate-400 shrink-0" />
                          <span>Nghỉ ca</span>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Gợi ý tương tác khi hover */}
                <div className="mt-auto  w-full pt-1 hidden sm:flex items-center justify-between text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Chi tiết</span>
                  <span className="text-xs">➔</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Popup Modal Chi Tiết Nhân Sự Đi Làm */}
      <DayRosterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        departmentId={activeDeptId}
        departmentName={selectedDepartmentName || departmentName}
      />
    </div>
  );
};
