'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Briefcase, Plus, Search, Calendar, Pencil, Trash2, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button, Input, Modal, Badge } from '@/components';
import { deletePosition } from '@/actions';
import { getDepartmentPositions } from '@/actions/department/position';
import queryClient from '@/utils/query';
import type { Position } from '@/types';

import PositionFormModal from './form-modal';

interface DepartmentPositionsSectionProps {
  departmentId: number;
  onCountChange?: (count: number) => void;
}

export const DepartmentPositionsSection: React.FC<DepartmentPositionsSectionProps> = ({
  departmentId,
  onCountChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  // Modal Xóa vị trí
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);

  // Lấy danh sách vị trí của phòng ban
  const { data: positionsData, isLoading } = useQuery({
    queryKey: ['positions', departmentId, searchTerm],
    queryFn: async () => {
      const res = await getDepartmentPositions(departmentId, {
        limit: 100,
        search: searchTerm || undefined,
      });
      return res;
    },
    enabled: !!departmentId,
  });

  const positions: Position[] = positionsData?.items || positionsData?.data || [];
  const totalCount = positionsData?.pagination?.total ?? positions.length;

  React.useEffect(() => {
    if (onCountChange) {
      onCountChange(totalCount);
    }
  }, [totalCount, onCountChange]);

  // Mutation xóa vị trí
  const { mutate: handleDeletePosition, isPending: isDeleting } = useMutation({
    mutationFn: deletePosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success('Xóa vị trí thành công');
      setIsDeleteOpen(false);
      setPositionToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa vị trí');
    },
  });

  const handleOpenEdit = (position: Position) => {
    setSelectedPosition(position);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (position: Position) => {
    setPositionToDelete(position);
    setIsDeleteOpen(true);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex flex-col gap-4 h-[336px] w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900">Vị trí</h2>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="h-8 px-3 text-xs shrink-0"
          leftIcon={<Plus size={14} />}
          onClick={() => setIsAddOpen(true)}
        >
          Thêm vị trí
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full shrink-0">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <Input
          placeholder="Tìm kiếm vị trí..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9 pl-9 text-xs"
          fullWidth
        />
      </div>

      {/* List of Position Cards with 200px scroll area */}
      <div className="flex flex-col gap-2.5 h-[200px] overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="flex flex-col gap-2 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
            <div className="p-3 rounded-full bg-slate-100 text-slate-400 mb-2">
              <Layers size={22} />
            </div>
            <p className="text-sm font-medium text-slate-700">Chưa có vị trí nào</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {searchTerm
                ? 'Không tìm thấy vị trí khớp với từ khóa tìm kiếm'
                : 'Thêm vị trí công việc cho phòng ban để dễ dàng quản lý nhân sự'}
            </p>
          </div>
        ) : (
          positions.map((pos) => {
            const formattedDate = pos.createdAt
              ? new Date(pos.createdAt).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
              : '';

            return (
              <div
                key={pos.id}
                className="group p-2 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-2xs transition-all duration-200 flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900 break-words">
                        {pos.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    title="Sửa vị trí"
                    onClick={() => handleOpenEdit(pos)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    title="Xóa vị trí"
                    onClick={() => handleOpenDelete(pos)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Thêm mới vị trí */}
      <PositionFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Thêm vị trí mới"
        submitText="Xác nhận tạo"
      />

      {/* Modal Chỉnh sửa vị trí */}
      <PositionFormModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedPosition(null);
        }}
        title="Sửa vị trí"
        submitText="Xác nhận lưu"
        initialData={
          selectedPosition
            ? {
              id: Number(selectedPosition.id),
              name: selectedPosition.name,
            }
            : undefined
        }
      />

      {/* Modal Xác nhận xóa vị trí */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setPositionToDelete(null);
        }}
        title="Xác nhận xóa vị trí"
        className="m-2 max-w-md w-full"
      >
        <div className="flex gap-4 items-center py-2">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa vị trí{' '}
            <strong className="text-gray-900 font-semibold">{positionToDelete?.name}</strong>? Các
            nhân sự đang giữ vị trí này có thể bị ảnh hưởng.
          </p>
        </div>
        <div className="flex gap-3 justify-end w-full mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsDeleteOpen(false);
              setPositionToDelete(null);
            }}
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (positionToDelete) {
                handleDeletePosition(positionToDelete.id);
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

export default DepartmentPositionsSection;
