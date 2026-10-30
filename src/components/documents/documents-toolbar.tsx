import React from 'react';
import { Button, TableSearch, Select } from '@/components';
import { FolderPlus, FileUp, FolderUp, LayoutGrid, List, RotateCcw } from 'lucide-react';
import type { DocumentItemTypeFilter } from '@/hooks/use-document-explorer';

interface DocumentsToolbarProps {
  search?: string;
  onSearchChange: (value: string) => void;
  itemTypeFilter?: DocumentItemTypeFilter;
  onItemTypeFilterChange?: (value: DocumentItemTypeFilter) => void;
  itemTypeOptions?: { value: string; label: string }[];
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
  isUploading?: boolean;
  onCreateFolder: () => void;
  onUploadFiles: () => void;
  onUploadFolder: () => void;
}

export const DocumentsToolbar: React.FC<DocumentsToolbarProps> = ({
  search = '',
  onSearchChange,
  itemTypeFilter = 'all',
  onItemTypeFilterChange,
  itemTypeOptions = [],
  hasActiveFilters,
  onResetFilters,
  viewMode,
  onViewModeChange,
  canCreate,
  isUploading = false,
  onCreateFolder,
  onUploadFiles,
  onUploadFolder,
}) => {
  return (
    <div className="bg-white border-b border-slate-200/80 p-3 sm:p-4 shrink-0 shadow-2xs">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 sm:gap-3">
        {/* Nhóm bên trái: Tìm kiếm và 3 nút hành động nằm ngay sau ô tìm kiếm */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-full sm:w-56 md:w-64 lg:w-72 shrink-0">
            <TableSearch
              placeholder="Tìm mã, tiêu đề..."
              value={search}
              onChange={onSearchChange}
              className="w-full"
            />
          </div>

          {canCreate && (
            <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-1 text-[11px] xs:px-2 xs:text-xs sm:h-9 sm:px-3 sm:text-xs md:text-sm w-full sm:w-auto justify-center font-medium gap-1 sm:gap-2"
                onClick={onCreateFolder}
                disabled={isUploading}
                leftIcon={<FolderPlus className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />}
              >
                <span className="truncate">Thư mục mới</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 px-1 text-[11px] xs:px-2 xs:text-xs sm:h-9 sm:px-3 sm:text-xs md:text-sm w-full sm:w-auto justify-center font-medium gap-1 sm:gap-2"
                onClick={onUploadFolder}
                disabled={isUploading}
                leftIcon={<FolderUp className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />}
              >
                <span className="truncate sm:hidden">Tải thư mục</span>
                <span className="hidden sm:inline">Tải thư mục lên</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                className="h-8 px-1 text-[11px] xs:px-2 xs:text-xs sm:h-9 sm:px-3 sm:text-xs md:text-sm w-full sm:w-auto justify-center font-medium gap-1 sm:gap-2"
                onClick={onUploadFiles}
                disabled={isUploading}
                leftIcon={<FileUp className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />}
              >
                <span className="truncate">Tải tệp lên</span>
              </Button>
            </div>
          )}
        </div>

        {/* Nhóm bên phải: Bộ lọc loại mục và Chế độ xem Lưới/Danh sách ở cuối cùng */}
        <div className="flex items-center gap-2 w-full xl:w-auto min-w-0 justify-between xl:justify-end">
          <div className="flex-1 xl:w-44 lg:w-48 xl:flex-none min-w-0 flex items-center gap-1.5">
            <div className="w-full min-w-0">
              <Select
                value={itemTypeFilter}
                onChange={(e) => onItemTypeFilterChange?.(e.target.value as DocumentItemTypeFilter)}
                options={itemTypeOptions}
                placeholder="Tất cả loại mục"
                className="h-9 text-xs w-full"
              />
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResetFilters}
                className="h-9 px-2 rounded-lg border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw size={14} />
              </Button>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0 mx-0.5" />

          {/* Chế độ xem Lưới / Danh sách ở cuối cùng */}
          <div className="flex items-center p-0.5 rounded-xl border border-slate-200 bg-slate-100/80 shrink-0 whitespace-nowrap">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-primary shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dạng thư mục & lưới"
            >
              <LayoutGrid size={15} />
              <span className="hidden sm:inline text-xs">Lưới</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-primary shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dạng danh sách Google Drive"
            >
              <List size={15} />
              <span className="hidden sm:inline text-xs">Danh sách</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
