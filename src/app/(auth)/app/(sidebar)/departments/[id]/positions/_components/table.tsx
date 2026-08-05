'use client';

import React from 'react';

// Icons thư viện lucide-react
import { Building2, Pencil, Trash2, PlusCircle } from 'lucide-react';

// Thành phần dùng chung cho toàn bộ trang
import { TableData } from '@/components/table';
import { Heading, Modal, Button } from '@/components';
import { useQueryParam } from '@/hooks';

// Kiểu dữ liệu phòng ban
import { Department } from '@/types';

// Store
import { useParams, useSearchParams } from 'next/navigation';

import { getDepartmentPositions } from '@/actions/department/position';

import PositionFormModal from './form-modal';

// toast
import toast from 'react-hot-toast';

import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import { deleteDepartment } from '@/actions/department';

import { Position } from '@/types';

const Table = () => {
  const params = useParams()
  console.log(params)
  const searchParams = useSearchParams();
  const offset = Number(searchParams.get('offset') || 0);
  const [search, setSearch] = useQueryParam('search');

  // Trạng thái cho modal sửa vị trí
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [selectedPosition, setSelectedPosition] = React.useState<Position | null>(null);

  // Trạng thái cho modal xóa vị trí
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [positionToDelete, setPositionToDelete] = React.useState<Position | null>(null);

  const departmentId = Number(params.id);

  // Hàm fetcher gọi API thực tế từ Store
  const fetcher = async () => {
    const res = await getDepartmentPositions(departmentId);
    if (!res) {
      toast.error('Lỗi khi tải danh sách vị trí');
      throw new Error('Lỗi khi tải danh sách vị trí');
    }
    return {
      items: res.items || [],
      meta: {
        total: res.pagination.total || 0,
        offset: res.pagination.offset || 0,
        limit: res.pagination.limit || 10,
        next: res.pagination.next || false,
      },
    };
  };

  // tạo hàm xóa phòng ban
  const { mutate: deletDepartmentm, isPending } = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Xóa phòng ban thành công');
      setIsDeleteOpen(false);
      setDeptToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Cấu hình các cột cho Desktop
  const columns = [
    { key: 'id', label: 'STT', minWidth: '80px', cell: (row: Position) => <span className="text-slate-500 font-medium">{row.id}</span> },
    {
      key: 'code',
      label: 'Mã vị trí',
      cell: (row: Position) => <span className="text-slate-500 font-medium">{row.id}</span>,
    },
    {
      key: 'name',
      label: 'Tên vị trí',
      minWidth: '250px',
      cell: (row: Position) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '150px',
      cell: (row: Position) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedPosition(row);
              setIsEditOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all border border-transparent hover:border-primary/10"
          >
            <Pencil size={18} />
          </button>

          <button
            onClick={() => {
              setPositionToDelete(row);
              setIsDeleteOpen(true);
            }}
            disabled={isPending}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  // Cấu hình Card hiển thị trên thiết bị di động
  const renderCard = (row: Position, index: number) => (
    <div
      key={row.id || index}
      className="p-4 rounded-xl border border-gray-150 bg-white flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.name}</span>
          <span className="text-xs text-gray-400">ID: {row.id}</span>
          <span className="text-xs text-gray-500 mt-1">
            Ngày tạo:{' '}
            {new Date(row.createdAt).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            setSelectedPosition(row);
            setIsEditOpen(true);
          }}
          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all border border-transparent hover:border-primary/10"
        >
          <Pencil size={18} />
        </button>

        <button
          onClick={() => {
            setPositionToDelete(row);
            setIsDeleteOpen(true);
          }}
          disabled={isPending}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <Heading className="text-primary pr-2 pt-2 text-2xl" size="h1">
        Danh sách vị trí
      </Heading>
      <TableData<Position>
        queryKey={['positions',departmentId, search]}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        select={false}
        search={{
          placeholder: 'Tìm kiếm vị trí...',
          value: search,
          onChange: setSearch,
          className: 'w-80',
        }}
      />

      {/* Modal Sửa phòng ban */}
      <PositionFormModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedPosition(null);
        }}
        title="Sửa vị trí"
        submitText="Xác nhận lưu"
        initialData={
          selectedPosition
            ? {
                id: Number(selectedPosition.id),
                name: selectedPosition.name,
                code: selectedPosition.id.toString(), // Position doesn't have code in type currently, using id as fallback
              }
            : undefined
        }
      />

      {/* Modal Xác nhận xóa phòng ban */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setPositionToDelete(null);
        }}
        title="Xác nhận xóa phòng ban"
        className="m-2 max-w-md w-full"
      >
        <div className="flex gap-4 items-center py-2">
          <div className="flex flex-col gap-1.5">
            <p className="text-gray-600 text-sm leading-relaxed">
              Bạn có chắc chắn muốn xóa vị trí <strong className="text-gray-900 font-semibold">{positionToDelete?.name}</strong>
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end w-full mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsDeleteOpen(false);
              setPositionToDelete(null);
            }}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (positionToDelete) {
                deletDepartmentm(positionToDelete.id);
              }
            }}
            loading={isPending}
          >
            Xác nhận xóa
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Table;
