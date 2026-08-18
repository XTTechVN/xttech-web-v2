'use client';

import React, { useState } from 'react';
import { TableData, TableAction, Button, Modal, Badge, Heading } from '@/components';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';
import { useQueryParam } from '@/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoles, deleteRole } from '@/actions/role';
import type { Role } from '@/types';
import toast from 'react-hot-toast';
import RoleFormModal from './role-form-modal';

// Lấy màu hiển thị theo mã vai trò
const getRoleVariant = (roleCode?: string | null): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default' => {
  if (!roleCode) return 'default';
  const lower = roleCode.toLowerCase();
  if (lower.includes('admin')) return 'danger';
  if (lower.includes('hr')) return 'warning';
  if (lower.includes('sale')) return 'primary';
  if (lower.includes('technician')) return 'info';
  if (lower.includes('super') || lower.includes('supper')) return 'success';
  return 'default';
};

export default function RoleTable() {
  const [search, setSearch] = useQueryParam('search');
  const queryClient = useQueryClient();

  // Trạng thái modal Thêm/Sửa vai trò
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Trạng thái modal Xóa vai trò
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  // Fetcher danh sách vai trò cho TableData
  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    try {
      const res = await getRoles({ offset, limit, search: search || undefined });
      return {
        items: res.items || [],
        meta: {
          total: res.meta?.total || 0,
          offset: res.meta?.offset || 0,
          limit: res.meta?.limit || 10,
          next: res.meta?.next || false,
        },
      };
    } catch (error) {
      toast.error('Lỗi khi tải danh sách vai trò');
      throw error;
    }
  };

  // Mutation xóa vai trò
  const { mutate: handleDeleteRole, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string | number) => {
      return await deleteRole(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Xóa vai trò thành công');
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa vai trò');
    },
  });

  // Cấu hình các cột hiển thị trên Desktop
  const columns = [
    {
      key: 'name',
      label: 'Tên vai trò',
      minWidth: '200px',
      cell: (row: Role) => <span className="text-gray-900 text-sm line-clamp-2">{row.name}</span>,
    },
    {
      key: 'code',
      label: 'Mã vai trò',
      minWidth: '140px',
      cell: (row: Role) => <span className="text-gray-600 text-sm line-clamp-2">{row.code}</span>,
    },
    {
      key: 'description',
      label: 'Mô tả',
      minWidth: '260px',
      cell: (row: Role) => <span className="text-gray-600 text-sm line-clamp-2">{row.description || 'Chưa có mô tả'}</span>,
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      minWidth: '150px',
      cell: (row: Role) => (
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
      label: 'Hành động',
      minWidth: '120px',
      cell: (row: Role) => (
        <TableAction
          items={[
            {
              title: 'Chỉnh sửa',
              icon: Pencil,
              size: 18,
              onClick: () => {
                setSelectedRole(row);
                setIsFormModalOpen(true);
              },
            },
            {
              title: 'Xóa',
              icon: Trash2,
              size: 18,
              className: 'hover:text-red-600 hover:bg-red-50',
              disabled: isDeleting,
              onClick: () => {
                setRoleToDelete(row);
                setIsDeleteModalOpen(true);
              },
            },
          ]}
        />
      ),
    },
  ];

  // Cấu hình Card hiển thị trên thiết bị di động
  const renderCard = (row: Role, index: number) => (
    <div
      key={row.id || index}
      className="p-4 rounded-xl border border-gray-150 bg-white flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm">{row.name}</span>
            <Badge variant={getRoleVariant(row.code)} size="sm">
              {row.code || 'N/A'}
            </Badge>
          </div>
          <span className="text-xs text-gray-500 line-clamp-1 mt-0.5">{row.description || 'Chưa có mô tả'}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            setSelectedRole(row);
            setIsFormModalOpen(true);
          }}
          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all border border-transparent hover:border-primary/10"
          title="Chỉnh sửa"
        >
          <Pencil size={18} />
        </button>

        <button
          onClick={() => {
            setRoleToDelete(row);
            setIsDeleteModalOpen(true);
          }}
          disabled={isDeleting}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
          title="Xóa"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex md:flex-row justify-between items-start md:items-center w-full gap-4">
        {/* Left Header Panel */}
        <Heading className="text-primary text-2xl" size="h1">
          Danh sách vai trò
        </Heading>

        {/* Right Header (Add, Export & Refresh) */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsFormModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="px-2.5 lg:px-3 gap-0 lg:gap-2"
          >
            <span className="hidden lg:inline">Tạo vai trò</span>
          </Button>
        </div>
      </div>

      <TableData<Role>
        queryKey={['roles', search]}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        select={false}
        search={{
          placeholder: 'Tìm kiếm vai trò...',
          value: search,
          onChange: setSearch,
          className: 'w-80',
        }}
      />

      {/* Modal Thêm / Sửa vai trò */}
      <RoleFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedRole(null);
        }}
        initialData={selectedRole}
      />

      {/* Modal Xác nhận xóa vai trò */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setRoleToDelete(null);
        }}
        title="Xác nhận xóa vai trò"
        className="m-2 max-w-md w-full"
      >
        <div className="flex gap-4 items-center py-2">
          <div className="flex flex-col gap-1.5">
            <p className="text-gray-600 text-sm leading-relaxed">
              Bạn có chắc chắn muốn xóa vai trò <strong className="text-gray-900 font-semibold">{roleToDelete?.name}</strong>? Hành động này không thể
              hoàn tác.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end w-full mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setRoleToDelete(null);
            }}
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (roleToDelete) {
                handleDeleteRole(roleToDelete.id);
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
}
