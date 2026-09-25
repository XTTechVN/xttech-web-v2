'use client';

import React from 'react';
import { Button } from '@/components';
import { TableSearch } from '@/components/table';
import { Plus } from 'lucide-react';

interface SeriesToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onAddClick: () => void;
}

export function SeriesToolbar({
  search,
  onSearchChange,
  onAddClick,
}: SeriesToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <TableSearch
          placeholder="Tìm kiếm mã hoặc tên hệ nhôm..."
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
        Thêm hệ nhôm mới
      </Button>
    </div>
  );
}
