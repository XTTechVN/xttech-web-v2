/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Pencil, Trash2, Eye, Clock, FileEdit, Calendar, UserCheck, Users, UserCheck2, Plus, MessageSquareWarning, } from 'lucide-react';

import { Button, TableData, TableAction, Badge, Heading, ITableColumn, ITableFilterProps, Avatar, Modal, } from '@/components';
import { BASE_MINIO_URL } from '@/config';
import { useQueryParam } from '@/hooks';
import { deleteAttendance, getAttendances, getDepartments, getAdjustmentRequests, } from '@/actions';
import { Attendance, AttendanceStatus, getAttendanceStatusLabel, getAttendanceStatusVariant, } from '@/types';

import StatCart from '../dashboard/_components/stats-card';
import AddAttendanceModal from '@/app/(auth)/app/(sidebar)/attendances/_components/add-modal';
import EditAttendanceModal from '@/app/(auth)/app/(sidebar)/attendances/_components/edit-modal';
import AttendanceDetailModal from '@/app/(auth)/app/(sidebar)/attendances/_components/attendance-modal';
import AddAdjustmentModal from './adjustments/_components/add-modal';

type FilterOption = {
  value: string | undefined;
  label: string;
};

export default function AttendancesPage() {
  const queryClient = useQueryClient();

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useQueryParam('search', '');
  const [filterDepartment, setFilterDepartment] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Attendance | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lấy danh sách phòng ban cho bộ lọc
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments(),
  });

  // Lấy danh sách khiếu nại chờ duyệt
  const { data: adjustmentRequestsData } = useQuery({
    queryKey: ['adjustment-requests'],
    queryFn: () => getAdjustmentRequests(),
  });

  // Dates: today & yesterday cho thống kê
  const { todayStr, yesterdayStr } = useMemo(() => {
    const now = new Date();
    const t = now.toISOString().slice(0, 10);
    const yObj = new Date(now);
    yObj.setDate(yObj.getDate() - 1);
    const y = yObj.toISOString().slice(0, 10);
    return { todayStr: t, yesterdayStr: y };
  }, []);

  const { data: statsData } = useQuery({
    queryKey: ['attendances-stats', todayStr, yesterdayStr],
    queryFn: () => getAttendances({ startDate: yesterdayStr, endDate: todayStr, limit: 1000 }),
  });
  const statsAttendances = useMemo(()=> statsData?.items ?? [], [statsData]);

  // 1. Thống kê có mặt hôm nay
  const presentCount = useMemo(() => {
    return statsAttendances.filter(
      (r) =>
        r.workDate === todayStr &&
        r.status &&
        r.status.toLowerCase() !== 'absent' &&
        r.status.toLowerCase() !== 'vắng mặt'
    ).length;
  }, [statsAttendances, todayStr]);

  // 2. Thống kê vắng mặt hôm nay & so sánh hôm qua
  const todayAbsentCount = useMemo(() => {
    return statsAttendances.filter(
      (r) =>
        r.workDate === todayStr &&
        (r.status?.toLowerCase() === 'absent' || r.status?.toLowerCase() === 'vắng mặt')
    ).length;
  }, [statsAttendances, todayStr]);

  const yesterdayAbsentCount = useMemo(() => {
    return statsAttendances.filter(
      (r) =>
        r.workDate === yesterdayStr &&
        (r.status?.toLowerCase() === 'absent' || r.status?.toLowerCase() === 'vắng mặt')
    ).length;
  }, [statsAttendances, yesterdayStr]);

  const absentDiff = todayAbsentCount - yesterdayAbsentCount;

  // 3. Thống kê đi muộn / về sớm hôm nay & so sánh hôm qua
  const todayLateCount = useMemo(() => {
    return statsAttendances.filter(
      (r) =>
        r.workDate === todayStr &&
        (r.isLate ||
          r.isEarlyLeave ||
          r.status?.toLowerCase() === 'late' ||
          r.status?.toLowerCase() === 'early_leave' ||
          r.status?.toLowerCase() === 'đi muộn' ||
          r.status?.toLowerCase() === 'về sớm')
    ).length;
  }, [statsAttendances, todayStr]);

  const yesterdayLateCount = useMemo(() => {
    return statsAttendances.filter(
      (r) =>
        r.workDate === yesterdayStr &&
        (r.isLate ||
          r.isEarlyLeave ||
          r.status?.toLowerCase() === 'late' ||
          r.status?.toLowerCase() === 'early_leave' ||
          r.status?.toLowerCase() === 'đi muộn' ||
          r.status?.toLowerCase() === 'về sớm')
    ).length;
  }, [statsAttendances, yesterdayStr]);

  const lateDiff = todayLateCount - yesterdayLateCount;

  // 4. Số khiếu nại chờ duyệt
  const pendingAdjustmentRequests = useMemo(() => {
    return (adjustmentRequestsData?.items ?? []).filter((item) => item.status === 'pending');
  }, [adjustmentRequestsData]);

  const departmentOptions: FilterOption[] = Array.from(
    new Map(
      ((departments as any)?.items ?? []).map((item: any) => [
        item.id,
        {
          label: item.name ?? 'Không xác định',
          value: String(item.id),
        },
      ])
    ).values()
  ) as any;

  const statusOptions: FilterOption[] = [
    { value: undefined, label: 'Tất cả trạng thái' },
    { value: 'present', label: 'Đúng giờ' },
    { value: 'late', label: 'Đi muộn' },
    { value: 'early_leave', label: 'Về sớm' },
    { value: 'late_and_early_leave', label: 'Đi muộn & Về sớm' },
    { value: 'overtime', label: 'Tăng ca' },
    { value: 'absent', label: 'Vắng mặt' },
  ];

  // Cấu hình filters cho TableData
  const tableFilters: ITableFilterProps[] = [
    {
      label: 'Phòng ban',
      value: filterDepartment,
      options: departmentOptions,
      onChange: (val: string | undefined) => {
        setFilterDepartment(val);
      },
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
      offset,
      limit,
      search: searchQuery || undefined,
      departmentId: filterDepartment ? Number(filterDepartment) : undefined,
      status: (filterStatus as AttendanceStatus) || undefined,
    });

    return {
      items: response?.items ?? [],
      meta: {
        total: response?.meta?.total ?? 0,
        offset: response?.meta?.offset ?? offset,
        limit: response?.meta?.limit ?? limit,
        next: response?.meta?.next ?? false,
      },
    };
  };

  const handleDelete = (row: Attendance) => {
    setSelectedRow(row);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRow?.id) return;
    setIsDeleting(true);
    try {
      await deleteAttendance(selectedRow.id);
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      queryClient.invalidateQueries({ queryKey: ['attendances-stats'] });
      toast.success('Đã xóa chấm công thành công');
      setShowDeleteModal(false);
    } catch {
      toast.error('Có lỗi xảy ra khi xóa bản ghi chấm công');
    } finally {
      setIsDeleting(false);
    }
  };

  // Cấu hình các cột Table (Desktop View)
  const columns: ITableColumn<Attendance>[] = [
    {
      key: 'workDate',
      label: 'Ngày làm việc',
      minWidth: '140px',
      cell: (row) => (
        <span className="font-medium text-slate-500">{row.workDate}</span>
      ),
    },
    {
      key: 'employee',
      label: 'Nhân sự',
      minWidth: '180px',
      cell: (row) => {
        const avatar = row.user?.avatar;
        const avatarSrc = avatar
          ? avatar.startsWith('http')
            ? avatar
            : `${BASE_MINIO_URL}${avatar}`
          : undefined;
        return (
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar
              src={avatarSrc}
              name={row.user?.fullName || 'NV'}
              size="sm"
            />
            <span className="font-semibold text-slate-800 text-sm truncate">
              {row.user?.fullName || '-'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'checkIn',
      label: 'Check In',
      minWidth: '130px',
      cell: (row) => {
        const imgPath = row.imgCheckinPath;
        const imgSrc = imgPath
          ? imgPath.startsWith('http')
            ? imgPath
            : `${BASE_MINIO_URL}${imgPath}`
          : null;

        return (
          <div className="flex items-center gap-2">
            {imgSrc ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 shrink-0">
                <img
                  src={imgSrc}
                  alt={row.user?.fullName || 'Check In'}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0 flex items-center justify-center text-slate-400 border border-slate-200/60">
                <Clock className="w-4 h-4" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-medium text-slate-700 text-sm">
                {row.checkIn ? row.checkIn.slice(0, 5) : '--:--'}
              </span>
              {row.isLate && (
                <span className="text-[10px] text-slate-500 font-semibold">
                  Muộn {row.lateMinutes ?? 0}p
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'checkOut',
      label: 'Check Out',
      minWidth: '130px',
      cell: (row) => {
        const imgPath = row.imgCheckoutPath;
        const imgSrc = imgPath
          ? imgPath.startsWith('http')
            ? imgPath
            : `${BASE_MINIO_URL}${imgPath}`
          : null;

        return (
          <div className="flex items-center gap-2">
            {imgSrc ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 shrink-0">
                <img
                  src={imgSrc}
                  alt={row.user?.fullName || 'Check Out'}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0 flex items-center justify-center text-slate-400 border border-slate-200/60">
                <Clock className="w-4 h-4" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-medium text-slate-700 text-sm">
                {row.checkOut ? row.checkOut.slice(0, 5) : '--:--'}
              </span>
              {row.isEarlyLeave && (
                <span className="text-[10px] text-slate-500 font-semibold">
                  Về sớm {row.earlyLeaveMinutes ?? 0}p
                </span>
              )}
            </div>
          </div>
        );
      },
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
        <span
          className="text-xs max-w-[250px] truncate block"
          title={row.note || undefined}
        >
          {row.note || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '120px',
      cell: (row) => (
        <Badge variant={getAttendanceStatusVariant(row.status)}>
          {getAttendanceStatusLabel(row.status)}
        </Badge>
      ),
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

  // Giao diện Card cho Mobile View
  const renderCard = (row: Attendance, index: number) => {
    const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }> = {
      present: { label: 'Đúng giờ', variant: 'success' },
      normal: { label: 'Đúng giờ', variant: 'success' },
      late: { label: 'Đi muộn', variant: 'warning' },
      absent: { label: 'Vắng mặt', variant: 'danger' },
      early_leave: { label: 'Về sớm', variant: 'warning' },
      early_checkout: { label: 'Về sớm', variant: 'warning' },
      late_and_early_leave: { label: 'Đi muộn & Về sớm', variant: 'warning' },
      overtime: { label: 'Tăng ca', variant: 'success' },
      half_day: { label: 'Nửa ngày', variant: 'warning' },
    };

    const statusInfo = statusMap[row.status ?? ''] ?? {
      label: row.status || 'Không xác định',
      variant: 'info',
    };

    return (
      <div
        key={row.id || index}
        onClick={() => {
          setSelectedRow(row);
          setShowDetailModal(true);
        }}
        className="rounded-2xl border border-primary/10 bg-white p-4 shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300 space-y-3 cursor-pointer"
      >
        {/* Header: User Avatar + Name + Status */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-gray-100/50">
          <div className="flex items-center gap-3">
            <Avatar
              src={
                row.user?.avatar
                  ? row.user.avatar.startsWith('http')
                    ? row.user.avatar
                    : `${BASE_MINIO_URL}${row.user.avatar}`
                  : undefined
              }
              name={row.user?.fullName || 'NV'}
              size="md"
            />
            <div>
              <p className="font-bold text-slate-900 text-sm">
                {row.user?.fullName || 'Nhân viên'}
              </p>
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
            <p className="font-semibold text-slate-800">
              {row.checkIn ? row.checkIn.slice(0, 5) : '--:--'}
            </p>
            {row.isLate && (
              <span className="text-[10px] text-amber-600 font-medium block">
                Muộn {row.lateMinutes ?? 0} phút
              </span>
            )}
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Check Out</span>
            <p className="font-semibold text-slate-800">
              {row.checkOut ? row.checkOut.slice(0, 5) : '--:--'}
            </p>
            {row.isEarlyLeave && (
              <span className="text-[10px] text-amber-600 font-medium block">
                Về sớm {row.earlyLeaveMinutes ?? 0} phút
              </span>
            )}
          </div>
        </div>

        {/* Note if any */}
        {row.note && (
          <p
            className="text-xs text-slate-500 italic bg-slate-50/50 p-2 rounded-lg border border-dashed border-slate-200 truncate"
            title={row.note}
          >
            Ghi chú: {row.note}
          </p>
        )}

        {/* Action Buttons */}
        <div
          className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100/50"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              setSelectedRow(row);
              setShowAdjustmentModal(true);
            }}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <FileEdit size={12} />
            Khiếu nại
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedRow(row);
              setShowEditModal(true);
            }}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Pencil size={12} />
            Sửa
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-50/50 text-red-600 border border-red-100 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 size={12} />
            Xóa
          </button>
        </div>
      </div>
    );
  };

  const attendanceStats = [
    {
      title: 'Tổng số có mặt',
      value: presentCount,
      icon: <Users />,
      trend: presentCount,
      trendDirection: 'up' as const,
    },
    {
      title: 'Vắng mặt hôm nay',
      value: todayAbsentCount,
      icon: <UserCheck />,
      trend: absentDiff,
      trendDirection: absentDiff >= 0 ? ('up' as const) : ('down' as const),
    },
    {
      title: 'Đi muộn / về sớm',
      value: todayLateCount,
      icon: <UserCheck2 />,
      trend: lateDiff,
      trendDirection: lateDiff >= 0 ? ('up' as const) : ('down' as const),
    },
    {
      title: 'Số khiếu nại chờ duyệt',
      value: pendingAdjustmentRequests.length,
      icon: <MessageSquareWarning />,
      trend: pendingAdjustmentRequests.length,
      trendDirection: 'up' as const,
    },
  ];


  return (
    <div className="w-full flex flex-col gap-4">
      {/* 4 Thẻ Thống Kê Nhanh */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {attendanceStats.map((stat, index) => (
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

      {/* Table Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
          <Heading className="text-primary text-2xl" size="h1">
            Quản lý chấm công
          </Heading>

          <div className="flex items-center sm:justify-end gap-2 overflow-x-auto scrollbar-none max-w-full w-full sm:w-auto shrink-0 pb-1 sm:pb-0 flex-nowrap sm:flex-wrap">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddModal(true)}
              leftIcon={<Plus size={16} />}
              className="px-3 gap-1.5 shrink-0"
            >
              Thêm chấm công
            </Button>

            <Link href="/app/attendances/adjustments" className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FileEdit size={16} className="text-sky-600" />}
                className="px-3 gap-1.5 text-slate-700 hover:bg-slate-50 border-slate-200 w-full"
              >
                Danh sách khiếu nại
              </Button>
            </Link>
          </div>
        </div>

        <TableData<Attendance>
          queryKey={['attendances', searchQuery, filterDepartment, filterStatus]}
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
        />
      </div>

      {/* Modals Nghiệp Vụ */}
      <AddAttendanceModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['attendances'] });
          queryClient.invalidateQueries({ queryKey: ['attendances-stats'] });
          toast.success('Thêm thành công');
        }}
      />

      <EditAttendanceModal
        open={showEditModal}
        data={selectedRow}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['attendances'] });
          queryClient.invalidateQueries({ queryKey: ['attendances-stats'] });
        }}
      />

      <AttendanceDetailModal
        open={showDetailModal}
        data={selectedRow}
        onClose={() => setShowDetailModal(false)}
      />

      <AddAdjustmentModal
        open={showAdjustmentModal}
        onClose={() => setShowAdjustmentModal(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['attendances'] });
          queryClient.invalidateQueries({ queryKey: ['adjustment-requests'] });
          toast.success('Gửi khiếu nại thành công');
        }}
        data={selectedRow}
      />

      {/* Modal xác nhận xóa chấm công */}
      {selectedRow && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            if (isDeleting) return;
            setShowDeleteModal(false);
          }}
          title="Xác nhận xóa"
          size="sm"
          disabled={isDeleting}
          footer={
            <div className="flex items-center gap-3 w-full justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  if (isDeleting) return;
                  setShowDeleteModal(false);
                }}
                disabled={isDeleting}
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                loading={isDeleting}
              >
                Xác nhận
              </Button>
            </div>
          }
        >
          <p className="text-gray-600 text-sm">
            Bạn có chắc chắn muốn xóa bản ghi chấm công này? Hành động này không thể hoàn tác.
          </p>
        </Modal>
      )}
    </div>
  );
}