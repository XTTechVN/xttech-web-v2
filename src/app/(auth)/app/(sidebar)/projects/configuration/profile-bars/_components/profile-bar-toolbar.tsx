'use client';

import React from 'react';
import { Button } from '@/components';
import { TableSearch } from '@/components/table';
import { Plus } from 'lucide-react';
import type { DoorSeries } from '@/types';

interface ProfileBarToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onAddClick: () => void;
  seriesList?: DoorSeries[];
  selectedSeriesId?: number | null;
  onSeriesChange?: (seriesId: number | null) => void;
}

export function ProfileBarToolbar({
  search,
  onSearchChange,
  onAddClick,
  seriesList = [],
  selectedSeriesId,
  onSeriesChange,
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
          <select
            value={selectedSeriesId ?? ''}
            onChange={(e) => onSeriesChange?.(e.target.value ? Number(e.target.value) : null)}
            className="h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:border-primary transition min-w-[180px]"
          >
            <option value="">Tất cả hệ nhôm</option>
            {seriesList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        )}
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
