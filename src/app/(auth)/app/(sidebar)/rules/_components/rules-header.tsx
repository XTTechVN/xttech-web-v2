'use client';

import React from 'react';
import { Search, Plus, ScrollText, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components';
import { cn } from '@/utils';
import type { RulesViewMode } from '@/types';

interface RulesHeaderProps {
  search: string;
  canCreate?: boolean;
  viewMode: RulesViewMode;
  showViewSwitcher?: boolean;
  onSearchChange: (value: string) => void;
  onViewModeChange: (mode: RulesViewMode) => void;
  onCreate: () => void;
}

export const RulesHeader: React.FC<RulesHeaderProps> = ({
  search,
  canCreate = false,
  viewMode,
  showViewSwitcher = true,
  onSearchChange,
  onViewModeChange,
  onCreate,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 px-3 pt-3 sm:px-4 sm:pt-4">
    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <ScrollText size={18} className="sm:w-5 sm:h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="text-sm sm:text-base font-bold text-slate-800 leading-tight truncate">
          Cơ chế &amp; Quy định <span className="hidden xs:inline text-slate-500 font-normal text-xs">(Văn bản ban hành)</span>
        </h1>
        <p className="text-xs text-slate-500 truncate hidden sm:block mt-0.5">
          Quy chế, quy định, chính sách, quy trình, quyết định, thông báo, hướng dẫn, định mức
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2 w-full sm:w-auto">
      <div className="relative flex-1 min-w-0 sm:w-64 md:w-72">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id="rules-search-input"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo mã, tiêu đề..."
          className="w-full h-8.5 sm:h-9 pl-8 pr-3 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
        />
      </div>

      {showViewSwitcher && (
        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 shrink-0 shadow-2xs">
          <button
            type="button"
            id="rules-view-grid"
            title="Chế độ xem lưới"
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer',
              viewMode === 'grid'
                ? 'bg-primary text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            <LayoutGrid size={13} />
            <span className="hidden md:inline">Lưới</span>
          </button>
          <button
            type="button"
            id="rules-view-list"
            title="Chế độ xem danh sách"
            onClick={() => onViewModeChange('list')}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer',
              viewMode === 'list'
                ? 'bg-primary text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            <List size={13} />
            <span className="hidden md:inline">Danh sách</span>
          </button>
        </div>
      )}

      {canCreate && (
        <Button
          id="rules-create-button"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={onCreate}
          className="h-8.5 sm:h-9 px-2 sm:px-3 text-xs shrink-0 shadow-2xs whitespace-nowrap"
        >
          <span className="hidden xs:inline">Soạn cơ chế</span>
          <span className="xs:hidden">Soạn</span>
        </Button>
      )}
    </div>
  </div>
);
