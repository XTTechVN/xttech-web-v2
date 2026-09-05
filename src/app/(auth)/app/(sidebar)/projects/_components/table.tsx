'use client';

import React from 'react';

// Icons thư viện lucide-react
import { Plus, Pencil, Trash2 } from 'lucide-react';

// Thành phần dùng chung cho toàn bộ trang
import { TableData, TableAction } from '@/components/table';
import { Button } from '@/components';
import { useQueryParam, usePermission } from '@/hooks';

// Kiểu dữ liệu dự án
import type { Project } from '@/types';

// Actions — gọi trực tiếp, không qua store
import { getProjects } from '@/actions';

// toast
import toast from 'react-hot-toast';

import type { Customer } from '@/types';

interface TableProps {
  customers?: Pick<Customer, 'id' | 'name'>[];
  onViewClick?: (project: Project) => void;
  onEditClick: (project: Project) => void;
  onDeleteClick: (project: Project) => void;
  onAddClick: () => void;
}

const Table = ({ customers = [], onViewClick, onEditClick, onDeleteClick, onAddClick }: TableProps) => {
  const [search, setSearch] = useQueryParam('search');

  const { user, isSaleOnly } = usePermission();

  // Fetcher gọi thẳng action, không qua store
  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    const params: any = { offset, limit, search: search || undefined };
    if (isSaleOnly && user?.id) {
      params.userId = user.id;
    }
    const res = await getProjects(params);
    if (!res) {
      toast.error('Lỗi khi tải danh sách dự án');
      throw new Error('Lỗi khi tải danh sách dự án');
    }
    return res;
  };

  // Cấu hình các cột cho Desktop
  const columns = [
    {
      key: 'name',
      label: 'Tên dự án',
      minWidth: '250px',
      cell: (row: Project) => (
        <span className="font-semibold text-gray-900">{row.name}</span>
      ),
    },
    {
      key: 'address',
      label: 'Địa chỉ',
      minWidth: '200px',
      cell: (row: Project) => <span className="text-gray-600 text-sm">{row.address || '—'}</span>,
    },
    {
      key: 'note',
      label: 'Ghi chú',
      minWidth: '180px',
      cell: (row: Project) => <span className="text-gray-500 text-sm truncate max-w-50 block">{row.note || '—'}</span>,
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      minWidth: '180px',
      cell: (row: Project) => (
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
      label: 'Hành động',
      minWidth: '120px',
      cell: (row: Project) => (
        <TableAction
          onView={() => onViewClick?.(row)}
          onEdit={() => onEditClick(row)}
          onDelete={() => onDeleteClick(row)}
        />
      ),
    },
  ];

  // Cấu hình Card hiển thị trên thiết bị di động
  const renderCard = (row: Project, index: number) => (
    <div
      key={row.id || index}
      onClick={() => onViewClick?.(row)}
      className="p-4 rounded-xl border border-primary/10 bg-white flex flex-col gap-3 shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-semibold text-gray-900 break-words text-sm sm:text-base leading-snug">{row.name}</span>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-gray-400 font-medium">ID: {row.id}</span>
            {row.address && <span className="text-xs text-gray-300 select-none">•</span>}
            {row.address && <span className="text-xs text-gray-500 truncate max-w-45">{row.address}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-gray-100/50 pt-2.5" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onEditClick(row)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Pencil size={12} />
          Sửa
        </button>
        <button
          type="button"
          onClick={() => onDeleteClick(row)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50/50 text-red-600 border border-red-100 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Trash2 size={12} />
          Xóa
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center w-full pr-2 pt-2">
        <Button
          variant="primary"
          size="sm"
          className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
          leftIcon={<Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          onClick={onAddClick}
        >
          Thêm dự án
        </Button>
      </div>
      <TableData<Project>
        queryKey={['projects', search]}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        select={false}
        search={{
          placeholder: 'Tìm kiếm dự án...',
          value: search,
          onChange: setSearch,
          className: 'w-80',
        }}
      />
    </div>
  );
};

export default Table;
