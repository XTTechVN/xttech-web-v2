'use client';

import { useMemo, useState } from 'react';
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
  TrendingUp,
  Filter,
  BarChart3,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { AttendanceAdjustmentRequest, AdjustmentStatus, RequestType } from '@/types';
import AddAdjustmentModal from '@/app/(auth)/app/(sidebar)/attendances/_components/adjustment/add-modal';
import EditAdjustmentModal from '@/app/(auth)/app/(sidebar)/attendances/_components/adjustment/edit-modal';
import AdjustmentDetailModal from '@/app/(auth)/app/(sidebar)/attendances/_components/adjustment/detail-modal';
import DeleteAdjustmentModal from '@/app/(auth)/app/(sidebar)/attendances/_components/delete-modal';
import { getAdjustmentRequests, updateAdjustmentRequest, deleteAdjustmentRequest } from '@/actions';
import Loading from '@/app/(auth)/app/loading';

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

const REQUEST_TYPE_LABEL: Record<RequestType, string> = {
  check_in: 'Điều chỉnh Check In',
  check_out: 'Điều chỉnh Check Out',
  both: 'Điều chỉnh Check In & Out',
};

const USER_ROLE = 'admin';
const canAdd = USER_ROLE === 'admin' || USER_ROLE === 'manager' || USER_ROLE === 'employee';
const canEdit = USER_ROLE === 'admin' || USER_ROLE === 'manager';
const canDelete = USER_ROLE === 'admin';
const canReview = USER_ROLE === 'admin' || USER_ROLE === 'manager';

export default function AdjustmentsSidebarPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<AdjustmentStatus | undefined>();
  const [filterType, setFilterType] = useState<RequestType | undefined>();
  const [filterEmployee, setFilterEmployee] = useState<string | undefined>();
  const [filterDate, setFilterDate] = useState<string | undefined>();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<AttendanceAdjustmentRequest | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [queryKey, setQueryKey] = useState(0);
  const [attendanceAdjustments, setAttendanceAdjustments] = useState<AttendanceAdjustmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: allAdjustmentsData, refetch: refetchAllAdjustments } = useQuery({
    queryKey: ['all-adjustments', queryKey],
    queryFn: () => getAdjustmentRequests({ limit: 1000 }),
  });

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

  const checkOutRequestsPercent = useMemo(() => {
    if (!totalRequestsCount) return 0;
    const count = allAdjustments.filter((r) => r.requestType === 'check_out').length;
    return Math.round((count / totalRequestsCount) * 100);
  }, [allAdjustments, totalRequestsCount]);

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/app' },
    { label: 'Quản lý nhân sự', href: '/app/employees' },
    { label: 'Bảng chấm công', href: '/app/attendances' },
    { label: 'Danh sách khiếu nại', href: '/app/attendances/adjustments' },
  ];

  const employeeOptions = useMemo(() => {
    const ids = Array.from(new Set(attendanceAdjustments.map((item) => item.userId).filter(Boolean)));
    return ids.map((userId) => ({ value: userId, label: userId }));
  }, [attendanceAdjustments]);

  const workDateOptions = useMemo(() => {
    const dates = Array.from(new Set(attendanceAdjustments.map((item) => item.workDate).filter(Boolean)));
    return dates.map((date) => ({ label: date, value: date }));
  }, [attendanceAdjustments]);

  const statusOptions = useMemo(() => {
    const statuses = Array.from(new Set(attendanceAdjustments.map((item) => item.status)));
    return statuses.map((status) => ({
      label: STATUS_CONFIG[status]?.label ?? status,
      value: status,
    }));
  }, [attendanceAdjustments]);

  const typeOptions = useMemo(() => {
    const types = Array.from(new Set(attendanceAdjustments.map((item) => item.requestType)));
    return types.map((type) => ({
      label: REQUEST_TYPE_LABEL[type],
      value: type,
    }));
  }, [attendanceAdjustments]);

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
    {
      label: 'Nhân sự',
      value: filterEmployee,
      options: employeeOptions,
      onChange: (val: string | undefined) => setFilterEmployee(val),
    },
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
      userId: filterEmployee,
    });
    const rawItems = response?.items || [];
    setAttendanceAdjustments(rawItems);
    const items: AdjustmentRecord[] = rawItems.map((item) => ({
      ...item,
      _employeeId: item.userId,
      _employeeName: item.userId,
    }));
    return {
      items,
      meta: {
        total: response?.pagination?.total ?? rawItems.length,
        offset: response?.pagination?.offset ?? offset,
        limit: response?.pagination?.limit ?? limit,
        next: response?.pagination?.next ?? false,
      },
    };
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Phê duyệt khiếu nại này?')) return;
    try {
      await updateAdjustmentRequest(id, {
        status: 'approved',
        reviewNote: selectedRow?.reviewNote ?? '',
      });
      toast.success('Đã phê duyệt khiếu nại');
      setShowDetailModal(false);
      setQueryKey((k) => k + 1);
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Từ chối khiếu nại này?')) return;
    try {
      await updateAdjustmentRequest(id, {
        status: 'rejected',
        reviewNote: selectedRow?.reviewNote ?? '',
      });
      toast.success('Đã từ chối khiếu nại');
      setShowDetailModal(false);
      setQueryKey((k) => k + 1);
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteAdjustmentRequest(deletingId!);
      toast.success('Đã xóa khiếu nại');
      setShowDeleteModal(false);
      setDeletingId(null);
      setQueryKey((k) => k + 1);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderCard = (row: AdjustmentRecord, index: number) => {
    const statusCfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG['pending'];
    return (
      <div key={row.id ?? index} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-900">{row._employeeName || 'Nhân viên'}</p>
            <p className="text-xs text-slate-500">{REQUEST_TYPE_LABEL[row.requestType]}</p>
          </div>
          <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
        </div>
        <div className="text-xs text-slate-700 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <p><strong>Ngày làm việc:</strong> {row.workDate}</p>
          <p><strong>Check In:</strong> <span className="line-through text-slate-400">{row.oldCheckIn || '-'}</span> → <span className="font-bold text-blue-600">{row.requestedCheckIn || '-'}</span></p>
          <p><strong>Check Out:</strong> <span className="line-through text-slate-400">{row.oldCheckOut || '-'}</span> → <span className="font-bold text-blue-600">{row.requestedCheckOut || '-'}</span></p>
        </div>
        <p className="text-xs text-slate-500 italic line-clamp-2">&quot;{row.reason}&quot;</p>
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              setSelectedRow(row);
              setShowDetailModal(true);
            }}
            className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline"
          >
            <Eye size={13} /> Xem chi tiết
          </button>
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
        <div>
          <div className="font-bold text-slate-900 text-sm">{row._employeeName || '-'}</div>
          <div className="text-[11px] text-slate-500">Mã NV: {row.userId || '-'}</div>
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
          {REQUEST_TYPE_LABEL[row.requestType]}
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
      cell: (row) => (
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

          {canReview && row.status === 'pending' && (
            <Tooltip content="Phê duyệt nhanh" position="top">
              <button
                type="button"
                onClick={() => handleApprove(row.id)}
                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
              >
                <CheckCircle size={15} />
              </button>
            </Tooltip>
          )}

          {canReview && row.status === 'pending' && (
            <Tooltip content="Từ chối nhanh" position="top">
              <button
                type="button"
                onClick={() => handleReject(row.id)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
              >
                <XCircle size={15} />
              </button>
            </Tooltip>
          )}

          {canEdit && (
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

          {canDelete && (
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
      ),
    },
  ];

  if (isLoading) return <Loading />;

  return (
    <div className="flex h-full w-full flex-1 flex-col bg-slate-50 p-6 space-y-6">
      {/* Top Breadcrumb & Header Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Breadcrumb items={breadcrumbItems} />
        {canAdd && (
          <Button
            className="bg-[#005c53] hover:bg-[#004740] text-white font-semibold shadow-sm gap-2 self-start sm:self-auto"
            leftIcon={<Plus size={18} />}
            onClick={() => setShowAddModal(true)}
          >
            Tạo khiếu nại mới
          </Button>
        )}
      </div>

      {/* Title Header */}
      <div>
        <Heading size="h2" className="text-2xl font-bold text-slate-900">
          Danh sách khiếu nại & Điều chỉnh chấm công
        </Heading>
        <p className="mt-1 text-sm text-slate-500">
          Tiếp nhận, thẩm định và phê duyệt các yêu cầu điều chỉnh thời gian quẹt thẻ từ nhân viên.
        </p>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TỔNG KHIẾU NẠI</span>
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
              <FileEdit size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalRequestsCount} <span className="text-xs font-normal text-slate-500">yêu cầu</span></div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">CHỜ PHÊ DUYỆT</span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <Clock size={20} />
            </div>
            {pendingCount > 0 && (
              <Badge variant="warning" pill className="font-extrabold text-[10px]">CẦN XỬ LÝ</Badge>
            )}
          </div>
          <div className="text-3xl font-black text-slate-700">{pendingCount} <span className="text-xs font-normal text-slate-500">yêu cầu</span></div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ĐÃ PHÊ DUYỆT</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{approvedPercentage}%</span>
          </div>
          <div className="text-3xl font-black text-slate-700">{approvedCount} <span className="text-xs font-normal text-slate-500">yêu cầu</span></div>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TỪ CHỐI</span>
            <div className="rounded-xl bg-red-50 p-2.5 text-red-500">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-700">{rejectedCount} <span className="text-xs font-normal text-slate-500">yêu cầu</span></div>
        </div>
      </div>

      {/* Informative Guidance Banner */}
      <Alert variant="info" title="Quy trình xử lý khiếu nại chấm công" icon={<Info size={18} />}>
        Các yêu cầu điều chỉnh từ nhân viên cần được thẩm định trong vòng 48 giờ làm việc. Sau khi được duyệt, dữ liệu công sẽ tự động cập nhật vào Bảng tổng hợp công tháng.
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
          ]}
          fetcher={fetcher}
          columns={columns}
          search={{
            placeholder: 'Tìm kiếm theo tên nhân viên, lý do khiếu nại...',
            value: searchQuery,
            onChange: (value) => setSearchQuery(value),
          }}
          filters={tableFilters}
          renderCard={renderCard}
          select={false}
          syncToUrl={false}
        />
      </div>

      {/* Analytics Insight Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 shrink-0">
            <BarChart3 size={20} />
          </div>
          <div>
            <h5 className="font-bold text-slate-900 text-sm">Loại khiếu nại phổ biến</h5>
            <p className="text-xs text-slate-500 mt-0.5">{checkOutRequestsPercent}% các yêu cầu liên quan đến điều chỉnh Check-Out.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <h5 className="font-bold text-slate-900 text-sm">Tỷ lệ phê duyệt</h5>
            <p className="text-xs text-slate-500 mt-0.5">Đã xử lý xong {approvedCount + rejectedCount}/{totalRequestsCount} đơn khiếu nại ({approvedPercentage}% được chấp thuận).</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 shrink-0">
            <Filter size={20} />
          </div>
          <div>
            <h5 className="font-bold text-slate-900 text-sm">Lý do khiếu nại chính</h5>
            <p className="text-xs text-slate-500 mt-0.5">Quên quẹt thẻ, Lỗi máy chấm công vân tay, Công tác ngoài.</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddAdjustmentModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => setQueryKey((k) => k + 1)}
      />

      <EditAdjustmentModal
        open={showEditModal}
        data={selectedRow}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => setQueryKey((k) => k + 1)}
      />

      <AdjustmentDetailModal
        open={showDetailModal}
        data={selectedRow}
        onClose={() => setShowDetailModal(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        canReview={canReview}
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
