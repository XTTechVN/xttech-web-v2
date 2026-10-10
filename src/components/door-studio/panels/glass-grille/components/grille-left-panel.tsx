'use client';

import React from 'react';
import { Lock, Unlock, Tag, Database, Trash2 } from 'lucide-react';
import { GlassGrilleMotif, GRILLE_COLORS, ColorSwatch } from '../../../studio-types';
import { Accessory } from '@/types';

interface GrilleLeftPanelProps {
  glassW: number;
  glassH: number;
  barColor: string;
  setBarColor: (color: string) => void;
  barWidth: number;
  setBarWidth: (width: number) => void;
  isSymmetric: boolean;
  setIsSymmetric: (val: boolean) => void;
  totalM: number;
  estimatedTotalPrice: number;
  totalSashesCount?: number;
  applyToAll: boolean;
  setApplyToAll: (val: boolean) => void;
  hasGrid: boolean;
  setHasGrid: (val: boolean) => void;
  hasBorder: boolean;
  setHasBorder: (val: boolean) => void;
  hasCorner: boolean;
  setHasCorner: (val: boolean) => void;
  cols: number;
  rows: number;
  onColsChange: (cols: number) => void;
  onRowsChange: (rows: number) => void;
  unitPricePerM: number;
  setUnitPricePerM: (price: number) => void;
  motifUnitPrice: number;
  setMotifUnitPrice: (price: number) => void;
  selectedMotifId: string | null;
  setSelectedMotifId: (id: string | null) => void;
  motifs: GlassGrilleMotif[];
  onUpdateSelectedMotif: (updates: Partial<GlassGrilleMotif>) => void;
  onAssignAccessoryToMotif: (accessoryIdStr: string) => void;
  onDeleteSelectedMotif: () => void;
  onClearAll: () => void;
  accessories: Accessory[];
  selectedMotifCardRef: React.RefObject<HTMLDivElement | null>;
}

export const GrilleLeftPanel: React.FC<GrilleLeftPanelProps> = ({
  glassW,
  glassH,
  barColor,
  setBarColor,
  barWidth,
  setBarWidth,
  isSymmetric,
  setIsSymmetric,
  totalM,
  estimatedTotalPrice,
  totalSashesCount = 1,
  applyToAll,
  setApplyToAll,
  hasGrid,
  setHasGrid,
  hasBorder,
  setHasBorder,
  hasCorner,
  setHasCorner,
  cols,
  rows,
  onColsChange,
  onRowsChange,
  unitPricePerM,
  setUnitPricePerM,
  motifUnitPrice,
  setMotifUnitPrice,
  selectedMotifId,
  setSelectedMotifId,
  motifs,
  onUpdateSelectedMotif,
  onAssignAccessoryToMotif,
  onDeleteSelectedMotif,
  onClearAll,
  accessories,
  selectedMotifCardRef,
}) => {
  const activeMotif = motifs.find((m) => m.id === selectedMotifId);

  return (
    <div className="w-full lg:w-[310px] shrink-0 border-r border-gray-200/80 bg-white flex flex-col overflow-y-auto p-4 space-y-3.5 text-xs">
      {/* Thông tin tấm kính & Khóa đối xứng */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Kích thước kính
          </div>
          <button
            type="button"
            onClick={() => setIsSymmetric(!isSymmetric)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10.5px] transition-all cursor-pointer ${
              isSymmetric
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            title="Khóa đối xứng nan: Khi kéo 1 nan, nan đối diện tự phản chiếu qua tâm kính"
          >
            {isSymmetric ? <Lock size={11} /> : <Unlock size={11} />}
            <span>{isSymmetric ? 'Khóa đối xứng' : 'Lệch tự do'}</span>
          </button>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Rộng × Cao kính:</span>
          <span className="font-mono font-bold text-gray-900">{glassW} × {glassH} mm</span>
        </div>
        <div className="flex justify-between items-center text-gray-600">
          <span>Nan đồng:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-gray-400" style={{ backgroundColor: barColor }} />
            <span className="font-mono font-bold text-amber-700">{barWidth}mm · {barColor}</span>
          </div>
        </div>
        <div className="flex justify-between text-gray-600 pt-1.5 border-t border-slate-200/60">
          <span>Tổng mét dài (bù 5%):</span>
          <span className="font-mono font-bold text-gray-900">{totalM} m</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tạm tính vật tư:</span>
          <span className="font-mono font-bold text-amber-800 text-xs">{estimatedTotalPrice.toLocaleString('vi-VN')} đ</span>
        </div>
      </div>

      {/* Áp dụng cho tất cả cánh */}
      {totalSashesCount > 1 && (
        <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 cursor-pointer">
          <input
            type="checkbox"
            checked={applyToAll}
            onChange={(e) => setApplyToAll(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
          />
          <div>
            <div className="font-bold text-amber-950 text-xs">Áp dụng cho tất cả {totalSashesCount} cánh</div>
            <div className="text-[10px] text-amber-700 mt-0.5 leading-snug">
              Đồng bộ thiết kế cho mọi tấm kính trong bộ cửa.
            </div>
          </div>
        </label>
      )}

      {/* Bật / Tắt thành phần thiết kế */}
      <div className="space-y-1.5">
        <div className="font-bold text-gray-800 text-xs">Thành phần nan</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'grid', label: 'Lưới', active: hasGrid, toggle: () => setHasGrid(!hasGrid) },
            { id: 'border', label: 'Viền', active: hasBorder, toggle: () => setHasBorder(!hasBorder) },
            { id: 'corner', label: 'Góc', active: hasCorner, toggle: () => setHasCorner(!hasCorner) },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.toggle}
              className={`py-2 px-2 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                item.active
                  ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-2xs'
                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
              }`}
            >
              {item.active ? `✓ ${item.label}` : item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Số cột & Số hàng nan */}
      <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-800 text-xs">Lưới nan chia khoang</span>
          <span className="text-[10.5px] text-slate-500 font-mono">
            {cols - 1} nan dọc × {rows - 1} nan ngang
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] text-gray-600 block mb-0.5">Số cột kính</label>
            <input
              type="number"
              min={1}
              max={8}
              value={cols}
              onChange={(e) => onColsChange(Number(e.target.value) || 1)}
              className="w-full h-8 px-2.5 font-mono font-bold text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-[11px] text-gray-600 block mb-0.5">Số hàng kính</label>
            <input
              type="number"
              min={1}
              max={8}
              value={rows}
              onChange={(e) => onRowsChange(Number(e.target.value) || 1)}
              className="w-full h-8 px-2.5 font-mono font-bold text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Chiều rộng nan & Màu nan */}
      <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
        <div className="font-bold text-gray-800 text-xs">Quy cách thanh nan</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] text-gray-600 block mb-0.5">Bề rộng nan:</label>
            <select
              value={barWidth}
              onChange={(e) => setBarWidth(Number(e.target.value))}
              className="w-full h-8 px-2 text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-amber-500 font-bold"
            >
              {[6, 8, 10, 12, 16, 18, 20].map((wVal) => (
                <option key={wVal} value={wVal}>
                  {wVal} mm
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-gray-600 block mb-0.5">Màu nan:</label>
            <div className="flex items-center gap-1.5 mt-1">
              {GRILLE_COLORS.slice(0, 4).map((cItem: ColorSwatch) => (
                <button
                  key={cItem.colorHex}
                  type="button"
                  onClick={() => setBarColor(cItem.colorHex)}
                  className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                    barColor.toLowerCase() === cItem.colorHex.toLowerCase()
                      ? 'border-blue-600 scale-110 shadow-xs'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: cItem.colorHex }}
                  title={cItem.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Đơn giá vật tư */}
      <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
        <div className="flex items-center justify-between">
          <div className="font-bold text-gray-800 text-xs">Đơn giá vật tư (Tính BOM)</div>
          <span className="text-[10px] text-slate-500 font-mono">Bóc tách chi phí</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10.5px] text-gray-600 block mb-0.5">Giá nan (đ/m):</label>
            <input
              type="number"
              min={0}
              step={5000}
              value={unitPricePerM}
              onChange={(e) => setUnitPricePerM(Number(e.target.value) || 0)}
              className="w-full h-8 px-2 font-mono font-bold text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-[10.5px] text-gray-600 block mb-0.5">Giá hoa (đ/con):</label>
            <input
              type="number"
              min={0}
              step={10000}
              value={motifUnitPrice}
              onChange={(e) => setMotifUnitPrice(Number(e.target.value) || 0)}
              className="w-full h-8 px-2 font-mono font-bold text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
          <span className="text-gray-600">Tạm tính nan kính:</span>
          <span className="font-mono font-bold text-amber-800 text-sm">
            {estimatedTotalPrice.toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>

      {/* Chi tiết hoa văn đang chọn */}
      {selectedMotifId && activeMotif && (
        <div
          ref={selectedMotifCardRef}
          className="space-y-2 p-3 rounded-xl bg-amber-50/90 border-2 border-amber-400 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
              <Tag size={13} className="text-amber-600" />
              <span>Hoa văn đang chọn</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedMotifId(null)}
              className="text-amber-800 hover:text-amber-950 text-[10.5px] font-semibold px-1.5 py-0.5 rounded hover:bg-amber-200/50 cursor-pointer"
            >
              Đóng
            </button>
          </div>

          <div className="flex items-center justify-between bg-amber-100/60 px-2 py-1 rounded-lg text-[10.5px]">
            <span className="text-amber-900 font-medium">
              Giao điểm: Nan ({((activeMotif.gridCol ?? 0) + 1)}, {((activeMotif.gridRow ?? 0) + 1)})
            </span>
            <span className="font-mono text-amber-800 font-semibold">
              {Math.round(activeMotif.width)}×{Math.round(activeMotif.height)} mm
            </span>
          </div>

          <div>
            <label className="text-[10.5px] text-gray-700 block mb-0.5 font-medium">Tên hoa văn:</label>
            <input
              type="text"
              value={activeMotif.name || ''}
              onChange={(e) => onUpdateSelectedMotif({ name: e.target.value })}
              className="w-full h-7 px-2 text-xs bg-white rounded-lg border border-amber-300 focus:outline-none focus:border-amber-500 font-medium text-gray-900"
            />
          </div>

          <div>
            <label className="text-[10.5px] text-gray-700 mb-0.5 font-medium flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Database size={11} className="text-amber-600" />
                <span>Kho phụ kiện CSDL:</span>
              </span>
              {activeMotif.accessoryCode && (
                <span className="font-mono text-[10px] text-amber-800 font-bold bg-amber-100 px-1 rounded">
                  {activeMotif.accessoryCode}
                </span>
              )}
            </label>
            <select
              value={activeMotif.accessoryId || ''}
              onChange={(e) => onAssignAccessoryToMotif(e.target.value)}
              className="w-full h-7 px-1.5 text-[11px] bg-white rounded-lg border border-amber-300 focus:outline-none focus:border-amber-500 font-medium text-gray-800"
            >
              <option value="">-- Chọn phụ kiện trong kho --</option>
              {accessories.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.code ? `[${acc.code}] ` : ''}{acc.name} ({((acc.unitPrice || acc.salePrice || 0)).toLocaleString('vi-VN')} đ)
                </option>
              ))}
            </select>
          </div>

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
                value={activeMotif.price ?? motifUnitPrice}
                onChange={(e) => onUpdateSelectedMotif({ price: Number(e.target.value) || 0 })}
                className="w-full h-8 px-2.5 pr-12 font-mono font-bold text-xs bg-white rounded-lg border-2 border-amber-400 focus:outline-none focus:border-amber-600 text-gray-950 shadow-2xs"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10.5px] text-gray-600 font-bold">
                đ/con
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onDeleteSelectedMotif}
            className="w-full py-1.5 px-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-semibold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1 mt-1"
          >
            <Trash2 size={12} />
            <span>Xóa hoa văn này</span>
          </button>
        </div>
      )}

      {/* Nút xóa làm trống */}
      <button
        type="button"
        onClick={onClearAll}
        className="w-full py-2 px-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-semibold text-xs transition-colors cursor-pointer"
      >
        Làm trống toàn bộ nan
      </button>
    </div>
  );
};
