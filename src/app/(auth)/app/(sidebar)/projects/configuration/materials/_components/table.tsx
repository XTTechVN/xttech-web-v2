'use client';
import { PackageOpen, Plus, Pencil, Trash2 } from 'lucide-react';
import { TableData, TableAction } from '@/components/table';
import { Button } from '@/components';
import { useQueryParam } from '@/hooks';
import { Material, formatMaterialUnit } from '@/types';
import { getMaterials } from '@/actions';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/utils';

interface TableProps {
  onEditClick: (material: Material) => void;
  onDeleteClick: (material: Material) => void;
  onAddClick: () => void;
}

const Table = ({ onEditClick, onDeleteClick, onAddClick }: TableProps) => {
  const router = useRouter();
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
      minWidth: '220px',
      cell: (row: Material) => (
        <span className="font-medium text-gray-700 truncate max-w-[280px] block" title={row.name}>
          {row.name}
        </span>
      ),
    },
    {
      key: 'unit',
      label: 'ĐVT',
      minWidth: '100px',
      cell: (row: Material) => {
        return <span className="text-gray-600 text-sm">{formatMaterialUnit(row.unit) || '—'}</span>;
      },
    },
    {
      key: 'costPrice',
      label: 'Giá vốn',
      minWidth: '110px',
      cell: (row: Material) => (
        <span className="text-gray-500 font-medium">
          {formatCurrency(row.costPrice)}
        </span>
      ),
    },
    {
      key: 'retailPrice',
      label: 'Giá bán lẻ',
      minWidth: '110px',
      cell: (row: Material) => (
        <span className="text-gray-900 font-semibold text-primary">
          {formatCurrency(row.retailPrice)}
        </span>
      ),
    },
    {
      key: 'salePrice',
      label: 'Giá đại lý',
      minWidth: '110px',
      cell: (row: Material) => (
        <span className="text-gray-900 font-semibold text-teal-650">
          {formatCurrency(row.salePrice)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '120px',
      cell: (row: Material) => (
        <TableAction
          onView={() => router.push(`/app/projects/configuration/materials/${row.id}`)}
          onEdit={() => onEditClick(row)}
          onDelete={() => onDeleteClick(row)}
        />
      ),
    },
  ];

  const renderCard = (row: Material, index: number) => {
    return (
      <div
        key={row.id || index}
        onClick={() => router.push(`/app/projects/configuration/materials/${row.id}`)}
        className="p-4 rounded-xl border border-primary/10 bg-white flex flex-col gap-3 shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/5 text-primary border border-primary/10 shrink-0 mt-0.5">
            <PackageOpen size={18} />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-semibold text-gray-900 wrap-break-word text-sm sm:text-base leading-snug">{row.name}</span>
            <div className="flex flex-col gap-0.5 mt-1 text-xs text-gray-500">
              <div className="flex gap-2 flex-wrap">
                <span>Vốn: {formatCurrency(row.costPrice)}</span>
                <span>•</span>
                <span>Lẻ: {formatCurrency(row.retailPrice)}</span>
                <span>•</span>
                <span>Sỉ: {formatCurrency(row.salePrice)}</span>
              </div>
              {row.unit && <span className="mt-0.5">ĐVT: {formatMaterialUnit(row.unit)}</span>}
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
          Thêm hệ nhôm
        </Button>
      </div>
      <TableData<Material>
        queryKey={['materials', search]}
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
