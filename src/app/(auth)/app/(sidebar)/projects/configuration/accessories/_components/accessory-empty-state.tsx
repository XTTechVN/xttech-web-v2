'use client';

import React from 'react';
import { Package } from 'lucide-react';

export function AccessoryEmptyState({ selectedBrandName }: { selectedBrandName?: string | null }) {
  return (
    <div className="bg-white border border-dashed border-slate-300 rounded-lg p-12 text-center flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
        <Package size={24} />
      </div>
      <p className="text-sm font-semibold text-slate-700">
        {selectedBrandName
          ? `Hãng "${selectedBrandName}" chưa có phụ kiện nào`
          : 'Không tìm thấy phụ kiện phù hợp'}
      </p>
      <p className="text-xs text-slate-400">
        Hãy thử tìm kiếm với từ khóa khác hoặc nhấn &quot;Thêm phụ kiện mới&quot;.
      </p>
    </div>
  );
}
