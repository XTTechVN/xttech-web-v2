'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components';
import { TableSearch, TableFilters } from '@/components/table';
import { COMBO_APPLY_FOR_OPTIONS, COMBO_DOOR_TYPE_OPTIONS } from '@/types';

interface ComboToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedApplyFor: string;
  onApplyForChange: (val: string) => void;
  selectedDoorType: string;
  onDoorTypeChange: (val: string) => void;
  onAddClick: () => void;
  total?: number;
}

export function ComboToolbar({
  search,
  onSearchChange,
  selectedApplyFor,
  onApplyForChange,
  selectedDoorType,
  onDoorTypeChange,
  onAddClick,
}: ComboToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <TableSearch
          placeholder="Tìm kiếm mã hoặc tên combo..."
          value={search}
          onChange={onSearchChange}
          className="w-72"
        />

        <TableFilters
          filters={[
            {
              label: 'Dành cho',
              value: selectedApplyFor || undefined,
              options: COMBO_APPLY_FOR_OPTIONS,
              onChange: (val) => onApplyForChange(val || ''),
            },
            {
              label: 'Loại cửa áp dụng',
              value: selectedDoorType || undefined,
              options: COMBO_DOOR_TYPE_OPTIONS,
              onChange: (val) => onDoorTypeChange(val || ''),
            },
          ]}
        />
      </div>

      <Button variant="primary" size="sm" leftIcon={<Plus size={15} />} onClick={onAddClick}>
        Thêm combo mới
      </Button>
    </div>
  );
}
