'use client';

import React from 'react';

// Icons thư viện lucide-react
import { Pencil, Trash2, UserCog, Briefcase } from 'lucide-react';

// Thành phần dùng chung cho toàn bộ trang
import { TableData, TableAction } from '@/components/table';
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
import RoleModal from './role-modal';
import PositionModal from './position-modal';

import { BASE_MINIO_URL } from '@/config';

// Lấy màu theo từng vị trí
const getRoleVariant = (roleCode: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default' => {
  const lowerName = roleCode.toLowerCase();
  if (lowerName.includes('admin')) return 'danger';
  if (lowerName.includes('hr')) return 'warning';
  if (lowerName.includes('accountant')) return 'warning';
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

  // Trạng thái cho modal gán vai trò nhân sự
  const [isRoleModalOpen, setIsRoleModalOpen] = React.useState(false);
  const [empToAssignRole, setEmpToAssignRole] = React.useState<Employee | null>(null);

  // Trạng thái cho modal gán chức vụ / vị trí nhân sự
  const [isPositionModalOpen, setIsPositionModalOpen] = React.useState(false);
  const [empToAssignPos, setEmpToAssignPos] = React.useState<Employee | null>(null);

  // Trạng thái cho modal xóa nhân sự
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [empToDelete, setEmpToDelete] = React.useState<Employee | null>(null);

  // Hàm fetcher gọi API thực tế qua React Query / TableData
  const fetcher = async (params: { offset: number; limit: number }) => {
    const res = await getEmployees({ ...params, search: search || undefined });
    if (!res) {
      toast.error('Lỗi khi tải danh sách nhân sự');
      throw new Error('Lỗi khi tải danh sách nhân sự');
    }
    return res;
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
          <Avatar 
            src={row.avatar ? (row.avatar.startsWith('http') ? row.avatar : `${BASE_MINIO_URL}${row.avatar}`) : undefined} 
            name={row.fullName || row.username} 
            size="sm" 
          />
          <span className="font-semibold text-gray-900 text-sm truncate">{row.fullName || row.username}</span>
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
      minWidth: '150px',
      cell: (row: Employee) => {
        const primaryRole = row.roles && row.roles.length > 0 ? row.roles[0] : null;
        return (
          <div className="flex flex-wrap gap-1">
            {primaryRole ? (
              <Badge variant={getRoleVariant(primaryRole.code)} size="sm">
                {primaryRole.name}
              </Badge>
            ) : (
              <Badge variant="default" size="sm">
                Nhân viên
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'positions',
      label: 'Chức vụ & Phòng ban',
      minWidth: '180px',
      cell: (row: Employee) => (
        <div className="flex flex-wrap gap-1">
          {row.positions && row.positions.length > 0 ? (
            row.positions.map((pos: any) => (
              <Badge key={pos.id} variant="info" size="sm">
                {pos.name+" - "+pos?.department?.name}
              </Badge>
            ))
          ) : (
            <span className="text-gray-400 text-xs italic">Chưa gán</span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      minWidth: '130px',
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
      minWidth: '140px',
      cell: (row: Employee) => (
        <TableAction
          items={[
            {
              title: 'Chỉnh sửa',
              icon: Pencil,
              size: 18,
              onClick: () => {
                setSelectedEmp(row);
                setIsEditOpen(true);
              },
            },
            {
              title: 'Gán vai trò',
              icon: UserCog,
              size: 18,
              className: 'hover:text-primary hover:bg-primary/5',
              onClick: () => {
                setEmpToAssignRole(row);
                setIsRoleModalOpen(true);
              },
            },
            {
              title: 'Gán chức vụ / vị trí',
              icon: Briefcase,
              size: 18,
              className: 'hover:text-blue-600 hover:bg-blue-50',
              onClick: () => {
                setEmpToAssignPos(row);
                setIsPositionModalOpen(true);
              },
            },
            {
              title: 'Xóa',
              icon: Trash2,
              size: 18,
              className: 'hover:text-red-600 hover:bg-red-50',
              disabled: isPending,
              onClick: () => {
                setEmpToDelete(row);
                setIsDeleteOpen(true);
              },
            },
          ]}
        />
      ),
    },
  ];

  // Cấu hình Card hiển thị trên thiết bị di động
  const renderCard = (row: Employee, index: number) => (
    <div
      key={row.id || index}
      className="p-4 rounded-xl border border-primary/10 bg-white flex flex-col gap-3 shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        <Avatar 
          src={row.avatar ? (row.avatar.startsWith('http') ? row.avatar : `${BASE_MINIO_URL}${row.avatar}`) : undefined} 
          name={row.fullName || row.username} 
          size="md" 
        />
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-semibold text-gray-900 truncate text-sm sm:text-base leading-snug">{row.fullName || row.username}</span>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {row.roles && row.roles.length > 0 && (
              <Badge variant={getRoleVariant(row.roles[0].code)} size="sm">
                {row.roles[0].name}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-gray-100/50 pt-2.5">
        <button
          type="button"
          onClick={() => {
            setSelectedEmp(row);
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
            setEmpToAssignRole(row);
            setIsRoleModalOpen(true);
          }}
          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <UserCog size={12} />
          Vai trò
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setEmpToDelete(row);
            setIsDeleteOpen(true);
          }}
          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-50/50 text-red-600 border border-red-100 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Trash2 size={12} />
          Xóa
        </button>
      </div>
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

      {/* Modal Gán vai trò nhân sự */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setEmpToAssignRole(null);
        }}
        employee={empToAssignRole}
      />

      {/* Modal Gán chức vụ / vị trí nhân sự */}
      <PositionModal
        isOpen={isPositionModalOpen}
        onClose={() => {
          setIsPositionModalOpen(false);
          setEmpToAssignPos(null);
        }}
        employee={empToAssignPos}
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
