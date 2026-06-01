'use client';

// Components
import Table from '@/components/table/Table';
import { Lock } from 'lucide-react';
import TablePagination from '@/components/table/TablePagination';
import TableLoading from '@/components/table/TableLoading';

// Hooks
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

// Utils
import api from '@/utils/api';

// Types
import { User } from '@/types/shared/user';
import { ResponsePagination } from '@/types/shared/reponse';

interface UserProjectTableProps {
  onManageProjects: (user: User) => void;
  searchQuery?: string;
}

export default function UserProjectTable({
  onManageProjects,
  searchQuery = '',
}: UserProjectTableProps) {
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  const { data, isLoading, error } = useQuery<ResponsePagination<User>>({
    queryKey: ['user-projects-list', offset, limit, searchQuery],
    queryFn: () =>
      api
        .get(
          `/api/v1/users?offset=${offset}&limit=${limit}${
            searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''
          }`
        )
        .then((res) => res.data),
  });

  const columns = [
    {
      key: 'username',
      label: 'Tên đăng nhập',
      width: '25%',
      render: (item: User) => <span className="font-semibold text-gray-900">{item.username}</span>,
    },
    {
      key: 'fullName',
      label: 'Họ và tên',
      width: '25%',
      render: (item: User) => <span>{(item as any).full_name || item.fullName}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      width: '30%',
    },
    {
      key: 'actions',
      label: 'Hành động',
      width: '20%',
      render: (item: User) => (
        <div className="flex items-center gap-3">
          <button
            className="text-gray-500 hover:text-green-600 cursor-pointer flex items-center gap-1.5 text-xs font-semibold bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-150 hover:border-green-300 hover:bg-green-50/30 transition-all"
            onClick={() => onManageProjects(item)}
            title="Phân quyền dự án & phân khu"
          >
            <Lock size={14} />
            <span>Phân quyền</span>
          </button>
        </div>
      ),
    },
  ];

  const cardView = (items: User[]) => (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-sm text-gray-900">{item.username}</p>
          </div>
          <div className="text-xs text-gray-500 mb-1">
            <span className="font-semibold text-gray-700">Họ tên:</span> {(item as any).full_name || item.fullName}
          </div>
          <div className="text-xs text-gray-500 mb-3">
            <span className="font-semibold text-gray-700">Email:</span> {item.email}
          </div>
          <div className="flex items-center gap-3 border-t pt-2 justify-end">
            <button
              className="text-gray-500 hover:text-green-600 cursor-pointer flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border"
              onClick={() => onManageProjects(item)}
            >
              <Lock size={14} />
              <span className="text-xs">Phân quyền</span>
            </button>
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
