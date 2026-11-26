'use client';

import React from 'react';
import { Button } from '@/components';
import { TableSearch, TableFilters, BulkDeleteToolbarActions } from '@/components/table';
import { Plus, FolderTree, Download, Upload } from 'lucide-react';
import type { AccessoryCategory } from '@/types';

interface AccessoryToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onAddClick: () => void;
  onManageCategoriesClick?: () => void;
  onExportExcelClick?: () => void;
  onImportExcelClick?: () => void;
  isExporting?: boolean;
  categoryList?: AccessoryCategory[];
  selectedCategoryId?: number | null;
  onCategoryChange?: (categoryId: number | null) => void;
  isBulkMode?: boolean;
  selectedCount?: number;
  totalCount?: number;
  isAllSelected?: boolean;
  isBulkDeleting?: boolean;
  onEnterBulkMode?: () => void;
  onExitBulkMode?: () => void;
  onToggleSelectAll?: () => void;
  onConfirmBulkDelete?: () => void;
}

export function AccessoryToolbar({
  search,
  onSearchChange,
  onAddClick,
  onManageCategoriesClick,
  onExportExcelClick,
  onImportExcelClick,
  isExporting = false,
  categoryList = [],
  selectedCategoryId,
  onCategoryChange,
  isBulkMode = false,
  selectedCount = 0,
  totalCount = 0,
  isAllSelected = false,
  isBulkDeleting = false,
  onEnterBulkMode,
  onExitBulkMode,
  onToggleSelectAll,
  onConfirmBulkDelete,
}: AccessoryToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <TableSearch
          placeholder="Tìm kiếm mã hoặc tên phụ kiện..."
          value={search}
          onChange={onSearchChange}
          className="w-72"
        />

        {categoryList.length > 0 && (
          <TableFilters
            filters={[
              {
                label: 'Phân loại',
                value: selectedCategoryId ? String(selectedCategoryId) : undefined,
                options: categoryList.map((c) => ({ value: String(c.id), label: c.name })),
                onChange: (val) => onCategoryChange?.(val ? Number(val) : null),
              },
            ]}
          />
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {onEnterBulkMode && onExitBulkMode && onToggleSelectAll && onConfirmBulkDelete && (
          <BulkDeleteToolbarActions
            isBulkMode={isBulkMode}
            selectedCount={selectedCount}
            totalCount={totalCount}
            isAllSelected={isAllSelected}
            isDeleting={isBulkDeleting}
            onEnterBulkMode={onEnterBulkMode}
            onExitBulkMode={onExitBulkMode}
            onToggleSelectAll={onToggleSelectAll}
            onConfirmDelete={onConfirmBulkDelete}
          />
        )}

        {!isBulkMode && (
          <>
            {onExportExcelClick && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download size={15} />}
                loading={isExporting}
                onClick={onExportExcelClick}
              >
                Xuất Excel
              </Button>
            )}

            {onImportExcelClick && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Upload size={15} />}
                onClick={onImportExcelClick}
              >
                Nhập Excel
              </Button>
            )}

            {onManageCategoriesClick && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FolderTree size={15} />}
                onClick={onManageCategoriesClick}
                className="font-medium text-slate-700 bg-white hover:bg-slate-50 border-slate-200"
              >
                Quản lý danh mục
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={15} />}
              onClick={onAddClick}
            >
              Thêm phụ kiện mới
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
