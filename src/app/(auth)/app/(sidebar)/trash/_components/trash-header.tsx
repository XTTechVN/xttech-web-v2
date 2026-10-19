'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

interface TrashHeaderProps {
  folderCount?: number;
  docCount?: number;
  isLoading?: boolean;
}

export const TrashHeader: React.FC<TrashHeaderProps> = ({
  folderCount = 0,
  docCount = 0,
  isLoading = false,
}) => {
  return (
    <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
          <Trash2 size={16} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm md:text-base font-bold text-slate-800 tracking-tight leading-tight">
            Thùng rác
          </h2>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">
            {!isLoading && `${folderCount} thư mục • ${docCount} tài liệu`}
          </p>
        </div>
      </div>
    </div>
  );
};
