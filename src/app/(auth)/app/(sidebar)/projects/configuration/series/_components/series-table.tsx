'use client';

import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { DoorSeries } from '@/types';

interface SeriesTableProps {
  seriesList: DoorSeries[];
  onEdit: (series: DoorSeries) => void;
  onDelete: (series: DoorSeries) => void;
}

const JOINT_MAP: Record<string, string> = {
  ke_ep_goc: 'Ke ép góc',
  ke_vinh_cuu: 'Ke vĩnh cửu',
  ke_nhay: 'Ke nhảy',
  ke_bat_vit: 'Ke bắt vít',
};

export function SeriesTable({ seriesList, onEdit, onDelete }: SeriesTableProps) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-36">Mã hệ</th>
              <th className="py-3 px-4 min-w-[200px]">Mô tả / Tên hệ nhôm</th>
              <th className="py-3 px-4 text-center w-28">Độ dày</th>
              <th className="py-3 px-4 text-center w-36">Liên kết góc</th>
              <th className="py-3 px-4 text-center w-32">Trạng thái</th>
              <th className="py-3 px-4 text-right w-24">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {seriesList.map((series) => {
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
