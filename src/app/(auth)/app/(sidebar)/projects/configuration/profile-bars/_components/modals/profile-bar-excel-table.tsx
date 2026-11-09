'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, Trash2 } from 'lucide-react';
import type {
  Brand,
  DoorSeries,
  ProfileSection,
  ProfileBarExcelItemData,
  ProfileBarExcelPreviewRow,
} from '@/types';

const BAR_TYPE_OPTIONS = [
  { value: 'FRAME', label: 'Khung bao (FRAME)' },
  { value: 'SASH', label: 'Cánh cửa (SASH)' },
  { value: 'MULLION', label: 'Đố chia (MULLION)' },
  { value: 'BEAD', label: 'Nẹp kính (BEAD)' },
  { value: 'TRACK', label: 'Ray trượt (TRACK)' },
  { value: 'COVER', label: 'Ốp / Nắp che (COVER)' },
  { value: 'CORNER', label: 'Ke góc (CORNER)' },
  { value: 'OTHER', label: 'Khác (OTHER)' },
];

interface ProfileBarExcelTableProps {
  rows: ProfileBarExcelPreviewRow[];
  brands: Brand[];
  seriesList: DoorSeries[];
  sectionsList: ProfileSection[];
  onUpdateCell: (rowIndex: number, patch: Partial<ProfileBarExcelItemData>) => void;
  onRemoveRow: (rowIndex: number) => void;
}

export function ProfileBarExcelTable({
  rows,
  brands,
  seriesList,
  sectionsList,
  onUpdateCell,
  onRemoveRow,
}: ProfileBarExcelTableProps) {
  return (
    <div className="overflow-x-auto flex-1">
      <table className="w-full text-xs border-collapse min-w-[1380px]">
        <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 z-10 border-b border-slate-200">
          <tr>
            <th className="p-2.5 text-center w-12">#</th>
            <th className="p-2.5 text-left w-36">Trạng thái</th>
            <th className="p-2.5 text-left w-32">Mã thanh (*)</th>
            <th className="p-2.5 text-left w-52">Tên thanh (*)</th>
            <th className="p-2.5 text-left w-40">Hãng nhôm (*)</th>
            <th className="p-2.5 text-left w-44">Hệ nhôm (*)</th>
            <th className="p-2.5 text-left w-40">Vai trò (*)</th>
            <th className="p-2.5 text-right w-28">Tỷ trọng (*)</th>
            <th className="p-2.5 text-right w-24">Dài (mm)</th>
            <th className="p-2.5 text-right w-24">Cao (mm)</th>
            <th className="p-2.5 text-right w-20">Trừ cánh</th>
            <th className="p-2.5 text-right w-20">Trừ nẹp</th>
            <th className="p-2.5 text-right w-20">Trừ kính</th>
            <th className="p-2.5 text-right w-20">Trừ đố</th>
            <th className="p-2.5 text-left w-36">Mặt cắt SVG</th>
            <th className="p-2.5 text-center w-12">Xóa</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const rowSeries = seriesList.filter(
              (s) => !row.data.brandId || s.brandId === Number(row.data.brandId),
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
                        <AlertTriangle size={11} /> Lỗi dữ liệu
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
                    placeholder="Mã thanh..."
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs font-mono"
                  />
                </td>
                <td className="p-1.5">
                  <input
                    value={row.data.name}
                    onChange={(e) => onUpdateCell(row.rowIndex, { name: e.target.value })}
                    placeholder="Tên thanh..."
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
                    value={row.data.seriesId ?? ''}
                    onChange={(e) =>
                      onUpdateCell(row.rowIndex, {
                        seriesId: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs"
                  >
                    <option value="">-- Chọn hệ nhôm --</option>
                    {rowSeries.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-1.5">
                  <select
                    value={row.data.barType}
                    onChange={(e) => onUpdateCell(row.rowIndex, { barType: e.target.value })}
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs"
                  >
                    {BAR_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-1.5">
                  <input
                    type="number"
                    step="0.001"
                    value={row.data.weightPerM}
                    onChange={(e) =>
                      onUpdateCell(row.rowIndex, { weightPerM: Number(e.target.value) })
                    }
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs text-right"
                  />
                  {isUpd && row.oldData && row.oldData.weightPerM !== row.data.weightPerM && (
                    <div className="text-[10px] text-amber-600 text-right mt-0.5">
                      Cũ: {row.oldData.weightPerM}
                    </div>
                  )}
                </td>
                <td className="p-1.5">
                  <input
                    type="number"
                    value={row.data.barLengthMm}
                    onChange={(e) =>
                      onUpdateCell(row.rowIndex, { barLengthMm: Number(e.target.value) })
                    }
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs text-right"
                  />
                </td>
                <td className="p-1.5">
                  <input
                    type="number"
                    step="0.1"
                    value={row.data.sectionHeightMm}
                    onChange={(e) =>
                      onUpdateCell(row.rowIndex, { sectionHeightMm: Number(e.target.value) })
                    }
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs text-right"
                  />
                </td>
                <td className="p-1.5">
                  <input
                    type="number"
                    step="0.1"
                    value={row.data.deductSashMm}
                    onChange={(e) =>
                      onUpdateCell(row.rowIndex, { deductSashMm: Number(e.target.value) })
                    }
                    className="w-full h-8 px-1.5 border border-slate-200 rounded bg-white text-xs text-right"
                  />
                </td>
                <td className="p-1.5">
                  <input
                    type="number"
                    step="0.1"
                    value={row.data.deductBeadMm}
                    onChange={(e) =>
                      onUpdateCell(row.rowIndex, { deductBeadMm: Number(e.target.value) })
                    }
                    className="w-full h-8 px-1.5 border border-slate-200 rounded bg-white text-xs text-right"
                  />
                </td>
                <td className="p-1.5">
                  <input
                    type="number"
                    step="0.1"
                    value={row.data.deductGlassMm}
                    onChange={(e) =>
                      onUpdateCell(row.rowIndex, { deductGlassMm: Number(e.target.value) })
                    }
                    className="w-full h-8 px-1.5 border border-slate-200 rounded bg-white text-xs text-right"
                  />
                </td>
                <td className="p-1.5">
                  <input
                    type="number"
                    step="0.1"
                    value={row.data.deductMullionMm}
                    onChange={(e) =>
                      onUpdateCell(row.rowIndex, { deductMullionMm: Number(e.target.value) })
                    }
                    className="w-full h-8 px-1.5 border border-slate-200 rounded bg-white text-xs text-right"
                  />
                </td>
                <td className="p-1.5">
                  <select
                    value={row.data.sectionLibraryId ?? ''}
                    onChange={(e) =>
                      onUpdateCell(row.rowIndex, {
                        sectionLibraryId: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full h-8 px-2 border border-slate-200 rounded bg-white text-xs"
                  >
                    <option value="">-- Không chọn --</option>
                    {sectionsList.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.code}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-1.5 text-center">
                  <button
                    type="button"
                    onClick={() => onRemoveRow(row.rowIndex)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition cursor-pointer"
                    title="Xóa dòng này"
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
