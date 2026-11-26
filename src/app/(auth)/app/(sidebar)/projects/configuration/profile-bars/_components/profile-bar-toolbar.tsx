'use client';

import React from 'react';
import { Button } from '@/components';
import { TableSearch, TableFilters, BulkDeleteToolbarActions } from '@/components/table';
import { Plus, Download, Upload } from 'lucide-react';
import type { DoorSeries } from '@/types';

interface ProfileBarToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onAddClick: () => void;
  onExportExcelClick?: () => void;
  onImportExcelClick?: () => void;
  isExporting?: boolean;
  seriesList?: DoorSeries[];
  selectedSeriesId?: number | null;
  onSeriesChange?: (seriesId: number | null) => void;
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

export function ProfileBarToolbar({
  search,
  onSearchChange,
  onAddClick,
  onExportExcelClick,
  onImportExcelClick,
  isExporting = false,
  seriesList = [],
  selectedSeriesId,
  onSeriesChange,
  isBulkMode = false,
  selectedCount = 0,
  totalCount = 0,
  isAllSelected = false,
  isBulkDeleting = false,
  onEnterBulkMode,
  onExitBulkMode,
  onToggleSelectAll,
  onConfirmBulkDelete,
}: ProfileBarToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <TableSearch
          placeholder="Tìm kiếm mã hoặc tên thanh profile..."
          value={search}
          onChange={onSearchChange}
          className="w-72"
        />

        {seriesList.length > 0 && (
          <TableFilters
            filters={[
              {
                label: 'Hệ nhôm',
                value: selectedSeriesId ? String(selectedSeriesId) : undefined,
                options: seriesList.map((s) => ({
                  value: String(s.id),
                  label: `${s.name} (${s.code})`,
                })),
                onChange: (val) => onSeriesChange?.(val ? Number(val) : null),
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

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={15} />}
              onClick={onAddClick}
            >
              Thêm thanh profile mới
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
