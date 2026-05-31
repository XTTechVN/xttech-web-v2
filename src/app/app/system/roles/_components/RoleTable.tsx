'use client';

// Components
import Table from '@/components/table/Table';
import { Edit, Trash2, Key } from 'lucide-react';
import TablePagination from '@/components/table/TablePagination';
import TableLoading from '@/components/table/TableLoading';

// Hooks
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

// Utils
import api from '@/utils/api';

// Types
import { Role } from '@/types/shared/role';
import { ResponsePagination } from '@/types/shared/reponse';

export default function RoleTable({
  onDelete,
  onEdit,
  onManagePermissions,
  searchQuery = '',
}: {
  onDelete: (id: string) => void;
  onEdit: (role: Role) => void;
  onManagePermissions: (role: Role) => void;
  searchQuery?: string;
}) {
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  const { data, isLoading, error } = useQuery<ResponsePagination<Role>>({
    queryKey: ['roles', offset, limit, searchQuery],
    queryFn: () =>
      api
        .get(`/api/v1/roles?offset=${offset}&limit=${limit}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`)
        .then((res) => res.data),
  });

  const columns = [
    {
      key: 'name',
      label: 'Tên',
      width: '25%',
    },
    {
      key: 'code',
      label: 'Mã',
      width: '25%',
    },
    {
      key: 'description',
      label: 'Mô tả',
      width: '35%',
    },
    {
      key: 'actions',
      label: 'Hành động',
      width: '15%',
      render: (item: Role) => (
        <div className="flex items-center gap-3">
          <button
            className="text-gray-500 hover:text-blue-600 cursor-pointer flex items-center gap-1 text-xs"
            onClick={() => onManagePermissions(item)}
            title="Quản lý quyền hạn"
          >
            <Key size={16} />
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

  const cardView = (items: Role[]) => (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="p-4 border rounded-lg bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">Tên Vai Trò:</p>
            <p className="text-sm">{item.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">Mã:</p>
            <p className="text-sm">{item.code}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">Mô tả:</p>
            <p className="text-sm">{item.description || 'Chưa có mô tả'}</p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <p className="font-semibold text-sm">Hành động:</p>
            <div className="flex items-center gap-3">
              <button
                className="text-gray-500 hover:text-blue-600 cursor-pointer flex items-center gap-1"
                onClick={() => onManagePermissions(item)}
              >
                <Key size={16} />
                <span className="text-xs">Gán quyền</span>
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

  return (
    <div>
      {isLoading && <TableLoading cols={columns} />}
      {error && <div className="p-4 text-red-500 bg-red-50 rounded-lg">Lỗi: {error.message}</div>}
      {data && (
        <>
          <Table data={data.items} columns={columns} cardView={cardView} />
          <div className="flex justify-end mt-4">
            <TablePagination {...data.meta} onChange={(newOffset) => setOffset(newOffset)} />
          </div>
        </>
      )}
    </div>
  );
}
