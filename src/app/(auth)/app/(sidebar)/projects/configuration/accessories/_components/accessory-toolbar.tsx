'use client';

import React from 'react';
import { Button } from '@/components';
import { TableSearch } from '@/components/table';
import { Plus, FolderTree } from 'lucide-react';
import type { AccessoryCategory } from '@/types';

interface AccessoryToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onAddClick: () => void;
  onManageCategoriesClick?: () => void;
  categoryList?: AccessoryCategory[];
  selectedCategoryId?: number | null;
  onCategoryChange?: (categoryId: number | null) => void;
}

export function AccessoryToolbar({
  search,
  onSearchChange,
  onAddClick,
  onManageCategoriesClick,
  categoryList = [],
  selectedCategoryId,
  onCategoryChange,
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
          <select
            value={selectedCategoryId ?? ''}
            onChange={(e) => onCategoryChange?.(e.target.value ? Number(e.target.value) : null)}
            className="h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:border-primary transition min-w-[180px]"
          >
            <option value="">Tất cả phân loại</option>
            {categoryList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-2.5">
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
      </div>
    </div>
  );
}

