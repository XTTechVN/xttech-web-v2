'use client';

import React from 'react';
import { Settings, Plus, Pencil, Trash2 } from 'lucide-react';
import { TableData, TableAction } from '@/components/table';
import { Heading, Button } from '@/components';
import { useQueryParam } from '@/hooks';
import { Accessory, formatAccessoryUnit } from '@/types';
import { getAccessories } from '@/actions';
import toast from 'react-hot-toast';
import { useSearchParams, useRouter } from 'next/navigation';

import { BASE_MINIO_URL } from '@/config';
import { formatCurrency } from '@/utils';

interface TableProps {
  onEditClick: (accessory: Accessory) => void;
  onDeleteClick: (accessory: Accessory) => void;
  onAddClick: () => void;
}

const Table = ({ onEditClick, onDeleteClick, onAddClick }: TableProps) => {
  const router = useRouter();
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
      key: 'code',
      label: 'Mã phụ kiện',
      minWidth: '150px',
      cell: (row: Accessory) => <span className="font-semibold text-gray-900">{row.code || '—'}</span>,
    },
    {
      key: 'name',
      label: 'Tên phụ kiện',
      minWidth: '200px',
      cell: (row: Accessory) => (
        <span className="font-medium text-gray-700">{row.name}</span>
      ),
    },
    {
      key: 'specification',
      label: 'Thông số kỹ thuật',
      minWidth: '200px',
      cell: (row: Accessory) => <span className="text-gray-500 text-sm truncate max-w-50 block">{row.specification || '—'}</span>,
    },
    {
      key: 'unit',
      label: 'ĐVT',
      minWidth: '100px',
      cell: (row: Accessory) => <span className="text-gray-600 text-sm">{formatAccessoryUnit(row.unit) || '—'}</span>,
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
          onView={() => router.push(`/app/projects/configuration/accessories/${row.id}`)}
          onEdit={() => onEditClick(row)}
          onDelete={() => onDeleteClick(row)}
        />
      ),
    },
  ];

  const renderCard = (row: Accessory, index: number) => {
    return (
      <div
        key={row.id || index}
        onClick={() => router.push(`/app/projects/configuration/accessories/${row.id}`)}
        className="p-4 rounded-xl border border-primary/10 bg-white flex flex-col gap-3 shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer"
      >
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
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
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-semibold text-gray-900 break-words text-sm sm:text-base leading-snug">{row.name}</span>
            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-400">
              <span>Đơn giá: {formatCurrency(row.price)}</span>
              {row.unit && <span className="select-none">•</span>}
              {row.unit && <span>ĐVT: {formatAccessoryUnit(row.unit)}</span>}
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
  };

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
          Thêm phụ kiện
        </Button>
      </div>
      <TableData<Accessory>
        queryKey={['accessories', search]}
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
