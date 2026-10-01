'use client';

import React from 'react';
import { Layers, Pencil, Trash2, CheckCircle2, PackageOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/utils';
import type { AccessoryCombo } from '@/types';

interface ComboTableProps {
  combos: AccessoryCombo[];
  isLoading: boolean;
  search: string;
  total: number;
  offset: number;
  pageSize: number;
  onEdit: (combo: AccessoryCombo) => void;
  onDelete: (combo: AccessoryCombo) => void;
  onPageChange: (offset: number) => void;
}

function ComboSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="py-4 px-4"><div className="w-4 h-4 bg-slate-100 rounded" /></td>
          <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-28" /></td>
          <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-48" /></td>
          <td className="py-4 px-4 text-center"><div className="h-4 bg-slate-100 rounded w-8 mx-auto" /></td>
          <td className="py-4 px-4 text-right"><div className="h-4 bg-slate-100 rounded w-20 ml-auto" /></td>
          <td className="py-4 px-4 text-center"><div className="h-5 bg-slate-100 rounded w-16 mx-auto" /></td>
          <td className="py-4 px-4 text-center"><div className="h-5 bg-slate-100 rounded w-16 mx-auto" /></td>
          <td className="py-4 px-4 text-right"><div className="h-5 bg-slate-100 rounded w-12 ml-auto" /></td>
        </tr>
      ))}
    </>
  );
}

function ComboEmptyState({ search }: { search: string }) {
  return (
    <tr>
      <td colSpan={8} className="py-16 text-center text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <PackageOpen size={22} className="text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">
            {search ? 'Không tìm thấy combo phù hợp' : 'Chưa có gói combo nào'}
          </p>
          <p className="text-xs text-slate-400">Nhấn &quot;Thêm combo mới&quot; để tạo gói combo đầu tiên.</p>
        </div>
      </td>
    </tr>
  );
}

function ComboRow({
  combo,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  combo: AccessoryCombo;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <React.Fragment>
      <tr
        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
        onClick={onToggle}
      >
        {/* Toggle */}
        <td className="py-3.5 px-4 text-slate-400">
          <Layers
            size={14}
            className={`transition-transform ${isExpanded ? 'text-primary rotate-90' : ''}`}
          />
        </td>

        {/* Mã gói */}
        <td className="py-3.5 px-4">
          <span className="font-mono font-bold text-xs text-primary">{combo.code}</span>
        </td>

        {/* Tên gói */}
        <td className="py-3.5 px-4">
          <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
            {combo.name}
          </span>
          {combo.description && (
            <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">{combo.description}</p>
          )}
        </td>

        {/* Số món */}
        <td className="py-3.5 px-4 text-center">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {combo.comboItems?.length ?? 0} món
          </span>
        </td>

        {/* Tổng giá */}
        <td className="py-3.5 px-4 text-right">
          <span className="font-semibold text-emerald-700 text-sm">
            {formatCurrency(combo.totalComboPrice || 0)}
          </span>
        </td>

        {/* Mặc định */}
        <td className="py-3.5 px-4 text-center">
          {combo.isDefault ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
              <CheckCircle2 size={11} /> Mặc định
            </span>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
        </td>

        {/* Trạng thái */}
        <td className="py-3.5 px-4 text-center">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border whitespace-nowrap ${
              combo.isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {combo.isActive ? 'Hoạt động' : 'Tạm ngưng'}
          </span>
        </td>

        {/* Thao tác */}
        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
              title="Chỉnh sửa"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              title="Xóa"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded: chi tiết phụ kiện */}
      {isExpanded && (
        <tr>
          <td colSpan={8} className="bg-slate-50/60 px-8 py-3 border-b border-slate-100">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Chi tiết phụ kiện trong gói
              </span>
              {(combo.comboItems || []).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 text-xs text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-2"
                >
                  <span className="font-mono font-bold text-primary w-24 shrink-0">
                    {item.accessoryCode || '—'}
                  </span>
                  <span className="flex-1 font-medium">{item.accessoryName || '—'}</span>
                  <span className="text-slate-500 w-28 shrink-0">{item.category || '—'}</span>
                  <span className="text-slate-600 font-semibold w-16 text-right shrink-0">
                    x{item.quantity}
                  </span>
                  <span className="text-slate-500 w-20 text-right shrink-0">{item.unit || ''}</span>
                  {item.note && (
                    <span className="text-slate-400 italic truncate max-w-[160px]">{item.note}</span>
                  )}
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

export function ComboTable({
  combos,
  isLoading,
  search,
  total,
  offset,
  pageSize,
  onEdit,
  onDelete,
  onPageChange,
}: ComboTableProps) {
  const [expandedId, setExpandedId] = React.useState<number | null>(null);

  const hasNext = offset + pageSize < total;
  const hasPrev = offset > 0;
  const currentPage = Math.floor(offset / pageSize) + 1;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse select-none">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-10" />
              <th className="py-3 px-4 w-44">Mã gói</th>
              <th className="py-3 px-4 min-w-[220px]">Tên gói combo</th>
              <th className="py-3 px-4 w-32 text-center">Số món</th>
              <th className="py-3 px-4 w-36 text-right">Tổng giá</th>
              <th className="py-3 px-4 w-28 text-center">Mặc định</th>
              <th className="py-3 px-4 w-28 text-center">Trạng thái</th>
              <th className="py-3 px-4 w-24 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {isLoading ? (
              <ComboSkeleton />
            ) : combos.length === 0 ? (
              <ComboEmptyState search={search} />
            ) : (
              combos.map((combo) => (
                <ComboRow
                  key={combo.id}
                  combo={combo}
                  isExpanded={expandedId === combo.id}
                  onToggle={() => setExpandedId(expandedId === combo.id ? null : combo.id)}
                  onEdit={() => onEdit(combo)}
                  onDelete={() => onDelete(combo)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <span className="text-xs text-slate-500">
            Trang {currentPage} / {totalPages} &nbsp;·&nbsp; {total} gói combo
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!hasPrev}
              onClick={() => onPageChange(Math.max(0, offset - pageSize))}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              disabled={!hasNext}
              onClick={() => onPageChange(offset + pageSize)}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
