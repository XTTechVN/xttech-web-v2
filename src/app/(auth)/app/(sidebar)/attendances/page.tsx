"use client";
// Cập nhật code trang attendanceModule
import { useEffect, useState, useMemo } from 'react';
import {
  Button,
  TableData,
  TableAction,
  Badge,
  Breadcrumb,
  Heading,
  ITableColumn,
  ITableFilterProps,
  Avatar
} from '@/components';
import { toast } from 'react-hot-toast';
import {
  Pencil,
  Trash2,
  Eye,
  Clock,
  FileEdit,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  UserCheck,
  Users,
  UserCheck2
} from 'lucide-react';
import AddAttendanceModal from "@/app/(auth)/app/(sidebar)/attendances/_components/add-modal";
import EditAttendanceModal from "@/app/(auth)/app/(sidebar)/attendances/_components/edit-modal";
import AttendanceDetailModal from "@/app/(auth)/app/(sidebar)/attendances/_components/attendance-modal";
import AddUserModal from "@/app/(auth)/app/(sidebar)/attendances/_components/users/add-modal";
import AutoTimekeepingModal from "@/app/(auth)/app/(sidebar)/attendances/_components/auto-timekeeping-modal";
import Loading from '../../loading';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteAttendance, getAttendances, getDepartments, getUsers, getAdjustmentRequests, updateAdjustmentRequest } from '@/actions';
import { Attendance, AttendanceAdjustmentRequest, AttendanceStatus } from '@/types';
import StatCart from '../dashboard/_components/stats-card';
import AddAdjustmentModal from './_components/adjustment/add-modal';
import ReviewAdjustmentModal from './_components/adjustment/review-modal';

type FilterOption = {
  value: string | undefined;
  label: string;
};

// const mockAttendances: Attendance[] = Array.from({ length: 15 }, (_, index) => ({
//   id: index + 1,
//   userId: `${(index % 5) + 1}`,
//   workShiftId: (index % 3) + 1,

//   workDate: `2026-07-${String((index % 30) + 1).padStart(2, '0')}`,

//   checkIn: `08:${String(index % 60).padStart(2, '0')}`,
//   checkInLatitude: 20.8449 + index * 0.001,
//   checkInLongitude: 106.6881 + index * 0.001,

//   isLate: index % 4 === 0,
//   lateMinutes: index % 4 === 0 ? 15 : 0,

//   imgCheckinPath: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60`,

//   checkOut: `17:${String(index % 60).padStart(2, '0')}`,
//   checkOutLatitude: 20.8449 + index * 0.001,
//   checkOutLongitude: 106.6881 + index * 0.001,

//   isEarlyLeave: index % 6 === 0,
//   earlyLeaveMinutes: index % 6 === 0 ? 20 : 0,

//   imgCheckoutPath: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60`,

//   status:
//     index % 5 === 0
//       ? 'absent'
//       : index % 4 === 0
//         ? 'late'
//         : 'present',

//   note: `Attendance note ${index + 1}`,
//   totalHours: 8,

//   user: {
//     id: `${(index % 5) + 1}`,
//     email: `user${(index % 5) + 1}@example.com`,
//     username: `user${(index % 5) + 1}`,
//     fullName: `Employee ${(index % 5) + 1}`,
//     phoneNumber: `09000000${String(index + 1).padStart(2, '00')}`,
//     avatar: `/avatars/avatar-${(index % 5) + 1}.png`,
//     gender: index % 3 === 0 ? 'male' : index % 3 === 1 ? 'female' : 'other',
//     birthday: '1995-01-01',
//     address: `Address ${index + 1}`,
//     joinedAt: '2025-01-01',
//     identifyCode: `12345678${String(index + 1).padStart(2, '0')}`,
//     attendancePolicy: 'Standard',
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   },

//   createdAt: new Date().toISOString(),
//   updatedAt: new Date().toISOString(),
// }));

export default function AttendancesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter states khớp với ITableFilterProps
  const [filterEmployeeId, setFilterEmployeeId] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [filterStartDate, setFilterStartDate] = useState<string>();
  const [filterEndDate, setFilterEndDate] = useState<string>();
  const [filterDate, setFilterDate] = useState<string>();
  const [filterDepartment, setFilterDepartment] = useState<string | undefined>();
  const [filterShift, setFilterShift] = useState<string | undefined>();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Attendance | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showTimekeepingModal, setShowTimekeepingModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);


  const pathname = usePathname();
  const isAdjustmentPage = pathname.includes('/attendances/adjustments');


  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(false);


  const { data: departments, isLoading: loadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments(),
  })
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  });
  const { data: adjustmentRequestsData, refetch: refetchAdjustmentRequests } = useQuery({
    queryKey: ['adjustment-requests'],
    queryFn: () => getAdjustmentRequests(),
  });

  // 1.1. Tổng số có mặt (records status != 'absent')
  const presentCount = useMemo(() => {
    return attendances.filter(
      (r) => r.status && r.status.toLowerCase() !== 'absent' && r.status.toLowerCase() !== 'vắng mặt'
    ).length;
  }, [attendances]);

  useEffect(() => {
    console.log(attendances);
  }, [attendances]);

  const userList = users?.items ?? [];
  const totalUsersCount =
    userList.length || attendances.length || 150;
  const presentPercentage = useMemo(() => {
    if (!totalUsersCount) return 0;
    return Math.round((presentCount / totalUsersCount) * 100 * 10) / 10;
  }, [presentCount, totalUsersCount]);

  // Dates: today & yesterday
  const { todayStr, yesterdayStr } = useMemo(() => {
    const now = new Date();
    const t = now.toISOString().slice(0, 10);
    const yObj = new Date(now);
    yObj.setDate(yObj.getDate() - 1);
    const y = yObj.toISOString().slice(0, 10);
    return { todayStr: t, yesterdayStr: y };
  }, []);

  // 1.2. Vắng mặt hôm nay & so sánh hôm qua
  const todayAbsentCount = useMemo(() => {
    return attendances.filter(
      (r) => r.workDate === todayStr && (r.status?.toLowerCase() === 'absent' || r.status?.toLowerCase() === 'vắng mặt')
    ).length;
  }, [attendances, todayStr]);

  const yesterdayAbsentCount = useMemo(() => {
    return attendances.filter(
      (r) => r.workDate === yesterdayStr && (r.status?.toLowerCase() === 'absent' || r.status?.toLowerCase() === 'vắng mặt')
    ).length;
  }, [attendances, yesterdayStr]);

  const absentDiff = todayAbsentCount - yesterdayAbsentCount;

  // 1.3. Đi muộn / Về sớm hôm nay & so sánh hôm qua
  const todayLateCount = useMemo(() => {
    return attendances.filter(
      (r) =>
        r.workDate === todayStr &&
        (r.isLate ||
          r.isEarlyLeave ||
          r.status?.toLowerCase() === 'late' ||
          r.status?.toLowerCase() === 'early_leave' ||
          r.status?.toLowerCase() === 'đi muộn' ||
          r.status?.toLowerCase() === 'về sớm')
    ).length;
  }, [attendances, todayStr]);

  const yesterdayLateCount = useMemo(() => {
    return attendances.filter(
      (r) =>
        r.workDate === yesterdayStr &&
        (r.isLate ||
          r.isEarlyLeave ||
          r.status?.toLowerCase() === 'late' ||
          r.status?.toLowerCase() === 'early_leave' ||
          r.status?.toLowerCase() === 'đi muộn' ||
          r.status?.toLowerCase() === 'về sớm')
    ).length;
  }, [attendances, yesterdayStr]);

  const lateDiff = todayLateCount - yesterdayLateCount;

  // 1.4. Yêu cầu chờ duyệt từ AttendanceAdjustmentRequest
  const pendingAdjustmentRequests = useMemo(() => {
    return (adjustmentRequestsData?.items ?? []).filter((item) => item.status === 'pending');
  }, [adjustmentRequestsData]);

  // useEffect(() => {
  //   console.log(departments);
  // }, [departments]);

  const [reviewModalState, setReviewModalState] = useState<{
    open: boolean;
    data: AttendanceAdjustmentRequest | null;
    action: 'approved' | 'rejected' | null;
  }>({
    open: false,
    data: null,
    action: null,
  });
  const [isReviewing, setIsReviewing] = useState(false);

  const handleConfirmReview = async (id: number, action: 'approved' | 'rejected', reviewNote: string) => {
    setIsReviewing(true);
    try {
      await updateAdjustmentRequest(id, {
        status: action,
        reviewNote,
      });
      toast.success(action === 'approved' ? 'Đã phê duyệt khiếu nại thành công' : 'Đã từ chối khiếu nại');
      setReviewModalState({ open: false, data: null, action: null });
      refetchAdjustmentRequests();
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
    } catch {
      toast.error('Có lỗi xảy ra khi xử lý khiếu nại');
    } finally {
      setIsReviewing(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/app' },
    { label: 'Quản lý nhân sự', href: '/app/employees' },
    { label: 'Bảng công tháng', href: '/app/attendances' },
  ];

  // Tạo option list duy nhất từ mock data

  const getStatusLabel = (status?: string | null) => {
    const map: Record<string, string> = {
      normal: "Đúng giờ",
      late: "Đi muộn",
      absent: "Vắng mặt",
      early_leave: "Về sớm",
      half_day: "Nửa ngày",
    };

    return map[status ?? ""] ?? "Không xác định";
  };

  const employeeOptions: FilterOption[] = Array.from(
    new Map<string, FilterOption>(
      userList.map((item) => [
        String(item.id),
        {
          label: item.fullName ?? 'Không xác định',
          value: String(item.id),
        },
      ])
    ).values()
  );

  const dateOptions: FilterOption[] = Array.from(
    { length: 31 },
    (_, i) => {
      const day = String(i + 1).padStart(2, '0');

      return {
        label: `2026-08-${day}`,
        value: `2026-08-${day}`,
      };
    }
  );

  const departmentOptions: FilterOption[] = [
    ...new Map(
      (departments?.items ?? []).map((item) => [
        item.id,
        {
          label: item.name ?? 'Không xác định',
          value: String(item.id),
        },
      ])
    ).values(),
  ];

  const statusOptions: FilterOption[] = [
    ...new Map(
      attendances
        .filter((item) => item.status)
        .map((item) => [
          item.status,
          {
            value: item.status ?? undefined,
            label: getStatusLabel(item.status),
          },
        ])
    ).values(),
  ];
  // Cấu hình filters truyền vào TableData
  const tableFilters: ITableFilterProps[] = [
    {
      label: 'Nhân sự',
      value: filterEmployeeId,
      options: employeeOptions,
      onChange: (val: string | undefined) => {
        setFilterEmployeeId(val);
      },
    },




    {
      label: 'Phòng ban',
      value: filterDepartment,
      options: departmentOptions,
      onChange: (val: string | undefined) => {
        setFilterDepartment(val);
      },
    },

    {
      label: 'Ca làm',
      value: filterShift,
      options: [
        { label: 'Ca sáng', value: 'morning' },
        { label: 'Ca chiều', value: 'afternoon' },
        { label: 'Ca tối', value: 'night' },
      ],
      onChange: (val: string | undefined) => {
        setFilterShift(val);
      },
    },
    {
      label: 'Từ ngày',
      value: filterStartDate,
      options: dateOptions,
      onChange: (val: string | undefined) => setFilterStartDate(val),
    },
    {
      label: 'Đến ngày',
      value: filterEndDate,
      options: dateOptions,
      onChange: (val: string | undefined) => setFilterEndDate(val),
    },

    {
      label: 'Trạng thái',
      value: filterStatus as string | undefined,
      options: statusOptions,
      onChange: (val: string | undefined) => {
        setFilterStatus(val as AttendanceStatus | undefined);
      },
    },
  ];

  const fetcher = async ({
    offset,
    limit,
  }: {
    offset: number;
    limit: number;
  }) => {
    const response = await getAttendances({
      startDate: filterStartDate || undefined,
      endDate: filterEndDate || undefined,
      userId: filterEmployeeId || undefined,
      status: (filterStatus as AttendanceStatus) || undefined,
    });

    const items = response.items ?? [];

    // Lưu data để tạo các filter/options khác
    setAttendances(items);

    let filtered = [...items];

    // Search
    if (searchQuery) {
      const keyword = searchQuery.toLowerCase();

      filtered = filtered.filter(
        (item) =>
          item.user?.fullName?.toLowerCase().includes(keyword) ||
          item.user?.email?.toLowerCase().includes(keyword)
      );
    }

    // Filter nhân viên
    if (filterEmployeeId) {
      filtered = filtered.filter(
        (item) => String(item.userId) === String(filterEmployeeId)
      );
    }

    // Filter phòng ban
    if (filterDepartment) {
      filtered = filtered.filter((item) => {
        const u = item.user as any;

        const deptId = String(
          u?.departmentId ??
          u?.department?.id ??
          (item as any)?.departmentId ??
          ''
        );

        const deptName = String(
          u?.department?.name ??
          u?.departmentName ??
          u?.department ??
          (item as any)?.department ??
          ''
        );

        return (
          deptId === String(filterDepartment) ||
          deptName === String(filterDepartment)
        );
      });
    }

    // Filter ca làm
    if (filterShift) {
      filtered = filtered.filter((item) => {
        const shiftStr = String(
          item.workShiftId ?? (item as any)?.shift ?? ''
        ).toLowerCase();

        return shiftStr.includes(filterShift.toLowerCase());
      });
    }

    // Không cần filter startDate/endDate ở đây nữa
    // vì đã truyền startDate/endDate cho API ở phía trên.

    // Filter trạng thái
    if (filterStatus) {
      filtered = filtered.filter(
        (item) => item.status === filterStatus
      );
    }

    return {
      items: filtered.slice(offset, offset + limit),
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
    const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }> = {
      present: { label: 'Có mặt', variant: 'success' },
      normal: { label: 'Bình thường', variant: 'success' },
      late: { label: 'Đi muộn', variant: 'warning' },
      absent: { label: 'Vắng mặt', variant: 'danger' },
      early_leave: { label: 'Về sớm', variant: 'warning' },
      half_day: { label: 'Nửa ngày', variant: 'warning' },
    };

    const statusInfo = statusMap[row.status ?? ''] ?? { label: row.status || 'Không xác định', variant: 'info' };

    return (
      <div
        key={row.id || index}
        className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs hover:shadow-md transition space-y-3"
      >
        {/* Header: User Avatar + Name + Status */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Avatar
              src={row.user?.avatar || undefined}
              name={row.user?.fullName || 'NV'}
              size="md"
            />
            <div>
              <p className="font-bold text-slate-900 text-sm">{row.user?.fullName || 'Nhân viên'}</p>
              <p className="text-[11px] text-slate-400">{row.user?.email || '-'}</p>
            </div>
          </div>
          <Badge variant={statusInfo.variant} pill>
            {statusInfo.label}
          </Badge>
        </div>

        {/* Date & Hours Badge */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500 flex items-center gap-1">
            <Calendar size={13} className="text-slate-400" /> {row.workDate}
          </span>
          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">
            {row.totalHours ?? 0} giờ công
          </span>
        </div>

        {/* Check In / Out Box */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Check In</span>
            <p className="font-semibold text-slate-800">{row.checkIn ? row.checkIn.slice(0, 5) : '--:--'}</p>
            {row.isLate && (
              <span className="text-[10px] text-amber-600 font-medium block">Muộn {row.lateMinutes ?? 0} phút</span>
            )}
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Check Out</span>
            <p className="font-semibold text-slate-800">{row.checkOut ? row.checkOut.slice(0, 5) : '--:--'}</p>
            {row.isEarlyLeave && (
              <span className="text-[10px] text-amber-600 font-medium block">Về sớm {row.earlyLeaveMinutes ?? 0} phút</span>
            )}
          </div>
        </div>

        {/* Note if any */}
        {row.note && (
          <p className="text-xs text-slate-500 italic bg-slate-50/50 p-2 rounded-lg border border-dashed border-slate-200 line-clamp-2">
            Ghi chú: {row.note}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setSelectedRow(row);
              setShowDetailModal(true);
            }}
            className="flex items-center gap-1 text-xs text-blue-600 font-semibold px-2 py-1 rounded-lg hover:bg-blue-50 transition"
          >
            <Eye size={13} /> Chi tiết
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedRow(row);
              setShowEditModal(true);
            }}
            className="flex items-center gap-1 text-xs text-slate-600 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition"
          >
            <Pencil size={13} /> Sửa
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="flex items-center gap-1 text-xs text-red-500 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition"
          >
            <Trash2 size={13} /> Xóa
          </button>
        </div>
      </div>
    );
  };

  // Cấu hình các cột cho Desktop View
  const columns: ITableColumn<Attendance>[] = [
    {
      key: 'workDate',
      label: 'Ngày làm việc',
      minWidth: '60px',
      cell: (row) => (
        <span className="font-medium text-slate-500">{row.workDate}</span>
      ),
    },
    {
      key: 'employee',
      label: 'Nhân sự',
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
            src={row.imgCheckinPath || 'https://picsum.photos/600/400'}
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
            src={row.imgCheckoutPath || 'https://picsum.photos/600/400'}
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
      minWidth: '100px',
      cell: (row) => (
        <span className="text-xs">{row.note || '-'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '120px',
      cell: (row) => {
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
          return statusVariantMap[status ?? ""] ?? "danger";
        };
        return (
          <Badge
            variant={getStatusVariant(row.status)}
          >
            {getStatusLabel(row.status)}
          </Badge>
        );
      },
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
              title: 'Xem chi tiết',
              icon: Eye,
              size: 18,
              onClick: () => {
                setSelectedRow(row);
                setShowDetailModal(true);
              },
            },
            {
              title: 'Chỉnh sửa',
              icon: Pencil,
              size: 18,
              onClick: () => {
                setSelectedRow(row);
                setShowEditModal(true);
              },
            },
            {
              title: 'Xóa',
              icon: Trash2,
              size: 18,
              className: 'hover:text-red-600 hover:bg-red-50',
              onClick: () => handleDelete(row),
            },
          ]}
        />
      ),
    },
  ];

  const handleDelete = async (row: Attendance) => {
    if (!confirm('Chắc chắn xóa?')) return;
    await deleteAttendance(row.id);
    queryClient.invalidateQueries({ queryKey: ['attendances'] });
    toast.success('Đã xóa chấm công');
  };

  const attendanceStats = [
    {
      title: "Tổng số có mặt",
      value: presentCount,
      icon: <Users />,
      trend: presentCount,
      trendDirection: "up" as const,
    },
    {
      title: "Vắng mặt hôm nay",
      value: todayAbsentCount,
      icon: <UserCheck />,
      trend: absentDiff,
      trendDirection: "up" as const,
    },
    {
      title: "Đi muộn / về sớm",
      value: todayLateCount,
      icon: <UserCheck2 />,
      trend: lateDiff,
      trendDirection: lateDiff >= 0 ? "up" : "down" as const,
    },
  ]

  if (isLoading) return <Loading />;

  return (
    <div className="flex h-full w-full flex-1 flex-col bg-slate-50 p-6 space-y-6">
      <Breadcrumb items={breadcrumbItems} className="mb-2" />

      {/* Header Bar using system components */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Heading size="h1" className="text-primary text-2xl md:text-4xl">
            Quản lý Chấm công & Thời gian
          </Heading>
          <Heading size="h3" className="text-gray-500 text-sm md:text-lg">
            Giám sát lực lượng lao động và theo dõi chuyên cần thời gian thực.
          </Heading>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {/* Main Action 1: Điểm danh tự động (Camera + GPS) */}
          {/* <Button
            className="bg-[#005c53] hover:bg-[#004740] text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm gap-2"
            leftIcon={<LogIn size={18} />}
            onClick={() => setShowTimekeepingModal(true)}
          >
            Điểm danh ngay
          </Button> */}

          {/* Main Action 2: Đăng ký tăng ca (Light Blue Button) */}
          {/* <Button
            variant="secondary"
            className="bg-[#dbeafe] text-[#1e40af] hover:bg-[#bfdbfe] font-semibold px-4 py-2.5 rounded-lg gap-2"
            leftIcon={<Clock size={18} className="text-[#1e40af]" />}
            onClick={() => setShowAddModal(true)}
          >
            Đăng ký tăng ca
          </Button> */}

          {/* Main Action 3: Yêu cầu điều chỉnh (Light Blue Button) */}
          {/* <Button
            variant="secondary"
            className="bg-[#dbeafe] text-[#1e40af] hover:bg-[#bfdbfe] font-semibold px-4 py-2.5 rounded-lg gap-2"
            leftIcon={<FileEdit size={18} className="text-[#1e40af]" />}
            onClick={() => router.push('/app/admin/attendances/adjustments')}
          >
            Yêu cầu điều chỉnh
          </Button> */}

          <Button
            onClick={() => setShowAddModal(true)}
          >
            Thêm chấm công
          </Button>

          {/* Preserved secondary action triggers */}
          <Link href="/app/attendances/adjustments">
            <Button variant="secondary"
              className="bg-[#dbeafe] text-[#1e40af] hover:bg-[#bfdbfe] font-semibold px-4 py-2.5 rounded-lg gap-2"
              leftIcon={<FileEdit size={18} className="text-[#1e40af]" />}
              onClick={() => router.push('/app/attendances/adjustments')}
            >
              Danh sách khiếu nại
            </Button>
          </Link>
          {/* <Button
            variant="outline"
            className="gap-1.5 text-xs py-2"
            onClick={() => setShowAddUserModal(true)}
          >
            <Plus size={14} />
            Thêm User
          </Button> */}
        </div>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Tổng số có mặt */}
        {/* <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Tổng số có mặt</span>
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{presentCount}/{totalUsersCount}</div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-teal-600"
                style={{ width: `${Math.min(presentPercentage, 100)}%` }}
              />
            </div>
            <div className="mt-2 text-xs font-medium text-slate-500">
              {presentPercentage}% Nhân sự đang làm việc
            </div>
          </div>
        </div> */}
        {attendanceStats.map((stat, index) => (
          <StatCart key={index} title={stat.title} value={String(stat.value)} icon={stat.icon} trend={stat.trend} trendDirection={stat.trendDirection as any} />
        ))}
        {/* Card 2: Vắng mặt hôm nay */}
        {/* <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Vắng mặt hôm nay</span>
            <div className="rounded-lg bg-red-50 p-2.5 text-red-500">
              <UserX size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{todayAbsentCount}</div>
            <div className={`mt-4 flex items-center text-xs font-semibold ${absentDiff >= 0 ? 'text-red-600' : 'text-teal-600'}`}>
              {absentDiff >= 0 ? (
                <TrendingUp size={15} className="mr-1 shrink-0" />
              ) : (
                <TrendingDown size={15} className="mr-1 shrink-0" />
              )}
              {absentDiff >= 0 ? `+${absentDiff}` : absentDiff} so với hôm qua
            </div>
          </div>
        </div> */}

        {/* Card 3: Đi muộn / Về sớm */}
        {/* <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Đi muộn / Về sớm</span>
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-500">
              <Clock size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{todayLateCount}</div>
            <div className={`mt-4 flex items-center text-xs font-semibold ${lateDiff <= 0 ? 'text-teal-600' : 'text-red-600'}`}>
              {lateDiff <= 0 ? (
                <TrendingDown size={15} className="mr-1 shrink-0" />
              ) : (
                <TrendingUp size={15} className="mr-1 shrink-0" />
              )}
              {lateDiff >= 0 ? `+${lateDiff}` : lateDiff} so với hôm qua
            </div>
          </div>
        </div> */}

        {/* Card 4: Đi công tác */}
        {/* <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Đi công tác</span>
            <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600">
              <Briefcase size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">12</div>
            <div className="mt-4 text-xs font-medium text-slate-500">
              8 người trở lại ngày mai
            </div>
          </div>
        </div> */}
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <Heading className="text-primary pr-2 pt-2 text-2xl" size="h1">
          Bảng công tháng (Admin)
        </Heading>
        <TableData<Attendance>
          queryKey={['attendances', searchQuery, filterEmployeeId, filterStartDate, filterEndDate, filterStatus, filterDepartment, filterShift]}
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

      {/* Bottom Section: 2 Columns (Yêu cầu chờ duyệt & Bất thường chuyên cần) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Yêu cầu chờ duyệt */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heading size="h4" className="text-base font-bold text-slate-900">
                  Yêu cầu chờ duyệt
                </Heading>
                <Badge variant="danger" pill className="bg-red-100 text-red-600 font-bold border-none px-2.5">
                  {pendingAdjustmentRequests.length} MỚI
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              {pendingAdjustmentRequests.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center italic">
                  Hiện không có yêu cầu nào đang chờ duyệt.
                </p>
              ) : (
                pendingAdjustmentRequests.map((item) => {
                  console.log("Item:", item);
                  const titleDisplay = item.reviewNote || (
                    item.requestType === 'check_in'
                      ? 'Điều chỉnh giờ vào muộn'
                      : item.requestType === 'check_out'
                        ? 'Điều chỉnh giờ ra'
                        : 'Điều chỉnh giờ vào & ra'
                  );
                  const formattedTime = item.updatedAt
                    ? new Date(item.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' trước'
                    : 'Gần đây';

                  return (
                    <div
                      key={item.id}
                      className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-sky-100 p-2.5 text-sky-700 shrink-0">
                          <FileEdit size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-900 text-sm">{titleDisplay}</h4>
                            <span className="text-xs text-slate-400">{formattedTime}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            Nhân viên: {item.user?.fullName || 'Không xác định'} - {item.reason}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setReviewModalState({
                                  open: true,
                                  data: item,
                                  action: 'approved',
                                })
                              }
                              className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                            >
                              Duyệt
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setReviewModalState({
                                  open: true,
                                  data: item,
                                  action: 'rejected',
                                })
                              }
                              className="text-xs font-semibold text-red-500 hover:text-red-600"
                            >
                              Từ chối
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Link
            href="/app/attendances/adjustments"
            className="mt-4 block text-center text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline"
          >
            Xem tất cả yêu cầu
          </Link>
        </div>

        {/* Right Column: Bất thường chuyên cần */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
          <Heading size="h4" className="text-base font-bold text-slate-900">
            Bất thường chuyên cần
          </Heading>

          <div className="space-y-3">
            {/* Warning 1: Red */}
            <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/70 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-800">Cảnh báo vắng mặt nghiêm trọng</h4>
                <p className="mt-0.5 text-xs text-red-700/80">
                  Dây chuyền lắp ráp B thiếu 5 nhân viên (Đã chạm ngưỡng nghiêm trọng).
                </p>
              </div>
            </div>

            {/* Warning 2: Slate/Gray */}
            <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-50 p-4">
              <Clock className="h-5 w-5 shrink-0 text-slate-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Sử dụng tăng ca cao</h4>
                <p className="mt-0.5 text-xs text-slate-600">
                  Phòng Đảm bảo Chất lượng đã vượt quá 40 giờ tăng ca tập thể trong tuần này.
                </p>
              </div>
            </div>

            {/* Warning 3: Teal/Green */}
            <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/70 p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-teal-800">Đồng bộ hệ thống thành công</h4>
                <p className="mt-0.5 text-xs text-teal-700/80">
                  Dữ liệu từ máy chấm công sinh trắc học đã được đồng bộ lúc 12:00.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddAdjustmentModal
        open={showAdjustmentModal}
        onClose={() => setShowAdjustmentModal(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ['attendances']
          });
          toast.success('Thêm thành công');
        }}
        data={selectedRow}
      />

      <AddAttendanceModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          // await refetch();
          queryClient.invalidateQueries({
            queryKey: ['attendances']
          });
          toast.success('Thêm thành công')
        }}
      />

      <EditAttendanceModal
        open={showEditModal}
        data={selectedRow}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ['attendances']
          });
        }}
      />

      <AttendanceDetailModal
        open={showDetailModal}
        data={selectedRow}
        onClose={() => setShowDetailModal(false)}
      />

      <AddUserModal
        open={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ['users']
          });
          toast.success('Thêm User mới thành công')
        }}
      />

      {/* Modal điểm danh tự động: Camera + GPS + Maps */}
      <AutoTimekeepingModal
        open={showTimekeepingModal}
        onClose={() => setShowTimekeepingModal(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['attendances'] });
          toast.success('Điểm danh thành công!');
        }}
      />

      <ReviewAdjustmentModal
        open={reviewModalState.open}
        data={reviewModalState.data}
        action={reviewModalState.action}
        employeeName={reviewModalState.data?.user?.fullName || 'Nhân sự'}
        onClose={() => setReviewModalState({ open: false, data: null, action: null })}
        onConfirm={handleConfirmReview}
        isLoading={isReviewing}
      />
    </div>
  );
}