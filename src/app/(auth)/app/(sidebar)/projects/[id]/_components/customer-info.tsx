'use client';

import React from 'react';
import type { Customer } from '@/types';

interface CustomerInfoProps {
  customer: Customer | null;
}

export function CustomerInfo({ customer }: CustomerInfoProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Khách hàng</h2>
      <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-xs space-y-4">
        {customer ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-250 text-slate-750 flex items-center justify-center font-bold text-sm shrink-0">
                {customer.name?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-slate-800 text-sm leading-tight">{customer.name}</h3>
                <span className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Khách hàng liên kết</span>
              </div>
            </div>
            <div className="divide-y divide-slate-100 text-sm pt-2">
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500">Số điện thoại</span>
                <span className="font-semibold text-slate-800">{customer.phone || '—'}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500">Email</span>
                <span className="font-semibold text-slate-800 break-all text-right max-w-[160px]">{customer.email || '—'}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500">Địa chỉ</span>
                <span className="text-slate-700 text-right max-w-[160px] font-medium">{customer.address || '—'}</span>
              </div>
              <div className="flex justify-between py-2.5 last:pb-0">
                <span className="text-slate-500">MST / CCCD</span>
                <span className="font-semibold text-slate-800">{customer.identifyCode || '—'}</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-slate-400 text-xs py-2 text-center">Không có thông tin khách hàng</p>
        )}
      </div>
    </div>
  );
}
