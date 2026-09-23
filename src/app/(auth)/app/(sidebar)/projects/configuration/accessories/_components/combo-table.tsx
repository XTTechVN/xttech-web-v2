'use client';

import React from 'react';
import { TableData } from '@/components/table';
import { Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast, formatCurrency } from '@/utils';
import { getAccessoryCombos, deleteAccessoryCombo } from '@/actions';
import type { AccessoryCombo } from '@/types';

interface ComboTableProps {
  onEdit: (combo: AccessoryCombo) => void;
}

export function ComboTable({ onEdit }: ComboTableProps) {
  const { mutate: deleteMutate } = useMutation({
    mutationFn: (id: number) => deleteAccessoryCombo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessory-combos'] });
      toast.success('Xóa gói combo phụ kiện thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa gói combo'),
  });

  const columns = [
    {
      key: 'code',
      label: 'Mã gói',
      minWidth: '130px',
      cell: (row: AccessoryCombo) => (
        <span className="font-bold text-primary">{row.code}</span>
      ),
    },
    {
      key: 'name',
      label: 'Tên gói combo',
      minWidth: '220px',
      cell: (row: AccessoryCombo) => (
        <div>
          <p className="font-semibold text-gray-900">{row.name}</p>
          <span className="text-xs text-gray-500">
            {row.comboItems?.length || 0} món phụ kiện trong gói
          </span>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Tổng giá gói',
      minWidth: '130px',
      cell: (row: AccessoryCombo) => (
        <span className="font-semibold text-emerald-700">
          {formatCurrency(row.totalComboPrice || 0)}
        </span>
      ),
    },
    {
      key: 'is_default',
      label: 'Mặc định',
      minWidth: '110px',
      cell: (row: AccessoryCombo) => (
        row.isDefault ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle2 size={12} /> Mặc định
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '110px',
      cell: (row: AccessoryCombo) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
            row.isActive ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.isActive ? 'Hoạt động' : 'Tạm ngưng'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      minWidth: '100px',
      cell: (row: AccessoryCombo) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            title="Sửa combo"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Xác nhận xóa gói combo "${row.name}"?`)) {
                deleteMutate(row.id);
              }
            }}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            title="Xóa"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <TableData
      fetcher={async ({ offset, limit }) => {
        return await getAccessoryCombos({ offset, limit });
      }}
      columns={columns}
      queryKey={['accessory-combos']}
    />
  );
}
