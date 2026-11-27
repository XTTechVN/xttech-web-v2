'use client';

import { useCan } from '@/hooks';

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
  const { can } = useCan();
  return (
    <div className="w-full md:w-56 shrink-0 bg-white rounded-block border border-slate-200/80 p-3 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
          <Building size={13} className="text-primary" /> Phân loại tầng
        </span>
        {can('project_floor:create') && (
          <button
            type="button"
            onClick={onAddFloorClick}
            title="Thêm tầng"
            aria-label="Thêm tầng"
            className="-my-2 -mr-2 flex size-11 items-center justify-center rounded-control text-primary hover:bg-primary/10 cursor-pointer transition-colors md:size-8"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      <div className="space-y-1">
        <button
          type="button"
          onClick={() => onSelectFloor('all')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-control text-xs font-semibold transition-all cursor-pointer select-none ${
            selectedFloorId === 'all'
              ? 'bg-primary/10 text-primary border border-primary/20 font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${selectedFloorId === 'all' ? 'bg-primary' : 'bg-slate-300'}`} />
            Tất cả
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-medium min-w-4 text-right ${
                selectedFloorId === 'all' ? 'text-primary font-semibold' : 'text-slate-400'
              }`}
            >
              {totalCount}
            </span>
            <span className="w-4 shrink-0" />
          </div>
        </button>

        {isLoading ? (
          <p className="text-xs text-slate-400 py-3 text-center">Đang tải...</p>
        ) : (
          floors.map((fl) => {
            const isSelected = selectedFloorId === fl.id;
            const count = floorCountsMap.get(fl.id) ?? 0;
            return (
              <div
                key={fl.id}
                className={`group w-full flex items-center justify-between px-3 py-2 rounded-control text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary/10 text-primary border border-primary/20 font-semibold'
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
                    className={`text-xs font-medium min-w-4 text-right ${
                      isSelected ? 'text-primary font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                  {can('project_floor:delete') && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFloor(fl);
                      }}
                      title="Xóa tầng"
                      aria-label="Xóa tầng"
                      className="-my-2 -mr-2 flex size-11 flex-none items-center justify-center rounded-control text-slate-400 cursor-pointer transition-opacity hover:text-red-500 md:size-8 md:opacity-0 md:group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

