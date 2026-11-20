'use client';

import React from 'react';
import { Scale } from 'lucide-react';
import { Button } from '@/components';

interface OpeningBalanceBannerProps {
  onOpenOpeningBalance: () => void;
}

export function OpeningBalanceBanner({
  onOpenOpeningBalance,
}: OpeningBalanceBannerProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
          <Scale size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Thiết lập Số dư Đầu kỳ (Sổ Tài chính Hợp nhất)
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Nhập số dư Nợ/Có ban đầu cho Hệ thống Tài khoản, Quỹ tiền mặt TK 1111, Tài khoản ngân hàng và Công nợ đầu kỳ (131/331) trên 1 Sổ Tài chính duy nhất.
          </p>
        </div>
      </div>
      <div className="flex items-center shrink-0">
        <Button variant="primary" size="sm" onClick={onOpenOpeningBalance} leftIcon={<Scale size={14} />}>
          Thiết lập Số dư đầu kỳ
        </Button>
      </div>
    </div>
  );
}
