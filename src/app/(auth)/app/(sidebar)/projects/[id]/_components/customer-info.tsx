'use client';

import React from 'react';
import type { Customer } from '@/types';

interface CustomerInfoProps {
  customer: Customer | null;
}

export function CustomerInfo({ customer }: CustomerInfoProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200/70 p-3.5 shadow-2xs">
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100">
        <h2 className="text-xs font-semibold text-slate-700">Khách hàng</h2>
        {customer?.name && (
          <span className="font-semibold text-primary text-xs truncate max-w-[170px]" title={customer.name}>
            {customer.name}
          </span>
        )}
      </div>

      {customer ? (
        <div className="divide-y divide-slate-100 text-xs">
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-500 shrink-0">Số điện thoại</span>
            <span className="font-medium text-slate-800">{customer.phone || '—'}</span>
          </div>
          <div className="flex items-start justify-between gap-2 py-2">
            <span className="text-slate-500 shrink-0">Email</span>
            <span className="font-medium text-slate-800 text-right break-all">{customer.email || '—'}</span>
          </div>
          <div className="flex items-start justify-between gap-2 py-2">
            <span className="text-slate-500 shrink-0">Địa chỉ</span>
            <span className="font-medium text-slate-700 text-right">{customer.address || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-2 last:pb-0">
            <span className="text-slate-500 shrink-0">MST / CCCD</span>
            <span className="font-medium text-slate-800">{customer.identifyCode || '—'}</span>
          </div>
        </div>
      ) : (
        <p className="text-slate-400 text-xs py-3 text-center">Không có thông tin khách hàng</p>
      )}
    </div>
  );
}
