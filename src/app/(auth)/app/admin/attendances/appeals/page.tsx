'use client';

import { useState } from 'react';
import { Tooltip, Button, TableData, Badge, Breadcrumb, ITableColumn } from '@/components';
import { toast } from 'react-hot-toast';
import { Plus, RefreshCw, Pencil, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import type { AttendanceAdjustmentRequest, AdjustmentStatus, RequestType } from '../api';
import AddAppealModal from './_components/add-appeal-modal';
import EditAppealModal from './_components/edit-appeal-modal';
import AppealDetailModal from './_components/appeal-detail-modal';
import DeleteAppealModal from './_components/delete-appeal-modal';

// ===================== Types =====================
interface AppealRecord extends AttendanceAdjustmentRequest {
    _employeeId?: string;
    _employeeName?: string;
}

// ===================== Mock Data =====================
const mockAppeals: AppealRecord[] = Array.from({ length: 20 }, (_, i) => {
    const statuses: AdjustmentStatus[] = ['pending', 'approved', 'rejected'];
    const types: RequestType[] = ['check_in', 'check_out', 'both'];
    const employees = [
        { id: '1', name: 'Nguyễn Văn A' },
        { id: '2', name: 'Trần Thị B' },
        { id: '3', name: 'Lê Văn C' },
        { id: '4', name: 'Phạm Thị D' },
        { id: '5', name: 'Hoàng Văn E' },
    ];
    const emp = employees[i % employees.length];
    const status = statuses[i % statuses.length];
    const requestType = types[i % types.length];
    const day = String((i % 28) + 1).padStart(2, '0');

    return {
        id: i + 1,
        attendanceId: i % 3 !== 0 ? (i + 100) : undefined,
        requestType,
        oldCheckIn: requestType !== 'check_out' ? `0${7 + (i % 3)}:${String(i % 60).padStart(2, '0')}` : undefined,
        oldCheckOut: requestType !== 'check_in' ? `17:${String(i % 60).padStart(2, '0')}` : undefined,
        requestedCheckIn: requestType !== 'check_out' ? `08:00` : undefined,
        requestedCheckOut: requestType !== 'check_in' ? `17:30` : undefined,
        reason: `Lý do khiếu nại số ${i + 1}: Nhân viên ${emp.name} yêu cầu điều chỉnh thời gian chấm công do lỗi hệ thống.`,
        status,
        workDate: `2026-07-${day}`,
        reviewedBy: status !== 'pending' ? 'Admin HR' : undefined,
        reviewedAt: status !== 'pending' ? `2026-07-${day}T10:00:00Z` : undefined,
        reviewNote: status === 'rejected' ? 'Không đủ bằng chứng' : status === 'approved' ? 'Đã xác minh' : undefined,
        createdAt: `2026-07-${day}T08:00:00Z`,
        updatedAt: `2026-07-${day}T10:00:00Z`,
        _employeeId: emp.id,
        _employeeName: emp.name,
    };
});

// ===================== Config =====================

const STATUS_CONFIG: Record<AdjustmentStatus, { label: string; variant: 'warning' | 'success' | 'danger' }> = {
    pending: { label: 'Chờ duyệt', variant: 'warning' },
    approved: { label: 'Đã duyệt', variant: 'success' },
    rejected: { label: 'Từ chối', variant: 'danger' },
};

const REQUEST_TYPE_LABEL: Record<RequestType, string> = {
    check_in: 'Điều chỉnh Check In',
    check_out: 'Điều chỉnh Check Out',
    both: 'Điều chỉnh cả hai',
};

// Kiểm tra quyền (mock): admin có toàn quyền
const USER_ROLE = 'admin'; // 'admin' | 'manager' | 'employee'
const canAdd = USER_ROLE === 'admin' || USER_ROLE === 'manager' || USER_ROLE === 'employee';
const canEdit = USER_ROLE === 'admin' || USER_ROLE === 'manager';
const canDelete = USER_ROLE === 'admin';
const canReview = USER_ROLE === 'admin' || USER_ROLE === 'manager';

// ===================== Page =====================

export default function AppealsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string | undefined>();
    const [filterType, setFilterType] = useState<string | undefined>();
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

    const breadcrumbItems = [
        { label: 'Trang chủ', href: '/app' },
        { label: 'Quản lý', href: '/app/admin' },
        { label: 'Chấm công', href: '/app/admin/attendances' },
        { label: 'Khiếu nại', href: '/app/admin/attendances/appeals' },
    ];

    // Danh sách nhân viên cho filter
    const employeeOptions = [
        { value: '1', label: 'Nguyễn Văn A' },
        { value: '2', label: 'Trần Thị B' },
        { value: '3', label: 'Lê Văn C' },
        { value: '4', label: 'Phạm Thị D' },
        { value: '5', label: 'Hoàng Văn E' },
    ];

    // Danh sách ngày duy nhất cho filter
    const workDateOptions = [
        ...new Map(
            mockAppeals.map((item) => [item.workDate, { label: item.workDate, value: item.workDate }]),
        ).values(),
    ];

    const tableFilters = [
        {
            label: 'Trạng thái',
            value: filterStatus,
            options: [
                { label: 'Chờ duyệt', value: 'pending' },
                { label: 'Đã duyệt', value: 'approved' },
                { label: 'Từ chối', value: 'rejected' },
            ],
            onChange: (val: string | undefined) => setFilterStatus(val),
        },
        {
            label: 'Loại khiếu nại',
            value: filterType,
            options: [
                { label: 'Điều chỉnh Check In', value: 'check_in' },
                { label: 'Điều chỉnh Check Out', value: 'check_out' },
                { label: 'Điều chỉnh cả hai', value: 'both' },
            ],
            onChange: (val: string | undefined) => setFilterType(val),
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

    // Fetcher với filter + search + phân trang
    const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
        await new Promise((resolve) => setTimeout(resolve, 400));

        let filtered = [...mockAppeals];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.reason?.toLowerCase().includes(q) ||
                    item.workDate?.toLowerCase().includes(q) ||
                    item._employeeName?.toLowerCase().includes(q),
            );
        }

        if (filterStatus) filtered = filtered.filter((item) => item.status === filterStatus);
        if (filterType) filtered = filtered.filter((item) => item.requestType === filterType);
        if (filterEmployee) filtered = filtered.filter((item) => item._employeeId === filterEmployee);
        if (filterDate) filtered = filtered.filter((item) => item.workDate === filterDate);

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

    // Xử lý duyệt
    const handleApprove = async (id: number) => {
        if (!confirm('Phê duyệt khiếu nại này?')) return;
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            toast.success('Đã phê duyệt khiếu nại');
            setShowDetailModal(false);
            setQueryKey((k) => k + 1);
        } catch {
            toast.error('Có lỗi xảy ra');
        }
    };

    // Xử lý từ chối
    const handleReject = async (id: number) => {
        if (!confirm('Từ chối khiếu nại này?')) return;
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            toast.success('Đã từ chối khiếu nại');
            setShowDetailModal(false);
            setQueryKey((k) => k + 1);
        } catch {
            toast.error('Có lỗi xảy ra');
        }
    };

    // Xử lý xóa
    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 600));
            toast.success('Đã xóa khiếu nại');
            setShowDeleteModal(false);
            setDeletingId(null);
            setQueryKey((k) => k + 1);
        } finally {
            setIsDeleting(false);
        }
    };

    // Cấu hình mobile card
    const renderCard = (row: AppealRecord, index: number) => {
        const statusCfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG['pending'];
        return (
            <div key={row.id ?? index} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-slate-800">{row._employeeName || 'Nhân viên'}</p>
                        <p className="text-xs text-slate-500">{REQUEST_TYPE_LABEL[row.requestType]}</p>
                    </div>
                    <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                    <p>
                        <strong>Ngày:</strong> {row.workDate}
                    </p>
                    <p>
                        <strong>Check In:</strong> {row.oldCheckIn || '-'} → {row.requestedCheckIn || '-'}
                    </p>
                    <p>
                        <strong>Check Out:</strong> {row.oldCheckOut || '-'} → {row.requestedCheckOut || '-'}
                    </p>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{row.reason}</p>
                <div className="flex items-center gap-2 pt-1">
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedRow(row);
                            setShowDetailModal(true);
                        }}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                        <Eye size={12} /> Chi tiết
                    </button>
                </div>
            </div>
        );
    };

    // Cấu hình cột desktop
    const columns: ITableColumn<AppealRecord>[] = [
        {
            key: 'id',
            label: '#',
            minWidth: '20px',
            cell: (row) => <span className="text-slate-400 text-xs">#{row.id}</span>,
        },
        {
            key: 'employee',
            label: 'Nhân sự',
            minWidth: '150px',
            cell: (row) => (
                <span className="font-medium text-slate-800">{row._employeeName || '-'}</span>
            ),
        },
        {
            key: 'workDate',
            label: 'Ngày làm việc',
            minWidth: '180px',
            cell: (row) => <span className="text-slate-600">{row.workDate}</span>,
        },
        {
            key: 'requestType',
            label: 'Loại khiếu nại',
            minWidth: '180px',
            cell: (row) => (
                <span className="text-sm text-slate-600">{REQUEST_TYPE_LABEL[row.requestType]}</span>
            ),
        },
        {
            key: 'checkIn',
            label: 'Check In (cũ → mới)',
            minWidth: '190px',
            cell: (row) =>
                row.requestType !== 'check_out' ? (
                    <div className="text-sm">
                        <span className="text-slate-400 line-through">{row.oldCheckIn || '-'}</span>
                        <span className="mx-1 text-slate-300">→</span>
                        <span className="font-medium text-blue-600">{row.requestedCheckIn || '-'}</span>
                    </div>
                ) : (
                    <span className="text-slate-300">—</span>
                ),
        },
        {
            key: 'checkOut',
            label: 'Check Out (cũ → mới)',
            minWidth: '200px',
            cell: (row) =>
                row.requestType !== 'check_in' ? (
                    <div className="text-sm">
                        <span className="text-slate-400 line-through">{row.oldCheckOut || '-'}</span>
                        <span className="mx-1 text-slate-300">→</span>
                        <span className="font-medium text-blue-600">{row.requestedCheckOut || '-'}</span>
                    </div>
                ) : (
                    <span className="text-slate-300">—</span>
                ),
        },
        {
            key: 'reason',
            label: 'Lý do',
            minWidth: '200px',
            cell: (row) => (
                <span className="text-xs text-slate-500 line-clamp-2 max-w-[200px] block">{row.reason}</span>
            ),
        },
        {
            key: 'status',
            label: 'Trạng thái',
            minWidth: '120px',
            cell: (row) => {
                const cfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG['pending'];
                return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
            },
        },
        {
            key: 'actions',
            label: 'Hành động',
            minWidth: '150px',
            cell: (row) => (
                <div className="flex items-center gap-0.5">
                    {/* Chi tiết */}
                    <Tooltip content="Xem chi tiết" position="top">
                        <button
                            type="button"
                            id={`appeal-detail-${row.id}`}
                            onClick={() => {
                                setSelectedRow(row);
                                setShowDetailModal(true);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:scale-150 transition"
                        >
                            <Eye size={14} />
                        </button>
                    </Tooltip>

                    {/* Phê duyệt (chỉ khi pending + có quyền) */}
                    {canReview && row.status === 'pending' && (
                        <Tooltip content="Phê duyệt" position="top">
                            <button
                                type="button"
                                id={`appeal-approve-${row.id}`}
                                onClick={() => handleApprove(row.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg hover:scale-150 transition"
                            >
                                <CheckCircle size={14} />
                            </button>
                        </Tooltip>
                    )}

                    {/* Từ chối (chỉ khi pending + có quyền) */}
                    {canReview && row.status === 'pending' && (
                        <Tooltip content="Từ chối" position="top">
                            <button
                                type="button"
                                id={`appeal-reject-${row.id}`}
                                onClick={() => handleReject(row.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg hover:scale-150 transition"
                            >
                                <XCircle size={14} />
                            </button>
                        </Tooltip>
                    )}

                    {/* Sửa */}
                    {canEdit && (
                        <Tooltip content="Chỉnh sửa" position="top">
                            <button
                                type="button"
                                id={`appeal-edit-${row.id}`}
                                onClick={() => {
                                    setSelectedRow(row);
                                    setShowEditModal(true);
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:scale-150 transition"
                            >
                                <Pencil size={14} />
                            </button>
                        </Tooltip>
                    )}

                    {/* Xóa */}
                    {canDelete && (
                        <Tooltip content="Xóa" position="top">
                            <button
                                type="button"
                                id={`appeal-delete-${row.id}`}
                                onClick={() => {
                                    setDeletingId(row.id);
                                    setShowDeleteModal(true);
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-lg hover:scale-150 transition"
                            >
                                <Trash2 size={14} />
                            </button>
                        </Tooltip>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="flex h-full w-full flex-1 flex-col bg-slate-50 p-6">
            <Breadcrumb items={breadcrumbItems} className="mb-4" />

            {/* Header */}
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Danh sách khiếu nại</h1>
                    <p className="mt-1 text-sm text-slate-500">Quản lý các yêu cầu điều chỉnh chấm công của nhân viên</p>
                </div>
                <div className="flex shrink-0 flex-nowrap items-center gap-2">
                    <Button
                        className='gap-2'
                        leftIcon={<RefreshCw size={16} />}
                        onClick={() => toast.success('Làm mới thành công')}>
                        Tải lại trang
                    </Button>
                    {canAdd && (
                        <Button
                            className='gap-2'
                            leftIcon={<Plus size={16} />}
                            onClick={() => setShowAddModal(true)}>
                            Thêm mới
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="space-y-4">
                <TableData<AppealRecord>
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
                        placeholder: 'Tìm kiếm theo nhân viên, lý do...',
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
            <AddAppealModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    setQueryKey((k) => k + 1);
                }}
            />

            <EditAppealModal
                open={showEditModal}
                data={selectedRow}
                onClose={() => setShowEditModal(false)}
                onSuccess={() => {
                    setQueryKey((k) => k + 1);
                }}
            />

            <AppealDetailModal
                open={showDetailModal}
                data={selectedRow}
                onClose={() => setShowDetailModal(false)}
                onApprove={handleApprove}
                onReject={handleReject}
                canReview={canReview}
            />

            <DeleteAppealModal
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