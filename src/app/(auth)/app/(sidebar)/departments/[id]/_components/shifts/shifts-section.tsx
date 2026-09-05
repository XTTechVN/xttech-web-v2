'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  CalendarClock,
  Plus,
  Search,
  Clock,
  MapPin,
  Pencil,
  Trash2,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button, Input, Modal, Badge } from '@/components';
import { deleteWorkShift, getWorkShifts } from '@/actions';
import queryClient from '@/utils/query';
import type { WorkShift } from '@/types';

import { ShiftFormModal } from '@/app/(auth)/app/(sidebar)/shifts/_components/form-modal';

interface DepartmentShiftsSectionProps {
  departmentId: number; 
  onCountChange?: (count: number) => void;
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

export const DepartmentShiftsSection: React.FC<DepartmentShiftsSectionProps> = ({
  departmentId,
  onCountChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<WorkShift | null>(null);

  // Modal Xóa ca
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<WorkShift | null>(null);

  // Lấy danh sách ca làm việc của phòng ban
  const { data: shiftsData, isLoading } = useQuery({
    queryKey: ['work_shifts', departmentId, searchTerm],
    queryFn: async () => {
      const res = await getWorkShifts({
        departmentId: departmentId,
        search: searchTerm || undefined,
        limit: 100,
      });
      return res;
    },
    enabled: !!departmentId,
  });

  const shifts: WorkShift[] = shiftsData?.items || [];
  const totalCount = shiftsData?.meta?.total ?? shifts.length;

  React.useEffect(() => {
    if (onCountChange) {
      onCountChange(totalCount);
    }
  }, [totalCount, onCountChange]);

  // Mutation xóa ca làm việc
  const { mutate: handleDeleteShift, isPending: isDeleting } = useMutation({
    mutationFn: deleteWorkShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_shifts'] });
      toast.success('Xóa ca làm việc thành công');
      setIsDeleteOpen(false);
      setShiftToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa ca làm việc');
    },
  });

  const handleOpenEdit = (shift: WorkShift) => {
    setSelectedShift(shift);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (shift: WorkShift) => {
    setShiftToDelete(shift);
    setIsDeleteOpen(true);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex flex-col gap-4 h-[336px] w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900">Ca làm việc</h2>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="h-8 px-3 text-xs shrink-0"
          leftIcon={<Plus size={14} />}
          onClick={() => setIsAddOpen(true)}
        >
          Thêm ca làm việc
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full shrink-0">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <Input
          placeholder="Tìm kiếm ca làm việc theo tên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9 pl-9 text-xs"
          fullWidth
        />
      </div>

      {/* List of Shifts Cards with 200px scroll area */}
      <div className="flex flex-col gap-2.5 h-[200px] overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : shifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
            <div className="p-3 rounded-full bg-slate-100 text-slate-400 mb-2">
              <Layers size={22} />
            </div>
            <p className="text-sm font-medium text-slate-700">Chưa có ca làm việc nào</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {searchTerm
                ? 'Không tìm thấy ca làm việc khớp với từ khóa tìm kiếm'
                : 'Thêm ca làm việc để thiết lập lịch trình và chấm công cho phòng ban'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {shifts.map((shift) => {
              const sType = shift.shiftType || shift.shift_type || '';
              const typeInfo = SHIFT_TYPE_BADGES[sType] || {
                label: sType || 'Khác',
                variant: 'default',
              };

              const startTime = (shift.startTime || shift.start_time || '--:--').slice(0, 5);
              const endTime = (shift.endTime || shift.end_time || '--:--').slice(0, 5);

              const workDays = (shift.workDays || shift.work_days || '')
                .split(',')
                .map((d) => d.trim())
                .filter(Boolean);

              const latitude = shift.workLatitude ?? shift.work_latitude;
              const longitude = shift.workLongitude ?? shift.work_longitude;
              const allowedDistance = shift.allowedDistance ?? shift.allowed_distance ?? 200;

              const exceptions =
                shift.exceptions ||
                shift.workShiftExceptions ||
                shift.workShiftException ||
                shift.work_shift_exceptions ||
                shift.work_shift_exception ||
                [];

              return (
                <div
                  key={shift.id}
                  className="group p-3 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-2xs transition-all duration-200 flex flex-col justify-between gap-2.5"
                >
                  {/* Top: Name & Badges */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-sm text-slate-900 line-clamp-1">
                        {shift.name}
                      </span>
                      <Badge variant={shift.status === 'active' ? 'success' : 'default'} size="sm">
                        {shift.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
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

                  {/* Middle: Time & Days */}
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                      <Clock size={13} className="text-slate-400 shrink-0" />
                      <span>
                        {startTime} - {endTime}
                      </span>
                    </div>

                    {/* Days */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {workDays.length > 0 ? (
                        workDays.map((d) => (
                          <span
                            key={d}
                            className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {DAY_LABELS[d] || d}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Chưa chọn ngày</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: GPS & Actions */}
                  <div className="flex items-center justify-between gap-2 text-[11px] pt-2 border-t border-slate-100/70 text-slate-500">
                    {latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined ? (
                      <div className="flex items-center gap-1 text-emerald-600 font-medium">
                        <MapPin size={12} className="shrink-0" />
                        <span>≤ {allowedDistance}m</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Không GPS</span>
                    )}

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="Sửa ca làm việc"
                        onClick={() => handleOpenEdit(shift)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-colors cursor-pointer"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        title="Xóa ca làm việc"
                        onClick={() => handleOpenDelete(shift)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Thêm ca làm việc */}
      <ShiftFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Thêm ca làm việc mới"
        submitText="Xác nhận tạo"
        defaultDepartmentId={departmentId}
      />

      {/* Modal Sửa ca làm việc */}
      <ShiftFormModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedShift(null);
        }}
        title="Sửa ca làm việc"
        submitText="Xác nhận lưu"
        initialData={selectedShift}
        defaultDepartmentId={departmentId}
      />

      {/* Modal Xác nhận xóa ca làm việc */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setShiftToDelete(null);
        }}
        title="Xác nhận xóa ca làm việc"
        className="m-2 max-w-md w-full"
      >
        <div className="flex gap-4 items-center py-2">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa ca làm việc{' '}
            <strong className="text-gray-900 font-semibold">{shiftToDelete?.name}</strong>?
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
                handleDeleteShift(shiftToDelete.id);
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

export default DepartmentShiftsSection;
