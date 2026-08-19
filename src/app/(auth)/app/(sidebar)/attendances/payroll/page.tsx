'use client';

import React, { useState, useMemo } from 'react';
import {
  Heading,
  Button,
  Badge,
  TableData,
  TableAction,
  ITableColumn,
  ITableFilterProps,
} from '@/components';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Clock,
  AlertCircle,
  LogIn,
  LogOut,
  FileEdit,
  Users,
  Briefcase,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import AutoTimekeepingModal from '@/app/(auth)/app/(sidebar)/attendances/_components/auto-timekeeping-modal';
import { useAuthStore } from '@/stores';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAttendances } from '@/actions';
import { Attendance } from '@/types';
import StatCart from '../../dashboard/_components/stats-card';
import AddAdjustmentModal from '../_components/adjustment/add-modal';
import AttendanceDetailModal from '../_components/attendance-modal';

const statusVariantMap: Record<
  string,
  'success' | 'warning' | 'danger'
> = {
  normal: 'success',
  late: 'warning',
  absent: 'danger',
  half_day: 'warning',
  early_leave: 'warning',
};

const getStatusVariant = (status?: string | null) => {
  return statusVariantMap[status ?? ''] ?? 'danger';
};

const formatTime = (value?: string | null): string => {
  if (!value) return '--:--';
  if (value.includes('T')) return value.substring(11, 16);
  if (value.includes(' ') && value.length >= 16) return value.substring(11, 16);
  return value.substring(0, 5);
};

const getStatusBadge = (status?: string | null) => {
  const statusTextMap: Record<string, string> = {
    present: 'Đúng giờ',
    late: 'Đi muộn',
    absent: 'Vắng mặt',
    half_day: 'Nghỉ nửa ngày',
    early_leave: 'Về sớm',
  };
  return statusTextMap[status ?? ''] ?? status ?? '';
};

// ─── Main component ──────────────────────────────────────────────────────────
export default function PayrollDataPage() {
  const queryClient = useQueryClient();
  const [showTimekeepingModal, setShowTimekeepingModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Attendance | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const user = useAuthStore((state) => state.user);

  const { data: attendances, isLoading: isLoadingAttendances } = useQuery({
    queryKey: ['attendances', user?.id],
    queryFn: () => getAttendances({ userId: user!.id, limit: 100 }),
    enabled: !!user?.id,
  });

  const myAttendances = attendances?.items ?? [];

  const todayStr = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const todayAttendance = useMemo(() => {
    return myAttendances.find((a) => a.workDate === todayStr);
  }, [myAttendances, todayStr]);

  const hasCheckedInToday = useMemo(() => {
    return Boolean(
      todayAttendance &&
        (todayAttendance.checkIn ||
          (todayAttendance.status && todayAttendance.status !== 'absent'))
    );
  }, [todayAttendance]);

  // Filters and search for Payroll attendance history table
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [filterStartDate, setFilterStartDate] = useState<string | undefined>();
  const [filterEndDate, setFilterEndDate] = useState<string | undefined>();

  const statusOptions = useMemo(() => {
    const statuses = Array.from(
      new Set(myAttendances.map((item) => item.status).filter((s): s is string => Boolean(s)))
    );
    return statuses.map((status) => ({
      label: String(getStatusBadge(status) || status),
      value: String(status),
    }));
  }, [myAttendances]);

  const dateOptions = useMemo(() => {
    return Array.from({ length: 31 }, (_, i) => {
      const day = String(i + 1).padStart(2, '0');
      return {
        label: `2026-08-${day}`,
        value: `2026-08-${day}`,
      };
    });
  }, []);

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
        items: myAttendances.slice(offset, offset + limit),
        meta: {
          total: myAttendances.length,
          offset,
          limit,
          next: offset + limit < myAttendances.length,
        },
      };
    }
    const response = await getAttendances({
      offset,
      limit,
      userId: user.id,
      search: searchQuery || undefined,
      status: (filterStatus as any) || undefined,
      startDate: filterStartDate || undefined,
      endDate: filterEndDate || undefined,
    });
    const rawItems = response.items ?? [];
    let items = [...rawItems];
    if (searchQuery) {
      items = items.filter((item) =>
        (item.note || item.workDate || item.status || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }
    if (filterStatus) {
      items = items.filter((item) => item.status === filterStatus);
    }
    if (filterStartDate) {
      items = items.filter((item) => item.workDate >= filterStartDate);
    }
    if (filterEndDate) {
      items = items.filter((item) => item.workDate <= filterEndDate);
    }
    const metaInfo = response.meta;
    return {
      items,
      meta: {
        total: metaInfo?.total ?? items.length,
        offset: metaInfo?.offset ?? offset,
        limit: metaInfo?.limit ?? limit,
        next: metaInfo?.next ?? false,
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

  const getTotalWorkingDay = () => {
    return myAttendances.filter((a) => a.status !== 'absent').length;
  };

  const getTotalLeaveDays = () => {
    return myAttendances.filter((a) => a.status === 'leave').length;
  };

  const getTotalAbsenceDays = () => {
    return myAttendances.filter((a) => a.status === 'absent').length;
  };

  const getTotalOvertime = () => {
    return myAttendances.filter((a) => a.status === 'overtime').length;
  };

  const getLatePolicy = () => {
    return myAttendances.filter((a) => a.status === 'late').length;
  };

  const attendanceColumns: ITableColumn<Attendance>[] = [
    {
      key: 'workDate',
      label: 'Ngày',
      minWidth: '100px',
      cell: (row) => formatWorkDate(row.workDate),
    },
    {
      key: 'dayOfWeek',
      label: 'Thứ',
      minWidth: '80px',
      cell: (row) => getDayOfWeek(row.workDate),
    },
    {
      key: 'checkIn',
      label: 'Check In',
      minWidth: '100px',
      cell: (row) => (
        <span
          className={
            row.isLate
              ? 'font-medium text-red-600'
              : 'text-slate-800'
          }
        >
          {formatTime(row.checkIn)}
        </span>
      ),
    },
    {
      key: 'checkOut',
      label: 'Check Out',
      minWidth: '100px',
      cell: (row) => (
        <span
          className={
            row.isEarlyLeave
              ? 'font-medium text-amber-600'
              : 'text-slate-800'
          }
        >
          {formatTime(row.checkOut)}
        </span>
      ),
    },
    {
      key: 'totalHours',
      label: 'Giờ công',
      minWidth: '100px',
      cell: (row) =>
        (row.totalHours ?? 0) > 0
          ? `${row.totalHours} h`
          : '-',
    },
    {
      key: 'violation',
      label: 'Đi muộn / Về sớm',
      minWidth: '150px',
      cell: (row) => {
        const lateMinutes = row.lateMinutes ?? 0;
        const earlyLeaveMinutes = row.earlyLeaveMinutes ?? 0;

        if (lateMinutes === 0 && earlyLeaveMinutes === 0) {
          return '-';
        }

        return (
          <div className="flex flex-col gap-0.5 text-[13px]">
            {lateMinutes > 0 && (
              <span className="font-medium whitespace-nowrap">
                Đi muộn: {lateMinutes} phút
              </span>
            )}
            {earlyLeaveMinutes > 0 && (
              <span className="font-medium whitespace-nowrap">
                Về sớm: {earlyLeaveMinutes} phút
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '120px',
      cell: (row) => {
        return (
          <Badge variant={getStatusVariant(row.status)}>
            {getStatusBadge(row.status)}
          </Badge>
        );
      },
    },
    {
      key: 'note',
      label: 'Ghi chú',
      minWidth: '100px',
      cell: (row) => row.note || '-',
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

  const renderAttendanceCard = (row: Attendance, index: number) => (
    <div
      key={row.id ?? index}
      className="rounded-2xl border border-primary/10 bg-white p-4 shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300 space-y-3"
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <p className="font-bold text-slate-900 text-sm">
            {formatWorkDate(row.workDate)}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            {getDayOfWeek(row.workDate)}
          </p>
        </div>
        <Badge variant={getStatusVariant(row.status)} pill>
          {getStatusBadge(row.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Check In</span>
          <span className="font-semibold text-slate-800">{formatTime(row.checkIn)}</span>
          {(row.lateMinutes ?? 0) > 0 && (
            <span className="text-[10px] text-amber-600 font-medium block">Muộn {row.lateMinutes}p</span>
          )}
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Check Out</span>
          <span className="font-semibold text-slate-800">{formatTime(row.checkOut)}</span>
          {(row.earlyLeaveMinutes ?? 0) > 0 && (
            <span className="text-[10px] text-amber-600 font-medium block">Về sớm {row.earlyLeaveMinutes}p</span>
          )}
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
        <p className="text-xs text-slate-500 italic bg-slate-50/50 p-2 rounded-lg border border-dashed border-slate-200">
          Ghi chú: {row.note}
        </p>
      )}
    </div>
  );

  const payrollStats = [
    {
      title: 'Tổng ngày công',
      value: getTotalWorkingDay(),
      icon: <Calendar />,
      trend: getTotalWorkingDay(),
      trendDirection: getTotalWorkingDay() > 0 ? 1 : -1,
    },
    {
      title: 'Tổng ngày phép',
      value: getTotalLeaveDays(),
      icon: <Briefcase />,
      trend: getTotalLeaveDays(),
      trendDirection: getTotalLeaveDays() > 0 ? 1 : -1,
    },
    {
      title: 'Ngày nghỉ',
      value: getTotalAbsenceDays(),
      icon: <Users />,
      trend: getTotalAbsenceDays(),
      trendDirection: getTotalAbsenceDays() > 0 ? 1 : -1,
    },
    {
      title: 'Tăng ca (OT)',
      value: getTotalOvertime(),
      icon: <Clock />,
      trend: getTotalOvertime(),
      trendDirection: getTotalOvertime() > 0 ? 1 : -1,
    },
    {
      title: 'Tổng số lần đi muộn/về sớm',
      value: `${getLatePolicy()}`,
      icon: <AlertCircle />,
      trend: getLatePolicy(),
      trendDirection: getLatePolicy() > 0 ? 1 : -1,
    },
  ];

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
              leftIcon={hasCheckedInToday ? <LogOut size={16} /> : <LogIn size={16} />}
              onClick={() => setShowTimekeepingModal(true)}
            >
              {hasCheckedInToday ? 'Check-out ngay' : 'Check-in ngay'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 px-3 hover:bg-[#ececf27d] shrink-0"
              leftIcon={<Clock size={16} className="text-[#314158]" />}
              onClick={() => {
                toast.loading('Tính năng đang được phát triển', { id: 'loading' });
                setTimeout(() => {
                  toast.dismiss('loading');
                }, 1000);
              }}
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
          <div className="py-10 text-center text-sm text-slate-500">
            Đang tải dữ liệu...
          </div>
        ) : (
          <TableData<Attendance>
            queryKey={['payroll-daily-logs', user?.id, searchQuery, filterStatus, filterStartDate, filterEndDate]}
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

      <AttendanceDetailModal
        open={showDetailModal}
        data={selectedRow}
        onClose={() => setShowDetailModal(false)}
      />

      <AutoTimekeepingModal
        open={showTimekeepingModal}
        onClose={() => setShowTimekeepingModal(false)}
        onSuccess={async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['attendances'], refetchType: 'all' }),
            queryClient.invalidateQueries({ queryKey: ['payroll-daily-logs'], refetchType: 'all' }),
          ]);
        }}
        hasCheckedIn={hasCheckedInToday}
      />
    </div>
  );
}
