'use client';

import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import type { DoorSeries } from '@/types';

interface SeriesTableProps {
  seriesList: DoorSeries[];
  onEdit: (series: DoorSeries) => void;
  onDelete: (series: DoorSeries) => void;
}

type SortField = 'code' | 'name' | 'thickness' | 'joint' | 'status';
type SortOrder = 'asc' | 'desc';

const JOINT_MAP: Record<string, string> = {
  ke_ep_goc: 'Ke ép góc',
  ke_vinh_cuu: 'Ke vĩnh cửu',
  ke_nhay: 'Ke nhảy',
  ke_bat_vit: 'Ke bắt vít',
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

export function SeriesTable({ seriesList, onEdit, onDelete }: SeriesTableProps) {
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
    if (!sortField) return seriesList;

    return [...seriesList].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'code':
          comparison = (a.code || '').localeCompare(b.code || '', 'vi', { sensitivity: 'base' });
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '', 'vi', { sensitivity: 'base' });
          break;
        case 'thickness':
          comparison = (Number(a.aluminumThickness) || 0) - (Number(b.aluminumThickness) || 0);
          break;
        case 'joint': {
          const jointA = a.cornerJointType ? JOINT_MAP[a.cornerJointType] || a.cornerJointType : '';
          const jointB = b.cornerJointType ? JOINT_MAP[b.cornerJointType] || b.cornerJointType : '';
          comparison = jointA.localeCompare(jointB, 'vi', { sensitivity: 'base' });
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
  }, [seriesList, sortField, sortOrder]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse select-none">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {/* Cột 1: Mã hệ */}
              <th
                onClick={() => handleSort('code')}
                className="py-3 px-4 w-36 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Mã hệ"
              >
                <div className="flex items-center gap-1.5">
                  <span>Mã hệ</span>
                  <SortIcon active={sortField === 'code'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 2: Tên hệ */}
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 min-w-[200px] cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Mô tả / Tên hệ nhôm"
              >
                <div className="flex items-center gap-1.5">
                  <span>Mô tả / Tên hệ nhôm</span>
                  <SortIcon active={sortField === 'name'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 3: Độ dày */}
              <th
                onClick={() => handleSort('thickness')}
                className="py-3 px-4 text-center w-28 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Độ dày"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Độ dày</span>
                  <SortIcon active={sortField === 'thickness'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 4: Liên kết góc */}
              <th
                onClick={() => handleSort('joint')}
                className="py-3 px-4 text-center w-36 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Liên kết góc"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Liên kết góc</span>
                  <SortIcon active={sortField === 'joint'} order={sortOrder} />
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

              {/* Cột 6: Thao tác */}
              <th className="py-3 px-4 text-right w-24">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedList.map((series) => {
              const jointLabel = series.cornerJointType
                ? JOINT_MAP[series.cornerJointType] || series.cornerJointType
                : '—';

              return (
                <tr
                  key={series.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Cột 1: Mã hệ */}
                  <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">
                    {series.code || '—'}
                  </td>

                  {/* Cột 2: Tên hệ & Mô tả */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors text-sm">
                        {series.name}
                      </span>
                      {series.description ? (
                        <span className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {series.description}
                        </span>
                      ) : series.brand?.name ? (
                        <span className="text-xs text-slate-400 mt-0.5">
                          Hãng: {series.brand.name}
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {/* Cột 3: Độ dày */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-xs font-semibold text-slate-700">
                      {series.aluminumThickness ? `${series.aluminumThickness} mm` : '—'}
                    </span>
                  </td>

                  {/* Cột 4: Góc liên kết */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {jointLabel}
                    </span>
                  </td>

                  {/* Cột 5: Trạng thái */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border whitespace-nowrap ${
                        series.isActive !== false
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {series.isActive !== false ? 'Hoạt động' : 'Tạm ngưng'}
                    </span>
                  </td>

                  {/* Cột 6: Thao tác */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(series)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(series)}
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

