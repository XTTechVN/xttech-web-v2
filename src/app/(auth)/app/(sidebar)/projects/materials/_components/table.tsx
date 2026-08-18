'use client';

import React from 'react';
import { PackageOpen } from 'lucide-react';
import { TableData, TableAction } from '@/components/table';
import { Heading, Button } from '@/components';
import { Plus } from 'lucide-react';
import { useQueryParam } from '@/hooks';
import type { Material } from '@/types';
import { getMaterials } from '@/actions';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

import { BASE_MINIO_URL } from '@/config/app';
import { formatCurrency } from '@/utils';

interface TableProps {
  onEditClick: (material: Material) => void;
  onDeleteClick: (material: Material) => void;
  onAddClick: () => void;
}

const Table = ({ onEditClick, onDeleteClick, onAddClick }: TableProps) => {
  const searchParams = useSearchParams();
  const offset = Number(searchParams.get('offset') || 0);
  const [search, setSearch] = useQueryParam('search');

  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    const res = await getMaterials({ offset, limit, search: search || undefined });
    if (!res) {
      toast.error('Lỗi khi tải danh sách hệ nhôm');
      throw new Error('Lỗi khi tải danh sách hệ nhôm');
    }
    return res;
  };

  const columns = [
    {
      key: 'code',
      label: 'Mã hệ nhôm',
      minWidth: '150px',
      cell: (row: Material) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
            <PackageOpen size={16} />
          </div>
          <span className="font-semibold text-gray-900">{row.code || '—'}</span>
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Tên hệ nhôm',
      minWidth: '200px',
      cell: (row: Material) => <span className="font-medium text-gray-700">{row.name}</span>,
    },
    {
      key: 'specification',
      label: 'Thông số kỹ thuật',
      minWidth: '200px',
      cell: (row: Material) => <span className="text-gray-500 text-sm truncate max-w-[200px] block">{row.specification || '—'}</span>,
    },
    {
      key: 'unit',
      label: 'ĐVT',
      minWidth: '100px',
      cell: (row: Material) => {
        const unitMap: Record<string, string> = {
          set: 'Bộ',
          area: 'Diện tích (m²)',
        };
        return <span className="text-gray-600 text-sm">{unitMap[row.unit || ''] || row.unit || '—'}</span>;
      },
    },
    {
      key: 'price',
      label: 'Đơn giá',
      minWidth: '130px',
      cell: (row: Material) => (
        <span className="text-gray-900 font-medium">
          {formatCurrency(row.price)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '120px',
      cell: (row: Material) => (
        <TableAction
          onEdit={() => onEditClick(row)}
          onDelete={() => onDeleteClick(row)}
        />
      ),
    },
  ];

  const renderCard = (row: Material, index: number) => {
    const unitMap: Record<string, string> = {
      set: 'Bộ',
      area: 'Diện tích (m²)',
    };
    return (
      <div
        key={row.id || index}
        className="p-4 rounded-xl border border-gray-150 bg-white flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/5 text-primary border border-primary/10">
            <PackageOpen size={18} />
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
      <div className="flex justify-between items-center w-full pr-2">
        <Heading className="text-primary text-2xl" size="h1">
          Danh sách hệ nhôm
        </Heading>
        <Button
          variant="primary"
          size="sm"
          className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
          leftIcon={<Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          onClick={onAddClick}
        >
          Thêm hệ nhôm
        </Button>
      </div>
      <TableData<Material>
        queryKey={['materials', search, offset]}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        select={false}
        search={{
          placeholder: 'Tìm kiếm hệ nhôm...',
          value: search,
          onChange: setSearch,
          className: 'w-80',
        }}
      />
    </div>
  );
};

export default Table;
