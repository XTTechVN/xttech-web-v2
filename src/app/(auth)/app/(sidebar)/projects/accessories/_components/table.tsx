'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { TableData, TableAction } from '@/components/table';
import { Heading, Button } from '@/components';
import { Plus } from 'lucide-react';
import { useQueryParam } from '@/hooks';
import type { Accessory } from '@/types';
import { getAccessories } from '@/actions';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

import { BASE_MINIO_URL } from '@/config';
import { formatCurrency } from '@/utils';

interface TableProps {
  onEditClick: (accessory: Accessory) => void;
  onDeleteClick: (accessory: Accessory) => void;
  onAddClick: () => void;
}

const Table = ({ onEditClick, onDeleteClick, onAddClick }: TableProps) => {
  const searchParams = useSearchParams();
  const offset = Number(searchParams.get('offset') || 0);
  const [search, setSearch] = useQueryParam('search');

  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    const res = await getAccessories({ offset, limit, search: search || undefined });
    if (!res) {
      toast.error('Lỗi khi tải danh sách phụ kiện');
      throw new Error('Lỗi khi tải danh sách phụ kiện');
    }
    return res;
  };

  const columns = [
    {
      key: 'image',
      label: 'Ảnh minh họa',
      minWidth: '100px',
      cell: (row: Accessory) => (
        <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
          {row.imagePath ? (
            <img
              src={row.imagePath.startsWith('http') ? row.imagePath : `${BASE_MINIO_URL}${row.imagePath}`}
              alt={row.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Settings className="w-5 h-5 text-gray-400" />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Tên phụ kiện',
      minWidth: '200px',
      cell: (row: Accessory) => (
        <span className="font-semibold text-gray-900">{row.name}</span>
      ),
    },
    {
      key: 'code',
      label: 'Mã phụ kiện',
      minWidth: '120px',
      cell: (row: Accessory) => <span className="text-gray-600 text-sm">{row.code || '—'}</span>,
    },
    {
      key: 'specification',
      label: 'Thông số kỹ thuật',
      minWidth: '200px',
      cell: (row: Accessory) => <span className="text-gray-500 text-sm truncate max-w-[200px] block">{row.specification || '—'}</span>,
    },
    {
      key: 'unit',
      label: 'ĐVT',
      minWidth: '100px',
      cell: (row: Accessory) => {
        const unitMap: Record<string, string> = {
          set: 'Bộ',
          pcs: 'Cái',
          unit: 'Chiếc',
          pair: 'Đôi',
        };
        return <span className="text-gray-600 text-sm">{unitMap[row.unit || ''] || row.unit || '—'}</span>;
      },
    },
    {
      key: 'price',
      label: 'Đơn giá',
      minWidth: '130px',
      cell: (row: Accessory) => (
        <span className="text-gray-900 font-medium">
          {formatCurrency(row.price)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '120px',
      cell: (row: Accessory) => (
        <TableAction
          onEdit={() => onEditClick(row)}
          onDelete={() => onDeleteClick(row)}
        />
      ),
    },
  ];

  const renderCard = (row: Accessory, index: number) => {
    const unitMap: Record<string, string> = {
      set: 'Bộ',
      pcs: 'Cái',
      unit: 'Chiếc',
      pair: 'Đôi',
    };
    return (
      <div
        key={row.id || index}
        className="p-4 rounded-xl border border-gray-150 bg-white flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
            {row.imagePath ? (
              <img
                src={row.imagePath.startsWith('http') ? row.imagePath : `${BASE_MINIO_URL}${row.imagePath}`}
                alt={row.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Settings className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{row.name}</span>
            <span className="text-xs text-gray-400">Đơn giá: {formatCurrency(row.price)}</span>
            {row.unit && (
              <span className="text-xs text-gray-500 mt-0.5">
                ĐVT: {unitMap[row.unit] || row.unit}
              </span>
            )}
          </div>
        </div>
        <TableAction
          onEdit={() => onEditClick(row)}
          onDelete={() => onDeleteClick(row)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center w-full pr-2 pt-2">
        <Heading className="text-primary text-2xl" size="h1">
          Danh sách phụ kiện
        </Heading>
        <Button
          variant="primary"
          size="sm"
          className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
          leftIcon={<Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          onClick={onAddClick}
        >
          Thêm phụ kiện
        </Button>
      </div>
      <TableData<Accessory>
        queryKey={['accessories', search, offset]}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        select={false}
        search={{
          placeholder: 'Tìm kiếm phụ kiện...',
          value: search,
          onChange: setSearch,
          className: 'w-80',
        }}
      />
    </div>
  );
};

export default Table;
