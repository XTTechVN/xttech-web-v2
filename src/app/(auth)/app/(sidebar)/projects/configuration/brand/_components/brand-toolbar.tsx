'use client';

import React from 'react';
import { Button } from '@/components';
import { TableSearch } from '@/components/table';
import { Plus } from 'lucide-react';

interface BrandToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onAddClick: () => void;
}

export function BrandToolbar({
  search,
  onSearchChange,
  onAddClick,
}: BrandToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <TableSearch
          placeholder="Tìm kiếm theo mã hoặc tên hãng..."
          value={search}
          onChange={onSearchChange}
          className="w-80"
        />
      </div>

      <Button
        variant="primary"
        size="sm"
        leftIcon={<Plus size={15} />}
        onClick={onAddClick}
      >
        Thêm hãng mới
      </Button>
    </div>
  );
}
