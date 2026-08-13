'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Tooltip,
  Button,
  TableData,
  Badge,
  Breadcrumb,
  ITableColumn,
  Heading,
  Alert,
} from '@/components';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  FileEdit,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  FileCheck,
  Calendar,
  User as UserIcon,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AttendanceAdjustmentRequest, AdjustmentStatus, RequestType } from '@/types';
import AddAdjustmentModal from '@/app/(auth)/app/(sidebar)/attendances/_components/adjustment/add-modal';
import EditAdjustmentModal from '@/app/(auth)/app/(sidebar)/attendances/_components/adjustment/edit-modal';
import AdjustmentDetailModal from '@/app/(auth)/app/(sidebar)/attendances/_components/adjustment/detail-modal';
import ReviewAdjustmentModal from '@/app/(auth)/app/(sidebar)/attendances/_components/adjustment/review-modal';
import DeleteAdjustmentModal from '@/app/(auth)/app/(sidebar)/attendances/_components/delete-modal';
import { getAdjustmentRequests, updateAdjustmentRequest, deleteAdjustmentRequest, getUsers } from '@/actions';
import Loading from '@/app/(auth)/app/loading';
import { useAuthStore } from '@/stores';
import StatCart from '../../dashboard/_components/stats-card';

// ===================== Types =====================
interface AdjustmentRecord extends AttendanceAdjustmentRequest {
  _employeeId?: string;
  _employeeName?: string;
}

// ===================== Config =====================
const STATUS_CONFIG: Record<AdjustmentStatus, { label: string; variant: 'warning' | 'success' | 'danger' }> = {
  pending: { label: 'Chờ duyệt', variant: 'warning' },
  approved: { label: 'Đã duyệt', variant: 'success' },
  rejected: { label: 'Từ chối', variant: 'danger' },
};

const REQUEST_TYPE_LABEL: Record<string, string> = {
  check_in: 'Điều chỉnh Check In',
  check_out: 'Điều chỉnh Check Out',
  forgot_attendance: 'Quên điểm danh',
  both: 'Điều chỉnh Check In & Out',
};

export default function AdjustmentsSidebarPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const isAdmin = useMemo(() =>
    Boolean(currentUser?.roles?.some((r) =>
      r.code?.toLowerCase() === 'admin' || r.name?.toLowerCase() === 'admin' || r.code?.toLowerCase() === 'super')
    ),
    [currentUser]
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<AdjustmentStatus | undefined>();
  const [filterType, setFilterType] = useState<RequestType | undefined>();
  const [filterEmployee, setFilterEmployee] = useState<string | undefined>();
  const [filterDate, setFilterDate] = useState<string | undefined>();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // State Modal Preview Phê duyệt / Từ chối
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

  const [selectedRow, setSelectedRow] = useState<AttendanceAdjustmentRequest | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [queryKey, setQueryKey] = useState(0);
  const [attendanceAdjustments, setAttendanceAdjustments] = useState<AttendanceAdjustmentRequest[]>([]);



  const refreshData = () => {
    setQueryKey((k) => k + 1);
    refetchAllAdjustments();
    queryClient.invalidateQueries();
  };

  const { data: allAdjustmentsData, refetch: refetchAllAdjustments } = useQuery({
    queryKey: ['all-adjustments', queryKey, isAdmin, currentUser?.id],
    queryFn: () => getAdjustmentRequests(isAdmin ? undefined : { userId: currentUser?.id }),
    enabled: !!currentUser?.id,
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
    enabled: isAdmin,
  });

  const userMap = useMemo(() => {
    const users = usersData?.items ?? [];
    return new Map(users.map((u) => [u.id, u]));
  }, [usersData]);

  const getEmployeeName = (userId?: string) => {
    if (!userId) return '-';
    if (userId === currentUser?.id) return currentUser.fullName || 'Tôi';
    const u = userMap.get(userId);
    return u ? u.fullName : 'Không xác định';
  };

  const allAdjustments = useMemo(
    () => allAdjustmentsData?.items ?? attendanceAdjustments,
    [allAdjustmentsData, attendanceAdjustments]
  );

  const totalRequestsCount = useMemo(() => allAdjustments.length, [allAdjustments]);

  const pendingCount = useMemo(() => {
    return allAdjustments.filter((r) => r.status === 'pending').length;
  }, [allAdjustments]);

  const approvedCount = useMemo(() => {
    return allAdjustments.filter((r) => r.status === 'approved').length;
  }, [allAdjustments]);

  const rejectedCount = useMemo(() => {
    return allAdjustments.filter((r) => r.status === 'rejected').length;
  }, [allAdjustments]);

  const approvedPercentage = useMemo(() => {
    if (!totalRequestsCount) return 0;
    return Math.round((approvedCount / totalRequestsCount) * 100 * 10) / 10;
  }, [approvedCount, totalRequestsCount]);

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/app' },
    { label: 'Quản lý nhân sự', href: '/app/employees' },
    { label: 'Danh sách khiếu nại', href: '/app/attendances/adjustments' },
  ];

  const employeeOptions = useMemo(() => {
    if (!isAdmin) return [];
    const ids = Array.from(
      new Set(allAdjustments.map((item) => item.userId).filter((id): id is string => Boolean(id)))
    );
    return ids.map((userId) => ({
      value: String(userId),
      label: String(getEmployeeName(userId) || userId || 'Không xác định'),
    }));
  }, [allAdjustments, userMap, isAdmin]);

  const workDateOptions = useMemo(() => {
    const dates = Array.from(
      new Set(allAdjustments.map((item) => item.workDate).filter((date): date is string => Boolean(date)))
    );
    return dates.map((date) => ({
      label: String(date),
      value: String(date),
    }));
  }, [allAdjustments]);

  const statusOptions = useMemo(() => {
    const statuses = Array.from(
      new Set(allAdjustments.map((item) => item.status).filter((status): status is AdjustmentStatus => Boolean(status)))
    );
    return statuses.map((status) => ({
      label: String(STATUS_CONFIG[status]?.label ?? status ?? 'Không xác định'),
      value: String(status),
    }));
  }, [allAdjustments]);

  const typeOptions = useMemo(() => {
    const types = Array.from(
      new Set(allAdjustments.map((item) => item.requestType).filter((type): type is RequestType => Boolean(type)))
    );
    return types.map((type) => ({
      label: String(REQUEST_TYPE_LABEL[type] ?? type ?? 'Không xác định'),
      value: String(type),
    }));
  }, [allAdjustments]);

  const tableFilters = [
    {
      label: 'Trạng thái',
      value: filterStatus,
      options: statusOptions,
      onChange: (val: string | undefined) => setFilterStatus(val as AdjustmentStatus | undefined),
    },
    {
      label: 'Loại khiếu nại',
      value: filterType,
      options: typeOptions,
      onChange: (val: string | undefined) => setFilterType(val as RequestType | undefined),
    },
    ...(isAdmin
      ? [
        {
          label: 'Nhân sự',
          value: filterEmployee,
          options: employeeOptions,
          onChange: (val: string | undefined) => setFilterEmployee(val),
        },
      ]
      : []),
    {
      label: 'Ngày làm việc',
      value: filterDate,
      options: workDateOptions,
      onChange: (val: string | undefined) => setFilterDate(val),
    },
  ];

  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    const response = await getAdjustmentRequests({
      offset,
      limit,
      search: searchQuery || undefined,
      status: filterStatus,
      workDate: filterDate,
      userId: isAdmin ? filterEmployee : currentUser?.id,
    });
    const rawItems = response?.items || [];
    setAttendanceAdjustments(rawItems);
    let items: AdjustmentRecord[] = rawItems;
    if (filterType) {
      items = items.filter((item) => item.requestType === filterType);
    }
    return {
      items,
      meta: {
        total: response?.pagination?.total ?? items.length,
        offset: response?.pagination?.offset ?? offset,
        limit: response?.pagination?.limit ?? limit,
        next: response?.pagination?.next ?? false,
      },
    };
  };

  // Mở modal Preview Phê duyệt / Từ chối
  const openReviewModal = (data: AttendanceAdjustmentRequest, action: 'approved' | 'rejected') => {
    setReviewModalState({
      open: true,
      data,
      action,
    });
  };

  // Thực hiện phê duyệt / từ chối sau khi xác nhận trong Review Modal
  const handleConfirmReview = async (id: number, action: 'approved' | 'rejected', reviewNote: string) => {
    setIsReviewing(true);
    try {
      await updateAdjustmentRequest(id, {
        status: action,
        reviewNote,
      });
      toast.success(action === 'approved' ? 'Đã phê duyệt khiếu nại thành công' : 'Đã từ chối khiếu nại');
      setReviewModalState({ open: false, data: null, action: null });
      setShowDetailModal(false);
      refreshData();
    } catch {
      toast.error('Có lỗi xảy ra khi xử lý khiếu nại');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteAdjustmentRequest(deletingId!);
      toast.success('Đã xóa khiếu nại');
      setShowDeleteModal(false);
      setDeletingId(null);
      refreshData();
    } finally {
      setIsDeleting(false);
    }
  };

  const adjustmentsStats = [
    {
      title: "Tổng khiếu nại",
      value: totalRequestsCount,
      icon: <FileEdit />,
      trend: totalRequestsCount,
      trendDirection: totalRequestsCount > 0 ? "up" : "down"
    },
    {
      title: "Chờ phê duyệt",
      value: pendingCount,
      icon: <Clock />,
      trend: pendingCount,
      trendDirection: pendingCount > 0 ? "up" : "down"
    },
    {
      title: "Đã phê duyệt",
      value: approvedCount,
      icon: <CheckCircle2 />,
      trend: approvedCount,
      trendDirection: approvedCount > 0 ? "up" : "down"
    },
    {
      title: "Từ chối",
      value: rejectedCount,
      icon: <AlertCircle />,
      trend: rejectedCount,
      trendDirection: rejectedCount > 0 ? "up" : "down"
    },
  ]

  // ===================== Redesigned Mobile Card =====================
  const renderCard = (row: AdjustmentRecord, index: number) => {
    const statusCfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG['pending'];
    const canManageThisRow = isAdmin || row.userId === currentUser?.id;
    const isPending = row.status === 'pending';

    return (
      <div
        key={row.id ?? index}
        className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition hover:shadow-md space-y-3"
      >
        {/* Header: ID + User + Status */}
        <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400">#{row.id}</span>
              <h4 className="font-bold text-slate-900 text-sm">
                {getEmployeeName(row.userId)}
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Calendar size={12} className="text-slate-400" /> {row.workDate}
            </p>
          </div>
          <Badge variant={statusCfg.variant} pill>
            {statusCfg.label}
          </Badge>
        </div>

        {/* Request Type Badge */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Loại khiếu nại:</span>
          <Badge variant="info" className="text-[11px] font-semibold">
            {REQUEST_TYPE_LABEL[row.requestType] || row.requestType}
          </Badge>
        </div>

        {/* Adjustment Comparison Box */}
        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1.5 text-xs">
          {(row.oldCheckIn || row.requestedCheckIn || row.requestType !== 'check_out') && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Check In:</span>
              <div className="flex items-center gap-1.5">
                <span className="line-through text-slate-400">{row.oldCheckIn || '--:--'}</span>
                <span className="text-slate-400">→</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  {row.requestedCheckIn || '--:--'}
                </span>
              </div>
            </div>
          )}
          {(row.oldCheckOut || row.requestedCheckOut || row.requestType !== 'check_in') && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Check Out:</span>
              <div className="flex items-center gap-1.5">
                <span className="line-through text-slate-400">{row.oldCheckOut || '--:--'}</span>
                <span className="text-slate-400">→</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  {row.requestedCheckOut || '--:--'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Reason Quote */}
        {row.reason && (
          <p className="text-xs text-slate-600 italic bg-slate-50/50 p-2 rounded-lg border border-dashed border-slate-200 line-clamp-2">
            &quot;{row.reason}&quot;
          </p>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={() => {
              setSelectedRow(row);
              setShowDetailModal(true);
            }}
            className="flex items-center gap-1 text-blue-600 font-semibold hover:underline"
          >
            <Eye size={14} /> Chi tiết
          </button>

          <div className="flex items-center gap-1.5">
            {/* Admin approve/reject preview trigger */}
            {isAdmin && isPending && (
              <button
                type="button"
                onClick={() => openReviewModal(row, 'approved')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 font-bold hover:bg-teal-100 transition"
              >
                <FileCheck size={13} /> Xét duyệt
              </button>
            )}

            {/* Owner or Admin can Edit/Delete */}
            {canManageThisRow && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRow(row);
                    setShowEditModal(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeletingId(row.id);
                    setShowDeleteModal(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const columns: ITableColumn<AdjustmentRecord>[] = [
    {
      key: 'id',
      label: '#',
      minWidth: '60px',
      cell: (row) => <span className="text-slate-400 font-bold text-xs">#{row.id}</span>,
    },
    {
      key: 'employee',
      label: 'Nhân sự',
      minWidth: '160px',
      cell: (row) => (
        <div className="font-bold text-slate-900 text-sm">
          {getEmployeeName(row.userId)}
        </div>
      ),
    },
    {
      key: 'workDate',
      label: 'Ngày làm việc',
      minWidth: '130px',
      cell: (row) => <span className="text-xs font-semibold text-slate-700">{row.workDate}</span>,
    },
    {
      key: 'requestType',
      label: 'Loại khiếu nại',
      minWidth: '170px',
      cell: (row) => (
        <Badge variant="info" className="text-[11px] font-semibold">
          {REQUEST_TYPE_LABEL[row.requestType] || row.requestType}
        </Badge>
      ),
    },
    {
      key: 'checkIn',
      label: 'Check In (Cũ → Mới)',
      minWidth: '180px',
      cell: (row) =>
        row.requestType !== 'check_out' ? (
          <div className="text-xs">
            <span className="text-slate-400 line-through font-medium">{row.oldCheckIn || '-'}</span>
            <span className="mx-1 text-slate-400">→</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
              {row.requestedCheckIn || '-'}
            </span>
          </div>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      key: 'checkOut',
      label: 'Check Out (Cũ → Mới)',
      minWidth: '180px',
      cell: (row) =>
        row.requestType !== 'check_in' ? (
          <div className="text-xs">
            <span className="text-slate-400 line-through font-medium">{row.oldCheckOut || '-'}</span>
            <span className="mx-1 text-slate-400">→</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
              {row.requestedCheckOut || '-'}
            </span>
          </div>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      key: 'reason',
      label: 'Lý do khiếu nại',
      minWidth: '220px',
      cell: (row) => (
        <span className="text-xs text-slate-600 line-clamp-2 max-w-[220px] block italic" title={row.reason}>
          &quot;{row.reason}&quot;
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '130px',
      cell: (row) => {
        const cfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG['pending'];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Thao tác',
      minWidth: '160px',
      cell: (row) => {
        const canManageThisRow = isAdmin || row.userId === currentUser?.id;
        return (
          <div className="flex items-center gap-1">
            <Tooltip content="Xem chi tiết" position="top">
              <button
                type="button"
                onClick={() => {
                  setSelectedRow(row);
                  setShowDetailModal(true);
                }}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                <Eye size={15} />
              </button>
            </Tooltip>

            {isAdmin && row.status === 'pending' && (
              <Tooltip content="Xét duyệt khiếu nại" position="top">
                <button
                  type="button"
                  onClick={() => openReviewModal(row, 'approved')}
                  className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 hover:text-teal-700 transition"
                >
                  <FileCheck size={15} />
                </button>
              </Tooltip>
            )}

            {canManageThisRow && (
              <Tooltip content="Chỉnh sửa" position="top">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRow(row);
                    setShowEditModal(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                >
                  <Pencil size={15} />
                </button>
              </Tooltip>
            )}

            {canManageThisRow && (
              <Tooltip content="Xóa khiếu nại" position="top">
                <button
                  type="button"
                  onClick={() => {
                    setDeletingId(row.id);
                    setShowDeleteModal(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                >
                  <Trash2 size={15} />
                </button>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex h-full w-full flex-1 flex-col bg-slate-50 p-6 space-y-6">
      {/* Top Breadcrumb & Header Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Breadcrumb items={breadcrumbItems} />
        <Button
          className="bg-[#005c53] hover:bg-[#004740] text-white font-semibold shadow-sm gap-2 self-start sm:self-auto"
          leftIcon={<Plus size={18} />}
          onClick={() => setShowAddModal(true)}
        >
          Tạo khiếu nại mới
        </Button>
      </div>

      {/* Title Header */}
      <div>
        <Heading size="h2" className="text-2xl font-bold text-slate-900">
          Danh sách khiếu nại & Điều chỉnh chấm công
        </Heading>
        <p className="mt-1 text-sm text-slate-500">
          {isAdmin
            ? 'Tiếp nhận, thẩm định và phê duyệt các yêu cầu điều chỉnh thời gian quẹt thẻ từ nhân viên.'
            : 'Quản lý các yêu cầu điều chỉnh chấm công và xem trạng thái xử lý.'}
        </p>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        {/* <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TỔNG KHIẾU NẠI</span>
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
              <FileEdit size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {totalRequestsCount} <span className="text-xs font-normal text-slate-500">yêu cầu</span>
          </div>
        </div> */}

        {/* Card 2 */}
        {/* <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">CHỜ PHÊ DUYỆT</span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <Clock size={20} />
            </div>
            {pendingCount > 0 && (
              <Badge variant="warning" pill className="font-extrabold text-[10px]">
                {isAdmin ? 'CẦN XỬ LÝ' : 'ĐANG CHỜ'}
              </Badge>
            )}
          </div>
          <div className="text-3xl font-black text-slate-700">
            {pendingCount} <span className="text-xs font-normal text-slate-500">yêu cầu</span>
          </div>
        </div> */}

        {/* Card 3 */}
        {/* <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ĐÃ PHÊ DUYỆT</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {approvedPercentage}%
            </span>
          </div>
          <div className="text-3xl font-black text-slate-700">
            {approvedCount} <span className="text-xs font-normal text-slate-500">yêu cầu</span>
          </div>
        </div> */}

        {/* Card 4 */}
        {/* <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TỪ CHỐI</span>
            <div className="rounded-xl bg-red-50 p-2.5 text-red-500">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-700">
            {rejectedCount} <span className="text-xs font-normal text-slate-500">yêu cầu</span>
          </div>
        </div> */}
        {adjustmentsStats.map((stat, index) => (
          <StatCart key={index} title={stat.title} value={String(stat.value)} icon={stat.icon} trend={stat.trend} trendDirection={stat.trendDirection as any} />
        ))}
      </div>

      {/* Informative Guidance Banner */}
      <Alert variant="info" title="Quy trình xử lý khiếu nại chấm công" icon={<Info size={18} />}>
        {isAdmin
          ? 'Các yêu cầu điều chỉnh từ nhân viên cần được thẩm định trong vòng 48 giờ làm việc. Sau khi được duyệt, dữ liệu công sẽ tự động cập nhật vào Bảng tổng hợp công tháng.'
          : 'Yêu cầu điều chỉnh chấm công của bạn sẽ được gửi tới Ban Quản trị xét duyệt. Bạn có thể theo dõi trạng thái tại danh sách bên dưới.'}
      </Alert>

      {/* Main Table Section */}
      <div className="space-y-4">
        <TableData<AdjustmentRecord>
          queryKey={[
            'appeals',
            queryKey,
            searchQuery,
            filterStatus,
            filterType,
            filterEmployee,
            filterDate,
            isAdmin,
            currentUser?.id,
          ]}
          fetcher={fetcher}
          columns={columns}
          search={{
            placeholder: isAdmin ? 'Tìm kiếm theo tên nhân viên, lý do...' : 'Tìm kiếm lý do khiếu nại...',
            value: searchQuery,
            onChange: (value) => setSearchQuery(value),
          }}
          filters={tableFilters}
          renderCard={renderCard}
          select={false}
          syncToUrl={false}
        />
      </div>

      {/* Modals */}
      <AddAdjustmentModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={refreshData}
      />

      <EditAdjustmentModal
        open={showEditModal}
        data={selectedRow}
        onClose={() => setShowEditModal(false)}
        onSuccess={refreshData}
      />

      <AdjustmentDetailModal
        open={showDetailModal}
        data={selectedRow}
        onClose={() => setShowDetailModal(false)}
        onApprove={(id) => {
          if (selectedRow) openReviewModal(selectedRow, 'approved');
        }}
        onReject={(id) => {
          if (selectedRow) openReviewModal(selectedRow, 'rejected');
        }}
        canReview={isAdmin}
      />

      {/* Review Modal (Popup Preview Phê duyệt / Từ chối) */}
      <ReviewAdjustmentModal
        open={reviewModalState.open}
        data={reviewModalState.data}
        action={reviewModalState.action}
        employeeName={getEmployeeName(reviewModalState.data?.userId)}
        onClose={() => setReviewModalState({ open: false, data: null, action: null })}
        onConfirm={handleConfirmReview}
        isLoading={isReviewing}
      />

      <DeleteAdjustmentModal
        open={showDeleteModal}
        appealId={deletingId}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingId(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
