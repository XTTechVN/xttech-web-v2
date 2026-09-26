'use client';

import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import type { ProfileBar } from '@/types';

interface ProfileBarTableProps {
  profileBars: ProfileBar[];
  onEdit: (bar: ProfileBar) => void;
  onDelete: (bar: ProfileBar) => void;
}

type SortField = 'code' | 'name' | 'series' | 'barType' | 'weight' | 'length' | 'status';
type SortOrder = 'asc' | 'desc';

const BAR_TYPE_MAP: Record<string, string> = {
  frame: 'Khung bao',
  sash: 'Cánh cửa',
  mullion: 'Đố chia / Đố động',
  bead: 'Nẹp kính',
  cover: 'Ốp / Nắp đậy',
  corner: 'Ke góc',
  other: 'Khác',
};

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

export function ProfileBarTable({
  profileBars,
  onEdit,
  onDelete,
}: ProfileBarTableProps) {
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

  const sortedBars = useMemo(() => {
    if (!sortField) return profileBars;

    return [...profileBars].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'code':
          comparison = (a.code || '').localeCompare(b.code || '', 'vi', { sensitivity: 'base' });
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '', 'vi', { sensitivity: 'base' });
          break;
        case 'series': {
          const nameA = a.doorSeries?.name || a.doorSeries?.code || '';
          const nameB = b.doorSeries?.name || b.doorSeries?.code || '';
          comparison = nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' });
          break;
        }
        case 'barType': {
          const typeA = BAR_TYPE_MAP[a.barType] || a.barType || '';
          const typeB = BAR_TYPE_MAP[b.barType] || b.barType || '';
          comparison = typeA.localeCompare(typeB, 'vi', { sensitivity: 'base' });
          break;
        }
        case 'weight':
          comparison = (Number(a.weightPerM) || 0) - (Number(b.weightPerM) || 0);
          break;
        case 'length':
          comparison = (Number(a.barLengthMm) || 6000) - (Number(b.barLengthMm) || 6000);
          break;
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
  }, [profileBars, sortField, sortOrder]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse select-none">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {/* Cột 1: Mã thanh */}
              <th
                onClick={() => handleSort('code')}
                className="py-3 px-4 w-36 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Mã thanh"
              >
                <div className="flex items-center gap-1.5">
                  <span>Mã thanh</span>
                  <SortIcon active={sortField === 'code'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 2: Tên thanh */}
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 min-w-[200px] cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Tên thanh profile"
              >
                <div className="flex items-center gap-1.5">
                  <span>Mô tả / Tên thanh profile</span>
                  <SortIcon active={sortField === 'name'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 3: Hệ nhôm */}
              <th
                onClick={() => handleSort('series')}
                className="py-3 px-4 text-center w-36 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Hệ nhôm"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Hệ nhôm</span>
                  <SortIcon active={sortField === 'series'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 4: Loại thanh */}
              <th
                onClick={() => handleSort('barType')}
                className="py-3 px-4 text-center w-36 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Loại thanh"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Loại thanh</span>
                  <SortIcon active={sortField === 'barType'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 5: Trọng lượng */}
              <th
                onClick={() => handleSort('weight')}
                className="py-3 px-4 text-center w-32 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Trọng lượng"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Trọng lượng</span>
                  <SortIcon active={sortField === 'weight'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 6: Chiều dài */}
              <th
                onClick={() => handleSort('length')}
                className="py-3 px-4 text-center w-32 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Chiều dài"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Chiều dài</span>
                  <SortIcon active={sortField === 'length'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 7: Trạng thái */}
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

              {/* Cột 8: Hành động */}
              <th className="py-3 px-4 text-right w-24">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedBars.map((bar) => {
              const typeLabel = BAR_TYPE_MAP[bar.barType] || bar.barType || '—';
              const seriesLabel = bar.doorSeries?.name || bar.doorSeries?.code || '—';

              return (
                <tr
                  key={bar.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Cột 1: Mã thanh */}
                  <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">
                    {bar.code || '—'}
                  </td>

                  {/* Cột 2: Tên thanh profile */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors text-sm">
                        {bar.name}
                      </span>
                      {bar.doorSeries?.name ? (
                        <span className="text-xs text-slate-400 mt-0.5">
                          Hệ: {bar.doorSeries.name}
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {/* Cột 3: Hệ nhôm */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {seriesLabel}
                    </span>
                  </td>

                  {/* Cột 4: Loại thanh */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                      {typeLabel}
                    </span>
                  </td>

                  {/* Cột 5: Trọng lượng (kg/m) */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-xs font-semibold text-slate-700">
                      {bar.weightPerM ? `${bar.weightPerM} kg/m` : '—'}
                    </span>
                  </td>

                  {/* Cột 6: Chiều dài (mm) */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-xs font-medium text-slate-600">
                      {bar.barLengthMm ? `${bar.barLengthMm.toLocaleString()} mm` : '6,000 mm'}
                    </span>
                  </td>

                  {/* Cột 7: Trạng thái */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border whitespace-nowrap ${
                        bar.isActive !== false
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {bar.isActive !== false ? 'Hoạt động' : 'Tạm ngưng'}
                    </span>
                  </td>

                  {/* Cột 8: Thao tác */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(bar)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(bar)}
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
