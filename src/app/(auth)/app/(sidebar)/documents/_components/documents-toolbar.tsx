import React from 'react';
import { Button, TableSearch } from '@/components';
import { FolderPlus, Upload, LayoutGrid, List, RotateCcw } from 'lucide-react';

interface DocumentsToolbarProps {
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
  canCreate: boolean;
  onCreateFolder: () => void;
  onCreateDocument: () => void;
}

export const DocumentsToolbar: React.FC<DocumentsToolbarProps> = ({
  search,
  onSearchChange,
  hasActiveFilters,
  onResetFilters,
  viewMode,
  onViewModeChange,
  canCreate,
  onCreateFolder,
  onCreateDocument,
}) => {
  return (
    <div className="bg-white border-b border-slate-200/80 p-4 shrink-0 shadow-2xs">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Left: Search, Filters & View Controls */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap flex-1 min-w-0">
          {/* Search Input */}
          <div className="w-full sm:w-64 lg:w-72">
            <TableSearch
              placeholder="Tìm mã, tiêu đề..."
              value={search}
              onChange={onSearchChange}
              className="w-full"
            />
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="h-9 px-2.5 rounded-lg border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
              title="Đặt lại tìm kiếm"
            >
              <RotateCcw size={14} />
            </Button>
          )}

          {/* Divider */}
          <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0 mx-0.5" />

          {/* View Switch: Grid vs Table */}
          <div className="flex items-center p-0.5 rounded-xl border border-slate-200 bg-slate-100/80 shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-primary shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dạng thư mục & lưới"
            >
              <LayoutGrid size={15} />
              <span className="hidden xl:inline text-xs">Lưới</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-primary shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dạng danh sách Google Drive"
            >
              <List size={15} />
              <span className="hidden xl:inline text-xs">Danh sách</span>
            </button>
          </div>
        </div>

        {/* Right: Action buttons (Ẩn khi ở mục Được chia sẻ với tôi đối với user thường) */}
        {canCreate && (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
              onClick={onCreateFolder}
              leftIcon={<FolderPlus className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            >
              Thư mục mới
            </Button>

            <Button
              variant="primary"
              size="sm"
              className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
              onClick={onCreateDocument}
              leftIcon={<Upload className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            >
              Tải lên tài liệu
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
