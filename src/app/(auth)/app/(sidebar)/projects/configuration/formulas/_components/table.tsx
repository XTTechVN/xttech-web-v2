'use client';

import React from 'react';
import { Calculator, Plus, Pencil, Trash2 } from 'lucide-react';
import { TableData, TableAction } from '@/components/table';
import { Heading, Button } from '@/components';
import { useQueryParam } from '@/hooks';
import { FORMULA_TYPE_MAP, DOOR_TYPE_MAP, type Formula } from '@/types';
import { getFormulas } from '@/actions';
import toast from 'react-hot-toast';
import { useSearchParams, useRouter } from 'next/navigation';

interface TableProps {
  onEditClick: (formula: Formula) => void;
  onDeleteClick: (formula: Formula) => void;
  onAddClick: () => void;
}

const Table = ({ onEditClick, onDeleteClick, onAddClick }: TableProps) => {
  const router = useRouter();
  const [search, setSearch] = useQueryParam('search');



  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    const res = await getFormulas({ offset, limit, search: search || undefined });
    if (!res) {
      toast.error('Lỗi khi tải danh sách công thức');
      throw new Error('Lỗi khi tải danh sách công thức');
    }
    return res;
  };



  const columns = [
    {
      key: 'code',
      label: 'Mã công thức',
      minWidth: '150px',
      cell: (row: Formula) => <span className="font-semibold text-gray-900">{row.code || '—'}</span>,
    },
    {
      key: 'name',
      label: 'Tên công thức',
      minWidth: '180px',
      cell: (row: Formula) => <span className="font-semibold text-gray-900">{row.name || '—'}</span>,
    },
    {
      key: 'type',
      label: 'Phân loại',
      minWidth: '130px',
      cell: (row: Formula) => <span className="text-gray-600 text-sm">{FORMULA_TYPE_MAP[row.type] || row.type}</span>,
    },
    {
      key: 'material',
      label: 'Hệ nhôm áp dụng',
      minWidth: '180px',
      cell: (row: Formula) => {
        if (!row.materials || row.materials.length === 0) return <span className="text-gray-400">—</span>;
        return (
          <div className="flex flex-wrap gap-1 max-w-[220px]">
            {row.materials.map((m) => (
              <span key={m.id} className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-800 rounded font-medium">
                {m.name}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'doorType',
      label: 'Loại cửa',
      minWidth: '120px',
      cell: (row: Formula) => <span className="text-gray-600 text-sm">{row.doorType ? DOOR_TYPE_MAP[row.doorType] || row.doorType : 'Tất cả'}</span>,
    },
    {
      key: 'parameters',
      label: 'Thông số công thức',
      minWidth: '220px',
      cell: (row: Formula) => {
        if (row.type === 'door_trim') {
          return (
            <span className="text-blue-600 text-xs font-semibold">
              Cộng rộng: +{row.widthAdd || 0}mm | Cộng cao: +{row.heightAdd || 0}mm
            </span>
          );
        } else {
          return (
            <span className="text-amber-600 text-xs font-semibold">
              Tỷ lệ hao hụt: {row.wastageRate || 0}%
            </span>
          );
        }
      },
    },
    {
      key: 'unit',
      label: 'Đvt',
      minWidth: '80px',
      cell: (row: Formula) => <span className="text-gray-500 text-sm">{row.unit || 'md'}</span>,
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '120px',
      cell: (row: Formula) => (
        <TableAction
          onView={() => router.push(`/app/projects/configuration/formulas/${row.id}`)}
          onEdit={() => onEditClick(row)}
          onDelete={() => onDeleteClick(row)}
        />
      ),
    },
  ];

  const renderCard = (row: Formula, index: number) => {
    return (
      <div
        key={row.id || index}
        onClick={() => router.push(`/app/projects/configuration/formulas/${row.id}`)}
        className="p-4 rounded-xl border border-primary/10 bg-white flex flex-col gap-3 shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
            <Calculator className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-semibold text-gray-900 break-words text-sm sm:text-base leading-snug">{row.name || 'Công thức'}</span>
            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-400">
              <span>Mã: {row.code || '—'}</span>
              <span className="select-none">•</span>
              <span>ĐVT: {row.unit || 'md'}</span>
            </div>
            <span className="text-xs text-gray-500 mt-1">
              Phân loại: {FORMULA_TYPE_MAP[row.type] || row.type} {row.doorType ? `(${DOOR_TYPE_MAP[row.doorType]})` : ''}
            </span>
            <span className="text-[11px] font-semibold text-primary mt-1">
              {row.type === 'door_trim'
                ? `Cộng rộng: +${row.widthAdd || 0}mm | Cộng cao: +${row.heightAdd || 0}mm`
                : `Hao hụt: ${row.wastageRate || 0}%`}
            </span>
            {row.materials && row.materials.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {row.materials.map((m) => (
                  <span key={m.id} className="inline-block px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-800 rounded font-medium border border-slate-200">
                    {m.name}
                  </span>
                ))}
              </div>
            )}
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
          Thêm công thức
        </Button>
      </div>
      <TableData<Formula>
        queryKey={['formulas', search]}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        select={false}
        search={{
          placeholder: 'Tìm kiếm công thức...',
          value: search,
          onChange: setSearch,
          className: 'w-80',
        }}
      />
    </div>
  );
};

export default Table;
