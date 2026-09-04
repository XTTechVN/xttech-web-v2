'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Clock, MapPin, Building2, Layers, CheckCircle2, Pencil, Trash2 } from 'lucide-react';

import { TableData, TableAction } from '@/components/table';
import type { ITableFilterProps } from '@/components/table/types';
import { Modal, Button, Badge } from '@/components';
import { deleteWorkShift, getWorkShifts, getDepartments } from '@/actions';
import queryClient from '@/utils/query';
import { useQueryParam } from '@/hooks';
import type { WorkShift, Department } from '@/types';

import ShiftFormModal from './form-modal';

interface ShiftTableProps {
  departmentId?: number;
}

const DAY_LABELS: Record<string, string> = {
  '2': 'T2',
  '3': 'T3',
  '4': 'T4',
  '5': 'T5',
  '6': 'T6',
  '7': 'T7',
  '8': 'CN',
};

const SHIFT_TYPE_BADGES: Record<string, { label: string; variant: 'primary' | 'warning' | 'info' | 'success' | 'default' }> = {
  morning: { label: 'Ca sáng', variant: 'warning' },
  afternoon: { label: 'Ca chiều', variant: 'info' },
  full_day: { label: 'Hành chính', variant: 'primary' },
  night: { label: 'Ca đêm', variant: 'default' },
};

export const ShiftTable: React.FC<ShiftTableProps> = ({ departmentId }) => {
  const [search, setSearch] = useQueryParam('search');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('');
  const [selectedShiftType, setSelectedShiftType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Modal Sửa
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<WorkShift | null>(null);

  // Modal Xóa
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<WorkShift | null>(null);

  // Lấy danh sách phòng ban cho filter nếu ở trang tổng
  const { data: departmentsData } = useQuery({
    queryKey: ['departments', 'filter-list'],
    queryFn: () => getDepartments({ limit: 100 }),
    enabled: !departmentId,
  });

  const departmentList: Department[] = departmentsData?.items || [];
  const departmentMap = React.useMemo(() => {
    const map = new Map<number, string>();
    departmentList.forEach((d) => map.set(d.id, d.name));
    return map;
  }, [departmentList]);

  // Fetcher cho TableData
  const fetcher = async (params: { offset: number; limit: number }) => {
    const queryDept = departmentId || (selectedDeptFilter ? Number(selectedDeptFilter) : undefined);
    const res = await getWorkShifts({
      ...params,
      search: search || undefined,
      departmentId: queryDept,
      shiftType: selectedShiftType || undefined,
      status: selectedStatus || undefined,
    });

    if (!res) {
      toast.error('Lỗi khi tải danh sách ca làm việc');
      throw new Error('Lỗi khi tải danh sách ca làm việc');
    }

    return {
      items: res.items || [],
      meta: {
        total: res.meta?.total || 0,
        offset: res.meta?.offset || 0,
        limit: res.meta?.limit || 10,
        next: res.meta?.next || false,
      },
    };
  };

  // Mutation xóa ca làm việc
  const { mutate: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteWorkShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_shifts'] });
      toast.success('Xóa ca làm việc thành công');
      setIsDeleteOpen(false);
      setShiftToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Lỗi khi xóa ca làm việc');
    },
  });

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '--:--';
    return timeStr.slice(0, 5);
  };

  const getShiftType = (row: WorkShift) => {
    return row.shiftType || row.shift_type || '';
  };

  const getWorkDays = (row: WorkShift) => {
    return row.workDays || row.work_days || '';
  };

  const getStartTime = (row: WorkShift) => {
    return row.startTime || row.start_time || '';
  };

  const getEndTime = (row: WorkShift) => {
    return row.endTime || row.end_time || '';
  };

  const getLatitude = (row: WorkShift) => {
    return row.workLatitude ?? row.work_latitude;
  };

  const getLongitude = (row: WorkShift) => {
    return row.workLongitude ?? row.work_longitude;
  };

  const getAllowedDistance = (row: WorkShift) => {
    return row.allowedDistance ?? row.allowed_distance ?? 200;
  };

  const getExceptions = (row: WorkShift) => {
    return (
      row.exceptions ||
      row.workShiftExceptions ||
      row.workShiftException ||
      row.work_shift_exceptions ||
      row.work_shift_exception ||
      []
    );
  };

  const getDepartmentId = (row: WorkShift) => {
    return row.departmentId ?? row.department_id;
  };

  const renderDaysBadge = (workDays?: string) => {
    if (!workDays) return <span className="text-gray-400 text-xs">Chưa cấu hình</span>;
    const days = workDays.split(',').map((d) => d.trim());
    return (
      <div className="flex flex-wrap gap-1">
        {days.map((d) => (
          <span
            key={d}
            className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
          >
            {DAY_LABELS[d] || d}
          </span>
        ))}
      </div>
    );
  };

  // Cấu hình các cột cho Desktop
  const columns: any[] = [
    {
      key: 'index',
      label: 'STT',
      width: '60px',
      cell: (_row: WorkShift, index: number) => <span className="text-slate-500">{index + 1}</span>,
    },
    {
      key: 'name',
      label: 'Tên ca & Loại ca',
      minWidth: '220px',
      cell: (row: WorkShift) => {
        const sType = getShiftType(row);
        const typeInfo = SHIFT_TYPE_BADGES[sType] || {
          label: sType || 'Khác',
          variant: 'default',
        };
        const exceptions = getExceptions(row);
        return (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-gray-900">{row.name}</span>
            <div className="flex items-center gap-2">
              <Badge variant={typeInfo.variant} size="sm">
                {typeInfo.label}
              </Badge>
              {exceptions.length > 0 && (
                <Badge variant="warning" size="sm">
                  {exceptions.length} ngoại lệ
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'time',
      label: 'Khung giờ',
      minWidth: '160px',
      cell: (row: WorkShift) => (
        <div className="flex items-center gap-1.5 text-slate-800 font-medium text-sm">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            {formatTime(getStartTime(row))} - {formatTime(getEndTime(row))}
          </span>
        </div>
      ),
    },
    {
      key: 'work_days',
      label: 'Ngày làm việc',
      minWidth: '180px',
      cell: (row: WorkShift) => renderDaysBadge(getWorkDays(row)),
    },
  ];

  // Chỉ hiện cột phòng ban nếu đang ở trang toàn công ty
  if (!departmentId) {
    columns.push({
      key: 'department',
      label: 'Phòng ban',
      minWidth: '160px',
      cell: (row: WorkShift) => {
        const deptId = getDepartmentId(row);
        const deptName = row.department?.name || (deptId ? departmentMap.get(deptId) : null);
        return (
          <span className="text-slate-700 text-sm">
            {deptName || <span className="text-gray-400 italic">Toàn công ty</span>}
          </span>
        );
      },
    });
  }

  columns.push(
    {
      key: 'gps',
      label: 'GPS & Bán kính',
      minWidth: '140px',
      cell: (row: WorkShift) => {
        const lat = getLatitude(row);
        const lng = getLongitude(row);
        if (lat !== null && lat !== undefined && lng !== null && lng !== undefined) {
          return (
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>≤ {getAllowedDistance(row)}m</span>
            </div>
          );
        }
        return <span className="text-gray-400 text-xs">Không GPS</span>;
      },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '130px',
      cell: (row: WorkShift) => (
        <Badge variant={row.status === 'active' ? 'success' : 'default'} size="sm">
          {row.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '100px',
      cell: (row: WorkShift) => (
        <TableAction
          onEdit={() => {
            setSelectedShift(row);
            setIsEditOpen(true);
          }}
          onDelete={() => {
            setShiftToDelete(row);
            setIsDeleteOpen(true);
          }}
        />
      ),
    },
  );

  // Cấu hình Card hiển thị Mobile
  const renderCard = (row: WorkShift, index: number) => {
    const sType = getShiftType(row);
    const typeInfo = SHIFT_TYPE_BADGES[sType] || {
      label: sType || 'Khác',
      variant: 'default',
    };
    return (
      <div
        key={row.id || index}
        className="p-4 rounded-xl border border-primary/10 bg-white flex flex-col gap-3 shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300"
      >
        <div className="flex items-start gap-3 justify-between">
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-semibold text-gray-900 text-sm sm:text-base leading-snug break-words">{row.name}</span>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant={typeInfo.variant} size="sm">
                {typeInfo.label}
              </Badge>
              <Badge variant={row.status === 'active' ? 'success' : 'default'} size="sm">
                {row.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-700">
          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-medium">
            {formatTime(getStartTime(row))} - {formatTime(getEndTime(row))}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-gray-100/50 pt-2.5">
          <div className="flex-1 min-w-0">{renderDaysBadge(getWorkDays(row))}</div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedShift(row);
                setIsEditOpen(true);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Pencil size={12} />
              Sửa
            </button>
            <button
              type="button"
              onClick={() => {
                setShiftToDelete(row);
                setIsDeleteOpen(true);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-50/50 text-red-600 border border-red-100 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={12} />
              Xóa
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Cấu hình bộ lọc của TableData
  const tableFilters: ITableFilterProps[] = [];

  // 1. Lọc theo Phòng ban (khi ở trang tổng /shifts)
  if (!departmentId && departmentList.length > 0) {
    tableFilters.push({
      label: 'Phòng ban',
      placeholder: 'Tất cả phòng ban',
      value: selectedDeptFilter || undefined,
      onChange: (val) => setSelectedDeptFilter(val || ''),
      icon: <Building2 className="w-4 h-4" />,
      options: [
        { value: undefined, label: 'Tất cả phòng ban' },
        ...departmentList.map((d) => ({
          value: String(d.id),
          label: d.name,
        })),
      ],
    });
  }

  // 2. Lọc theo Loại ca làm việc
  tableFilters.push({
    label: 'Loại ca',
    placeholder: 'Tất cả loại ca',
    value: selectedShiftType || undefined,
    onChange: (val) => setSelectedShiftType(val || ''),
    icon: <Layers className="w-4 h-4" />,
    options: [
      { value: undefined, label: 'Tất cả loại ca' },
      { value: 'morning', label: 'Ca sáng' },
      { value: 'afternoon', label: 'Ca chiều' },
      { value: 'full_day', label: 'Hành chính (Cả ngày)' },
      { value: 'night', label: 'Ca đêm' },
    ],
  });

  // 3. Lọc theo Trạng thái
  tableFilters.push({
    label: 'Trạng thái',
    placeholder: 'Tất cả trạng thái',
    value: selectedStatus || undefined,
    onChange: (val) => setSelectedStatus(val || ''),
    icon: <CheckCircle2 className="w-4 h-4" />,
    options: [
      { value: undefined, label: 'Tất cả trạng thái' },
      { value: 'active', label: 'Hoạt động' },
      { value: 'inactive', label: 'Tạm dừng' },
    ],
  });

  return (
    <div className="flex flex-col gap-3">
      <TableData<WorkShift>
        queryKey={['work_shifts', departmentId, selectedDeptFilter, selectedShiftType, selectedStatus, search]}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        filters={tableFilters}
        select={false}
        search={{
          placeholder: 'Tìm kiếm ca làm việc...',
          value: search,
          onChange: setSearch,
          className: 'w-80',
        }}
      />

      {/* Modal Sửa ca làm việc */}
      <ShiftFormModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedShift(null);
        }}
        title="Chỉnh sửa ca làm việc"
        submitText="Lưu thay đổi"
        initialData={selectedShift}
        defaultDepartmentId={departmentId}
      />

      {/* Modal Xác nhận xóa */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setShiftToDelete(null);
        }}
        title="Xác nhận xóa ca làm việc"
        className="m-2 max-w-md w-full"
      >
        <div className="py-2">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa ca làm việc{' '}
            <strong className="text-gray-900 font-semibold">{shiftToDelete?.name}</strong>? Các cấu hình lịch và ngoại lệ liên quan sẽ bị xóa theo.
          </p>
        </div>
        <div className="flex gap-3 justify-end w-full mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsDeleteOpen(false);
              setShiftToDelete(null);
            }}
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (shiftToDelete) {
                deleteMutation(shiftToDelete.id);
              }
            }}
            loading={isDeleting}
          >
            Xác nhận xóa
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ShiftTable;
