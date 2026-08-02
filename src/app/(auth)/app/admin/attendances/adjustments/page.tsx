'use client';

import { useMemo, useState } from 'react';
import { Tooltip, Button, TableData, Badge, Breadcrumb, ITableColumn } from '@/components';
import { toast } from 'react-hot-toast';
import { Plus, RefreshCw, Pencil, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import type { AttendanceAdjustmentRequest, AdjustmentStatus, RequestType } from '@/types';
import AddAdjustmentModal from '../_components/adjustment/add-modal';
import EditAdjustmentModal from '../_components/adjustment/edit-modal';
import AdjustmentDetailModal from '../_components/adjustment/detail-modal';
import DeleteAdjustmentModal from '../_components/delete-modal';
import { getAdjustmentRequests, updateAdjustmentRequest, deleteAdjustmentRequest } from '@/actions';
import Loading from '../../../loading';

// ===================== Types =====================
interface AdjustmentRecord extends AttendanceAdjustmentRequest {
    _employeeId?: string;
    _employeeName?: string;
}

// ===================== Mock Data =====================
// const mockAppeals: AdjustmentRecord[] = Array.from({ length: 20 }, (_, i) => {
//     const statuses: AdjustmentStatus[] = ['pending', 'approved', 'rejected'];
//     const types: RequestType[] = ['check_in', 'check_out', 'both'];
//     const employees = [
//         { id: '1', name: 'Nguyễn Văn A' },
//         { id: '2', name: 'Trần Thị B' },
//         { id: '3', name: 'Lê Văn C' },
//         { id: '4', name: 'Phạm Thị D' },
//         { id: '5', name: 'Hoàng Văn E' },
//     ];
//     const emp = employees[i % employees.length];
//     const status = statuses[i % statuses.length];
//     const requestType = types[i % types.length];
//     const day = String((i % 28) + 1).padStart(2, '0');

//     return {
//         id: i + 1,
//         attendanceId: i % 3 !== 0 ? (i + 100) : undefined,
//         requestType,
//         oldCheckIn: requestType !== 'check_out' ? `0${7 + (i % 3)}:${String(i % 60).padStart(2, '0')}` : undefined,
//         oldCheckOut: requestType !== 'check_in' ? `17:${String(i % 60).padStart(2, '0')}` : undefined,
//         requestedCheckIn: requestType !== 'check_out' ? `08:00` : undefined,
//         requestedCheckOut: requestType !== 'check_in' ? `17:30` : undefined,
//         reason: `Lý do khiếu nại số ${i + 1}: Nhân viên ${emp.name} yêu cầu điều chỉnh thời gian chấm công do lỗi hệ thống.`,
//         status,
//         workDate: `2026-07-${day}`,
//         reviewedBy: status !== 'pending' ? 'Admin HR' : undefined,
//         reviewedAt: status !== 'pending' ? `2026-07-${day}T10:00:00Z` : undefined,
//         reviewNote: status === 'rejected' ? 'Không đủ bằng chứng' : status === 'approved' ? 'Đã xác minh' : undefined,
//         createdAt: `2026-07-${day}T08:00:00Z`,
//         updatedAt: `2026-07-${day}T10:00:00Z`,
//         _employeeId: emp.id,
//         _employeeName: emp.name,
//     };
// });

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

export default function AdjustmentsPage() {
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

    const breadcrumbItems = [
        { label: 'Trang chủ', href: '/app' },
        { label: 'Quản lý', href: '/app/admin' },
        { label: 'Chấm công', href: '/app/admin/attendances' },
        { label: 'Điều chỉnh', href: '/app/admin/attendances/adjustments' },
    ];

    // Danh sách nhân viên cho filter
    const employeeOptions = useMemo(() => {
        const ids = Array.from(
            new Set(
                attendanceAdjustments
                    .map(item => item.userId)
                    .filter(Boolean)
            )
        );

        return ids.map(userId => ({
            value: userId,
            label: userId,
        }));
    }, [attendanceAdjustments]);

    // Danh sách ngày duy nhất cho filter
    const workDateOptions = useMemo(() => {
        const dates = Array.from(
            new Set(
                attendanceAdjustments
                    .map(item => item.workDate)
                    .filter(Boolean)
            )
        );
        return dates.map(date => ({
            label: date,
            value: date,
        }));
    }, [attendanceAdjustments]);

    const statusOptions = useMemo(() => {
        const statuses = Array.from(
            new Set(
                attendanceAdjustments.map(item => item.status)
            )
        );
        return statuses.map(status => ({
            label: STATUS_CONFIG[status]?.label ?? status,
            value: status,
        }));
    }, [attendanceAdjustments]);

    const typeOptions = useMemo(() => {
        const types = Array.from(
            new Set(
                attendanceAdjustments.map(item => item.requestType)
            )
        );
        return types.map(type => ({
            label: REQUEST_TYPE_LABEL[type],
            value: type,
        }));
    }, [attendanceAdjustments]);

    const tableFilters = [
        {
            label: 'Trạng thái',
            value: filterStatus,
            options: statusOptions,
            onChange: (val: string | undefined) =>
                setFilterStatus(val as AdjustmentStatus | undefined),
        },
        {
            label: 'Loại khiếu nại',
            value: filterType,
            options: typeOptions,
            onChange: (val: string | undefined) =>
                setFilterType(val as RequestType | undefined),
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
    const fetcher = async ({
        offset,
        limit
    }: {
        offset: number;
        limit: number
    }) => {
        const response = await getAdjustmentRequests({
            offset,
            limit,
            search: searchQuery || undefined,
            status: filterStatus,
            workDate: filterDate,
            userId: filterEmployee,
        });
        // lưu data để tạo filter employee
        setAttendanceAdjustments(response.items);
        const items: AdjustmentRecord[] = response.items.map(item => ({
            ...item,
            _employeeId: item.userId,
            _employeeName: item.userId,
        }));
        return {
            items,
            meta: {
                total: response.pagination.total,
                offset: response.pagination.offset,
                limit: response.pagination.limit,
                next: response.pagination.next,
            },
        };
    };

    // Xử lý duyệt
    const handleApprove = async (id: number) => {
        if (!confirm('Phê duyệt khiếu nại này?')) return;
        console.log("Approve request id:", id);
        try {
            const response = await updateAdjustmentRequest(id, {
                status: 'approved',
                reviewNote: selectedRow?.reviewNote ?? '',
            });
            console.log(response);
            toast.success('Đã phê duyệt khiếu nại');
            setShowDetailModal(false);
            setQueryKey((k) => k + 1);

        } catch (err) {
            console.log(err);
            toast.error('Có lỗi xảy ra');
        }
    };

    // Xử lý từ chối
    const handleReject = async (id: number) => {
        if (!confirm('Từ chối khiếu nại này?')) return;
        try {
            // await new Promise((resolve) => setTimeout(resolve, 500));
            const response = await updateAdjustmentRequest(id, {
                status: 'rejected',
                reviewNote: selectedRow?.reviewNote ?? '',
            });
            console.log(response);
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
            // await new Promise((resolve) => setTimeout(resolve, 600));
            await deleteAdjustmentRequest(deletingId!);
            toast.success('Đã xóa khiếu nại');
            setShowDeleteModal(false);
            setDeletingId(null);
            setQueryKey((k) => k + 1);
        } finally {
            setIsDeleting(false);
        }
    };

    // Cấu hình mobile card
    const renderCard = (row: AdjustmentRecord, index: number) => {
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
    const columns: ITableColumn<AdjustmentRecord>[] = [
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
    if (isLoading) return <Loading />;
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
            <AddAdjustmentModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    setQueryKey((k) => k + 1);
                }}
            />

            <EditAdjustmentModal
                open={showEditModal}
                data={selectedRow}
                onClose={() => setShowEditModal(false)}
                onSuccess={() => {
                    setQueryKey((k) => k + 1);
                }}
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