'use client';

import React from 'react';
import { Button, TableSearch } from '@/components';
import { LayoutGrid, List, Upload } from 'lucide-react';

interface RulesHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  documentType?: string;
  onDocumentTypeChange?: (value: string) => void;
  documentTypeOptions?: { value: string; label: string }[];
  status?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: { value: string; label: string }[];
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onCreateDocument?: () => void;
}

export const RulesHeader: React.FC<RulesHeaderProps> = ({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onCreateDocument,
}) => {
  return (
    <div className="bg-white border-b border-slate-200/80 p-3 sm:p-4 shrink-0 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        {/* Tìm kiếm */}
        <div className="w-full sm:w-64 lg:w-80">
          <TableSearch
            placeholder="Tìm mã, tiêu đề quy chế..."
            value={search}
            onChange={onSearchChange}
            className="w-full"
          />
        </div>

        {/* Hàng nút: Tải lên quy chế + Toggle Dạng lưới / Ô vs Danh sách (cùng 1 dòng trên mobile & desktop) */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
          {onCreateDocument && (
            <Button
              variant="primary"
              size="sm"
              className="h-8.5 sm:h-9 px-3 text-xs sm:text-sm font-semibold shrink-0"
              onClick={onCreateDocument}
              leftIcon={<Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            >
              Tải lên quy chế
            </Button>
          )}

          {/* Switch Dạng lưới / Ô vs Danh sách */}
          <div className="flex items-center p-0.5 rounded-lg border border-slate-200 bg-slate-100/80 shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-primary shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dạng lưới / ô"
            >
              <LayoutGrid size={15} />
              <span className="hidden md:inline text-xs">Lưới</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-primary shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dạng danh sách"
            >
              <List size={15} />
              <span className="hidden md:inline text-xs">Danh sách</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

