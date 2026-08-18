'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { TableData, TableAction } from '@/components/table';
import { Heading, Button } from '@/components';
import { Plus } from 'lucide-react';
import { useQueryParam } from '@/hooks';
import { EXTRA_OPTION_UNIT_MAP, type ExtraOption, type ExtraOptionUnit } from '@/types';
import { getExtraOptions } from '@/actions';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/utils';

interface TableProps {
  onEditClick: (option: ExtraOption) => void;
  onDeleteClick: (option: ExtraOption) => void;
  onAddClick: () => void;
}

const Table = ({ onEditClick, onDeleteClick, onAddClick }: TableProps) => {
  const searchParams = useSearchParams();
  const offset = Number(searchParams.get('offset') || 0);
  const [search, setSearch] = useQueryParam('search');

  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    const res = await getExtraOptions({ offset, limit, search: search || undefined });
    if (!res) {
      toast.error('Lỗi khi tải danh sách tùy chọn phát sinh');
      throw new Error('Lỗi khi tải danh sách tùy chọn phát sinh');
    }
    return res;
  };

  const columns = [
    {
      key: 'code',
      label: 'Mã tùy chọn',
      minWidth: '150px',
      cell: (row: ExtraOption) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
            <Settings size={16} />
          </div>
          <span className="font-semibold text-gray-900">{row.code || '—'}</span>
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Tên tùy chọn',
      minWidth: '200px',
      cell: (row: ExtraOption) => <span className="font-medium text-gray-700">{row.name}</span>,
    },
    {
      key: 'unit',
      label: 'Đơn vị tính',
      minWidth: '100px',
      cell: (row: ExtraOption) => (
        <span className="text-gray-600 text-sm">
          {EXTRA_OPTION_UNIT_MAP[row.unit as ExtraOptionUnit] || row.unit || '—'}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Đơn giá',
      minWidth: '150px',
      cell: (row: ExtraOption) => (
        <span className="text-gray-900 font-medium">
          {formatCurrency(row.price)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '120px',
      cell: (row: ExtraOption) => (
        <TableAction
          onEdit={() => onEditClick(row)}
          onDelete={() => onDeleteClick(row)}
        />
      ),
    },
  ];

  const renderCard = (row: ExtraOption, index: number) => (
    <div
      key={row.id || index}
      className="p-4 rounded-xl border border-gray-150 bg-white flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/5 text-primary border border-primary/10">
          <Settings size={18} />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.name}</span>
          <span className="text-xs text-gray-400">Mã: {row.code || '—'}</span>
          <span className="text-xs text-gray-500 mt-0.5">
            Đơn giá: {formatCurrency(row.price)} / {EXTRA_OPTION_UNIT_MAP[row.unit as ExtraOptionUnit] || row.unit || 'Bộ'}
          </span>
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
      <div className="flex justify-end items-center w-full pr-2">
        <Button
          variant="primary"
          size="sm"
          className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
          leftIcon={<Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          onClick={onAddClick}
        >
          Thêm tùy chọn
        </Button>
      </div>
      <TableData<ExtraOption>
        queryKey={['extra-options', search, offset]}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        select={false}
        search={{
          placeholder: 'Tìm kiếm tùy chọn...',
          value: search,
          onChange: setSearch,
          className: 'w-80',
        }}
      />
    </div>
  );
};

export default Table;
