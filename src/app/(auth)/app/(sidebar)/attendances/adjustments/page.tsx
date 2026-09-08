'use client';

import { useMemo, useState } from 'react';
import { TableAction, Button, TableData, Badge, ITableColumn, ITableFilterProps, Heading, Alert, Avatar } from '@/components';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, Eye, CheckCircle2, FileEdit, Clock, AlertCircle, Info, FileCheck, Calendar, SquareCheck, Check } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BASE_MINIO_URL } from '@/config';
import { getRequestTypeLabel } from '@/types';
import type { AttendanceAdjustmentRequest, AdjustmentStatus, RequestType } from '@/types';
import AddAdjustmentModal from './_components/add-modal';
import EditAdjustmentModal from './_components/edit-modal';
import AdjustmentDetailModal from './_components/detail-modal';
import ReviewAdjustmentModal from './_components/review-modal';
import DeleteAdjustmentModal from '@/app/(auth)/app/(sidebar)/attendances/_components/delete-modal';
import { getAdjustmentRequests, updateAdjustmentRequest, deleteAdjustmentRequest, getUsers } from '@/actions';
import { usePermission } from '@/hooks';
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

// Sử dụng helper getRequestTypeLabel từ @/types để hiển thị loại khiếu nại
export default function AdjustmentsSidebarPage() {
  const queryClient = useQueryClient();
  const { user: currentUser, isManager: isAdmin } = usePermission();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<AdjustmentStatus | undefined>();
  const [filterType, setFilterType] = useState<RequestType | undefined>();
  const [filterEmployee, setFilterEmployee] = useState<string | undefined>();
  const [filterStartDate, setFilterStartDate] = useState<string | undefined>();
  const [filterEndDate, setFilterEndDate] = useState<string | undefined>();

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
    queryKey: ['all-adjustments', queryKey, isAdmin, currentUser?.id, filterStartDate, filterEndDate],
    queryFn: () =>
      getAdjustmentRequests({
        ...(isAdmin ? {} : { userId: currentUser?.id }),
        startDate: filterStartDate || undefined,
        endDate: filterEndDate || undefined,
      }),
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

  const allAdjustments = useMemo(() => allAdjustmentsData?.items ?? attendanceAdjustments, [allAdjustmentsData, attendanceAdjustments]);

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

  const statusOptions = useMemo(() => {
    const statuses = Array.from(new Set(allAdjustments.map((item) => item.status).filter((status): status is AdjustmentStatus => Boolean(status))));
    return statuses.map((status) => ({
      label: String(STATUS_CONFIG[status]?.label ?? status ?? 'Không xác định'),
      value: String(status),
    }));
  }, [allAdjustments]);

  const typeOptions = useMemo(() => {
    const types = Array.from(new Set(allAdjustments.map((item) => item.requestType).filter((type): type is RequestType => Boolean(type))));
    return types.map((type) => ({
      label: getRequestTypeLabel(type) || 'Không xác định',
      value: String(type),
    }));
  }, [allAdjustments]);

  const tableFilters: ITableFilterProps[] = [
    {
      label: 'Loại khiếu nại',
      value: filterType,
      options: typeOptions,
      onChange: (val: string | undefined) => setFilterType(val as RequestType | undefined),
    },
    {
      label: 'Trạng thái',
      value: filterStatus,
      options: statusOptions,
      onChange: (val: string | undefined) => setFilterStatus(val as AdjustmentStatus | undefined),
    },
  ];

  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    const response = await getAdjustmentRequests({
      offset,
      limit,
      search: searchQuery || undefined,
      status: filterStatus,
      startDate: filterStartDate || undefined,
      endDate: filterEndDate || undefined,
      userId: isAdmin ? filterEmployee : currentUser?.id,
    });
    const rawItems = response?.items || [];
    setAttendanceAdjustments(rawItems);
    let items: AdjustmentRecord[] = rawItems;
    if (filterType) {
      items = items.filter((item) => item.requestType === filterType);
    }
    if (filterStartDate) {
      items = items.filter((item) => item.workDate >= filterStartDate);
    }
    if (filterEndDate) {
      items = items.filter((item) => item.workDate <= filterEndDate);
    }
    return {
      items,
      meta: {
        total: response?.meta?.total ?? items.length,
        offset: response?.meta?.offset ?? offset,
        limit: response?.meta?.limit ?? limit,
        next: response?.meta?.next ?? false,
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
      title: 'Tổng khiếu nại',
      value: totalRequestsCount,
      icon: <FileEdit />,
      trend: totalRequestsCount,
      trendDirection: totalRequestsCount > 0 ? 'up' : 'down',
    },
    {
      title: 'Chờ phê duyệt',
      value: pendingCount,
      icon: <Clock />,
      trend: pendingCount,
      trendDirection: pendingCount > 0 ? 'up' : 'down',
    },
    {
      title: 'Đã phê duyệt',
      value: approvedCount,
      icon: <CheckCircle2 />,
      trend: approvedCount,
      trendDirection: approvedCount > 0 ? 'up' : 'down',
    },
    {
      title: 'Từ chối',
      value: rejectedCount,
      icon: <AlertCircle />,
      trend: rejectedCount,
      trendDirection: rejectedCount > 0 ? 'up' : 'down',
    },
  ];

  // ===================== Redesigned Mobile Card =====================
  const renderCard = (row: AdjustmentRecord, index: number) => {
    const statusCfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG['pending'];
    const canManageThisRow = isAdmin || row.userId === currentUser?.id;
    const isPending = row.status === 'pending';

    return (
      <div
        key={row.id ?? index}
        onClick={() => {
          setSelectedRow(row);
          setShowDetailModal(true);
        }}
        className="rounded-2xl border border-primary/10 bg-white p-4 shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300 space-y-3 cursor-pointer"
      >
        {/* Header: ID + User + Status */}
        <div className="flex items-start justify-between gap-2 pb-2 border-b border-gray-100/50">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400">#{row.id}</span>
              <h4 className="font-bold text-slate-900 text-sm">{row?.user?.fullName}</h4>
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
            {getRequestTypeLabel(row.requestType)}
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
          <p
            className="text-xs text-slate-600 italic bg-slate-50/50 p-2 rounded-lg border border-dashed border-slate-200 truncate"
            title={row.reason}
          >
            {row.reason}
          </p>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100/50" onClick={(e) => e.stopPropagation()}>
          {canManageThisRow && (
            <button
              type="button"
              onClick={() => {
                setSelectedRow(row);
                setShowEditModal(true);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Pencil size={12} />
              Sửa
            </button>
          )}
          {canManageThisRow && (
            <button
              type="button"
              onClick={() => {
                setDeletingId(row.id);
                setShowDeleteModal(true);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-50/50 text-red-600 border border-red-100 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={12} />
              Xóa
            </button>
          )}
        </div>
      </div>
    );
  };

  // Cấu hình các cột hiển thị trong TableData
  const columns: ITableColumn<AdjustmentRecord>[] = [
    {
      key: 'user',
      label: 'Nhân sự',
      minWidth: '180px',
      cell: (row) => {
        const avatarSrc = row.user?.avatar
          ? row.user.avatar.startsWith('http')
            ? row.user.avatar
            : `${BASE_MINIO_URL}${row.user.avatar}`
          : undefined;

        return (
          <div className="flex items-center gap-3">
            <Avatar name={row.user?.fullName || 'NV'} src={avatarSrc} size="sm" />
            <span className="font-semibold text-gray-900 text-sm truncate">
              {row.user?.fullName || 'Nhân viên'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'workDate',
      label: 'Ngày làm việc',
      minWidth: '130px',
      cell: (row) => <span className="font-medium text-slate-700">{row.workDate || '-'}</span>,
    },
    {
      key: 'requestType',
      label: 'Loại khiếu nại',
      minWidth: '160px',
      cell: (row) => (
        <Badge variant="info" className="text-[11px] font-semibold">
          {getRequestTypeLabel(row.requestType)}
        </Badge>
      ),
    },
    {
      key: 'checkIn',
      label: 'Check In (Cũ → Mới)',
      minWidth: '160px',
      cell: (row) =>
        row.requestedCheckIn ? (
          <div className="text-xs">
            <span className="text-slate-400 line-through font-medium">{row.oldCheckIn || '-'}</span>
            <span className="mx-1 text-slate-400">→</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{row.requestedCheckIn || '-'}</span>
          </div>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      key: 'checkOut',
      label: 'Check Out (Cũ → Mới)',
      minWidth: '160px',
      cell: (row) =>
        row.requestedCheckOut ? (
          <div className="text-xs">
            <span className="text-slate-400 line-through font-medium">{row.oldCheckOut || '-'}</span>
            <span className="mx-1 text-slate-400">→</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{row.requestedCheckOut || '-'}</span>
          </div>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      key: 'reason',
      label: 'Lý do khiếu nại',
      minWidth: '155px',
      cell: (row) => (
        <span
          className="text-xs text-slate-600 truncate max-w-[250px] block"
          title={row.reason || ''}
        >
          {row.reason || '-'}
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
      minWidth: '120px',
      cell: (row) => {
        const canManageThisRow = isAdmin || row.userId === currentUser?.id;
        return (
          <TableAction
            items={[
              {
                title: 'Xem chi tiết',
                icon: Eye,
                size: 18,
                onClick: () => {
                  setSelectedRow(row);
                  setShowDetailModal(true);
                },
              },
              canManageThisRow && {
                title: 'Chỉnh sửa',
                icon: Pencil,
                size: 18,
                onClick: () => {
                  setSelectedRow(row);
                  setShowEditModal(true);
                },
              },
              canManageThisRow && {
                title: 'Xóa',
                icon: Trash2,
                size: 18,
                className: 'hover:text-red-600 hover:bg-red-50',
                onClick: () => {
                  setDeletingId(row.id);
                  setShowDeleteModal(true);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {adjustmentsStats.map((stat, index) => (
          <StatCart
            key={index}
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
          <Button variant="primary" size="sm" leftIcon={<Plus size={16} />} onClick={() => setShowAddModal(true)} className="px-3 gap-1.5">
            Tạo khiếu nại mới
          </Button>
        </div>
        <TableData<AdjustmentRecord>
          queryKey={[
            'appeals',
            queryKey,
            searchQuery,
            filterStatus,
            filterType,
            filterEmployee,
            filterStartDate,
            filterEndDate,
            isAdmin,
            currentUser?.id,
          ]}
          fetcher={fetcher}
          columns={columns}
          search={{
            placeholder: isAdmin ? 'Tìm kiếm theo tên nhân viên, lý do...' : 'Tìm kiếm lý do khiếu nại...',
            value: searchQuery,
            onChange: (value) => setSearchQuery(value),
            className: 'min-w-[280px]',
          }}
          filters={tableFilters}
          renderCard={renderCard}
          select={false}
          syncToUrl={false}
        />
      </div>

      {/* Modals */}
      <AddAdjustmentModal open={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={refreshData} />

      <EditAdjustmentModal open={showEditModal} data={selectedRow} onClose={() => setShowEditModal(false)} onSuccess={refreshData} />

      <AdjustmentDetailModal
        open={showDetailModal}
        data={selectedRow}
        onClose={() => setShowDetailModal(false)}
        isAdmin={isAdmin}
        onReview={openReviewModal}
      />

      {/* Review Modal (Popup Preview Phê duyệt / Từ chối) */}
      <ReviewAdjustmentModal
        open={reviewModalState.open}
        data={reviewModalState.data}
        action={reviewModalState.action}
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
