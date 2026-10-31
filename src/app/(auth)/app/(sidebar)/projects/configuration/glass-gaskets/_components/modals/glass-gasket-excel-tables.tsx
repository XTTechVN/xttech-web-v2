'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, Trash2 } from 'lucide-react';
import type { GlassCategory, GlassExcelItemData, GlassExcelPreviewRow } from '@/types';
import { getCategoryMaterialType } from '../glass-category-sidebar';

const MATERIAL_TYPE_OPTIONS: Array<{ value: 'glass' | 'panel' | 'screen_mesh'; label: string }> = [
  { value: 'glass', label: 'Kính (glass)' },
  { value: 'panel', label: 'Tấm Pano (panel)' },
  { value: 'screen_mesh', label: 'Lưới muỗi (screen_mesh)' },
];

interface GlassExcelTableProps {
  rows: GlassExcelPreviewRow[];
  categories: GlassCategory[];
  onUpdateCell: (rowIndex: number, patch: Partial<GlassExcelItemData>) => void;
  onRemoveRow: (rowIndex: number) => void;
}

export function GlassExcelTable({
  rows,
  categories,
  onUpdateCell,
  onRemoveRow,
}: GlassExcelTableProps) {
  return (
    <div className="overflow-x-auto flex-1">
      <table className="w-full text-xs border-collapse min-w-[1250px]">
        <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 z-10 border-b border-slate-200">
          <tr>
            <th className="p-2.5 text-center w-12">#</th>
            <th className="p-2.5 text-left w-36">Trạng thái</th>
            <th className="p-2.5 text-left w-32">Mã quy cách (*)</th>
            <th className="p-2.5 text-left w-56">Tên quy cách (*)</th>
            <th className="p-2.5 text-left w-36">Loại vật tư (*)</th>
            <th className="p-2.5 text-left w-48">Nhóm chủng loại (*)</th>
            <th className="p-2.5 text-right w-24">Dày (mm) (*)</th>
            <th className="p-2.5 text-right w-32">Đơn giá (đ/m²) (*)</th>
            <th className="p-2.5 text-right w-24">KL (kg/m²)</th>
            <th className="p-2.5 text-right w-24">Rộng max</th>
            <th className="p-2.5 text-right w-24">Cao max</th>
            <th className="p-2.5 text-center w-20">Mặc định</th>
            <th className="p-2.5 text-center w-12">Xóa</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const filteredCats = categories.filter(
              (c) => getCategoryMaterialType(c) === row.data.materialType,
            );
            const isErr = row.action === 'ERROR';
            const isUpd = row.action === 'UPDATE';
            return (
              <tr
                key={row.rowIndex}
                className={
                  isErr ? 'bg-rose-50/40' : isUpd ? 'bg-blue-50/20' : 'hover:bg-slate-50/70'
                }
              >
                <td className="p-2 text-center font-mono text-slate-400">{row.rowIndex}</td>
                <td className="p-2">
                  {isErr ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 w-fit">
                        <AlertTriangle size={11} /> Lỗi
                      </span>
                      <span className="text-[11px] text-rose-600 font-medium leading-tight">
                        {row.errors.join(', ')}
                      </span>
                    </div>
                  ) : isUpd ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
                      <RefreshCw size={11} /> Cập nhật
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                      <CheckCircle2 size={11} /> Thêm mới
                    </span>
                  )}
                </td>
                <td className="p-1.5">
                  <input
                    value={row.data.code}
                    onChange={(e) => onUpdateCell(row.rowIndex, { code: e.target.value })}
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs font-mono"
                  />
                </td>
                <td className="p-1.5">
                  <input
                    value={row.data.name}
                    onChange={(e) => onUpdateCell(row.rowIndex, { name: e.target.value })}
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs"
                  />
                  {isUpd && row.oldData && row.oldData.name !== row.data.name && (
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      Cũ: {row.oldData.name}
                    </div>
                  )}
                </td>
                <td className="p-1.5">
                  <select
                    value={row.data.materialType}
                    onChange={(e) =>
                      onUpdateCell(row.rowIndex, {
                        materialType: e.target.value as 'glass' | 'panel' | 'screen_mesh',
                      })
                    }
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs"
                  >
                    {MATERIAL_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-1.5">
                  <select
                    value={row.data.categoryId ?? ''}
                    onChange={(e) =>
                      onUpdateCell(row.rowIndex, {
                        categoryId: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs"
                  >
                    <option value="">-- Chọn nhóm --</option>
                    {(filteredCats.length > 0 ? filteredCats : categories).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-1.5">
                  <input
                    type="number"
                    step="0.1"
                    value={row.data.thicknessMm}
                    onChange={(e) =>
                      onUpdateCell(row.rowIndex, { thicknessMm: Number(e.target.value) })
                    }
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs text-right"
                  />
                </td>
                <td className="p-1.5">
                  <input
                    type="number"
                    value={row.data.unitPrice}
                    onChange={(e) =>
                      onUpdateCell(row.rowIndex, { unitPrice: Number(e.target.value) })
                    }
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs text-right"
                  />
                  {isUpd && row.oldData && row.oldData.unitPrice !== row.data.unitPrice && (
                    <div className="text-[10px] text-amber-600 text-right mt-0.5">
                      Cũ: {row.oldData.unitPrice.toLocaleString('vi-VN')}
                    </div>
                  )}
                </td>
                <td className="p-1.5">
                  <input
                    type="number"
                    step="0.1"
                    value={row.data.weightPerM2}
                    onChange={(e) =>
                      onUpdateCell(row.rowIndex, { weightPerM2: Number(e.target.value) })
                    }
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs text-right"
                  />
                </td>
                <td className="p-1.5">
                  <input
                    type="number"
                    value={row.data.maxWidthMm ?? ''}
                    onChange={(e) =>
                      onUpdateCell(row.rowIndex, {
                        maxWidthMm: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs text-right"
                  />
                </td>
                <td className="p-1.5">
                  <input
                    type="number"
                    value={row.data.maxHeightMm ?? ''}
                    onChange={(e) =>
                      onUpdateCell(row.rowIndex, {
                        maxHeightMm: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs text-right"
                  />
                </td>
                <td className="p-1.5 text-center">
                  <input
                    type="checkbox"
                    checked={row.data.isDefault}
                    onChange={(e) => onUpdateCell(row.rowIndex, { isDefault: e.target.checked })}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                </td>
                <td className="p-1.5 text-center">
                  <button
                    type="button"
                    onClick={() => onRemoveRow(row.rowIndex)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
