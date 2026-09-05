import React, { useState } from 'react';
import { Modal, Button, Badge, Avatar, Select, Input, TableData, ITableColumn } from '@/components';
import { getAttendanceStatusLabel, getAttendanceStatusVariant } from '@/types';
import { toast } from 'react-hot-toast';
import { Calendar,FileSpreadsheet,Search } from 'lucide-react';

export interface DailyAttendanceRecord {
  id: string;
  date: string;
  dayOfWeek: string;
  shiftName: string;
  checkIn: string | null;
  checkOut: string | null;
  workHours: number;
  otHours: number;
  penaltyMinutes: number;
  status: 'present' | 'late' | 'early_leave' | 'absent' | 'leave';
  device: string;
  note?: string;
}

export interface PayrollRecord {
  id: string;
  code: string;
  fullName: string;
  department: string;
  avatar: string;
  standardWorkdays: number;
  actualWorkdays: number;
  leaveDays: number;
  overtimeHours: number;
  penaltyMinutes: number;
  status: 'matched' | 'needs_check';
}

interface Props {
  open: boolean;
  employee: PayrollRecord | null;
  onClose: () => void;
}

// Generate realistic mock daily logs for November 2024
export const generateMockDailyLogs = (empCode: string): DailyAttendanceRecord[] => {
  const daysInMonth = 30; // Nov 2024
  const records: DailyAttendanceRecord[] = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const dayStr = i < 10 ? `0${i}` : `${i}`;
    const dateStr = `2024-11-${dayStr}`;
    const dateObj = new Date(2024, 10, i);
    const dayOfWeekIndex = dateObj.getDay();

    const daysOfWeekMap = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const dayOfWeek = daysOfWeekMap[dayOfWeekIndex];

    // Sunday off
    if (dayOfWeekIndex === 0) {
      records.push({
        id: `log-${i}`,
        date: dateStr,
        dayOfWeek,
        shiftName: 'Nghỉ tuần',
        checkIn: null,
        checkOut: null,
        workHours: 0,
        otHours: 0,
        penaltyMinutes: 0,
        status: 'leave',
        device: '-',
        note: 'Nghỉ Chủ Nhật hàng tuần',
      });
      continue;
    }

    // Special cases based on employee code & index
    if (empCode === 'NV-3122' && i === 12) {
      records.push({
        id: `log-${i}`,
        date: dateStr,
        dayOfWeek,
        shiftName: 'Ca HC (08:00 - 17:00)',
        checkIn: '08:45',
        checkOut: '17:00',
        workHours: 7.25,
        otHours: 0,
        penaltyMinutes: 45,
        status: 'late',
        device: 'Vân tay - Cổng chính',
        note: 'Đi muộn 45p do kẹt xe',
      });
    } else if (empCode === 'NV-3122' && i === 18) {
      records.push({
        id: `log-${i}`,
        date: dateStr,
        dayOfWeek,
        shiftName: 'Ca HC (08:00 - 17:00)',
        checkIn: null,
        checkOut: null,
        workHours: 0,
        otHours: 0,
        penaltyMinutes: 0,
        status: 'leave',
        device: 'Đơn nghỉ phép',
        note: 'Nghỉ phép có hưởng lương (Đã duyệt)',
      });
    } else if (empCode === 'NV-1089' && (i === 5 || i === 15 || i === 22)) {
      records.push({
        id: `log-${i}`,
        date: dateStr,
        dayOfWeek,
        shiftName: 'Ca Kỹ Thuật (08:00 - 17:00)',
        checkIn: '07:55',
        checkOut: '21:00',
        workHours: 8.0,
        otHours: 4.0,
        penaltyMinutes: 0,
        status: 'present',
        device: 'FaceID - Xưởng B',
        note: 'Tăng ca bảo trì hệ thống máy tính',
      });
    } else if (dayOfWeekIndex === 6) {
      records.push({
        id: `log-${i}`,
        date: dateStr,
        dayOfWeek,
        shiftName: 'Ca Sáng (08:00 - 12:00)',
        checkIn: '07:50',
        checkOut: '12:05',
        workHours: 4.0,
        otHours: 0,
        penaltyMinutes: 0,
        status: 'present',
        device: 'Vân tay - Cổng chính',
        note: 'Làm nửa ngày Thứ Bảy',
      });
    } else {
      records.push({
        id: `log-${i}`,
        date: dateStr,
        dayOfWeek,
        shiftName: 'Ca Hành Chính (08:00 - 17:00)',
        checkIn: '07:52',
        checkOut: '17:05',
        workHours: 8.0,
        otHours: 0,
        penaltyMinutes: 0,
        status: 'present',
        device: 'Vân tay - Cổng chính',
        note: 'Đúng giờ',
      });
    }
  }
  return records;
};

export default function EmployeeAttendanceHistoryModal({ open, employee, onClose }: Props) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  if (!employee) return null;

  const dailyLogs = generateMockDailyLogs(employee.code);

  const filteredLogs = dailyLogs.filter((log) => {
    const matchSearch =
      log.date.includes(search) ||
      log.shiftName.toLowerCase().includes(search.toLowerCase()) ||
      (log.note && log.note.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleExportIndividualReport = () => {
    toast.success(`Đã xuất báo cáo lịch sử chấm công của ${employee.fullName} (${employee.code})!`);
  };

  const getStatusBadge = (status: DailyAttendanceRecord['status']) => {
    if (!status) return <Badge variant="default">-</Badge>;
    if (status === 'leave') return <Badge variant="info">Nghỉ phép / Nghỉ tuần</Badge>;
    return (
      <Badge variant={getAttendanceStatusVariant(status)}>
        {getAttendanceStatusLabel(status)}
      </Badge>
    );
  };

  const attendanceColumns: ITableColumn<DailyAttendanceRecord>[] = [
    {
      key: 'date',
      label: 'Ngày',
      minWidth: '100px',
      cell: (row) => <span className="font-bold text-slate-900">{row.date}</span>,
    },
    {
      key: 'dayOfWeek',
      label: 'Thứ',
      minWidth: '80px',
      cell: (row) => <span className="font-medium text-slate-500">{row.dayOfWeek}</span>,
    },
    {
      key: 'shiftName',
      label: 'Ca làm việc',
      minWidth: '150px',
      cell: (row) => <span className="font-semibold text-slate-700">{row.shiftName}</span>,
    },
    {
      key: 'checkIn',
      label: 'Check In',
      minWidth: '100px',
      cell: (row) => (
        <span className="font-mono">
          {row.checkIn ? (
            <span className={`font-semibold ${row.penaltyMinutes > 0 ? 'text-red-600' : 'text-slate-800'}`}>{row.checkIn}</span>
          ) : (
            <span className="text-slate-300">-</span>
          )}
        </span>
      ),
    },
    {
      key: 'checkOut',
      label: 'Check Out',
      minWidth: '100px',
      cell: (row) => (
        <span className="font-mono">
          {row.checkOut ? <span className="font-semibold text-slate-800">{row.checkOut}</span> : <span className="text-slate-300">-</span>}
        </span>
      ),
    },
    {
      key: 'workHours',
      label: 'Giờ công',
      minWidth: '100px',
      cell: (row) => <span className="font-bold text-slate-900">{row.workHours > 0 ? `${row.workHours.toFixed(1)} h` : '-'}</span>,
    },
    {
      key: 'otHours',
      label: 'Tăng ca (OT)',
      minWidth: '110px',
      cell: (row) => (
        <span className="font-bold">
          {row.otHours > 0 ? <span className="text-[#005c53]">+{row.otHours.toFixed(1)} h</span> : <span className="text-slate-300">0</span>}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '120px',
      cell: (row) => getStatusBadge(row.status),
    },
    {
      key: 'note',
      label: 'Ghi chú & Thiết bị',
      minWidth: '220px',
      cell: (row) => (
        <div className="space-y-0.5">
          <p className="text-slate-800 font-medium">{row.note || '-'}</p>
          <p className="text-[10px] text-slate-400">{row.device}</p>
        </div>
      ),
    },
  ];

  const renderCard = (row: DailyAttendanceRecord, index: number) => (
    <div key={row.id || index} className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col gap-2 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-900 text-xs">
          {row.date} ({row.dayOfWeek})
        </span>
        {getStatusBadge(row.status)}
      </div>
      <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
        <p>
          <strong>Ca làm:</strong> {row.shiftName}
        </p>
        <p>
          <strong>Vào / Ra:</strong> {row.checkIn || '-'} → {row.checkOut || '-'}
        </p>
        <p>
          <strong>Giờ công:</strong> {row.workHours > 0 ? `${row.workHours.toFixed(1)} h` : '-'}{' '}
          {row.otHours > 0 ? `| OT: +${row.otHours.toFixed(1)} h` : ''}
        </p>
      </div>
      {row.note && <p className="text-[11px] text-slate-500 italic">{row.note}</p>}
    </div>
  );

  const footer = (
    <div className="flex items-center justify-between w-full">
      <div className="text-xs text-slate-500">
        Hiển thị <strong className="text-slate-800">{filteredLogs.length}</strong> / {dailyLogs.length} ngày trong tháng
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onClose} className="border-slate-200">
          Đóng
        </Button>
        <Button
          variant="primary"
          onClick={handleExportIndividualReport}
          leftIcon={<FileSpreadsheet size={16} />}
        >
          Xuất bảng công cá nhân
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <Avatar src={employee.avatar} name={employee.fullName} size="sm" />
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-tight">Lịch sử chấm công chi tiết - {employee.fullName}</h3>
            <p className="text-xs font-normal text-slate-500">
              Mã NV: <span className="font-semibold text-slate-700">{employee.code}</span> • Phòng ban:{' '}
              <span className="font-semibold text-slate-700">{employee.department}</span>
            </p>
          </div>
        </div>
      }
      size="xl"
      footer={footer}
    >
      <div className="space-y-5">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200 bg-teal-50/40 p-3.5 space-y-1">
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">CÔNG THỰC TẾ</span>
            <div className="text-xl font-black text-slate-900">
              {employee.actualWorkdays.toFixed(1)} <span className="text-xs font-normal text-slate-500">/ {employee.standardWorkdays} ngày</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-sky-50/40 p-3.5 space-y-1">
            <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">NGHỈ PHÉP</span>
            <div className="text-xl font-black text-slate-900">
              {employee.leaveDays.toFixed(1)} <span className="text-xs font-normal text-slate-500">ngày</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-amber-50/40 p-3.5 space-y-1">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">TĂNG CA (OT)</span>
            <div className="text-xl font-black text-[#005c53]">
              {employee.overtimeHours.toFixed(1)} <span className="text-xs font-normal text-slate-500">giờ</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-red-50/40 p-3.5 space-y-1">
            <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider block">VI PHẠM (ĐI MUỘN)</span>
            <div className="text-xl font-black text-red-600">
              {employee.penaltyMinutes} <span className="text-xs font-normal text-slate-500">phút</span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
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
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Daily Logs Table */}
        <TableData<DailyAttendanceRecord>
          queryKey={['employee-modal-daily-logs', employee.code, search, statusFilter, filteredLogs.length]}
          fetcher={async ({ offset, limit }) => {
            const start = offset;
            const end = offset + limit;
            return {
              items: filteredLogs.slice(start, end),
              meta: {
                total: filteredLogs.length,
                offset,
                limit,
                next: end < filteredLogs.length,
              },
            };
          }}
          columns={attendanceColumns}
          renderCard={renderCard}
          select={false}
          syncToUrl={false}
        />
      </div>
    </Modal>
  );
}
