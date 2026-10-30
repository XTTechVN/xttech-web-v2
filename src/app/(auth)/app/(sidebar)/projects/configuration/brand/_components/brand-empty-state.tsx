'use client';

import React from 'react';
import { Building2 } from 'lucide-react';

export function BrandEmptyState() {
  return (
    <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
        <Building2 size={24} />
      </div>
      <p className="text-sm font-semibold text-slate-700">Không tìm thấy thương hiệu nào</p>
      <p className="text-xs text-slate-400">Hãy thử tìm kiếm với từ khóa khác hoặc thêm mới thương hiệu.</p>
    </div>
  );
}
