'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Clock, CalendarOff, Coffee, Phone, Building2, Users, ChevronRight, Loader2, Calendar as CalendarIcon, Zap } from 'lucide-react';
import { getDepartmentRoster } from '@/actions';
import { Avatar, Badge } from '@/components';
import { getFileUrl, cn } from '@/utils';
import type { DepartmentRosterItem, RosterMemberStatus } from '@/types';

interface DepartmentRosterWidgetProps {
  initialDepartmentId?: number;
  className?: string;
  isCompact?: boolean;
}

const STATUS_CONFIG: Record<
  RosterMemberStatus,
  {
    label: string;
    dotColor: string;
    badgeClass: string;
    icon: React.ElementType;
  }
> = {
  working: {
    label: 'Đi làm',
    dotColor: 'bg-emerald-500 ring-emerald-100',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    icon: Clock,
  },
  flexible: {
    label: 'Làm linh hoạt',
    dotColor: 'bg-purple-500 ring-purple-100',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/70',
    icon: Zap,
  },
  on_leave: {
    label: 'Nghỉ phép',
    dotColor: 'bg-amber-500 ring-amber-100',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/70',
    icon: CalendarOff,
  },
  partial_leave: {
    label: 'Nghỉ nửa ca',
    dotColor: 'bg-orange-500 ring-orange-100',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200/70',
    icon: CalendarOff,
  },
  day_off: {
    label: 'Nghỉ ca',
    dotColor: 'bg-slate-400 ring-slate-100',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200/70',
    icon: Coffee,
  },
};

const LEAVE_DURATION_MAP: Record<string, string> = {
  full_day: 'Nghỉ cả ngày',
  morning: 'Nghỉ ca sáng',
  afternoon: 'Nghỉ ca chiều',
  custom_shift: 'Nghỉ theo ca',
};

export const DepartmentRosterWidget: React.FC<DepartmentRosterWidgetProps> = ({
  initialDepartmentId,
  className,
  isCompact = false,
}) => {
  // Mặc định chọn ngày mai
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const dayAfterTomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(tomorrowStr);
  const [statusFilter, setStatusFilter] = useState<'all' | RosterMemberStatus>('all');

  const { data: roster, isLoading, isError } = useQuery({
    queryKey: ['department-roster', selectedDate, initialDepartmentId],
    queryFn: () =>
      getDepartmentRoster({
        targetDate: selectedDate,
        departmentId: initialDepartmentId,
      }),
  });

   const members = roster?.members;
  const filteredMembers = useMemo(() => {
    if (!members) return [];
    if (statusFilter === 'all') return members;
    if (statusFilter === 'working') {
      return members.filter((m) => m.status === 'working' || m.status === 'flexible' || m.status === 'partial_leave');
    }
    return members.filter((m) => m.status === statusFilter);
  }, [members, statusFilter]);

  const formatDateDisplay = (dateString: string) => {
    try {
      const [y, m, d] = dateString.split('-');
      return `${d}/${m}/${y}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all',
        className
      )}
    >
      {/* 1. Header & Điều hướng ngày */}
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-[#045863] border border-teal-100/70 shrink-0">
              <Users size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight whitespace-nowrap">
                  Lịch làm việc phòng ban
                </h3>
                {roster?.departmentName && (
                  <span className="text-[11px] font-medium text-[#045863] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100/60 truncate max-w-[140px]">
                    {roster.departmentName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Ngày: <span className="font-semibold text-slate-700">{formatDateDisplay(selectedDate)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Date Pills: Segmented Control phẳng mượt mà */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 w-full">
          {[
            { label: 'Hôm nay', val: todayStr },
            { label: 'Ngày mai', val: tomorrowStr },
            { label: 'Ngày kia', val: dayAfterTomorrowStr },
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => setSelectedDate(item.val)}
              className={cn(
                'flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all text-center whitespace-nowrap',
                selectedDate === item.val
                  ? 'bg-[#045863] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {item.label}
            </button>
          ))}
          <div className="relative shrink-0">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="w-8 h-8 opacity-0 absolute inset-0 cursor-pointer"
              title="Chọn ngày khác"
            />
            <button
              type="button"
              aria-label="Chọn ngày khác"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs hover:bg-slate-50 transition"
            >
              <CalendarIcon size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Thống kê nhanh theo trạng thái */}
      {roster?.summary && (
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'working' ? 'all' : 'working')}
            className={cn(
              'flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all text-center',
              statusFilter === 'working'
                ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-100'
                : 'bg-emerald-50/40 border-emerald-200/60 hover:bg-emerald-50/80'
            )}
          >
            <span className="text-lg font-bold text-emerald-700 leading-none">
              {roster.summary.workingCount}
            </span>
            <span className="text-[11px] font-semibold text-emerald-800/80 mt-1 whitespace-nowrap">
              Đi làm
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'on_leave' ? 'all' : 'on_leave')}
            className={cn(
              'flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all text-center',
              statusFilter === 'on_leave'
                ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-100'
                : 'bg-amber-50/40 border-amber-200/60 hover:bg-amber-50/80'
            )}
          >
            <span className="text-lg font-bold text-amber-700 leading-none">
              {roster.summary.onLeaveCount}
            </span>
            <span className="text-[11px] font-semibold text-amber-800/80 mt-1 whitespace-nowrap">
              Nghỉ phép
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'day_off' ? 'all' : 'day_off')}
            className={cn(
              'flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all text-center',
              statusFilter === 'day_off'
                ? 'bg-slate-200/80 border-slate-300 ring-2 ring-slate-100'
                : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100/70'
            )}
          >
            <span className="text-lg font-bold text-slate-700 leading-none">
              {roster.summary.dayOffCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-600 mt-1 whitespace-nowrap">
              Nghỉ ca
            </span>
          </button>
        </div>
      )}

      {/* 3. Danh sách thành viên */}
      <div className="mt-1 flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-0.5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
            <Loader2 size={24} className="animate-spin text-[#045863]" />
            <span className="text-xs">Đang nạp lịch làm việc...</span>
          </div>
        ) : isError ? (
          <div className="py-6 text-center text-xs text-rose-500">
            Không thể tải dữ liệu lịch làm việc. Vui lòng thử lại.
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            Không có nhân sự nào phù hợp với bộ lọc.
          </div>
        ) : (
          filteredMembers.map((member) => {
            const config = STATUS_CONFIG[member.status] || STATUS_CONFIG.day_off;
            const Icon = config.icon;

            return (
              <div
                key={member.userId}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-2.5 transition hover:border-slate-200 hover:shadow-xs gap-2"
              >
                {/* Cụm Avatar + Tên + Ca làm */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <Avatar
                      src={member.avatar ? getFileUrl(member.avatar) : undefined}
                      alt={member.fullName}
                      name={member.fullName}
                      size="sm"
                      className="!h-9 !w-9"
                    />
                    <span
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white',
                        config.dotColor
                      )}
                    />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-slate-900 truncate max-w-[130px] sm:max-w-none">
                        {member.fullName}
                      </span>
                      {member.positionName && (
                        <span className="hidden sm:inline text-[11px] text-slate-400 truncate">
                          • {member.positionName}
                        </span>
                      )}
                      <span
                        className={cn(
                          'inline-flex items-center rounded-md border px-1.5 py-0.2 text-[10px] font-semibold whitespace-nowrap shrink-0',
                          config.badgeClass
                        )}
                      >
                        {config.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <Icon size={12} className="shrink-0 text-slate-400" />
                      {member.status === 'flexible' ? (
                        <span className="text-purple-700 font-medium truncate">
                          {member.shiftName || 'Linh hoạt (Part-time)'}
                        </span>
                      ) : member.status === 'working' && member.shiftName ? (
                        <span className="text-slate-600 truncate font-medium">
                          {member.shiftName}{' '}
                          {member.startTime && member.endTime && (
                            <span className="text-slate-400">
                              ({member.startTime.slice(0, 5)} - {member.endTime.slice(0, 5)})
                            </span>
                          )}
                        </span>
                      ) : member.status === 'on_leave' ? (
                        <span className="text-amber-700 font-medium truncate">
                          {member.leaveDurationType
                            ? LEAVE_DURATION_MAP[member.leaveDurationType] || 'Nghỉ phép'
                            : 'Nghỉ phép cả ngày'}
                        </span>
                      ) : member.status === 'partial_leave' ? (
                        <span className="text-orange-700 font-medium truncate">
                          {member.leaveDurationType
                            ? LEAVE_DURATION_MAP[member.leaveDurationType]
                            : 'Nghỉ nửa ca'}{' '}
                          {member.shiftName ? `• ${member.shiftName}` : ''}
                        </span>
                      ) : (
                        <span className="text-slate-500 truncate">Nghỉ ca định kỳ</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Call */}
                {member.phoneNumber && (
                  <a
                    href={`tel:${member.phoneNumber}`}
                    aria-label={`Gọi cho ${member.fullName}`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-[#045863] transition"
                  >
                    <Phone size={13} />
                  </a>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
