'use client';

import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, ArrowUp, ArrowDown, ArrowUpDown, Star, ShieldCheck, Loader2 } from 'lucide-react';
import type { Glass, GlassCategory } from '@/types';
import { formatCurrency } from '@/utils';

interface GlassTableProps {
  glasses: Glass[];
  categories: GlassCategory[];
  onEdit: (glass: Glass) => void;
  onDelete: (glass: Glass) => void;
  onSetDefault: (glass: Glass) => void;
  settingDefaultId?: number | null;
}

type SortField = 'code' | 'name' | 'thickness' | 'weight' | 'price' | 'status';
type SortOrder = 'asc' | 'desc';

const GLASS_TYPE_LABELS: Record<string, { label: string; badgeClass: string }> = {
  cuong_luc: { label: 'Cường lực', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  dan_an_toan: { label: 'Dán an toàn', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  kinh_hop: { label: 'Kính hộp', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
  trang: { label: 'Kính phôi/sống', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  panel_alu: { label: 'Panel Alu', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  luoi_muoi: { label: 'Lưới muỗi', badgeClass: 'bg-teal-50 text-teal-700 border-teal-200' },
  nan_chop: { label: 'Nan chớp', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  tam_to_ong: { label: 'Tổ ong', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
  kinh_hop_rem: { label: 'Kính rèm', badgeClass: 'bg-pink-50 text-pink-700 border-pink-200' },
  polycarbonate: { label: 'Polycarbonate', badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
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

export function GlassTable({
  glasses,
  categories,
  onEdit,
  onDelete,
  onSetDefault,
  settingDefaultId,
}: GlassTableProps) {
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
    if (!sortField) return glasses;

    return [...glasses].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'code':
          comparison = (a.code || '').localeCompare(b.code || '', 'vi', { sensitivity: 'base' });
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '', 'vi', { sensitivity: 'base' });
          break;
        case 'thickness':
          comparison = (Number(a.thicknessMm) || 0) - (Number(b.thicknessMm) || 0);
          break;
        case 'weight':
          comparison = (Number(a.weightPerM2) || 0) - (Number(b.weightPerM2) || 0);
          break;
        case 'price':
          comparison = (Number(a.unitPrice) || 0) - (Number(b.unitPrice) || 0);
          break;
        case 'status':
          comparison = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [glasses, sortField, sortOrder]);

  const catMap = useMemo(() => {
    const map = new Map<number, GlassCategory>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600 select-none">
              {/* Cột 1: Mã hiệu */}
              <th
                onClick={() => handleSort('code')}
                className="py-3 px-4 w-36 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Mã"
              >
                <div className="flex items-center gap-1.5">
                  <span>Mã hiệu</span>
                  <SortIcon active={sortField === 'code'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 2: Tên quy cách */}
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 min-w-[220px] cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Tên"
              >
                <div className="flex items-center gap-1.5">
                  <span>Tên quy cách vật tư</span>
                  <SortIcon active={sortField === 'name'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 3: Chủng loại */}
              <th className="py-3 px-4 text-center w-36">
                <span>Chủng loại</span>
              </th>

              {/* Cột 4: Độ dày */}
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

              {/* Cột 5: Khối lượng */}
              <th
                onClick={() => handleSort('weight')}
                className="py-3 px-4 text-center w-28 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Khối lượng"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Trọng lượng</span>
                  <SortIcon active={sortField === 'weight'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 6: Đơn giá */}
              <th
                onClick={() => handleSort('price')}
                className="py-3 px-4 text-right w-36 cursor-pointer group/th hover:text-slate-800 transition-colors"
                title="Sắp xếp theo Đơn giá"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Đơn giá (m²)</span>
                  <SortIcon active={sortField === 'price'} order={sortOrder} />
                </div>
              </th>

              {/* Cột 7: Trạng thái & Mặc định */}
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
          <tbody className="divide-y divide-slate-100 text-xs">
            {sortedList.map((glass) => {
              const typeConfig = GLASS_TYPE_LABELS[glass.glassType] || {
                label: glass.glassType,
                badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
              };
              const categoryName = glass.categoryId ? catMap.get(glass.categoryId)?.name : null;

              return (
                <tr
                  key={glass.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Cột 1: Mã hiệu */}
                  <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">
                    <span>{glass.code || '—'}</span>
                  </td>

                  {/* Cột 2: Tên quy cách */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors text-xs">
                        {glass.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        {categoryName && (
                          <span>Nhóm: <strong className="text-slate-600 font-medium">{categoryName}</strong></span>
                        )}
                        {Boolean(glass.maxWidthMm && glass.maxHeightMm) && (
                          <>
                            <span>•</span>
                            <span>Khổ max: {glass.maxWidthMm}×{glass.maxHeightMm} mm</span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Cột 3: Chủng loại */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${typeConfig.badgeClass}`}
                    >
                      {typeConfig.label}
                    </span>
                  </td>

                  {/* Cột 4: Độ dày */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-xs font-semibold text-slate-700">
                      {glass.thicknessMm ? `${glass.thicknessMm} mm` : '—'}
                    </span>
                  </td>

                  {/* Cột 5: Trọng lượng */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-xs font-medium text-slate-600">
                      {glass.weightPerM2 ? `${glass.weightPerM2} kg/m²` : '—'}
                    </span>
                  </td>

                  {/* Cột 6: Đơn giá */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-bold text-slate-900 text-xs">
                      {formatCurrency(glass.unitPrice || 0)}
                    </span>
                  </td>

                  {/* Cột 7: Trạng thái & Mặc định toggle */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border whitespace-nowrap ${
                          glass.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {glass.isActive !== false ? 'Hoạt động' : 'Tạm khóa'}
                      </span>
                      {settingDefaultId === glass.id ? (
                        <span
                          className="p-1 text-primary inline-flex items-center justify-center animate-spin"
                          title="Đang cập nhật..."
                        >
                          <Star size={15} className="fill-primary/60 text-primary" />
                        </span>
                      ) : glass.isDefault ? (
                        <span
                          className="p-1 text-primary inline-flex items-center justify-center"
                          title="Đang là kính mặc định hệ thống"
                        >
                          <Star size={15} className="fill-primary text-primary" />
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={settingDefaultId !== null && settingDefaultId !== undefined}
                          onClick={() => onSetDefault(glass)}
                          className="p-1 text-slate-300 hover:text-primary rounded transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                          title="Đặt làm quy cách mặc định"
                        >
                          <Star size={15} />
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Cột 8: Hành động */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(glass)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
                        title="Chỉnh sửa quy cách"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(glass)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Xóa quy cách"
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
