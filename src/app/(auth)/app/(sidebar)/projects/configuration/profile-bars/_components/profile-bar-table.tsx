'use client';

import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, Copy, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import type { ProfileBar } from '@/types';
import { BAR_TYPE_MAP, PROFILE_BAR_TABLE_COLUMNS, type ProfileBarSortField } from './profile-bar-config';
import { ProfileBarSubRows } from './profile-bar-sub-rows';

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

type SortOrder = 'asc' | 'desc';

function SortIcon({ active, order }: { active: boolean; order: SortOrder }) {
  if (!active) return <ArrowUpDown size={12} className="text-slate-300 group-hover/th:text-slate-500 transition-colors shrink-0" />;
  return order === 'asc' ? (
    <ArrowUp size={12} className="text-primary font-bold shrink-0" />
  ) : (
    <ArrowDown size={12} className="text-primary font-bold shrink-0" />
  );
}

const renderMmValue = (val?: number | null) => {
  if (!val || val <= 0) return <span className="text-slate-300">—</span>;
  return <span className="text-slate-700 font-medium">{val}</span>;
};

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
  const [sortField, setSortField] = useState<ProfileBarSortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: ProfileBarSortField) => {
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
        case 'sectionHeightMm':
          comparison = (Number(a.sectionHeightMm) || 0) - (Number(b.sectionHeightMm) || 0);
          break;
        case 'deductSashMm':
          comparison = (Number(a.deductSashMm) || 0) - (Number(b.deductSashMm) || 0);
          break;
        case 'deductMullionMm':
          comparison = (Number(a.deductMullionMm) || 0) - (Number(b.deductMullionMm) || 0);
          break;
        case 'deductBeadMm':
          comparison = (Number(a.deductBeadMm) || 0) - (Number(b.deductBeadMm) || 0);
          break;
        case 'deductGlassMm':
          comparison = (Number(a.deductGlassMm) || 0) - (Number(b.deductGlassMm) || 0);
          break;
        case 'weight':
          comparison = (Number(a.weightPerM) || 0) - (Number(b.weightPerM) || 0);
          break;
        case 'barType': {
          const typeA = BAR_TYPE_MAP[a.barType?.toUpperCase()] || a.barType || '';
          const typeB = BAR_TYPE_MAP[b.barType?.toUpperCase()] || b.barType || '';
          comparison = typeA.localeCompare(typeB, 'vi', { sensitivity: 'base' });
          break;
        }
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
              {PROFILE_BAR_TABLE_COLUMNS.map((col) => (
                <th
                  key={col.field}
                  onClick={() => handleSort(col.field)}
                  className={`py-3 px-3 ${col.width} cursor-pointer group/th hover:text-slate-800 transition-colors`}
                >
                  <div
                    className={`flex items-center gap-1 ${
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
            {sortedBars.map((bar) => {
              const typeLabel = BAR_TYPE_MAP[bar.barType?.toUpperCase()] || bar.barType || '—';
              const seriesLabel = bar.doorSeries?.name || bar.doorSeries?.code || '—';
              const isSelected = Boolean(selectedIdSet?.has(bar.id));

              return (
                <React.Fragment key={bar.id}>
                  <tr
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
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect?.(bar.id)}
                          className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer accent-[#045863]"
                        />
                      </td>
                    )}
                    <td className="py-3 px-4 font-semibold text-slate-800 text-xs font-mono whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {bar.sectionLibrary ? (
                          <div
                            title={`Mặt cắt: ${bar.sectionLibrary.name}`}
                            className="w-7 h-7 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0 shadow-2xs"
                          >
                            <svg viewBox={bar.sectionLibrary.viewBox || '0 0 100 100'} className="w-full h-full stroke-slate-700 fill-none" strokeWidth="1.5">
                              <path d={bar.sectionLibrary.svgPathData} />
                            </svg>
                          </div>
                        ) : null}
                        <span>
                          {bar.isFullCompanion && <span className="text-amber-600 mr-1">◆</span>}
                          {bar.code || '—'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors text-xs">
                          {bar.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {`Series ${seriesLabel} · ${bar.barLengthMm || 6000}mm`}
                        </span>
                        {(bar.isFullCompanion || bar.isVirtual) && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {bar.isFullCompanion && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                ◆ combine toàn phần
                              </span>
                            )}
                            {bar.isVirtual && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-teal-50 text-teal-800 border border-teal-100">
                                Ảo
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-xs">
                      {renderMmValue(bar.sectionHeightMm)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-xs">
                      {renderMmValue(bar.deductSashMm)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-xs">
                      {renderMmValue(bar.deductMullionMm)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-xs">
                      {renderMmValue(bar.deductBeadMm)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-xs">
                      {renderMmValue(bar.deductGlassMm)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-xs font-semibold text-slate-700 whitespace-nowrap">
                      {`${Number(bar.weightPerM || 0).toFixed(3)} kg/m`}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                        {typeLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
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
                  <ProfileBarSubRows bar={bar} isBulkMode={isBulkMode} />
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
