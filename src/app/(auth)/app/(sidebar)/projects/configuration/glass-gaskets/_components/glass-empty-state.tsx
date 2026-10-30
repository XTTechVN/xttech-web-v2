'use client';

import React from 'react';
import { ShieldCheck, Wrench } from 'lucide-react';

interface GlassEmptyStateProps {
  categoryName?: string | null;
  isGasket?: boolean;
}

export function GlassEmptyState({ categoryName, isGasket }: GlassEmptyStateProps) {
  if (isGasket) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-lg p-12 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
          <Wrench size={24} />
        </div>
        <p className="text-sm font-semibold text-slate-700">
          Chưa có vật tư gioăng ron / keo nào
        </p>
        <p className="text-xs text-slate-400">
          Hãy nhấn &quot;Thêm gioăng ron / keo&quot; để thiết lập danh mục vật tư phụ trợ.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-dashed border-slate-300 rounded-lg p-12 text-center flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
        <ShieldCheck size={24} />
      </div>
      <p className="text-sm font-semibold text-slate-700">
        {categoryName
          ? `Nhóm "${categoryName}" chưa có quy cách vật tư nào`
          : 'Không tìm thấy quy cách tấm kính nào'}
      </p>
      <p className="text-xs text-slate-400">
        Hãy thử tìm kiếm với từ khóa khác hoặc nhấn &quot;Thêm quy cách tấm&quot;.
      </p>
    </div>
  );
}
