'use client';

import React from 'react';
import { Tag, Database, Trash2, RotateCw } from 'lucide-react';
import { GlassGrilleMotif, MOTIF_ROTATION_OPTIONS } from '../../../studio-types';
import { Accessory } from '@/types';
import { Select } from '@/components/select';

export interface GrilleSelectedMotifCardProps {
  cardRef?: React.RefObject<HTMLDivElement | null>;
  motif: GlassGrilleMotif;
  motifUnitPrice: number;
  accessories: Accessory[];
  onClose: () => void;
  onUpdateMotif: (updates: Partial<GlassGrilleMotif>) => void;
  onRotateMotif: (angle: number) => void;
  onCycleRotation: () => void;
  onAssignAccessory: (accessoryIdStr: string) => void;
  onDeleteMotif: () => void;
}

export const GrilleSelectedMotifCard: React.FC<GrilleSelectedMotifCardProps> = ({
  cardRef,
  motif,
  motifUnitPrice,
  accessories,
  onClose,
  onUpdateMotif,
  onRotateMotif,
  onCycleRotation,
  onAssignAccessory,
  onDeleteMotif,
}) => {
  const currentRotation = motif.rotation || 0;
  const isSwapped = currentRotation === 90 || currentRotation === 270;
  const dispW = Math.round(isSwapped ? motif.height : motif.width);
  const dispH = Math.round(isSwapped ? motif.width : motif.height);

  return (
    <div
      ref={cardRef}
      className="space-y-2 p-3 rounded-xl bg-amber-50/90 border-2 border-amber-400 shadow-sm transition-all"
    >
      {/* Tiêu đề & Nút đóng */}
      <div className="flex items-center justify-between">
        <div className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
          <Tag size={13} className="text-amber-600" />
          <span>Hoa văn đang chọn</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-amber-800 hover:text-amber-950 text-[10.5px] font-semibold px-1.5 py-0.5 rounded hover:bg-amber-200/50 cursor-pointer"
        >
          Đóng
        </button>
      </div>

      {/* Thông tin tọa độ & Kích thước sau xoay */}
      <div className="flex items-center justify-between bg-amber-100/60 px-2 py-1 rounded-lg text-[10.5px]">
        <span className="text-amber-900 font-medium">
          Giao điểm: Nan ({((motif.gridCol ?? 0) + 1)}, {((motif.gridRow ?? 0) + 1)})
        </span>
        <span className="font-mono text-amber-800 font-semibold">
          {dispW}×{dispH} mm{currentRotation !== 0 && ` (${currentRotation}°)`}
        </span>
      </div>

      {/* Góc xoay hoa văn */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10.5px] text-gray-700 font-medium flex items-center gap-1">
            <RotateCw size={11} className="text-amber-600" />
            <span>Góc xoay:</span>
          </label>
          <button
            type="button"
            onClick={onCycleRotation}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-200/70 hover:bg-amber-200 text-amber-900 text-[10px] font-semibold cursor-pointer transition-colors"
            title="Xoay nhanh +90° theo chiều kim đồng hồ"
          >
            <RotateCw size={10} />
            <span>+90°</span>
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {MOTIF_ROTATION_OPTIONS.map((opt) => {
            const isActive = currentRotation === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onRotateMotif(opt.value)}
                className={`py-1 px-1 rounded-md text-[10.5px] font-semibold transition-all cursor-pointer text-center ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-white text-amber-950 border border-amber-200 hover:bg-amber-100/70'
                }`}
                title={opt.label}
              >
                {opt.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tên hoa văn */}
      <div>
        <label className="text-[10.5px] text-gray-700 block mb-0.5 font-medium">Tên hoa văn:</label>
        <input
          type="text"
          value={motif.name || ''}
          onChange={(e) => onUpdateMotif({ name: e.target.value })}
          className="w-full h-7 px-2 text-xs bg-white rounded-lg border border-amber-300 focus:outline-none focus:border-amber-500 font-medium text-gray-900"
        />
      </div>

      {/* Kho phụ kiện CSDL */}
      <div>
        <label className="text-[10.5px] text-gray-700 mb-0.5 font-medium flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Database size={11} className="text-amber-600" />
            <span>Kho phụ kiện CSDL:</span>
          </span>
          {motif.accessoryCode && (
            <span className="font-mono text-[10px] text-amber-800 font-bold bg-amber-100 px-1 rounded">
              {motif.accessoryCode}
            </span>
          )}
        </label>
        <Select
          fullWidth
          value={motif.accessoryId || ''}
          onChange={(e) => onAssignAccessory(e.target.value)}
          options={[
            { value: '', label: '-- Chọn phụ kiện trong kho --' },
            ...accessories.map((acc) => ({
              value: acc.id,
              label: `${acc.code ? `[${acc.code}] ` : ''}${acc.name} (${(acc.costPrice || 0).toLocaleString('vi-VN')} đ)`,
            })),
          ]}
          placeholder="-- Chọn phụ kiện trong kho --"
          className="h-7 py-0 pl-1.5 pr-6 text-[11px] md:text-[11px] bg-white rounded-lg border-amber-300 font-medium text-gray-800"
        />
      </div>

      {/* Đơn giá riêng con này */}
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <label className="text-[10.5px] text-amber-950 font-bold">
            Đơn giá con hoa văn này:
          </label>
          <span className="text-[9.5px] text-amber-700 bg-amber-200/60 px-1 rounded font-medium">
            Riêng con này
          </span>
        </div>
        <div className="relative">
          <input
            type="number"
            min={0}
            step={1000}
            value={motif.price ?? motifUnitPrice}
            onChange={(e) => onUpdateMotif({ price: Number(e.target.value) || 0 })}
            className="w-full h-8 px-2.5 pr-12 font-mono font-bold text-xs bg-white rounded-lg border-2 border-amber-400 focus:outline-none focus:border-amber-600 text-gray-950 shadow-2xs"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10.5px] text-gray-600 font-bold">
            đ/con
          </span>
        </div>
      </div>

      {/* Nút xóa */}
      <button
        type="button"
        onClick={onDeleteMotif}
        className="w-full py-1.5 px-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-semibold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1 mt-1"
      >
        <Trash2 size={12} />
        <span>Xóa hoa văn này</span>
      </button>
    </div>
  );
};
