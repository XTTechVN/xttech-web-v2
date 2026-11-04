'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Search, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button, Input, Modal } from '@/components';
import { deleteWorkShift, getWorkShifts } from '@/actions';
import queryClient from '@/utils/query';
import type { WorkShift } from '@/types';

import { ShiftCard } from './shift-card';
import { ShiftFormModal } from './modals/shift-form-modal';

interface DepartmentShiftsSectionProps {
  departmentId: number;
  onCountChange?: (count: number) => void;
}

export const DepartmentShiftsSection: React.FC<DepartmentShiftsSectionProps> = ({
  departmentId,
  onCountChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<WorkShift | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<WorkShift | null>(null);

  const { data: shiftsData, isLoading } = useQuery({
    queryKey: ['work_shifts', departmentId, searchTerm],
    queryFn: async () => {
      const res = await getWorkShifts({
        departmentId,
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

  const { mutate: handleDeleteShift, isPending: isDeleting } = useMutation({
    mutationFn: deleteWorkShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_shifts'] });
      toast.success('Xóa ca làm việc thành công');
      setIsDeleteOpen(false);
      setShiftToDelete(null);
    },
    onError: (error: Error) => {
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
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
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
              <div
                key={i}
                className="h-32 bg-slate-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : shifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
            <div className="p-3 rounded-full bg-slate-100 text-slate-400 mb-2">
              <Layers size={22} />
            </div>
            <p className="text-sm font-medium text-slate-700">
              Chưa có ca làm việc nào
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {searchTerm
                ? 'Không tìm thấy ca làm việc khớp với từ khóa tìm kiếm'
                : 'Thêm ca làm việc để thiết lập lịch trình và chấm công cho phòng ban'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {shifts.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
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
            <strong className="text-gray-900 font-semibold">
              {shiftToDelete?.name}
            </strong>
            ?
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
