'use client';

import React from 'react';
import type { Customer } from '@/types';
import { UserCheck, Phone, Mail, MapPin, CreditCard } from 'lucide-react';

interface CustomerInfoProps {
  customer: Customer | null;
}

export function CustomerInfo({ customer }: CustomerInfoProps) {
  const getInitials = (name?: string) => {
    if (!name) return 'KH';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-primary flex items-center justify-center shrink-0">
            <UserCheck size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-lexend">Khách hàng</h2>
            <p className="text-[11px] text-slate-400">Chủ đầu tư / Đối tác dự án</p>
          </div>
        </div>
      </div>

      {customer ? (
        <div className="space-y-3.5">
          {/* Profile header với Avatar */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-50 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200/60">
              {getInitials(customer.name)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate" title={customer.name || ''}>
                {customer.name || 'Chưa đặt tên'}
              </div>
              <div className="text-[11px] text-slate-500">
                {customer.type || 'Khách hàng cá nhân'}
              </div>
            </div>
          </div>

          {/* Danh sách thông tin liên hệ gọn gàng */}
          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            {/* Điện thoại */}
            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone size={14} className="text-slate-400 shrink-0" />
              <div className="min-w-0">
                {customer.phone ? (
                  <a
                    href={`tel:${customer.phone}`}
                    className="font-medium text-slate-800 hover:text-primary transition-colors"
                  >
                    {customer.phone}
                  </a>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2.5 text-slate-600">
              <Mail size={14} className="text-slate-400 shrink-0" />
              <div className="min-w-0 truncate">
                {customer.email ? (
                  <a
                    href={`mailto:${customer.email}`}
                    className="font-medium text-slate-800 hover:text-primary transition-colors truncate block"
                    title={customer.email}
                  >
                    {customer.email}
                  </a>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="flex items-start gap-2.5 text-slate-600">
              <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-medium text-slate-700 leading-snug block">
                  {customer.address || '—'}
                </span>
              </div>
            </div>

            {/* Mã định danh / MST */}
            {customer.identifyCode && (
              <div className="flex items-center gap-2.5 text-slate-600">
                <CreditCard size={14} className="text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <span className="font-mono text-slate-700 text-xs">
                    {customer.identifyCode}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-slate-400 text-xs py-4 text-center">Chưa liên kết thông tin khách hàng</p>
      )}
    </div>
  );
}
