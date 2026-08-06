'use client';

import React from 'react';
import { User, Pencil, Trash2 } from 'lucide-react';
import { TableData, TableAction } from '@/components/table';
import { Heading, Button } from '@/components';
import { Plus } from 'lucide-react';
import { useQueryParam } from '@/hooks';
import type { Customer } from '@/types';
import { getCustomers } from '@/actions';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

interface TableProps {
  onEditClick: (customer: Customer) => void;
  onDeleteClick: (customer: Customer) => void;
  onAddClick: () => void;
}

const Table = ({ onEditClick, onDeleteClick, onAddClick }: TableProps) => {
  const searchParams = useSearchParams();
  const offset = Number(searchParams.get('offset') || 0);
  const [search, setSearch] = useQueryParam('search');

  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    const res = await getCustomers({ offset, limit, search: search || undefined });
    if (!res) {
      toast.error('Lỗi khi tải danh sách khách hàng');
      throw new Error('Lỗi khi tải danh sách khách hàng');
    }
    return res;
  };

  const columns = [
    {
      key: 'name',
      label: 'Tên khách hàng',
      minWidth: '220px',
      cell: (row: Customer) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
            <User size={16} />
          </div>
          <span className="font-semibold text-gray-900">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'identifyCode',
      label: 'Mã định danh',
      minWidth: '150px',
      cell: (row: Customer) => <span className="text-gray-600 text-sm">{row.identifyCode || '—'}</span>,
    },
    {
      key: 'phone',
      label: 'Số điện thoại',
      minWidth: '150px',
      cell: (row: Customer) => <span className="text-gray-65 text-sm">{row.phone || '—'}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      minWidth: '200px',
      cell: (row: Customer) => <span className="text-gray-500 text-sm">{row.email || '—'}</span>,
    },
    {
      key: 'address',
      label: 'Địa chỉ',
      minWidth: '200px',
      cell: (row: Customer) => <span className="text-gray-500 text-sm truncate max-w-[200px] block">{row.address || '—'}</span>,
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '120px',
      cell: (row: Customer) => (
        <TableAction
          onEdit={() => onEditClick(row)}
          onDelete={() => onDeleteClick(row)}
        />
      ),
    },
  ];

  const renderCard = (row: Customer, index: number) => (
    <div
      key={row.id || index}
      className="p-4 rounded-xl border border-gray-150 bg-white flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/5 text-primary border border-primary/10">
          <User size={18} />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.name}</span>
          <span className="text-xs text-gray-400">Code: {row.identifyCode || '—'}</span>
          {row.phone && <span className="text-xs text-gray-500 mt-0.5">{row.phone}</span>}
        </div>
      </div>
      <TableAction
        onEdit={() => onEditClick(row)}
        onDelete={() => onDeleteClick(row)}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center w-full pr-2 pt-2">
        <Heading className="text-primary text-2xl" size="h1">
          Danh sách khách hàng
        </Heading>
        <Button
          variant="primary"
          size="sm"
          className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
          leftIcon={<Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          onClick={onAddClick}
        >
          Thêm khách hàng
        </Button>
      </div>
      <TableData<Customer>
        queryKey={['customers', search, offset]}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        select={false}
        search={{
          placeholder: 'Tìm kiếm khách hàng...',
          value: search,
          onChange: setSearch,
          className: 'w-80',
        }}
      />
    </div>
  );
};

export default Table;
