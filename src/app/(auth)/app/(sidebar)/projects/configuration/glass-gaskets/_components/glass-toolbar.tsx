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
  onAddGlass: () => void;
  onAddGasket: () => void;
  onManageCategories: () => void;
}

export function GlassToolbar({
  search,
  onSearchChange,
  selectedCategory,
  onAddGlass,
  onAddGasket,
  onManageCategories,
}: GlassToolbarProps) {
  const isGasketView = selectedCategory === 'gaskets';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <TableSearch
          placeholder={
            isGasketView
              ? 'Tìm kiếm mã hoặc tên gioăng ron / keo...'
              : 'Tìm kiếm mã, tên quy cách tấm kính...'
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
            Thêm tấm
          </Button>
        )}
      </div>
    </div>
  );
}
