'use client';

import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, Copy, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import type { ProfileBar } from '@/types';
import { BAR_TYPE_MAP } from './profile-bar-config';

interface ProfileBarTableProps {
  profileBars: ProfileBar[];
  onEdit: (bar: ProfileBar) => void;
  onCopy: (bar: ProfileBar) => void;
  onDelete: (bar: ProfileBar) => void;
  isBulkMode?: boolean;
  selectedIdSet?: ReadonlySet<number>;
  isAllSelected?: boolean;
  isPartiallySelected?: boolean;
  onToggleSelect?: (id: number) => void;
  onToggleSelectAll?: () => void;
}

type SortField = 'code' | 'name' | 'series' | 'barType' | 'weight' | 'length' | 'status';
type SortOrder = 'asc' | 'desc';

const COLUMNS: Array<{ field: SortField; label: string; align: 'left' | 'center'; width: string }> = [
  { field: 'code', label: 'Mã thanh', align: 'left', width: 'w-36' },
  { field: 'name', label: 'Mô tả / Tên thanh profile', align: 'left', width: 'min-w-[200px]' },
  { field: 'series', label: 'Hệ nhôm', align: 'center', width: 'w-36' },
  { field: 'barType', label: 'Loại thanh', align: 'center', width: 'w-36' },
  { field: 'weight', label: 'Trọng lượng', align: 'center', width: 'w-32' },
  { field: 'length', label: 'Chiều dài', align: 'center', width: 'w-32' },
  { field: 'status', label: 'Trạng thái', align: 'center', width: 'w-32' },
];

function SortIcon({ active, order }: { active: boolean; order: SortOrder }) {
  if (!active) return <ArrowUpDown size={12} className="text-slate-300 group-hover/th:text-slate-500 transition-colors shrink-0" />;
  return order === 'asc' ? (
    <ArrowUp size={12} className="text-primary font-bold shrink-0" />
  ) : (
    <ArrowDown size={12} className="text-primary font-bold shrink-0" />
  );
}

function ProfileBarBadges({ bar }: { bar: ProfileBar }) {
  const companionCount = bar.companions?.length ?? 0;
  const variantCount = bar.variants?.length ?? 0;
  const badges: string[] = [];
  if (bar.isVirtual) badges.push('Ảo');
  if (bar.isFullCompanion && companionCount > 0) badges.push(`Combine toàn phần (${companionCount})`);
  else if (companionCount > 0) badges.push(`+${companionCount} thanh kèm`);
  if (variantCount > 0) badges.push(`${variantCount} biến thể`);
  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {badges.map((label) => (
        <span key={label} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-teal-50 text-teal-800 border border-teal-100">
          {label}
        </span>
      ))}
    </div>
  );
}

export function ProfileBarTable({
  profileBars,
  onEdit,
  onCopy,
  onDelete,
  isBulkMode = false,
  selectedIdSet,
  isAllSelected = false,
  isPartiallySelected = false,
  onToggleSelect,
  onToggleSelectAll,
}: ProfileBarTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedBars = useMemo(() => {
    if (!sortField) return profileBars;
    return [...profileBars].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'code':
          comparison = (a.code || '').localeCompare(b.code || '', 'vi', { sensitivity: 'base' });
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '', 'vi', { sensitivity: 'base' });
          break;
        case 'series':
          comparison = (a.doorSeries?.name || a.doorSeries?.code || '').localeCompare(
            b.doorSeries?.name || b.doorSeries?.code || '',
            'vi',
            { sensitivity: 'base' },
          );
          break;
        case 'barType': {
          const typeA = BAR_TYPE_MAP[a.barType?.toUpperCase()] || a.barType || '';
          const typeB = BAR_TYPE_MAP[b.barType?.toUpperCase()] || b.barType || '';
          comparison = typeA.localeCompare(typeB, 'vi', { sensitivity: 'base' });
          break;
        }
        case 'weight':
          comparison = (Number(a.weightPerM) || 0) - (Number(b.weightPerM) || 0);
          break;
        case 'length':
          comparison = (Number(a.barLengthMm) || 6000) - (Number(b.barLengthMm) || 6000);
          break;
        case 'status':
          comparison = (a.isActive !== false ? 1 : 0) - (b.isActive !== false ? 1 : 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [profileBars, sortField, sortOrder]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse select-none">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {isBulkMode && (
                <th className="py-3 px-3 w-11 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPartiallySelected;
                    }}
                    onChange={() => onToggleSelectAll?.()}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer accent-[#045863]"
                    title="Chọn tất cả"
                  />
                </th>
              )}
              {COLUMNS.map((col) => (
                <th
                  key={col.field}
                  onClick={() => handleSort(col.field)}
                  className={`py-3 px-4 ${col.width} cursor-pointer group/th hover:text-slate-800 transition-colors`}
                >
                  <div className={`flex items-center gap-1.5 ${col.align === 'center' ? 'justify-center' : ''}`}>
                    <span>{col.label}</span>
                    <SortIcon active={sortField === col.field} order={sortOrder} />
                  </div>
                </th>
              ))}
              <th className="py-3 px-4 text-right w-24">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedBars.map((bar) => {
              const typeLabel = BAR_TYPE_MAP[bar.barType?.toUpperCase()] || bar.barType || '—';
              const seriesLabel = bar.doorSeries?.name || bar.doorSeries?.code || '—';
              const isSelected = Boolean(selectedIdSet?.has(bar.id));

              return (
                <tr
                  key={bar.id}
                  onClick={() => {
                    if (isBulkMode) onToggleSelect?.(bar.id);
                  }}
                  className={`transition-colors group ${
                    isBulkMode ? 'cursor-pointer' : ''
                  } ${
                    isSelected ? 'bg-rose-50/40 hover:bg-rose-50/60' : 'hover:bg-slate-50/80'
                  }`}
                >
                  {isBulkMode && (
                    <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect?.(bar.id)}
                        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer accent-[#045863]"
                      />
                    </td>
                  )}
                  <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">
                    <div className="flex items-center gap-2.5">
                      {bar.sectionLibrary ? (
                        <div
                          title={`Mặt cắt: ${bar.sectionLibrary.name}`}
                          className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0 shadow-2xs"
                        >
                          <svg viewBox={bar.sectionLibrary.viewBox || '0 0 100 100'} className="w-full h-full stroke-slate-700 fill-none" strokeWidth="1.5">
                            <path d={bar.sectionLibrary.svgPathData} />
                          </svg>
                        </div>
                      ) : (
                        <div
                          title="Chưa gán mặt cắt SVG"
                          className="w-8 h-8 rounded-lg bg-slate-50/60 border border-dashed border-slate-200 flex items-center justify-center shrink-0 text-slate-300 text-[9px]"
                        >
                          —
                        </div>
                      )}
                      <span>{bar.code || '—'}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors text-sm">{bar.name}</span>
                      {bar.doorSeries?.name && <span className="text-xs text-slate-400 mt-0.5">Hệ: {bar.doorSeries.name}</span>}
                      <ProfileBarBadges bar={bar} />
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {seriesLabel}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                      {typeLabel}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="text-xs font-semibold text-slate-700">{bar.weightPerM ? `${bar.weightPerM} kg/m` : '—'}</span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="text-xs font-medium text-slate-600">{bar.barLengthMm ? `${bar.barLengthMm.toLocaleString()} mm` : '6,000 mm'}</span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border whitespace-nowrap ${
                        bar.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {bar.isActive !== false ? 'Hoạt động' : 'Tạm ngưng'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onCopy(bar)}
                        className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors cursor-pointer"
                        title="Sao chép profile nhôm"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(bar)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(bar)}
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
