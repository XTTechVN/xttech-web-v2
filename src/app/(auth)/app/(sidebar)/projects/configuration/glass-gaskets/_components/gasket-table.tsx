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
  isBulkMode?: boolean;
  selectedIdSet?: ReadonlySet<number>;
  isAllSelected?: boolean;
  isPartiallySelected?: boolean;
  onToggleSelect?: (id: number) => void;
  onToggleSelectAll?: () => void;
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
  isBulkMode = false,
  selectedIdSet,
  isAllSelected = false,
  isPartiallySelected = false,
  onToggleSelect,
  onToggleSelectAll,
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
              {isBulkMode && (
                <th className="py-3 px-3 w-11 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPartiallySelected;
                    }}
                    onChange={() => onToggleSelectAll?.()}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer accent-[#045863]"
                    title="Chọn tất cả"
                  />
                </th>
              )}
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

              <th className="py-3 px-4 text-right w-24">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {sortedList.map((gasket) => {
              const unitLabel = GASKET_UNIT_MAP[gasket.unit?.toLowerCase()] || gasket.unit || '—';
              const isSelected = Boolean(selectedIdSet?.has(gasket.id));

              return (
                <tr
                  key={gasket.id}
                  onClick={() => {
                    if (isBulkMode) onToggleSelect?.(gasket.id);
                  }}
                  className={`transition-colors group ${
                    isBulkMode ? 'cursor-pointer' : ''
                  } ${
                    isSelected ? 'bg-rose-50/40 hover:bg-rose-50/60' : 'hover:bg-slate-50/80'
                  }`}
                >
                  {isBulkMode && (
                    <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect?.(gasket.id)}
                        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer accent-[#045863]"
                      />
                    </td>
                  )}
                  <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">
                    <span>{gasket.code || '—'}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors text-xs">
                      {gasket.name}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {unitLabel}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className="font-bold text-slate-900 text-xs">
                      {formatCurrency(gasket.pricePerUnit || 0)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border whitespace-nowrap ${
                        gasket.isActive !== false
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {gasket.isActive !== false ? 'Hoạt động' : 'Tạm khóa'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
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
