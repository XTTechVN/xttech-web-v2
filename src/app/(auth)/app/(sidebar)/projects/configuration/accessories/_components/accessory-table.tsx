'use client';

import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, ArrowUp, ArrowDown, ArrowUpDown, X, ZoomIn } from 'lucide-react';
import type { Accessory } from '@/types';
import { formatAccessoryUnit, ACCESSORY_COLOR_MAP } from '@/types';
import { formatCurrency } from '@/utils';
import { BASE_MINIO_URL } from '@/config';

interface AccessoryTableProps {
  accessories: Accessory[];
  onEdit: (accessory: Accessory) => void;
  onDelete: (accessory: Accessory) => void;
}

type SortField = 'code' | 'name' | 'category' | 'specification' | 'unit' | 'color' | 'price' | 'status';
type SortOrder = 'asc' | 'desc';

function SortIcon({ active, order }: { active: boolean; order: SortOrder }) {
  if (!active) return <ArrowUpDown size={12} className="text-slate-300 group-hover/th:text-slate-500 transition-colors shrink-0" />;
  return order === 'asc' ? (
    <ArrowUp size={12} className="text-primary font-bold shrink-0" />
  ) : (
    <ArrowDown size={12} className="text-primary font-bold shrink-0" />
  );
}

const COLUMNS: Array<{ field: SortField; label: string; align: 'left' | 'center' | 'right'; width: string }> = [
  { field: 'name', label: 'Tên phụ kiện', align: 'left', width: 'min-w-[160px]' },
  { field: 'specification', label: 'Quy cách', align: 'center', width: 'w-32' },
  { field: 'unit', label: 'ĐVT', align: 'center', width: 'w-24' },
  { field: 'color', label: 'Màu sắc', align: 'center', width: 'w-28' },
  { field: 'price', label: 'Đơn giá', align: 'right', width: 'w-32' },
  { field: 'status', label: 'Trạng thái', align: 'center', width: 'w-28' },
];

export function AccessoryTable({ accessories, onEdit, onDelete }: AccessoryTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedAccessories = useMemo(() => {
    if (!sortField) return accessories;
    return [...accessories].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'code':
          comparison = (a.code || '').localeCompare(b.code || '', 'vi', { sensitivity: 'base' });
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '', 'vi', { sensitivity: 'base' });
          break;
        case 'category':
          comparison = (a.category?.name || '').localeCompare(b.category?.name || '', 'vi', { sensitivity: 'base' });
          break;
        case 'specification':
          comparison = (a.specification || '').localeCompare(b.specification || '', 'vi', { sensitivity: 'base' });
          break;
        case 'unit':
          comparison = (formatAccessoryUnit(a.unit) || '').localeCompare(formatAccessoryUnit(b.unit) || '', 'vi', { sensitivity: 'base' });
          break;
        case 'color': {
          const colA = a.color ? ACCESSORY_COLOR_MAP[a.color.toLowerCase()] || a.color : '';
          const colB = b.color ? ACCESSORY_COLOR_MAP[b.color.toLowerCase()] || b.color : '';
          comparison = colA.localeCompare(colB, 'vi', { sensitivity: 'base' });
          break;
        }
        case 'price':
          comparison = (a.unitPrice || a.salePrice || 0) - (b.unitPrice || b.salePrice || 0);
          break;
        case 'status':
          comparison = (a.isActive !== false ? 1 : 0) - (b.isActive !== false ? 1 : 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [accessories, sortField, sortOrder]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse select-none">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-3 w-14" />
              {COLUMNS.map((col) => (
                <th
                  key={col.field}
                  onClick={() => handleSort(col.field)}
                  className={`py-3 px-4 ${col.width} cursor-pointer group/th hover:text-slate-800 transition-colors`}
                >
                  <div
                    className={`flex items-center gap-1.5 ${
                      col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : ''
                    }`}
                  >
                    <span>{col.label}</span>
                    <SortIcon active={sortField === col.field} order={sortOrder} />
                  </div>
                </th>
              ))}
              <th className="py-3 px-4 text-right w-24">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedAccessories.map((acc) => {
              const categoryLabel = acc.category?.name || '—';
              const unitLabel = formatAccessoryUnit(acc.unit) || '—';
              const colorLabel = acc.color ? ACCESSORY_COLOR_MAP[acc.color.toLowerCase()] || acc.color : '—';
              const price = acc.unitPrice || acc.salePrice || 0;
              const imgSrc = acc.imagePath
                ? acc.imagePath.startsWith('http')
                  ? acc.imagePath
                  : `${BASE_MINIO_URL}/${acc.imagePath.replace(/^\//, '')}`
                : null;

              return (
                <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-2.5 px-3">
                    {imgSrc ? (
                      <button
                        type="button"
                        onClick={() => setLightboxUrl(imgSrc)}
                        className="relative group/img block w-9 h-9 cursor-zoom-in"
                      >
                        <img
                          src={imgSrc}
                          alt={acc.name}
                          className="w-9 h-9 object-contain rounded border border-slate-200 bg-slate-50"
                          onError={(e) => {
                            (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                          }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/30 rounded opacity-0 group-hover/img:opacity-100 transition-opacity">
                          <ZoomIn size={12} className="text-white" />
                        </span>
                      </button>
                    ) : (
                      <div className="w-9 h-9 rounded border border-slate-100 bg-slate-50" />
                    )}
                  </td>

                  <td className="py-2.5 px-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        {categoryLabel !== '—' && (
                          <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            {categoryLabel}
                          </span>
                        )}
                        <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors text-xs">
                          {acc.name}
                        </span>
                      </div>
                      {acc.code && <span className="text-[11px] text-slate-400 font-mono">{acc.code}</span>}
                    </div>
                  </td>

                  <td className="py-2.5 px-4 text-center text-xs text-slate-600 whitespace-nowrap">{acc.specification || '—'}</td>

                  <td className="py-2.5 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                      {unitLabel}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center text-xs text-slate-700">{colorLabel}</td>

                  <td className="py-3.5 px-4 text-right font-semibold text-xs text-slate-800">
                    {price ? formatCurrency(price) : '0 ₫'}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border whitespace-nowrap ${
                        acc.isActive !== false
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {acc.isActive !== false ? 'Hoạt động' : 'Tạm ngưng'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(acc)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(acc)}
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

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
          <img
            src={lightboxUrl}
            alt="preview"
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
