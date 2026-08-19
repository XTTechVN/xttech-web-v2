'use client';

import React from 'react';

// Icons thư viện lucide-react
import { FolderOpen } from 'lucide-react';

// Thành phần dùng chung cho toàn bộ trang
import { TableData, TableAction } from '@/components/table';
import { Heading, Button } from '@/components';
import { Plus } from 'lucide-react';
import { useQueryParam } from '@/hooks';

// Kiểu dữ liệu dự án
import type { Project } from '@/types';

// Actions — gọi trực tiếp, không qua store
import { getProjects } from '@/actions';

// toast
import toast from 'react-hot-toast';

import { useSearchParams } from 'next/navigation';

import type { Customer } from '@/types';
import { useAuthStore } from '@/stores';

interface TableProps {
  customers?: Pick<Customer, 'id' | 'name'>[];
  onViewClick?: (project: Project) => void;
  onEditClick: (project: Project) => void;
  onDeleteClick: (project: Project) => void;
  onAddClick: () => void;
}

const Table = ({ customers = [], onViewClick, onEditClick, onDeleteClick, onAddClick }: TableProps) => {
  const searchParams = useSearchParams();
  const offset = Number(searchParams.get('offset') || 0);
  const [search, setSearch] = useQueryParam('search');

  const { user } = useAuthStore();
  const isSaleOnly = user?.roles?.some((role) => role.code === 'sale') &&
    !user?.roles?.some((role) => role.code === 'super' || role.code === 'admin');

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
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
            <FolderOpen size={16} />
          </div>
          <span className="font-semibold text-gray-900">{row.name}</span>
        </div>
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
      cell: (row: Project) => <span className="text-gray-500 text-sm truncate max-w-[200px] block">{row.note || '—'}</span>,
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
      className="p-4 rounded-xl border border-gray-150 bg-white flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/5 text-primary border border-primary/10">
          <FolderOpen size={18} />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.name}</span>
          <span className="text-xs text-gray-400">ID: {row.id}</span>
          {row.address && <span className="text-xs text-gray-500 mt-0.5">{row.address}</span>}
        </div>
      </div>
      <TableAction
        onView={() => onViewClick?.(row)}
        onEdit={() => onEditClick(row)}
        onDelete={() => onDeleteClick(row)}
      />
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
        queryKey={['projects', search, offset]}
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
