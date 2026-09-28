'use client';

import React from 'react';
import { Button } from '@/components';
import { TableSearch } from '@/components/table';
import { Plus, FolderTree } from 'lucide-react';

interface AccessoryToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onAddClick: () => void;
  onManageCategoriesClick?: () => void;
}

export function AccessoryToolbar({
  search,
  onSearchChange,
  onAddClick,
  onManageCategoriesClick,
}: AccessoryToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <TableSearch
          placeholder="Tìm kiếm mã hoặc tên phụ kiện..."
          value={search}
          onChange={onSearchChange}
          className="w-80"
        />
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

