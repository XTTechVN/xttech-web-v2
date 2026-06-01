'use client';

// Components
import Table from '@/components/table/Table';
import TablePagination from '@/components/table/TablePagination';
import TableLoading from '@/components/table/TableLoading';
import TableAction from '@/components/table/TableAction';
import { Edit, Trash2, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Hooks
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

// Utils
import api from '@/utils/api';

// Types
import { Project } from '@/types/shared/project';
import { ResponsePagination } from '@/types/shared/reponse';

interface ProjectTableProps {
  onDelete: (id: string) => void;
  onEdit: (project: Project) => void;
  searchQuery?: string;
}

export default function ProjectTable({ onDelete, onEdit, searchQuery = '' }: ProjectTableProps) {
  const router = useRouter();
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  const { data, isLoading, error } = useQuery<ResponsePagination<Project>>({
    queryKey: ['projects', offset, limit, searchQuery],
    queryFn: () =>
      api
        .get(
          `/api/v1/projects?offset=${offset}&limit=${limit}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`,
        )
        .then((res) => res.data),
  });

  const columns = [
    {
      key: 'code',
      label: 'Mã dự án',
      width: '15%',
    },
    {
      key: 'name',
      label: 'Tên dự án',
      width: '25%',
    },
    {
      key: 'address',
      label: 'Địa chỉ',
      width: '25%',
    },
    {
      key: 'status',
      label: 'Trạng thái',
      width: '15%',
    },
    {
      key: 'actions',
      label: 'Hành động',
      width: '20%',
      render: (item: Project) => (
        <TableAction
          onView={() => router.push(`/app/projects/${item.id}`)}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item.id)}
        />
      ),
    },
  ];

  const cardView = (items: Project[]) => (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
              {item.code || 'N/A'}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold ${
                item.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {item.status === 'ACTIVE' ? 'Hoạt động' : 'Ngưng'}
            </span>
          </div>
          <div className="mb-1">
            <p className="font-semibold text-sm text-gray-800">{item.name}</p>
          </div>
          <div className="text-xs text-gray-500 mb-2">
            <span className="font-semibold">Địa chỉ:</span> {item.address || 'Chưa cập nhật'}
          </div>
          <div className="text-xs text-gray-500 mb-3">
            <span className="font-semibold">Mô tả:</span> {item.description || 'Không có mô tả'}
          </div>
          <div className="flex items-center gap-3 border-t pt-2 justify-end">
            <button
              className="text-blue-500 hover:text-blue-700 cursor-pointer flex items-center gap-1"
              onClick={() => router.push(`/app/projects/${item.id}`)}
            >
              <Eye size={16} />
              <span className="text-xs">Chi tiết</span>
            </button>
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
          <div className="flex justify-end mt-4">
            <TablePagination {...data.meta} onChange={(newOffset) => setOffset(newOffset)} />
          </div>
        </>
      )}
    </div>
  );
}
