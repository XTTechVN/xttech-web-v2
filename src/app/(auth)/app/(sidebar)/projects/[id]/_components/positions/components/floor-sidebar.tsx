'use client';

import React from 'react';
import { Building, Plus, Trash2 } from 'lucide-react';
import type { ProjectFloor } from '@/types';

interface FloorSidebarProps {
  floors: ProjectFloor[];
  selectedFloorId: number | 'all';
  totalCount: number;
  floorCountsMap: Map<number, number>;
  isLoading: boolean;
  onSelectFloor: (floorId: number | 'all') => void;
  onAddFloorClick: () => void;
  onDeleteFloor: (floor: ProjectFloor) => void;
}

export function FloorSidebar({
  floors,
  selectedFloorId,
  totalCount,
  floorCountsMap,
  isLoading,
  onSelectFloor,
  onAddFloorClick,
  onDeleteFloor,
}: FloorSidebarProps) {
  return (
    <div className="w-full md:w-56 shrink-0 bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Building size={13} className="text-primary" /> PHÂN LOẠI TẦNG
        </span>
        <button
          type="button"
          onClick={onAddFloorClick}
          title="Thêm tầng"
          className="p-1 text-primary hover:text-primary/80 hover:bg-primary/10 rounded cursor-pointer transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="space-y-1">
        <button
          type="button"
          onClick={() => onSelectFloor('all')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
            selectedFloorId === 'all'
              ? 'bg-primary/10 text-primary border border-primary/20 font-bold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${selectedFloorId === 'all' ? 'bg-primary' : 'bg-slate-300'}`} />
            Tất cả
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-medium min-w-4 text-right ${
                selectedFloorId === 'all' ? 'text-primary font-bold' : 'text-slate-400'
              }`}
            >
              {totalCount}
            </span>
            <span className="w-4 shrink-0" />
          </div>
        </button>

        {isLoading ? (
          <p className="text-[11px] text-slate-400 py-3 text-center">Đang tải...</p>
        ) : (
          floors.map((fl) => {
            const isSelected = selectedFloorId === fl.id;
            const count = floorCountsMap.get(fl.id) ?? 0;
            return (
              <div
                key={fl.id}
                className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary/10 text-primary border border-primary/20 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                onClick={() => onSelectFloor(fl.id)}
              >
                <span className="truncate flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-primary' : 'bg-slate-300 group-hover:bg-primary'
                    }`}
                  />
                  {fl.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-medium min-w-4 text-right ${
                      isSelected ? 'text-primary font-bold' : 'text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFloor(fl);
                    }}
                    title="Xóa tầng"
                    className="w-4 h-4 shrink-0 flex items-center justify-center hover:text-red-500 rounded text-slate-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

