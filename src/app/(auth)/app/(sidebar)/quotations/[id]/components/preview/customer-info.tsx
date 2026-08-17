import React from 'react';
import type { Customer } from '@/types';

interface CustomerInfoProps {
  customer?: Customer | null;
}

export const CustomerInfo = ({ customer }: CustomerInfoProps) => {
  return (
    <div className="flex flex-col gap-1.5 text-gray-900 mb-4 text-xs font-semibold uppercase">
      <div className="grid grid-cols-[100px_1fr_100px_1fr]">
        <span>KHÁCH HÀNG:</span>
        <span className="font-bold">{customer?.name || '—'}</span>
        <span>ĐIỆN THOẠI:</span>
        <span>{customer?.phone || '—'}</span>
      </div>
      <div className="grid grid-cols-[100px_1fr]">
        <span>ĐỊA CHỈ:</span>
        <span>{customer?.address || '—'}</span>
      </div>
      <div className="grid grid-cols-[100px_1fr]">
        <span>HIỆU LỰC:</span>
        <span className="normal-case font-normal text-gray-600">Báo giá có hiệu lực đến 30 ngày kể từ ngày tạo</span>
      </div>
    </div>
  );
};
