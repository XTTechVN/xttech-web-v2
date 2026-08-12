'use client';

import React from 'react';

// Icons thư viện lucide-react
import { Pencil, Trash2 } from 'lucide-react';

// Thành phần dùng chung cho toàn bộ trang
import { TableData } from '@/components/table';
import TableAction from '@/components/table/table-action';
import { Modal, Button, Badge, Avatar } from '@/components';
import { useQueryParam } from '@/hooks';

// Kiểu dữ liệu NHÂN SỰ
import { Employee } from '@/types';

// toast
import toast from 'react-hot-toast';

// react query
import { useMutation } from '@tanstack/react-query';

// utils
import queryClient from '@/utils/query';

// actions
import { getEmployees, deleteEmployee } from '@/actions/employee';

// components dùng riêng cho trang nhân viên
import EmployeeFormModal from './form-modal';

import { BASE_MINIO_URL } from '@/config';

// Lấy màu theo từng vị trí
const getRoleVariant = (roleName: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default' => {
  const lowerName = roleName.toLowerCase();
  if (lowerName.includes('admin')) return 'danger';
  if (lowerName.includes('hr')) return 'warning';
  if (lowerName.includes('sale')) return 'primary';
  if (lowerName.includes('technician')) return 'info';
  if (lowerName.includes('super') || lowerName.includes('supper')) return 'success';
  return 'default';
};


const Table = () => {
  const [search, setSearch] = useQueryParam('search');

  // Trạng thái cho modal sửa nhân sự
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [selectedEmp, setSelectedEmp] = React.useState<Employee | null>(null);

  // Trạng thái cho modal xóa nhân sự
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [empToDelete, setEmpToDelete] = React.useState<Employee | null>(null);

  // Hàm fetcher gọi API thực tế qua React Query / TableData
  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    const res = await getEmployees({ offset, limit, search: search || undefined });
    if (!res) {
      toast.error('Lỗi khi tải danh sách nhân sự');
      throw new Error('Lỗi khi tải danh sách nhân sự');
    }
    return {
      items: res.items || [],
      meta: {
        total: res.pagination?.total || 0,
        offset: res.pagination?.offset || 0,
        limit: res.pagination?.limit || 10,
        next: res.pagination?.next || false,
      },
    };
  };

  // Hàm xóa nhân sự dùng useMutation
  const { mutate: handleDeleteEmployee, isPending } = useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Xóa nhân sự thành công');
      setIsDeleteOpen(false);
      setEmpToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Lỗi hệ thống khi xóa nhân sự');
    },
  });

  // Cấu hình các cột cho Desktop
  const columns = [
    {
      key: 'fullName',
      label: 'Tên nhân sự',
      minWidth: '220px',
      cell: (row: Employee) => (
        <div className="flex items-center gap-3">
          <Avatar src={`${BASE_MINIO_URL}${row.avatar}`} name={row.fullName || row.username} size="sm" />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{row.fullName || row.username}</span>
            <span className="text-xs text-gray-500">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'phoneNumber',
      label: 'Số điện thoại',
      minWidth: '140px',
      cell: (row: Employee) => <span className="text-gray-600 text-sm">{row.phoneNumber || '---'}</span>,
    },
    {
      key: 'roles',
      label: 'Vai trò',
      minWidth: '160px',
      cell: (row: Employee) => (
        <div className="flex flex-wrap gap-1">
          {row.roles && row.roles.length > 0 ? (
            row.roles.map((role) => (
              <Badge key={role.id} variant={getRoleVariant(role.name)} size="sm">
                {role.name}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-gray-400">Nhân viên</span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      minWidth: '160px',
      cell: (row: Employee) => (
        <span className="text-gray-600 text-sm">
          {row.createdAt
            ? new Date(row.createdAt).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
            : '---'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '120px',
      cell: (row: Employee) => (
        <TableAction
          onEdit={() => {
            setSelectedEmp(row);
            setIsEditOpen(true);
          }}
          onDelete={() => {
            setEmpToDelete(row);
            setIsDeleteOpen(true);
          }}
        />
      ),
    },
  ];

  // Cấu hình Card hiển thị trên thiết bị di động
  const renderCard = (row: Employee, index: number) => (
    <div
      key={row.id || index}
      className="p-4 rounded-xl border border-gray-150 bg-white flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center gap-3">
        <Avatar src={row.avatar || undefined} name={row.fullName || row.username} size="md" />
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.fullName || row.username}</span>
          <span className="text-xs text-gray-400">{row.email}</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">Mã: {row.identifyCode || 'N/A'}</span>
            {row.roles && row.roles.length > 0 && (
              <Badge variant={getRoleVariant(row.roles[0].name)} size="sm">
                {row.roles[0].name}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <TableAction
        onEdit={() => {
          setSelectedEmp(row);
          setIsEditOpen(true);
        }}
        onDelete={() => {
          setEmpToDelete(row);
          setIsDeleteOpen(true);
        }}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <TableData<Employee>
        queryKey={['employees', search]}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        select={false}
        search={{
          placeholder: 'Tìm kiếm nhân sự...',
          value: search,
          onChange: setSearch,
          className: 'w-80',
        }}
      />

      {/* Modal Sửa nhân sự */}
      <EmployeeFormModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedEmp(null);
        }}
        title="Sửa thông tin nhân sự"
        submitText="Xác nhận lưu"
        initialData={selectedEmp}
      />

      {/* Modal Xác nhận xóa nhân sự */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setEmpToDelete(null);
        }}
        title="Xác nhận xóa nhân sự"
        className="m-2 max-w-md w-full"
      >
        <div className="flex gap-4 items-center py-2">
          <div className="flex flex-col gap-1.5">
            <p className="text-gray-600 text-sm leading-relaxed">
              Bạn có chắc chắn muốn xóa NHÂN SỰ{' '}
              <strong className="text-gray-900 font-semibold">{empToDelete?.fullName || empToDelete?.username}</strong>? Hành động này không thể hoàn
              tác.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end w-full mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsDeleteOpen(false);
              setEmpToDelete(null);
            }}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (empToDelete) {
                handleDeleteEmployee(empToDelete.id);
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
