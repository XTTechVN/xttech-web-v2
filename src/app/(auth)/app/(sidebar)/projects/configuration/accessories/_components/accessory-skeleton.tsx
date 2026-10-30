'use client';

import React from 'react';

export function AccessorySkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-36">Mã phụ kiện</th>
              <th className="py-3 px-4 min-w-[200px]">Mô tả / Tên phụ kiện</th>
              <th className="py-3 px-4 text-center w-36">Phân loại</th>
              <th className="py-3 px-4 text-center w-32">Quy cách</th>
              <th className="py-3 px-4 text-center w-24">ĐVT</th>
              <th className="py-3 px-4 text-center w-28">Màu sắc</th>
              <th className="py-3 px-4 text-right w-32">Đơn giá</th>
              <th className="py-3 px-4 text-center w-28">Trạng thái</th>
              <th className="py-3 px-4 text-right w-24">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: count }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="h-4 bg-slate-100 rounded w-48" />
                    <div className="h-3 bg-slate-100 rounded w-28" />
                  </div>
                </td>
                <td className="py-4 px-4 text-center"><div className="h-5 bg-slate-100 rounded w-20 mx-auto" /></td>
                <td className="py-4 px-4 text-center"><div className="h-4 bg-slate-100 rounded w-16 mx-auto" /></td>
                <td className="py-4 px-4 text-center"><div className="h-5 bg-slate-100 rounded w-12 mx-auto" /></td>
                <td className="py-4 px-4 text-center"><div className="h-4 bg-slate-100 rounded w-14 mx-auto" /></td>
                <td className="py-4 px-4 text-right"><div className="h-4 bg-slate-100 rounded w-20 ml-auto" /></td>
                <td className="py-4 px-4 text-center"><div className="h-5 bg-slate-100 rounded w-16 mx-auto" /></td>
                <td className="py-4 px-4 text-right"><div className="h-5 bg-slate-100 rounded w-12 ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
