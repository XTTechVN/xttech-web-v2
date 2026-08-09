'use client';

import React, { useState, useMemo } from 'react';
import {
  Breadcrumb,
  Heading,
  Button,
  Badge,
  Avatar,
  Select,
  Input,
  Tabs,
  TableData,
  ITableColumn,
  BaseResponseWithPagination,
} from '@/components';
import { toast } from 'react-hot-toast';
import {
  History,
  FileSpreadsheet,
  Calendar,
  Clock,
  AlertCircle,
  RefreshCw,
  LogIn,
  FileEdit,
  Search,
  Filter,
  Users,
  Briefcase,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import PayrollTransferHistoryModal from './_components/payroll-history-modal';
import {
  generateMockDailyLogs,
  DailyAttendanceRecord,
  PayrollRecord,
} from './_components/employee-attendance-history-modal';
import AutoTimekeepingModal from '@/app/(auth)/app/(sidebar)/attendances/_components/auto-timekeeping-modal';
import { useAuthStore } from '@/stores';
import { useQuery } from '@tanstack/react-query';
import { getAttendances } from '@/actions';
import { Attendance } from '@/types';

const statusVariantMap: Record<
  string,
  'success' | 'warning' | 'danger'
> = {
  present: 'success',
  late: 'warning',
  absent: 'danger',
  half_day: 'warning',
  early_leave: 'warning',
};


const getStatusVariant = (status?: string | null) => {
  return statusVariantMap[status ?? ""] ?? "danger";
};
const getStatusBadge = (status?: string | null) => {
  const statusTextMap: Record<string, string> = {
    present: 'Có mặt',
    late: 'Đi muộn',
    absent: 'Vắng mặt',
    half_day: 'Nghỉ nửa ngày',
    early_leave: 'Về sớm',
  };
  return statusTextMap[status ?? ""] ?? status ?? '';
};

const referenceColumns: ITableColumn<PayrollRecord>[] = [
  {
    key: 'code',
    label: 'Mã NV',
    minWidth: '90px',
    cell: (row) => <span className="font-semibold text-slate-600">{row.code}</span>,
  },
  {
    key: 'fullName',
    label: 'Họ và tên',
    minWidth: '200px',
    cell: (row) => (
      <div className="flex items-center gap-2.5">
        <Avatar src={row.avatar} name={row.fullName} size="sm" />
        <div>
          <p className="font-bold text-slate-800 text-sm">{row.fullName}</p>
          <p className="text-[11px] text-slate-400">{row.code}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'department',
    label: 'Phòng ban',
    minWidth: '160px',
    cell: (row) => <span className="text-slate-600">{row.department}</span>,
  },
  {
    key: 'standardWorkdays',
    label: 'Công chuẩn',
    minWidth: '100px',
    cell: (row) => <span className="font-semibold text-slate-700">{row.standardWorkdays.toFixed(1)}</span>,
  },
  {
    key: 'actualWorkdays',
    label: 'Công thực',
    minWidth: '100px',
    cell: (row) => <span className="font-bold text-slate-900">{row.actualWorkdays.toFixed(1)}</span>,
  },
  {
    key: 'leaveDays',
    label: 'Nghỉ phép',
    minWidth: '100px',
    cell: (row) => <span className="text-slate-600">{row.leaveDays.toFixed(1)}</span>,
  },
  {
    key: 'overtimeHours',
    label: 'Tăng ca (H)',
    minWidth: '110px',
    cell: (row) => (
      <span className="font-bold text-[#005c53]">
        {row.overtimeHours > 0 ? row.overtimeHours.toFixed(1) : <span className="text-slate-400">0</span>}
      </span>
    ),
  },
  {
    key: 'penaltyMinutes',
    label: 'Vi phạm (P)',
    minWidth: '110px',
    cell: (row) => (
      <span className="font-bold">
        {row.penaltyMinutes > 0 ? (
          <span className="text-red-600">{row.penaltyMinutes}</span>
        ) : (
          <span className="text-slate-400">0</span>
        )}
      </span>
    ),
  },
  {
    key: 'status',
    label: 'Trạng thái',
    minWidth: '120px',
    cell: (row) => (
      <Badge
        variant={row.status === 'matched' ? 'success' : 'danger'}
        className="font-bold text-[10px] tracking-wide uppercase"
      >
        {row.status === 'matched' ? 'Khớp dữ liệu' : 'Cần kiểm tra'}
      </Badge>
    ),
  },
];

const renderReferenceCard = (row: PayrollRecord, index: number) => (
  <div key={row.id || index} className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-3 shadow-xs">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Avatar src={row.avatar} name={row.fullName} size="sm" />
        <div>
          <p className="font-bold text-slate-900 text-sm">{row.fullName}</p>
          <p className="text-xs text-slate-500">{row.code} • {row.department}</p>
        </div>
      </div>
      <Badge
        variant={row.status === 'matched' ? 'success' : 'danger'}
        className="font-bold text-[10px] tracking-wide uppercase"
      >
        {row.status === 'matched' ? 'Khớp dữ liệu' : 'Cần kiểm tra'}
      </Badge>
    </div>
    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
      <div><strong>Công chuẩn:</strong> {row.standardWorkdays.toFixed(1)}</div>
      <div><strong>Công thực:</strong> {row.actualWorkdays.toFixed(1)}</div>
      <div><strong>Nghỉ phép:</strong> {row.leaveDays.toFixed(1)}</div>
      <div><strong>Tăng ca:</strong> {row.overtimeHours.toFixed(1)} h</div>
    </div>
  </div>
);

// ─── Mock data ──────────────────────────────────────────────────────────────
const mockPayrollData: PayrollRecord[] = [
  {
    id: '1',
    code: 'NV-2015',
    fullName: 'Trần Văn Phong',
    department: 'Sản xuất Xưởng A',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    standardWorkdays: 26.0,
    actualWorkdays: 26.0,
    leaveDays: 0,
    overtimeHours: 12.5,
    penaltyMinutes: 0,
    status: 'matched',
  },
  {
    id: '2',
    code: 'NV-3122',
    fullName: 'Lê Thị Hoa',
    department: 'Kiểm định chất lượng',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
    standardWorkdays: 26.0,
    actualWorkdays: 24.5,
    leaveDays: 1.0,
    overtimeHours: 0,
    penaltyMinutes: 45,
    status: 'needs_check',
  },
  {
    id: '3',
    code: 'NV-1089',
    fullName: 'Nguyễn Văn Minh',
    department: 'Kỹ thuật & Bảo trì',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
    standardWorkdays: 26.0,
    actualWorkdays: 26.0,
    leaveDays: 0,
    overtimeHours: 22.0,
    penaltyMinutes: 10,
    status: 'matched',
  },
  {
    id: '4',
    code: 'NV-4456',
    fullName: 'Phạm Anh Tuấn',
    department: 'Sản xuất Xưởng B',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
    standardWorkdays: 26.0,
    actualWorkdays: 25.0,
    leaveDays: 1.0,
    overtimeHours: 4.0,
    penaltyMinutes: 0,
    status: 'matched',
  },
];





// ─── Main component ──────────────────────────────────────────────────────────
export default function PayrollDataPage() {
  const [activeTab, setActiveTab] = useState('history');
  const [showTransferHistoryModal, setShowTransferHistoryModal] = useState(false);
  const [showTimekeepingModal, setShowTimekeepingModal] = useState(false);

  // Tab 1: Lịch sử chấm công


  // Tab 2: Dữ liệu tham khảo
  const [deptFilter, setDeptFilter] = useState('all');



  const user = useAuthStore((state) => state.user);
  // console.log(user);
  const { data: attendances, isLoading: isLoadingAttendances } = useQuery({
    queryKey: ['attendances', user?.id],
    queryFn: () => getAttendances({ userId: user!.id }),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const myAttendances = attendances?.items ?? [];
  // console.log(myAttendances);
  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => ({
    items: myAttendances.slice(offset, offset + limit),
    meta: {
      total: myAttendances.length,
      offset,
      limit,
      next: offset + limit < myAttendances.length,
    },
  });





  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/app' },
    { label: 'Quản lý nhân sự', href: '/app/employees' },
    { label: 'Tính công & Dữ liệu lương', href: '/app/attendances/payroll' },
  ];

  const tabs = [
    { value: 'history', label: 'Lịch sử chấm công', icon: <History size={15} /> },
    { value: 'reference', label: 'Dữ liệu tham khảo', icon: <BookOpen size={15} /> },
  ];

  // const employeeOptions = mockPayrollData.map((e) => ({ value: e.id, label: `${e.fullName} (${e.code})` }));

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
          {row.checkIn || '-'}
        </span>
      ),
    },
    {
      key: 'checkOut',
      label: 'Check Out',
      minWidth: '100px',
      cell: (row) => row.checkOut || '-',
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

        if (lateMinutes > 0) {
          return `Đi muộn: ${lateMinutes} phút`;
        }

        if (earlyLeaveMinutes > 0) {
          return `Về sớm: ${earlyLeaveMinutes} phút`;
        }

        return '-';
      },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '120px',
      cell: (row) => {

        return (
          <Badge
            variant={getStatusVariant(row.status)}
          >
            {getStatusBadge(row.status)}
          </Badge>
        );
      },
    },
    {
      key: 'note',
      label: 'Ghi chú',
      minWidth: '180px',
      cell: (row) => row.note || '-',
    },
  ];

  const renderAttendanceCard = (
    row: Attendance,
    index: number
  ) => (
    <div
      key={row.id ?? index}
      className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-900">
            {formatWorkDate(row.workDate)}
          </p>

          <p className="text-xs text-slate-500">
            {getDayOfWeek(row.workDate)}
          </p>
        </div>

        <Badge variant={getStatusVariant(row.status)}>
          {getStatusBadge(row.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-slate-500">Check In</p>
          <p className="font-medium">
            {row.checkIn || '-'}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Check Out</p>
          <p className="font-medium">
            {row.checkOut || '-'}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Giờ công</p>
          <p className="font-medium">
            {row.totalHours?.toFixed(1) ?? '-'} h
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Đi muộn</p>
          <p className="font-medium">
            {(row.lateMinutes ?? 0) > 0
              ? `${row.lateMinutes} phút`
              : '-'}
          </p>
        </div>
      </div>

      {row.note && (
        <div className="border-t border-slate-100 pt-2">
          <p className="text-xs text-slate-500">Ghi chú</p>
          <p className="text-sm text-slate-700">
            {row.note}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full w-full flex-1 flex-col bg-slate-50 p-6 space-y-6 overflow-y-auto">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="gap-2 bg-[#005c53] hover:bg-[#004740] text-white font-semibold shadow-sm"
            leftIcon={<LogIn size={16} />}
            onClick={() => setShowTimekeepingModal(true)}
          >
            Điểm danh ngay
          </Button>
          <Button
            variant="secondary"
            className="gap-2 bg-[#dbeafe] text-[#1e40af] hover:bg-[#bfdbfe] font-semibold"
            leftIcon={<Clock size={16} className="text-[#1e40af]" />}
            onClick={() => {
              toast.loading('Tính năng đang được phát triển', { id: 'loading', });
              setTimeout(() => { toast.dismiss('loading'); }, 1000);
            }}
          >
            Đăng ký tăng ca
          </Button>
          <Link href="/app/attendances/adjustments">
            <Button
              variant="secondary"
              className="gap-2 bg-[#dbeafe] text-[#1e40af] hover:bg-[#bfdbfe] font-semibold"
              leftIcon={<FileEdit size={16} className="text-[#1e40af]" />}
            >
              Yêu cầu điều chỉnh
            </Button>
          </Link>
          <Button
            className="gap-2 bg-[#005c53] hover:bg-[#004740] text-white font-semibold shadow-sm"
            leftIcon={<FileSpreadsheet size={16} />}
            onClick={() => toast.success('Đã xuất file Excel dữ liệu công thành công!')}
          >
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* Title */}
      <div>
        <Heading size="h2" className="text-2xl font-bold text-slate-900">
          Tính công & Dữ liệu lương
        </Heading>
        <p className="mt-1 text-sm text-slate-500">
          Tổng hợp và kiểm tra dữ liệu công trước khi kết chuyển lương.
        </p>
      </div>

      {/* 5 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: <Calendar size={18} />, bg: 'bg-teal-50', color: 'text-[#005c53]', label: 'TỔNG NGÀY CÔNG', value: getTotalWorkingDay(), unit: 'ngày', badge: '', badgeColor: 'text-blue-600 bg-blue-50' },
          { icon: <Briefcase size={18} />, bg: 'bg-sky-50', color: 'text-sky-600', label: 'TỔNG NGÀY PHÉP', value: getTotalLeaveDays(), unit: 'ngày' },
          { icon: <Users size={18} />, bg: 'bg-indigo-50', color: 'text-indigo-600', label: 'NGÀY NGHỈ', value: getTotalAbsenceDays(), unit: 'ngày' },
          { icon: <Clock size={18} />, bg: 'bg-amber-50', color: 'text-amber-600', label: 'TĂNG CA (OT)', value: getTotalOvertime(), unit: 'giờ', badge: 'Cao điểm', badgeColor: 'text-teal-700 bg-teal-50' },
          { icon: <AlertCircle size={18} />, bg: 'bg-red-50', color: 'text-red-500', label: 'TỔNG THỜI GIAN ĐI MUỘN/VỀ SỚM', value: getLatePolicy(), unit: 'phút' },
        ].map((card, i) => (
          <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className={`rounded-xl ${card.bg} p-2.5 ${card.color}`}>{card.icon}</div>
              {card.badge && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                  {card.badge}
                </span>
              )}
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">{card.label}</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {card.value} <span className="text-xs font-normal text-slate-500">{card.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sync Banner */}
      {/* <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-teal-50/50 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-white p-3 shadow-xs text-[#005c53] shrink-0 border border-slate-200/60">
            <RefreshCw size={22} className="animate-spin-slow" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Đồng bộ dữ liệu vân tay</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Lần đồng bộ cuối: 08:30 Hôm nay. Hệ thống tự động kiểm tra sai lệch.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            className="bg-white text-slate-700 border-slate-200 hover:bg-slate-100 text-xs font-semibold"
            onClick={() => toast.info('Đã hoàn thành kiểm tra sai lệch: 1 hồ sơ cần kiểm tra.')}
          >
            Kiểm tra sai lệch
          </Button>
          <Button
            className="bg-[#005c53] hover:bg-[#004740] text-white text-xs font-semibold shadow-xs"
            onClick={() => toast.success('Đã đồng bộ dữ liệu vân tay thành công!')}
          >
            Đồng bộ ngay
          </Button>
        </div>
      </div> */}

      {/* Main Content Section with Tabs */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {/* Tabs Header */}
        <div className="px-6 pt-5 border-b border-slate-200">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="line" />
        </div>

        {/* ── Tab 1: Lịch sử chấm công ─────────────────────────── */}
        {activeTab === 'history' && (
          <div className="p-6 space-y-5">
            {/* Employee picker + metric cards */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar src={user?.avatar} name={user?.fullName} size="md" />
                <div>
                  <p className="font-bold text-slate-900 text-sm leading-tight">{user?.fullName}</p>
                  <p className="text-xs text-slate-500">{user?.identifyCode} •
                    {user?.positions?.map((item) => item.name).join(', ')}</p>
                  <p className="text-xs text-slate-500">{user?.roles?.[0]?.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* <Select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  options={employeeOptions}
                  className="text-xs w-56"
                /> */}
                <Button
                  variant="outline"
                  className="gap-1.5 text-xs border-slate-200"
                  leftIcon={<FileSpreadsheet size={14} />}
                  onClick={() => toast.success(`Đã xuất báo cáo của ${user?.fullName}!`)}
                >
                  Xuất bảng công
                </Button>
              </div>
            </div>

            {/* 4 metric mini cards */}
            {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'CÔNG THỰC TẾ', value: `${user?.actualWorkdays.toFixed(1)}`, sub: `/ ${user?.standardWorkdays} ngày`, color: 'text-[#005c53]', bg: 'bg-teal-50/40' },
                { label: 'NGHỈ PHÉP', value: `${user?.leaveDays.toFixed(1)}`, sub: 'ngày', color: 'text-sky-700', bg: 'bg-sky-50/40' },
                { label: 'TĂNG CA (OT)', value: `${user?.overtimeHours.toFixed(1)}`, sub: 'giờ', color: 'text-[#005c53]', bg: 'bg-amber-50/40' },
                { label: 'VI PHẠM (ĐI MUỘN)', value: `${user?.penaltyMinutes}`, sub: 'phút', color: 'text-red-600', bg: 'bg-red-50/40' },
              ].map((c, i) => (
                <div key={i} className={`rounded-xl border border-slate-200 ${c.bg} p-3.5 space-y-1`}>
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">{c.label}</span>
                  <div className={`text-xl font-black ${c.color}`}>
                    {c.value} <span className="text-xs font-normal text-slate-500">{c.sub}</span>
                  </div>
                </div>
              ))}
            </div> */}

            {/* Filter Controls */}
            {/* <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium">
                  <Calendar size={14} className="text-slate-400" />
                  <span>Tháng 11, 2024</span>
                </div>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs w-44 bg-white"
                  options={[
                    { label: 'Tất cả trạng thái', value: 'all' },
                    { label: 'Có mặt', value: 'present' },
                    { label: 'Đi muộn', value: 'late' },
                    { label: 'Nghỉ phép / Nghỉ tuần', value: 'leave' },
                  ]}
                />
              </div>
              <div className="relative w-full sm:w-64">
                <Input
                  placeholder="Tìm theo ngày, ca làm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-white text-xs"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div> */}

            {/* Daily logs table */}
            {isLoadingAttendances ? (
              <div className="py-10 text-center text-sm text-slate-500">
                Đang tải dữ liệu...
              </div>
            ) : (
              <TableData<Attendance>
                queryKey={['payroll-daily-logs', user?.id]}
                fetcher={fetcher}
                columns={attendanceColumns}
                renderCard={renderAttendanceCard}
                select={false}
                syncToUrl={false}
              />
            )}
          </div>
        )}

        {/* ── Tab 2: Dữ liệu tham khảo ─────────────────────────── */}
        {activeTab === 'reference' && (
          <div className="p-6 space-y-4">
            {/* Reference info banner */}
            <div className="flex items-start gap-3 rounded-xl bg-blue-50/70 border border-blue-200/60 px-4 py-3">
              <BookOpen size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Dữ liệu công chuẩn (Tham khảo)</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Bảng tổng hợp này do Admin cấu hình qua{' '}
                  <strong>Chính sách chấm công</strong> và <strong>Quản lý ca làm việc</strong>.
                  Người dùng chỉ có thể xem để tham khảo.
                </p>
              </div>
            </div>

            {/* Filter row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700">
                <Calendar size={14} className="text-slate-500" />
                <span>Tháng 11, 2024</span>
              </div>
              <Select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="text-xs w-44"
                options={[
                  { label: 'Tất cả phòng ban', value: 'all' },
                  { label: 'Sản xuất Xưởng A', value: 'Sản xuất Xưởng A' },
                  { label: 'Kiểm định chất lượng', value: 'Kiểm định chất lượng' },
                  { label: 'Kỹ thuật & Bảo trì', value: 'Kỹ thuật & Bảo trì' },
                  { label: 'Sản xuất Xưởng B', value: 'Sản xuất Xưởng B' },
                ]}
              />
              <Button variant="outline" className="gap-1.5 text-xs py-2 border-slate-200" leftIcon={<Filter size={14} />}>
                Bộ lọc
              </Button>
            </div>

            {/* Reference table */}
            <TableData<PayrollRecord>
              queryKey={['payroll-reference-data', deptFilter]}
              fetcher={async ({ offset, limit }) => {
                const filtered = deptFilter === 'all'
                  ? mockPayrollData
                  : mockPayrollData.filter((r) => r.department === deptFilter);
                const start = offset;
                const end = offset + limit;
                return {
                  items: filtered.slice(start, end),
                  meta: {
                    total: filtered.length,
                    offset,
                    limit,
                    next: end < filtered.length,
                  },
                };
              }}
              columns={referenceColumns}
              renderCard={renderReferenceCard}
              select={false}
              syncToUrl={false}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <PayrollTransferHistoryModal
        open={showTransferHistoryModal}
        onClose={() => setShowTransferHistoryModal(false)}
      />
      <AutoTimekeepingModal
        open={showTimekeepingModal}
        onClose={() => setShowTimekeepingModal(false)}
      />
    </div >
  );
}
