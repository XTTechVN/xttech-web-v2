'use client';

import React from 'react';
import { Layers } from 'lucide-react';

export function SeriesEmptyState({ selectedBrandName }: { selectedBrandName?: string | null }) {
  return (
    <div className="bg-white border border-dashed border-slate-300 rounded-lg p-12 text-center flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
        <Layers size={24} />
      </div>
      <p className="text-sm font-semibold text-slate-700">
        {selectedBrandName
          ? `Hãng "${selectedBrandName}" chưa có hệ nhôm nào`
          : 'Không tìm thấy hệ nhôm phù hợp'}
      </p>
      <p className="text-xs text-slate-400">
        Hãy thử tìm kiếm với từ khóa khác hoặc nhấn &quot;Thêm hệ nhôm mới&quot;.
      </p>
    </div>
  );
}
