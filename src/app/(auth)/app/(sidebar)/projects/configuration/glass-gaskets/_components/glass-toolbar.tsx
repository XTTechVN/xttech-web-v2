'use client';

import React from 'react';
import { Button } from '@/components';
import { TableSearch, BulkDeleteToolbarActions } from '@/components/table';
import { Plus, Settings2, Download, Upload } from 'lucide-react';
import type { GlassGasketCategoryFilter } from './glass-category-sidebar';

interface GlassToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: GlassGasketCategoryFilter;
  selectedType?: 'all' | 'glass' | 'panel' | 'screen_mesh';
  onAddGlass: () => void;
  onManageCategories: () => void;
  onExportExcelClick?: () => void;
  onImportExcelClick?: () => void;
  isExporting?: boolean;
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

export function GlassToolbar({
  search,
  onSearchChange,
  selectedType = 'all',
  onAddGlass,
  onManageCategories,
  onExportExcelClick,
  onImportExcelClick,
  isExporting = false,
  isBulkMode = false,
  selectedCount = 0,
  totalCount = 0,
  isAllSelected = false,
  isBulkDeleting = false,
  onEnterBulkMode,
  onExitBulkMode,
  onToggleSelectAll,
  onConfirmBulkDelete,
}: GlassToolbarProps) {
  const addLabel =
    selectedType === 'glass'
      ? 'Thêm kính'
      : selectedType === 'panel'
      ? 'Thêm tấm'
      : selectedType === 'screen_mesh'
      ? 'Thêm lưới'
      : 'Thêm tấm / kính';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <TableSearch
          placeholder={
            selectedType === 'glass'
              ? 'Tìm kiếm mã, tên quy cách kính...'
              : selectedType === 'panel'
              ? 'Tìm kiếm mã, tên quy cách tấm panel...'
              : selectedType === 'screen_mesh'
              ? 'Tìm kiếm mã, tên quy cách lưới...'
              : 'Tìm kiếm mã, tên quy cách kính, tấm, lưới...'
          }
          value={search}
          onChange={onSearchChange}
          className="w-80"
        />
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

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Settings2 size={15} />}
              onClick={onManageCategories}
            >
              Phân loại
            </Button>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={15} />}
              onClick={onAddGlass}
            >
              {addLabel}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
