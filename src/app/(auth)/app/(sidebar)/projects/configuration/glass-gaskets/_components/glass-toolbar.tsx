'use client';

import React from 'react';
import { Button } from '@/components';
import { TableSearch } from '@/components/table';
import { Plus, Settings2 } from 'lucide-react';
import type { GlassGasketCategoryFilter } from './glass-category-sidebar';

interface GlassToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: GlassGasketCategoryFilter;
  selectedType?: 'all' | 'glass' | 'panel' | 'screen_mesh';
  onAddGlass: () => void;
  onAddGasket: () => void;
  onManageCategories: () => void;
}

export function GlassToolbar({
  search,
  onSearchChange,
  selectedCategory,
  selectedType = 'all',
  onAddGlass,
  onAddGasket,
  onManageCategories,
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

      <div className="flex items-center gap-2">
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
