'use client';

// Components
import Table from '@/components/table/Table';
import { Edit, Trash2 } from 'lucide-react';
import TablePagination from '@/components/table/TablePagination';
import TableLoading from '@/components/table/TableLoading';

// Hooks
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

// Utils
import api from '@/utils/api';

// Types
import { Zone } from '@/types/shared/zone';
import { ResponsePagination } from '@/types/shared/reponse';

interface ZoneTableProps {
  projectId: string;
  onDelete: (id: string) => void;
  onEdit: (zone: Zone) => void;
  searchQuery?: string;
}

export default function ZoneTable({
  projectId,
  onDelete,
  onEdit,
  searchQuery = '',
}: ZoneTableProps) {
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  const { data, isLoading, error } = useQuery<ResponsePagination<Zone>>({
    queryKey: ['zones', projectId, offset, limit, searchQuery],
    queryFn: () =>
      api
        .get(
          `/api/v1/zones?project_id=${projectId}&offset=${offset}&limit=${limit}${
            searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''
          }`
        )
        .then((res) => res.data),
    enabled: !!projectId,
  });

  const columns = [
    {
      key: 'name',
      label: 'Tên phân khu',
      width: '30%',
      render: (item: Zone) => <span className="font-medium text-gray-900">{item.name}</span>,
    },
    {
      key: 'description',
      label: 'Mô tả chi tiết',
      width: '50%',
      render: (item: Zone) => <span className="text-gray-600 line-clamp-1">{item.description || '-'}</span>,
    },
    {
      key: 'actions',
      label: 'Hành động',
      width: '20%',
      render: (item: Zone) => (
        <div className="flex items-center gap-3">
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

  const cardView = (items: Zone[]) => (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-1">
            <p className="font-semibold text-sm text-gray-800">{item.name}</p>
          </div>
          <div className="text-xs text-gray-500 mb-3">
            <span className="font-semibold">Mô tả:</span> {item.description || 'Không có mô tả'}
          </div>
          <div className="flex items-center gap-3 border-t pt-2 justify-end">
            <button
              className="text-gray-500 hover:text-black cursor-pointer flex items-center gap-1"
              onClick={() => onEdit(item)}
            >
              <Edit size={16} />
              <span className="text-xs">Sửa</span>
            </button>
            <button
              className="text-gray-500 hover:text-red-600 cursor-pointer flex items-center gap-1"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 size={16} />
              <span className="text-xs">Xóa</span>
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
          {data.items.length === 0 && (
            <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg bg-gray-50/50 mt-2">
              Dự án này chưa có phân khu nào. Hãy thêm phân khu mới để bắt đầu.
            </div>
          )}
          {data.items.length > 0 && (
            <div className="flex justify-end mt-4">
              <TablePagination {...data.meta} onChange={(newOffset) => setOffset(newOffset)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
