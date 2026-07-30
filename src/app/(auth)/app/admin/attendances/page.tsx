"use client";

import { useState } from 'react';
import { Tooltip, Button, TableData, Badge, Breadcrumb, ITableColumn } from '@/components';
import { toast } from 'react-hot-toast';
import { Plus, RefreshCw, Pencil, Trash2, Eye } from 'lucide-react';
import AddAttendanceModal from "./_components/add-attendance-modal";
import EditAttendanceModal from "./_components/edit-attendance-modal";
import AttendanceDetailModal from "./_components/attendance-detail-modal";
import Loading from '../../loading';

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phoneNumber: string | null;
  avatar: string | null;
  gender: 'male' | 'female' | 'other';
  birthday: string | null;
  address: string | null;
  joinedAt: string | null;
  identifyCode: string;
  attendancePolicy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: number;
  userId: string;
  workShiftId: number | null;
  workDate: string;
  checkIn: string | null;
  checkInLatitude: number | null;
  checkInLongitude: number | null;
  isLate: boolean | null;
  lateMinutes: number | null;
  imgCheckinPath: string | null;
  checkOut: string | null;
  checkOutLatitude: number | null;
  checkOutLongitude: number | null;
  isEarlyLeave: boolean | null;
  earlyLeaveMinutes: number | null;
  imgCheckoutPath: string | null;
  status: string | null;
  note: string | null;
  totalHours: number | null;
  user: UserResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceResponse {
  items: Attendance[];
  pagination: {
    next: boolean;
    total: number;
    offset: number;
    limit: number;
  };
}

const mockAttendances: Attendance[] = Array.from({ length: 15 }, (_, index) => ({
  id: index + 1,
  userId: `${(index % 5) + 1}`,
  workShiftId: (index % 3) + 1,

  workDate: `2026-07-${String((index % 30) + 1).padStart(2, '0')}`,

  checkIn: `08:${String(index % 60).padStart(2, '0')}`,
  checkInLatitude: 20.8449 + index * 0.001,
  checkInLongitude: 106.6881 + index * 0.001,

  isLate: index % 4 === 0,
  lateMinutes: index % 4 === 0 ? 15 : 0,

  imgCheckinPath: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60`,

  checkOut: `17:${String(index % 60).padStart(2, '0')}`,
  checkOutLatitude: 20.8449 + index * 0.001,
  checkOutLongitude: 106.6881 + index * 0.001,

  isEarlyLeave: index % 6 === 0,
  earlyLeaveMinutes: index % 6 === 0 ? 20 : 0,

  imgCheckoutPath: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60`,

  status:
    index % 5 === 0
      ? 'absent'
      : index % 4 === 0
        ? 'late'
        : 'present',

  note: `Attendance note ${index + 1}`,
  totalHours: 8,

  user: {
    id: `${(index % 5) + 1}`,
    email: `user${(index % 5) + 1}@example.com`,
    username: `user${(index % 5) + 1}`,
    fullName: `Employee ${(index % 5) + 1}`,
    phoneNumber: `09000000${String(index + 1).padStart(2, '00')}`,
    avatar: `/avatars/avatar-${(index % 5) + 1}.png`,
    gender: index % 3 === 0 ? 'male' : index % 3 === 1 ? 'female' : 'other',
    birthday: '1995-01-01',
    address: `Address ${index + 1}`,
    joinedAt: '2025-01-01',
    identifyCode: `12345678${String(index + 1).padStart(2, '0')}`,
    attendancePolicy: 'Standard',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export default function AttendancesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading] = useState(false);

  // Filter states khớp với ITableFilterProps
  const [filterEmployeeId, setFilterEmployeeId] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [filterWorkDate, setFilterWorkDate] = useState<string | undefined>();
  const [filterDepartment, setFilterDepartment] = useState<string | undefined>();
  const [filterShift, setFilterShift] = useState<string | undefined>();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Attendance | null>(null);

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/app' },
    { label: 'Quản lý', href: '/app/admin' },
    { label: 'Chấm công', href: '/app/admin/attendances' },
  ];

  // Tạo option list duy nhất từ mock data
  const employeeOptions = [
    ...new Map(
      mockAttendances.map((item) => [
        item.userId,
        { label: item.user?.fullName ?? 'Không xác định', value: item.userId },
      ])
    ).values(),
  ];

  const workDateOptions = [
    ...new Map(
      mockAttendances.map((item) => [
        item.workDate,
        { label: item.workDate, value: item.workDate },
      ])
    ).values(),
  ];

  // Cấu hình filters truyền vào TableData
  const tableFilters = [
    {
      label: 'Nhân viên',
      value: filterEmployeeId,
      options: employeeOptions,
      onChange: (val: string | undefined) => setFilterEmployeeId(val),
    },
    {
      label: 'Phòng ban',
      value: filterDepartment,
      options: [
        { label: 'IT', value: 'it' },
        { label: 'Kinh doanh', value: 'sales' },
        { label: 'Marketing', value: 'marketing' },
        { label: 'Nhân sự', value: 'hr' },
        { label: 'Kế toán', value: 'accounting' },
      ],
      onChange: (val: string | undefined) => setFilterDepartment(val),
    },
    {
      label: 'Ca làm',
      value: filterShift,
      options: [
        { label: 'Ca sáng', value: 'morning' },
        { label: 'Ca chiều', value: 'afternoon' },
        { label: 'Ca tối', value: 'night' },
      ],
      onChange: (val: string | undefined) => setFilterShift(val),
    },
    {
      label: 'Ngày làm việc',
      value: filterWorkDate,
      options: workDateOptions,
      onChange: (val: string | undefined) => setFilterWorkDate(val),
    },
    {
      label: 'Trạng thái',
      value: filterStatus,
      options: [
        { label: 'Có mặt', value: 'present' },
        { label: 'Đi muộn', value: 'late' },
        { label: 'Vắng mặt', value: 'absent' },
      ],
      onChange: (val: string | undefined) => setFilterStatus(val),
    },
  ];

  // Fetcher giả lập với lọc theo search + filters
  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = [...mockAttendances];

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.note?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterEmployeeId) {
      filtered = filtered.filter((item) => item.userId === filterEmployeeId);
    }

    if (filterStatus) {
      filtered = filtered.filter((item) => item.status === filterStatus);
    }

    if (filterWorkDate) {
      filtered = filtered.filter((item) => item.workDate === filterWorkDate);
    }

    const paginated = filtered.slice(offset, offset + limit);

    return {
      items: paginated,
      meta: {
        total: filtered.length,
        offset,
        limit,
        next: offset + limit < filtered.length,
      },
    };
  };

  // Giao diện Card cho Mobile View
  const renderCard = (row: Attendance, index: number) => {
    const variantMap = {
      present: 'success' as const,
      late: 'warning' as const,
      absent: 'danger' as const,
    };

    const labelMap = {
      present: 'Có mặt',
      late: 'Đi muộn',
      absent: 'Vắng mặt',
    };

    return (
      <div
        key={row.id || index}
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <img
            src={row.user?.avatar || '/images/default-avatar.png'}
            alt={row.user?.fullName || 'User'}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-black">{row.user?.fullName}</p>
            <p className="text-xs text-slate-500">{row.user?.email}</p>
          </div>
        </div>

        <div className="mt-3 space-y-1 text-sm text-black">
          <p><strong>Ngày:</strong> {row.workDate}</p>
          <p><strong>Check In:</strong> {row.checkIn || '-'}</p>
          <p><strong>Check Out:</strong> {row.checkOut || '-'}</p>
          <p><strong>Tổng giờ:</strong> {row.totalHours ?? 0} giờ</p>
        </div>

        <div className="mt-2 text-xs text-slate-500">{row.note || '-'}</div>

        <div className="mt-3 flex justify-end">
          <Badge variant={variantMap[row.status as keyof typeof variantMap] ?? 'danger'}>
            {labelMap[row.status as keyof typeof labelMap] ?? 'Vắng mặt'}
          </Badge>
        </div>
      </div>
    );
  };

  // Cấu hình các cột cho Desktop View
  const columns: ITableColumn<Attendance>[] = [
    {
      key: 'workDate',
      label: 'Ngày làm việc',
      minWidth: '120px',
      cell: (row) => (
        <span className="font-medium text-slate-500">{row.workDate}</span>
      ),
    },
    {
      key: 'employee',
      label: 'Nhân viên',
      minWidth: '180px',
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{row.user?.fullName || '-'}</div>
          <div className="text-xs text-slate-500">{row.user?.email || '-'}</div>
        </div>
      ),
    },
    {
      key: 'checkIn',
      label: 'Check In',
      minWidth: '140px',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <img
            src={row.imgCheckinPath || '/images/default-avatar.png'}
            alt={row.user?.fullName || 'User'}
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="font-medium text-slate-500">{row.checkIn || '-'}</span>
        </div>
      ),
    },
    {
      key: 'checkOut',
      label: 'Check Out',
      minWidth: '140px',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <img
            src={row.imgCheckoutPath || '/images/default-avatar.png'}
            alt={row.user?.fullName || 'User'}
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="font-medium text-slate-500">{row.checkOut || '-'}</span>
        </div>
      ),
    },
    {
      key: 'totalHours',
      label: 'Tổng giờ',
      minWidth: '100px',
      cell: (row) => (
        <span className="font-medium">{row.totalHours ?? 0} giờ</span>
      ),
    },
    {
      key: 'note',
      label: 'Ghi chú',
      minWidth: '220px',
      cell: (row) => (
        <span className="text-xs">{row.note || '-'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '120px',
      cell: (row) => {
        const variantMap: Record<string, 'success' | 'warning' | 'danger'> = {
          present: 'success',
          late: 'warning',
          absent: 'danger',
        };
        const labelMap: Record<string, string> = {
          present: 'Có mặt',
          late: 'Đi muộn',
          absent: 'Vắng mặt',
        };
        return (
          <Badge variant={variantMap[row.status || 'absent']}>
            {labelMap[row.status || 'absent']}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '120px',
      cell: (row) => (
        <div className="flex items-center">
          <Tooltip content="Chi tiết chấm công" position="top">
            <button
              type="button"
              onClick={() => {
                setSelectedRow(row);
                setShowDetailModal(true);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:scale-150 transition"
            >
              <Eye size={15} />
            </button>
          </Tooltip>

          <Tooltip content="Chỉnh sửa chấm công" position="top">
            <button
              type="button"
              onClick={() => {
                setSelectedRow(row);
                setShowEditModal(true);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:scale-150 transition"
            >
              <Pencil size={15} />
            </button>
          </Tooltip>

          <Tooltip content="Xóa chấm công" position="top">
            <button
              type="button"
              onClick={() => handleDelete(row)}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:scale-150 transition"
            >
              <Trash2 size={15} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const handleDelete = (row: Attendance) => {
    if (!confirm('Chắc chắn xóa?')) return;
    // await attendanceApi.deleteAttendance(row.id);
    toast.success('Đã xóa chấm công');
  };

  if (isLoading) return <Loading />;

  return (
    <div className="flex h-full w-full flex-1 flex-col bg-slate-50 p-6">
      <Breadcrumb items={breadcrumbItems} className="mb-4" />

      {/* Header */}
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Danh sách chấm công</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý và theo dõi dữ liệu chấm công nhân viên</p>
        </div>

        <div className="flex shrink-0 flex-nowrap items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => toast.success('Làm mới thành công')}
          >
            <RefreshCw size={15} />
          </Button>

          <Button className="gap-2" onClick={() => setShowAddModal(true)}>
            <Plus size={15} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <TableData<Attendance>
          queryKey={['attendances', searchQuery, filterEmployeeId, filterStatus, filterWorkDate, filterDepartment, filterShift]}
          fetcher={fetcher}
          columns={columns}
          search={{
            placeholder: 'Tìm kiếm theo tên, email...',
            value: searchQuery,
            onChange: (value) => setSearchQuery(value),
          }}
          filters={tableFilters}
          renderCard={renderCard}
          select={false}
          syncToUrl={false}
        />
      </div>

      <AddAttendanceModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => toast.success('Thêm thành công')}
      />

      <EditAttendanceModal
        open={showEditModal}
        data={selectedRow}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => toast.success('Cập nhật thành công')}
      />

      <AttendanceDetailModal
        open={showDetailModal}
        data={selectedRow}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
}