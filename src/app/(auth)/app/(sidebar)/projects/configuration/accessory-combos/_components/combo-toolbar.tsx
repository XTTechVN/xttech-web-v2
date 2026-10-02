'use client';

import React from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components';

interface ComboToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onAddClick: () => void;
  total?: number;
}

export function ComboToolbar({ search, onSearchChange, onAddClick, total }: ComboToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm mã hoặc tên combo..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-3 h-9 w-72 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary transition"
          />
        </div>

      </div>

      <Button variant="primary" size="sm" leftIcon={<Plus size={15} />} onClick={onAddClick}>
        Thêm combo mới
      </Button>
    </div>
  );
}
