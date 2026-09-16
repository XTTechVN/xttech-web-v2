'use client';

import React from 'react';
import type { Customer } from '@/types';

interface CustomerInfoProps {
  customer: Customer | null;
}

export function CustomerInfo({ customer }: CustomerInfoProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold text-slate-500">Khách hàng</h2>
      <div className="bg-white rounded-lg border border-slate-200/60 p-5 shadow-xs space-y-4">
        {customer ? (
          <>
            <div>
              <h3 className="font-bold text-primary text-sm leading-tight">{customer.name}</h3>
            </div>
            <div className="divide-y divide-slate-100 text-sm pt-1">
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
