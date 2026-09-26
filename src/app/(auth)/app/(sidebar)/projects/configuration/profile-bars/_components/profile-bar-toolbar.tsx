'use client';

import React from 'react';
import { Button } from '@/components';
import { TableSearch } from '@/components/table';
import { Plus } from 'lucide-react';

interface ProfileBarToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onAddClick: () => void;
}

export function ProfileBarToolbar({
  search,
  onSearchChange,
  onAddClick,
}: ProfileBarToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <TableSearch
          placeholder="Tìm kiếm mã hoặc tên thanh profile..."
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
        Thêm thanh profile mới
      </Button>
    </div>
  );
}
