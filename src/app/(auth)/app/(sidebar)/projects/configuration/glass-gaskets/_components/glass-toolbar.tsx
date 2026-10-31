'use client';

import React from 'react';
import { Button } from '@/components';
import { TableSearch } from '@/components/table';
import { Plus, Settings2, Download, Upload } from 'lucide-react';
import type { GlassGasketCategoryFilter } from './glass-category-sidebar';

interface GlassToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: GlassGasketCategoryFilter;
  selectedType?: 'all' | 'glass' | 'panel' | 'screen_mesh';
  onAddGlass: () => void;
  onAddGasket: () => void;
  onManageCategories: () => void;
  onExportExcelClick?: () => void;
  onImportExcelClick?: () => void;
  isExporting?: boolean;
}

export function GlassToolbar({
  search,
  onSearchChange,
  selectedCategory,
  selectedType = 'all',
  onAddGlass,
  onAddGasket,
  onManageCategories,
  onExportExcelClick,
  onImportExcelClick,
  isExporting = false,
}: GlassToolbarProps) {
  const isGasketView = selectedCategory === 'gaskets';

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
            isGasketView
              ? 'Tìm kiếm mã hoặc tên gioăng ron / keo...'
              : selectedType === 'glass'
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

        {!isGasketView && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Settings2 size={15} />}
            onClick={onManageCategories}
          >
            Phân loại
          </Button>
        )}

        {isGasketView ? (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={15} />}
            onClick={onAddGasket}
          >
            Thêm gioăng ron / keo
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={15} />}
            onClick={onAddGlass}
          >
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
