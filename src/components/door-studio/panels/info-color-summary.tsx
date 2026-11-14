'use client';

import React from 'react';
import { Palette, CheckCircle2 } from 'lucide-react';
import { ALUMINUM_PALETTE, ColorSwatch, HARDWARE_PALETTE } from '../studio-types';
import { formatCurrency } from '@/utils';

interface InfoColorSummaryProps {
  w: number;
  h: number;
  glassPrice: number;
  aluminumColor: string;
  hardwareColor: string;
  aluminumColors?: ColorSwatch[];
  sketchMode?: boolean;
  onChangeField: (field: string, val: string) => void;
}

export const InfoColorSummary: React.FC<InfoColorSummaryProps> = ({
  w,
  h,
  glassPrice,
  aluminumColor,
  hardwareColor,
  aluminumColors,
  sketchMode = false,
  onChangeField,
}) => {
  const activeColorPalette = aluminumColors && aluminumColors.length > 0 ? aluminumColors : ALUMINUM_PALETTE;
  const activeAluminum = activeColorPalette.find(
    (c) => c.colorHex.toLowerCase() === aluminumColor.toLowerCase(),
  );
  const activeHardware = HARDWARE_PALETTE.find(
    (c) => c.colorHex.toLowerCase() === hardwareColor.toLowerCase(),
  );

  return (
    <div className="lg:col-span-5 space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
          <Palette size={16} className="text-primary" />
          <h3 className="text-xs font-semibold text-slate-800">Màu sắc hoàn thiện bề mặt</h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">Màu khung / cánh</label>
            {activeAluminum && <span className="text-xs text-primary font-semibold">{activeAluminum.name}</span>}
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {activeColorPalette.map((col) => {
              const isSelected = aluminumColor.toLowerCase() === col.colorHex.toLowerCase();
              return (
                <button
                  key={col.code}
                  type="button"
                  onClick={() => onChangeField('aluminumColor', col.colorHex)}
                  className={`group flex flex-col items-center gap-1 p-1.5 rounded-md border transition cursor-pointer ${
                    isSelected ? 'border-primary bg-primary/5 shadow-2xs' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  title={col.name}
                >
                  <span
                    className={`w-6 h-6 rounded-full border shadow-2xs ${isSelected ? 'ring-2 ring-primary ring-offset-1' : 'border-slate-300'}`}
                    style={{ backgroundColor: col.colorHex }}
                  />
                  <span className="text-[10px] text-center text-slate-600 truncate w-full group-hover:text-slate-900 leading-tight">
                    {col.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">Màu phụ kiện</label>
            {activeHardware && <span className="text-xs text-primary font-semibold">{activeHardware.name}</span>}
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {HARDWARE_PALETTE.map((col) => {
              const isSelected = hardwareColor.toLowerCase() === col.colorHex.toLowerCase();
              return (
                <button
                  key={col.code}
                  type="button"
                  onClick={() => onChangeField('hardwareColor', col.colorHex)}
                  className={`group flex flex-col items-center gap-1 p-1.5 rounded-md border transition cursor-pointer ${
                    isSelected ? 'border-primary bg-primary/5 shadow-2xs' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  title={col.name}
                >
                  <span
                    className={`w-6 h-6 rounded-full border shadow-2xs ${isSelected ? 'ring-2 ring-primary ring-offset-1' : 'border-slate-300'}`}
                    style={{ backgroundColor: col.colorHex }}
                  />
                  <span className="text-[10px] text-center text-slate-600 truncate w-full group-hover:text-slate-900 leading-tight">
                    {col.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <h3 className="text-xs font-semibold text-slate-800">Tổng quan thông số</h3>
        </div>
        <div className="space-y-2 text-xs divide-y divide-slate-100">
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500">Diện tích phủ bì:</span>
            <span className="font-mono font-bold text-slate-800 tabular-nums">
              {((w * h) / 1000000).toFixed(2)} m²
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500">Kích thước chuẩn:</span>
            <span className="font-mono font-semibold text-slate-800 tabular-nums">
              {w} × {h} mm
            </span>
          </div>
          {!sketchMode && (
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Đơn giá kính mẫu:</span>
              <span className="font-mono font-bold text-primary tabular-nums">{formatCurrency(glassPrice)}/m²</span>
            </div>
          )}
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500">Phối màu khung:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: aluminumColor }} />
              <span className="font-medium text-slate-700">{activeAluminum?.name || aluminumColor}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
