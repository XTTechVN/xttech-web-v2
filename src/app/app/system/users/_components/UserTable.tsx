'use client';

// Hooks
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

// Components
import Forbidden from '@/components/ui/Forbidden';
import Table from '@/components/table/Table';
import { Edit, Trash2, Shield, Briefcase } from 'lucide-react';
import TablePagination from '@/components/table/TablePagination';
import TableLoading from '@/components/table/TableLoading';

// Utils
import api from '@/utils/api';

// Types
import { User } from '@/types/shared/user';
import { ResponsePagination } from '@/types/shared/reponse';

export default function UserTable({
  onDelete,
  onEdit,
  onManageRoles,
  onManageProjects,
  searchQuery = '',
  onForbiddenChange,
}: {
  onDelete: (id: string) => void;
  onEdit: (user: User) => void;
  onManageRoles: (user: User) => void;
  onManageProjects: (user: User) => void;
  searchQuery?: string;
  onForbiddenChange?: (forbidden: boolean) => void;
}) {
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  const { data, isLoading, error } = useQuery<ResponsePagination<User>>({
    queryKey: ['users', offset, limit, searchQuery],
    queryFn: () =>
      api
        .get(
          `/api/v1/users?offset=${offset}&limit=${limit}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`,
        )
        .then((res) => res.data),
  });

  const isForbidden = (error as any)?.response?.status === 403;

  useEffect(() => {
    if (onForbiddenChange) {
      onForbiddenChange(isForbidden);
    }
  }, [isForbidden, onForbiddenChange]);

  const columns = [
    {
      key: 'username',
      label: 'Tên đăng nhập',
      width: '20%',
    },
    {
      key: 'fullName',
      label: 'Họ và tên',
      width: '20%',
      render: (item: User) => <span>{(item as any).full_name || item.fullName}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      width: '20%',
    },
    {
      key: 'phone',
      label: 'Số điện thoại',
      width: '20%',
    },
    {
      key: 'actions',
      label: 'Hành động',
      width: '15%',
      render: (item: User) => (
        <div className="flex items-center gap-3">
          <button
            className="text-gray-500 hover:text-green-600 cursor-pointer flex items-center gap-1 text-xs"
            onClick={() => onManageRoles(item)}
            title="Quản lý vai trò (Roles)"
          >
            <Shield size={16} />
          </button>
          <button
            className="text-gray-500 hover:text-blue-600 cursor-pointer flex items-center gap-1 text-xs"
            onClick={() => onManageProjects(item)}
            title="Phân quyền dự án (Projects)"
          >
            <Briefcase size={16} />
          </button>
          <button
            className="text-gray-500 hover:text-black cursor-pointer"
            onClick={() => onEdit(item)}
            title="Chỉnh sửa"
          >
            <Edit size={16} />
          </button>
          <button
            className="text-gray-500 hover:text-red-600 cursor-pointer"
            onClick={() => onDelete(item.id)}
            title="Xóa"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const cardView = (items: User[]) => (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="p-4 border rounded-lg bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">Tên Đăng Nhập:</p>
            <p className="text-sm">{item.username}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">Họ và Tên:</p>
            <p className="text-sm">{(item as any).full_name || item.fullName}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">Email:</p>
            <p className="text-sm">{item.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">Số Điện Thoại:</p>
            <p className="text-sm">{item.phone || 'Chưa có'}</p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <p className="font-semibold text-sm">Hành động:</p>
            <div className="flex items-center gap-3">
              <button
                className="text-gray-500 hover:text-green-600 cursor-pointer flex items-center gap-1"
                onClick={() => onManageRoles(item)}
              >
                <Shield size={16} />
                <span className="text-xs">Vai trò</span>
              </button>
              <button
                className="text-gray-500 hover:text-black cursor-pointer"
                onClick={() => onEdit(item)}
              >
                <Edit size={16} />
              </button>
              <button
                className="text-gray-500 hover:text-red-600 cursor-pointer"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const errorMessage = (error as any)?.response?.data?.detail?.message || error?.message;

  return (
    <div>
      {isLoading && <TableLoading cols={columns} />}
      {isForbidden ? (
        <Forbidden message={errorMessage} />
      ) : (
        <>
          {error && (
            <div className="p-4 text-red-500 bg-red-50 rounded-lg">Lỗi: {error.message}</div>
          )}
          {data && (
            <>
              <Table data={data.items} columns={columns} cardView={cardView} />
              <div className="flex justify-end mt-4">
                <TablePagination {...data.meta} onChange={(newOffset) => setOffset(newOffset)} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
