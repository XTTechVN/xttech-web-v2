'use client';

import React, { useState, useMemo } from 'react';
import { Button, Badge, TableData, TableAction, ITableColumn, ITableFilterProps } from '@/components';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, AlertCircle, LogIn, LogOut, FileEdit, Briefcase, Eye, UserX } from 'lucide-react';
import Link from 'next/link';
import AutoTimekeepingModal from '@/app/(auth)/app/(sidebar)/attendances/_components/auto-timekeeping-modal';
import { useAuthStore } from '@/stores';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAttendances } from '@/actions';
import { Attendance, getAttendanceStatusLabel, getAttendanceStatusVariant } from '@/types';
import { BASE_MINIO_URL } from '@/config/app';
import StatCart from '../../dashboard/_components/stats-card';
import AddAdjustmentModal from '../adjustments/_components/add-modal';
import AttendanceDetailModal from '../_components/attendance-modal';
import OvertimeModal from '../_components/overtime-modal';

const formatTime = (value?: string | null): string => {
  if (!value) return '--:--';
  if (value.includes('T')) return value.substring(11, 16);
  if (value.includes(' ') && value.length >= 16) return value.substring(11, 16);
  return value.substring(0, 5);
};

// ─── Main component ──────────────────────────────────────────────────────────
export default function PayrollDataPage() {
  const queryClient = useQueryClient();
  const [showTimekeepingModal, setShowTimekeepingModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Attendance | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const user = useAuthStore((state) => state.user);

  const { data: attendances, isLoading: isLoadingAttendances } = useQuery({
    queryKey: ['attendances', user?.id],
    queryFn: () => getAttendances({ userId: user!.id, limit: 100 }),
    enabled: !!user?.id,
  });

  const myAttendances = useMemo(() => attendances?.items ?? [], [attendances?.items]);

  // Ưu tiên tìm phiên chấm công đang mở (đã check-in nhưng chưa check-out)
  const activeOpenAttendance = useMemo(() => {
    return myAttendances.find((a) => a.checkIn && !a.checkOut);
  }, [myAttendances]);

  // Chỉ hiển thị 'Check-out ngay' khi có phiên chấm công đang mở; ngược lại hiển thị 'Check-in ngay'
  const isCheckOutAction = Boolean(activeOpenAttendance);

  // Filters and search for Payroll attendance history table
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>();

  const statusOptions = useMemo(() => {
    const statuses = Array.from(new Set(myAttendances.map((item) => item.status).filter((s): s is string => Boolean(s))));
    return statuses.map((status) => ({
      label: getAttendanceStatusLabel(status),
      value: String(status),
    }));
  }, [myAttendances]);

  const tableFilters: ITableFilterProps[] = [
    {
      label: 'Trạng thái',
      value: filterStatus,
      options: statusOptions,
      onChange: (val: string | undefined) => setFilterStatus(val),
    },
  ];

  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    if (!user?.id) {
      return {
        items: [],
        meta: { total: 0, offset, limit, next: false },
      };
    }
    const response = await getAttendances({
      offset,
      limit,
      userId: user.id,
      search: searchQuery.trim() || undefined,
      status: (filterStatus as any) || undefined,
    });
    return {
      items: response.items ?? [],
      meta: response.meta ?? {
        total: response.items?.length ?? 0,
        offset,
        limit,
        next: false,
      },
    };
  };

  const formatWorkDate = (date: string) => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  const getDayOfWeek = (date: string) => {
    const dateObj = new Date(`${date}T00:00:00`);
    const day = dateObj.getDay();
    return day === 0 ? 'CN' : String(day + 1);
  };

  const payrollStats = useMemo(() => {
    let workingDays = 0;
    let leaveDays = 0;
    let absenceDays = 0;
    let overtimeCount = 0;
    let lateCount = 0;

    for (const a of myAttendances) {
      if (a.status !== 'absent') workingDays++;
      if (a.status === 'leave') leaveDays++;
      if (a.status === 'absent') absenceDays++;
      if (a.status === 'overtime') overtimeCount++;
      if (a.status === 'late' || a.isLate || a.isEarlyLeave) lateCount++;
    }

    return [
      {
        title: 'Tổng ngày công',
        value: workingDays,
        icon: <Calendar />,
        trend: workingDays,
        trendDirection: workingDays > 0 ? 1 : -1,
      },
      {
        title: 'Tổng ngày phép',
        value: leaveDays,
        icon: <Briefcase />,
        trend: leaveDays,
        trendDirection: leaveDays > 0 ? 1 : -1,
      },
      {
        title: 'Ngày nghỉ',
        value: absenceDays,
        icon: <UserX />,
        trend: absenceDays,
        trendDirection: absenceDays > 0 ? 1 : -1,
      },
      {
        title: 'Tăng ca (OT)',
        value: overtimeCount,
        icon: <Clock />,
        trend: overtimeCount,
        trendDirection: overtimeCount > 0 ? 1 : -1,
      },
      {
        title: 'Đi muộn / Về sớm',
        value: `${lateCount}`,
        icon: <AlertCircle />,
        trend: lateCount,
        trendDirection: lateCount > 0 ? 1 : -1,
      },
    ];
  }, [myAttendances]);

  const attendanceColumns: ITableColumn<Attendance>[] = [
    {
      key: 'workDate',
      label: 'Ngày chấm công',
      minWidth: '150px',
      cell: (row) => {
        const day = getDayOfWeek(row.workDate);
        const dayLabel = day === 'CN' ? 'CN' : `Thứ ${day}`;
        return (
          <span className="font-medium text-slate-600 text-sm">
            {dayLabel}, {formatWorkDate(row.workDate)}
          </span>
        );
      },
    },
    {
      key: 'timekeeping',
      label: 'Thời gian',
      minWidth: '200px',
      cell: (row) => {
        const lateMinutes = row.lateMinutes ?? 0;
        const earlyLeaveMinutes = row.earlyLeaveMinutes ?? 0;
        return (
          <div className="flex flex-col gap-0.5 py-1">
            <div className="flex items-center gap-1.5 text-sm flex-wrap">
              <span className="font-medium text-slate-700">{formatTime(row.checkIn)}</span>
              {lateMinutes > 0 && <span className="text-[10px] bg-red-50 text-red-600 px-1 py-0.5 rounded font-medium">M{lateMinutes}p</span>}
              <span className="font-medium">-</span>
              <span className="font-medium text-slate-700">{formatTime(row.checkOut)}</span>
              {earlyLeaveMinutes > 0 && (
                <span className="text-[10px] bg-amber-50 text-amber-600 px-1 py-0.5 rounded font-medium">S{earlyLeaveMinutes}p</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'photos',
      label: 'Ảnh chấm công',
      minWidth: '120px',
      cell: (row) => {
        const inImgPath = row.imgCheckinPath;
        const outImgPath = row.imgCheckoutPath;
        const inImgSrc = inImgPath ? (inImgPath.startsWith('http') ? inImgPath : `${BASE_MINIO_URL}${inImgPath}`) : null;
        const outImgSrc = outImgPath ? (outImgPath.startsWith('http') ? outImgPath : `${BASE_MINIO_URL}${outImgPath}`) : null;

        return (
          <div className="flex gap-2 items-center py-1">
            {inImgSrc ? (
              <a
                href={inImgSrc}
                target="_blank"
                rel="noreferrer"
                className="block relative w-9 h-9 rounded-full border border-slate-200 overflow-hidden cursor-pointer hover:opacity-85 transition-opacity"
                title="Ảnh check-in"
              >
                <img src={inImgSrc} alt="Check In" className="object-cover w-full h-full" />
              </a>
            ) : (
              <div
                className="w-9 h-9 rounded-full bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs"
                title="Không có ảnh check-in"
              >
                -
              </div>
            )}
            {outImgSrc ? (
              <a
                href={outImgSrc}
                target="_blank"
                rel="noreferrer"
                className="block relative w-9 h-9 rounded-full border border-slate-200 overflow-hidden cursor-pointer hover:opacity-85 transition-opacity"
                title="Ảnh check-out"
              >
                <img src={outImgSrc} alt="Check Out" className="object-cover w-full h-full" />
              </a>
            ) : (
              <div
                className="w-9 h-9 rounded-full bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs"
                title="Không có ảnh check-out"
              >
                -
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '120px',
      cell: (row) => <Badge variant={getAttendanceStatusVariant(row.status)}>{getAttendanceStatusLabel(row.status)}</Badge>,
    },
    {
      key: 'note',
      label: 'Ghi chú',
      minWidth: '100px',
      cell: (row) => (
        <span
          className="text-xs max-w-[90px] truncate block"
          title={row.note || undefined}
        >
          {row.note || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '120px',
      cell: (row) => (
        <TableAction
          items={[
            {
              title: 'Khiếu nại',
              icon: FileEdit,
              size: 18,
              onClick: () => {
                setSelectedRow(row);
                setShowAdjustmentModal(true);
              },
            },
            {
              title: 'Chi tiết chấm công',
              icon: Eye,
              size: 18,
              onClick: () => {
                setSelectedRow(row);
                setShowDetailModal(true);
              },
            },
          ]}
        />
      ),
    },
  ];

  const renderAttendanceCard = (row: Attendance, index: number) => {
    const inImgPath = row.imgCheckinPath;
    const outImgPath = row.imgCheckoutPath;
    const inImgSrc = inImgPath ? (inImgPath.startsWith('http') ? inImgPath : `${BASE_MINIO_URL}${inImgPath}`) : null;
    const outImgSrc = outImgPath ? (outImgPath.startsWith('http') ? outImgPath : `${BASE_MINIO_URL}${outImgPath}`) : null;

    return (
      <div
        key={row.id ?? index}
        className="rounded-2xl border border-primary/10 bg-white p-4 shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300 space-y-3"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <p className="font-bold text-slate-900 text-sm">{formatWorkDate(row.workDate)}</p>
            <p className="text-[11px] text-slate-400 font-medium">
              {getDayOfWeek(row.workDate) === 'CN' ? 'Chủ nhật' : `Thứ ${getDayOfWeek(row.workDate)}`}
            </p>
          </div>
          <Badge variant={getAttendanceStatusVariant(row.status)} pill>
            {getAttendanceStatusLabel(row.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <div className="flex gap-2">
            {inImgSrc ? (
              <a
                href={inImgSrc}
                target="_blank"
                rel="noreferrer"
                className="block relative w-8 h-8 rounded-full border border-slate-200 overflow-hidden shrink-0 mt-0.5"
              >
                <img src={inImgSrc} alt="Check In" className="object-cover w-full h-full" />
              </a>
            ) : null}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Check In</span>
              <span className="font-semibold text-slate-800">{formatTime(row.checkIn)}</span>
              {(row.lateMinutes ?? 0) > 0 && <span className="text-[10px] text-red-600 font-medium block">Muộn {row.lateMinutes}p</span>}
            </div>
          </div>
          <div className="flex gap-2">
            {outImgSrc ? (
              <a
                href={outImgSrc}
                target="_blank"
                rel="noreferrer"
                className="block relative w-8 h-8 rounded-full border border-slate-200 overflow-hidden shrink-0 mt-0.5"
              >
                <img src={outImgSrc} alt="Check Out" className="object-cover w-full h-full" />
              </a>
            ) : null}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Check Out</span>
              <span className="font-semibold text-slate-800">{formatTime(row.checkOut)}</span>
              {(row.earlyLeaveMinutes ?? 0) > 0 && (
                <span className="text-[10px] text-amber-600 font-medium block">Về sớm {row.earlyLeaveMinutes}p</span>
              )}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Giờ công</span>
            <span className="font-bold text-teal-700">{row.totalHours?.toFixed(1) ?? '0'}h</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Tăng ca</span>
            <span className="font-bold text-slate-700">0h</span>
          </div>
        </div>

        {row.note && (
          <p className="text-xs text-slate-500 italic bg-slate-50/50 p-2 rounded-lg border border-dashed border-slate-200 truncate" title={row.note}>
            Ghi chú: {row.note}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-2.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => {
              setSelectedRow(row);
              setShowAdjustmentModal(true);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <FileEdit size={12} />
            Khiếu nại
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedRow(row);
              setShowDetailModal(true);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Eye size={12} />
            Chi tiết
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {payrollStats.map((stat, i) => (
          <StatCart
            key={i}
            title={stat.title}
            value={String(stat.value)}
            icon={stat.icon}
            trend={stat.trend}
            trendDirection={stat.trendDirection as any}
          />
        ))}
      </div>

      {/* Main Table Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center w-full gap-4">
          <div className="flex items-center sm:justify-end gap-2 overflow-x-auto scrollbar-none max-w-full w-full sm:w-auto shrink-0 pb-1 sm:pb-0 flex-nowrap sm:flex-wrap">
            <Button
              variant="primary"
              size="sm"
              className="gap-2 px-3 shrink-0"
              leftIcon={isCheckOutAction ? <LogOut size={16} /> : <LogIn size={16} />}
              onClick={() => setShowTimekeepingModal(true)}
            >
              {isCheckOutAction ? 'Check-out ngay' : 'Check-in ngay'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 px-3 hover:bg-[#ececf27d] shrink-0"
              leftIcon={<Clock size={16} className="text-[#314158]" />}
              onClick={() => setShowOvertimeModal(true)}
            >
              Đăng ký tăng ca
            </Button>
            <Link href="/app/attendances/adjustments" className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 px-3 hover:bg-[#ececf27d] w-full"
                leftIcon={<FileEdit size={16} className="text-[#314158]" />}
              >
                Yêu cầu điều chỉnh
              </Button>
            </Link>
          </div>
        </div>

        {isLoadingAttendances ? (
          <div className="py-10 text-center text-sm text-slate-500">Đang tải dữ liệu...</div>
        ) : (
          <TableData<Attendance>
            queryKey={['payroll-daily-logs', user?.id, searchQuery, filterStatus]}
            fetcher={fetcher}
            columns={attendanceColumns}
            search={{
              placeholder: 'Tìm kiếm theo ngày, ghi chú, trạng thái...',
              value: searchQuery,
              onChange: (value) => setSearchQuery(value),
              className: 'min-w-[310px]',
            }}
            filters={tableFilters}
            renderCard={renderAttendanceCard}
            select={false}
            syncToUrl={false}
          />
        )}
      </div>

      <OvertimeModal
        open={showOvertimeModal}
        onClose={() => setShowOvertimeModal(false)}
        onSuccess={async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['attendances'], refetchType: 'all' }),
            queryClient.invalidateQueries({ queryKey: ['payroll-daily-logs'], refetchType: 'all' }),
            queryClient.invalidateQueries({ queryKey: ['attendance-requests'], refetchType: 'all' }),
          ]);
        }}
      />

      <AddAdjustmentModal
        open={showAdjustmentModal}
        onClose={() => setShowAdjustmentModal(false)}
        onSuccess={async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['attendances'], refetchType: 'all' }),
            queryClient.invalidateQueries({ queryKey: ['payroll-daily-logs'], refetchType: 'all' }),
          ]);
          toast.success('Thêm thành công');
        }}
        data={selectedRow}
      />

      <AttendanceDetailModal open={showDetailModal} data={selectedRow} onClose={() => setShowDetailModal(false)} />

      <AutoTimekeepingModal
        open={showTimekeepingModal}
        onClose={() => setShowTimekeepingModal(false)}
        onSuccess={async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['attendances'], refetchType: 'all' }),
            queryClient.invalidateQueries({ queryKey: ['payroll-daily-logs'], refetchType: 'all' }),
          ]);
        }}
        hasCheckedIn={isCheckOutAction}
      />
    </div>
  );
}
