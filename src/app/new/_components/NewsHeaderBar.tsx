'use client';

import React from 'react';
import { PanelsTopLeft, Search } from 'lucide-react';
import { Input } from '@/components/input';

interface NewsHeaderBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const NewsHeaderBar: React.FC<NewsHeaderBarProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 pb-4">
      {/* Brand / Tiêu đề chuyên trang */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
          <PanelsTopLeft size={18} />
        </div>
        <h1 className="text-lg sm:text-xl font-bold  tracking-tight text-primary">
          Nhôm Kính Xuân Tiệp
        </h1>
      </div>

      {/* Search Input & Dark/Light Toggle */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-80">
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm bài viết, ví dụ: kính cường lực"
            fullWidth
          />
          <Search
            size={16}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        <button
          type="button"
          aria-label="Chuyển chế độ giao diện"
          className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors shrink-0 shadow-2xs cursor-pointer"
        >
          <div className="w-4 h-4 rounded-full border border-slate-500 overflow-hidden flex">
            <span className="w-1/2 h-full bg-slate-700" />
            <span className="w-1/2 h-full bg-white" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default NewsHeaderBar;

