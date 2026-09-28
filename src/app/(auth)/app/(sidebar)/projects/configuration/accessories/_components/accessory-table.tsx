'use client';

import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import type { Accessory } from '@/types';
import { formatAccessoryUnit, ACCESSORY_COLOR_MAP } from '@/types';
import { formatCurrency } from '@/utils';

interface AccessoryTableProps {
  accessories: Accessory[];
  onEdit: (accessory: Accessory) => void;
  onDelete: (accessory: Accessory) => void;
}

type SortField = 'code' | 'name' | 'category' | 'specification' | 'unit' | 'color' | 'price' | 'status';
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

export function AccessoryTable({
  accessories,
  onEdit,
  onDelete,
}: AccessoryTableProps) {
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

  const sortedAccessories = useMemo(() => {
    if (!sortField) return accessories;

    return [...accessories].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'code':
          comparison = (a.code || '').localeCompare(b.code || '', 'vi', { sensitivity: 'base' });
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '', 'vi', { sensitivity: 'base' });
          break;
        case 'category': {
          const catA = a.category?.name || '';
          const catB = b.category?.name || '';
          comparison = catA.localeCompare(catB, 'vi', { sensitivity: 'base' });
          break;
        }
        case 'specification':
          comparison = (a.specification || '').localeCompare(b.specification || '', 'vi', { sensitivity: 'base' });
          break;
        case 'unit': {
          const unitA = formatAccessoryUnit(a.unit) || '';
          const unitB = formatAccessoryUnit(b.unit) || '';
          comparison = unitA.localeCompare(unitB, 'vi', { sensitivity: 'base' });
          break;
        }
        case 'color': {
          const colA = a.color ? ACCESSORY_COLOR_MAP[a.color.toLowerCase()] || a.color : '';
          const colB = b.color ? ACCESSORY_COLOR_MAP[b.color.toLowerCase()] || b.color : '';
          comparison = colA.localeCompare(colB, 'vi', { sensitivity: 'base' });
          break;
        }
        case 'price': {
          const priceA = a.unitPrice || a.salePrice || 0;
          const priceB = b.unitPrice || b.salePrice || 0;
          comparison = priceA - priceB;
          break;
        }
        case 'status': {
          const statusA = a.isActive !== false ? 1 : 0;
          const statusB = b.isActive !== false ? 1 : 0;
          comparison = statusA - statusB;
          break;
        }
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [accessories, sortField, sortOrder]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse select-none">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {/* Cột 1: Mã phụ kiện */}
              <th
                onClick={() => handleSort('code')}
                className="py-3 px-4 w-36 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Mã phụ kiện"
              >
                <div className="flex items-center gap-1.5">
                  <span>Mã phụ kiện</span>
                  <SortIcon active={sortField === 'code'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 2: Tên phụ kiện */}
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 min-w-[200px] cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Tên phụ kiện"
              >
                <div className="flex items-center gap-1.5">
                  <span>Mô tả / Tên phụ kiện</span>
                  <SortIcon active={sortField === 'name'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 3: Phân loại */}
              <th
                onClick={() => handleSort('category')}
                className="py-3 px-4 text-center w-36 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Phân loại"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Phân loại</span>
                  <SortIcon active={sortField === 'category'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 4: Quy cách */}
              <th
                onClick={() => handleSort('specification')}
                className="py-3 px-4 text-center w-32 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Quy cách"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Quy cách</span>
                  <SortIcon active={sortField === 'specification'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 5: ĐVT */}
              <th
                onClick={() => handleSort('unit')}
                className="py-3 px-4 text-center w-24 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Đơn vị tính"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>ĐVT</span>
                  <SortIcon active={sortField === 'unit'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 6: Màu sắc */}
              <th
                onClick={() => handleSort('color')}
                className="py-3 px-4 text-center w-28 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Màu sắc"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Màu sắc</span>
                  <SortIcon active={sortField === 'color'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 7: Đơn giá */}
              <th
                onClick={() => handleSort('price')}
                className="py-3 px-4 text-right w-32 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Đơn giá"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Đơn giá</span>
                  <SortIcon active={sortField === 'price'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 8: Trạng thái */}
              <th
                onClick={() => handleSort('status')}
                className="py-3 px-4 text-center w-28 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Trạng thái"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Trạng thái</span>
                  <SortIcon active={sortField === 'status'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 9: Hành động */}
              <th className="py-3 px-4 text-right w-24">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedAccessories.map((acc) => {
              const categoryLabel = acc.category?.name || '—';
              const unitLabel = formatAccessoryUnit(acc.unit) || '—';
              const colorLabel = acc.color ? ACCESSORY_COLOR_MAP[acc.color.toLowerCase()] || acc.color : '—';
              const price = acc.unitPrice || acc.salePrice || 0;

              return (
                <tr
                  key={acc.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Cột 1: Mã phụ kiện */}
                  <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs font-mono">
                    {acc.code || '—'}
                  </td>

                  {/* Cột 2: Tên phụ kiện */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors text-sm">
                        {acc.name}
                      </span>
                      {acc.brand?.name ? (
                        <span className="text-xs text-slate-400 mt-0.5">
                          Hãng: {acc.brand.name}
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {/* Cột 3: Phân loại */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {categoryLabel}
                    </span>
                  </td>

                  {/* Cột 4: Quy cách */}
                  <td className="py-3.5 px-4 text-center text-xs text-slate-600">
                    {acc.specification || '—'}
                  </td>

                  {/* Cột 5: ĐVT */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                      {unitLabel}
                    </span>
                  </td>

                  {/* Cột 6: Màu sắc */}
                  <td className="py-3.5 px-4 text-center text-xs text-slate-700">
                    {colorLabel}
                  </td>

                  {/* Cột 7: Đơn giá */}
                  <td className="py-3.5 px-4 text-right font-semibold text-xs text-slate-800">
                    {price ? formatCurrency(price) : '0 ₫'}
                  </td>

                  {/* Cột 8: Trạng thái */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border whitespace-nowrap ${
                        acc.isActive !== false
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {acc.isActive !== false ? 'Hoạt động' : 'Tạm ngưng'}
                    </span>
                  </td>

                  {/* Cột 9: Thao tác */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(acc)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(acc)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Xóa"
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
