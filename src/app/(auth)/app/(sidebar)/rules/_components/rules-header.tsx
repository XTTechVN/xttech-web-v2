'use client';

import React from 'react';
import { Button, Select, TableSearch } from '@/components';
import { Columns2, List, RotateCcw, Upload } from 'lucide-react';

interface RulesHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  documentType: string;
  onDocumentTypeChange: (value: string) => void;
  documentTypeOptions: { value: string; label: string }[];
  status: string;
  onStatusChange: (value: string) => void;
  statusOptions: { value: string; label: string }[];
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onCreateDocument?: () => void;
}

export const RulesHeader: React.FC<RulesHeaderProps> = ({
  search,
  onSearchChange,
  documentType,
  onDocumentTypeChange,
  documentTypeOptions,
  status,
  onStatusChange,
  statusOptions,
  hasActiveFilters,
  onResetFilters,
  viewMode,
  onViewModeChange,
  onCreateDocument,
}) => {
  return (
    <div className="bg-white border-b border-slate-200/80 p-4 shrink-0 shadow-2xs">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Left: Search, Filters & View Controls */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap flex-1 min-w-0">
          {/* Search Input */}
          <div className="w-full sm:w-52 lg:w-64">
            <TableSearch placeholder="Tìm mã, tiêu đề quy chế..." value={search} onChange={onSearchChange} className="w-full" />
          </div>

          {/* Document Type Filter */}
          <div className="w-44 sm:w-48">
            <Select
              value={documentType}
              onChange={(e) => onDocumentTypeChange(e.target.value)}
              options={documentTypeOptions}
              placeholder="Tất cả loại quy chế"
              className="h-9 text-xs"
            />
          </div>

          {/* Status Filter */}
          <div className="w-40 sm:w-44 hidden sm:block">
            <Select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              options={statusOptions}
              placeholder="Tất cả trạng thái"
              className="h-9 text-xs"
            />
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="h-9 px-2.5 rounded-lg border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw size={14} />
            </Button>
          )}

          {/* Divider */}
          <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0 mx-0.5" />

          {/* View Switch: 2 Cột vs Danh sách */}
          <div className="flex items-center p-0.5 rounded-lg border border-slate-200 bg-slate-100/80 shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-primary shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Cách 1: Dạng 2 Cột đọc nhanh (Split View: Danh sách trái - Trình đọc phải)"
            >
              <Columns2 size={15} />
              <span className="hidden xl:inline text-xs">2 Cột</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-primary shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dạng danh sách"
            >
              <List size={15} />
              <span className="hidden xl:inline text-xs">Danh sách</span>
            </button>
          </div>
        </div>

        {/* Right: Upload Rule action */}
        {onCreateDocument && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="primary"
              size="sm"
              className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
              onClick={onCreateDocument}
              leftIcon={<Upload className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            >
              Tải lên quy chế
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
