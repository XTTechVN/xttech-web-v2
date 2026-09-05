'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Eye, ShieldCheck, Calendar } from 'lucide-react';
import { TableData, type ITableColumn } from '@/components/table';
import type { ITableFilterProps } from '@/components/table/types';
import { Badge, Avatar } from '@/components';
import { BASE_MINIO_URL } from '@/config';
import { useQueryParam } from '@/hooks';
import { getAttendanceReport, getDepartments } from '@/actions';
import type { AttendanceReportItem, Department } from '@/types';
import { ReportDetailModal } from './detail-modal';



// Helper format date YYYY-MM-DD
export const formatDateStr = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDefaultDateRange = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: formatDateStr(firstDay),
    to: formatDateStr(lastDay),
  };
};

const POLICY_BADGES: Record<
  string,
  { label: string; variant: 'primary' | 'info' | 'warning' | 'default' }
> = {
  administrative: { label: 'Hành chính', variant: 'primary' },
  seasonal: { label: 'Thời vụ', variant: 'info' },
  part_time: { label: 'Part-time', variant: 'warning' },
};

export function ReportTable() {
  const defaultRange = useMemo(() => getDefaultDateRange(), []);

  const [fromDate, setFromDate] = useQueryParam('fromDate', defaultRange.from);
  const [toDate, setToDate] = useQueryParam('toDate', defaultRange.to);
  const [departmentId, setDepartmentId] = useQueryParam('departmentId', '');
  const [attendancePolicy, setAttendancePolicy] = useQueryParam('attendancePolicy', '');
  const [search, setSearch] = useQueryParam('search', '');

  // Modal Chi tiết chấm công
  const [selectedEmployee, setSelectedEmployee] = useState<AttendanceReportItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Lấy danh sách phòng ban cho bộ lọc có sẵn của Table
  const { data: departmentsData } = useQuery({
    queryKey: ['departments', 'table-filter-list'],
    queryFn: () => getDepartments({ limit: 100 }),
  });
  const departments: Department[] = departmentsData?.items || [];

  // Fetcher gọi API lấy danh sách báo cáo chấm công
  const fetcher = async () => {
    if (!fromDate || !toDate) {
      return {
        items: [],
        meta: { total: 0, offset: 0, limit: 10, next: false },
      };
    }

    const res = await getAttendanceReport({
      fromDate,
      toDate,
      departmentId: departmentId ? Number(departmentId) : undefined,
      attendancePolicy: attendancePolicy || undefined,
      search: search || undefined,
    });

    const items = res?.items || [];
    return {
      items,
      meta: {
        total: items.length,
        offset: 0,
        limit: items.length || 10,
        next: false,
      },
    };
  };

  // Cấu hình các cột cho TableData chung
  const columns: ITableColumn<AttendanceReportItem>[] = useMemo(
    () => [
      {
        key: 'index',
        label: 'STT',
        minWidth: '50px',
        cell: (_, index) => (
          <span className="text-gray-400 font-medium text-xs">{(index ?? 0) + 1}</span>
        ),
      },
      {
        key: 'user',
        label: 'Nhân sự',
        minWidth: '220px',
        cell: (row) => (
          <div className="flex items-center gap-3">
            <Avatar
              src={
                row.avatar
                  ? row.avatar.startsWith('http')
                    ? row.avatar
                    : `${BASE_MINIO_URL}${row.avatar}`
                  : undefined
              }
              name={row.fullName || row.username || 'NV'}
              size="sm"
            />
            <span className="font-semibold text-gray-900 text-sm truncate">
              {row.fullName || row.username}
            </span>
          </div>
        ),
      },
      {
        key: 'department',
        label: 'Phòng ban',
        minWidth: '150px',
        cell: (row) =>
          row.departmentName ? (
            <span className="text-sm text-slate-700">
              {row.departmentName}
            </span>
          ) : (
            <span className="text-xs text-gray-400 italic">Chưa gán</span>
          ),
      },
      {
        key: 'policy',
        label: 'Chính sách',
        minWidth: '120px',
        cell: (row) => {
          const policyInfo = POLICY_BADGES[row.attendancePolicy || 'administrative'] || {
            label: row.attendancePolicy || 'Hành chính',
            variant: 'default',
          };
          return <Badge variant={policyInfo.variant} size="sm">{policyInfo.label}</Badge>;
        },
      },
      {
        key: 'workDays',
        label: 'Ngày công',
        minWidth: '110px',
        cell: (row) =>
          row.attendancePolicy === 'part_time' ? (
            <span className="text-xs text-slate-400 italic">Theo giờ</span>
          ) : (
            <span className="font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100 text-xs">
              {row.workDays ?? 0} công
            </span>
          ),
      },
      {
        key: 'totalHours',
        label: 'Tổng giờ',
        minWidth: '100px',
        cell: (row) => <span className="font-bold text-gray-900">{row.totalHours}h</span>,
      },
      {
        key: 'late',
        label: 'Đi muộn',
        minWidth: '110px',
        cell: (row) =>
          row.lateDays && row.lateDays > 0 ? (
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {row.lateDays} ngày
              </span>
              {row.lateMinutes ? (
                <span className="text-[10px] text-amber-600 mt-0.5">
                  ({row.lateMinutes}p)
                </span>
              ) : null}
            </div>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          ),
      },
      {
        key: 'earlyLeave',
        label: 'Về sớm',
        minWidth: '110px',
        cell: (row) =>
          row.earlyLeaveDays && row.earlyLeaveDays > 0 ? (
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                {row.earlyLeaveDays} ngày
              </span>
              {row.earlyLeaveMinutes ? (
                <span className="text-[10px] text-orange-600 mt-0.5">
                  ({row.earlyLeaveMinutes}p)
                </span>
              ) : null}
            </div>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          ),
      },
      {
        key: 'overtime',
        label: 'Tăng ca',
        minWidth: '110px',
        cell: (row) =>
          row.overtimeDays && row.overtimeDays > 0 ? (
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {row.overtimeDays} buổi
              </span>
              {row.overtimeHours ? (
                <span className="text-[10px] text-blue-600 mt-0.5">
                  ({row.overtimeHours}h)
                </span>
              ) : null}
            </div>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          ),
      },
      {
        key: 'actions',
        label: 'Thao tác',
        minWidth: '70px',
        cell: (row) => {
          return (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedEmployee(row);
                  setIsDetailOpen(true);
                }}
                title="Xem chi tiết chấm công"
                className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
              >
                <Eye size={17} />
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  // Render Card cho thiết bị di động
  const renderCard = (row: AttendanceReportItem, index: number) => {
    const policyInfo = POLICY_BADGES[row.attendancePolicy || 'administrative'] || {
      label: row.attendancePolicy || 'Hành chính',
      variant: 'default',
    };
    const isPartTime = row.attendancePolicy === 'part_time';

    return (
      <div key={row.userId || index} className="p-4 rounded-xl border border-gray-200 bg-white flex flex-col gap-3 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              src={
                row.avatar
                  ? row.avatar.startsWith('http')
                    ? row.avatar
                    : `${BASE_MINIO_URL}${row.avatar}`
                  : undefined
              }
              name={row.fullName || row.username || 'NV'}
              size="md"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-gray-900 text-sm truncate">
                {row.fullName || row.username}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={policyInfo.variant} size="sm">
                  {policyInfo.label}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setSelectedEmployee(row);
                setIsDetailOpen(true);
              }}
              className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg border border-gray-200 cursor-pointer"
              title="Xem chi tiết"
            >
              <Eye size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">
              Ngày công
            </span>
            <span className="text-xs font-bold text-teal-700">
              {isPartTime ? 'Theo giờ' : `${row.workDays ?? 0} công`}
            </span>
          </div>

          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">
              Tổng giờ
            </span>
            <span className="text-xs font-bold text-gray-900">{row.totalHours}h</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">
              Tăng ca (OT)
            </span>
            <span className="text-xs font-bold text-blue-700">
              {row.overtimeDays && row.overtimeDays > 0 ? `${row.overtimeDays} lần` : '0'}
            </span>
          </div>
        </div>

        {((row.lateDays ?? 0) > 0 || (row.earlyLeaveDays ?? 0) > 0) ? (
          <div className="flex items-center gap-2 text-xs">
            {(row.lateDays ?? 0) > 0 ? (
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                Muộn: {row.lateDays} ngày ({row.lateMinutes || 0}p)
              </span>
            ) : null}
            {(row.earlyLeaveDays ?? 0) > 0 ? (
              <span className="text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 font-semibold">
                Sớm: {row.earlyLeaveDays} ngày ({row.earlyLeaveMinutes || 0}p)
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  };

  // Cấu hình các bộ lọc tích hợp trong TableData chung
  const tableFilters: ITableFilterProps[] = [
    {
      type: 'date-range',
      label: 'Kỳ báo cáo',
      startDate: fromDate,
      endDate: toDate,
      icon: <Calendar className="w-4 h-4" />,
      onDateRangeChange: (start, end) => {
        setFromDate(start || defaultRange.from);
        setToDate(end || defaultRange.to);
      },
    },
    {
      label: 'Phòng ban',
      placeholder: 'Tất cả phòng ban',
      value: departmentId || undefined,
      onChange: (val) => setDepartmentId(val || ''),
      icon: <Building2 className="w-4 h-4" />,
      options: [
        { value: undefined, label: 'Tất cả phòng ban' },
        ...departments.map((d) => ({
          value: String(d.id),
          label: d.name,
        })),
      ],
    },
    {
      label: 'Chính sách',
      placeholder: 'Tất cả chính sách',
      value: attendancePolicy || undefined,
      onChange: (val) => setAttendancePolicy(val || ''),
      icon: <ShieldCheck className="w-4 h-4" />,
      options: [
        { value: undefined, label: 'Tất cả chính sách' },
        { value: 'administrative', label: 'Hành chính' },
        { value: 'seasonal', label: 'Thời vụ' },
        { value: 'part_time', label: 'Part-time' },
      ],
    },
  ];

  return (
    <div className="w-full">
      <TableData<AttendanceReportItem>
        queryKey={['attendance-report', fromDate, toDate, departmentId, attendancePolicy, search]}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        filters={tableFilters}
        search={{
          placeholder: 'Tìm kiếm nhân sự (tên, mã NV, email)...',
          value: search,
          onChange: setSearch,
          className: 'w-72',
        }}
        hidePagination={true}
        hideRowPerPage={true}
      />

      {/* Modal chi tiết chấm công của nhân sự */}
      <ReportDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        fromDate={fromDate || ''}
        toDate={toDate || ''}
      />
    </div>
  );
}
