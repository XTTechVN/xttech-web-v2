'use client';

// Components
import Table from '@/components/table/Table';
import TableAction from '@/components/table/TableAction';
import TablePagination from '@/components/table/TablePagination';
import TableLoading from '@/components/table/TableLoading';

// Hooks
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

// Utils
import api from '@/utils/api';

// Types
import { Permission } from '@/types/shared/permission';
import { ResponsePagination } from '@/types/shared/reponse';

export default function PermissionTable({
  onDelete,
  onEdit,
  searchQuery = '',
}: {
  onDelete: (id: string) => void;
  onEdit: (permission: Permission) => void;
  searchQuery?: string;
}) {
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  const { data, isLoading, error } = useQuery<ResponsePagination<Permission>>({
    queryKey: ['permissions', offset, limit, searchQuery],
    queryFn: () =>
      api
        .get(`/api/v1/permissions?offset=${offset}&limit=${limit}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`)
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
      render: (item: Permission) => (
        <TableAction
          onView={() => {}}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item.id)}
        />
      ),
    },
  ];

  const cardView = (items: Permission[]) => (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="p-4 border rounded-lg bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">Tên Quyền Hạn:</p>
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
          <div className="flex items-center gap-2 mt-2">
            <p className="font-semibold text-sm">Hành động:</p>
            <TableAction
              onView={() => {}}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item.id)}
            />
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
