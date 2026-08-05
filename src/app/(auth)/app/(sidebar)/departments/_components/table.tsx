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
// Store
import { useSearchParams } from 'next/navigation';
import { useDapartmentStore } from '@/stores';
import DepartmentFormModal from './form-modal';

// toast
import toast from 'react-hot-toast';

import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import { deleteDepartment } from '@/actions/department';
import PositionPage from '../positions/page';

// Component hiển thị Badge Icon đẹp mắt
const IconBadge = ({ iconName, color }: { iconName: string; color: string }) => {
  const IconComponent = Building2;
  return (
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-200 hover:scale-105"
      style={{
        backgroundColor: `${color}15`,
        borderColor: `${color}30`,
        color: color,
      }}
    >
      <IconComponent size={18} />
    </div>
  );
};

const Table = () => {
  const searchParams = useSearchParams();
  const offset = Number(searchParams.get('offset') || 0);
  const [search, setSearch] = useQueryParam('search');

  // Trạng thái cho modal sửa phòng ban
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [selectedDept, setSelectedDept] = React.useState<Department | null>(null);

  // Trạng thái cho modal xóa phòng ban
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [deptToDelete, setDeptToDelete] = React.useState<Department | null>(null);

  // Trạng thái cho modal quản lý vị trí
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [deptToCreate, setDeptToCreate] = React.useState<Department | null>(null);

  // Lấy hàm fetch danh sách phòng ban từ store
  const { fetchDepartments } = useDapartmentStore();

  // Hàm fetcher gọi API thực tế từ Store
  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    const res = await fetchDepartments({ offset, limit, search: search || undefined });
    if (!res) {
      toast.error('Lỗi khi tải danh sách phòng ban');
      throw new Error('Lỗi khi tải danh sách phòng ban');
    }
    return res;
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
    {
      key: 'code',
      label: 'Mã phòng ban',
      cell: (row: Department) => <span className="text-slate-500 font-medium">{row.code}</span>,
    },
    {
      key: 'name',
      label: 'Tên phòng ban',
      minWidth: '250px',
      cell: (row: Department) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      minWidth: '180px',
      cell: (row: Department) => (
        <span className="text-gray-600 text-sm">
          {new Date(row.createdAt).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '150px',
      cell: (row: Department) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedDept(row);
              setIsEditOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all border border-transparent hover:border-primary/10"
          >
            <Pencil size={18} />
          </button>

          <button
            onClick={() => {
              setDeptToDelete(row);
              setIsDeleteOpen(true);
            }}
            disabled={isPending}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
          >
            <Trash2 size={18} />
          </button>

          <button
            onClick={() => {
              setDeptToCreate(row);
              setIsCreateOpen(true);
            }}
            title="Quản lý vị trí"
            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all border border-transparent hover:border-primary/10"
          >
            <PlusCircle size={18} />
          </button>
        </div>
      ),
    },
  ];

  // Cấu hình Card hiển thị trên thiết bị di động
  const renderCard = (row: Department, index: number) => (
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
            setSelectedDept(row);
            setIsEditOpen(true);
          }}
          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all border border-transparent hover:border-primary/10"
        >
          <Pencil size={18} />
        </button>

        <button
          onClick={() => {
            setDeptToDelete(row);
            setIsDeleteOpen(true);
          }}
          disabled={isPending}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
        >
          <Trash2 size={18} />
        </button>

        <button
          onClick={() => {
            setDeptToCreate(row);
            setIsCreateOpen(true);
          }}
          title="Quản lý vị trí"
          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all border border-transparent hover:border-primary/10"
        >
          <PlusCircle size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <Heading className="text-primary pr-2 pt-2 text-2xl" size="h1">
        Danh sách phòng ban
      </Heading>
      <TableData<Department>
        queryKey={['departments', search]}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        select={false}
        search={{
          placeholder: 'Tìm kiếm phòng ban...',
          value: search,
          onChange: setSearch,
          className: 'w-80',
        }}
      />

      {/* Modal Sửa phòng ban */}
      <DepartmentFormModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedDept(null);
        }}
        title="Sửa phòng ban"
        submitText="Xác nhận lưu"
        initialData={
          selectedDept
            ? {
                id: Number(selectedDept.id),
                name: selectedDept.name,
                code: selectedDept.code,
              }
            : undefined
        }
      />

      {/* Modal Xác nhận xóa phòng ban */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeptToDelete(null);
        }}
        title="Xác nhận xóa phòng ban"
        className="m-2 max-w-md w-full"
      >
        <div className="flex gap-4 items-center py-2">
          <div className="flex flex-col gap-1.5">
            <p className="text-gray-600 text-sm leading-relaxed">
              Bạn có chắc chắn muốn xóa phòng ban <strong className="text-gray-900 font-semibold">{deptToDelete?.name}</strong>
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end w-full mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsDeleteOpen(false);
              setDeptToDelete(null);
            }}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (deptToDelete) {
                deletDepartmentm(deptToDelete.id);
              }
            }}
            loading={isPending}
          >
            Xác nhận xóa
          </Button>
        </div>
      </Modal>

      {/* Modal hiển thị trang Quản lý vị trí */}
      <Modal
        size="xl"
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setDeptToCreate(null);
        }}
        title={`Quản lý vị trí - ${deptToCreate?.name || ''}`}
        className="m-2 md:m-8 max-w-[95%] md:max-w-[85%] w-full"
      >
        <div className="max-h-[80vh] overflow-y-auto w-full">
          <PositionPage />
        </div>
      </Modal>
    </div>
  );
};

export default Table;
