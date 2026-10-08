'use client';

import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import type { Gasket } from '@/types';
import { GASKET_UNIT_MAP } from '@/types';
import { formatCurrency } from '@/utils';

interface GasketTableProps {
  gaskets: Gasket[];
  onEdit: (gasket: Gasket) => void;
  onDelete: (gasket: Gasket) => void;
}

type SortField = 'code' | 'name' | 'unit' | 'price' | 'status';
type SortOrder = 'asc' | 'desc';

function SortIcon({ active, order }: { active: boolean; order: SortOrder }) {
  if (!active) {
    return <ArrowUpDown size={12} className="text-slate-300 group-hover/th:text-slate-500 transition-colors shrink-0" />;
  }
  return order === 'asc' ? (
    <ArrowUp size={12} className="text-primary font-bold shrink-0" />
  ) : (
    <ArrowDown size={12} className="text-primary font-bold shrink-0" />
  );
}

export function GasketTable({
  gaskets,
  onEdit,
  onDelete,
}: GasketTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedList = useMemo(() => {
    if (!sortField) return gaskets;

    return [...gaskets].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'code':
          comparison = (a.code || '').localeCompare(b.code || '', 'vi', { sensitivity: 'base' });
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '', 'vi', { sensitivity: 'base' });
          break;
        case 'unit':
          comparison = (a.unit || '').localeCompare(b.unit || '', 'vi', { sensitivity: 'base' });
          break;
        case 'price':
          comparison = (Number(a.pricePerUnit) || 0) - (Number(b.pricePerUnit) || 0);
          break;
        case 'status':
          comparison = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [gaskets, sortField, sortOrder]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600 select-none">
              {/* Cột 1: Mã vật tư */}
              <th
                onClick={() => handleSort('code')}
                className="py-3 px-4 w-40 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Mã"
              >
                <div className="flex items-center gap-1.5">
                  <span>Mã vật tư</span>
                  <SortIcon active={sortField === 'code'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 2: Tên vật tư */}
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 min-w-[240px] cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Tên"
              >
                <div className="flex items-center gap-1.5">
                  <span>Tên vật tư gioăng / keo</span>
                  <SortIcon active={sortField === 'name'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 3: Đơn vị tính */}
              <th
                onClick={() => handleSort('unit')}
                className="py-3 px-4 text-center w-32 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Đơn vị tính"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Đơn vị tính</span>
                  <SortIcon active={sortField === 'unit'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 4: Đơn giá */}
              <th
                onClick={() => handleSort('price')}
                className="py-3 px-4 text-right w-36 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Đơn giá"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Đơn giá</span>
                  <SortIcon active={sortField === 'price'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 5: Trạng thái */}
              <th
                onClick={() => handleSort('status')}
                className="py-3 px-4 text-center w-32 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Trạng thái"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Trạng thái</span>
                  <SortIcon active={sortField === 'status'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 6: Hành động */}
              <th className="py-3 px-4 text-right w-24">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedList.map((gasket) => {
              const unitLabel = GASKET_UNIT_MAP[gasket.unit?.toLowerCase()] || gasket.unit || '—';

              return (
                <tr
                  key={gasket.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Cột 1: Mã vật tư */}
                  <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">
                    <span>{gasket.code || '—'}</span>
                  </td>

                  {/* Cột 2: Tên vật tư */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors text-sm">
                      {gasket.name}
                    </span>
                  </td>

                  {/* Cột 3: Đơn vị tính */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {unitLabel}
                    </span>
                  </td>

                  {/* Cột 4: Đơn giá */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-bold text-slate-900 text-xs">
                      {formatCurrency(gasket.pricePerUnit || 0)}
                    </span>
                  </td>

                  {/* Cột 5: Trạng thái */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border whitespace-nowrap ${
                        gasket.isActive !== false
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {gasket.isActive !== false ? 'Hoạt động' : 'Tạm khóa'}
                    </span>
                  </td>

                  {/* Cột 6: Thao tác */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(gasket)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
                        title="Chỉnh sửa vật tư"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(gasket)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Xóa vật tư"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
