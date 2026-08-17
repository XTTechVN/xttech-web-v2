'use client';

import React from 'react';
import { Columns } from 'lucide-react';
import { TableData, TableAction } from '@/components/table';
import { Heading, Button } from '@/components';
import { Plus } from 'lucide-react';
import { useQueryParam } from '@/hooks';
import type { Door } from '@/types';
import { getDoors } from '@/actions';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

import { BASE_MINIO_URL } from '@/config/app';

interface TableProps {
  onEditClick: (door: Door) => void;
  onDeleteClick: (door: Door) => void;
  onAddClick: () => void;
}

const Table = ({ onEditClick, onDeleteClick, onAddClick }: TableProps) => {
  const searchParams = useSearchParams();
  const offset = Number(searchParams.get('offset') || 0);
  const [search, setSearch] = useQueryParam('search');

  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    const res = await getDoors({ offset, limit, search: search || undefined });
    if (!res) {
      toast.error('Lỗi khi tải danh sách cửa');
      throw new Error('Lỗi khi tải danh sách cửa');
    }
    return res;
  };

  const columns = [
    {
      key: 'image',
      label: 'Ảnh minh họa',
      minWidth: '50%',
      cell: (row: Door) => (
        <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
          {row.imagePath ? (
            <img
              src={row.imagePath.startsWith('http') ? row.imagePath : `${BASE_MINIO_URL}${row.imagePath}`}
              alt={row.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Columns className="w-5 h-5 text-gray-400" />
          )}
        </div>
      ),
    },
    {
      key: 'code',
      label: 'Mã sản phẩm',
      minWidth: '150px',
      cell: (row: Door) => <span className="text-gray-600 text-sm">{row.code || '—'}</span>,
    },
    {
      key: 'type',
      label: 'Phân loại',
      minWidth: '150px',
      cell: (row: Door) => {
        const typeMap: Record<string, string> = {
          cd: 'Cửa đi',
          cs: 'Cửa sổ',
          ck: 'Cửa kính',
        };
        return <span className="text-gray-600 text-sm">{typeMap[row.type || ''] || row.type || '—'}</span>;
      },
    },
    {
      key: 'name',
      label: 'Tên cửa',
      minWidth: '220px',
      cell: (row: Door) => <span className="font-semibold text-gray-900">{row.name}</span>,
    },
    {
      key: 'specification',
      label: 'Thông số kỹ thuật',
      minWidth: '220px',
      cell: (row: Door) => <span className="text-gray-500 text-sm truncate max-w-[200px] block">{row.specification || '—'}</span>,
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '120px',
      cell: (row: Door) => <TableAction onEdit={() => onEditClick(row)} onDelete={() => onDeleteClick(row)} />,
    },
  ];

  // Cấu hình Card hiển thị trên thiết bị di động
  const renderCard = (row: Door, index: number) => {
    const typeMap: Record<string, string> = {
      cd: 'Cửa đi',
      cs: 'Cửa sổ',
      ck: 'Cửa kính',
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
                src={row.imagePath.startsWith('http') ? row.imagePath : `${BASE_MINIO_URL}/${row.imagePath}`}
                alt={row.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Columns className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{row.name}</span>
            <span className="text-xs text-gray-400">Code: {row.code || '—'}</span>
            {row.type && <span className="text-xs text-gray-500 mt-0.5">{typeMap[row.type] || row.type}</span>}
          </div>
        </div>
        <TableAction onEdit={() => onEditClick(row)} onDelete={() => onDeleteClick(row)} />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center w-full pr-2 pt-2">
        <Heading className="text-primary text-2xl" size="h1">
          Danh sách các loại cửa
        </Heading>
        <Button
          variant="primary"
          size="sm"
          className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
          leftIcon={<Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          onClick={onAddClick}
        >
          Thêm thiết kế cửa
        </Button>
      </div>
      <TableData<Door>
        queryKey={['doors', search, offset]}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        select={false}
        search={{
          placeholder: 'Tìm kiếm cửa...',
          value: search,
          onChange: setSearch,
          className: 'w-80',
        }}
      />
    </div>
  );
};

export default Table;
