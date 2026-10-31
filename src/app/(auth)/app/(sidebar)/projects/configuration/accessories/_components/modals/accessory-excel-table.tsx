'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, Trash2 } from 'lucide-react';
import type {
  Brand,
  AccessoryCategory,
  AccessoryExcelItemData,
  AccessoryExcelPreviewRow,
} from '@/types';

const UNIT_OPTIONS = [
  { value: 'set', label: 'Bộ (set)' },
  { value: 'pcs', label: 'Cái (pcs)' },
  { value: 'unit', label: 'Chiếc (unit)' },
  { value: 'pair', label: 'Đôi / Cặp (pair)' },
  { value: 'roll', label: 'Cuộn (roll)' },
  { value: 'box', label: 'Hộp (box)' },
  { value: 'meter', label: 'Mét (meter)' },
];

const COLOR_OPTIONS = [
  { value: 'black', label: 'Đen (black)' },
  { value: 'white', label: 'Trắng (white)' },
  { value: 'silver', label: 'Bạc / Inox (silver)' },
  { value: 'gold', label: 'Vàng (gold)' },
  { value: 'grey', label: 'Xám / Ghi (grey)' },
  { value: 'brown', label: 'Nâu (brown)' },
  { value: 'other', label: 'Khác (other)' },
];

interface AccessoryExcelTableProps {
  rows: AccessoryExcelPreviewRow[];
  brands: Brand[];
  categories: AccessoryCategory[];
  onUpdateCell: (rowIndex: number, patch: Partial<AccessoryExcelItemData>) => void;
  onRemoveRow: (rowIndex: number) => void;
}

export function AccessoryExcelTable({
  rows,
  brands,
  categories,
  onUpdateCell,
  onRemoveRow,
}: AccessoryExcelTableProps) {
  return (
    <div className="overflow-x-auto flex-1">
      <table className="w-full text-xs border-collapse min-w-[1220px]">
        <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 z-10 border-b border-slate-200">
          <tr>
            <th className="p-2.5 text-center w-12">#</th>
            <th className="p-2.5 text-left w-36">Trạng thái</th>
            <th className="p-2.5 text-left w-36">Mã phụ kiện (*)</th>
            <th className="p-2.5 text-left w-56">Tên phụ kiện (*)</th>
            <th className="p-2.5 text-left w-40">Hãng phụ kiện (*)</th>
            <th className="p-2.5 text-left w-44">Danh mục</th>
            <th className="p-2.5 text-left w-32">Đơn vị (*)</th>
            <th className="p-2.5 text-left w-32">Màu sắc</th>
            <th className="p-2.5 text-left w-44">Quy cách</th>
            <th className="p-2.5 text-right w-32">Giá bán (đ) (*)</th>
            <th className="p-2.5 text-right w-32">Giá vốn (đ)</th>
            <th className="p-2.5 text-center w-12">Xóa</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
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
                    value={row.data.brandId ?? ''}
                    onChange={(e) =>
                      onUpdateCell(row.rowIndex, {
                        brandId: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs"
                  >
                    <option value="">-- Chọn hãng --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.code} - {b.name}
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
                    <option value="">-- Không phân loại --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-1.5">
                  <select
                    value={row.data.unit}
                    onChange={(e) => onUpdateCell(row.rowIndex, { unit: e.target.value })}
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs"
                  >
                    {UNIT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-1.5">
                  <select
                    value={row.data.color}
                    onChange={(e) => onUpdateCell(row.rowIndex, { color: e.target.value })}
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs"
                  >
                    {COLOR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-1.5">
                  <input
                    value={row.data.specification ?? ''}
                    onChange={(e) =>
                      onUpdateCell(row.rowIndex, { specification: e.target.value || null })
                    }
                    placeholder="Quy cách..."
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs"
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
                    value={row.data.costPrice}
                    onChange={(e) =>
                      onUpdateCell(row.rowIndex, { costPrice: Number(e.target.value) })
                    }
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs text-right"
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
