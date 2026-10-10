'use client';

import React from 'react';
import type { Quotation } from '@/types';

interface ProjectSummaryProps {
  quotations: Quotation[];
  formattedDate: string;
}

export function ProjectSummary({ quotations, formattedDate }: ProjectSummaryProps) {
  const maxDiscount = quotations.length > 0 
    ? Math.max(...quotations.map(q => q.discountPercentage)) 
    : 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200/70 p-3.5 shadow-2xs">
      <h2 className="text-xs font-semibold text-slate-700 pb-2 mb-1 border-b border-slate-100">
        Tóm tắt thông tin
      </h2>
      <div className="divide-y divide-slate-100 text-xs">
        <div className="flex items-center justify-between py-2">
          <span className="text-slate-500">Trạng thái chung</span>
          <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-100">
            Đang hoạt động
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-slate-500">Tổng số báo giá</span>
          <span className="font-semibold text-slate-800">{quotations.length}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-slate-500">Ngày bắt đầu</span>
          <span className="font-medium text-slate-700">
            {formattedDate.split(' ')[1] || formattedDate}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 last:pb-0">
          <span className="text-slate-500">Chiết khấu cao nhất</span>
          <span className="font-bold text-primary">{maxDiscount}%</span>
        </div>
      </div>
    </div>
  );
}
