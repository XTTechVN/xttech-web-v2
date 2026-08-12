'use client';

import React from 'react';

// Icons thư viện lucide-react
import { Pencil, Trash2 } from 'lucide-react';

// Thành phần dùng chung cho toàn bộ trang
import { TableData } from '@/components/table';
import TableAction from '@/components/table/table-action';
import { Modal, Button } from '@/components';

// Thành phần dùng riêng cho trang vị trí
import PositionFormModal from './form-modal';

// Thông báo toast
import toast from 'react-hot-toast';

// Hook điều hướng
import { useParams, useSearchParams } from 'next/navigation';

import { useQueryParam } from '@/hooks';
import { useMutation } from '@tanstack/react-query';

// Hàm tiện ích
import queryClient from '@/utils/query';

// Gọi hàm lấy dữ liệu vị trí và xóa vị trí từ action
import { deletePosition } from '@/actions';
import { getDepartmentPositions } from '@/actions/department/position';

// Kiểu dữ liệu cho vị trí
import { Position } from '@/types';

const Table = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const offset = Number(searchParams.get('offset') || 0);
  const [search, setSearch] = useQueryParam('search');

  // Trạng thái cho modal sửa vị trí
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [selectedPosition, setSelectedPosition] = React.useState<Position | null>(null);

  // Trạng thái cho modal xóa vị trí
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [positionToDelete, setPositionToDelete] = React.useState<Position | null>(null);

  // Id phòng ban
  const departmentId = Number(params.id);

  // Lấy danh sách vị trí
  const fetcher = async (params: { offset: number; limit: number }) => {
    const res = await getDepartmentPositions(departmentId, {
      ...params,
      search: search || undefined,
    });
    if (!res) {
      toast.error('Lỗi khi tải danh sách vị trí');
      throw new Error('Lỗi khi tải danh sách vị trí');
    }
    return {
      items: Array.isArray(res) ? res : (res?.items || []),
      meta: {
        total: res?.pagination?.total || (Array.isArray(res) ? res.length : 0),
        offset: res?.pagination?.offset || 0,
        limit: res?.pagination?.limit || 10,
        next: res?.pagination?.next || false,
      },
    };
  };

  // Hàm xóa vị trí
  const { mutate: deleteMutation, isPending } = useMutation({
    mutationFn: deletePosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success('Xóa vị trí thành công');
      setIsDeleteOpen(false);
      setPositionToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Cấu hình các cột vị trí cho desktop
  const columns = [
    {
      key: 'index',
      label: 'STT',
      width: '100px',
      cell: (row: Position, index: number) => <span>{index + 1}</span>,
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
      key: 'createdAt',
      label: 'Ngày tạo',
      minWidth: '150px',
      cell: (row: Position) => (
        <span className="text-slate-500">
          {new Date(row.createdAt).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '150px',
      cell: (row: Position) => (
        <TableAction
          onEdit={() => {
            setSelectedPosition(row);
            setIsEditOpen(true);
          }}
          onDelete={() => {
            setPositionToDelete(row);
            setIsDeleteOpen(true);
          }}
        />
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
      <TableAction
        onEdit={() => {
          setSelectedPosition(row);
          setIsEditOpen(true);
        }}
        onDelete={() => {
          setPositionToDelete(row);
          setIsDeleteOpen(true);
        }}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <TableData<Position>
        queryKey={['positions', departmentId, search]}
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

      {/* Modal Sửa vị trí */}
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

      {/* Modal Xác nhận xóa vị trí */}
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
                deleteMutation(positionToDelete.id);
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
