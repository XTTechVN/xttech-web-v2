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
    <div className="space-y-3">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tóm tắt thông tin</h2>
      <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-xs divide-y divide-slate-100 text-sm">
        <div className="flex justify-between py-2.5 first:pt-0">
          <span className="text-slate-500">Trạng thái chung</span>
          <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs">Đang hoạt động</span>
        </div>
        <div className="flex justify-between py-2.5">
          <span className="text-slate-500">Tổng số báo giá</span>
          <span className="font-bold text-slate-800">{quotations.length}</span>
        </div>
        <div className="flex justify-between py-2.5">
          <span className="text-slate-500">Ngày bắt đầu</span>
          <span className="font-semibold text-slate-700">
            {formattedDate.split(' ')[1] || formattedDate}
          </span>
        </div>
        <div className="flex justify-between py-2.5 last:pb-0">
          <span className="text-slate-500">Chiết khấu cao nhất</span>
          <span className="font-bold text-primary">{maxDiscount}%</span>
        </div>
      </div>
    </div>
  );
}
