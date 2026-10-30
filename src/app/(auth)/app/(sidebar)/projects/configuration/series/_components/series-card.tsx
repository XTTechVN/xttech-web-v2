'use client';

import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { DoorSeries } from '@/types';

interface SeriesCardProps {
  series: DoorSeries;
  onEdit: (series: DoorSeries) => void;
  onDelete: (series: DoorSeries) => void;
}

const JOINT_MAP: Record<string, string> = {
  ke_ep_goc: 'Ke ép góc',
  ke_vinh_cuu: 'Ke vĩnh cửu',
  ke_nhay: 'Ke nhảy',
  ke_bat_vit: 'Ke bắt vít',
};

export function SeriesCard({ series, onEdit, onDelete }: SeriesCardProps) {
  const jointLabel = series.cornerJointType ? JOINT_MAP[series.cornerJointType] || series.cornerJointType : '—';
  const brandName = series.brand?.name || (series.brandId ? `Hãng #${series.brandId}` : '');

  return (
    <div className="group bg-white border border-slate-200 hover:border-primary/50 hover:shadow-2xs rounded-xl p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 transition-all duration-200">
      {/* Khối Thông tin chính: Tên hệ nhôm & Hãng */}
      <div className="flex flex-col min-w-0">
        <h4
          className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-primary transition-colors truncate"
          title={series.name}
        >
          {series.name}
        </h4>

        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
          {brandName && <span className="font-medium text-slate-700">Hãng: {brandName}</span>}
          {series.description && (
            <>
              <span>•</span>
              <span className="text-slate-400 truncate max-w-xs">{series.description}</span>
            </>
          )}
        </div>
      </div>

      {/* Khối Thông số kỹ thuật & Trạng thái & Thao tác */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap md:flex-nowrap justify-between md:justify-end">
        {/* Độ dày */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
          <span className="text-slate-500">Độ dày:</span>
          <strong className="text-slate-800 font-semibold">
            {series.aluminumThickness ? `${series.aluminumThickness} mm` : '—'}
          </strong>
        </div>

        {/* Kiểu liên kết góc */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
          <span className="text-slate-500">Góc:</span>
          <strong className="text-slate-800 font-semibold">{jointLabel}</strong>
        </div>

        {/* Trạng thái */}
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
            series.isActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${series.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}
          />
          {series.isActive ? 'Hoạt động' : 'Tạm ngưng'}
        </span>

        {/* Thao tác */}
        <div className="flex items-center gap-1 pl-1">
          <button
            type="button"
            onClick={() => onEdit(series)}
            className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition cursor-pointer"
            title="Sửa hệ nhôm"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(series)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            title="Xóa hệ nhôm"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
