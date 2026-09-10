'use client';

import React from 'react';
import { Pencil, Trash2, Tag, Plus } from 'lucide-react';
import { TableData, TableAction } from '@/components/table';
import { Button } from '@/components';
import { useQueryParam } from '@/hooks';
import type { CustomerProvider } from '@/types';
import toast from 'react-hot-toast';
import { getCustomerProviders } from '@/actions';

interface CustomerProviderTableProps {
  onAddClick: () => void;
  onEditClick: (provider: CustomerProvider) => void;
  onDeleteClick: (provider: CustomerProvider) => void;
}

export default function CustomerProviderTable({
  onAddClick,
  onEditClick,
  onDeleteClick,
}: CustomerProviderTableProps) {
  const [search, setSearch] = useQueryParam('search');

  // Fetcher gọi API
  const fetcher = async (params: { offset: number; limit: number }) => {
    try {
      return await getCustomerProviders({
        ...params,
        search: search || undefined,
      });
    } catch {
      toast.error('Lỗi khi tải danh sách nhà cung cấp');
      throw new Error('Lỗi khi tải danh sách nhà cung cấp');
    }
  };

  // Cột cho Desktop
  const columns = [
    {
      key: 'code',
      label: 'Mã nhà cung cấp',
      minWidth: '160px',
      cell: (row: CustomerProvider) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold">
          {row.code}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Tên nhà cung cấp',
      minWidth: '240px',
      cell: (row: CustomerProvider) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      minWidth: '160px',
      cell: (row: CustomerProvider) => (
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
      cell: (row: CustomerProvider) => (
        <TableAction
          onEdit={() => onEditClick(row)}
          onDelete={() => onDeleteClick(row)}
        />
      ),
    },
  ];

  // Card view cho Mobile
  const renderCard = (row: CustomerProvider) => (
    <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-gray-900 text-base">{row.name}</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            <Tag className="w-3 h-3" />
            {row.code}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
        <span>
          Ngày tạo:{' '}
          {new Date(row.createdAt).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })}
        </span>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onEditClick(row)}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Pencil size={12} />
            Sửa
          </button>
          <button
            type="button"
            onClick={() => onDeleteClick(row)}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 size={12} />
            Xóa
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center gap-2 w-full pr-2 pt-2">
        <Button
          variant="primary"
          size="sm"
          className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
          leftIcon={<Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          onClick={onAddClick}
        >
          Thêm nhà cung cấp
        </Button>
      </div>

      <TableData<CustomerProvider>
        queryKey={['customer-providers', search]}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        select={false}
        search={{
          placeholder: 'Tìm theo mã, tên nhà cung cấp...',
          value: search,
          onChange: setSearch,
          className: 'w-80',
        }}
      />
    </div>
  );
}
