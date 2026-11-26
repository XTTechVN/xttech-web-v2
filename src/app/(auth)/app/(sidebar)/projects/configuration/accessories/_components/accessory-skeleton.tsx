'use client';

import React from 'react';
import { ACCESSORY_TABLE_COLUMNS } from '../_constants/accessories.constants';

export function AccessorySkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-3 w-14 text-center" />
              {ACCESSORY_TABLE_COLUMNS.map((col) => (
                <th
                  key={col.field}
                  className={`py-3 px-4 ${col.width} ${
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.label}
                </th>
              ))}
              <th className="py-3 px-4 text-right w-24">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: count }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="py-2.5 px-3 text-center">
                  <div className="w-9 h-9 rounded bg-slate-100 mx-auto" />
                </td>
                <td className="py-2.5 px-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="h-4 bg-slate-100 rounded w-44" />
                    <div className="h-3 bg-slate-100 rounded w-20" />
                  </div>
                </td>
                <td className="py-2.5 px-4">
                  <div className="h-4 bg-slate-100 rounded w-36" />
                </td>
                <td className="py-2.5 px-3 text-center">
                  <div className="h-5 bg-slate-100 rounded w-10 mx-auto" />
                </td>
                <td className="py-2.5 px-4 text-center">
                  <div className="h-4 bg-slate-100 rounded w-16 mx-auto" />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <div className="h-4 bg-slate-100 rounded w-20 ml-auto" />
                </td>
                <td className="py-2.5 px-4 text-center">
                  <div className="h-5 bg-slate-100 rounded w-18 mx-auto" />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <div className="h-5 bg-slate-100 rounded w-12 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
