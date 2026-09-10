/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback, useMemo } from 'react';
import { RotateCw, Plus, Eye, Pencil, Trash2, Calendar, FileText, User } from 'lucide-react';
import { useLeaveRequestStore } from '@/stores/useLeaveRequestStore';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks';
import { TableData, TableAction, Button, Avatar, Badge } from '@/components';
import { getLeaveRequests } from '@/actions/leave-request';
import { getWorkShifts } from '@/actions/work-shift';
import { LeaveRequest, LeaveRequestStatus, DurationType } from '@/types';
import { BASE_MINIO_URL } from '@/config';
import { leaveTypeOptions, durationTypeOptions, statusConfig } from './leave-request-modal';

interface LeaveRequestTableProps {
  isManager: boolean;
  currentUserId?: string;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '---';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export default function LeaveRequestTable({ isManager, currentUserId }: LeaveRequestTableProps) {
  const queryClient = useQueryClient();

  const {
    setSelectedLeaveRequest,
    setDetailModalOpen,
    setCreateModalOpen,
    setIsDeleteConfirmOpen,
    resetFilters,
    isRefreshing,
    setIsRefreshing,
    tab,
    setTab,
    search,
    setSearch,
    leaveTypeFilter,
    setLeaveTypeFilter,
    fromDate,
    toDate,
    initEditForm,
  } = useLeaveRequestStore();

  // Debounced filters
  const debouncedSearch = useDebounce(search || '', 500);
  const debouncedTab = useDebounce(tab || 'all', 500);
  const debouncedLeaveType = useDebounce(leaveTypeFilter || '', 500);
  const debouncedFromDate = useDebounce(fromDate || '', 500);
  const debouncedToDate = useDebounce(toDate || '', 500);

  // Query work shifts to lookup shift name by id
  const { data: workShiftsData } = useQuery({
    queryKey: ['work-shifts-list'],
    queryFn: () => getWorkShifts({ limit: 100, status: 'active' }),
  });

  const workShiftsMap = useMemo(() => {
    const items = Array.isArray(workShiftsData) ? workShiftsData : workShiftsData?.items || [];
    const map = new Map<string, string>();
    items.forEach((shift: any) => {
      map.set(String(shift.id), shift.name);
    });
    return map;
  }, [workShiftsData]);

  const queryKey = ['leave-requests', debouncedSearch, debouncedTab, debouncedLeaveType, debouncedFromDate, debouncedToDate];

  const fetcher = useCallback(
    async ({ offset, limit }: { offset: number; limit: number }) => {
      try {
        const response = await getLeaveRequests({
          offset,
          limit,
          status: debouncedTab === 'all' ? undefined : debouncedTab,
          leaveType: debouncedLeaveType || undefined,
          fromDate: debouncedFromDate || undefined,
          toDate: debouncedToDate || undefined,
          search: debouncedSearch || undefined,
        });
        return response;
      } catch (err: any) {
        toast.error('Không thể tải danh sách đơn xin nghỉ phép.');
        throw err;
      }
    },
    [debouncedTab, debouncedLeaveType, debouncedFromDate, debouncedToDate, debouncedSearch],
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    resetFilters();
    queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
    queryClient.invalidateQueries({ queryKey: ['leave-requests-stats'] });
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Danh sách đã được làm mới!');
    }, 500);
  };

  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedLeaveRequest(request);
    setDetailModalOpen(true);
  };

  const columns = [
    {
      key: 'user',
      label: 'Người làm đơn',
      minWidth: '220px',
      cell: (row: LeaveRequest) => {
        const userName = row.user?.fullName || row.user?.username || 'Nhân viên';
        const userEmail = row.user?.email || row.userId;
        const avatar = row.user?.avatar;
        const avatarSrc = avatar
          ? avatar.startsWith('http')
            ? avatar
            : `${BASE_MINIO_URL}${avatar.startsWith('/') ? avatar : `/${avatar}`}`
          : undefined;

        return (
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar src={avatarSrc} name={userName} size="sm" />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-gray-900 text-sm truncate">{userName}</span>
              <span className="text-xs text-gray-500 truncate">{userEmail}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'leaveType',
      label: 'Loại nghỉ phép',
      minWidth: '150px',
      cell: (row: LeaveRequest) => {
        const typeInfo = leaveTypeOptions.find((t) => t.value === row.leaveType);
        return <span className="text-gray-600 text-sm">{typeInfo?.label || row.leaveType}</span>;
      },
    },
    {
      key: 'duration',
      label: 'Thời gian nghỉ',
      minWidth: '180px',
      cell: (row: LeaveRequest) => {
        const durationInfo = durationTypeOptions.find((d) => d.value === row.durationType);
        const isSingleDay = row.startDate === row.endDate;

        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-slate-700">
              {formatDate(row.startDate)} {!isSingleDay && `→ ${formatDate(row.endDate)}`}
            </span>
            <span className="text-xs text-slate-500">{durationInfo?.label || row.durationType}</span>
          </div>
        );
      },
    },
    {
      key: 'totalDays',
      label: 'Số ngày',
      minWidth: '100px',
      cell: (row: LeaveRequest) => {
        if (row.durationType === DurationType.CUSTOM_SHIFT || row.durationType === 'custom_shift') {
          const shiftId = row.workShiftId ?? (row as any).work_shift_id;
          const shiftName =
            (row as any).workShift?.name || (row as any).work_shift?.name || (shiftId ? workShiftsMap.get(String(shiftId)) : null) || 'Theo ca';
          return <span className="font-semibold text-sm text-primary">{shiftName}</span>;
        }
        return (
          <span className="font-semibold text-sm text-primary">
            {row.totalDays !== null && row.totalDays !== undefined ? `${row.totalDays} ngày` : '---'}
          </span>
        );
      },
    },
    {
      key: 'reason',
      label: 'Lý do xin nghỉ',
      minWidth: '220px',
      maxWidth: '320px',
      cell: (row: LeaveRequest) => (
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm text-slate-600 truncate block">{row.reason}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '155px',
      cell: (row: LeaveRequest) => {
        const statusInfo = statusConfig[row.status] || {
          label: row.status,
          class: 'bg-slate-100 text-slate-600 border-slate-200',
        };
        return (
          <span className={`inline-block px-2.5 py-1 rounded-full text-[12px] font-bold select-none border ${statusInfo.class}`}>
            {statusInfo.label}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '160px',
      cell: (row: LeaveRequest) => {
        const isProcessed = row.status !== LeaveRequestStatus.PENDING;
        const canDelete = isManager || row.userId === currentUserId;

        return (
          <TableAction
            items={[
              {
                title: 'Xem chi tiết',
                icon: Eye,
                size: 18,
                onClick: () => handleViewDetails(row),
              },
              {
                title: isProcessed ? 'Đơn đã xử lý (Không thể sửa)' : 'Chỉnh sửa',
                icon: Pencil,
                size: 18,
                disabled: isProcessed,
                className: isProcessed
                  ? 'text-gray-400 dark:text-gray-600 hover:text-gray-400 hover:bg-transparent cursor-not-allowed opacity-35 disabled:opacity-35'
                  : undefined,
                onClick: () => {
                  if (isProcessed) return;
                  initEditForm(row);
                },
              },
              (canDelete || isProcessed) && {
                title: isProcessed ? 'Đơn đã xử lý (Không thể xóa)' : 'Xóa',
                icon: Trash2,
                size: 18,
                disabled: isProcessed,
                className: isProcessed
                  ? 'text-gray-400 dark:text-gray-600 hover:text-gray-400 hover:bg-transparent cursor-not-allowed opacity-35 disabled:opacity-35'
                  : 'hover:text-red-600 hover:bg-red-50',
                onClick: () => {
                  if (isProcessed) return;
                  setSelectedLeaveRequest(row);
                  setIsDeleteConfirmOpen(true);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const renderCard = (row: LeaveRequest, index: number) => {
    const status = statusConfig[row.status] || {
      label: row.status,
      badgeVariant: 'default' as const,
      class: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    const typeInfo = leaveTypeOptions.find((t) => t.value === row.leaveType);
    const userName = row.user?.fullName || row.user?.username || 'Nhân viên';
    const senderEmail = row.user?.email ? `(${row.user.email})` : '';
    const senderDisplayName = `${userName} ${senderEmail}`.trim();
    const isOwner = row.userId === currentUserId;
    const canEdit = (isOwner || isManager) && row.status === LeaveRequestStatus.PENDING;
    const canDelete = (isOwner || isManager) && (row.status === LeaveRequestStatus.PENDING || row.status === LeaveRequestStatus.CANCELLED);
    const avatar = row.user?.avatar;
    const avatarSrc = avatar
      ? avatar.startsWith('http')
        ? avatar
        : `${BASE_MINIO_URL}${avatar.startsWith('/') ? avatar : `/${avatar}`}`
      : undefined;

    const shiftId = row.workShiftId ?? (row as any).work_shift_id;
    const shiftName =
      (row as any).workShift?.name || (row as any).work_shift?.name || (shiftId ? workShiftsMap.get(String(shiftId)) : null) || 'Theo ca';
    const totalDaysText =
      row.durationType === DurationType.CUSTOM_SHIFT || row.durationType === 'custom_shift'
        ? shiftName
        : row.totalDays !== null && row.totalDays !== undefined
          ? `${row.totalDays} ngày`
          : '';

    const isSingleDay = row.startDate === row.endDate;
    const dateRangeStr = `${formatDate(row.startDate)} ${!isSingleDay ? `→ ${formatDate(row.endDate)}` : ''}`;

    const date = row.createdAt ? new Date(row.createdAt) : null;
    const timeStr = date ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';

    const today = new Date();
    const isToday = date
      ? date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
      : false;

    const dateStr = date ? (isToday ? 'Hôm nay' : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })) : 'N/A';

    return (
      <div
        key={row.id || index}
        onClick={() => handleViewDetails(row)}
        className="p-4 rounded-xl border border-primary/10 bg-white flex flex-col gap-3 shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer"
      >
        {/* Header: Thời gian nghỉ, Phân loại & Trạng thái */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#101718] text-sm leading-tight break-words">{dateRangeStr}</span>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 bg-cyan-50 text-cyan-700 border-cyan-100">
                {typeInfo?.label || row.leaveType}
              </span>
              {totalDaysText && (
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 bg-slate-50 text-slate-600 border-slate-200">
                  {totalDaysText}
                </span>
              )}
            </div>
          </div>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${status.class}`}>{status.label}</span>
        </div>

        {/* Nội dung lý do xin nghỉ */}
        {row.reason && <p className="text-[12px] text-[#5E858D] font-normal line-clamp-2 leading-relaxed">{row.reason}</p>}

        {/* Footer: Thông tin người gửi, Thời gian & Các nút thao tác */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100/50">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {avatarSrc ? (
              <div className="relative w-6 h-6 rounded-full overflow-hidden border border-slate-200 shrink-0">
                <img src={avatarSrc} alt={userName} width={24} height={24} className="object-cover w-full h-full" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-cyan-50 shrink-0 flex items-center justify-center text-cyan-700 border border-cyan-100/50">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-slate-700 text-[11px] truncate">{senderDisplayName}</span>
              <span className="text-[10px] text-[#5E858D]">
                {timeStr} • {dateStr}
              </span>
            </div>
          </div>

          {/* Các nút hành động */}
          <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            {canEdit && (
              <button
                type="button"
                onClick={() => initEditForm(row)}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Pencil size={12} />
                Sửa
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() => {
                  setSelectedLeaveRequest(row);
                  setIsDeleteConfirmOpen(true);
                }}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-50/50 text-red-600 border border-red-100 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={12} />
                Hủy
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header Actions */}
      <div className="flex justify-end items-center gap-3 w-full">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="px-2.5 lg:px-3 gap-0 lg:gap-2"
        >
          <span className="hidden lg:inline">Tạo đơn nghỉ phép</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="p-2 h-9 w-9 shrink-0 flex items-center justify-center rounded-lg hover:bg-slate-50"
        >
          <RotateCw className={`w-4 h-4 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Table Data */}
      <TableData<LeaveRequest>
        queryKey={queryKey}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        select={false}
        search={{
          placeholder: 'Tìm kiếm theo lý do hoặc nhân viên...',
          value: search || '',
          onChange: setSearch,
          className: 'min-w-[320px]',
        }}
        filters={[
          {
            label: 'Trạng thái',
            value: tab === 'all' ? undefined : tab,
            onChange: (val) => setTab(val || 'all'),
            options: [
              { value: undefined, label: 'Tất cả trạng thái' },
              { value: LeaveRequestStatus.PENDING, label: 'Đang chờ duyệt' },
              { value: LeaveRequestStatus.APPROVED, label: 'Đã phê duyệt' },
              { value: LeaveRequestStatus.REJECTED, label: 'Bị từ chối' },
              { value: LeaveRequestStatus.CANCELLED, label: 'Đã hủy' },
            ],
            className: 'w-44',
          },
          {
            label: 'Loại nghỉ phép',
            value: leaveTypeFilter,
            onChange: setLeaveTypeFilter,
            options: [
              { value: undefined, label: 'Tất cả loại nghỉ phép' },
              ...leaveTypeOptions.map((opt) => ({ value: opt.value, label: opt.label })),
            ],
            className: 'w-44',
          },
        ]}
      />
    </div>
  );
}
